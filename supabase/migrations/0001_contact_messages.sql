-- Phase 1: public contact form submissions.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Anyone (including anonymous visitors) can submit the public contact form.
create policy "Anyone can submit a contact message"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- No select/update/delete policy is defined for anon/authenticated, so only
-- the service role (used by the future admin dashboard) can read submissions.
