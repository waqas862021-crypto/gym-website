# supabase

SQL migrations for the Postgres database, applied via the Supabase CLI (from
Codespaces) or pasted into the Supabase dashboard's SQL editor.

`migrations/` is currently empty — the first tables (`profiles`,
`membership_plans`) are added in the Auth & RBAC phase.

This project doesn't have a live Supabase project connected yet. To set one
up: create a free project at supabase.com, then copy its Project URL, anon
key, and service role key into `frontend/.env.local` (see
`.env.example` at the repo root).
