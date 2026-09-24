import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import { ArrowRight } from "./icons";

/** Inline "All projects →" link. → is in-site navigation; ↗ leaves the site. */
export function TextLink({ className, children, ...props }: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      className={cn(
        "group inline-flex min-h-11 items-center gap-1.5 text-ui text-fg-muted transition-colors duration-150 hover:text-fg",
        className,
      )}
      {...props}
    >
      {children}
      <ArrowRight size={14} className="transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
    </Link>
  );
}
