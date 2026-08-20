import type { Metadata } from "next";
import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
import { getContactInfo } from "@/lib/content";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SaFaLight collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

const lastUpdated = "August 12, 2026";

export default async function PrivacyPage() {
  const [contact, settings] = await Promise.all([getContactInfo(), getSettings()]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 md:px-10 md:py-28">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-ink/65">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink/70">Privacy Policy</span>
      </nav>

      <RevealOnScroll>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">Legal</p>
        <h1 className="font-serif text-4xl font-light text-ink md:text-5xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-ink/65">Last updated: {lastUpdated}</p>
      </RevealOnScroll>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-ink/75">
        <RevealOnScroll>
          <p>
            This policy explains what personal information {settings.siteName} collects when you
            use this website, why we collect it, and how you can ask us about it or have it removed.
            It applies to {settings.siteUrl} and covers everyone who visits, browses, submits an
            enquiry, or places an order.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">Information We Collect</h2>
          <p className="mb-4">We only collect information you choose to give us directly. Specifically:</p>
          <dl className="space-y-4">
            <div>
              <dt className="font-medium text-ink">Contact form submissions</dt>
              <dd className="mt-1">
                When you send us a message through the Contact page, we store your name, email
                address, the subject you selected, and your message.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ink">Orders</dt>
              <dd className="mt-1">
                When you place an order at checkout, we store your name, email address, shipping
                address, the items and quantities you ordered, and the delivery method you chose.
                Orders are reviewed and confirmed manually by our team — we do not process card
                payments directly through this website.
              </dd>
            </div>
          </dl>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">What We Don&rsquo;t Collect</h2>
          <ul className="list-inside list-disc space-y-2">
            <li>
              Your cart and wishlist are stored only in your own browser (using local storage) and
              are never sent to or saved on our servers.
            </li>
            <li>We do not run analytics or advertising tracking on this website.</li>
            <li>We do not use marketing cookies, and we do not sell or rent your information to anyone.</li>
          </ul>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">How We Use Your Information</h2>
          <p>We use the information above only to:</p>
          <ul className="mt-3 list-inside list-disc space-y-2">
            <li>Respond to enquiries you send us</li>
            <li>Process, confirm, and fulfil orders, including arranging delivery</li>
            <li>Contact you about an enquiry or order you&rsquo;ve made with us</li>
          </ul>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">Where Your Data Is Stored</h2>
          <p>
            Enquiries and orders are stored in a private database that only authorized {settings.siteName}{" "}
            staff can access, hosted on infrastructure provided by Vercel and Prisma. Product photos
            are hosted via Vercel Blob storage. None of these providers use your data for their own
            purposes — they simply host it on our behalf.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">How Long We Keep It</h2>
          <p>
            We keep enquiry and order records for as long as needed to respond to you, fulfil an
            order, and maintain our business records. If you&rsquo;d like us to delete your
            information sooner, contact us using the details below and we will do so, except where
            we&rsquo;re required to keep records for legal or accounting reasons.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">Your Rights</h2>
          <p>You can ask us at any time to:</p>
          <ul className="mt-3 list-inside list-disc space-y-2">
            <li>Tell you what personal information we hold about you</li>
            <li>Correct any information that&rsquo;s inaccurate</li>
            <li>Delete your information</li>
          </ul>
          <p className="mt-3">
            To do any of these, email us at{" "}
            <a href={`mailto:${contact.email}`} className="text-gold-dark underline underline-offset-2 hover:text-ink">
              {contact.email}
            </a>{" "}
            and we&rsquo;ll respond promptly.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">Children&rsquo;s Privacy</h2>
          <p>
            This website is not directed at children, and we do not knowingly collect information
            from anyone under 16.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">Changes to This Policy</h2>
          <p>
            If we change how we handle your information, we&rsquo;ll update this page and revise the
            date at the top.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">Contact Us</h2>
          <p>
            Questions about this policy or your data can be sent to{" "}
            <a href={`mailto:${contact.email}`} className="text-gold-dark underline underline-offset-2 hover:text-ink">
              {contact.email}
            </a>
            {contact.address ? <> or by post to {contact.address}</> : null}.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <p>
            For the terms that govern purchases made on this website, see our{" "}
            <Link href="/terms" className="text-gold-dark underline underline-offset-2 hover:text-ink">
              Terms and Conditions
            </Link>
            .
          </p>
        </RevealOnScroll>

        <RevealOnScroll className="rounded-[6px] border border-ink/10 bg-paper-dim p-6 text-xs leading-relaxed text-ink/60">
          This policy describes, in plain language, what this website actually does with visitor
          and customer data. It is a starting point rather than a substitute for advice from a
          qualified lawyer — if you sell to customers in the EU/UK (GDPR), California (CCPA), or
          other regions with specific data protection laws, have this reviewed by a professional
          before relying on it.
        </RevealOnScroll>
      </div>
    </div>
  );
}
