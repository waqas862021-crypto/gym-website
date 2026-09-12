# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Purpose

A full gym management platform for Goodlife Fitness Gym (Dhahran, Saudi
Arabia): premium public website, member portal, admin dashboard, AI
customer-service agent, membership payments, automated email, and QR-code
attendance tracking. Being built incrementally — see the current build plan
for phase order and status; do not jump ahead to a later phase's work.

## Architecture

```
frontend/   Next.js (App Router, TypeScript) app — UI and API routes (Route
            Handlers). This is both the "frontend" and the "backend" now.
supabase/   Postgres migrations, applied via the Supabase CLI or dashboard.
prompts/    Behavior-only spec(s) for the AI agent (e.g. system-prompt.md).
            Never invent facts here — facts belong in data/ or the DB.
data/       Verified gym facts only (services, facilities, contact info).
            Nothing here should be invented; it mirrors what the AI
            knowledge base and public site both read from.
backend/    Documentation only. Next.js Route Handlers + Supabase (Postgres,
            Auth, Storage, Row Level Security) fill the role a separate
            backend server would have. No code should be added here.
```

Environment: this machine has no local Node.js and cannot install one
(company policy) — the app is run via GitHub Codespaces or a Vercel deploy
preview, never `npm run dev` on this machine. Code can still be authored and
edited locally; only running/building requires the cloud environment.

## Coding Rules

- TypeScript, not plain JS — chosen because RBAC, payments, and attendance
  logic need the extra correctness guarantees. This is a deliberate exception
  to "keep it simple"; still avoid unnecessary abstraction beyond that.
- Every payment, email, and AI-provider call goes through its
  `frontend/lib/<domain>/provider` interface — never call a provider
  directly from a route or component. This is what makes the mock-to-real
  swap a one-file change later.
- Don't add a feature, dependency, or config option that isn't needed for
  the current phase. New dependencies are fine when they genuinely earn their
  place (e.g. a QR library, a validation library) — just say why in the PR
  description, don't add them speculatively.
- No comments that just restate what the code does. Only comment non-obvious
  reasoning (e.g. a security or RLS assumption).
- Match the style of existing code in the file you're editing.

## Security Rules

- Every Supabase table gets Row Level Security policies from the migration
  that creates it — never ship a table without RLS.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never import it, or any module
  that uses it, from a Client Component or anything bundled to the browser.
- Never hardcode API keys, passwords, or secrets in source files — they
  belong in `frontend/.env.local`, which is git-ignored.
- Never commit `.env.local` or any file containing real secrets.
- Never store raw card/payment details — only a provider transaction
  reference and status (see the payments phase).
- Validate and sanitize all user input at every API boundary (Route
  Handlers), not just in the UI.
- Don't log full API keys, tokens, or user personal data.

## Token-Saving Rules

- Read only the files relevant to the current task, not the whole repo.
- Prefer targeted edits (Edit) over rewriting whole files (Write).
- Keep prompt files in `prompts/` short and specific.
- Don't summarize or restate finished work at length; keep responses brief.

## Scope Rule

Only modify the files needed for the current task/phase. Do not start work
belonging to a later phase of the build plan, and do not refactor, rename, or
"clean up" unrelated files while working on something else.
