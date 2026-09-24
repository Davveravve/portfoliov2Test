import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** 11px mono label. `index` is rendered first in full contrast: "01 — SELECTED WORK". */
export function Eyebrow({ children, index, className }: { children: ReactNode; index?: string; className?: string }) {
  return (
    <p className={cn("label text-fg-muted", className)}>
      {index && (
        <>
          <span className="text-fg">{index}</span> —{" "}
        </>
      )}
      {children}
    </p>
  );
}
