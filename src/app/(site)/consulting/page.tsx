import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Compass, Hotel, Layers, PenTool, Store } from "lucide-react";
import RevealOnScroll from "@/components/RevealOnScroll";
import MagneticButton from "@/components/MagneticButton";

export const metadata: Metadata = {
  title: "Consulting & Projects",
  description:
    "SaFaLight designs and specifies bespoke lighting for hotels, offices, villas, and other large-scale projects — from first sketch to final installation.",
  alternates: { canonical: "/consulting" },
};

const offerings = [
  {
    icon: PenTool,
    title: "Bespoke Design",
    body: "A fixture designed around your space, not the other way around, from a single hero piece made of optical crystalline glass to a full lighting concept.",
  },
  {
    icon: Compass,
    title: "Specification & Consulting",
    body: "Guidance on material, scale, and placement from concept through construction documents, working alongside your architects and designers.",
  },
  {
    icon: Layers,
    title: "Volume Production",
    body: "The same hand-finishing standard as a single commission, scaled to the quantities a larger project actually needs.",
  },
];

const projectTypes = [
  { icon: Hotel, label: "Hotels & Hospitality" },
  { icon: Building2, label: "Offices & Commercial Spaces" },
  { icon: Store, label: "Retail & Showrooms" },
  { icon: Compass, label: "Private Villas & Residences" },
];

export default function ConsultingPage() {
  return (
    <div>
      <section className="bg-ink py-28 text-paper">
        <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center justify-center gap-2 text-xs text-paper/60">
            <Link href="/" className="hover:text-paper">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-paper/70">Consulting &amp; Projects</span>
          </nav>
          <RevealOnScroll>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">
              For Architects, Developers &amp; Designers
            </p>
            <h1 className="font-serif text-5xl font-light leading-tight md:text-6xl">
              Lighting for Spaces That Deserve More Than Off-the-Shelf.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-paper/60">
              We design and produce bespoke lighting for hotels, offices, villas, and other
              large-scale projects — working directly with architects, interior designers, and
              developers from first concept to final installation.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <RevealOnScroll className="mb-14 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
            How We Work Together
          </p>
          <h2 className="font-serif text-4xl font-light text-ink md:text-5xl">
            What We Offer
          </h2>
        </RevealOnScroll>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {offerings.map((o, i) => (
            <RevealOnScroll key={o.title} delay={i * 0.06} className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold-dark/40 text-gold-dark">
                <o.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl text-ink">{o.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{o.body}</p>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section className="bg-paper-dim py-24">
        <div className="mx-auto max-w-5xl px-6 md:px-10">
          <RevealOnScroll className="mb-14 text-center">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
              Who We Work With
            </p>
            <h2 className="font-serif text-4xl font-light text-ink md:text-5xl">
              Project Types
            </h2>
          </RevealOnScroll>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {projectTypes.map((p, i) => (
              <RevealOnScroll
                key={p.label}
                delay={i * 0.06}
                className="flex flex-col items-center gap-3 rounded-[6px] border border-ink/10 bg-paper px-6 py-8 text-center transition-colors duration-300 hover:border-gold-dark/40"
              >
                <p.icon className="h-6 w-6 text-gold-dark" strokeWidth={1.5} />
                <p className="text-sm text-ink/80">{p.label}</p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-24 text-center text-paper">
        <RevealOnScroll className="mx-auto max-w-2xl px-6">
          <h2 className="font-serif text-4xl font-light md:text-5xl">
            Have a Project in Mind?
          </h2>
          <p className="mt-4 text-paper/60">
            Tell us about your space and its timeline — we&rsquo;ll get back to you to discuss
            fit, scope, and next steps.
          </p>
          <div className="mt-8 flex justify-center">
            <MagneticButton href="/contact" variant="paper">
              Start a Conversation <ArrowRight className="h-3.5 w-3.5" />
            </MagneticButton>
          </div>
        </RevealOnScroll>
      </section>
    </div>
  );
}
