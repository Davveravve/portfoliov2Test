"use client";

import { useEffect, useRef, type Ref } from "react";
import { cn } from "@/lib/cn";

type Props = {
  src: string;
  /** Native poster. Pass null when an optimised <Image> poster is layered underneath instead. */
  poster?: string | null;
  label: string;
  /** Muted in-view loop. Plays only ≥ md, ≥ 50% in view, without reduced motion, and while not `paused`. */
  ambient?: boolean;
  /** User-controlled stop for the ambient loop (WCAG 2.2.2). */
  paused?: boolean;
  /** Native controls. Defaults to `!ambient`. */
  controls?: boolean;
  className?: string;
  ref?: Ref<HTMLVideoElement>;
};

const allowed = () =>
  window.matchMedia("(min-width: 48rem)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Video that only attaches its source near the viewport and shows the poster
 * until then. Ambient loops play while ≥ 50% visible and pause otherwise.
 */
export function LazyVideo({ src, poster, label, ambient = false, paused = false, controls, className, ref }: Props) {
  const inner = useRef<HTMLVideoElement>(null);
  const inView = useRef(false);

  // Merge the forwarded ref with the internal one.
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") ref(inner.current);
    else ref.current = inner.current;
  }, [ref]);

  // Attach the source only when the element gets near the viewport.
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

  // Ambient: play while visible, pause otherwise.
  useEffect(() => {
    const el = inner.current;
    if (!el || !ambient) return;
    const visible = new IntersectionObserver(
      ([entry]) => {
        inView.current = Boolean(entry?.isIntersecting);
        if (inView.current && !paused && allowed()) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.5 },
    );
    visible.observe(el);
    return () => visible.disconnect();
  }, [ambient, paused]);

  return (
    <video
      ref={inner}
      className={cn("size-full object-cover", className)}
      poster={poster ?? undefined}
      preload="none"
      playsInline
      aria-label={label}
      controls={controls ?? !ambient}
      {...(ambient ? { muted: true, loop: true } : {})}
    />
  );
}
