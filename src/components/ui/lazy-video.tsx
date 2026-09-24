"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  src: string;
  poster?: string | null;
  label: string;
  /** Ambient loop (muted, no controls) vs. a regular player. */
  ambient?: boolean;
  className?: string;
};

/**
 * Video that only attaches its source when near the viewport. Shows the
 * poster frame until then. Ambient videos never play under reduced motion.
 */
export function LazyVideo({ src, poster, label, ambient = false, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!active || !ambient || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.play().catch(() => {});
  }, [active, ambient]);

  return (
    <video
      ref={ref}
      className={cn("size-full object-cover", className)}
      poster={poster ?? undefined}
      preload="none"
      playsInline
      aria-label={label}
      {...(ambient ? { muted: true, loop: true } : { controls: true })}
    >
      {active && <source src={src} />}
    </video>
  );
}
