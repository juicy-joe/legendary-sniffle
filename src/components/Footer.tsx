import Link from "next/link";
import { InstagramIcon, FacebookIcon, LinkedinIcon } from "./SocialIcons";
import Newsletter from "./Newsletter";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/products", label: "Products" },
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Collections",
    links: [
      { href: "/products?category=Marble", label: "Marble" },
      { href: "/products?category=Brass", label: "Brass" },
      { href: "/products?category=Alabaster", label: "Alabaster" },
      { href: "/products?category=Glass", label: "The Chroma Editions" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gold/20 bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-4 md:gap-10">
          <div className="md:col-span-2">
            <Link href="/" className="font-serif text-3xl font-medium">
              Sa<span className="text-gold-gradient">Fa</span>Light
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper/55">
              Curated designer table lamps, hand-finished by master artisans.
              Each piece is light, treated as sculpture.
            </p>
            <div className="mt-8">
              <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-paper/40">
                Join the Atelier List
              </p>
              <Newsletter dark />
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-5 text-[11px] uppercase tracking-[0.2em] text-paper/40">
                {col.title}
              </p>
              <ul className="space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-paper/65 transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="mb-5 text-[11px] uppercase tracking-[0.2em] text-paper/40">
              Contact
            </p>
            <ul className="space-y-3.5 text-sm text-paper/65">
              <li>
                <a href="mailto:hello@safalight.com" className="transition-colors hover:text-gold">
                  hello@safalight.com
                </a>
              </li>
              <li>
                <a href="tel:+15550182043" className="transition-colors hover:text-gold">
                  +1 (555) 018&ndash;2043
                </a>
              </li>
              <li className="text-paper/45">
                Tue&ndash;Sat, 11am&ndash;6pm, by appointment
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-paper/10 pt-8 md:flex-row">
          <p className="text-xs text-paper/40">
            &copy; {new Date().getFullYear()} SaFaLight. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              aria-label="SaFaLight on Instagram"
              className="text-paper/45 transition-colors hover:text-gold"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="SaFaLight on Facebook"
              className="text-paper/45 transition-colors hover:text-gold"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="SaFaLight on LinkedIn"
              className="text-paper/45 transition-colors hover:text-gold"
            >
              <LinkedinIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
