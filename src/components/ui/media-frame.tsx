import Image from "next/image";
import type { CSSProperties, ReactNode, Ref } from "react";
import { cn } from "@/lib/cn";
import { formatDimensions } from "@/lib/format";
import type { MediaAsset } from "@/lib/media";
import { LazyVideo } from "./lazy-video";

type Props = {
  media: MediaAsset | null;
  /** CSS aspect ratio, e.g. "16/9". Override per breakpoint via `className` (e.g. `lg:aspect-[21/9]`). */
  ratio?: string;
  /** Exact per placement — required. */
  sizes: string;
  priority?: boolean;
  ambient?: boolean;
  /** Stops an ambient loop (user control). */
  paused?: boolean;
  /** Native video controls; defaults to `!ambient`. */
  controls?: boolean;
  /** Full-bleed: no side ring, 1px rules top and bottom. The readout bar stays on the grid. */
  bleed?: boolean;
  /** Caption/controls rendered UNDER the frame, never on it. `right` defaults to the asset dimensions. */
  readout?: { left: ReactNode; right?: ReactNode | null };
  /** Prefixes the readout with "FRAME 01 — ". */
  frame?: number | string;
  className?: string;
  imgClassName?: string;
  videoRef?: Ref<HTMLVideoElement>;
};

/**
 * The one way to show an image or clip: fixed ratio (no layout shift), blur
 * placeholder, inset hairline ring, nothing drawn on top of the media.
 */
export function MediaFrame({
  media,
  ratio = "16/9",
  sizes,
  priority,
  ambient,
  paused,
  controls,
  bleed,
  readout,
  frame,
  className,
  imgClassName,
  videoRef,
}: Props) {
  const box = (
    <div
      className={cn(
        "relative aspect-(--ratio) overflow-hidden bg-surface-1",
        bleed
          ? "bleed border-y border-line-strong"
          : "shadow-[inset_0_0_0_1px_var(--color-line)] transition-shadow duration-150 group-hover:shadow-[inset_0_0_0_1px_var(--color-line-strong)]",
        className,
      )}
      style={{ "--ratio": ratio } as CSSProperties}
    >
      {media?.kind === "video" ? (
        <>
          {/* The poster is an optimised, preloadable <Image> (the LCP candidate);
              the video sits on top and stays transparent until it has frames. */}
          {media.posterUrl && (
            <Image
              src={media.posterUrl}
              alt=""
              fill
              sizes={sizes}
              priority={priority}
              fetchPriority={priority ? "high" : undefined}
              placeholder={media.blurDataUrl ? "blur" : "empty"}
              blurDataURL={media.blurDataUrl ?? undefined}
              className="object-cover"
            />
          )}
          <LazyVideo
            src={media.url}
            poster={null}
            label={media.alt}
            ambient={ambient}
            paused={paused}
            controls={controls}
            ref={videoRef}
            className="absolute inset-0"
          />
          <noscript>
            <video
              className="absolute inset-0 size-full object-cover"
              controls
              preload="none"
              poster={media.posterUrl ?? undefined}
              src={media.url}
            />
          </noscript>
        </>
      ) : media ? (
        <Image
          src={media.url}
          alt={media.alt}
          fill
          sizes={sizes}
          priority={priority}
          fetchPriority={priority ? "high" : undefined}
          unoptimized={media.kind === "gif"}
          placeholder={media.blurDataUrl ? "blur" : "empty"}
          blurDataURL={media.blurDataUrl ?? undefined}
          className={cn("object-cover", imgClassName)}
        />
      ) : (
        <div aria-hidden className="absolute inset-0 grid place-items-center">
          <span className="label text-fg-subtle">No media</span>
        </div>
      )}
    </div>
  );

  if (!readout) return box;

  const right =
    readout.right === undefined ? formatDimensions(media?.width ?? null, media?.height ?? null) : readout.right;
  const prefix =
    frame === undefined ? null : `Frame ${typeof frame === "number" ? String(frame).padStart(2, "0") : frame} — `;

  return (
    <div>
      {box}
      <div className="flex items-center justify-between gap-6 py-3 meta text-fg-muted">
        <div className="flex min-w-0 items-center gap-2.5 uppercase">
          {prefix && <span className="shrink-0">{prefix}</span>}
          {readout.left}
        </div>
        {right && <div className="hidden shrink-0 uppercase md:block">{right}</div>}
      </div>
      <div className="rule-caps rule-caps-soft" />
    </div>
  );
}
