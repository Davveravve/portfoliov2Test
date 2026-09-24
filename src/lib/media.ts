import type { Media, MediaKind } from "@/db/schema";
import { mediaUrl } from "@/lib/storage";

/** What UI components need to render a media item. Serializable. */
export type MediaAsset = {
  url: string;
  alt: string;
  kind: MediaKind;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  posterUrl: string | null;
};

export function toAsset(m: Media | null | undefined): MediaAsset | null {
  if (!m) return null;
  return {
    url: mediaUrl(m.key),
    alt: m.alt,
    kind: m.kind,
    width: m.width,
    height: m.height,
    blurDataUrl: m.blurDataUrl,
    posterUrl: m.posterKey ? mediaUrl(m.posterKey) : null,
  };
}
