/**
 * Owner identity and site-wide copy. Replace the placeholders with your own
 * details — this is the only file that needs editing to make the site yours.
 * Every value here is shown as-is; nothing on the site is invented for flavour.
 */
export const site = {
  /** TODO: replace with your name. */
  name: "Your Name",
  /** Used in the header only if `name` is longer than 16 characters. */
  shortName: "YN",
  role: "Solo game developer",
  disciplines: ["Unreal Engine", "Web games", "Tools"],
  /** Hero statement. Starred segment = muted coda (rendered one tone darker). */
  headline: "I build quiet worlds in Unreal and small, sharp games for the web — *and document every step.*",
  intro:
    "Atmospheric games in Unreal Engine, small games for the browser, and the tools that help me build both. Every project here has an open devlog — follow along from the first greybox to launch day.",
  /** Shown as a blinking LED status in the hero rail. Set to "" to hide. */
  availability: "Open to collaborations",
  location: "Stockholm, Sweden",
  email: "hello@example.com",
  social: {
    github: "https://github.com/",
    youtube: "https://www.youtube.com/",
    bluesky: "https://bsky.app/",
  },
  /**
   * Showreel. `src`/`poster` are storage keys or absolute URLs; empty `src` shows
   * the poster slot only. `duration` (seconds), `width`/`height` are the real
   * values of the file and are shown in the readout bar. `ambient: false`
   * disables the muted in-view loop (the dialog player still works).
   */
  showreel: { src: "", poster: "", duration: 0, width: 1920, height: 1080, ambient: true },
  /** CV download (path under /public or absolute URL). Empty = hidden. */
  cvUrl: "",
  description: "Portfolio and devlogs of a solo game developer working in Unreal Engine, web games and tools.",
  nav: [
    { href: "/projects", label: "Projects" },
    { href: "/#latest", label: "Devlog" },
    { href: "/about", label: "About" },
  ],
} as const;

export type Site = typeof site;
