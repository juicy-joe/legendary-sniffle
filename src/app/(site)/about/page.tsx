import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gem, Hammer, Leaf, Sparkles } from "lucide-react";
import RevealOnScroll from "@/components/RevealOnScroll";
import StatCounter from "@/components/StatCounter";
import MagneticButton from "@/components/MagneticButton";
import { getDesigners } from "@/lib/catalog";
import { getAboutContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "SaFaLight was founded to give master lighting designers a home. Learn our story, meet our resident designers, and see how every lamp is made.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    icon: Hammer,
    title: "Made by Hand",
    body: "No injection molds, no assembly lines. Every base is turned, cast, or blown by a named craftsperson.",
  },
  {
    icon: Gem,
    title: "Rare Materials",
    body: "Calacatta marble, Persian alabaster, mouth-blown crystal — sourced in small batches, never substituted.",
  },
  {
    icon: Leaf,
    title: "Made to Last",
    body: "Every lamp is designed to be repaired, rewired, and passed down — not replaced.",
  },
  {
    icon: Sparkles,
    title: "Individually Numbered",
    body: "Each piece carries a signed edition number and a certificate of authenticity from its designer.",
  },
];

const timeline = [
  {
    year: "2016",
    text: "SaFaLight begins as a two-person atelier representing a single Genevan sculptor.",
  },
  {
    year: "2019",
    text: "The Murano Editions launch in partnership with Nadia Kessler's glass studio.",
  },
  {
    year: "2022",
    text: "SaFaLight opens private viewing rooms for collectors in three cities.",
  },
  {
    year: "2025",
    text: "Four resident designers, one shared belief: light deserves the same craft as sculpture.",
  },
  {
    year: "2026",
    text: "The Chroma Editions debut — hand-blown glass spheres with an adaptive light core, Kessler's most ambitious series yet.",
  },
];

export default async function AboutPage() {
  const [designers, content] = await Promise.all([getDesigners(), getAboutContent()]);

  return (
    <div>
      <section className="bg-ink py-28 text-paper">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-center gap-2 text-xs text-paper/60">
            <Link href="/" className="hover:text-paper">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-paper/70">About Us</span>
          </nav>
          <RevealOnScroll>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">
              Our Story
            </p>
            <h1 className="font-serif text-5xl font-light leading-tight md:text-6xl">
              {content.heroHeadline}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-paper/60">
              {content.heroSubtext}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 md:px-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <StatCounter value={4} label="Resident Designers" />
          <StatCounter value={1200} suffix="+" label="Homes Illuminated" />
          <StatCounter value={9} label="Years of Craft" />
          <StatCounter value={100} suffix="%" label="Hand-Finished" />
        </div>
      </section>

      <section className="bg-paper-dim py-24">
        <div className="mx-auto max-w-4xl px-6 md:px-10">
          <RevealOnScroll className="mb-16 text-center">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
              Timeline
            </p>
            <h2 className="font-serif text-4xl font-light text-ink">
              A Decade of Restraint
            </h2>
          </RevealOnScroll>
          <div className="space-y-10 border-l border-ink/15 pl-8">
            {timeline.map((item, i) => (
              <RevealOnScroll key={item.year} delay={i * 0.05} className="relative">
                <span className="absolute -left-[38px] top-1 h-2.5 w-2.5 rounded-full border-2 border-gold bg-paper-dim" />
                <p className="font-serif text-2xl text-gold-dark">{item.year}</p>
                <p className="mt-1 max-w-lg text-ink/65">{item.text}</p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <RevealOnScroll className="mb-14 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
            The Atelier
          </p>
          <h2 className="font-serif text-4xl font-light text-ink md:text-5xl">
            Our Resident Designers
          </h2>
        </RevealOnScroll>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {designers.map((d, i) => (
            <RevealOnScroll
              key={d.name}
              delay={i * 0.06}
              className="rounded-[6px] border border-ink/10 bg-paper p-8 transition-colors duration-300 hover:border-gold-dark/40"
            >
              <p className="text-[11px] uppercase tracking-[0.15em] text-ink/65">
                {d.origin}
              </p>
              <h3 className="mt-2 font-serif text-2xl text-ink">{d.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">
                {d.bio}
              </p>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <RevealOnScroll className="mb-14 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
            What We Stand For
          </p>
          <h2 className="font-serif text-4xl font-light text-ink md:text-5xl">
            Values We Don&rsquo;t Compromise On
          </h2>
        </RevealOnScroll>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <RevealOnScroll key={v.title} delay={i * 0.06} className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold-dark/40 text-gold-dark">
                <v.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl text-ink">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                {v.body}
              </p>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section className="bg-ink py-24 text-center text-paper">
        <RevealOnScroll className="mx-auto max-w-2xl px-6">
          <h2 className="font-serif text-4xl font-light md:text-5xl">
            Ready to Find Your Piece?
          </h2>
          <p className="mt-4 text-paper/60">
            Speak with our design team about a commission, a specific finish,
            or a piece for a space you love.
          </p>
          <div className="mt-8 flex justify-center">
            <MagneticButton href="/contact" variant="paper">
              Book a Consultation <ArrowRight className="h-3.5 w-3.5" />
            </MagneticButton>
          </div>
        </RevealOnScroll>
      </section>
    </div>
  );
}
