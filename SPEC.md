# SPEC — Gamedev portfolio with per-project devlog feeds

> Living plan. Every session starts by reading this file and ends by updating the
> **Phase checklist** and **Session log** at the bottom.

## 1. Goal

A premium, fast portfolio site for **[DITT NAMN]**, a solo game developer (Unreal Engine,
web games, tools). Each project has its own devlog timeline so visitors can follow a
project from the first prototype to the latest update. It must look like a studio site,
not a template.

The owner's name, role and bio live in one place: `src/config/site.ts`.

## 2. Core concepts

### Project

| Field                   | Notes                                                                    |
| ----------------------- | ------------------------------------------------------------------------ |
| `title`, `slug`         | slug is unique and used in URLs: `/projects/[slug]`                      |
| `tagline`               | one line, shown on cards and in the hero                                 |
| `summary`               | short markdown paragraph for the project page                            |
| `coverMediaId`          | image or video (`media` row); videos get a poster frame                  |
| `status`                | `prototype` · `in_development` · `released` · `on_hold` · `archived`     |
| `tech`                  | engine/tech tags, `text[]` (e.g. `Unreal Engine 5`, `C++`, `Three.js`)   |
| `platforms`             | `text[]` (e.g. `PC`, `Web`, `Steam Deck`)                                |
| `links`                 | `jsonb` — `{ steam?, itch?, github?, trailer?, website? }`               |
| `startedAt`             | date the project started (shown in meta, not the same as the first post) |
| `featured`, `sortOrder` | featured grid on home; manual drag-order in admin                        |

### Post (devlog entry)

| Field           | Notes                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| `projectId`     | belongs to exactly one project (cascade delete)                                                          |
| `title`, `slug` | slug unique **per project**: `/projects/[project]/[post]`                                                |
| `excerpt`       | optional; falls back to the first paragraph of the body                                                  |
| `body`          | markdown (GFM). Media are embedded by URL; YouTube via `::youtube[id]` directive                         |
| `coverMediaId`  | optional hero media for the post / timeline card                                                         |
| `type`          | `devlog` · `milestone` · `release` · `showcase`                                                          |
| `status`        | `draft` · `published` · `scheduled`                                                                      |
| `publishedAt`   | **the display date**. Freely overridable for backfilling history. For `scheduled` it is the go-live time |
| `pinned`        | shown in a pinned slot above the timeline                                                                |
| `notifiedAt`    | set once subscribers have been emailed (idempotent notifications)                                        |

### Media

`media` rows: `key` (storage key), `kind` (`image` · `gif` · `video`), `mime`, `width`,
`height`, `sizeBytes`, **`alt` (NOT NULL — alt text is required on upload)**, `posterKey`
(video poster frame), `blurDataUrl` (tiny placeholder for `next/image`).
`post_media` (postId, mediaId, position) tracks usage so the media library can find and
delete unused files.

### Subscribers

`subscribers`: `projectId` (nullable = global), `email`, `status`
(`pending` · `confirmed` · `unsubscribed`), `token` (confirm/unsubscribe), timestamps.
Unique on (`projectId`, `email`).

## 3. Rules that are easy to get wrong (tested)

**Visibility.** A post is public iff `status ∈ {published, scheduled}` **and**
`publishedAt <= now`. Drafts are never public. A scheduled post becomes public by time
alone — no job has to flip it. (Job in Phase 4 only sends the notification.)
→ `src/lib/posts/visibility.ts`

**Timeline ordering** (`src/lib/posts/timeline.ts`):

1. Only public posts.
2. Sorted by `publishedAt` **desc**, tie-break by `createdAt` desc, then `id` — fully deterministic.
3. The **origin** post = the oldest public post. It is removed from the paged list and always
   rendered anchored at the bottom with a distinct **"Project started"** marker, no matter
   how many pages are loaded. Between the loaded entries and the origin, a
   "N older updates — Load older" gap is rendered while more pages remain.
4. **Pinned** posts are shown in a pinned slot above the timeline _and_ stay in their
   chronological position (rendered compact there), so the chronology is never broken.
   The origin post is never duplicated into the pinned slot.
5. Pagination is keyset on (`publishedAt`, `createdAt`, `id`) — stable when new posts arrive.
6. Marker weight: `release` > `milestone` > `showcase` > `devlog`.

**Prev/next** on a post page = neighbours within the same project in timeline order.

## 4. Technical decisions

