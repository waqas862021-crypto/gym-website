-- Phase 4: mocked payments, renewal, receipts.
create type payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');

create table if not exists payments (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  plan_slug text not null references membership_plans(slug),
  amount_sar numeric not null,
  status payment_status not null default 'pending',
  provider_ref text,
  created_at timestamptz not null default now()
);

create index if not exists payments_user_id_idx on payments(user_id);

-- duration_days drives renewal math (see lib/payments); nullable until backfilled below.
alter table membership_plans add column if not exists duration_days int;

update membership_plans set duration_days = 30 where slug = 'monthly';
update membership_plans set duration_days = 90 where slug = 'quarterly';
update membership_plans set duration_days = 365 where slug = 'annual';

alter table membership_plans alter column duration_days set not null;

-- Non-production placeholder prices so the mock payment flow has amounts to
-- charge — deliberately round/fake numbers. The public site still shows
-- "Contact Us for Membership Details" and never renders price_sar; swap
-- these for real confirmed prices before launch.
update membership_plans set price_sar = 100 where slug = 'monthly';
update membership_plans set price_sar = 250 where slug = 'quarterly';
update membership_plans set price_sar = 900 where slug = 'annual';
