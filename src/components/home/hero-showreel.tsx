"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Play } from "@/components/ui/icons";
import { MediaFrame } from "@/components/ui/media-frame";
import { cn } from "@/lib/cn";
import { formatDimensions, formatTimecode } from "@/lib/format";
import type { MediaAsset } from "@/lib/media";

type Props = {
  /** The showreel video, or null when none is configured. */
  video: MediaAsset | null;
  /** Poster shown in the frame (the showreel's own, or the newest post cover). */
  poster: MediaAsset | null;
  /** What the poster is, when no showreel exists: "Hollowdeep / Showcase: The Sunken Chapel". */
  posterLabel: string | null;
  /** Owner-entered duration in seconds; replaced by the real value once metadata loads. */
  duration: number;
  ambient: boolean;
};

const frameClass = "lg:aspect-[21/9]";

/**
 * Full-bleed showreel between two rules with nothing drawn on it. The readout
 * bar under it carries the play control, the live timecode and the real
 * dimensions. Pressing play opens a native <dialog> player.
 */
export function HeroShowreel({ video, poster, posterLabel, duration, ambient }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogVideoRef = useRef<HTMLVideoElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [elapsed, setElapsed] = useState(0);
  const [total, setTotal] = useState(duration);
  const [playing, setPlaying] = useState(false);
  const titleId = useId();

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onMeta = () => Number.isFinite(el.duration) && setTotal(el.duration);
    const onTime = () => setElapsed(el.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, [video]);

  const open = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    videoRef.current?.pause();
    dialog.showModal();
    dialogVideoRef.current?.play().catch(() => {});
  };
  const close = () => {
    dialogVideoRef.current?.pause();
    dialogRef.current?.close();
  };

  if (!video) {
    return (
      <MediaFrame
        media={poster}
        priority
        bleed
        sizes="100vw"
        className={frameClass}
        readout={{
          left: (
            <span className="truncate">
              Showreel — in production{posterLabel && <span className="text-fg-subtle"> · Poster: {posterLabel}</span>}
            </span>
          ),
        }}
      />
    );
  }

  const dims = formatDimensions(video.width, video.height);
  return (
    <>
      <MediaFrame
        media={{ ...video, posterUrl: video.posterUrl ?? poster?.url ?? null }}
        priority
        bleed
        ambient={ambient}
        sizes="100vw"
        className={frameClass}
        videoRef={videoRef}
        readout={{
          left: (
            <button
              ref={buttonRef}
              type="button"
              onClick={open}
              className="-my-3 flex h-10 items-center gap-2.5 uppercase transition-colors duration-150 hover:text-fg"
            >
              <Play size={10} />
              <span>Showreel</span>
              <span className={cn("min-w-[14ch] text-left tabular-nums", playing ? "text-accent" : "text-fg-muted")}>
                {total > 0 ? ` · ${formatTimecode(elapsed)} / ${formatTimecode(total)}` : ""}
              </span>
              <span className="sr-only">Open the showreel player</span>
            </button>
          ),
          right: dims || null,
        }}
      />
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => buttonRef.current?.focus()}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto w-[min(100%-2rem,1200px)] rounded-xs bg-surface-1 p-0 text-fg ring-1 ring-line-strong backdrop:bg-bg/92"
      >
        <div className="flex items-center justify-between gap-6 px-4 py-3">
          <p id={titleId} className="label text-fg-muted">
            Showreel{dims && <span className="text-fg-subtle"> · {dims}</span>}
          </p>
          <button
            type="button"
            onClick={close}
            className="-mr-1 h-8 px-1 label text-fg-muted transition-colors hover:text-fg"
          >
            Close
          </button>
        </div>
        <video
          ref={dialogVideoRef}
          className="aspect-video w-full bg-bg"
          controls
          preload="metadata"
          poster={video.posterUrl ?? poster?.url ?? undefined}
          src={video.url}
        />
      </dialog>
    </>
  );
}
