import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { site } from "@/config/site";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-bg/75 backdrop-blur-xl backdrop-saturate-150 supports-[not(backdrop-filter:blur(0))]:bg-bg">
      <Container className="flex h-(--header-h) items-center justify-between gap-6">
        <Link href="/" className="group flex items-center gap-2.5" aria-label={`${site.name} — home`}>
          <span
            aria-hidden
            className="size-2 rounded-full bg-accent transition-transform duration-300 ease-out group-hover:scale-125"
          />
          <span className="text-[15px] font-medium tracking-[-0.02em]">{site.name}</span>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <nav aria-label="Main">
            <NavLinks items={site.nav} />
          </nav>
          <ButtonLink href={`mailto:${site.email}`} size="sm" variant="primary">
            Get in touch
          </ButtonLink>
        </div>

        <MobileNav items={site.nav} footer={site.email} />
      </Container>
    </header>
  );
}
