# Backend

There is no separate backend server in this project. Next.js Route Handlers
(inside `frontend/app/api/`) act as the API layer, and Supabase provides the
database, authentication, file storage, and Row Level Security that a
hand-built backend would otherwise need to implement.

This folder is kept only as a pointer for anyone looking for "the backend" —
no code should be added here. See [`../frontend`](../frontend) and
[`../supabase`](../supabase) instead.
