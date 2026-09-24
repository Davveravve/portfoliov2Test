import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { site } from "@/config/site";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

/** Opaque, static header. The active-nav underline sits exactly on its bottom rule. */
export function SiteHeader() {
  const name = site.name.length > 16 ? site.shortName : site.name;
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg">
      <Container className="flex h-(--header-h) items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${site.name} — home`}>
          <span aria-hidden className="led" />
          <span className="text-ui text-fg md:hidden">{name}</span>
          <span className="hidden text-ui text-fg md:inline">{site.name}</span>
          <span aria-hidden className="ml-1 hidden label text-fg-muted lg:inline">
            / {site.role}
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <nav aria-label="Main">
            <NavLinks items={site.nav} />
          </nav>
          <ButtonLink href={`mailto:${site.email}`} size="sm" variant="secondary">
            Contact
          </ButtonLink>
        </div>

        <MobileNav items={site.nav} />
      </Container>
    </header>
  );
}
