-- Phase 2: user roles and profiles.
create type public.app_role as enum (
  'super_admin',
  'admin',
  'reception',
  'customer_service',
  'member'
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'member',
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user can read only their own profile. Editing (Phase 3) and
-- role-elevation (Phase 5, admin-only) are handled once those features
-- exist — no update policy is defined yet, so profiles are read-only via
-- RLS until then.
create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Auto-create a profile (default role: member) whenever a new auth user
-- signs up. Runs as the function owner (bypasses RLS), which is required
-- since the new user has no profile row yet to satisfy any RLS check.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
