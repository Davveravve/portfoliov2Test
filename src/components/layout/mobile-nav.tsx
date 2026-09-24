"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Close, Menu } from "@/components/ui/icons";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { pad } from "@/lib/format";

type Item = { href: string; label: string };

/** Full-screen menu for small screens. Escape closes, focus returns to the toggle. */
export function MobileNav({ items }: { items: readonly Item[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Portal target only exists on the client.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Close on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const socials = Object.entries(site.social);

  return (
    <div className="md:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="-mr-2 inline-flex size-10 items-center justify-center rounded-xs text-fg"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        {open ? <Close size={18} /> : <Menu size={18} />}
      </button>

      {mounted &&
        createPortal(
          <div
            id={panelId}
            hidden={!open}
            data-open={open || undefined}
            className="fixed inset-x-0 top-(--header-h) bottom-0 z-40 bg-bg opacity-0 transition-opacity duration-150 ease-out data-open:opacity-100 md:hidden"
          >
            <nav
              aria-label="Mobile"
              className="flex h-full flex-col justify-between overflow-y-auto px-gutter pt-2 pb-8"
            >
              <ul className="divide-y divide-line border-b border-line">
                {items.map((item, i) => (
                  <li key={item.href}>
                    <Link
                      ref={i === 0 ? firstLinkRef : undefined}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between py-5 headline text-display-lg",
                        pathname === item.href ? "text-fg" : "text-fg-muted",
                      )}
                    >
                      {item.label}
                      <span aria-hidden className="label text-fg-subtle">
                        {pad(i + 1, 2)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="space-y-6 pt-10">
                <a
                  href={`mailto:${site.email}`}
                  className="font-mono text-[13px] text-fg-muted transition-colors hover:text-fg"
                >
                  {site.email}
                </a>
                <ul className="flex flex-wrap gap-x-5 gap-y-2 label text-fg-muted">
                  {socials.map(([name, href]) => (
                    <li key={name}>
                      <a
                        href={href}
                        rel="me noopener"
                        target="_blank"
                        className="inline-flex items-center gap-1 transition-colors hover:text-fg"
                      >
                        {name}
                        <ArrowUpRight size={11} />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="border-y border-line py-3 label text-fg-muted">
                  {site.role} · {site.location}
                </p>
              </div>
            </nav>
          </div>,
          document.body,
        )}
    </div>
  );
}
