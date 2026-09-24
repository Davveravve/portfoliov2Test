import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

type ContainerProps<T extends ElementType> = { as?: T } & ComponentPropsWithoutRef<T>;

/** Page-width container: max 1440px with responsive gutters. */
export function Container<T extends ElementType = "div">({ as, className, ...props }: ContainerProps<T>) {
  const Tag = as ?? "div";
  return <Tag className={cn("mx-auto w-full max-w-page px-gutter", className)} {...props} />;
}
