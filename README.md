# Goodlife Fitness Gym Platform

A gym management platform for **Goodlife Fitness Gym** (Dhahran, Saudi Arabia): a
premium public website, a member portal, an admin dashboard, an AI
customer-service agent, membership payments, automated email, and QR-code
attendance tracking.

Built incrementally in phases — see the build plan for the full breakdown and
current status.

## Project Structure

```
gym website/
├── frontend/     # The Next.js (TypeScript) app — pages AND API routes
├── db/           # Plain SQL migrations (Vercel Postgres)
├── prompts/      # Behavior spec for the AI customer-service agent
├── data/         # Verified gym facts (services, facilities, contact info)
├── backend/      # Documentation only — see backend/README.md
├── .env.example  # Template for environment variables (copy into frontend/.env.local)
└── README.md     # You are here
```

## Stack

- **Next.js** (App Router, TypeScript) — UI and API routes in one app.
- **Vercel Postgres** — the database, linked directly to this Vercel project
  (no separate account needed beyond Vercel).
- Auth is hand-rolled: `bcryptjs` for password hashing, signed session-token
  cookies (JWT via `jose`) checked in `frontend/middleware.ts`.
- Payments, email, and the AI provider call are **mocked** behind stable
  interfaces (`frontend/lib/payments`, `frontend/lib/email`, `frontend/lib/ai`)
  until real provider accounts/keys are wired in.

## Running the app

This machine has no local Node.js install (and can't get one per company
policy), so the app is run via a cloud environment rather than `npm run dev`
locally:

- **GitHub Codespaces** — open the repo in a Codespace for a full in-browser
  dev server and terminal.
- **Vercel** — connect the GitHub repo to get an automatic build + preview URL
  on every push.

## Getting Started

1. In the Vercel dashboard, go to **Storage** and create/link a Postgres
   database to this project — this sets the `POSTGRES_URL` environment
   variable automatically.
2. Add one more environment variable yourself: `AUTH_SECRET` (a random
   string — see `.env.example`).
3. Run the SQL files in `db/` (in order) using the Postgres database's
   **Query** tab in Vercel.
4. Push this repo to GitHub and connect it to Vercel and/or open it in a
   Codespace.
5. Follow the build plan's phases in order — each phase is a separate,
   reviewed step.

## Status

Phase 5 (admin dashboard core) — on top of Phase 4, `/admin` shows live
member/revenue/expiration stats and a searchable member list with role
management, suspend/activate, and a manual (no-charge) renewal. Suspended
accounts are blocked at both login and on each portal load. AI agent,
email, and attendance are later phases.
