import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { MediaAsset } from "@/lib/media";
import { LazyVideo } from "./lazy-video";

type Props = {
  media: MediaAsset | null;
  /** CSS aspect ratio, e.g. "16/9". Media is cropped to fill. Override per breakpoint via `className` (e.g. `lg:aspect-[21/9]`). */
  ratio?: string;
  sizes: string;
  priority?: boolean;
  ambient?: boolean;
  caption?: ReactNode;
  className?: string;
  imgClassName?: string;
};

/**
 * The one way to show a screenshot or clip: fixed ratio (no layout shift),
 * blur placeholder, hairline border. Falls back to an empty frame.
 */
export function MediaFrame({
  media,
  ratio = "16/9",
  sizes,
  priority,
  ambient,
  caption,
  className,
  imgClassName,
}: Props) {
  const frame = (
    <div
      className={cn(
        "relative aspect-(--ratio) overflow-hidden rounded-sm bg-surface-2 ring-1 ring-line ring-inset",
        className,
      )}
      style={{ "--ratio": ratio } as CSSProperties}
    >
      {media?.kind === "video" ? (
        <LazyVideo src={media.url} poster={media.posterUrl} label={media.alt} ambient={ambient} />
      ) : media ? (
        <Image
          src={media.url}
          alt={media.alt}
          fill
          sizes={sizes}
          priority={priority}
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

  if (!caption) return frame;
  return (
    <figure className="space-y-3">
      {frame}
      <figcaption className="text-sm text-fg-subtle">{caption}</figcaption>
    </figure>
  );
}
