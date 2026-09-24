import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ArrowUpRight } from "@/components/ui/icons";
import { site } from "@/config/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const socials = Object.entries(site.social);
  return (
    <footer className="mt-32 md:mt-48">
      <Container>
        <div className="grid gap-14 border-t border-line pt-16 pb-14 md:grid-cols-12 md:pt-24">
          <div className="space-y-8 md:col-span-7">
            <p className="headline text-display-xl">
              Let&apos;s build <em>something.</em>
            </p>
            <a
              href={`mailto:${site.email}`}
              className="group inline-flex items-center gap-2 text-lg tracking-[-0.01em] text-fg-muted transition-colors duration-200 hover:text-fg"
            >
              {site.email}
              <ArrowUpRight
                size={16}
                className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 md:col-span-4 md:col-start-9">
            <div className="space-y-4">
              <p className="label text-fg-subtle">Site</p>
              <ul className="space-y-2.5 text-[15px]">
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
              <ul className="space-y-2.5 text-[15px]">
                {socials.map(([name, href]) => (
                  <li key={name}>
                    <a
                      href={href}
                      rel="me noopener"
                      target="_blank"
                      className="text-fg-muted capitalize transition-colors hover:text-fg"
                    >
                      {name === "youtube" ? "YouTube" : name}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line py-6 text-[13px] text-fg-subtle">
          <p>
            © {year} {site.name}
          </p>
          <p>{site.location}</p>
        </div>
      </Container>
    </footer>
  );
}
