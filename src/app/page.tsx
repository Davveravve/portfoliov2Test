import { HeroShowreel } from "@/components/home/hero-showreel";
import { LatestFeed } from "@/components/home/latest-feed";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Emphasis } from "@/components/ui/emphasis";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ArrowRight } from "@/components/ui/icons";
import { ProjectCard } from "@/components/ui/project-card";
import { Reveal } from "@/components/ui/reveal";
import { SectionRail } from "@/components/ui/section-rail";
import { TextLink } from "@/components/ui/text-link";
import { site } from "@/config/site";
import { getDb } from "@/db/client";
import { formatDateMono, formatMonthMono, pad } from "@/lib/format";
import { POST_TYPE_LABEL } from "@/lib/labels";
import type { MediaAsset } from "@/lib/media";
import {
  countProjects,
  countPublicPosts,
  earliestProjectStart,
  getFeaturedProjects,
  getLatestPosts,
} from "@/lib/projects/queries";
import { mediaUrl } from "@/lib/storage";

const resolve = (src: string) => (/^https?:\/\//.test(src) || src.startsWith("/") ? src : mediaUrl(src));

export default async function HomePage() {
  const db = await getDb();
  const [featured, latest, projectCount, postCount, since] = await Promise.all([
    getFeaturedProjects(db),
    getLatestPosts(db, 6),
    countProjects(db),
    countPublicPosts(db),
    earliestProjectStart(db),
  ]);
  const [lead, ...rest] = featured;
  const newest = latest[0];

  // Showreel: the configured video, or the newest post cover as a named poster.
  const { src, poster: posterKey, duration, width, height, ambient } = site.showreel;
  const video: MediaAsset | null = src
    ? {
        url: resolve(src),
        alt: `${site.name} — showreel`,
        kind: "video",
        width,
        height,
        blurDataUrl: null,
        posterUrl: posterKey ? resolve(posterKey) : null,
      }
    : null;
  const fallbackPost = latest.find((p) => p.cover) ?? null;
  const poster = video?.posterUrl
    ? { ...video, kind: "image" as const, url: video.posterUrl, posterUrl: null }
    : (fallbackPost?.cover ?? lead?.cover ?? null);
  const posterLabel =
    !video && fallbackPost
      ? `${fallbackPost.project.title} / ${POST_TYPE_LABEL[fallbackPost.type]}: ${fallbackPost.title}`
      : null;

  const stats = [
    ["Projects", pad(projectCount, 2)],
    ["Updates", pad(postCount, 3)],
    ["Since", since ? formatMonthMono(since) : "—"],
    ["Last log", newest ? formatDateMono(newest.publishedAt) : "—"],
  ] as const;

  const logRange = newest
    ? `Log ${pad(postCount, 3)}–${pad(Math.max(1, postCount - latest.length + 1), 3)} · ${latest.length} of ${postCount}`
    : undefined;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section aria-labelledby="hero-title" className="overflow-x-clip pt-8 md:pt-12">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 pb-3">
            <Eyebrow>
              {site.role} · {site.location}
            </Eyebrow>
            {site.availability && (
              <p className="flex items-center gap-2.5 label text-fg-muted">
                <span aria-hidden className="led led-live" />
                {site.availability}
              </p>
            )}
          </div>
          <div className="rule-caps" />

          <h1 id="hero-title" className="mt-6 headline text-display-2xl md:mt-8">
            <Emphasis text={site.headline} />
          </h1>
        </Container>

        <Container className="mt-8 md:mt-10">
          <HeroShowreel video={video} poster={poster} posterLabel={posterLabel} duration={duration} ambient={ambient} />
        </Container>

        {/* Brief row: intro + CTAs, and the instrument cluster. */}
        <Container className="mt-8 grid gap-x-6 gap-y-10 md:mt-10 md:grid-cols-12">
          <div className="md:col-span-6 lg:col-span-5">
            <p className="max-w-[44ch] text-body-lg text-fg-muted">{site.intro}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href="/projects" size="lg" trailingIcon={<ArrowRight />} className="h-12 sm:h-11">
                View projects
              </ButtonLink>
              <ButtonLink href="#latest" size="lg" variant="secondary" className="h-12 sm:h-11">
                Read the devlog
              </ButtonLink>
            </div>
          </div>

          <dl className="grid grid-cols-2 md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8">
            {stats.map(([k, v], i) => (
              <div
                key={k}
                className={[
                  i % 2 === 1 ? "border-l border-line pl-6" : "pr-6",
                  i < 2 ? "border-b border-line pb-4" : "pt-4",
                ].join(" ")}
              >
                <dt className="label text-fg-muted">{k}</dt>
                <dd className="mt-2 readout text-fg">{v}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ── 01 Selected work ─────────────────────────────────── */}
      {lead && (
        <Container as="section" aria-labelledby="work-title" className="pt-(--space-section)">
          <SectionRail
            index="01"
            label="Selected work"
            count={`${pad(featured.length, 2)} items`}
            action={<TextLink href="/projects">All projects</TextLink>}
            id="work-title"
            title="Projects, built in the open."
          />
          <div className="mt-12 grid gap-x-6 gap-y-14 md:grid-cols-12 md:gap-y-16">
            <Reveal className="md:col-span-12">
              <ProjectCard size="feature" index={1} project={lead} sizes="(min-width: 1440px) 1376px, 100vw" />
            </Reveal>
            {rest.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i + 1, 2) * 60} className="md:col-span-6">
                <ProjectCard
                  index={i + 2}
                  project={p}
                  sizes="(min-width: 1440px) 676px, (min-width: 768px) 50vw, 100vw"
                />
              </Reveal>
            ))}
          </div>
        </Container>
      )}

      {/* ── 02 Devlog ────────────────────────────────────────── */}
      <Container as="section" id="latest" aria-labelledby="latest-title" className="pt-(--space-section)">
        <SectionRail index="02" label="Devlog" count={logRange} id="latest-title" title="Every step, logged." />
        <div className="mt-12">
          <LatestFeed items={latest} total={postCount} />
        </div>
      </Container>
    </>
  );
}
