// POST /api/verify-code
// Body: { email: string, code: string }
//
// Recomputes the same deterministic code send-code.js would have generated (for the
// current and previous 10-minute window, so a code doesn't die the instant a new
// window starts) and checks it against what the user typed in. No database needed.

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
    const { email, code } = req.body || {};
    if (!email || typeof email !== "string" || !code || typeof code !== "string") {
      res.status(400).json({ error: "Email and code are required" });
      return;
    }

    const currentWindow = Math.floor(Date.now() / (10 * 60 * 1000));
    const validCodes = [codeForWindow(email, currentWindow), codeForWindow(email, currentWindow - 1)];

    const isValid = validCodes.includes(code.trim());
    res.status(200).json({ valid: isValid });
  } catch (err) {
    console.error("verify-code error:", err);
    res.status(500).json({ error: "Something went wrong verifying the code" });
  }
}
