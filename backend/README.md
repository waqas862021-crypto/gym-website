# Backend

There is no separate backend server in this project. Next.js Route Handlers
and Server Actions (inside `frontend/`) act as the API layer, Vercel
Postgres is the database, and authentication/authorization is hand-rolled in
`frontend/lib/auth/` — together they fill the role a separate backend server
would otherwise need to.

This folder is kept only as a pointer for anyone looking for "the backend" —
no code should be added here. See [`../frontend`](../frontend) and
[`../db`](../db) instead.
