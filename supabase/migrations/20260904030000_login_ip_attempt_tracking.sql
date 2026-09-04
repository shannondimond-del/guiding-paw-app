-- Companion to login_attempts (see the prior migration): caps failed logins
-- per source IP as well as per account, so someone spraying many different
-- email addresses from one IP still gets locked out even though no single
-- account ever hits its own 5-attempt threshold. Kept as a separate table
-- (rather than a column on login_attempts) since it's keyed and locked
-- independently — one IP can be failing across many different emails at once.
create table if not exists public.login_ip_attempts (
  ip text primary key,
  failed_count integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.login_ip_attempts enable row level security;
-- Intentionally no policies — same reasoning as login_attempts: only the
-- service_role key (api/login.js) needs access, and RLS default-denies
-- anon/authenticated entirely.
