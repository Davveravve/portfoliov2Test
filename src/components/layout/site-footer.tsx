import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Emphasis } from "@/components/ui/emphasis";
import { ArrowUpRight } from "@/components/ui/icons";
import { site } from "@/config/site";
import { getLastLog } from "@/lib/projects/last-log";

export async function SiteFooter() {
  const year = new Date().getFullYear();
  const socials = Object.entries(site.social);
  const last = await getLastLog();

  return (
    <footer className="mt-(--space-section)">
      <Container>
        <div className="rule-caps" />
        <div className="grid gap-12 pt-12 pb-12 md:grid-cols-12 md:pt-16 md:pb-16">
          <div className="md:col-span-7">
            <p className="headline text-display-lg">
              <Emphasis text={"Let's build something\u00a0— *or just talk shop.*"} />
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
              <a
                href={`mailto:${site.email}`}
                className="group inline-flex min-h-11 items-center gap-2 font-mono text-[15px] text-fg-muted transition-colors duration-150 hover:text-fg"
              >
                {site.email}
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
              {site.cvUrl && (
                <ButtonLink href={site.cvUrl} variant="secondary" size="sm" trailingIcon={<ArrowUpRight size={14} />}>
                  Download CV
                </ButtonLink>
              )}
            </div>
          </div>

          <nav id="footer-nav" aria-label="Footer" className="grid grid-cols-2 gap-8 md:col-span-4 md:col-start-9">
            <div className="space-y-4">
              <p className="label text-fg-muted">Site</p>
              <ul className="text-body">
                <li>
                  <Link
                    href="/"
                    className="inline-flex min-h-11 items-center text-fg-muted transition-colors duration-150 hover:text-fg"
                  >
                    Home
                  </Link>
                </li>
                {site.nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex min-h-11 items-center text-fg-muted transition-colors duration-150 hover:text-fg"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <p className="label text-fg-muted">Elsewhere</p>
              <ul className="text-body">
                {socials.map(([name, href]) => (
                  <li key={name}>
                    <a
                      href={href}
                      rel="me noopener"
                      target="_blank"
                      className="group inline-flex min-h-11 items-center gap-1.5 text-fg-muted capitalize transition-colors duration-150 hover:text-fg"
                    >
                      {name === "youtube" ? "YouTube" : name}
                      <ArrowUpRight
                        size={12}
                        className="transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        {/* System line: three true facts between two hairlines. */}
        <div className="grid gap-2 border-y border-line py-4 label text-fg-muted sm:grid-cols-3">
          <p className="py-2">
            © {year} {site.name}
          </p>
          <p className="py-2 sm:text-center">{site.location}</p>
          {last && (
            <p className="sm:text-right">
              <Link
                href={last.href}
                className="group inline-flex min-h-11 items-center gap-1.5 transition-colors duration-150 hover:text-fg"
              >
                Last log {last.date}
                <span aria-hidden className="transition-transform duration-150 ease-out group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </p>
          )}
        </div>
      </Container>
    </footer>
  );
}
