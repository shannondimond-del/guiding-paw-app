// POST /api/create-contact
// Body: { email, firstName, lastName, phone, countryCode }
//
// Creates or updates a contact in GoHighLevel by posting to the GHL Inbound
// Webhook. Called from the client after a successful Supabase registration.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { email, firstName, lastName, phone, countryCode } = req.body || {};
    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "A valid email is required" });
      return;
    }

    const webhookUrl = process.env.GHL_WEBHOOK_URL;
    if (!webhookUrl) {
      res.status(500).json({ error: "Server is not configured (missing webhook URL)" });
      return;
    }

    const ghlResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        first_name: firstName || "",
        last_name: lastName || "",
        phone: phone || "",
        country_code: countryCode || "",
      }),
    });

    if (!ghlResponse.ok) {
      res.status(502).json({ error: "Failed to create contact in GoHighLevel" });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("create-contact error:", err);
    res.status(500).json({ error: "Something went wrong creating the contact" });
  }
}
