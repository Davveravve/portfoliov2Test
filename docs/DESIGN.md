# DESIGN.md — Ground Station (final specification)

Status: **final, implementation-ready**. Supersedes SPEC.md §5 (update §5 to point here, see §10).
Base concept: **Ground Station** (top of the aggregate ranking, 123). Grafts: two-tone headline
(Vitrine/Shutter), media-above-the-fold hero (Vitrine's stance, executed flat), readout/caption
system as a `MediaFrame` prop (Monograph), marker rail on the devlog (Shutter), timecode readout
(Shutter), `<dialog>` player and `showreel.ambient` switch (Vitrine), index→`VIEW →` flip
(Shutter). Every judge warning is honoured; Appendix A maps each warning to the rule that answers it.

Hard constraints (unchanged, non-negotiable): premium dark · flat and restrained · no neon, glow,
shadows, blur, grain or gradient blobs · media-first · exactly one accent · subtle purposeful motion
that respects `prefers-reduced-motion` · Lighthouse 95+ on every public page · fully responsive ·
fonts self-hosted from npm · English UI.

---

## 1. Direction

**Thesis.** The site is a calm, monochrome console for one person's work, where game footage is the
only thing allowed to be loud. Futurism comes from precision, not effects: a quiet neutral-black
page, 1px hairlines, a visible column rhythm, tabular mono readouts that report real data, one
orange LED. Nothing is drawn on top of the footage — the showreel and every cover sit pristine
between two rules, as large as the viewport allows, above the fold on every device. It reads
premium the way Braun, Teenage Engineering and a good engine viewport read premium: matte
surfaces, zero radius on frames, no shadows, no zoom, and every mark that looks decorative is
actually a measurement. It reads "simple yet not" because the structure rewards a second look —
numbered rails with live counts, a stats cluster with a hairline cross, a log with descending
indices on a marker rail, a coda in the headline set one tone darker.

**The five principles** (every implementation decision is checked against these, in order):

1. **Footage first, chrome second.** The largest element on every screen is media. The showreel is
   above the fold at 1440×900 and at 390×844. No text, badge, vignette or grain is ever placed over
   an image; captions and controls live _under_ the frame in the readout bar.
2. **Precision is the futurism.** Hairlines (8% / 14%), a 12-column rhythm, zero-padded tabular
   numerals, exact dates, exact pixel dimensions. No scanlines, brackets over images, HUD
   crosshairs, glow or glass.
3. **Every mark reports something.** Every mono string on the site maps to a real value from the
   database, the config or the asset (`03 ITEMS`, `2560×1097 · 21:9`, `LAST LOG 2026.09.19`).
   Nothing is invented for flavour: no clock, no coordinates, no build SHA, no "SYS.OK".
4. **One LED.** The accent is an indicator light, never a surface. It never fills an area larger
   than 8×8 px or a line thicker than 1 px (focus ring excepted at 2 px). It never colours running
   text, borders, hover states or buttons.
5. **Still by default.** The static page _is_ the design. Motion is short (150–600 ms), informative,
   and mostly reveals structure (a rule drawing, a row lifting). The only self-moving things are the
   availability LED (2 s step blink) and the showreel when it is in view. Under reduced motion or
   without JS the page is complete and identical in layout.

---

## 2. Tokens

### 2.1 Colour

| Token                   | Value                     | Use                                                                                  | Contrast on bg |
| ----------------------- | ------------------------- | ------------------------------------------------------------------------------------ | -------------- |
| `bg`                    | `#0a0a0b`                 | page, header, menu sheet, dialog scrim base (neutral; drop the warm cast)            | —              |
| `surface-1`             | `#0f0f11`                 | row hover tray, empty media frames, `<dialog>` panel                                 | —              |
| `surface-2`             | `#141417`                 | tags, secondary/ghost hover fill, kbd                                                | —              |
| `surface-3`             | `#1a1a1e`                 | pressed state of secondary/ghost, code blocks                                        | —              |
| `line`                  | `rgb(255 255 255 / 0.08)` | hairlines: frames, row separators, grid cross, tag ring                              | —              |
| `line-strong`           | `rgb(255 255 255 / 0.14)` | section rails, full-bleed rules, secondary button ring, frame ring on hover          | —              |
| `grid`                  | `rgb(255 255 255 / 0.03)` | the background 12-column grid (`GridOverlay`), lg+ only                              | —              |
| `fg`                    | `#f2f2f3`                 | headlines, titles, primary button fill, readout numerals                             | 17.7 : 1       |
| `fg-muted`              | `#a3a3ab`                 | body copy, labels, meta, nav rest state, the two-tone coda                           | 7.9 : 1        |
| `fg-subtle`             | `#7a7a83`                 | **decorative / `aria-hidden` only**: card indices, log indices, empty-frame label    | 4.65 : 1       |
| `accent`                | `#ff5b24`                 | LEDs, release/milestone markers, active-nav underline, focus ring, playing timecode  | 6.4 : 1        |
| `accent-fg`             | `#0a0a0b`                 | text on accent (only the skip link uses an accent fill)                              | 6.4 : 1        |
| `white`                 | `#ffffff`                 | primary button hover only                                                            | —              |
| `status-prototype`      | `#8d9ccc`                 | 6 px dot only                                                                        | 7.3 : 1        |
| `status-in-development` | `#e0a458`                 | 6 px dot only                                                                        | 9.1 : 1        |
| `status-released`       | `#7fb58a`                 | 6 px dot only (also the availability dot is **not** this — availability uses accent) | 8.4 : 1        |
| `status-on-hold`        | `#a1a1a8`                 | 6 px dot only                                                                        | 7.7 : 1        |
| `status-archived`       | `#6e6e76`                 | 6 px dot only (3.9 : 1 — never as text)                                              | —              |

Rules:

- `fg-subtle` passes AA (4.65 : 1) so an accidental slip cannot fail Lighthouse, but it is still
  reserved for `aria-hidden` marks and indices. Any readable label uses `fg-muted`.
- Surfaces never exceed `#1a1a1e`; hairlines never exceed 14 %. Above that, panels read as cards
  and the flat look breaks.
- `::selection` is inverted mono: background `fg`, text `bg`. Not orange.
- Delete `accent-hover`, `black`. Keep `transparent` and `current`.
- Accent budget, exhaustive (nothing else may be orange): (1) 6 px square LED in the header
  wordmark, (2) 6 px square LED inside the primary button, (3) 6 px square availability LED in the
  hero rail, (4) release and milestone `TimelineMarker`s (and the origin marker), (5) 1 px active-nav
  underline, (6) 2 px focus ring, (7) the timecode digits in the showreel readout **while the video is
  playing**, (8) the skip link background (focus only). `Eyebrow` loses its accent dot.
- Re-check the accent against the owner's real covers before launch (the seed art already carries
  `#ff5b24`-family orange in all three covers). If the real footage clashes, change **only**
  `--color-accent` (candidate: printer's vermilion `#e94f2a`, 5.3 : 1). Never add a second accent.

### 2.2 Radius

`--radius-xs: 2px` is the **only** radius: buttons, tags, kbd, inputs, dialog panel, focus-ring
corners. Media frames, cards, panels, header, menu sheet, thumbnails, stats cells: **0**. Status dots
and the ghost play glyph are the only circles. Delete `sm`–`xl`.

### 2.3 Spacing and rhythm

- Base unit 4 px. Vertical scale used on the site: 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64 · 96 · 160.
- `--gutter`: 16 px (< 768) · 32 px (≥ 768). `--header-h`: 56 px · 64 px.
- `--space-section`: 96 px (< 768) · 160 px (≥ 768). Every home section and the footer starts with
  `padding-top: var(--space-section)` (footer uses `margin-top`). Whitespace separates sections;
  the section rail marks them.
- Inside a section: rail → title `mt-8` (32) → content `mt-12` (48).
- Under any media frame: readout bar is flush (`0`), then content `mt-10` (40).
- Card: media → meta row `mt-4` (16) with a `line` top rule and `pt-4`.
- Feed rows: `py-6` (24) < 768, `py-7` (28) ≥ 768.

### 2.4 Container and grid

- `Container`: `max-width: 90rem` (1440), `padding-inline: var(--gutter)`. Content width at 1440 =
  **1376 px**; at 390 = **358 px**.
- Grid: 12 columns, `gap 24px` at ≥ 768; 4 columns, `gap 16px` below. At 1376 px a column is
  92.67 px; spans: 5 = 559 · 6 = 676 · 7 = 793 · 8 = 909 · 9 = 1026 · 12 = 1376.
- Full-bleed (`bleed` utility): `margin-inline: calc(50% - 50vw)` on an element inside `Container`;
  the parent `<section>` gets `overflow-x: clip` so the half-scrollbar overshoot on Windows never
  creates horizontal scroll. Do **not** use `w-screen`.
- `GridOverlay`: 12 `line`-coloured column edges at `--color-grid`, `position: fixed`, `lg:` only,
  behind everything. It is the only background ornament.

### 2.5 Tailwind v4 `@theme` block (paste over the current one in `src/app/globals.css`)

```css
@theme {
  --color-*: initial;
  --color-bg: #0a0a0b;
  --color-surface-1: #0f0f11;
  --color-surface-2: #141417;
  --color-surface-3: #1a1a1e;
  --color-line: rgb(255 255 255 / 0.08);
  --color-line-strong: rgb(255 255 255 / 0.14);
  --color-grid: rgb(255 255 255 / 0.03);
  --color-fg: #f2f2f3;
  --color-fg-muted: #a3a3ab;
  --color-fg-subtle: #7a7a83; /* decorative / aria-hidden only */
  --color-accent: #ff5b24;
  --color-accent-fg: #0a0a0b;
  --color-white: #ffffff;
  --color-transparent: transparent;
  --color-current: currentColor;

  /* Status colours: 6px dots only, never text. */
  --color-status-prototype: #8d9ccc;
  --color-status-in-development: #e0a458;
  --color-status-released: #7fb58a;
  --color-status-on-hold: #a1a1a8;
  --color-status-archived: #6e6e76;

  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, "SFMono-Regular", monospace;

  --radius-xs: 2px; /* the only radius on the site */

  --ease-out: cubic-bezier(0.2, 0.7, 0.2, 1);

  --breakpoint-xs: 30rem;
  --container-page: 90rem; /* 1440px */
  --container-prose: 42rem; /* 672px, post bodies */

  /* Display scale: Geist Sans 500, sentence case, tight. */
  --text-display-2xl: clamp(2.25rem, 4.45vw, 4rem); /* 36 → 64px, home H1 */
  --text-display-2xl--line-height: 1.02;
  --text-display-2xl--letter-spacing: -0.03em;
  --text-display-2xl--font-weight: 500;
  --text-display-xl: clamp(2rem, 3.6vw, 3.25rem); /* 32 → 52px, inner-page H1, 404 */
  --text-display-xl--line-height: 1.04;
  --text-display-xl--letter-spacing: -0.03em;
  --text-display-xl--font-weight: 500;
  --text-display-lg: clamp(1.625rem, 2.4vw, 2.25rem); /* 26 → 36px, section H2, footer line, menu */
  --text-display-lg--line-height: 1.08;
  --text-display-lg--letter-spacing: -0.025em;
  --text-display-lg--font-weight: 500;
  --text-display-md: 1.75rem; /* 28px, lead card title */
  --text-display-md--line-height: 1.12;
  --text-display-md--letter-spacing: -0.02em;
  --text-display-md--font-weight: 500;
  --text-display-sm: 1.375rem; /* 22px, card title */
  --text-display-sm--line-height: 1.15;
  --text-display-sm--letter-spacing: -0.02em;
  --text-display-sm--font-weight: 500;
  --text-title: 1.25rem; /* 20px, feed/timeline row title */
  --text-title--line-height: 1.2;
  --text-title--letter-spacing: -0.02em;
  --text-title--font-weight: 500;

  /* Text scale. */
  --text-body-lg: 1.0625rem; /* 17px: hero intro, project summary, post prose */
  --text-body-lg--line-height: 1.55;
  --text-body: 0.9375rem; /* 15px: taglines, excerpts, footer links */
  --text-body--line-height: 1.6;
  --text-ui: 0.875rem; /* 14px: nav, buttons, spec-sheet values */
  --text-ui--line-height: 1.2;
  --text-ui--letter-spacing: -0.01em;
  --text-ui--font-weight: 500;
  --text-label: 0.6875rem; /* 11px mono uppercase */
  --text-label--line-height: 1.2;
  --text-label--letter-spacing: 0.08em;
  --text-meta: 0.75rem; /* 12px mono, dates and dimensions, not uppercase */
  --text-meta--line-height: 1.4;
  --text-meta--letter-spacing: 0.02em;
  --text-readout: 1.75rem; /* 28px mono numerals; 32px from md via .readout */
  --text-readout--line-height: 1;
  --text-readout--letter-spacing: -0.01em;
  --text-readout--font-weight: 500;
}
```

Utilities to add alongside (exact CSS in §4.6 and §7): `label`, `meta`, `readout`, `headline`,
`rule-caps`, `bleed`, `led`, `led-live`, `flip`, `px-gutter`, `hairline`. Delete `serif-accent` and
the `& em` block inside `headline`.

---

## 3. Typography

### 3.1 Packages and files

| Package        | Import            | File actually shipped                                               | Size    | Axes           |
| -------------- | ----------------- | ------------------------------------------------------------------- | ------- | -------------- |
| `geist@^1.7.2` | `geist/font/sans` | `node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2`     | ≈ 70 KB | `wght` 100–900 |
| `geist@^1.7.2` | `geist/font/mono` | `node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2` | ≈ 71 KB | `wght` 100–900 |

Both imports call `next/font/local` internally: self-hosted from `/_next/static/media`, preloaded,
`font-display: swap`, size-adjusted Arial fallback → zero CLS. Two requests, ≈ 141 KB total, no
italics, no static cuts. **Remove** `@fontsource/instrument-serif` from `package.json` and delete
`src/app/fonts/instrument-serif-italic.woff2`; `src/app/fonts.ts` exports only `geistSans`,
`geistMono` and `fontVariables`. No other family may be added (the `.numeral` serif idea is
rejected: a fourth face for numerals is print vocabulary).

### 3.2 Roles

- **Geist Sans** — display, titles, body, UI (nav, buttons, spec-sheet values).
- **Geist Mono** — labels, readouts, meta (dates, dimensions, counts, indices), the footer system
  line, code.

Nothing on the site is bolder than 500. Contrast comes from size and tone, never weight. No italics
anywhere. Uppercase exists only in the 11 px mono `label` style.

### 3.3 Size table

| Role / class       | Family | Size                                  | Weight | Line-height | Tracking | Case       | Where                                                            |
| ------------------ | ------ | ------------------------------------- | ------ | ----------- | -------- | ---------- | ---------------------------------------------------------------- |
| `text-display-2xl` | Sans   | clamp(2.25rem, 4.45vw, 4rem) 36→64    | 500    | 1.02        | −0.03em  | Sentence   | Home H1 (spans cols 1–12; 2 lines at 1440, 5 at 390)             |
| `text-display-xl`  | Sans   | clamp(2rem, 3.6vw, 3.25rem) 32→52     | 500    | 1.04        | −0.03em  | Sentence   | Project / post / about H1, 404                                   |
| `text-display-lg`  | Sans   | clamp(1.625rem, 2.4vw, 2.25rem) 26→36 | 500    | 1.08        | −0.025em | Sentence   | Section H2, footer line, mobile menu links                       |
| `text-display-md`  | Sans   | 28px                                  | 500    | 1.12        | −0.02em  | Sentence   | Lead card title                                                  |
| `text-display-sm`  | Sans   | 22px                                  | 500    | 1.15        | −0.02em  | Sentence   | Default card title                                               |
| `text-title`       | Sans   | 20px                                  | 500    | 1.2         | −0.02em  | Sentence   | Feed / timeline row title                                        |
| `text-body-lg`     | Sans   | 17px                                  | 400    | 1.55        | 0        | —          | Hero intro (max 44ch), summaries, post prose (max 68ch, lh 1.65) |
| `text-body`        | Sans   | 15px                                  | 400    | 1.6         | 0        | —          | Taglines, excerpts, footer links, spec-sheet values              |
| `text-ui`          | Sans   | 14px (13px in `sm` buttons)           | 500    | 1.2         | −0.01em  | —          | Nav, buttons, TextLink                                           |
| `label`            | Mono   | 11px                                  | 400    | 1.2         | +0.08em  | UPPERCASE  | Rails, eyebrows, tags, tech lists, indices, system line          |
| `meta`             | Mono   | 12px                                  | 400    | 1.4         | +0.02em  | as written | Dates `2026.09.19`, dimensions, timecode                         |
| `readout`          | Mono   | 28px (32px ≥ md)                      | 500    | 1           | −0.01em  | as written | Stats cluster numerals                                           |

Measured with the real font: the home H1 copy (88 characters) sets **2 lines at 64 px across the
full 1376 px container** (`text-wrap: balance` gives two ≈1250 px lines) and 5 lines at 36 px across
358 px. Do not add a `max-width` in `ch` to the home H1 — it must span the container to stay on
two lines. Inner-page H1s take `max-width: 22ch`.

### 3.4 How headlines are set

- Sentence case, one sentence, ends with a full stop. Never uppercase, never a word in a second
  family, never italic.
- **Two-tone emphasis.** `site.headline` and the other two-tone strings keep the `*…*` markup;
  `Emphasis` renders the starred segment as `<span class="text-fg-muted">` (tonal, not typographic).
  Used in exactly three places, where the coda is a genuine second beat: the home H1
  ("… for the web — _and document every step._"), the footer line ("Let's build something — _or
  just talk shop._") and the 404 ("Out of bounds. _This level isn't built yet._"). Section H2s are
  single-tone: "Projects, built in the open." / "Every step, logged." Do not grey the last word
  of a title mechanically.
- Section titles are `display-lg`, `max-width: 26ch`.
- Numbers in sans contexts read naturally ("7 updates", "19 Sept 2026"). Numbers in mono contexts
  are zero-padded to the width of their set (`01`/`03`, `007`/`015`) and dates are `YYYY.MM.DD`
  (`2026.09.19`) or `YYYY.MM` (`2025.12`). Add `pad(n, width)`, `formatDateMono`, `formatMonthMono`
  and `formatRatio(w, h)` to `src/lib/format.ts`. `formatRatio` snaps to `16:9`, `16:10`, `4:3`,
  `3:2`, `21:9`, `2:1`, `1:1` when within ±0.5 % and otherwise prints `2.33:1`.

### 3.5 OpenType

Verified against the shipped GSUB tables (`ss01`–`ss11`, `tnum`, `pnum`, `case`, `dlig`, `frac`
exist; **`cv11` does not** — the current `"ss01","cv11"` setting is a no-op and is removed).

- Sans display and body: `font-feature-settings: normal`. Geist's default double-storey `a` is
  right for an instrument; `ss02` (single-storey `a`) and `ss10` (angled brackets) are **not** used.
  `text-wrap: balance` on `h1–h3`, `text-wrap: pretty` on `p`.
- `label` (mono uppercase): `font-feature-settings: "case"` so dashes, parentheses and brackets sit
  at cap height (`01 — SELECTED WORK (03)`), plus `font-variant-numeric: tabular-nums`.
- `meta`, `readout`: `font-variant-numeric: tabular-nums`. Geist Mono's zero is slashed and its
  digits are tabular by construction; no further features.
- Any numeral in sans that sits in a column (spec-sheet values): `tabular-nums`.

---

## 4. Materials

### 4.1 Surfaces

Matte only. Every surface is a flat fill from the four-step scale (`bg`, `surface-1/2/3`). No
gradients of any kind (not even a text underline gradient), no noise, no grain, no vignette, no
backdrop blur, no box-shadow, no outer or inner glow, no glass. The header is opaque `bg`.

### 4.2 Lines

The 1 px line is the only "material". `line` (8 %) for separators, frame rings and the stats cross;
`line-strong` (14 %) for section rails, full-bleed rules and control rings. Lines are always exactly
1 px (never 0.5 px, never 2 px).

### 4.3 Rail caps (the one drawn mark)

`rule-caps` draws a 1 px `line-strong` rule with a 1 × 6 px cap hanging from each end (like a ruler
end). It appears on: the hero rail, the two section rails, the footer's top rule, and the readout
bar's bottom rule. It appears **nowhere else** — never on cards, thumbnails, tags, buttons, nav or
lists, and never over an image. There are no L-shaped corner brackets on media anywhere.

### 4.4 Media frames

`MediaFrame` is the one way to show an image or clip.

- In-gutter frames: `overflow: hidden`, `background: surface-1`, `box-shadow: inset 0 0 0 1px
var(--color-line)` (inset ring; steps to `line-strong` when the parent card is hovered). Radius 0.
- Full-bleed frames (`bleed`): no side ring; 1 px `line-strong` rule on top and bottom; radius 0.
- Image treatment: **none**. `object-fit: cover`, AVIF/WebP via `next/image`, blur placeholder from
  `media.blurDataUrl`, no tint, no overlay, no vignette, no grain, no transform on hover or reveal.
- Empty state: `surface-1` fill with the `label` `NO MEDIA` centred in `fg-subtle` (decorative).
- Readout bar (see §5.8): the frame's caption and controls live under it, never on it.

### 4.5 Radii per element

| Element                                                                                         | Radius |
| ----------------------------------------------------------------------------------------------- | ------ |
| Media frames, thumbnails, cards, stats cells, header, menu sheet, dialog scrim, feed hover tray | 0      |
| Buttons, tags, kbd, inputs, dialog panel, focus-ring corners                                    | 2 px   |
| Status dots (6 px), showcase/devlog markers                                                     | 50 %   |
| LEDs (6 px squares), release/milestone/origin markers                                           | 0      |

### 4.6 Utility CSS (add to `globals.css`)

```css
@utility headline {
  font-family: var(--font-sans);
  font-weight: 500;
  text-wrap: balance;
}
@utility label {
  font-family: var(--font-mono);
  font-size: var(--text-label);
  line-height: var(--text-label--line-height);
  letter-spacing: var(--text-label--letter-spacing);
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "case";
}
@utility meta {
  font-family: var(--font-mono);
  font-size: var(--text-meta);
  line-height: var(--text-meta--line-height);
  letter-spacing: var(--text-meta--letter-spacing);
  font-variant-numeric: tabular-nums;
}
@utility readout {
  font-family: var(--font-mono);
  font-size: var(--text-readout);
  line-height: 1;
  letter-spacing: var(--text-readout--letter-spacing);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  @media (min-width: 48rem) {
    font-size: 2rem;
  }
}
@utility rule-caps {
  position: relative;
  height: 1px;
  background: var(--color-line-strong);
  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    width: 1px;
    height: 6px;
    background: var(--color-line-strong);
  }
  &::before {
    left: 0;
  }
  &::after {
    right: 0;
  }
}
@utility bleed {
  margin-inline: calc(50% - 50vw);
}
@utility led {
  display: inline-block;
  width: 6px;
  height: 6px;
  flex: none;
  background: var(--color-accent);
}
@utility led-live {
  animation: led 2s steps(1, end) infinite;
}
@keyframes led {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}
/* Card index → VIEW flip: two stacked lines in a 1.2em window. */
@utility flip {
  position: relative;
  height: 1.2em;
  overflow: hidden;
  & > span {
    display: block;
    transition: transform 240ms var(--ease-out);
  }
  .group:hover & > span,
  .group:focus-within & > span {
    transform: translateY(-100%);
  }
}
@utility px-gutter {
  padding-inline: var(--gutter);
}
@utility hairline {
  border-color: var(--color-line);
}
```

---

## 5. Components

Conventions for every component: Tailwind classes; colours only via tokens; hover transitions
150 ms `ease-out` on colour/border only; focus-visible = global 2 px accent outline, 2 px offset,
2 px corners; all tap targets ≥ 44 × 44 px on touch; hover-only affordances have a visible resting
state under `@media (hover: none)`.

### 5.1 `SiteHeader`

- `position: sticky; top: 0; z-index: 50; background: bg; border-bottom: 1px solid line`. Height
  `--header-h` (56 / 64). Opaque — no blur, no transparency, no scroll state. `html { scroll-padding-top: calc(var(--header-h) + 1rem) }`.
- Layout: `Container` flex, `justify-between`, `items-center`.
- **Left — wordmark** (`<Link href="/">`, `aria-label="{site.name} — home"`): `led` (6 px accent
  square, static) · gap 10 px · `site.name` in `text-ui` (14 px 500) `fg` · then `/ SOLO GAME DEV`
  in `label fg-muted` with 10 px gap, hidden below `lg`. The LED does not scale on hover; the name
  goes `fg → fg` (no change) — the wordmark has no hover effect.
- **Right (≥ md)** — `<nav aria-label="Main">` with `NavLinks`, then 24 px gap, then `Contact`
  (`ButtonLink` secondary `sm`, `mailto:site.email`).
- `NavLinks`: `<ul>` flex, gap 24 px. Each link: `text-ui`, height `--header-h` (full height, flex
  centre) so its underline sits on the header rule; rest `fg-muted`, hover `fg` (150 ms); active
  (`aria-current="page"`) `fg` + `after:` 1 px accent bar, `inset-x-0`, `bottom: -1px` (exactly on the
  border). No pills, no fills.
- **Mobile (< md)**: wordmark (LED + full `site.name`; fall back to `site.shortName` only if the
  name is > 16 characters) and the `MobileNav` toggle: 40 × 40 button, icon 18 px, `sr-only`
  "Open menu" / "Close menu" (tests depend on these names), `-mr-2`.

### 5.2 `MobileNav`

- Keep the existing logic (portal to `document.body`, `aria-expanded`, `aria-controls`, Escape
  closes and refocuses the toggle, close on route change, `<nav aria-label="Mobile">`, focus the
  first link on open, scroll lock).
- Panel: `fixed inset-x-0 top-(--header-h) bottom-0 z-40 bg-bg`, opens with opacity 0 → 1 in
  150 ms (`data-open`), no slide; under reduced motion it appears instantly.
- List: `<ul class="divide-y divide-line border-b border-line">`; each link `flex justify-between
items-center py-5 text-display-lg` (36 px), active `fg`, others `fg-muted`; right side the index
  `01` / `02` / `03` in `label fg-subtle` `aria-hidden`. No pills, no icons.
- Bottom block (pinned with `justify-between`): `site.email` in `font-mono text-[13px] fg-muted`,
  then a row of external links (`label`, `GITHUB ↗ · YOUTUBE ↗ · BLUESKY ↗`), then the system line
  (§5.13) in `label fg-muted` between two `line` rules.

### 5.3 `Button` / `ButtonLink`

Base: `inline-flex items-center justify-center gap-2.5 rounded-xs text-ui whitespace-nowrap
transition-[background-color,border-color,color] duration-150 ease-out active:translate-y-px
disabled:opacity-40 disabled:pointer-events-none`. Remove `active:scale`, remove the `accent`
variant, remove `rounded-full`.

| Variant     | Rest                                                                                    | Hover                         | Pressed          |
| ----------- | --------------------------------------------------------------------------------------- | ----------------------------- | ---------------- |
| `primary`   | `bg-fg text-bg` + **power LED**: 6 px accent square before the label (`led`, gap 10 px) | `bg-white`                    | `translate-y-px` |
| `secondary` | `text-fg ring-1 ring-inset ring-line-strong`                                            | `bg-surface-2 ring-fg-subtle` | `bg-surface-3`   |
| `ghost`     | `text-fg-muted`                                                                         | `text-fg bg-surface-2`        | `bg-surface-3`   |

| Size | Height | Padding-x | Font  | Use                                    |
| ---- | ------ | --------- | ----- | -------------------------------------- |
| `sm` | 32 px  | 12 px     | 13 px | Header `Contact`, inline actions       |
| `md` | 40 px  | 16 px     | 14 px | Default, forms, "Load older"           |
| `lg` | 44 px  | 20 px     | 15 px | Hero CTAs (48 px and `w-full` on < md) |

Trailing icon (`ArrowRight` 16 px) nudges `translate-x-0.5` on hover (150 ms). The LED never blinks
inside a button. Focus = global ring.

### 5.4 `Eyebrow` and labels

- `Eyebrow` = `<p class="label text-fg-muted">` with an optional `index` prop rendered first in
  `fg` (`<span class="text-fg">01</span> — SELECTED WORK`). **No accent dot.** Used by `SectionRail`,
  the hero rail, inner-page headers and the 404.
- Label strings are terse and real: `SOLO GAME DEVELOPER · STOCKHOLM, SWEDEN`, `03 ITEMS`,
  `LOG 015–010 · 6 OF 15`, `ERROR 404`. Separator between facts is `·` (middle dot with single
  spaces); between number and name is `—`.

### 5.5 `SectionRail` (replaces `SectionHeading`)

```
<div data-reveal>                                   ← Reveal wrapper (draws the rule)
  <div class="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 pb-3">
    <Eyebrow index="01">SELECTED WORK</Eyebrow>       ← left
    <div class="flex items-center gap-6">              ← right: count + action
      <span class="label text-fg-muted">03 ITEMS</span>
      <TextLink href="/projects">All projects</TextLink>
    </div>
  </div>
  <div class="rule-caps" />
</div>
<h2 id=… class="mt-8 headline text-display-lg max-w-[26ch]">Projects, built in the open.</h2>
```

- Props: `index`, `label`, `count` (string, already formatted), `action`, `title`, `id`, `as`
  (`h1|h2`), `size` (`lg|xl`). The count is always computed from data.
- Reveal: the rule scales from `scaleX(0)` to `1` from the left in 600 ms; the caps fade in over
  240 ms with a 200 ms delay; the label row rises 8 px / fades in 500 ms.
- Mobile: label row wraps (count under the label if needed); title `mt-6`.

### 5.6 `TextLink`

`inline-flex items-center gap-1.5 text-ui text-fg-muted hover:text-fg` (150 ms) + `ArrowRight` 14 px
that nudges 2 px on hover. Arrow semantics site-wide: `→` = in-site navigation, `↗` = leaves the
site (external, mailto). The arrow never turns accent.

### 5.7 `Tag` / `TagList`

`inline-flex h-[22px] items-center rounded-xs bg-surface-2 px-2 label text-fg-muted` (uppercase
11 px mono). No ring, no hover. `TagList` shows `max` tags then `+N` in `fg-muted`. `aria-label="Tech"`.
Used on the projects index, project page and post page — not on home cards (they use the inline
mono tech line, §5.9).

### 5.8 `StatusBadge`

Two variants. `default`: 6 px round status dot + label text in `text-[13px] text-fg-muted`
("In development"). `mono`: 6 px dot + `label fg-muted` (`IN DEVELOPMENT`), used inside mono rows
(card meta, spec sheets). Dots are round (status), LEDs are square (accent) — never mix.

### 5.9 `MediaFrame`

Props: `media`, `ratio` (default `16/9`), `sizes` (**required**, exact per placement), `priority`,
`ambient`, `bleed?: boolean`, `readout?: { left: ReactNode; right?: ReactNode }`,
`frame?: number | string` (prefixes the readout with `FRAME 01 — `), `className`, `imgClassName`
(no transforms allowed), `videoRef` (forwarded for the showreel timecode).

- Frame: `relative aspect-(--ratio) overflow-hidden bg-surface-1` + (`bleed` ? `border-y
border-line-strong` : inset ring `line`, `group-hover:` `line-strong`). No radius, no
  `[&>img]:rounded`.
- Readout bar (rendered when `readout` is given): directly under the frame, inside the container
  (for `bleed` frames the bar is _not_ bled — it sits on the grid): `flex items-center
justify-between gap-6 py-3 meta text-fg-muted` + `rule-caps` beneath (`line`, caps 6 px). Left
  cell truncates (`truncate`); right cell `shrink-0`, hidden below `md` when the left cell needs
  the room (`hidden md:block`). When the left cell is interactive (showreel play), it is a
  `<button>` spanning the bar height (≥ 40 px tap target).
- Dimensions readout: `${width}×${height} · ${formatRatio(width, height)}` from `MediaAsset`;
  omitted when width/height are null.
- Video: `LazyVideo` unchanged in principle: source attached near viewport; `ambient` plays muted
  loop when ≥ 50 % in view and pauses when < 50 % (add a second observer with `threshold: 0.5`);
  never autoplays under reduced motion or below `md`; `preload="none"`. Non-ambient videos show
  the poster and native controls.
- `<noscript>`: a plain `<video controls preload="none" poster src>` so clips play without JS.

### 5.10 `ProjectCard` (feature + default)

Whole card is one link (keep `after:absolute after:inset-0` on the title link; `focus-visible:after:`
2 px accent outline, offset 4 px, square). `article.group.relative`. **No hover zoom, no arrow
circle, no translate on the media. Ever.**

**Feature (lead) — spans 12 cols:**

```
MediaFrame  ratio 4/3 (xs) → sm:16/9 → lg:2/1, sizes "(min-width: 1440px) 1376px, 100vw", priority
<div class="mt-4 grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-line pt-4 md:grid-cols-12 md:gap-x-6">
  col 1        : <span aria-hidden class="flip label text-fg-subtle"><span>01</span><span class="text-fg">VIEW →</span></span>
  cols 2–7     : <h3 class="headline text-display-md"><Link>Hollowdeep</Link></h3>
                 <p class="mt-1.5 text-body text-fg-muted max-w-[44ch]">A quiet descent into a cave system that remembers you.</p>
  cols 8–10    : <p class="label text-fg-muted pt-1.5">UNREAL ENGINE 5 · C++ · LUMEN +1</p>    (first 3 tech, then +N)
  cols 11–12   : <div class="md:text-right"><StatusBadge variant="mono"/><p class="label text-fg-muted mt-2">007 UPD</p></div>
</div>
```

**Default — spans 6 cols (home) / index grid:**

```
MediaFrame  ratio 4/3 (xs) → md:16/10, sizes "(min-width: 1440px) 676px, (min-width: 768px) 50vw, 100vw"
<div class="mt-4 grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-line pt-4">
  col 1 : flip index (as above)
  col 2 : <h3 class="headline text-display-sm"><Link>Tiny Orbit</Link></h3>
          <p class="mt-1.5 text-body text-fg-muted">A one-button gravity game you can finish on a coffee break.</p>
          <p class="mt-3 label text-fg-muted truncate">● RELEASED · TYPESCRIPT · 005 UPD</p>   (dot = 6px status dot)
</div>
```

States: **hover** — frame ring `line → line-strong` (150 ms), index flips to `VIEW →` (240 ms);
title colour unchanged; nothing else moves. **Focus-within** — same as hover plus the focus ring.
**Touch** (`hover: none`) — the flip slot shows the index only (no hidden affordance is needed; the
whole card is obviously a link). Mobile: lead media 16:9, default 4:3; meta rows as the default
layout (index + title / tagline / one mono status line, truncated).

`sizes` must be exact per column; a card placed in a different column width gets its own string.

### 5.11 `LatestFeed` — the log

Section rail: `02 — DEVLOG` · right `LOG 015–010 · 6 OF 15` (indices are `total − position`;
add `countPublicPosts(db)` to `src/lib/projects/queries.ts`). Title: "Every step, logged."

```
<ol class="border-y border-line-strong">
  <li class="group relative grid grid-cols-[1.5rem_1fr_5rem] gap-x-4 py-6 border-b border-line last:border-b-0
             transition-colors duration-150 hover:bg-surface-1
             md:grid-cols-[1.5rem_3rem_8.5rem_1fr_11rem] md:gap-x-6 md:py-7">
    rail segment : li::before — absolute, left 11px, top 0, bottom 0, width 1px, bg line (the marker rail)
    col 1        : <TimelineMarker type … class="relative mt-0.5"/>  (24px slot centred on the rail; hollow shapes use bg-bg group-hover:bg-surface-1)
    col 2 (md+)  : <span aria-hidden class="label text-fg-subtle pt-1">015</span>
    col 3 (md+)  : <time class="meta text-fg-muted">2026.09.19</time>
                   <p class="label text-fg-muted mt-1.5">MILESTONE</p>
    col 4        : <p class="label text-fg-muted">HOLLOWDEEP</p>            (md+; on mobile this line is `015 · 2026.09.19 · HOLLOWDEEP`)
                   <h3 class="mt-1.5 headline text-title"><Link>The Steam page is live</Link> <ArrowRight 14 (slides in on hover)/></h3>
                   <p class="mt-2 text-body text-fg-muted line-clamp-2 max-w-2xl">excerpt</p>
    col 5        : <MediaFrame ratio 4/3 sizes "(min-width: 768px) 11rem, 5rem"/>   (no hover motion)
  </li>
</ol>
```

- Hover: the row lifts to `surface-1` (150 ms) and the title arrow slides in 4 px (150 ms). No
  underline, no thumbnail motion, no colour change on the title.
- Rail draw (progressive enhancement, CSS only, no JS fallback): inside `@supports
(animation-timeline: view())` and `(prefers-reduced-motion: no-preference)`, `li::before` animates
  `scaleY(0 → 1)` from the top with `animation-timeline: view(); animation-range: entry 0% entry
50%`. Elsewhere the rail is simply drawn.
- Mobile: rail + marker at the left, body, 5 rem thumbnail right; the first body line is one mono
  string `015 · 2026.09.19 · HOLLOWDEEP` (type is encoded by the marker shape); title 20 px;
  excerpt clamp-2.
- Empty: `<p class="py-10 text-fg-muted">No updates yet.</p>`.
- Keep `<ol>/<li>` (`#latest` list items are counted in e2e).

### 5.12 `TimelineMarker` and the timeline rail

Shapes (unchanged, all in a 24 px slot, centred on the rail): **release** 14 px filled accent
diamond · **milestone** 12 px accent-outlined diamond (1.5 px) · **showcase** 10 px filled `fg-muted`
circle · **devlog** 10 px `fg-subtle`-outlined circle · **origin** 16 px accent-outlined square with a
6 px accent square inside. Hollow shapes fill with the row's background (`bg-bg`, `group-hover:bg-surface-1`)
so the rail is interrupted by the marker.

The **project-page timeline rail** (future) reuses the log row: grid `[1.5rem_1fr]` on mobile and
`[8.5rem_1.5rem_1fr_11rem]` on md+ (date column _left_ of the rail; `DAY 214` from `dayNumber()`
under the date in `label`); entries `py-8 md:py-10`; **pinned** slot above the list under a
`PINNED` label with its own short rail; **gap row** "`04 OLDER UPDATES`" + `Load older` secondary `md`
button, where the rail segment is `1px dashed line`; **origin** anchored at the bottom with the
origin marker and the label `PROJECT STARTED · 2025.12.02 · DAY 1`, never duplicated into the
pinned slot. The rail is one continuous line from the newest entry to the origin.

### 5.13 Showreel slot — `HeroShowreel`

Client component owning the `<video>` ref. Server passes `media` (from `site.showreel`) or
`fallback` (`MediaAsset` of the newest post cover) plus `fallbackLabel`
(`POSTER · HOLLOWDEEP / SHOWCASE: THE SUNKEN CHAPEL` — the project and post the cover belongs to).

- Frame: `MediaFrame bleed`, `ratio 16/9` → `lg:21/9`, `priority`, `sizes="100vw"`,
  `fetchPriority="high"`; poster ≤ 2560 px AVIF. This is the LCP element on every device.
- Readout bar left cell (a `<button>` when a video exists): `Play` glyph 10 px · `SHOWREEL` ·
  ` · 00:12 / 01:24` in `meta` tabular. Before metadata: `SHOWREEL · 01:24` from
  `site.showreel.duration` (owner-entered, real); after `loadedmetadata` the live duration replaces
  it; `timeupdate` drives the elapsed value while playing; the digits are `accent` **only while
  `!paused`**, `fg-muted` otherwise. Reserve `min-width: 14ch` so nothing shifts.
- Right cell: `1920×1080 · 16:9` from `site.showreel.width/height` (or the poster asset).
- Empty state (no `src`): left `SHOWREEL — IN PRODUCTION · POSTER: HOLLOWDEEP / SHOWCASE: THE
SUNKEN CHAPEL` (truncates), right `2560×1097 · 21:9` from the poster asset. Never the words
  "coming soon".
- Ambient loop: only when `src` exists, `site.showreel.ambient !== false`, viewport ≥ md, no
  reduced motion, ≥ 50 % in view. Otherwise poster only.
- Full player: pressing the left cell opens a native `<dialog>`: scrim `bg/0.92` (opaque, no blur),
  panel `surface-1`, `rounded-xs`, 1 px `line-strong` ring, video 16:9 `max-width: 1200px` with
  native controls and sound, `Escape`/backdrop closes, focus returns to the button. No play control
  is drawn over the image, on any device.
- Delete `src/components/home/showreel.tsx` and its pill.

### 5.14 `SiteFooter`

```
<footer class="mt-24 md:mt-40">
  <Container>
    <div class="rule-caps"/>
    <div class="grid gap-12 pt-12 pb-12 md:grid-cols-12 md:pt-16 md:pb-16">
      cols 1–7 : <p class="headline text-display-lg"><Emphasis text="Let's build something — *or just talk shop.*"/></p>
                 <a href="mailto:…" class="mt-6 inline-flex items-center gap-2 font-mono text-[15px] text-fg-muted hover:text-fg">hello@example.com <ArrowUpRight 14/></a>
                 (+ `Download CV` secondary sm with ArrowUpRight when site.cvUrl)
      cols 9–12: two lists, headers `SITE` / `ELSEWHERE` in label fg-muted; links text-body fg-muted → fg (150ms); externals carry ↗ 12px and the sr-only "(opens in a new tab)"
    </div>
    <div class="grid gap-2 border-y border-line py-4 label text-fg-muted sm:grid-cols-3">
      © 2026 YOUR NAME   |   STOCKHOLM, SWEDEN (centre)   |   LAST LOG 2026.09.19 → (right; links to the newest public post; omitted when none)
    </div>
  </Container>
</footer>
```

The system line is the only place the footer uses mono; it contains three true facts. No clock, no
coordinates, no SHA, no colophon.

### 5.15 404 (`not-found.tsx`)

`Container`, `min-h-[60vh] py-24`, `flex-col justify-center gap-8`: `Eyebrow` `ERROR 404` →
`h1.headline.text-display-xl.max-w-[22ch]` with `Emphasis text="Out of bounds. *This level isn't
built yet.*"` → `p.text-body-lg.text-fg-muted.max-w-md` "The link may have fallen through the
floor." → `ButtonLink secondary md` "Back to spawn" with `ArrowRight`. Heading must keep the words
"Out of bounds" (e2e).

---

## 6. Pages

### 6.1 Home — section by section

Order: header → **Hero** (rail · H1 · showreel · readout · brief row) → **01 Selected work** →
**02 Devlog** → footer (rail 03). The hero has no `Reveal`; everything below the showreel's readout
bar may reveal.

**Hero — 1440 (container 1376, 12 cols).**

| Row | Content                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Vertical                           |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| A   | Hero rail: left `Eyebrow` `SOLO GAME DEVELOPER · STOCKHOLM, SWEDEN` (`site.role`, `site.location`); right `led led-live` + `label` `OPEN TO COLLABORATIONS` (`site.availability`, whole row hidden when empty); `rule-caps` below                                                                                                                                                                                                                                                            | `pt-12` (48), labels, `pb-3`, rule |
| B   | `h1#hero-title.headline.text-display-2xl` spanning cols 1–12, two-tone via `Emphasis` — 2 lines at 64 px (≈ 131 px tall)                                                                                                                                                                                                                                                                                                                                                                     | `mt-8` (32)                        |
| C   | Showreel `MediaFrame bleed` 21:9 (617 px tall at 1440) → readout bar (`py-3` + rule)                                                                                                                                                                                                                                                                                                                                                                                                         | `mt-10` (40)                       |
| D   | **Brief row**, `grid md:grid-cols-12 gap-x-6`: cols 1–5 intro `text-body-lg text-fg-muted max-w-[44ch]` + CTAs `mt-6` (`View projects →` primary `lg`, `Read the devlog` secondary `lg`, gap 12); cols 7–12 **stats cluster** (`<dl>` 2 × 2, hairline cross: cells `pb-4 pr-6` / `pb-4 pl-6 border-l` / `pt-4 pr-6` / `pt-4 pl-6 border-l`, first row `border-b`; `dt` = `label fg-muted`, `dd` = `readout` `mt-2`): `PROJECTS 03` · `UPDATES 015` · `SINCE 2025.12` · `LAST LOG 2026.09.19` | `mt-10` (40)                       |

Fold check at 1440 × 900: showreel top edge at ≈ 341 px (64 header + 48 + 26 rail + 32 + 131 H1 +
40), so ≈ 554 px (90 %) of the frame is above the fold together with the whole H1. The e2e
`screens` suite adds a viewport-only `home-fold-1440.png` to keep this true.

Stats are real and computed on the server: `PROJECTS` = count of all projects, `UPDATES` = count
of public posts (padded to 3), `SINCE` = earliest `projects.startedAt` (`formatMonthMono`),
`LAST LOG` = newest public `publishedAt` (`formatDateMono`). No count-up.

**Hero — 390 (container 358, 4 cols).** `pt-8` (32); rail row wraps (`flex-wrap`, availability
under the role); rule; H1 `mt-6`, 36 px, 5 lines (≈ 184 px); showreel `mt-8`, edge-to-edge 16:9
(219 px tall, top at ≈ 354 px, fully above the 844 px fold); readout bar keeps only the left cell;
brief: intro `mt-8` 16 px; CTAs `mt-6` stacked `w-full h-12`, primary first; stats cluster `mt-10`
2 × 2 with the same hairline cross (`readout` 28 px).

**01 — Selected work.** `pt-(--space-section)`. `SectionRail index="01" label="SELECTED WORK"
count="03 ITEMS" action=<TextLink href="/projects">All projects</TextLink>` → h2 "Projects, built in
the open." (`id="work-title"`; the e2e locator matches "Projects") → grid `mt-12 grid gap-x-6
gap-y-16 md:grid-cols-12`: lead card `md:col-span-12` (2:1 at lg), then default cards
`md:col-span-6` each (16:10), row gap 64. Full-width `line` rules separate rows (each card's meta row
already has one; the grid stays visible as structure). At 390: single column, gap 56, lead 16:9,
others 4:3. `Reveal` per card, stagger 0 / 60 / 120 ms.

**02 — Devlog.** `pt-(--space-section)`, `id="latest"`, `aria-labelledby="latest-title"`.
`SectionRail index="02" label="DEVLOG" count="LOG 015–010 · 6 OF 15"` → h2 "Every step, logged." →
`LatestFeed` `mt-12` (§5.11), rows revealed with a 60 ms stagger (max three steps, then no delay).

**Footer.** `mt-(--space-section)`; its top `rule-caps` doubles as rail 03 (no label needed).

### 6.2 Projects index (`/projects`)

`Container pt-16 md:pt-24`. `SectionRail as="h1" size="xl" index={undefined} label="PROJECTS"
count="03 ITEMS"` → h1 "Everything I'm building." → grid `mt-12 md:grid-cols-12 gap-x-6 gap-y-16`:
default cards `md:col-span-6` in `sortOrder` (no lead), `TagList` (full tech, `max 4`) under the
mono status line. Optional status filter as `label` links (`ALL · IN DEVELOPMENT · RELEASED …`)
above the grid, active in `fg` with the 1 px accent underline. Mobile single column.

### 6.3 Project page (`/projects/[slug]`)

- Header block: `Eyebrow` `PROJECT 01 OF 03` (index by `sortOrder`) → `h1.text-display-xl` cols 1–8
  `max-w-[22ch]` → tagline `text-title text-fg-muted mt-4` → **spec sheet** `<dl>` cols 10–12
  (`md:col-start-10`), rows separated by `line`, `py-3`, `dt` `label fg-muted` left, `dd` `text-body
fg` right, `tabular-nums`: `STATUS` (StatusBadge mono) · `ENGINE` (`tech[0]`) · `PLATFORMS` ·
  `STARTED 2025.12.02` · `UPDATES 007` · `LINKS` (`Steam ↗ · itch ↗ · GitHub ↗`). This is where the
  spec sheet belongs — every row is real project data.
- Cover: `MediaFrame` in-gutter, `ratio 16/9 lg:2/1`, `priority`, `sizes="(min-width: 1440px)
1376px, 100vw"`, readout `FRAME 01 — HOLLOWDEEP, COVER` / dimensions. `mt-12`.
- Summary (markdown) cols 1–7 `text-body-lg` prose, `TagList` full, Follow button (Phase 4,
  secondary) — `mt-10`.
- Timeline: `SectionRail label="LOG" count="007 UPDATES · 2025.12 → 2026.09"` → the rail list
  (§5.12) with pinned slot, entries, gap row, origin. `pt-(--space-section)`.
- Optional: React `<ViewTransition name={`cover-${slug}`}>` around the card cover and this cover,
  behind `features.viewTransitions` (default off, see §7.6).

### 6.4 Post page (`/projects/[slug]/[post]`)

`Eyebrow` `HOLLOWDEEP · LOG 007 · DAY 214` (project link, index, `dayNumber`) → `h1.text-display-xl
max-w-[22ch]` → meta line `mt-4`: marker + `label` type, `meta` date `2026.09.19`, → cover
`MediaFrame` `mt-10` 16:9 in-gutter with readout `FRAME 01 — <alt>` / dimensions → body in
`max-w-prose` (42 rem) `text-body-lg` lh 1.65, `mt-12`; links underlined 1 px `fg-muted` →
`fg`; in-body images rendered through `MediaFrame` with automatic `FRAME 02 …` numbering in
document order; YouTube directive = `MediaFrame` 16:9 whose readout left cell is the play button
(thumbnail until pressed; the iframe replaces the frame). Prev/next: a two-cell row under a
`rule-caps` with `← NEWER` / `OLDER →` labels and the neighbour titles (`text-title`), markers
included. Subscribe form (Phase 4) as a secondary `md` button + input `h-10 rounded-xs`.

### 6.5 About (`/about`)

`Eyebrow` `ABOUT` → statement `h1.text-display-xl` cols 1–8 (two-tone only if the coda is a real
aside) → prose cols 1–7 → optional portrait `MediaFrame 4/5` cols 9–12 with readout
`PORTRAIT · <year>` → spec sheet cols 10–12 (`BASE`, `FOCUS` = disciplines, `TOOLS`, `AVAILABILITY`
with the LED) → `Download CV` primary `md` (with LED) when `site.cvUrl`, email link mono. No
timeline, no stats.

---

## 7. Motion

### 7.1 Tokens and rules

- Easing: `--ease-out: cubic-bezier(0.2, 0.7, 0.2, 1)` for everything. No bounce, no overshoot.
- Durations, the only four: **150 ms** colour/border/opacity hovers and the row tray · **240 ms**
  the index flip and cap fades · **500 ms** content reveal · **600 ms** rule draw.
- Properties allowed to animate: `opacity`, `transform` (translate ≤ 8 px, `scaleX/Y` of a 1 px
  rule), `background-color`, `border-color`, `color`, `box-shadow` (inset ring colour only).
  **Never** `filter`, `width/height`, `top/left`, or any transform on media.
- No load choreography: the hero renders in its final state so the poster and H1 are LCP-eligible
  and CLS is 0.

### 7.2 Reveal choreography (`<Reveal>` + CSS)

- `Reveal` keeps its single `IntersectionObserver` (`rootMargin: 0px 0px -10% 0px`, unobserve after
  reveal). Hidden state exists only under `.js` (set inline in `layout.tsx`), so content is never
  hidden without JS.
- Content: opacity 0 → 1 and `translateY(8px → 0)` over 500 ms; stagger via `--reveal-delay`
  (0 / 60 / 120 ms, never more than three steps).
- Section rail inside a revealed wrapper: `.rule-caps` `scaleX(0 → 1)` from the left over 600 ms;
  its caps opacity 0 → 1 over 240 ms after 200 ms.
- Print: `@media print { [data-reveal] { opacity: 1; transform: none } }`.

```css
.js [data-reveal]:not([data-revealed]) {
  opacity: 0;
  transform: translateY(8px);
}
.js [data-reveal] {
  transition:
    opacity 500ms var(--ease-out),
    transform 500ms var(--ease-out);
  transition-delay: var(--reveal-delay, 0ms);
}
.js [data-reveal] .rule-caps {
  transform-origin: left;
  transition: transform 600ms var(--ease-out);
}
.js [data-reveal]:not([data-revealed]) .rule-caps {
  transform: scaleX(0);
}
.js [data-reveal] .rule-caps::before,
.js [data-reveal] .rule-caps::after {
  transition: opacity 240ms var(--ease-out) 200ms;
}
.js [data-reveal]:not([data-revealed]) .rule-caps::before,
.js [data-reveal]:not([data-revealed]) .rule-caps::after {
  opacity: 0;
}
```

### 7.3 Self-moving elements (exactly two)

1. Availability LED: `led-live` — opacity 1 / 0.35 on a 2 s `steps(1, end)` loop; a real blink, not
   a ping. One instance on the site (hero rail). Static at full opacity under reduced motion.
2. Showreel ambient loop: plays only when a `src` exists, `site.showreel.ambient !== false`,
   ≥ md, ≥ 50 % in view, and `prefers-reduced-motion: no-preference`; pauses when < 50 % in view.

Nothing else loops, ticks, scrolls or follows the cursor.

### 7.4 Hover behaviours

| Element           | Change                                                   | Duration     |
| ----------------- | -------------------------------------------------------- | ------------ |
| Nav link          | `fg-muted → fg`                                          | 150 ms       |
| Buttons           | fill/ring colour; pressed `translateY(1px)`              | 150 ms       |
| TextLink / arrows | colour + `translateX(2px)`                               | 150 ms       |
| Project card      | frame ring `line → line-strong`; index flips to `VIEW →` | 150 / 240 ms |
| Feed row          | background `→ surface-1`; title arrow slides in 4 px     | 150 ms       |
| Media             | **nothing**                                              | —            |
| Footer links      | `fg-muted → fg`; ↗ nudges 2 px                           | 150 ms       |

### 7.5 Scroll-linked (CSS only)

The devlog rail segment draws with `animation-timeline: view()` inside `@supports` and
`prefers-reduced-motion: no-preference`. No JS fallback, no scroll listeners anywhere on the site.
No parallax, no sticky-shrinking header, no progress bars.

### 7.6 Page transitions

None by default — instant navigation is the instrument's behaviour. A flagged enhancement
(`features.viewTransitions`, default `false`) may wrap card covers and project heroes in React's
`<ViewTransition name={`cover-${slug}`}>` (Next 16 App Router, no config needed) for a 360 ms morph;
never a root cross-fade; `html { background: bg }` stays set so there is no flash; must be verified
in Firefox and Safari 17 before enabling.

### 7.7 Reduced motion and no-JS

- The global `prefers-reduced-motion: reduce` block stays (durations 0.01 ms, single iteration,
  `scroll-behavior: auto`). Additionally under reduced motion: `[data-reveal]` renders visible with
  no transform, rules render fully drawn with caps visible, `led-live` has no animation, the rail
  `animation` is `none`, the ambient loop never starts (poster + readout button open the dialog),
  the index flip swaps instantly, `html { scroll-behavior: auto }`.
- Without JS: nothing is hidden (no `.js` class → no hidden state), the LED blinks (CSS), the
  showreel shows its poster and the `<noscript>` native player, the mobile menu toggle is replaced
  by the footer navigation (the header keeps a plain `<a href="#footer-nav">Menu</a>` inside
  `<noscript>`), `<dialog>` is not used.
- The site must look **identical in layout** with and without motion; motion only changes how
  things arrive.

---

## 8. Signature details

1. **Numbered rails with hanging caps and live counts.** `01 — SELECTED WORK ……… 03 ITEMS`,
   `02 — DEVLOG ……… LOG 015–010 · 6 OF 15`, drawn left-to-right as they enter the viewport.
2. **The caption is the metadata.** Under the showreel: `▶ SHOWREEL · 00:12 / 01:24` on the left,
   `2560×1097 · 21:9` on the right, straight from the asset; the timecode digits turn orange only
   while the footage is actually playing.
3. **A full-bleed showreel between two rules, above the fold on every device,** with nothing drawn
   on it — the first thing a visitor sees is footage, not chrome.
4. **The instrument cluster.** Four hairline-divided cells with a centre cross: 11 px mono labels
   over 32 px tabular numerals, all zero-padded (`03 · 015 · 2025.12 · 2026.09.19`), all computed.
5. **Two-tone sentences.** The hero, footer and 404 land in two beats — statement in `fg`, aside
   in `fg-muted` — using the same face and weight; no second family.
6. **The power LED.** A 6 px orange square inside the primary button and beside the wordmark; the
   hero availability LED is the same square, blinking once every two seconds — the only thing on the
   page that moves by itself.
7. **The devlog is a log.** Descending zero-padded indices, `YYYY.MM.DD` dates and typed markers on
   a 1 px rail that draws itself as you scroll; the same rail runs every project timeline down to the
   `PROJECT STARTED` origin.
8. **Index → `VIEW →`.** On card hover the mono index flips vertically inside a 1ch window; the
   frame ring brightens one step; the image does not move a pixel.
9. **The active-nav underline sits exactly on the header rule,** like a tab on a bezel; the header is
   opaque and never changes state.
10. **The system line.** `© 2026 YOUR NAME · STOCKHOLM, SWEDEN · LAST LOG 2026.09.19 →` between two
    hairlines — three true facts, the last one a link to the newest entry.

---

## 9. Do-not list

Rendering any of these is a defect, not a taste call.

- No glow, neon, drop shadow, outer or inner shadow, `backdrop-filter`, glassmorphism, grain/noise
  overlay, vignette, gradient (including gradient text and gradient underlines) or "ambient light"
  behind media.
- No scanlines, hex grids, matrix/code rain, HUD crosshairs, corner brackets on images, animated
  brackets, decorative dashed borders, cyan-on-black or purple tints.
- No text, badge, chip, index, icon, play button or overlay on top of an image or video. Captions
  and controls go in the readout bar underneath.
- No transform on media, ever: no hover zoom, no scale-in on reveal, no parallax, no Ken Burns.
- No fake readouts: no clock, no coordinates, no build SHA, no version strings, no `SYS.OK`, no
  colophon, no invented counts. If it is mono, it maps to a database, config or asset value.
- No accent fills (buttons, badges, backgrounds), accent borders, accent hover text, accent body
  text, accent `::selection`, or any second accent. Nothing orange larger than 8 × 8 px except the
  1 px underline and 2 px focus ring. Status colours stay 6 px dots.
- No radius above 2 px; no pills; no `rounded-xl` cards; no circle buttons.
- No italics, no serif, no weight ≥ 600, no uppercase display type, no display type over 64 px, no
  `letter-spacing` tighter than −0.03em.
- No count-up numbers, typewriter/decode text, word-by-word wipes, marquee tickers, cursor
  followers, magnetic buttons, 3D tilt, scroll-jacking, hide-on-scroll header, load choreography,
  root cross-fade page transitions, or more than three stagger steps.
- No `100vh`/`100svh` hero, no scroll-down cue, no "scroll to explore".
- No `w-screen` full-bleed (horizontal scroll on Windows); use `bleed` + `overflow-x: clip`.
- No `fg-subtle` on readable text; no mono string longer than one line per component; no second
  mono line in a card meta row on mobile.
- No hairline above 14 %, no surface above `#1a1a1e`, no background grid above 3 % or below `lg`.
- No image without an exact `sizes`; no hero poster without `priority`; no `<video>` with
  `preload` other than `none`/`metadata`; no autoplay with sound; no ambient loop below `md`.
- No hover-only affordance without a touch resting state; no tap target under 44 px.
- No new font packages, no Google Fonts, no icon font, no animation library, no canvas/WebGL.

---

## 10. Migration notes

Work through these in order; each bullet names the file and the change. Run `pnpm lint && pnpm
typecheck && pnpm test && pnpm test:e2e` before pushing (project rule), stop `pnpm dev` before any
`db:` script.

**Dependencies and fonts**

- `package.json`: `pnpm remove @fontsource/instrument-serif`. Keep `geist`.
- `src/app/fonts.ts`: delete `instrumentSerif` and the `next/font/local` import; export
  `geistSans`, `geistMono`, `fontVariables = \`${geistSans.variable} ${geistMono.variable}\``.
- Delete `src/app/fonts/instrument-serif-italic.woff2` (and the `src/app/fonts/` folder if empty).

**Tokens and global CSS**

- `src/app/globals.css`: replace the `@theme` block with §2.5. Delete `--font-serif`, the radius
  scale (`sm`–`xl`), `--ease-in-out`, `--color-accent-hover`, `--color-black`, the `serif-accent`
  utility and the `& em` block in `headline`; remove the `"ss01","cv11"` feature setting. Add the
  utilities in §4.6, the reveal CSS in §7.2, the rail-draw enhancement in §5.11, `::selection`
  inverted (`bg: fg / color: bg`), `:focus-visible` with `border-radius: var(--radius-xs)`,
  `--space-section` on `:root` (6rem / 10rem at ≥ 48rem), and `@media print` reveal override.
- `src/app/layout.tsx`: `themeColor: "#0a0a0b"`; keep the `.js` inline script and `GridOverlay`.
- `src/components/ui/grid-overlay.tsx`: column borders use `border-grid` (`--color-grid`), `lg:` only.

**Typography and emphasis**

- `src/components/ui/emphasis.tsx`: render starred segments as `<span className="text-fg-muted">`
  instead of `<em>`. Update the doc comment.
- `src/config/site.ts`: keep `headline` with its `*…*` (comment: "starred = muted coda"); add
  `showreel: { src, poster, width?, height?, duration?, ambient?: boolean }`; add nothing fake
  (no coords).
- `src/components/ui/section-heading.tsx`: delete; create `src/components/ui/section-rail.tsx`
  (§5.5). Update imports in `src/app/page.tsx` and `src/app/design/page.tsx`.
- `src/components/ui/eyebrow.tsx`: remove the accent dot; add `index` prop rendered in `text-fg`.

**Controls**

- `src/components/ui/button.tsx`: `rounded-xs`; remove `active:scale`, `rounded-full`, the
  `accent` variant and `hover:ring-fg-subtle/60`; add the LED span to `primary`; sizes per §5.3;
  pressed `active:translate-y-px`.
- `src/components/layout/nav-links.tsx`: remove pill classes; full-height links with the
  `after:` accent underline for `aria-current`.
- `src/components/layout/site-header.tsx`: opaque `bg-bg border-b border-line`; drop
  `backdrop-blur-xl backdrop-saturate-150 bg-bg/75 supports-[…]`; wordmark LED `led` (square,
  no hover scale); `Contact` secondary `sm` replaces the primary "Get in touch"; add the
  `/ SOLO GAME DEV` label (`lg:` only).
- `src/components/layout/mobile-nav.tsx`: keep behaviour; restyle per §5.2 (`text-display-lg`
  links, `label` indices, email + externals + system line at the bottom, `data-open` fade).
- `src/components/ui/tag.tsx`: `h-[22px] rounded-xs bg-surface-2 px-2 label text-fg-muted`, no
  ring; `+N` in `text-fg-muted`.
- `src/components/ui/status-badge.tsx`: add `variant: "default" | "mono"`.
- `src/components/ui/text-link.tsx`: `text-ui`, 14 px arrow, remove `group-hover:text-accent`.
- `src/components/ui/kbd.tsx`: no change (inherits the 2 px `radius-xs`).

**Media**

- `src/components/ui/media-frame.tsx`: remove `rounded-lg` and `[&>img]:rounded-[inherit]`; ring
  via inset `box-shadow` (so it never clips under the image); add `bleed`, `readout`, `frame`,
  `videoRef` props and the readout bar; empty label `NO MEDIA`; add `<noscript>` video fallback.
- `src/components/ui/lazy-video.tsx`: add a `threshold: 0.5` observer that plays/pauses ambient
  video by visibility; expose the element via `ref`; honour `site.showreel.ambient`.
- `src/components/home/showreel.tsx`: delete. Create `src/components/home/hero-showreel.tsx`
  (client, §5.13) with the timecode readout and `<dialog>` player.
- `src/components/ui/project-card.tsx`: rebuild per §5.10 — remove `imgClassName` zoom, the
  arrow circle, `rounded-xl`, `after:rounded-xl`; add the flip index, the 12-col meta subgrid
  (feature) and the mono status line (default); `sizes` per placement; tech line = first 3 + `+N`.
- `src/components/home/latest-feed.tsx`: rebuild per §5.11 — rail segment, marker column,
  indices (`total − i`), `meta` dates via `formatDateMono`, `label` type/project, hover tray, no
  thumbnail zoom, mobile mono line; new props `total: number`.
- `src/components/ui/timeline-marker.tsx`: hollow shapes use `bg-bg group-hover:bg-surface-1`.

**Data and formatting**

- `src/lib/format.ts`: add `pad`, `formatDateMono`, `formatMonthMono`, `formatRatio`.
- `src/lib/projects/queries.ts`: add `countPublicPosts(db, now)` and `countProjects(db)`.
- `src/app/page.tsx`: hero per §6.1 (rail → H1 → `HeroShowreel` → brief row with stats cluster);
  compute `posterLabel` from the post the fallback cover belongs to; stats = projects count,
  public post count, earliest `startedAt`, newest `publishedAt`; `SectionRail` for both sections
  with counts; card `size`/ratios/`sizes` per column; pass `total` to `LatestFeed`; keep
  `aria-labelledby` ids and `#latest`.
- `src/components/layout/site-footer.tsx`: per §5.14 (needs `getLatestPosts(db, 1)` for
  `LAST LOG`; the layout is already dynamic).
- `src/app/not-found.tsx`: per §5.15 (use `Emphasis`, `Eyebrow` `ERROR 404`).
- `src/app/design/page.tsx`: remove the serif sample and the `accent` button; add samples for
  `label`/`meta`/`readout`, `rule-caps`, LED (static and live), the flip slot, `StatusBadge mono`,
  `MediaFrame` with a readout and a `bleed` example, the log row, the stats cluster.

**Docs and tests**

- `SPEC.md` §5: replace the body with a pointer to `docs/DESIGN.md` plus the five hard rules
  (accent ≤ 8 px, real data only, nothing on images, no media transforms, one radius); update the
  Fonts row in §4 (Geist Sans + Mono only, Archivo/Instrument Serif removed); log the session.
- `tests/e2e/smoke.spec.ts`: no expectation changes are required (H1 present, `Main`/`Mobile`
  navs, heading containing "Projects", 3 articles, 6 `#latest` list items, "Open menu", 404
  heading) — keep those roles and names intact.
- `tests/e2e/screens.spec.ts`: add a viewport-only `home-fold-1440.png` (1440 × 900) and
  `home-fold-390.png` (390 × 844) to verify the showreel is above the fold; keep `settle()`.
- Lighthouse (`/`, a project, a post): confirm LCP = hero poster (`priority`, `sizes=100vw`,
  ≤ 2560 px AVIF), CLS 0 (all frames have ratios, readout cells have reserved widths), a11y 100
  (no `fg-subtle` on readable text, all `aria-hidden` indices).

---

## Appendix B — Deviations recorded after the implementation review

An adversarial review (4 lenses, every finding verified by 2 skeptics) found places where the
spec contradicted itself or the browser. These amendments are now part of the spec:

| Where                         | Amendment                                                                                                                                                                                               | Why                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| §4.6 `readout`, §6.1 hero 390 | Phone size is fluid: `clamp(1.375rem, 6.2vw, 1.75rem)`; stats cells use `pl-4/pr-4` below `sm`                                                                                                          | A 10-digit `2026.09.18` at 28px (165px) cannot fit half of a 343px container |
| §5.11 mobile                  | Below `xs` (480px) the mobile mono line drops the decorative index: `2026.09.19 · HOLLOWDEEP`                                                                                                           | The index pushed the project name into an ellipsis at 375                    |
| §5.11 hover                   | The title arrow is not rendered on touch devices (`@media (hover: hover)` only)                                                                                                                         | The invisible arrow still took width and broke titles early                  |
| §5.11 row                     | The thumbnail cell is `pointer-events: none`                                                                                                                                                            | It sat above the row link overlay and swallowed clicks                       |
| §5.10 feature                 | Home lead card is **not** `priority`; mobile ratio is 16:9 (lg 2:1); the md+ tech line wraps instead of truncating                                                                                      | Would compete with the LCP poster; silent `+N` loss                          |
| §5.9 video                    | Video posters render as a `next/image` layer under a transparent `<video>`                                                                                                                              | Keeps the optimised, preloaded poster as the LCP                             |
| §5.13                         | Ambient loop gets a `Pause loop` toggle in the readout bar (md+); timecode reads `01:24` until playback starts; the timecode is `aria-hidden` and the total is in the button's name                     | WCAG 2.2.2; stable readout; non-chatty accessible name                       |
| §5.2                          | While the menu is open, `main` and the footer are `inert`; the panel fades via `visibility`; the system line shows location + `LAST LOG`; without JS a `Menu` link to `#footer-nav` replaces the toggle | Focus containment; working fade; no-JS path                                  |
| §5.3, §5.14, §5.6             | All always-visible links and controls are ≥ 44px tall (`min-h-11`)                                                                                                                                      | Tap-target rule in §5 conventions                                            |
| §2 / GridOverlay              | `body` has no background (html's background paints the canvas)                                                                                                                                          | A body fill hid the fixed `-z-10` grid                                       |
| §3.4                          | A non-breaking space precedes every em dash in two-tone copy                                                                                                                                            | Prevents the dash from starting a line                                       |

## Appendix A — Judge warnings and how the spec answers them

| Warning (judges 1–3)                                                  | Answer in this spec                                                                                                                             |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard-template drift (stat cells + mono everywhere + zero radius) | Mono capped at one line per component; media largest on every screen; whitespace (96/160) separates sections; one 2×2 cluster only (§2.3, §6.1) |
| Registration marks become HUD brackets                                | No marks on any image or card; only rail end-caps on rules (§4.3)                                                                               |
| Fake readouts (SYS.OK, coordinates, SHA, clock)                       | Banned outright; every mono string is enumerated with its data source (§1 P3, §9)                                                               |
| Background grid too visible                                           | 3 %, `lg+` only (§2.4)                                                                                                                          |
| `fg-subtle` fails AA at 11 px                                         | Raised to `#7a7a83` (4.65 : 1) and still reserved for `aria-hidden` (§2.1)                                                                      |
| Blinking LED / clock become a toy                                     | No clock; one LED blinks, 2 s, static under reduced motion (§7.3)                                                                               |
| Opaque header over full-bleed media                                   | Hero is not 100vh; the showreel starts 341 px below the top (§6.1)                                                                              |
| `w-screen` horizontal scroll on Windows                               | `bleed` + `overflow-x: clip` (§2.4)                                                                                                             |
| Surfaces/hairlines too strong break the flat look                     | Hard caps `#1a1a1e` / 14 % (§2.1)                                                                                                               |
| H1 too small to lead                                                  | 64 px on two full-width lines, spec sheet removed from the hero, stats numerals 32 px (§3.3, §6.1)                                              |
| Default Linear/Vercel look without precision                          | Precision details are specified to the pixel (rails, cluster, log, readout) and are the design (§8)                                             |
| Half-done serif/Archivo removal                                       | Full removal path across every file (§10)                                                                                                       |
| Glass/grain/vignette recipe (Vitrine grafts)                          | Not adopted: no glass, no grain, no vignette, nothing on images (§4.1, §9)                                                                      |
| Text-on-footage contrast                                              | No text on images anywhere (§1 P1)                                                                                                              |
| 100svh hero, scroll cue                                               | Banned (§9); fold math given (§6.1)                                                                                                             |
| Two-tone as a tic                                                     | Exactly three uses, all genuine asides; section titles single-tone (§3.4)                                                                       |
| Pills everywhere / bento                                              | One 2 px radius; 6/6 grid with rules, no panes (§2.2, §6.1)                                                                                     |
| Vanity stats with thin data                                           | Specific values (`SINCE 2025.12`, `LAST LOG 2026.09.19`), poster named instead of "coming soon" (§5.13, §6.1)                                   |
| Ambient video vs LCP/battery                                          | Poster is LCP; loop gated to md+, in view, no reduced motion, `showreel.ambient` switch (§5.13)                                                 |
| Feed is generic                                                       | Log indices, marker rail, typed markers, CSS-only draw (§5.11)                                                                                  |
| View Transitions flash/jank                                           | Off by default, cover morph only, no root fade, verify before enabling (§7.6)                                                                   |
| Accent must agree with real footage                                   | Audit step and single-token swap path (§2.1)                                                                                                    |
| Removing the serif changes the owner's tone                           | Replaced by the two-tone coda in the same three places; the H1 keeps its copy and second beat (§3.4)                                            |
