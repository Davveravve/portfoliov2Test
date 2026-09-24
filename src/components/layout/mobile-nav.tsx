"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Close, Menu } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

type Item = { href: string; label: string };

/** Full-screen menu for small screens. Escape closes, focus returns to the toggle. */
export function MobileNav({ items, footer }: { items: readonly Item[]; footer?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Portal target only exists on the client. The header uses backdrop-filter,
  // which would otherwise become the containing block of this fixed panel.
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
          <div id={panelId} hidden={!open} className="fixed inset-x-0 top-(--header-h) bottom-0 z-40 bg-bg md:hidden">
            <nav aria-label="Mobile" className="flex h-full flex-col justify-between px-gutter pt-6 pb-10">
              <ul className="divide-y divide-line border-b border-line">
                {items.map((item, i) => (
                  <li key={item.href}>
                    <Link
                      ref={i === 0 ? firstLinkRef : undefined}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between py-5 headline text-[2.25rem] leading-none",
                        pathname === item.href ? "text-fg" : "text-fg-muted",
                      )}
                    >
                      {item.label}
                      <span aria-hidden className="label text-fg-subtle">
                        0{i + 1}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {footer && <p className="text-sm text-fg-muted">{footer}</p>}
            </nav>
          </div>,
          document.body,
        )}
    </div>
  );
}
