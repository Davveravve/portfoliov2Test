import Link from "next/link";
import { MediaFrame } from "@/components/ui/media-frame";
import { TimelineMarker } from "@/components/ui/timeline-marker";
import { formatDate } from "@/lib/format";
import { POST_TYPE_LABEL } from "@/lib/labels";
import type { FeedItem } from "@/lib/projects/queries";

/** Global activity feed: latest posts across all projects, tagged by project. */
export function LatestFeed({ items }: { items: FeedItem[] }) {
  if (!items.length) return <p className="py-10 text-fg-muted">No updates yet.</p>;
  return (
    <ol className="divide-y divide-line border-b border-line">
      {items.map((item) => (
        <li
          key={item.id}
          className="group relative grid grid-cols-[1fr_auto] gap-x-5 gap-y-3 py-6 md:grid-cols-[9rem_1fr_12rem] md:gap-x-10 md:py-8"
        >
          <div className="col-span-2 flex items-center gap-3 md:col-span-1 md:flex-col md:items-start md:gap-2">
            <time dateTime={item.publishedAt.toISOString()} className="label text-fg-subtle">
              {formatDate(item.publishedAt)}
            </time>
            <span className="flex items-center gap-1 label text-fg-muted">
              <TimelineMarker type={item.type} className="-ml-1.5 size-5" />
              {POST_TYPE_LABEL[item.type]}
            </span>
          </div>

          <div className="min-w-0 space-y-2">
            <p className="label text-accent">{item.project.title}</p>
            <h3 className="text-lg leading-snug font-medium text-fg md:text-xl">
              <Link
                href={`/projects/${item.project.slug}/${item.slug}`}
                className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent"
              >
                <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 ease-out group-hover:bg-[length:100%_1px]">
                  {item.title}
                </span>
              </Link>
            </h3>
            {item.excerpt && <p className="line-clamp-2 max-w-2xl text-[15px] text-fg-muted">{item.excerpt}</p>}
          </div>

          <div className="w-24 self-start md:w-full">
            {item.cover && <MediaFrame media={item.cover} ratio="16/10" sizes="(min-width: 768px) 12rem, 6rem" />}
          </div>
        </li>
      ))}
    </ol>
  );
}
