import { LatestFeed } from "@/components/home/latest-feed";
import { Showreel } from "@/components/home/showreel";
import { ButtonLink } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ArrowRight } from "@/components/ui/icons";
import { ProjectCard } from "@/components/ui/project-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
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

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <Container as="section" aria-labelledby="hero-title" className="pt-12 pb-8 md:pt-20 md:pb-16">
        <Eyebrow className="mb-8 md:mb-10">{site.disciplines.join(" · ")}</Eyebrow>
        <h1 id="hero-title" className="font-display-x text-display-2xl break-words">
          {site.name}
        </h1>

        <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col justify-between gap-10 lg:col-span-4">
            <div className="space-y-6">
              <p className="label text-fg">{site.role}</p>
              <p className="max-w-md text-[17px] leading-relaxed text-fg-muted">{site.intro}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <ButtonLink href="/projects" size="lg" trailingIcon={<ArrowRight />}>
                  View projects
                </ButtonLink>
                <ButtonLink href="#latest" size="lg" variant="secondary">
                  Read the devlog
                </ButtonLink>
              </div>
            </div>

            <dl className="grid grid-cols-3 border-t border-line pt-5">
              {[
                ["Projects", String(featured.length).padStart(2, "0")],
                ["Updates", String(totalUpdates).padStart(2, "0")],
                ["Since", since ? formatMonth(since) : "—"],
              ].map(([k, v]) => (
                <div key={k} className="space-y-1.5">
                  <dt className="label text-fg-subtle">{k}</dt>
                  <dd className="font-display-x text-lg">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-8">
            <Showreel fallback={showreelPoster} />
          </div>
        </div>
      </Container>

      {/* ── Featured projects ────────────────────────────────── */}
      {lead && (
        <Container as="section" aria-labelledby="work-title" className="py-16 md:py-24">
          <SectionHeading
            id="work-title"
            eyebrow="01 — Selected work"
            title="Projects"
            action={<TextLink href="/projects">All projects</TextLink>}
          />
          <div className="mt-10 grid gap-x-8 gap-y-14 md:mt-12 md:gap-y-20 lg:grid-cols-12">
            {[lead, ...rest].map((p, i) => (
              <Reveal key={p.id} delay={i * 80} className={i === 0 ? "lg:col-span-12" : "lg:col-span-6"}>
                <ProjectCard
                  size={i === 0 ? "feature" : "default"}
                  project={{
                    ...p,
                    meta: `${p.updateCount} update${p.updateCount === 1 ? "" : "s"}`,
                  }}
                />
              </Reveal>
            ))}
          </div>
        </Container>
      )}

      {/* ── Latest activity ──────────────────────────────────── */}
      <Container as="section" id="latest" aria-labelledby="latest-title" className="py-16 md:py-24">
        <SectionHeading id="latest-title" eyebrow="02 — Devlog" title="Latest updates" />
        <LatestFeed items={latest} />
      </Container>
    </>
  );
}
