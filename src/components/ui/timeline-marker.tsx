import type { PostType } from "@/db/schema";
import { cn } from "@/lib/cn";

/**
 * Node on the vertical timeline rail. Weight follows SPEC.md §3:
 * release > milestone > showcase > devlog. `origin` marks "Project started".
 * Always rendered centred in a 24px slot so the rail stays aligned.
 */
export function TimelineMarker({
  type,
  origin = false,
  className,
}: {
  type: PostType;
  origin?: boolean;
  className?: string;
}) {
  return (
    <span aria-hidden className={cn("relative grid size-6 shrink-0 place-items-center", className)}>
      {origin ? (
        <span className="grid size-4 place-items-center border border-accent bg-bg">
          <span className="size-1.5 bg-accent" />
        </span>
      ) : type === "release" ? (
        <span className="size-3.5 rotate-45 bg-accent" />
      ) : type === "milestone" ? (
        <span className="size-3 rotate-45 border-[1.5px] border-accent bg-bg" />
      ) : type === "showcase" ? (
        <span className="size-2.5 rounded-full bg-fg-muted" />
      ) : (
        <span className="size-2.5 rounded-full border-[1.5px] border-fg-subtle bg-bg" />
      )}
    </span>
  );
}
