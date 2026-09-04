// POST /api/create-program-checkout-session
// Headers: Authorization: Bearer <supabase access_token>
// Body: { program: "puppy"|"standard", pet: {name,breed,birthday,gender,weight},
//         onboarding: {role, trainingGoals, preferredTrainingTime} }
//
// Creates a Stripe Checkout Session (mode: "payment") for a one-time program
// purchase and returns its URL for the client to redirect to. The actual
// account writes (pets/program_enrollment/streaks rows) happen later, in
// api/stripe-webhook.js once payment completes — this endpoint only ever
// creates the session, it never touches those tables. Pet/onboarding data
// travels as Checkout Session metadata because the webhook has no access to
// this browser's React state once the redirect happens.

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { getOrCreateStripeCustomer } from "./_lib/stripeCustomer.js";

const PRICE_IDS = {
  puppy: process.env.STRIPE_PRICE_ID_PUPPY,
  standard: process.env.STRIPE_PRICE_ID_STANDARD,
};

const joinList = (v) => (Array.isArray(v) ? v.join("|") : (v || ""));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!supabaseUrl || !serviceRoleKey || !stripeSecretKey) {
    res.status(500).json({ error: "Server is not configured." });
    return;
  }

  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      res.status(401).json({ error: "Missing Authorization token." });
      return;
    }

    const { program, pet, onboarding, account } = req.body || {};
    const priceId = PRICE_IDS[program];
    if (!priceId) {
      res.status(400).json({ error: "Unknown program." });
      return;
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      res.status(401).json({ error: "Invalid or expired session." });
      return;
    }

    const stripe = new Stripe(stripeSecretKey);
    const customerId = await getOrCreateStripeCustomer(supabase, stripe, user);
    const origin = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      metadata: {
        supabase_user_id: user.id,
        program,
        email: user.email || "",
        first_name: account?.firstName || "",
        last_name: account?.lastName || "",
        phone: account?.phone || "",
        country_code: account?.countryCode || "US",
        pet_name: pet?.name || "",
        pet_breed: pet?.breed || "",
        pet_birthday: pet?.birthday || "",
        pet_gender: pet?.gender || "",
        pet_weight: pet?.weight != null ? String(pet.weight) : "",
        role: onboarding?.role || "",
        training_goals: joinList(onboarding?.trainingGoals),
        preferred_training_time: joinList(onboarding?.preferredTrainingTime),
      },
      success_url: `${origin}/checkout-complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("create-program-checkout-session error:", err);
    res.status(500).json({ error: "Something went wrong starting checkout." });
  }
}
