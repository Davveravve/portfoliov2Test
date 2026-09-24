import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "./eyebrow";
import { Reveal } from "./reveal";

type Props = {
  /** "01" — rendered in full contrast before the label. */
  index?: string;
  label: string;
  /** Right-hand count, already formatted from real data: "03 ITEMS". */
  count?: string;
  action?: ReactNode;
  title: ReactNode;
  id?: string;
  as?: "h1" | "h2";
  size?: "lg" | "xl";
  /** Skip the reveal animation (above the fold). */
  static?: boolean;
  className?: string;
};

/**
 * Section opener: a numbered mono rail with a capped rule that draws itself
 * into view, then the sentence-case title.
 */
export function SectionRail({
  index,
  label,
  count,
  action,
  title,
  id,
  as: Tag = "h2",
  size = "lg",
  static: isStatic,
  className,
}: Props) {
  const rail = (
    <>
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-8 gap-y-1 pb-1">
        <Eyebrow index={index}>{label}</Eyebrow>
        {(count || action) && (
          <div className="flex items-center gap-6">
            {count && <span className="label text-fg-muted">{count}</span>}
            {action}
          </div>
        )}
      </div>
      <div className="rule-caps" />
    </>
  );
  return (
    <div className={className}>
      {isStatic ? <div>{rail}</div> : <Reveal>{rail}</Reveal>}
      <Tag
        id={id}
        className={cn("mt-6 max-w-[26ch] headline md:mt-8", size === "xl" ? "text-display-xl" : "text-display-lg")}
      >
        {title}
      </Tag>
    </div>
  );
}
