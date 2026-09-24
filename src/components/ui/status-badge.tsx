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

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[13px] text-fg-muted", className)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", dot[status])} />
      {PROJECT_STATUS_LABEL[status]}
    </span>
  );
}
