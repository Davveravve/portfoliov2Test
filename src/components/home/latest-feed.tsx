import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { MediaFrame } from "@/components/ui/media-frame";
import { Reveal } from "@/components/ui/reveal";
import { TimelineMarker } from "@/components/ui/timeline-marker";
import { formatDateMono, pad } from "@/lib/format";
import { POST_TYPE_LABEL } from "@/lib/labels";
import type { FeedItem } from "@/lib/projects/queries";

/**
 * The log: latest public posts across all projects on a 1px marker rail,
 * with descending zero-padded indices and typed markers.
 */
export function LatestFeed({ items, total }: { items: FeedItem[]; total: number }) {
  if (!items.length) return <p className="py-10 text-fg-muted">No updates yet.</p>;
  return (
    <ol className="border-y border-line-strong">
      {items.map((item, i) => {
        const index = pad(total - i, 3);
        const date = formatDateMono(item.publishedAt);
        return (
          <Reveal
            key={item.id}
            as="li"
            delay={Math.min(i, 2) * 60}
            className="log-row group relative grid grid-cols-[1.5rem_1fr_5rem] gap-x-4 border-b border-line py-6 transition-colors duration-150 last:border-b-0 hover:bg-surface-1 md:grid-cols-[1.5rem_3rem_8.5rem_1fr_11rem] md:gap-x-6 md:py-7"
          >
            <TimelineMarker type={item.type} className="relative mt-0.5" />

            <span aria-hidden className="hidden pt-1 label text-fg-subtle md:block">
              {index}
            </span>

            <div className="hidden md:block">
              <time dateTime={item.publishedAt.toISOString()} className="meta text-fg-muted">
                {date}
              </time>
              <p className="mt-1.5 label text-fg-muted">{POST_TYPE_LABEL[item.type]}</p>
            </div>

            <div className="min-w-0">
              <p className="truncate label text-fg-muted">
                <span className="md:hidden">
                  <span aria-hidden className="hidden xs:inline">
                    {index} ·{" "}
                  </span>
                  <time dateTime={item.publishedAt.toISOString()}>{date}</time> ·{" "}
                </span>
                {item.project.title}
              </p>
              <h3 className="mt-1.5 headline text-title">
                <Link
                  href={`/projects/${item.project.slug}/${item.slug}`}
                  className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent"
                >
                  {item.title}
                </Link>
                <ArrowRight
                  size={14}
                  aria-hidden
                  className="ml-2 hidden -translate-x-1 align-baseline text-fg-muted opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover:translate-x-0 group-hover:opacity-100 [@media(hover:hover)]:inline"
                />
              </h3>
              {item.excerpt && <p className="mt-2 line-clamp-2 max-w-2xl text-body text-fg-muted">{item.excerpt}</p>}
            </div>

            {/* Clicks fall through to the row link overlay. */}
            <div className="pointer-events-none self-start">
              {item.cover && <MediaFrame media={item.cover} ratio="4/3" sizes="(min-width: 768px) 11rem, 5rem" />}
            </div>
          </Reveal>
        );
      })}
    </ol>
  );
}
