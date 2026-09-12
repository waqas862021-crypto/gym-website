-- Phase 2: membership plan catalog.
-- price_sar is left null until real pricing is confirmed (see Phase 4 of
-- the build plan) — never display an unconfirmed price on the public site.
create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null,
  features text[] not null default '{}',
  price_sar numeric,
  highlighted boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.membership_plans enable row level security;

-- Plans are public information — anyone can see what's on offer.
-- No insert/update/delete policy exists yet, so only the service role
-- (the future admin dashboard, Phase 5) can manage the catalog.
create policy "Anyone can view membership plans"
  on public.membership_plans
  for select
  to anon, authenticated
  using (true);

insert into public.membership_plans (slug, name, tagline, features, highlighted, sort_order)
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
