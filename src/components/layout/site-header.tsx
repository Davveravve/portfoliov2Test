import Link from "next/link";
import { Container } from "@/components/ui/container";
import { site } from "@/config/site";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-md supports-[not(backdrop-filter:blur(0))]:bg-bg">
      <Container className="flex h-(--header-h) items-center justify-between gap-6">
        <Link href="/" className="group flex items-center gap-3" aria-label={`${site.name} — home`}>
          <span
            aria-hidden
            className="size-2.5 bg-accent transition-transform duration-300 ease-out group-hover:rotate-45"
          />
          <span className="font-display-x text-[15px] tracking-[-0.01em]">{site.name}</span>
          <span aria-hidden className="hidden label text-fg-subtle lg:inline">
            / {site.role}
          </span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <NavLinks items={site.nav} />
        </nav>

        <MobileNav items={site.nav} footer={`${site.role} — ${site.location}`} />
      </Container>
    </header>
  );
}
