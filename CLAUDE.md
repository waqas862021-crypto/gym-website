# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Purpose

A full gym management platform for Goodlife Fitness Gym (Dhahran, Saudi
Arabia): premium public website, member portal, admin dashboard, AI
customer-service agent, membership payments, automated email, QR-code
attendance tracking, trainers/classes/bookings, reporting, and hardening
(rate limiting, validation, tests, notifications). All 11 build-plan phases
are complete; remaining work is swapping each mock provider for a real one
once accounts/keys exist (payments, email, AI) — see "Later, out of scope"
in the build plan. Don't jump ahead of what's actually wired up without
checking first.

## Architecture

```
frontend/   Next.js (App Router, TypeScript) app — UI and API routes (Route
            Handlers). This is both the "frontend" and the "backend" now.
db/         Plain SQL migrations for Vercel Postgres, run manually via the
            Query tab in Vercel's Storage dashboard.
prompts/    Behavior-only spec(s) for the AI agent (e.g. system-prompt.md).
            Never invent facts here — facts belong in data/ or the DB.
data/       Verified gym facts only (services, facilities, contact info).
            Nothing here should be invented; it mirrors what the AI
            knowledge base and public site both read from.
backend/    Documentation only. Next.js Route Handlers + Vercel Postgres fill
            the role a separate backend server would have. No code should be
            added here.
```

Database & auth: Vercel Postgres (`@vercel/postgres`), not Supabase — chosen
so the only account needed is the Vercel one already in use, instead of a
separate Supabase signup. There is no Row Level Security here (that's a
Supabase-specific feature) — authorization is enforced entirely in
server-side code (`frontend/lib/auth/session.ts` + role checks), so every
Route Handler / Server Action that touches user data must check the session
itself. Auth is hand-rolled: `bcryptjs` for password hashing, `jose` for
signed session-token cookies (JWT) verified in `frontend/middleware.ts`,
which runs on the Edge runtime — keep anything imported there Edge-compatible
(no `bcryptjs`, no Node-only APIs).

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
- Validation: `zod` (`frontend/lib/*`, action files) is the standard for
  public/unauthenticated boundaries (contact form, chat, signup/login) and
  for structured/numeric/enum input (e.g. class scheduling, role changes).
  Simple required-string admin forms may keep the existing lighter
  trim-and-check pattern — don't rewrite those speculatively.
- Rate limiting: `frontend/lib/rate-limit.ts` (`checkRateLimit`) is a
  Postgres-backed fixed-window counter, deliberately not Redis/Upstash — see
  the Architecture section. Apply it to any new unauthenticated or
  brute-forceable endpoint (login, signup, contact, chat already have it).
- Tests: `frontend/**/*.test.ts`, run with `npm test` (Vitest). Mock
  `@/lib/db`'s `sql` export per test file rather than hitting a real
  database; `vitest.setup.ts` neutralizes `server-only` so files that import
  it can still be unit tested under plain Node.

## Security Rules

- There is no database-level RLS — every Route Handler / Server Action that
  reads or writes user data must check `getSession()` (and role, where
  relevant) itself before touching the database. Never assume the DB will
  stop an unauthorized query.
- Database access (`frontend/lib/db.ts`) and password hashing
  (`frontend/lib/auth/password.ts`) are marked `server-only` — never import
  them, or any module that uses them, from a Client Component.
- Never hardcode API keys, passwords, or secrets in source files — they
  belong in `frontend/.env.local`, which is git-ignored.
- Never commit `.env.local` or any file containing real secrets.
- Never store raw card/payment details — only a provider transaction
  reference and status (see the payments phase).
- Validate and sanitize all user input at every API boundary (Route
  Handlers), not just in the UI.
- Don't log full API keys, tokens, or user personal data.
- Only a `super_admin` may grant the `admin` or `super_admin` role
  (`frontend/app/admin/actions.ts`); a plain `admin` granting either would be
  a privilege-escalation hole. An admin also can't change their own role,
  to avoid an accidental lockout.
- Unauthenticated or easily-automated endpoints (login, signup, contact,
  chat) must call `checkRateLimit` from `frontend/lib/rate-limit.ts` before
  doing any real work.

## Token-Saving Rules

- Read only the files relevant to the current task, not the whole repo.
- Prefer targeted edits (Edit) over rewriting whole files (Write).
- Keep prompt files in `prompts/` short and specific.
- Don't summarize or restate finished work at length; keep responses brief.

## Scope Rule

Only modify the files needed for the current task/phase. Do not start work
belonging to a later phase of the build plan, and do not refactor, rename, or
"clean up" unrelated files while working on something else.
