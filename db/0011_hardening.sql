-- Phase 11: hardening — rate limiting and admin notifications.

-- A fixed-window request counter backed by this same Postgres database, so
-- rate limiting needs no new external service (see lib/rate-limit.ts).
-- Rows are small and bounded by distinct keys (roughly one per IP/route);
-- not worth a cleanup job at this scale.
create table if not exists rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  count int not null default 1
);

-- user_id null means a broadcast notification for every admin (e.g. a new
-- escalated support ticket) rather than one specific member's own alert.
-- channel is ready for a future sms/whatsapp provider; only 'in_app' is
-- used today.
create table if not exists notifications (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  channel text not null default 'in_app',
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_unread_idx on notifications(is_read, created_at desc);
