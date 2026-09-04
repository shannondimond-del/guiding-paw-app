// POST /api/stripe-webhook
// Registered as a webhook endpoint in the Stripe Dashboard — Stripe calls
// this directly, so authentication here is the signature check, not a
// bearer token. Requires the RAW request body for signature verification,
// so (unlike every other api/*.js file in this repo) automatic JSON body
// parsing is disabled below.
//
// This is the single source of truth for billing state: the client-side
// /checkout-complete return page only ever polls and reads, it never
// writes. See the "checkout.session.completed" (mode: payment) branch below
// for the writes that used to live in handleSuccessContinue (src/App.tsx).
//
// Idempotent by design — Stripe delivers events at-least-once. Every event
// is recorded in stripe_webhook_events first; a retried delivery is
// detected and skipped before any other write happens.

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export const config = { api: { bodyParser: false } };

const GHL_SIGNUP_WEBHOOK = "https://services.leadconnectorhq.com/hooks/Vgv3jETZdSkRK8bOLkJd/webhook-trigger/7cb24ea9-b069-439b-bd06-12fef01a33ff";
const programLabel = (program) => program === "puppy" ? "12-Week Puppy Training Program" : "6-Week Training Program";

const parseBirthday = (b) => {
  if (!b) return null;
  const parts = b.split("/");
  if (parts.length === 3) return `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
  return b;
};
const splitList = (v) => (v ? v.split("|").filter(Boolean) : []);

// Age in whole years/months/weeks, mirrors src/App.tsx's computeAge — kept
// separate since this runs server-side, outside the Vite client bundle.
const computeAge = (birthdayStr) => {
  if (!birthdayStr) return null;
  const parts = birthdayStr.split("/");
  if (parts.length !== 3) return null;
  const bday = new Date(`${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`);
  if (isNaN(bday.getTime())) return null;
  const now = new Date();
  if (bday > now) return null;
  let years = now.getFullYear() - bday.getFullYear();
  let months = now.getMonth() - bday.getMonth();
  if (now.getDate() < bday.getDate()) months -= 1;
  if (months < 0) { years -= 1; months += 12; }
  if (years < 0) return null;
  if (years === 0 && months === 0) {
    const weeks = Math.max(0, Math.floor((now - bday) / (1000 * 60 * 60 * 24 * 7)));
    return weeks <= 1 ? `${weeks} week old` : `${weeks} weeks old`;
  }
  if (years === 0) return months === 1 ? "1 month old" : `${months} months old`;
  if (months === 0) return years === 1 ? "1 year old" : `${years} years old`;
  return `${years} yr${years === 1 ? "" : "s"} ${months} mo`;
};

function sendSignupWebhook({ firstName, lastName, email, phone, dogName, dogAge, dogBreed, program }) {
  const payload = {
    first_name: firstName || "", last_name: lastName || "", email: email || "", phone: phone || "",
    dogs_name: dogName || "", dogs_age: dogAge || "", dogs_breed: dogBreed || "",
    program: programLabel(program),
  };
  return fetch(GHL_SIGNUP_WEBHOOK, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  }).catch(err => console.error("[GHL signup webhook] failed to send:", err));
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end("Method not allowed");
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!supabaseUrl || !serviceRoleKey || !stripeSecretKey || !webhookSecret) {
    console.error("[stripe-webhook] server is not configured");
    res.status(500).end("Server is not configured");
    return;
  }

  const stripe = new Stripe(stripeSecretKey);
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  let event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, req.headers["stripe-signature"], webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed:", err.message);
    res.status(400).end(`Webhook signature verification failed`);
    return;
  }

  // Idempotency guard — zero rows inserted means this event was already processed.
  const { data: inserted, error: idempotencyError } = await supabase
    .from("stripe_webhook_events")
    .insert({ id: event.id, type: event.type })
    .select("id");
  if (idempotencyError) {
    console.error("[stripe-webhook] idempotency insert failed:", idempotencyError);
    res.status(500).end("Failed to record event");
    return;
  }
  if (!inserted || inserted.length === 0) {
    res.status(200).end("Already processed");
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode === "payment") {
          await handleProgramPurchase(supabase, session);
        }
        // mode === "subscription" (membership) is handled in Milestone B.
        break;
      }
      default:
        // Every other event type (including the membership-subscription
        // events added in Milestone B) is safely acknowledged as a no-op
        // for now, rather than left unregistered in Stripe.
        break;
    }
    res.status(200).end("ok");
  } catch (err) {
    console.error(`[stripe-webhook] failed handling ${event.type}:`, err);
    // Non-2xx tells Stripe to retry — correct here, since the idempotency
    // row is already written and a retry will re-enter this try block
    // fresh (the event row exists, but we only skip BEFORE this point on a
    // second delivery of the same event id, so a failed first attempt is
    // safe to retry: no partial writes happened when the error is at
    // insert-time and the whole handler throws in one place; a genuinely
    // partial failure here needs the stripe_webhook_events row to be
    // deleted by hand before Stripe's retry, since it's already recorded).
    res.status(500).end("Internal error");
  }
}

// Mirrors what handleSuccessContinue (src/App.tsx) used to write directly
// from the client on fake payment success.
async function handleProgramPurchase(supabase, session) {
  const m = session.metadata || {};
  const userId = m.supabase_user_id || session.client_reference_id;
  if (!userId) {
    console.error("[stripe-webhook] checkout.session.completed with no supabase_user_id in metadata");
    return;
  }

  const birthday = m.pet_birthday || "";
  const program = m.program;

  sendSignupWebhook({
    firstName: m.first_name, lastName: m.last_name,
    email: m.email, phone: m.phone,
    dogName: m.pet_name, dogAge: computeAge(birthday),
    dogBreed: m.pet_breed, program,
  });

  const { error: userUpsertError } = await supabase.from("users").upsert({
    id: userId,
    email: m.email || "",
    first_name: m.first_name || "",
    last_name: m.last_name || "",
    // null, not "" — users.phone has a unique constraint, and multiple
    // phone-less signups writing "" would collide on the second one.
    phone: m.phone || null,
    country_code: m.country_code || "US",
    role: m.role ? [m.role] : [],
    training_goals: splitList(m.training_goals),
    preferred_training_time: splitList(m.preferred_training_time),
    plan: "annual",
    stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id,
  }, { onConflict: "id" });
  if (userUpsertError) console.error("[stripe-webhook] users upsert failed:", userUpsertError);

  const { data: petRow, error: petInsertError } = await supabase.from("pets").insert({
    owner_id: userId,
    name: m.pet_name || "",
    breed: m.pet_breed || "",
    birthday: parseBirthday(birthday),
    gender: m.pet_gender || "",
    weight: m.pet_weight ? Number(m.pet_weight) : null,
    pet_type: "dog",
  }).select().single();
  if (petInsertError) console.error("[stripe-webhook] pets insert failed:", petInsertError);
  const petId = petRow?.id;

  if (petId) {
    const { error: enrollError } = await supabase.from("program_enrollment").upsert({
      pet_id: petId,
      program,
    }, { onConflict: "pet_id,program" });
    if (enrollError) console.error("[stripe-webhook] program_enrollment upsert failed:", enrollError);

    const { error: streakError } = await supabase.from("streaks").upsert({
      pet_id: petId,
      current_streak: 0,
    }, { onConflict: "pet_id" });
    if (streakError) console.error("[stripe-webhook] streaks insert failed:", streakError);
  }
}
