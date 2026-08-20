import Link from "next/link";
import { InstagramIcon, FacebookIcon, LinkedinIcon } from "./SocialIcons";
import Newsletter from "./Newsletter";
import { getContactInfo } from "@/lib/content";
import { getMenuItems, getSocialLinks } from "@/lib/menus";

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  linkedin: LinkedinIcon,
};

export default async function Footer() {
  const [contact, explore, collections, socials] = await Promise.all([
    getContactInfo(),
    getMenuItems("footer-explore"),
    getMenuItems("footer-collections"),
    getSocialLinks(),
  ]);

  const columns = [
    { title: "Explore", links: explore },
    { title: "Collections", links: collections },
  ].filter((c) => c.links.length > 0);

  // A social row still without a real URL (the "#" placeholder) reads as
  // not-yet-configured — better to omit the icon than link nowhere.
  const activeSocials = socials.filter((s) => s.url && s.url !== "#" && socialIcons[s.platform]);

  return (
    <footer className="border-t border-gold/20 bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-4 md:gap-10">
          <div className="md:col-span-2">
            <Link href="/" className="font-serif text-3xl font-medium">
              Sa<span className="text-gold">Fa</span>Light
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper/55">
              Designer table lamps, hand-finished by independent studios.
            </p>
            <div className="mt-8">
              <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-paper/60">
                Join the Atelier List
              </p>
              <Newsletter dark />
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-5 text-[11px] uppercase tracking-[0.2em] text-paper/60">
                {col.title}
              </p>
              <ul className="space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.id}>
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
            <p className="mb-5 text-[11px] uppercase tracking-[0.2em] text-paper/60">
              Contact
            </p>
            <ul className="space-y-3.5 text-sm text-paper/65">
              <li>
                <a href={`mailto:${contact.email}`} className="transition-colors hover:text-gold">
                  {contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                  className="transition-colors hover:text-gold"
                >
                  {contact.phone}
                </a>
              </li>
              <li className="text-paper/60">{contact.hours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-paper/10 pt-8 md:flex-row">
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-paper/60">
            <span>&copy; {new Date().getFullYear()} SaFaLight. All rights reserved.</span>
            <span aria-hidden="true">&middot;</span>
            <Link href="/privacy" className="underline-offset-2 transition-colors hover:text-gold hover:underline">
              Privacy Policy
            </Link>
            <span aria-hidden="true">&middot;</span>
            <Link href="/terms" className="underline-offset-2 transition-colors hover:text-gold hover:underline">
              Terms and Conditions
            </Link>
          </p>
          {activeSocials.length > 0 && (
            <div className="flex items-center gap-6">
              {activeSocials.map((s) => {
                const Icon = socialIcons[s.platform];
                return (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`SaFaLight on ${s.platform.charAt(0).toUpperCase() + s.platform.slice(1)}`}
                    className="text-paper/60 transition-colors hover:text-gold"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
