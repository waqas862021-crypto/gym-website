# frontend

The Next.js (App Router, TypeScript) app — this is both the website's
frontend and its API layer (Route Handlers under `app/api/`).

## Layout

```
app/              Pages and API routes
lib/db.ts          Vercel Postgres client
lib/auth/          Password hashing, session JWTs, session cookie helpers
lib/payments/       Payment provider interface (mocked for now)
lib/email/          Email provider interface (mocked for now)
lib/ai/             AI provider interface (mocked for now)
```

## Running

No local Node.js is available on the dev machine — run this via GitHub
Codespaces (full dev server) or a Vercel deploy preview, not `npm run dev`
locally. See the root [README.md](../README.md).
