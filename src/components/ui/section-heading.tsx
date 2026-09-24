import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Emphasis } from "./emphasis";
import { Eyebrow } from "./eyebrow";

type Props = {
  eyebrow?: ReactNode;
  /** String titles support *emphasis*. */
  title: ReactNode;
  /** Right-aligned slot (e.g. "View all" link). */
  action?: ReactNode;
  id?: string;
  as?: "h1" | "h2" | "h3";
  size?: "lg" | "xl";
  className?: string;
};

export function SectionHeading({ eyebrow, title, action, id, as: Tag = "h2", size = "lg", className }: Props) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-8 gap-y-5", className)}>
      <div className="space-y-5">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Tag id={id} className={cn("headline", size === "xl" ? "text-display-xl" : "text-display-lg")}>
          {typeof title === "string" ? <Emphasis text={title} /> : title}
        </Tag>
      </div>
      {action}
    </div>
  );
}
