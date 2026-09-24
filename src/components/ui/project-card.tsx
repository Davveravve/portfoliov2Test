import Link from "next/link";
import type { ProjectStatus } from "@/db/schema";
import { cn } from "@/lib/cn";
import type { MediaAsset } from "@/lib/media";
import { ArrowUpRight } from "./icons";
import { MediaFrame } from "./media-frame";
import { StatusBadge } from "./status-badge";
import { TagList } from "./tag";

export type ProjectCardData = {
  slug: string;
  title: string;
  tagline: string;
  status: ProjectStatus;
  tech: string[];
  cover: MediaAsset | null;
  /** Optional footer meta, e.g. "12 updates · last 3 days ago". */
  meta?: string;
};

type Props = {
  project: ProjectCardData;
  /** "feature" = large lead card. */
  size?: "default" | "feature";
  priority?: boolean;
  headingLevel?: "h2" | "h3";
  className?: string;
};

/** Media-first project card. The whole card is one link (single tab stop). */
export function ProjectCard({ project, size = "default", priority, headingLevel: H = "h3", className }: Props) {
  const feature = size === "feature";
  return (
    <article className={cn("group relative flex flex-col gap-5", className)}>
      <MediaFrame
        media={project.cover}
        ratio={feature ? "16/9" : "16/10"}
        className={feature ? "lg:aspect-[21/9]" : undefined}
        priority={priority}
        sizes={feature ? "(min-width: 1440px) 1376px, 100vw" : "(min-width: 1024px) 50vw, 100vw"}
        imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.025]"
      />
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 space-y-2.5">
          <StatusBadge status={project.status} />
          <H className={cn("font-display-x", feature ? "text-display-md" : "text-display-sm")}>
            <Link
              href={`/projects/${project.slug}`}
              className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-sm focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-accent"
            >
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 ease-out group-hover:bg-[length:100%_1px]">
                {project.title}
              </span>
            </Link>
          </H>
          <p className={cn("text-fg-muted", feature ? "max-w-xl text-base" : "text-[15px] leading-relaxed")}>
            {project.tagline}
          </p>
        </div>
        <ArrowUpRight
          size={20}
          className="mt-6 shrink-0 text-fg-subtle transition-[color,transform] duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
        />
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
        <TagList tags={project.tech} max={3} />
        {project.meta && <p className="label text-fg-subtle">{project.meta}</p>}
      </div>
    </article>
  );
}
