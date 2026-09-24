import Link from "next/link";
import type { ProjectStatus } from "@/db/schema";
import { cn } from "@/lib/cn";
import type { MediaAsset } from "@/lib/media";
import { ArrowUpRight } from "./icons";
import { MediaFrame } from "./media-frame";
import { StatusBadge } from "./status-badge";

export type ProjectCardData = {
  slug: string;
  title: string;
  tagline: string;
  status: ProjectStatus;
  tech: string[];
  cover: MediaAsset | null;
  /** Optional meta, e.g. "7 updates". */
  meta?: string;
};

type Props = {
  project: ProjectCardData;
  /** "feature" = large lead card. */
  size?: "default" | "feature";
  /** Shown as a small index, e.g. 1 → "01". */
  index?: number;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
  className?: string;
};

/** Media-first project card. The whole card is one link (single tab stop). */
export function ProjectCard({ project, size = "default", index, priority, headingLevel: H = "h3", className }: Props) {
  const feature = size === "feature";
  const meta = [project.tech[0], project.meta].filter(Boolean).join("  ·  ");
  return (
    <article className={cn("group relative", className)}>
      <div className="relative">
        <MediaFrame
          media={project.cover}
          ratio="4/3"
          className={cn(feature ? "rounded-xl sm:aspect-[16/9] lg:aspect-[2/1]" : "rounded-xl")}
          priority={priority}
          sizes={feature ? "(min-width: 1440px) 1376px, 100vw" : "(min-width: 1024px) 50vw, 100vw"}
          imgClassName="transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
        />
        <span
          aria-hidden
          className="absolute top-4 right-4 inline-flex size-10 translate-y-1 items-center justify-center rounded-full bg-fg text-bg opacity-0 transition-[opacity,transform] duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100"
        >
          <ArrowUpRight size={16} />
        </span>
      </div>

      <div className={cn("flex items-start justify-between gap-6", feature ? "mt-6" : "mt-5")}>
        <div className="min-w-0 space-y-1.5">
          <H
            className={cn("headline", feature ? "text-display-md" : "text-[1.375rem] leading-tight tracking-[-0.03em]")}
          >
            <Link
              href={`/projects/${project.slug}`}
              className="outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-accent"
            >
              {project.title}
            </Link>
          </H>
          <p className={cn("text-fg-muted", feature ? "max-w-xl text-[17px]" : "text-[15px]")}>{project.tagline}</p>
        </div>
        {index !== undefined && (
          <span aria-hidden className="pt-2 label text-fg-subtle">
            {String(index).padStart(2, "0")}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <StatusBadge status={project.status} />
        {meta && <span className="text-[13px] text-fg-subtle">{meta}</span>}
      </div>
    </article>
  );
}
