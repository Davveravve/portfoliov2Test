import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import { ArrowRight } from "./icons";

/** Inline "View all →" style link. Aligns flush with text (no button padding). */
export function TextLink({ className, children, ...props }: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      className={cn(
        "group inline-flex items-center gap-2 text-sm text-fg-muted transition-colors hover:text-fg",
        className,
      )}
      {...props}
    >
      {children}
      <ArrowRight className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-accent" />
    </Link>
  );
}
