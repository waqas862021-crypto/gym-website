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
├── supabase/     # Database migrations (Postgres, via Supabase)
├── prompts/      # Behavior spec for the AI customer-service agent
├── data/         # Verified gym facts (services, facilities, contact info)
├── backend/      # Documentation only — see backend/README.md
├── .env.example  # Template for environment variables (copy into frontend/.env.local)
└── README.md     # You are here
```

## Stack

- **Next.js** (App Router, TypeScript) — UI and API routes in one app.
- **Supabase** — Postgres database, auth, and file storage.
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

1. Create a free Supabase project, then copy `.env.example` to
   `frontend/.env.local` and fill in the Supabase values.
2. Push this repo to GitHub and connect it to Vercel and/or open it in a
   Codespace.
3. Follow the build plan's phases in order — each phase is a separate,
   reviewed step.

## Status

Phase 0 (foundation scaffold) — no membership/payment/attendance features
exist yet.
