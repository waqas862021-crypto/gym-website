-- Phase 3: member memberships (plan + validity window).
-- Status (active/expired) is computed from end_date in application code,
-- not stored, so it's never stale.
create table if not exists memberships (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  plan_slug text not null references membership_plans(slug),
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists memberships_user_id_idx on memberships(user_id);
