import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "./eyebrow";

type Props = {
  eyebrow?: ReactNode;
  title: ReactNode;
  /** Right-aligned slot (e.g. "View all" link). */
  action?: ReactNode;
  id?: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
};

export function SectionHeading({ eyebrow, title, action, id, as: Tag = "h2", className }: Props) {
  return (
    <div
      className={cn("flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-line pb-5", className)}
    >
      <div className="space-y-4">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Tag id={id} className="font-display-x text-display-lg">
          {title}
        </Tag>
      </div>
      {action}
    </div>
  );
}
