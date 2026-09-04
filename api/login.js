// POST /api/login
// Body: { email: string, password: string }
//
// Proxies sign-in through the server so failed-attempt tracking and the
// resulting lockout live in Postgres (login_attempts / login_ip_attempts,
// see supabase/migrations) instead of client-side React state, which reset
// on every page refresh and could be edited locally. On success, returns a
// session for the client to adopt with supabase.auth.setSession.
//
// Two independent caps apply:
//  - per account (email): MAX_ATTEMPTS failures locks that account for
//    LOCKOUT_MINUTES — the policy the login screen's UI reflects.
//  - per source IP: IP_MAX_ATTEMPTS failures locks that IP for
//    IP_LOCKOUT_MINUTES, so spraying many different emails from one IP still
//    gets shut down even though no single account ever hits its own cap.
//
// Always responds 200 for expected outcomes (success, wrong password,
// locked) — non-200 is reserved for actual server failures.

import { createClient } from "@supabase/supabase-js";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const IP_MAX_ATTEMPTS = 20;
const IP_LOCKOUT_MINUTES = 15;

const LOCK_MESSAGE = "Too many failed attempts. Please try again later.";

function isLocked(row, now) {
  return !!(row?.locked_until && new Date(row.locked_until).getTime() > now);
}

// Increments the failure counter for one row (an email or an IP) and locks
// it once it crosses maxAttempts. A lock that already expired restarts the
// count at 1 rather than piling onto the stale count that triggered it.
async function recordFailure(supabase, table, keyColumn, keyValue, existing, maxAttempts, lockoutMinutes, now) {
  const priorCount = existing?.locked_until ? 0 : (existing?.failed_count || 0);
  const newCount = priorCount + 1;
  const nowLocked = newCount >= maxAttempts;
  const lockedUntil = nowLocked ? new Date(now + lockoutMinutes * 60 * 1000).toISOString() : null;

  const { error } = await supabase.from(table).upsert({
    [keyColumn]: keyValue,
    failed_count: nowLocked ? 0 : newCount,
    locked_until: lockedUntil,
    updated_at: new Date().toISOString(),
  }, { onConflict: keyColumn });
  if (error) console.error(`[login] failed to record failure in ${table}:`, error);

  return { newCount, nowLocked, lockedUntil };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    res.status(500).json({ ok: false, message: "Server is not configured." });
    return;
  }

  try {
    const { email: rawEmail, password } = req.body || {};
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    if (!email || typeof password !== "string" || !password) {
      res.status(400).json({ ok: false, message: "Email and password are required." });
      return;
    }

    const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || null;
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const [{ data: existingEmail, error: emailFetchError }, ipFetchResult] = await Promise.all([
      supabase.from("login_attempts").select("failed_count, locked_until").eq("email", email).maybeSingle(),
      ip
        ? supabase.from("login_ip_attempts").select("failed_count, locked_until").eq("ip", ip).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);
    const { data: existingIp, error: ipFetchError } = ipFetchResult;
    if (emailFetchError || ipFetchError) {
      console.error("[login] failed to read attempt tables:", emailFetchError || ipFetchError);
      res.status(500).json({ ok: false, message: "Something went wrong. Please try again." });
      return;
    }

    const now = Date.now();
    const emailLockedNow = isLocked(existingEmail, now);
    const ipLockedNow = ip && isLocked(existingIp, now);
    if (emailLockedNow || ipLockedNow) {
      const candidates = [emailLockedNow ? existingEmail.locked_until : null, ipLockedNow ? existingIp.locked_until : null].filter(Boolean);
      const lockedUntil = candidates.sort().pop();
      res.status(200).json({ ok: false, locked: true, lockedUntil, message: LOCK_MESSAGE });
      return;
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (!signInError && signInData?.session) {
      // Success — clear the account's accumulated failures. The IP counter
      // is left alone: one valid login shouldn't reset tracking for an IP
      // that may still be spraying other accounts.
      await supabase.from("login_attempts").upsert({
        email, failed_count: 0, locked_until: null, last_ip: ip, updated_at: new Date().toISOString(),
      }, { onConflict: "email" });
      res.status(200).json({
        ok: true,
        session: {
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
        },
      });
      return;
    }

    const emailResult = await recordFailure(supabase, "login_attempts", "email", email, existingEmail, MAX_ATTEMPTS, LOCKOUT_MINUTES, now);
    const ipResult = ip
      ? await recordFailure(supabase, "login_ip_attempts", "ip", ip, existingIp, IP_MAX_ATTEMPTS, IP_LOCKOUT_MINUTES, now)
      : null;
    // last_ip is informational only; doesn't affect the email row's lock state.
    await supabase.from("login_attempts").update({ last_ip: ip }).eq("email", email);

    const nowLocked = emailResult.nowLocked || !!ipResult?.nowLocked;
    const lockedUntil = [emailResult.lockedUntil, ipResult?.lockedUntil].filter(Boolean).sort().pop() || null;

    res.status(200).json({
      ok: false,
      locked: nowLocked,
      lockedUntil,
      attemptsRemaining: nowLocked ? 0 : MAX_ATTEMPTS - emailResult.newCount,
      message: nowLocked
        ? (emailResult.nowLocked ? `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.` : LOCK_MESSAGE)
        : (signInError?.message || "Incorrect email or password."),
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ ok: false, message: "Something went wrong. Please try again." });
  }
}
