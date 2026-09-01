-- Schedules the purge-deleted-accounts Edge Function to run once a day.
-- That function finds every `users` row with status = 'pending_deletion'
-- and deletion_requested_at older than 30 days, and permanently deletes
-- the member's data and their Supabase Auth account. See
-- supabase/functions/purge-deleted-accounts/index.ts and the "ACCOUNT
-- DELETION" comment block in src/App.tsx for the full lifecycle.
--
-- ── One-time manual setup before this migration will actually fire ──
-- This same migration file is applied to every environment (test, prod, ...),
-- so it must not hardcode a project URL or key. Instead both the function
-- URL and the service role key live in Vault, per-project — run this once in
-- each environment's SQL editor (or via `supabase secrets`), replacing the
-- placeholders with that project's own values from Project Settings > API:
--
--   select vault.create_secret('<service-role-key>', 'service_role_key');
--   select vault.create_secret(
--     'https://<project-ref>.supabase.co/functions/v1/purge-deleted-accounts',
--     'purge_deleted_accounts_url'
--   );
--
-- To rotate either one later:
--
--   select vault.update_secret(
--     (select id from vault.decrypted_secrets where name = 'service_role_key'),
--     '<new-service-role-key>'
--   );

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select
  cron.schedule(
    'purge-deleted-accounts-daily',
    '0 3 * * *', -- 03:00 UTC daily
    $$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'purge_deleted_accounts_url'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (
          select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key'
        )
      ),
      body := '{}'::jsonb
    ) as request_id;
    $$
  );
