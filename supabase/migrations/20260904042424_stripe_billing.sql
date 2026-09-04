-- Real Stripe billing state, replacing the fake payment flow. Columns are
-- written exclusively by api/stripe-webhook.js (service-role key); the
-- client only ever reads them back via the existing `users` select("*") in
-- loadUserData, same as card_last4/renewal_date already work.
alter table public.users
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists grace_period_ends_at timestamptz,
  add column if not exists last_payment_error text;

create unique index if not exists users_stripe_customer_id_idx
  on public.users (stripe_customer_id) where stripe_customer_id is not null;
create unique index if not exists users_stripe_subscription_id_idx
  on public.users (stripe_subscription_id) where stripe_subscription_id is not null;

-- subscription_status already exists on users (see remote schema) and is
-- reused as-is, now written with real values: active | past_due | canceled
-- | unpaid. stripe_subscription_id IS NOT NULL is the "membership user"
-- discriminator for access gating — not plan, which doubles as a free-text
-- label for one-time program purchasers.

-- Idempotency guard for Stripe's at-least-once webhook delivery. A retried
-- checkout.session.completed must not double-insert a pets row (which has
-- no natural unique key). Handler does:
--   insert into stripe_webhook_events (id, type) values ($1,$2)
--   on conflict (id) do nothing
-- and skips all side effects if zero rows were inserted.
create table if not exists public.stripe_webhook_events (
  id text primary key,
  type text not null,
  created_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;
-- Intentionally no policies — same convention as login_attempts: only the
-- service_role key (api/stripe-webhook.js) ever touches this table.