| Area                 | Decision                                                                                                                                                                                                                                                | Why                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Framework            | Next.js 16 App Router, React 19, TypeScript `strict` + `noUncheckedIndexedAccess`                                                                                                                                                                       | spec                                                   |
| Package manager      | **pnpm**                                                                                                                                                                                                                                                | fast, strict                                           |
| Styling              | Tailwind CSS v4 (CSS-first `@theme` tokens in `src/app/globals.css`)                                                                                                                                                                                    | tokens live in one file                                |
| Fonts                | Self-hosted via npm (no network at build): **Archivo** variable (with `wdth` axis, used expanded + uppercase for display), **Geist Sans** for UI/body, **Geist Mono** for meta/labels                                                                   | distinctive studio display face + clean sans, zero CLS |
| DB                   | Postgres + Drizzle ORM. `DATABASE_URL` set → `postgres` (postgres.js) driver (Neon/Vercel Postgres). Unset → **PGlite** in `.data/pglite` (embedded Postgres, no account needed). Tests use in-memory PGlite                                            | runs everywhere with zero setup                        |
| Migrations           | `drizzle-kit generate` → SQL in `drizzle/`, applied by `pnpm db:migrate` (same migrator for PGlite and Postgres)                                                                                                                                        | reviewed SQL                                           |
| Storage              | `Storage` interface (`put`, `delete`, `url`, `read`) in `src/lib/storage`. `STORAGE_DRIVER=local` (default) writes to `.data/uploads`, served by `/media/[...key]`. `STORAGE_DRIVER=s3` → any S3-compatible bucket (Cloudflare R2) with `S3_PUBLIC_URL` | swap without code changes                              |
| Images               | `next/image` everywhere (AVIF/WebP), blur placeholders from `media.blurDataUrl`. Seed images generated with `sharp`                                                                                                                                     | performance                                            |
| Video                | `<video preload="none" poster=…>` mounted only when near viewport; never autoplay with sound                                                                                                                                                            | LCP / data                                             |
| Markdown             | `react-markdown` + `remark-gfm` + a small directive for YouTube (lite embed: thumbnail until click)                                                                                                                                                     | safe (no raw HTML)                                     |
| Auth (Phase 3)       | Auth.js v5 (`next-auth@beta`) GitHub provider, JWT sessions, `signIn` callback allows only `AUTH_GITHUB_ALLOWED_ID`. Guard in `proxy.ts` (Next 16 middleware) **and** in every server action                                                            | defense in depth                                       |
| Email (Phase 4)      | Resend behind `RESEND_API_KEY`. `features.email = Boolean(key)`; when false the follow button is not rendered and routes return 404                                                                                                                     | graceful degrade                                       |
| Feeds (Phase 4)      | Atom 1.0 at `/feed.xml` and `/projects/[slug]/feed.xml` (+ RSS 2.0 `.rss` aliases)                                                                                                                                                                      | spec                                                   |
| Scheduling (Phase 4) | Vercel Cron → `/api/cron/notify` (secured by `CRON_SECRET`) sends notifications for newly-visible posts where `notifiedAt IS NULL`                                                                                                                      | scheduled posts need no flip                           |
| Tests                | Vitest (unit + DB tests on in-memory PGlite), Playwright (e2e + screenshots at 390px and 1440px)                                                                                                                                                        | spec                                                   |
| Deploy               | Vercel. `.env.example` documents every variable                                                                                                                                                                                                         | spec                                                   |

### Environment variables

See `.env.example` — every variable is documented there. Nothing is required for local dev.

## 5. Design system

**Direction:** premium dark, flat, restrained. No neon, no glow, no gradient blobs.
High-end studio / Linear / Vercel craft. Media is the star.

- **Surface scale** (near-black, very slightly warm): `--bg #0b0b0c`, `--surface-1 #121214`,
  `--surface-2 #18181b`, `--surface-3 #202024`. Hairlines `--line` (8% white) and
  `--line-strong` (14% white).
- **Text:** `--fg #ededee`, `--fg-muted #a1a1a8`, `--fg-subtle #6e6e76`.
- **One accent:** signal orange `--accent #ff5b24` (flat, no glow), `--accent-fg #0b0b0c`.
  Used sparingly: primary CTA, active states, milestone/release markers, focus rings.
- **Status colors** are desaturated and only used as small dots/labels.
- **Typography:** display = Archivo, expanded width, 700–800, uppercase, tight tracking,
  fluid sizes with `clamp()`. Body = Geist Sans 15–17px, 1.6 line height.
  Labels/meta = Geist Mono 11–12px uppercase, wide tracking.
