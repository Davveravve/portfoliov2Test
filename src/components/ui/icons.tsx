import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 16, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      aria-hidden
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 8h11M9.5 4l4 4-4 4" />
  </Icon>
);
export const ArrowUpRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
  </Icon>
);
export const Menu = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2 5h12M2 11h12" />
  </Icon>
);
export const Close = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
  </Icon>
);
export const Rss = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 3a10 10 0 0 1 10 10M3 7.5A5.5 5.5 0 0 1 8.5 13" />
    <circle cx="3.75" cy="12.25" r="0.75" fill="currentColor" stroke="none" />
  </Icon>
);
export const Play = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 3.5v9l7-4.5-7-4.5z" fill="currentColor" stroke="none" />
  </Icon>
);
export const Pin = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 2.5h4M7 2.5v4l-2.5 3h7L9 6.5v-4M8 9.5v4" />
  </Icon>
);
