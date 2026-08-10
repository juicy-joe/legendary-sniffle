import Link from "next/link";
import { ArrowRight, Home, Info, Mail } from "lucide-react";

export const metadata = { title: "Content — Admin" };

const pages = [
  {
    href: "/admin/content/home",
    icon: Home,
    title: "Homepage",
    description: "Hero copy, the Chroma Editions spotlight, and the Craft section.",
  },
  {
    href: "/admin/content/about",
    icon: Info,
    title: "About Page",
    description: "The About page's headline and intro copy.",
  },
  {
    href: "/admin/content/contact",
    icon: Mail,
    title: "Contact Info",
    description: "Email, phone, showroom address, and hours — shown on Contact and in the footer.",
  },
];

export default function AdminContentPage() {
  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl font-light text-ink">Content</h1>
      <p className="mb-8 text-sm text-ink/65">
        Edit the copy on the public site&rsquo;s fixed pages.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="group flex flex-col justify-between rounded-[6px] border border-ink/10 bg-paper p-6 transition-colors duration-300 hover:border-gold-dark/40"
          >
            <div>
              <p.icon className="h-5 w-5 text-gold-dark" strokeWidth={1.5} />
              <h2 className="mt-4 font-serif text-xl text-ink">{p.title}</h2>
              <p className="mt-2 text-sm text-ink/65">{p.description}</p>
            </div>
            <span className="mt-6 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-ink/65 group-hover:text-gold-dark">
              Edit <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
