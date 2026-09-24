import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Small mono label with an accent dot. Used above headings and as meta. */
export function Eyebrow({
  children,
  className,
  dot = true,
}: {
  children: ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <p className={cn("flex items-center gap-2.5 label text-fg-muted", className)}>
      {dot && <span aria-hidden className="inline-block size-1 rounded-full bg-accent" />}
      {children}
    </p>
  );
}
