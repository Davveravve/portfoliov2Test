import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/icons";
import { MediaFrame } from "@/components/ui/media-frame";
import { TimelineMarker } from "@/components/ui/timeline-marker";
import { formatDate } from "@/lib/format";
import { POST_TYPE_LABEL } from "@/lib/labels";
import type { FeedItem } from "@/lib/projects/queries";

/** Global activity feed: latest posts across all projects, tagged by project. */
export function LatestFeed({ items }: { items: FeedItem[] }) {
  if (!items.length) return <p className="py-10 text-fg-muted">No updates yet.</p>;
  return (
    <ol className="border-t border-line">
      {items.map((item) => (
        <li
          key={item.id}
          className="group relative grid grid-cols-[1fr_5.5rem] items-start gap-x-5 gap-y-3 border-b border-line py-7 md:grid-cols-[10rem_1fr_11rem] md:gap-x-10 md:py-9"
        >
          <div className="col-span-2 flex items-center gap-4 text-[13px] text-fg-subtle md:col-span-1 md:flex-col md:items-start md:gap-2.5 md:pt-1">
            <time dateTime={item.publishedAt.toISOString()} className="tabular-nums">
              {formatDate(item.publishedAt)}
            </time>
            <span className="flex items-center gap-1.5">
              <TimelineMarker type={item.type} className="-ml-1.5 size-4 scale-75" />
              {POST_TYPE_LABEL[item.type]}
            </span>
          </div>

          <div className="min-w-0 space-y-2">
            <p className="text-[13px] text-fg-muted">{item.project.title}</p>
            <h3 className="text-xl leading-snug font-medium tracking-[-0.025em] text-fg md:text-[1.625rem] md:leading-tight">
              <Link
                href={`/projects/${item.project.slug}/${item.slug}`}
                className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent"
              >
                {item.title}
              </Link>
              <ArrowUpRight
                size={16}
                aria-hidden
                className="ml-2 inline -translate-x-1 align-baseline text-fg-subtle opacity-0 transition-[opacity,transform] duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100"
              />
            </h3>
            {item.excerpt && (
              <p className="line-clamp-2 max-w-2xl text-[15px] leading-relaxed text-fg-muted">{item.excerpt}</p>
            )}
          </div>

          <div className="w-full self-start">
            {item.cover && (
              <MediaFrame
                media={item.cover}
                ratio="4/3"
                sizes="(min-width: 768px) 11rem, 5.5rem"
                className="rounded-md"
                imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
