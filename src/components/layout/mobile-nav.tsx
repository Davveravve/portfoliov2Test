"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Close, Menu } from "@/components/ui/icons";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { pad } from "@/lib/format";
import type { LastLog } from "@/lib/projects/last-log";

type Item = { href: string; label: string };

/**
 * Full-screen menu for small screens. While open, everything behind it is
 * `inert`; Escape closes and returns focus to the toggle. Without JS the
 * toggle is replaced by a plain link to the footer navigation.
 */
export function MobileNav({ items, lastLog }: { items: readonly Item[]; lastLog: LastLog | null }) {
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
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    // Keep keyboard and screen-reader focus inside the menu + header.
    const behind = [document.getElementById("main"), document.querySelector("body > footer")].filter(
      (el): el is HTMLElement => el instanceof HTMLElement,
    );
    behind.forEach((el) => el.setAttribute("inert", ""));
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = prev;
      behind.forEach((el) => el.removeAttribute("inert"));
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const socials = Object.entries(site.social);

  return (
    <div className="md:hidden">
      <noscript>
        <style>{`[data-menu-toggle]{display:none}`}</style>
        <a href="#footer-nav" className="inline-flex h-11 items-center text-ui text-fg-muted">
          Menu
        </a>
      </noscript>
      <button
        ref={toggleRef}
        type="button"
        data-menu-toggle
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="-mr-2.5 inline-flex size-11 items-center justify-center rounded-xs text-fg"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        {open ? <Close size={18} /> : <Menu size={18} />}
      </button>

      {mounted &&
        createPortal(
          <div
            id={panelId}
            aria-hidden={!open}
            inert={!open}
            data-open={open || undefined}
            className="invisible fixed inset-x-0 top-(--header-h) bottom-0 z-40 bg-bg opacity-0 transition-[opacity,visibility] duration-150 ease-out data-open:visible data-open:opacity-100 data-open:transition-opacity md:hidden"
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

              <div className="pt-10">
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex min-h-11 items-center font-mono text-[13px] text-fg-muted transition-colors hover:text-fg"
                >
                  {site.email}
                </a>
                <ul className="flex flex-wrap gap-x-6 label text-fg-muted">
                  {socials.map(([name, href]) => (
                    <li key={name}>
                      <a
                        href={href}
                        rel="me noopener"
                        target="_blank"
                        className="inline-flex min-h-11 items-center gap-1 transition-colors hover:text-fg"
                      >
                        {name}
                        <ArrowUpRight size={11} />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
                {/* System line: true facts only. */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 border-y border-line label text-fg-muted">
                  <span className="py-3">{site.location}</span>
                  {lastLog && (
                    <Link
                      href={lastLog.href}
                      onClick={() => setOpen(false)}
                      className="inline-flex min-h-11 items-center gap-1.5 transition-colors hover:text-fg"
                    >
                      Last log {lastLog.date} <span aria-hidden>→</span>
                    </Link>
                  )}
                </div>
              </div>
            </nav>
          </div>,
          document.body,
        )}
    </div>
  );
}
