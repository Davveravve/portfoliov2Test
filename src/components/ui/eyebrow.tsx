import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Mono uppercase label with an accent tick. Used above headings and as meta. */
export function Eyebrow({
  children,
  className,
  tick = true,
}: {
  children: ReactNode;
  className?: string;
  tick?: boolean;
}) {
  return (
    <p className={cn("flex items-center gap-2.5 label text-fg-muted", className)}>
      {tick && <span aria-hidden className="inline-block h-px w-5 bg-accent" />}
      {children}
    </p>
  );
}
