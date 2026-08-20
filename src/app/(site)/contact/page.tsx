import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import RevealOnScroll from "@/components/RevealOnScroll";
import ContactForm from "@/components/ContactForm";
import { getContactInfo } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with SaFaLight to commission a piece, ask about a finish, or book a private consultation with our design team.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const content = await getContactInfo();

  const details = [
    {
      icon: Mail,
      label: "Email",
      value: content.email,
      href: `mailto:${content.email}`,
    },
    {
      icon: Phone,
      label: "Phone",
      value: content.phone,
      // Keeps only digits and a leading + so a human-friendly "+1 (555)
      // 018-2043" still produces a dialable tel: link.
      href: `tel:${content.phone.replace(/[^\d+]/g, "")}`,
    },
    {
      icon: MapPin,
      label: "Showroom",
      value: content.address,
      href: undefined,
    },
    {
      icon: Clock,
      label: "Hours",
      value: content.hours,
      href: undefined,
    },
  ];

  return (
    <div>
      <section className="bg-ink py-24 text-paper md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-center gap-2 text-xs text-paper/60">
            <Link href="/" className="hover:text-paper">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-paper/70">Contact</span>
          </nav>
          <RevealOnScroll>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold">
              Get in Touch
            </p>
            <h1 className="font-serif text-5xl font-light leading-tight md:text-6xl">
              Let&rsquo;s Talk About Light
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-paper/60">
              Whether you&rsquo;re commissioning a single piece or lighting an
              entire project, our design team replies personally &mdash; no
              chatbots, no forms into the void.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-5">
          <RevealOnScroll className="md:col-span-3">
            <h2 className="mb-8 font-serif text-3xl font-light text-ink">
              Send Us a Message
            </h2>
            <ContactForm />
          </RevealOnScroll>

          <RevealOnScroll delay={0.1} className="md:col-span-2">
            <div className="rounded-[6px] border border-ink/10 bg-paper-dim p-8">
              <h3 className="mb-6 font-serif text-2xl font-light text-ink">
                Visit or Reach Us
              </h3>
              <ul className="space-y-6">
                {details.map((d) => (
                  <li key={d.label} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-dark/40 text-gold-dark">
                      <d.icon className="h-4 w-4" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.15em] text-ink/65">
                        {d.label}
                      </p>
                      {d.href ? (
                        <a href={d.href} className="text-sm text-ink hover:text-gold-dark">
                          {d.value}
                        </a>
                      ) : (
                        <p className="text-sm text-ink/75">{d.value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-[6px] border border-ink/10 bg-ink">
              <svg
                viewBox="0 0 400 300"
                className="h-full w-full opacity-70"
                aria-hidden="true"
              >
                <defs>
                  <radialGradient id="mapGlow" cx="65%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="400" height="300" fill="url(#mapGlow)" />
                {Array.from({ length: 9 }).map((_, row) =>
                  Array.from({ length: 12 }).map((__, col) => (
                    <circle
                      key={`${row}-${col}`}
                      cx={20 + col * 34}
                      cy={20 + row * 32}
                      r="1.4"
                      fill="var(--color-gold-light)"
                      opacity={0.25}
                    />
                  ))
                )}
                <circle cx="260" cy="120" r="6" fill="var(--color-gold)" />
                <circle
                  cx="260"
                  cy="120"
                  r="14"
                  fill="none"
                  stroke="var(--color-gold)"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
              </svg>
              <div className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.15em] text-paper/60">
                Private showroom &middot; by appointment
              </div>
            </div>
          </RevealOnScroll>
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/terms"
            className="text-sm text-ink/60 underline underline-offset-2 transition-colors hover:text-ink"
          >
            Terms and Conditions
          </Link>
        </div>
      </section>
    </div>
  );
}
