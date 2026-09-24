"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type Props = { as?: ElementType; delay?: number; className?: string; children: ReactNode };

/**
 * Fade/slide-in when scrolled into view. Content is fully visible without JS
 * and under prefers-reduced-motion (handled in globals.css).
 */
export function Reveal({ as: Tag = "div", delay = 0, className, children }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} data-reveal="" className={className} style={delay ? { "--reveal-delay": `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