- **Grid:** 12 columns, max width 1440px, gutters 16px (mobile) → 32px (desktop).
  A subtle 1px background column grid is visible on large screens only (`.bg-grid`).
- **Radius:** small and consistent — 2px controls, 4px cards/media. Mostly square.
- **Motion:** 150–400ms, `cubic-bezier(.2,.7,.2,1)`. Fade/slide-up on scroll via a single
  `IntersectionObserver` component (`<Reveal>`). All motion disabled under
  `prefers-reduced-motion`.
- **Focus:** 2px accent outline with 2px offset on every interactive element.
- **Components** (`src/components/ui`): `Button`/`ButtonLink`, `TextLink`, `Container`,
  `GridOverlay`, `Eyebrow`, `SectionHeading`, `StatusBadge`, `Tag`/`TagList`, `MediaFrame`,
  `LazyVideo`, `ProjectCard`, `TimelineMarker`, `Reveal`, `Kbd`, icons.
  Layout: `SiteHeader` (+ `NavLinks`, `MobileNav`), `SiteFooter`, `SkipLink`.
  Home: `Showreel`, `LatestFeed`. Live reference at `/design` (noindex).

## 6. Routes

Public: `/` · `/projects` · `/projects/[slug]` · `/projects/[slug]/[post]` · `/about` ·
`/feed.xml` · `/projects/[slug]/feed.xml` · `/sitemap.xml` · `/robots.txt` ·
`/media/[...key]` (local storage only) · `/design` (noindex).
Admin: `/admin` · `/admin/projects/[id]` · `/admin/posts/[id]` · `/admin/media` · `/admin/login`.

## 7. Quality bar

- Lighthouse 95+ (perf, a11y, best practices, SEO) on home, project and post pages.
- Semantic HTML, full keyboard navigation, alt text required on upload.
- SEO: metadata, sitemap, robots, JSON-LD, dynamic OG images.
- Vitest: timeline ordering, scheduling/visibility, auth guard.
- Playwright: create project, publish post → top of timeline, first post stays at bottom,
  RSS valid, admin blocked when logged out.
- Visual self-review: screenshots at 390px and 1440px of every public page and the admin
  (`pnpm test:screens` → `test-results/screens/`), reviewed critically every phase.

## 8. Commands

```bash
pnpm install
pnpm db:setup        # migrate + seed (3 projects, 15 public posts + 1 draft + 1 scheduled)
pnpm dev             # http://localhost:3000
pnpm db:reset        # wipe local PGlite + uploads, migrate, seed
pnpm test            # vitest
pnpm test:e2e        # playwright (builds + starts the app)
pnpm test:screens    # screenshots at 390 / 1440
pnpm lint && pnpm typecheck && pnpm format:check
```

### Gotchas (learned the hard way)

- **PGlite = one process per data dir.** Stop `pnpm dev` before `db:seed` / `db:reset`.
  E2E uses its own dirs (`.data/pglite-e2e`, `.data/uploads-e2e`) on port 3100.
- **Don't name a script `setup`** — `pnpm setup` is a pnpm built-in (hence `db:setup`).
- **Storage keys are content-addressed** (seed: `seed/<name>-<sha256:10>.webp`) because
  `/media` is served `immutable`; reusing a key after changing bytes serves stale images.
- **`backdrop-filter` creates a containing block for `position: fixed` children** — the
  mobile menu panel is portalled to `<body>` for that reason.
- **Reveal-on-scroll** hides content only when `html.js` is set (inline script), and never
  under reduced motion. Don't wrap above-the-fold/LCP content in `<Reveal>`.
- Public pages are `force-dynamic` for now (live DB reads). Phase 5: switch to ISR +
  `revalidatePath` from admin actions.
- Next 16 writes `AGENTS.md`/`CLAUDE.md` on `next dev`; keep them committed. Project rules
  are appended below Next's block in `AGENTS.md`.
- In the cloud sandbox, run Playwright with `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium`.

## 9. Phase checklist

### Phase 1 — Foundation

