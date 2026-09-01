// Runs on a daily schedule (see supabase/migrations for the pg_cron job that
// invokes this). Finds every `users` row that has been sitting in
// pending_deletion for more than RETENTION_DAYS and permanently removes that
// member: their pet documents (storage + rows), pets, calendar events, users
// row, and finally their Supabase Auth account. See the "ACCOUNT DELETION"
// comment block in src/App.tsx for the full lifecycle this is the tail end of.
import { createClient } from "npm:@supabase/supabase-js@2";

const PET_DOCUMENTS_BUCKET = "pet-documents";
const RETENTION_DAYS = 30;

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!serviceRoleKey || !supabaseUrl) {
    return new Response("Server is not configured", { status: 500 });
  }

  // verify_jwt (on by default) only proves the caller has SOME validly
  // signed project JWT — any logged-in member would pass that check. This
  // job deletes accounts, so it must only run for the service-role caller
  // (the scheduled pg_cron job), never for an ordinary user session.
  const authHeader = req.headers.get("Authorization") || "";
  const callerToken = authHeader.replace(/^Bearer\s+/i, "");
  if (callerToken !== serviceRoleKey) {
    return new Response("Forbidden", { status: 403 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: dueUsers, error: fetchError } = await supabase
    .from("users")
    .select("id, email")
    .eq("status", "pending_deletion")
    .lt("deletion_requested_at", cutoff);

  if (fetchError) {
    console.error("[purge-deleted-accounts] failed to load pending_deletion users:", fetchError);
    return new Response(JSON.stringify({ error: fetchError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const results = [];
  for (const user of dueUsers ?? []) {
    try {
      await purgeUser(supabase, user.id);
      results.push({ id: user.id, ok: true });
    } catch (err) {
      console.error(`[purge-deleted-accounts] failed to purge user ${user.id}:`, err);
      results.push({ id: user.id, ok: false, error: String(err) });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { "Content-Type": "application/json" },
  });
});

async function purgeUser(supabase, userId: string) {
  const { data: pets, error: petsError } = await supabase
    .from("pets")
    .select("id")
    .eq("owner_id", userId);
  if (petsError) throw petsError;
  const petIds = (pets ?? []).map((p) => p.id);

  // Storage docs live under `${petId}/...` in the pet-documents bucket.
  for (const petId of petIds) {
    const { data: files, error: listError } = await supabase.storage.from(PET_DOCUMENTS_BUCKET).list(petId);
    if (listError) throw listError;
    if (files?.length) {
      const { error: removeError } = await supabase.storage
        .from(PET_DOCUMENTS_BUCKET)
        .remove(files.map((f) => `${petId}/${f.name}`));
      if (removeError) throw removeError;
    }
  }

  if (petIds.length) {
    for (const table of ["pet_documents", "program_enrollment", "streaks", "lesson_progress"]) {
      const { error } = await supabase.from(table).delete().in("pet_id", petIds);
      if (error) throw error;
    }
  }

  const { error: calendarError } = await supabase.from("calendar_events").delete().eq("owner_id", userId);
  if (calendarError) throw calendarError;

  if (petIds.length) {
    const { error: petsDeleteError } = await supabase.from("pets").delete().eq("owner_id", userId);
    if (petsDeleteError) throw petsDeleteError;
  }

  const { error: userDeleteError } = await supabase.from("users").delete().eq("id", userId);
  if (userDeleteError) throw userDeleteError;

  const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
  if (authDeleteError) throw authDeleteError;
}
