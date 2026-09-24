import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ArrowUpRight } from "@/components/ui/icons";
import { site } from "@/config/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const socials = Object.entries(site.social);
  return (
    <footer className="mt-32 border-t border-line">
      <Container className="grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="space-y-5 md:col-span-6">
          <p className="font-display-x text-display-md">
            Let&apos;s make
            <br />
            something.
          </p>
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center gap-2 text-fg-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-accent"
          >
            {site.email}
          </a>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 md:col-span-6 md:grid-cols-3">
          <div className="space-y-4">
            <p className="label text-fg-subtle">Site</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-fg-muted transition-colors hover:text-fg">
                  Home
                </Link>
              </li>
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-fg-muted transition-colors hover:text-fg">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <p className="label text-fg-subtle">Elsewhere</p>
            <ul className="space-y-2.5 text-sm">
              {socials.map(([name, href]) => (
                <li key={name}>
                  <a
                    href={href}
                    rel="me noopener"
                    target="_blank"
                    className="group inline-flex items-center gap-1.5 text-fg-muted capitalize transition-colors hover:text-fg"
                  >
                    {name}
                    <ArrowUpRight size={12} className="text-fg-subtle transition-colors group-hover:text-accent" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </Container>
      <Container className="flex flex-wrap items-center justify-between gap-4 border-t border-line py-6">
        <p className="label text-fg-subtle">
          © {year} {site.name}
        </p>
        <p className="label text-fg-subtle">{site.location}</p>
      </Container>
    </footer>
  );
}
