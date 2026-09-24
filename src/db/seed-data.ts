import type { PostStatus, PostType, ProjectLinks, ProjectStatus } from "./schema";
import type { ArtStyle, Palette } from "./seed-art";

export const PALETTES: Record<ArtStyle, Palette> = {
  cavern: {
    sky: ["#1b2528", "#0c1012"],
    layers: ["#152023", "#0f181a", "#0a1012"],
    accent: "#ff5b24",
    fog: "#9fb7b9",
  },
  orbit: {
    sky: ["#2a2320", "#0e0c0b"],
    layers: ["#3a302b", "#5a4a40", "#7a6555"],
    accent: "#ff5b24",
    fog: "#e8d9c8",
  },
  blockout: {
    sky: ["#1a1a1d", "#0d0d0f"],
    layers: ["#3a3a40", "#26262b", "#1d1d21"],
    accent: "#ff5b24",
    fog: "#d0d0d8",
  },
};

export type SeedPost = {
  slug: string;
  title: string;
  type: PostType;
  status?: PostStatus;
  /** Days before seed time (negative = in the future). */
  daysAgo: number;
  pinned?: boolean;
  excerpt?: string;
  /** Alt text for the generated cover. Omit for a text-only post. */
  coverAlt?: string;
  /** Extra inline screenshots embedded in the body: `{{shot:N}}` placeholders. */
  shots?: string[];
  body: string;
};

export type SeedProject = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  status: ProjectStatus;
  art: ArtStyle;
  coverAlt: string;
  tech: string[];
  platforms: string[];
  links: ProjectLinks;
  startedDaysAgo: number;
  featured: boolean;
  posts: SeedPost[];
};

