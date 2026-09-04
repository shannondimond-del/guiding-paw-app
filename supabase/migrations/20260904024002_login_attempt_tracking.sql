-- Server-side login attempt tracking, so a lockout can't be cleared by a page
-- refresh or by editing client-side state (the old lockout counter lived
-- entirely in React state). Only the service_role key can read or write this
-- table — see api/login.js, the only thing that touches it.
create table if not exists public.login_attempts (
  email text primary key,
  failed_count integer not null default 0,
  locked_until timestamptz,
  last_ip text,
  updated_at timestamptz not null default now()
);

alter table public.login_attempts enable row level security;
-- Intentionally no policies: RLS default-denies anon/authenticated entirely.
-- api/login.js talks to this table with the service_role key, which
-- bypasses RLS, so it doesn't need any policy here.
