"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type Item = { href: string; label: string };

function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Full-height links so the 1px accent underline lands exactly on the header rule. */
export function NavLinks({ items }: { items: readonly Item[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-6">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-(--header-h) items-center text-ui transition-colors duration-150",
                active
                  ? "text-fg after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-accent"
                  : "text-fg-muted hover:text-fg",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
