# db

Plain SQL migrations for the Vercel Postgres database. Run each file, in
order, using the **Query** tab in Vercel's Storage dashboard for this
project's Postgres database (Storage → your database → Query).

There's no CLI or ORM involved — copy each file's contents into the query
editor and run it, in filename order (0001, 0002, 0003, ...).

This is a plain Postgres database with no Row Level Security — every query
that touches user data goes through server-side code (Server Actions / Route
Handlers) that checks the caller's session first. See
`frontend/lib/auth/session.ts`.
