/**
 * Owner identity and site-wide copy. Replace the placeholders with your own
 * details — this is the only file that needs editing to make the site yours.
 */
export const site = {
  /** TODO: replace with your name. */
  name: "Your Name",
  /** Short mark used in the header on small screens. */
  shortName: "YN",
  role: "Solo game developer",
  /** Hero statement. Wrap words in *asterisks* for the serif italic accent. */
  headline: "I build quiet worlds in Unreal, small sharp games for the web — *and document every step.*",
  /** Shown as a small status next to the location. Set to "" to hide. */
  availability: "Open to collaborations",
  disciplines: ["Unreal Engine", "Web games", "Tools"],
  intro:
    "I make atmospheric games in Unreal Engine, small sharp games for the browser, and the tools that help me build both. Every project here has an open devlog — follow along from the first greybox to launch day.",
  location: "Stockholm, Sweden",
  email: "hello@example.com",
  social: {
    github: "https://github.com/",
    youtube: "https://www.youtube.com/",
    bluesky: "https://bsky.app/",
  },
  /** Showreel video (storage key or absolute URL). Empty = poster-only slot. */
  showreel: { src: "", poster: "" },
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
