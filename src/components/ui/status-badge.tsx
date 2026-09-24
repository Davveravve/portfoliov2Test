import type { ProjectStatus } from "@/db/schema";
import { cn } from "@/lib/cn";
import { PROJECT_STATUS_LABEL } from "@/lib/labels";

const dot: Record<ProjectStatus, string> = {
  prototype: "bg-status-prototype",
  in_development: "bg-status-in-development",
  released: "bg-status-released",
  on_hold: "bg-status-on-hold",
  archived: "bg-status-archived",
};

/** Round 6px status dot + label. `mono` for use inside mono rows. Dots are round; LEDs are square. */
export function StatusBadge({
  status,
  variant = "default",
  className,
}: {
  status: ProjectStatus;
  variant?: "default" | "mono";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-fg-muted",
        variant === "mono" ? "label" : "text-[13px]",
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", dot[status])} />
      {PROJECT_STATUS_LABEL[status]}
    </span>
  );
}
