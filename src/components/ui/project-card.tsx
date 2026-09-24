import Link from "next/link";
import type { ProjectStatus } from "@/db/schema";
import { cn } from "@/lib/cn";
import { pad } from "@/lib/format";
import { PROJECT_STATUS_LABEL } from "@/lib/labels";
import type { MediaAsset } from "@/lib/media";
import { MediaFrame } from "./media-frame";
import { StatusBadge } from "./status-badge";

export type ProjectCardData = {
  slug: string;
  title: string;
  tagline: string;
  status: ProjectStatus;
  tech: string[];
  cover: MediaAsset | null;
  /** Public update count, shown zero-padded: "007 UPD". */
  updateCount: number;
};

type Props = {
  project: ProjectCardData;
  /** "feature" = the 12-column lead card. */
  size?: "default" | "feature";
  /** 1-based position, rendered as a mono index that flips to "VIEW →" on hover. */
  index: number;
  /** Exact `sizes` for the placement. */
  sizes: string;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
  className?: string;
};

const dot: Record<ProjectStatus, string> = {
  prototype: "bg-status-prototype",
  in_development: "bg-status-in-development",
  released: "bg-status-released",
  on_hold: "bg-status-on-hold",
  archived: "bg-status-archived",
};

function FlipIndex({ index }: { index: number }) {
  return (
    <span aria-hidden className="flip mt-1 label text-fg-subtle">
      <span>{pad(index, 2)}</span>
      <span className="text-fg">View →</span>
    </span>
  );
}

/** One mono line: status dot · status · engine · update count. Used by both card sizes. */
function StatusLine({ project, className }: { project: ProjectCardData; className?: string }) {
  const facts = [PROJECT_STATUS_LABEL[project.status], project.tech[0] ?? "—", `${pad(project.updateCount, 3)} upd`];
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 label text-fg-muted", className)}>
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", dot[project.status])} />
      {/* Wraps between facts on narrow screens rather than cutting data off. */}
      {facts.map((fact, i) => (
        <span key={i} className="whitespace-nowrap">
          {i > 0 && <span aria-hidden>· </span>}
          {fact}
        </span>
      ))}
    </p>
  );
}

function techLine(tech: string[]) {
  const shown = tech.slice(0, 3);
  const rest = tech.length - shown.length;
  return shown.join(" · ") + (rest > 0 ? ` +${rest}` : "");
}

/**
 * Media-first project card. The whole card is one link (single tab stop).
 * On hover the frame ring brightens one step and the index flips; the image
 * never moves.
 */
export function ProjectCard({
  project,
  size = "default",
  index,
  sizes,
  priority,
  headingLevel: H = "h3",
  className,
}: Props) {
  const feature = size === "feature";
  const link = (
    <Link
      href={`/projects/${project.slug}`}
      className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-accent"
    >
      {project.title}
    </Link>
  );

  if (feature) {
    return (
      <article className={cn("group relative", className)}>
        <MediaFrame media={project.cover} ratio="16/9" className="lg:aspect-[2/1]" sizes={sizes} priority={priority} />
        <div className="mt-4 grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-4 border-t border-line pt-4 md:grid-cols-12 md:gap-x-6">
          <div className="md:col-span-1">
            <FlipIndex index={index} />
          </div>
          <div className="min-w-0 md:col-span-6">
            <H className="headline text-display-md">{link}</H>
            <p className="mt-1.5 max-w-[44ch] text-body text-fg-muted">{project.tagline}</p>
            <StatusLine project={project} className="mt-3 md:hidden" />
          </div>
          {/* md+: the full tech list may wrap to a second line rather than silently drop "+N". */}
          <p className="hidden label text-fg-muted md:col-span-3 md:block md:pt-1.5">{techLine(project.tech)}</p>
          <div className="hidden label text-fg-muted md:col-span-2 md:flex md:flex-col md:items-end md:gap-2 md:pt-1.5">
            <StatusBadge status={project.status} variant="mono" />
            <span>{pad(project.updateCount, 3)} upd</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cn("group relative", className)}>
      <MediaFrame media={project.cover} ratio="4/3" className="md:aspect-[16/10]" sizes={sizes} priority={priority} />
      <div className="mt-4 grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-line pt-4">
        <FlipIndex index={index} />
        <div className="min-w-0">
          <H className="headline text-display-sm">{link}</H>
          <p className="mt-1.5 text-body text-fg-muted">{project.tagline}</p>
          <StatusLine project={project} className="mt-3" />
        </div>
      </div>
    </article>
  );
}
