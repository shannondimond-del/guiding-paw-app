// POST /api/send-code
// Body: { email: string }
//
// Generates a 6-digit verification code (deterministically, from a secret key
// combined with the email + a 10-minute time window — this means we never need
// a database to remember codes; verify-code.js just recomputes the same value)
// and sends it to the GoHighLevel Inbound Webhook, which emails it to the user.

import crypto from "crypto";

function codeForWindow(email, windowIndex) {
  const secret = process.env.VERIFICATION_SECRET;
  if (!secret) throw new Error("VERIFICATION_SECRET is not set");
  const h = crypto
    .createHmac("sha256", secret)
    .update(`${email.trim().toLowerCase()}:${windowIndex}`)
    .digest("hex");
  const num = parseInt(h.slice(0, 8), 16) % 1000000;
  return String(num).padStart(6, "0");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { email } = req.body || {};
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "A valid email is required" });
      return;
    }

    const webhookUrl = process.env.GHL_WEBHOOK_URL;
    if (!webhookUrl) {
      res.status(500).json({ error: "Server is not configured (missing webhook URL)" });
      return;
    }

    const windowIndex = Math.floor(Date.now() / (10 * 60 * 1000));
    const code = codeForWindow(email, windowIndex);

    const ghlResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), code }),
    });

    if (!ghlResponse.ok) {
      res.status(502).json({ error: "Failed to send verification email" });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("send-code error:", err);
    res.status(500).json({ error: "Something went wrong sending the verification email" });
  }
}
