# Devlog portfolio

A portfolio for a solo game developer where every project has its own devlog timeline.
Next.js (App Router) · TypeScript · Tailwind CSS v4 · Postgres + Drizzle · Vercel.

**The plan, decisions and progress live in [`SPEC.md`](./SPEC.md).**

## Quick start

No accounts or services needed: it uses an embedded Postgres (PGlite) and local file storage by default.

```bash
pnpm install
pnpm db:setup     # migrate + seed 3 sample projects with ~15 devlog posts
pnpm dev          # http://localhost:3000
```

Make it yours in [`src/config/site.ts`](./src/config/site.ts). All environment variables are documented in
[`.env.example`](./.env.example).

## Scripts

| Command                              | What it does                                                           |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `pnpm dev` / `build` / `start`       | Next.js                                                                |
| `pnpm db:generate`                   | Generate a SQL migration from `src/db/schema.ts`                       |
| `pnpm db:migrate`                    | Apply migrations (PGlite, or `DATABASE_URL` when set)                  |
| `pnpm db:seed`                       | Replace content with sample data (stop `pnpm dev` first with PGlite)   |
| `pnpm db:reset`                      | Wipe local PGlite + uploads, migrate and seed                          |
| `pnpm lint` / `typecheck` / `format` | Code quality                                                           |
| `pnpm test`                          | Vitest (logic + DB tests on in-memory Postgres)                        |
| `pnpm test:e2e`                      | Playwright against a production build with an isolated database        |
| `pnpm test:screens`                  | Screenshots of every page at 390px and 1440px → `test-results/screens` |

In environments with a preinstalled Chromium, set `PW_CHROMIUM_PATH` to its executable.
