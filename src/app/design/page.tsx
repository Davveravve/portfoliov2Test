import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ArrowRight, ArrowUpRight, Close, Menu, Pin, Play, Rss } from "@/components/ui/icons";
import { Kbd } from "@/components/ui/kbd";
import { MediaFrame } from "@/components/ui/media-frame";
import { ProjectCard } from "@/components/ui/project-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tag, TagList } from "@/components/ui/tag";
import { TimelineMarker } from "@/components/ui/timeline-marker";
import { getDb } from "@/db/client";
import { projectStatus, postType } from "@/db/schema";
import { POST_TYPE_LABEL } from "@/lib/labels";
import { getFeaturedProjects } from "@/lib/projects/queries";

export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

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
      <h2 className="label text-fg-subtle lg:col-span-3">{title}</h2>
      <div className="min-w-0 lg:col-span-9">{children}</div>
    </section>
  );
}

export default async function DesignPage() {
  const projects = await getFeaturedProjects(await getDb());
  const sample = projects[0];

  return (
    <Container className="py-16 md:py-24">
      <SectionHeading as="h1" eyebrow="Reference" title="Design system" className="mb-4 border-b-0" />

      <Block title="Colour">
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
          {colors.map(([name, cls]) => (
            <li key={name} className="space-y-2">
              <div className={`aspect-square rounded-sm ring-1 ring-line ring-inset ${cls}`} />
              <p className="label text-fg-muted">{name}</p>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Type">
        <div className="space-y-8">
          <p className="font-display-x text-display-2xl">Display 2XL</p>
          <p className="font-display-x text-display-xl">Display XL</p>
          <p className="font-display-x text-display-lg">Display LG</p>
          <p className="font-display-x text-display-md">Display MD</p>
          <p className="font-display-x text-display-sm">Display SM</p>
          <p className="max-w-prose text-[17px] leading-relaxed text-fg-muted">
            Body — Geist Sans. Every project here has an open devlog: follow along from the first greybox to launch day.
            Long-form text sits at 17px with a relaxed measure.
          </p>
          <p className="label text-fg-muted">Label — Geist Mono · 11px · uppercase</p>
          <Eyebrow>Eyebrow with accent tick</Eyebrow>
        </div>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button trailingIcon={<ArrowRight />}>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Block>

      <Block title="Status & tags">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {projectStatus.enumValues.map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
          <TagList tags={["Unreal Engine 5", "C++", "Niagara", "Lumen", "Steam Deck"]} max={4} />
          <div className="flex items-center gap-2 text-sm text-fg-muted">
            <Tag>Tag</Tag> Press <Kbd>⌘</Kbd>
            <Kbd>K</Kbd> to search
          </div>
        </div>
      </Block>

      <Block title="Timeline markers">
        <ul className="grid gap-4 sm:grid-cols-5">
          {postType.enumValues.map((t) => (
            <li key={t} className="flex items-center gap-2">
              <TimelineMarker type={t} />
              <span className="label text-fg-muted">{POST_TYPE_LABEL[t]}</span>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <TimelineMarker type="devlog" origin />
            <span className="label text-accent">Project started</span>
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
        <div className="grid gap-6 md:grid-cols-2">
          <MediaFrame
            media={sample?.cover ?? null}
            sizes="(min-width: 768px) 40vw, 100vw"
            caption="MediaFrame with caption — 16:9, blur placeholder."
          />
          <MediaFrame media={null} sizes="50vw" ratio="4/3" caption="Empty state." />
        </div>
      </Block>

      {sample && (
        <Block title="Project card">
          <div className="grid gap-8 md:grid-cols-2">
            <ProjectCard project={{ ...sample, meta: `${sample.updateCount} updates` }} headingLevel="h3" />
          </div>
        </Block>
      )}
    </Container>
  );
}
