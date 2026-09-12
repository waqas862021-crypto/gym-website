-- Phase 2: users and roles.
-- There is no separate database-level Row Level Security here (unlike
-- Supabase) — this is a plain Postgres database, so every query that
-- touches user data must go through server-side code (Server Actions /
-- Route Handlers) that checks the caller's session and role first. See
-- lib/auth/session.ts.
create type app_role as enum (
  'super_admin',
  'admin',
  'reception',
  'customer_service',
  'member'
);

create table if not exists users (
  id uuid primary key,
  email text not null unique,
  password_hash text not null,
  role app_role not null default 'member',
  full_name text,
  created_at timestamptz not null default now()
);
