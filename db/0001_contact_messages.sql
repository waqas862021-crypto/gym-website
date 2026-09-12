-- Phase 1: public contact form submissions.
-- id is generated in application code (crypto.randomUUID()), not by
-- Postgres, so this doesn't depend on any extension being enabled.
create table if not exists contact_messages (
  id uuid primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);
