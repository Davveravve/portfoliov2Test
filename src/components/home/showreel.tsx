import { MediaFrame } from "@/components/ui/media-frame";
import { Play } from "@/components/ui/icons";
import { site } from "@/config/site";
import type { MediaAsset } from "@/lib/media";
import { mediaUrl } from "@/lib/storage";

const resolve = (src: string) => (/^https?:\/\//.test(src) || src.startsWith("/") ? src : mediaUrl(src));
const frame = "rounded-xl lg:aspect-[21/9]";
const sizes = "(min-width: 1440px) 1376px, 100vw";

/**
 * Showreel slot. Plays `site.showreel` when configured; otherwise shows a
 * poster with a "coming soon" label.
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
    return <MediaFrame media={media} sizes={sizes} className={frame} ambient />;
  }

  return (
    <div className="relative">
      <MediaFrame media={fallback} priority sizes={sizes} className={frame} />
      <div className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-2.5 rounded-full bg-black/45 py-1.5 pr-4 pl-1.5 text-[13px] text-white/90 ring-1 ring-white/10 backdrop-blur-md md:bottom-6 md:left-6">
        <span aria-hidden className="grid size-7 place-items-center rounded-full bg-white text-black">
          <Play size={10} />
        </span>
        Showreel — coming soon
      </div>
    </div>
  );
}
