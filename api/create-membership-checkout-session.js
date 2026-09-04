// POST /api/create-membership-checkout-session
// Headers: Authorization: Bearer <supabase access_token>
//
// Creates a Stripe Checkout Session (mode: "subscription") for the $9.99/mo
// Ongoing Membership and returns its URL. No body needed — unlike a program
// purchase, membership isn't tied to new pet data (the pet/program already
// exists by the time someone reaches this). Activation itself
// (stripe_subscription_id, plan, subscription_status) happens in
// api/stripe-webhook.js once checkout actually completes, not here.

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { getOrCreateStripeCustomer } from "./_lib/stripeCustomer.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID_MEMBERSHIP;
  if (!supabaseUrl || !serviceRoleKey || !stripeSecretKey || !priceId) {
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
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id },
      success_url: `${origin}/checkout-complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("create-membership-checkout-session error:", err);
    res.status(500).json({ error: "Something went wrong starting checkout." });
  }
}