export const SEED_PROJECTS: SeedProject[] = [
  {
    slug: "hollowdeep",
    title: "Hollowdeep",
    tagline: "A quiet descent into a cave system that remembers you.",
    summary:
      "A first-person exploration game about climbing down, not fighting through. Built in Unreal Engine 5 with Lumen, a custom rope system and hand-placed light. Every run carves the cave a little differently — and it keeps what you leave behind.",
    status: "in_development",
    art: "cavern",
    coverAlt: "A lone climber stands on a ledge in a vast teal cave, lit by a shaft of pale light from above.",
    tech: ["Unreal Engine 5", "C++", "Lumen", "Niagara"],
    platforms: ["PC", "Steam Deck"],
    links: { steam: "https://store.steampowered.com/", trailer: "https://www.youtube.com/" },
    startedDaysAgo: 290,
    featured: true,
    posts: [
      {
        slug: "steam-page-is-live",
        title: "The Steam page is live",
        type: "milestone",
        daysAgo: 6,
        coverAlt: "Key art: the cave mouth seen from far below, a thin beam of daylight falling into the dark.",
        excerpt:
          "Hollowdeep has a home. Wishlists are the single most useful thing you can do for a solo dev — here is why, and what is next.",
        body: `After ten months of this being a folder called \`Prototype_Cave_v3\`, Hollowdeep has a Steam page.

**[Wishlist Hollowdeep on Steam](https://store.steampowered.com/)**

## Why wishlists matter

Steam uses wishlists as a signal for how visible a game should be at launch. For a solo project with no marketing budget, that signal is almost everything.

## What's next

- A **public playtest** of the first two chasms in the spring
- Controller support pass (Steam Deck verified is the goal)
- The soundtrack. I have been putting it off. No more.

Thanks to everyone who has followed this devlog since the greybox days.`,
      },
      {
        slug: "showcase-the-sunken-chapel",
        title: "Showcase: The Sunken Chapel",
        type: "showcase",
        daysAgo: 24,
        pinned: true,
        coverAlt: "A flooded chapel deep underground, pews half-submerged and lit by a single hole in the ceiling.",
        shots: ["Close-up of wet stone arches with a narrow shaft of light cutting through fog."],
        excerpt: "The first area I would actually call finished. Lighting, audio and pacing — all of it.",
        body: `The Sunken Chapel is the first area in Hollowdeep I would call *finished*. Not "done for now" — finished.

{{shot:0}}

## Light first, geometry second

I blocked this whole space out with only a single directional light through the roof hole. If the room didn't read with one light, no amount of detail would save it.

> The player should always be able to find the way down by looking for the darkest spot that still has an edge.

## Audio

Water drips are spatialised per-drip with a small pool of MetaSound sources — cheaper than it sounds, and it means you can *hear* the shape of the room.`,
      },
      {
        slug: "rope-physics-take-three",
        title: "Rope physics, take three",
        type: "devlog",
        daysAgo: 58,
        coverAlt: "Debug view of a climbing rope drawn as orange segments hanging down a rock face.",
        excerpt:
          "Cable components, Chaos, and finally a custom verlet solver that doesn't explode when you look at it.",
        body: `The rope is the core verb of Hollowdeep. It has now been rewritten three times.

1. **Cable Component** — looks great, but it's cosmetic. No collision you can trust.
2. **Chaos physics chain** — collides, but jitters under load and tunnels through thin geometry.
3. **Custom verlet solver** — 48 particles, 8 constraint iterations, sphere-traced collision against a simplified proxy mesh.

\`\`\`cpp
for (int32 Iter = 0; Iter < SolverIterations; ++Iter)
{
    SatisfyDistanceConstraints(Particles, SegmentLength);
    SatisfyCollision(Particles, CollisionProxy);
}
\`\`\`

It runs at ~0.08 ms on the game thread. Take three is staying.`,
      },
      {
        slug: "vertical-slice-playable",
        title: "Milestone: vertical slice is playable",
        type: "milestone",
        daysAgo: 104,
        coverAlt: "A wide shot of a chasm with three ledges stepping down into fog.",
        excerpt: "Twenty minutes of Hollowdeep, start to finish. Rough, but it's a game now.",
        body: `Twenty minutes, one chasm, start to finish. There is a beginning, a middle and a way out.

## What's in the slice

- The descent from the surface camp
- Two rope traversal set pieces
- The first "memory" — an object the cave keeps between runs

## What surprised me

Playtesters spent far longer *looking* than climbing. I'm leaning into that: fewer obstacles, more reasons to stop.`,
      },
      {
        slug: "lumen-fog-and-frame-time",
        title: "Lumen, fog and a lot of frame time",
        type: "devlog",
        daysAgo: 170,
        coverAlt: "A dark cave interior with layered volumetric fog bands catching faint light.",
        excerpt: "Volumetric fog is the whole mood of this game. It was also eating 6 ms. Here's how I got it back.",
        body: `Volumetric fog *is* the look of Hollowdeep. It was also costing 6.2 ms on my target hardware.

| Change | Saved |
| --- | --- |
| Grid pixel size 8 → 16 | 2.1 ms |
| Distance cutoff at 60 m | 1.4 ms |
| Fewer shadowed local lights | 1.3 ms |

Down to **1.4 ms** with no visible difference at normal play distance. Profile first, always.`,
      },
      {
        slug: "greybox-the-first-descent",
        title: "Greybox: the first descent",
        type: "devlog",
        daysAgo: 232,
        coverAlt: "Untextured grey blocks forming a rough cave shaft, seen from the top.",
        excerpt: "Grey boxes, a capsule and a rope made of debug lines. The first time it felt like something.",
        body: `No textures, no lighting, no sound. Just grey boxes, a capsule, and a rope drawn with debug lines.

And yet: the first time I dropped off the edge and caught the rope, it felt like *something*. That is the whole reason this project exists.

Next up: making the rope not terrible.`,
      },
      {
        slug: "day-1-a-hole-in-the-ground",
        title: "Day 1: a hole in the ground",
        type: "devlog",
        daysAgo: 288,
        excerpt: "Starting a new project. It's about going down.",
        body: `New project. Working title: *Hollowdeep*.

The pitch fits in one line: **an exploration game where the only direction is down.**

No combat. No crafting. A rope, a lamp, and a cave that remembers you. I'll be posting here as I go — the good weeks and the bad ones.`,
      },
    ],
  },
  {
    slug: "tiny-orbit",
    title: "Tiny Orbit",
    tagline: "A one-button gravity game you can finish on a coffee break.",
    summary:
      "A browser arcade game about slingshotting a tiny probe between planets. One input, sixty handcrafted levels and a daily challenge. Written in TypeScript with Three.js, runs at 120 fps on a phone.",
    status: "released",
    art: "orbit",
    coverAlt: "A small orange probe arcs around a planet, with dashed orbit rings and a field of stars.",
    tech: ["TypeScript", "Three.js", "Vite", "Web Audio"],
    platforms: ["Web", "Mobile web"],
    links: { itch: "https://itch.io/", github: "https://github.com/" },
    startedDaysAgo: 210,
    featured: true,
    posts: [
      {
        slug: "1-1-daily-challenges",
        title: "1.1: daily challenges",
        type: "release",
        daysAgo: 15,
        coverAlt: "The daily challenge screen: a seeded planet layout with a countdown timer.",
        excerpt: "A new seeded level every day, the same for everyone, and a leaderboard that fits in a URL.",
        body: `Tiny Orbit 1.1 is out.

- **Daily challenge** — one seeded level per day, identical for every player
- **Shareable results** — your run encodes into a tiny URL, no accounts
- 40% smaller bundle thanks to tree-shaking Three.js properly

**[Play it on itch.io](https://itch.io/)**`,
      },
      {
        slug: "release-tiny-orbit-1-0",
        title: "Release: Tiny Orbit 1.0",
        type: "release",
        daysAgo: 64,
        coverAlt: "Title screen of Tiny Orbit: the logo over a slowly rotating planet system.",
        excerpt: "Sixty levels, one button, zero loading screens. Tiny Orbit is out.",
        body: `**Tiny Orbit is out.** Sixty levels, one button, no loading screens.

It started as a weekend prototype and turned into five months of tuning gravity curves. Thank you to everyone who playtested.

## By the numbers

- 60 handcrafted levels
- 212 KB gzipped
- 120 fps on a 4-year-old phone`,
      },
      {
        slug: "juice-pass",
        title: "The juice pass",
        type: "showcase",
        daysAgo: 110,
        coverAlt: "A burst of orange particles as the probe lands on a planet surface.",
        excerpt:
          "Screen shake, squash and stretch, and a 40 ms hit-stop. Small things that make one button feel great.",
        body: `One-button games live or die on feel. This week was all juice:

- **Hit-stop** of 40 ms on landing
- Squash and stretch on the probe, driven by velocity
- Trail length tied to speed so you can *see* momentum

None of it changes the rules. All of it changes the game.`,
      },
      {
        slug: "gravity-wells-feel-good-now",
        title: "Gravity wells feel good now",
        type: "devlog",
        daysAgo: 160,
        coverAlt: "Debug overlay showing gravity field lines bending around three planets.",
        excerpt: "Real inverse-square gravity is miserable to play. Here's the fake version that feels right.",
        body: `Physically correct gravity is *awful* to play. Inverse-square falloff makes planets feel either dead or violent.

The fix is a hand-tuned curve with a soft capture radius:

\`\`\`ts
const pull = strength * smoothstep(outer, inner, distance);
\`\`\`

Now you can feel a planet grab you — and let go.`,
      },
      {
        slug: "prototype-in-a-weekend",
        title: "Prototype in a weekend",
        type: "devlog",
        daysAgo: 208,
        coverAlt: "A crude prototype: white circles for planets and a dot for the probe on a black background.",
        excerpt: "A game jam leftover that wouldn't leave me alone.",
        body: `Started as a 48-hour jam idea: **you can't steer, you can only let go.**

White circles, a dot, and a mouse button. I've played it more than anything else I made this year, so it's becoming a real project.`,
      },
    ],
  },
  {
    slug: "blockout-kit",
    title: "Blockout Kit",
    tagline: "An Unreal Editor plugin for level blockouts at the speed of thought.",
    summary:
      "An editor tool for Unreal Engine 5 that turns level blockout into sketching: grid-snapped primitives, one-key extrude, and instant playable collision. Built for my own projects first, headed for Fab.",
    status: "prototype",
    art: "blockout",
    coverAlt: "An isometric grid of grey blocks forming a small level layout, with one orange block highlighted.",
    tech: ["Unreal Engine 5", "C++", "Slate", "Editor tooling"],
    platforms: ["Unreal Editor"],
    links: { github: "https://github.com/" },
    startedDaysAgo: 120,
    featured: true,
    posts: [
      {
        slug: "fab-release-date",
        title: "Fab release date",
        type: "milestone",
        status: "scheduled",
        daysAgo: -14,
        excerpt: "Blockout Kit is coming to Fab.",
        body: "Blockout Kit is coming to Fab. Details inside.",
      },
      {
        slug: "material-presets",
        title: "Material presets (draft)",
        type: "devlog",
        status: "draft",
        daysAgo: 2,
        body: "Notes on per-surface material presets. Not ready yet.",
      },
      {
        slug: "first-map-built-entirely-in-blockout-kit",
        title: "Milestone: a whole map, built in Blockout Kit",
        type: "milestone",
        daysAgo: 33,
        coverAlt: "A complete multi-level blockout map in isometric view, with walkways and stairs.",
        excerpt: "Forty minutes from empty level to a playable, collision-correct blockout.",
        body: `The test: build a full multiplayer-sized blockout using **only** Blockout Kit.

Forty minutes, empty level to playable, with correct collision and nav mesh. The same map took me most of a day with BSP brushes.

## What broke

- Undo across extrude + snap was one transaction too many
- Very thin walls z-fought in the editor viewport

Both fixed.`,
      },
      {
        slug: "snapping-and-the-grid",
        title: "Snapping, and why the grid is everything",
        type: "devlog",
        daysAgo: 71,
        coverAlt: "Close-up of the editor grid with snap guides drawn between two blocks.",
        excerpt: "A blockout tool is a snapping tool with some cubes attached.",
        body: `The insight that reshaped this tool: **a blockout tool is a snapping tool with some cubes attached.**

Everything now snaps to a world grid at power-of-two sizes, and every face exposes snap anchors. \`[\` and \`]\` change grid size, just like the rest of the editor.`,
      },
      {
        slug: "why-im-building-a-blockout-tool",
        title: "Why I'm building a blockout tool",
        type: "devlog",
        daysAgo: 118,
        excerpt: "BSP brushes are dated, modeling tools are too slow. There's a gap in the middle.",
        body: `Blocking out Hollowdeep's caves was slow. BSP brushes are dated, and the modeling tools are built for final geometry, not sketching.

I want something in the middle: **sketch speed, with real collision.** So I'm building it, and I'll dogfood it on my own games first.`,
      },
    ],
  },
];
