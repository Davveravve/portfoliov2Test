import { LatestFeed } from "@/components/home/latest-feed";
import { Showreel } from "@/components/home/showreel";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Emphasis } from "@/components/ui/emphasis";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ArrowRight } from "@/components/ui/icons";
import { ProjectCard } from "@/components/ui/project-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { TextLink } from "@/components/ui/text-link";
import { site } from "@/config/site";
import { getDb } from "@/db/client";
import { formatMonth } from "@/lib/format";
import { getFeaturedProjects, getLatestPosts } from "@/lib/projects/queries";

// Reads live data; Phase 5 moves this to ISR + on-demand revalidation from the admin.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = await getDb();
  const [featured, latest] = await Promise.all([getFeaturedProjects(db), getLatestPosts(db, 6)]);
  const [lead, ...rest] = featured;
  const totalUpdates = featured.reduce((n, p) => n + p.updateCount, 0);
  // Poster for the empty showreel slot: newest post art that isn't the lead card's cover.
  const showreelPoster = latest.find((p) => p.cover && p.cover.url !== lead?.cover?.url)?.cover ?? lead?.cover ?? null;
  const since = featured
    .map((p) => p.startedAt)
    .filter(Boolean)
    .sort()[0];

  const stats = [
    ["Projects", String(featured.length).padStart(2, "0")],
    ["Devlog updates", String(totalUpdates)],
    ["Building since", since ? formatMonth(since) : "—"],
  ] as const;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section aria-labelledby="hero-title" className="pt-14 md:pt-24">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Eyebrow>
              {site.role} — {site.location}
            </Eyebrow>
            {site.availability && (
              <p className="inline-flex items-center gap-2 text-[13px] text-fg-muted">
                <span aria-hidden className="relative flex size-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-status-released/60 motion-reduce:hidden" />
                  <span className="relative size-2 rounded-full bg-status-released" />
                </span>
                {site.availability}
              </p>
            )}
          </div>

          <h1 id="hero-title" className="mt-10 max-w-[16ch] headline text-display-2xl md:mt-14">
            <Emphasis text={site.headline} />
          </h1>

          <div className="mt-10 grid items-end gap-8 md:mt-14 md:grid-cols-12">
            <p className="max-w-md text-[17px] leading-relaxed text-fg-muted md:col-span-6 lg:col-span-5">
              {site.intro}
            </p>
            <div className="flex flex-wrap gap-3 md:col-span-6 md:justify-end lg:col-span-7">
              <ButtonLink href="/projects" size="lg" trailingIcon={<ArrowRight />}>
                View projects
              </ButtonLink>
              <ButtonLink href="#latest" size="lg" variant="secondary">
                Read the devlog
              </ButtonLink>
            </div>
          </div>
        </Container>

        <Container className="mt-14 md:mt-20">
          <Showreel fallback={showreelPoster} />
          <dl className="mt-6 grid grid-cols-3 gap-4 md:flex md:justify-end md:gap-16">
            {stats.map(([k, v]) => (
              <div key={k} className="space-y-1">
                <dt className="text-[13px] text-fg-subtle">{k}</dt>
                <dd className="text-lg font-medium tracking-[-0.02em] tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ── Featured projects ────────────────────────────────── */}
      {lead && (
        <Container as="section" aria-labelledby="work-title" className="pt-32 md:pt-48">
          <SectionHeading
            id="work-title"
            eyebrow="Selected work"
            title="Projects, built *in the open.*"
            action={<TextLink href="/projects">All projects</TextLink>}
          />
          <div className="mt-12 grid gap-x-6 gap-y-16 md:mt-16 md:grid-cols-2 md:gap-y-20">
            {[lead, ...rest].map((p, i) => (
              <Reveal key={p.id} delay={(i % 2) * 90} className={i === 0 ? "md:col-span-2" : undefined}>
                <ProjectCard
                  size={i === 0 ? "feature" : "default"}
                  index={i + 1}
                  project={{ ...p, meta: `${p.updateCount} update${p.updateCount === 1 ? "" : "s"}` }}
                />
              </Reveal>
            ))}
          </div>
        </Container>
      )}

      {/* ── Latest activity ──────────────────────────────────── */}
      <Container as="section" id="latest" aria-labelledby="latest-title" className="pt-32 md:pt-48">
        <SectionHeading id="latest-title" eyebrow="Devlog" title="Latest *updates.*" className="mb-12 md:mb-16" />
        <LatestFeed items={latest} />
      </Container>
    </>
  );
}
