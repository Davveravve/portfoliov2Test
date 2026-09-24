"use client";

import { useEffect, useRef, type Ref } from "react";
import { cn } from "@/lib/cn";

type Props = {
  src: string;
  poster?: string | null;
  label: string;
  /** Muted in-view loop (no controls). Plays only ≥ md, in view, without reduced motion. */
  ambient?: boolean;
  className?: string;
  ref?: Ref<HTMLVideoElement>;
};

/**
 * Video that only attaches its source near the viewport and shows the poster
 * until then. Ambient loops play while ≥ 50% visible and pause otherwise.
 */
export function LazyVideo({ src, poster, label, ambient = false, className, ref }: Props) {
  const inner = useRef<HTMLVideoElement>(null);

  // Merge the forwarded ref with the internal one.
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") ref(inner.current);
    else ref.current = inner.current;
  }, [ref]);

  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !el.querySelector("source")) {
          const source = document.createElement("source");
          source.src = src;
          el.append(source);
          el.load();
          near.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    near.observe(el);
    return () => near.disconnect();
  }, [src]);

  useEffect(() => {
    const el = inner.current;
    if (!el || !ambient) return;
    const allowed = () =>
      window.matchMedia("(min-width: 48rem)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const visible = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && allowed()) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.5 },
    );
    visible.observe(el);
    return () => visible.disconnect();
  }, [ambient]);

  return (
    <video
      ref={inner}
      className={cn("size-full object-cover", className)}
      poster={poster ?? undefined}
      preload="none"
      playsInline
      aria-label={label}
      {...(ambient ? { muted: true, loop: true } : { controls: true })}
    />
  );
}
