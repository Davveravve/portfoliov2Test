import { MediaFrame } from "@/components/ui/media-frame";
import { Play } from "@/components/ui/icons";
import { site } from "@/config/site";
import type { MediaAsset } from "@/lib/media";
import { mediaUrl } from "@/lib/storage";

const resolve = (src: string) => (/^https?:\/\//.test(src) || src.startsWith("/") ? src : mediaUrl(src));

/**
 * Showreel slot. Plays `site.showreel` when configured; otherwise shows a
 * poster (the lead project's cover) with a "coming soon" label.
 */
export function Showreel({ fallback }: { fallback: MediaAsset | null }) {
  const { src, poster } = site.showreel;
  if (src) {
    const media: MediaAsset = {
      url: resolve(src),
      alt: `${site.name} — showreel`,
      kind: "video",
      width: 1920,
      height: 1080,
      blurDataUrl: null,
      posterUrl: poster ? resolve(poster) : (fallback?.url ?? null),
    };
    return <MediaFrame media={media} sizes="(min-width: 1024px) 60vw, 100vw" ambient />;
  }

  return (
    <div className="relative">
      <MediaFrame media={fallback} priority sizes="(min-width: 1024px) 60vw, 100vw" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-3 p-4 md:p-5">
        <span
          aria-hidden
          className="grid size-9 place-items-center rounded-full border border-white/25 bg-black/40 text-white/90 backdrop-blur-sm"
        >
          <Play size={12} />
        </span>
        <span className="label text-white/80">Showreel — coming soon</span>
      </div>
    </div>
  );
}
