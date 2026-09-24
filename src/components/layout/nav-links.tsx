"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type Item = { href: string; label: string };

function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ items }: { items: readonly Item[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-flex h-9 items-center px-3 text-sm transition-colors duration-150",
                active ? "text-fg" : "text-fg-muted hover:text-fg",
              )}
            >
              {item.label}
              {active && <span aria-hidden className="absolute inset-x-3 -bottom-px h-px bg-accent" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
