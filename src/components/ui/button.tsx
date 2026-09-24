import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn inline-flex shrink-0 items-center justify-center gap-2.5 rounded-xs text-ui whitespace-nowrap transition-[background-color,border-color,color] duration-150 ease-out active:translate-y-px disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "bg-fg text-bg hover:bg-white",
  secondary: "text-fg ring-1 ring-line-strong ring-inset hover:bg-surface-2 hover:ring-fg-subtle active:bg-surface-3",
  ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg active:bg-surface-3",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4",
  lg: "h-12 w-full px-5 text-[15px] md:h-11 md:w-auto",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type CommonProps = { variant?: Variant; size?: Size; icon?: ReactNode; trailingIcon?: ReactNode };

function Inner({ variant, icon, trailingIcon, children }: CommonProps & { children: ReactNode }) {
  return (
    <>
      {/* The primary button carries the power LED. */}
      {variant === "primary" || variant === undefined ? <span aria-hidden className="led" /> : icon}
      {children}
      {trailingIcon && (
        <span className="transition-transform duration-150 ease-out group-hover/btn:translate-x-0.5">
          {trailingIcon}
        </span>
      )}
    </>
  );
}

export function Button({
  variant,
  size,
  icon,
  trailingIcon,
  className,
  children,
  type = "button",
  ...props
}: CommonProps & ComponentPropsWithoutRef<"button">) {
  return (
    <button type={type} className={buttonClasses({ variant, size, className })} {...props}>
      <Inner variant={variant} icon={icon} trailingIcon={trailingIcon}>
        {children}
      </Inner>
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  icon,
  trailingIcon,
  className,
  children,
  ...props
}: CommonProps & ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props}>
      <Inner variant={variant} icon={icon} trailingIcon={trailingIcon}>
        {children}
      </Inner>
    </Link>
  );
}
