-- Phase 2: membership plan catalog.
-- price_sar is left null until real pricing is confirmed (see Phase 4 of
-- the build plan) — never display an unconfirmed price on the public site.
-- Uses slug as the primary key (no generated id needed).
create table if not exists membership_plans (
  slug text primary key,
  name text not null,
  tagline text not null,
  features text[] not null default '{}',
  price_sar numeric,
  highlighted boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into membership_plans (slug, name, tagline, features, highlighted, sort_order)
values
  (
    'monthly',
    'Monthly Membership',
    'Flexible, month to month',
    array['Full gym access', 'Group classes included', 'No long-term commitment'],
    false,
    1
  ),
  (
    'quarterly',
    'Quarterly Membership',
    'Commit for a season',
    array['Full gym access', 'Group classes included', 'Better value than monthly'],
    true,
    2
  ),
  (
    'annual',
    'Annual Membership',
    'Our best value',
    array['Full gym access', 'Group classes included', 'Priority booking for sessions'],
    false,
    3
  )
on conflict (slug) do nothing;
