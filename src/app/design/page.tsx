import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LatestFeed } from "@/components/home/latest-feed";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Emphasis } from "@/components/ui/emphasis";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ArrowRight, ArrowUpRight, Close, Menu, Pin, Play, Rss } from "@/components/ui/icons";
import { Kbd } from "@/components/ui/kbd";
import { MediaFrame } from "@/components/ui/media-frame";
import { ProjectCard } from "@/components/ui/project-card";
import { SectionRail } from "@/components/ui/section-rail";
import { StatusBadge } from "@/components/ui/status-badge";
import { TagList } from "@/components/ui/tag";
import { TextLink } from "@/components/ui/text-link";
import { TimelineMarker } from "@/components/ui/timeline-marker";
import { getDb } from "@/db/client";
import { postType, projectStatus } from "@/db/schema";
import { POST_TYPE_LABEL } from "@/lib/labels";
import { countPublicPosts, getFeaturedProjects, getLatestPosts } from "@/lib/projects/queries";

export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };

const colors = [
  ["bg", "bg-bg"],
  ["surface-1", "bg-surface-1"],
  ["surface-2", "bg-surface-2"],
  ["surface-3", "bg-surface-3"],
  ["line-strong", "bg-line-strong"],
  ["fg-subtle", "bg-fg-subtle"],
  ["fg-muted", "bg-fg-muted"],
  ["fg", "bg-fg"],
  ["accent", "bg-accent"],
] as const;

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-line py-12 lg:grid-cols-12">
      <h2 className="label text-fg-muted lg:col-span-3">{title}</h2>
      <div className="min-w-0 lg:col-span-9">{children}</div>
    </section>
  );
}

export default async function DesignPage() {
  const db = await getDb();
  const [projects, latest, total] = await Promise.all([
    getFeaturedProjects(db),
    getLatestPosts(db, 2),
    countPublicPosts(db),
  ]);
  const sample = projects[0];

  return (
    <Container className="py-16 md:py-24">
      <SectionRail
        as="h1"
        size="xl"
        label="Reference"
        count="docs/DESIGN.md"
        title="Design system."
        static
        className="mb-12"
      />

      <Block title="Colour">
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
          {colors.map(([name, cls]) => (
            <li key={name} className="space-y-2">
              <div className={`aspect-square shadow-[inset_0_0_0_1px_var(--color-line)] ${cls}`} />
              <p className="label text-fg-muted">{name}</p>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Type">
        <div className="space-y-8">
          <p className="headline text-display-2xl">
            <Emphasis text="Display 2XL — *muted coda.*" />
          </p>
          <p className="headline text-display-xl">Display XL, sentence case.</p>
          <p className="headline text-display-lg">Display LG for section titles.</p>
          <p className="headline text-display-md">Display MD, lead card title</p>
          <p className="headline text-display-sm">Display SM, card title</p>
          <p className="headline text-title">Title, log row</p>
          <p className="max-w-[44ch] text-body-lg text-fg-muted">
            Body LG — Geist Sans 17px. Every project here has an open devlog: follow along from the first greybox to
            launch day.
          </p>
          <p className="max-w-[60ch] text-body text-fg-muted">Body — 15px for taglines, excerpts and footer links.</p>
          <p className="label text-fg-muted">Label — Geist Mono · 11px · uppercase · 01 — (case)</p>
          <p className="meta text-fg-muted">meta — 2026.09.19 · 2560×1097 · 21:9 · 00:12 / 01:24</p>
          <p className="readout">015</p>
        </div>
      </Block>

      <Block title="Rails & LEDs">
        <div className="space-y-10">
          <div>
            <div className="flex items-end justify-between pb-3">
              <Eyebrow index="01">Selected work</Eyebrow>
              <span className="label text-fg-muted">03 items</span>
            </div>
            <div className="rule-caps" />
          </div>
          <div className="flex flex-wrap items-center gap-8 label text-fg-muted">
            <span className="flex items-center gap-2.5">
              <span aria-hidden className="led" /> Static LED
            </span>
            <span className="flex items-center gap-2.5">
              <span aria-hidden className="led led-live" /> Live LED (2s blink)
            </span>
            <span className="group flex items-center gap-2.5">
              <span className="flip label text-fg-subtle">
                <span>01</span>
                <span className="text-fg">View →</span>
              </span>
              Flip index (hover)
            </span>
          </div>
        </div>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button trailingIcon={<ArrowRight />}>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm" variant="secondary">
            Small
          </Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
          <TextLink href="/design">Text link</TextLink>
        </div>
      </Block>

      <Block title="Status & tags">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {projectStatus.enumValues.map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {projectStatus.enumValues.map((s) => (
              <StatusBadge key={s} status={s} variant="mono" />
            ))}
          </div>
          <TagList tags={["Unreal Engine 5", "C++", "Niagara", "Lumen", "Steam Deck"]} max={4} />
          <div className="flex items-center gap-2 text-body text-fg-muted">
            Press <Kbd>⌘</Kbd>
            <Kbd>K</Kbd> to search
          </div>
        </div>
      </Block>

      <Block title="Markers">
        <ul className="grid gap-4 sm:grid-cols-5">
          {postType.enumValues.map((t) => (
            <li key={t} className="flex items-center gap-2">
              <TimelineMarker type={t} />
              <span className="label text-fg-muted">{POST_TYPE_LABEL[t]}</span>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <TimelineMarker type="devlog" origin />
            <span className="label text-fg-muted">Project started</span>
          </li>
        </ul>
      </Block>

      <Block title="Icons">
        <div className="flex gap-5 text-fg-muted">
          {[ArrowRight, ArrowUpRight, Menu, Close, Rss, Play, Pin].map((I, i) => (
            <I key={i} size={20} />
          ))}
        </div>
      </Block>

      <Block title="Media">
        <div className="grid gap-8 md:grid-cols-2">
          <MediaFrame
            media={sample?.cover ?? null}
            sizes="(min-width: 768px) 40vw, 100vw"
            frame={1}
            readout={{ left: <span className="truncate">{sample?.title ?? "Sample"}, cover</span> }}
          />
          <MediaFrame media={null} sizes="50vw" ratio="4/3" readout={{ left: "Empty state", right: null }} />
        </div>
      </Block>

      {sample && (
        <Block title="Project card">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="md:col-span-2">
              <ProjectCard size="feature" index={1} project={sample} sizes="(min-width: 1024px) 66vw, 100vw" />
            </div>
            {projects[1] && <ProjectCard index={2} project={projects[1]} sizes="(min-width: 1024px) 33vw, 100vw" />}
          </div>
        </Block>
      )}

      <Block title="Log rows">
        <LatestFeed items={latest} total={total} />
      </Block>
    </Container>
  );
}
