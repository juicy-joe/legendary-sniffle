# SaFaLight — Project Rules

This is a production business website for a premium lighting company. These
rules govern all work on this codebase and apply regardless of what any
individual task or prompt asks for.

## Core rules

- Never expose secrets, API keys, passwords, tokens, or private credentials.
- Never place secrets in frontend code.
- Never commit `.env` files containing secrets.
- Never disable security controls simply to make something work.
- Never delete production data without explicit approval.
- Never modify production database structure without explicit approval.
- Never deploy directly to production without running the production checks (below).
- Always test changes before deployment.
- Always preserve existing functionality unless explicitly asked to remove it.
- Before installing a new dependency, explain why it's required and check
  whether an existing dependency already does the job.
- Before changing authentication or authorization, ask for approval.
- Before changing payment functionality, ask for approval.
- Before changing customer-data handling, ask for approval.
- Before changing database permissions or Row Level Security policies, ask
  for approval.

## Required checks before deployment

Run and fix all errors before deploying:

- TypeScript checks — `npx tsc --noEmit`
- ESLint — `npm run lint`
- Unit tests — **not yet set up; see Known Gaps below**
- Production build — `npm run build`
- Dependency security audit — `npm audit`
- Link validation — **not yet set up; see Known Gaps below**
- Environment-variable validation — **not yet set up; see Known Gaps below**

## Known gaps (as of 2026-08-10)

- **No unit test framework installed.** Verification so far has relied on
  `tsc`/`eslint`/`next build` plus ad-hoc Playwright scripts run manually
  against a local production server for each feature (real database,
  real auth, real revalidation — not mocked). That's meaningfully more
  thorough than typical unit tests for this kind of CRUD-heavy app, but it
  isn't a repeatable, checked-in test suite. Needs a decision on a
  framework (Vitest is the lighter-weight fit here; Playwright could also
  cover this project's own component/e2e needs directly) before "unit
  tests" can be a real gate. (Explicitly deferred for now — revisit once
  the feature set stabilizes.)
- **No automated link validation.** No broken-link checker currently runs
  in CI or as a script.
- **No automated environment-variable validation.** Required vars are
  documented in `.env.example` (`DATABASE_URL`, `SESSION_SECRET`,
  `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_SITE_URL`) but nothing currently
  asserts they're present at build/boot time and fails fast with a clear
  message if not.

`npm audit` is clean (0 vulnerabilities) as of the Next.js 16.3.0 bump —
was 6 high-severity, all transitive via Next.js's own bundled deps
(js-yaml, nanoid, postcss, sharp), resolved by `npm audit fix --force`
after confirming it stayed within the same major version and running the
full check suite + a manual smoke test.

## Architecture

- **Stack**: Next.js 16 (App Router, Turbopack), React 19, TypeScript,
  Tailwind CSS v4, Prisma 7 + PostgreSQL (Prisma Postgres), Vercel Blob for
  images, `jose` + `bcryptjs` for admin session auth.
- **Route structure**: `src/app/(site)/` is the public storefront (its own
  root layout — navbar/footer/cart chrome). `src/app/admin/` is the admin
  panel (separate root layout, no storefront chrome). Both are guarded
  independently; `src/proxy.ts` (Next's middleware-equivalent) protects
  every `/admin/**` route by session cookie.
- **Data layer**: `src/lib/catalog.ts`, `content.ts`, `menus.ts`,
  `settings.ts` are the server-only read paths the storefront renders
  from — all backed by Postgres via Prisma (`src/lib/prisma.ts`). The old
  static `src/lib/products.ts` array is kept only as the source `prisma/seed.ts`
  migrates from; nothing user-facing reads it anymore.
- **Admin auth**: `src/lib/session.ts` (edge-safe, JWT via `jose`, no
  bcrypt — importable from `proxy.ts`) vs `src/lib/auth.ts` (Node-only,
  bcrypt password hashing) are deliberately separate files so bcrypt never
  gets bundled into the Edge-running proxy.
- **Login lockout**: `AdminUser.failedAttempts` / `lockedUntil` — 5 failed
  attempts locks the account for 15 minutes (`src/app/admin/login/actions.ts`).
- **Revalidation**: every admin mutation calls `revalidatePath` for the
  specific public pages it affects, including cross-cutting ones (Navbar/
  Footer render on every route, so menu/social/contact-info edits
  revalidate `"/"` with the `"layout"` type).
- **JSON-LD**: always built through `src/lib/json-ld.ts`'s
  `jsonLdScriptProps()`, never raw `JSON.stringify` + `dangerouslySetInnerHTML`
  — several JSON-LD blocks now embed admin-editable content, and
  `JSON.stringify` doesn't escape `<`.

## Development philosophy

- Prefer simple, maintainable solutions. Don't over-engineer.
- Don't add dependencies where an existing one already covers the need.
- Keep the site fast, accessible, and SEO-friendly.
- Document significant architectural decisions (this file).
- When making significant changes, explain what changed and why.
