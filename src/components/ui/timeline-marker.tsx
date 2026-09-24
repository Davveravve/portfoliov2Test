import type { PostType } from "@/db/schema";
import { cn } from "@/lib/cn";

/**
 * Node on the log rail. Weight follows SPEC.md §3: release > milestone >
 * showcase > devlog; `origin` marks "Project started". Hollow shapes fill
 * with the row background so the rail is interrupted by the marker.
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
  const hollow = "bg-bg transition-colors duration-150 group-hover:bg-surface-1";
  return (
    <span aria-hidden className={cn("relative grid size-6 shrink-0 place-items-center", className)}>
      {origin ? (
        <span className={cn("grid size-4 place-items-center border border-accent", hollow)}>
          <span className="size-1.5 bg-accent" />
        </span>
      ) : type === "release" ? (
        <span className="size-3.5 rotate-45 bg-accent" />
      ) : type === "milestone" ? (
        <span className={cn("size-3 rotate-45 border-[1.5px] border-accent", hollow)} />
      ) : type === "showcase" ? (
        <span className="size-2.5 rounded-full bg-fg-muted" />
      ) : (
        <span className={cn("size-2.5 rounded-full border-[1.5px] border-fg-subtle", hollow)} />
      )}
    </span>
  );
}
