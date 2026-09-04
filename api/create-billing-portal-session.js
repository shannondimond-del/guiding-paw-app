// POST /api/create-billing-portal-session
// Headers: Authorization: Bearer <supabase access_token>
//
// Returns a Stripe-hosted Billing Portal session URL — card updates,
// cancellation, and reactivation all happen there instead of custom UI.
// Requires the Customer Portal to be enabled once in the Stripe Dashboard
// (Settings -> Billing -> Customer portal).

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

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

    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      res.status(401).json({ error: "Invalid or expired session." });
      return;
    }

    const { data: userRow, error: userRowError } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();
    if (userRowError || !userRow?.stripe_customer_id) {
      res.status(400).json({ error: "No billing account found for this user yet." });
      return;
    }

    const stripe = new Stripe(stripeSecretKey);
    const origin = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userRow.stripe_customer_id,
      return_url: `${origin}/`,
    });

    res.status(200).json({ url: portalSession.url });
  } catch (err) {
    console.error("create-billing-portal-session error:", err);
    res.status(500).json({ error: "Something went wrong opening billing management." });
  }
}