- [x] SPEC.md
- [x] Next.js + TS strict + Tailwind v4 + ESLint setup, pnpm scripts
- [x] `.env.example` with every variable documented, typed env module
- [x] Design tokens, fonts, global styles, reduced-motion handling
- [x] UI components + `/design` reference page
- [x] Layout shell: header (with mobile menu), footer, skip link, container/grid
- [x] DB schema (projects, posts, media, post_media, subscribers) + migration
- [x] DB client: PGlite (dev/test) / postgres.js (prod)
- [x] Storage interface: local + S3/R2 driver, `/media/[...key]` route
- [x] Visibility + timeline ordering logic with unit tests
- [x] Seed: 3 projects, ~15 posts over months, generated cover/screenshot media
- [x] Home shell (hero + featured projects from DB) to prove the stack end to end
- [x] Vitest + Playwright configured; smoke e2e + screenshot script
- [x] Screenshot review at 390/1440

### Phase 2 — Public site

- [ ] Home: hero with showreel slot, featured grid, latest activity feed (tagged by project)
- [ ] Projects index with status + tech filters (URL search params, no JS required)
- [ ] Project page: cover hero, meta, links, timeline (pinned slot, load older, origin anchor)
- [ ] Post page: markdown body, media, YouTube lite embed, prev/next, share buttons
- [ ] About page: bio, skills/tools, contact, CV slot
- [ ] Reveal animations on timeline
- [ ] E2E: timeline order, origin stays at bottom across "load older"

### Phase 3 — Admin

- [ ] Auth.js GitHub, single allowed user id; `proxy.ts` guard + action guard; Vitest guard tests
- [ ] Dashboard (projects, recent posts, subscriber counts, drafts)
- [ ] Project editor (all fields, cover upload, drag reorder, featured toggle)
- [ ] Post composer (markdown + live preview, drag/drop + paste upload, alt required, type,
      date override, draft/publish/schedule, pin, autosave, keyboard shortcuts)
- [ ] Media library (reuse, delete unused)
- [ ] Toasts, optimistic UI
- [ ] E2E: admin blocked when logged out; create project; publish post → top of timeline
      (test-only credentials provider enabled only when `AUTH_TEST_MODE=1` and not production)

### Phase 4 — Following

- [ ] Atom/RSS: global + per project; validation test
- [ ] Follow (double opt-in) via Resend; hidden when no key
- [ ] Notify on publish + cron for scheduled posts; unsubscribe link

### Phase 5 — Polish

- [ ] Dynamic OG images (project + post), JSON-LD, sitemap, robots, metadata audit
- [ ] Performance pass (Lighthouse 95+ ×4 on home/project/post)
- [ ] Animation pass
- [ ] Full test suite green
- [ ] Final screenshot review

## 10. Session log

### Session 1 — Phase 1 (Foundation) ✅

**Done**

- Project setup: Next.js 16 / React 19 / TS strict / Tailwind v4 / ESLint / Prettier, pnpm, GitHub Actions CI.
- Design system: tokens in `globals.css`, Archivo (expanded) + Geist Sans/Mono self-hosted, components, `/design`.
- Layout shell: sticky header, portalled full-screen mobile menu, footer, skip link, 12-col grid overlay, 404.
- DB: schema + `drizzle/0000_init.sql`; PGlite ↔ postgres.js switch on `DATABASE_URL`.
- Logic: `isPublic`/`effectiveState`, `buildTimeline` (origin anchor, pinned, keyset cursor),
  `neighbours`, `markerWeight`, and SQL `getProjectTimeline`, proven identical to the pure version page by page.
- Storage: local + S3/R2 drivers, traversal-safe keys, `/media/[...key]` with immutable caching.
- Seed: 3 projects (Hollowdeep / Tiny Orbit / Blockout Kit), 15 public posts over ~10 months, 1 draft,
  1 scheduled, 1 pinned; procedural "screenshot" art generated with sharp.
- Home already shows hero + showreel slot + featured grid + latest feed from the DB.
- Tests: 34 Vitest (visibility, timeline, DB parity, storage, env), 8 Playwright smoke, screenshot suite.

**Screenshot review fixes this session:** reveal content hidden in full-page captures, stale images
(→ content-addressed keys), lead card leaving a hole in the grid (→ full-width 21:9 lead + two
halves), duplicate hero/lead image, transparent mobile menu (backdrop-filter containing block),
misaligned "All projects" link, small hero name on mobile.

**Open / for the owner**

- Replace placeholders in `src/config/site.ts` (name, email, socials, showreel, CV).
- Nav links `/projects` and `/about` 404 until Phase 2.

**Next session → Phase 2**: projects index (filters via search params), project page with the
timeline (use `getProjectTimeline`; pinned slot, "N older updates — Load older" gap, origin anchor
with "Project started"), post page (markdown + YouTube lite embed, prev/next via `neighbours`),
about page. Add their pages to `tests/e2e/screens.spec.ts`.
