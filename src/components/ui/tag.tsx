import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full bg-surface-2 px-2.5 text-[12px] tracking-[-0.005em] text-fg-muted ring-1 ring-line ring-inset",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function TagList({ tags, max, className }: { tags: readonly string[]; max?: number; className?: string }) {
  const shown = max ? tags.slice(0, max) : tags;
  const rest = tags.length - shown.length;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Tech">
      {shown.map((t) => (
        <li key={t}>
          <Tag>{t}</Tag>
        </li>
      ))}
      {rest > 0 && (
        <li>
          <Tag className="text-fg-subtle">+{rest}</Tag>
        </li>
      )}
    </ul>
  );
}
