import type { Metadata } from "next";
import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
import { getContactInfo } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "The terms and conditions governing purchases made on SaFaLight.",
  alternates: { canonical: "/terms" },
};

const lastUpdated = "August 20, 2026";

// A handful of fields in this document are genuine legal-registration
// details (company name, registered address, Tax ID) that only the
// business owner can supply accurately — inventing them would put a false
// legal identifier on a live, public page. Rendered as a visibly-marked
// placeholder rather than silently guessed, same spirit as the disclaimer
// at the bottom of this page and of /privacy.
function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gold/15 px-1 py-0.5 text-ink" title="Needs to be filled in before this page is legally reliable">
      {children}
    </span>
  );
}

export default async function TermsPage() {
  const contact = await getContactInfo();

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 md:px-10 md:py-28">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-ink/65">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink/70">Terms and Conditions</span>
      </nav>

      <RevealOnScroll>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">Legal</p>
        <h1 className="font-serif text-4xl font-light text-ink md:text-5xl">Terms and Conditions</h1>
        <p className="mt-4 text-sm text-ink/65">Last updated: {lastUpdated}</p>
      </RevealOnScroll>

      <RevealOnScroll className="mt-8 rounded-[6px] border border-gold/25 bg-gold/5 p-5 text-xs leading-relaxed text-ink/70">
        A few fields below (marked <Placeholder>like this</Placeholder>) are genuine business
        registration details — legal company name, registered address, Tax ID / NIF-CIF — that
        need to come from you before this page is accurate. Everything else reflects how the
        website actually operates today.
      </RevealOnScroll>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-ink/75">
        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">1. Introduction</h2>
          <p>
            Welcome to Safalight.com (the &ldquo;Website&rdquo;), operated by{" "}
            <Placeholder>Insert Full Legal Company Name</Placeholder>, a company registered in
            Spain with registered address at{" "}
            <Placeholder>Insert Registered Address</Placeholder>, Tax ID / NIF-CIF:{" "}
            <Placeholder>Insert Tax ID</Placeholder> (hereinafter &ldquo;Safalight,&rdquo;
            &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;).
          </p>
          <p className="mt-3">
            These Terms and Conditions (&ldquo;Terms&rdquo;) govern your access to and use of the
            Website and your purchase of any products offered for sale through it. By accessing
            the Website or placing an order, you (&ldquo;the Customer&rdquo; or &ldquo;you&rdquo;)
            agree to be bound by these Terms in full. If you do not agree with any part of these
            Terms, please do not use the Website.
          </p>
          <p className="mt-3">
            These Terms are provided in accordance with Spanish and European Union law, including
            Royal Legislative Decree 1/2007 (the General Law for the Defense of Consumers and
            Users), Law 34/2002 on Information Society Services and Electronic Commerce
            (LSSI-CE), and Regulation (EU) 2016/679 (GDPR).
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">2. Eligibility</h2>
          <p>
            By using the Website, you confirm that you are at least 18 years old, or are using the
            Website under the supervision of a parent or legal guardian, and that you have the
            legal capacity to enter into binding contracts.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">3. Products and Pricing</h2>
          <p>
            3.1. Safalight sells lighting products and related accessories as described on the
            Website. Product descriptions, images, and specifications are provided for
            informational purposes and, while we make reasonable efforts to ensure accuracy, minor
            variations between images and actual products may occur (e.g., due to screen display
            differences).
          </p>
          <p className="mt-3">
            3.2. All prices are listed in EUR (&euro;) and are inclusive of applicable Spanish VAT
            (IVA) unless otherwise stated. Shipping costs, if applicable, will be displayed
            separately at checkout before order confirmation.
          </p>
          <p className="mt-3">
            3.3. We reserve the right to modify prices at any time; however, the price charged will
            be the price displayed at the time your order is confirmed.
          </p>
          <p className="mt-3">
            3.4. In the event of an obvious pricing or typographical error, Safalight reserves the
            right to cancel the order, notify you, and issue a full refund.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">
            4. Orders and Contract Formation
          </h2>
          <p>
            4.1. Placing an order through the Website constitutes an offer to purchase. A binding
            contract of sale is formed only when we send you an order confirmation email.
          </p>
          <p className="mt-3">
            4.2. We reserve the right to refuse or cancel any order at our discretion, including in
            cases of suspected fraud, stock unavailability, or pricing errors, in which case any
            payment already made will be refunded in full.
          </p>
          <p className="mt-3">
            4.3. You are responsible for providing accurate order, shipping, and payment
            information at checkout.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">5. Payment</h2>
          <p>
            5.1. Payment must be made in full at the time of order through the payment methods
            indicated on the Website.
          </p>
          <p className="mt-3">
            5.2. All payments are processed through secure third-party payment providers. Safalight
            does not store full payment card details on its own servers.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">
            6. Delivery and Shipping
          </h2>
          <p>
            6.1. Estimated delivery times will be indicated on the Website or at checkout and are
            approximate, not guaranteed.
          </p>
          <p className="mt-3">
            6.2. Risk of loss or damage to products passes to the Customer upon delivery to the
            address provided at checkout.
          </p>
          <p className="mt-3">
            6.3. Safalight is not liable for delays caused by circumstances beyond its reasonable
            control, including customs processing, courier delays, or force majeure events.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">
            7. Right of Withdrawal (Consumer Cancellation Rights)
          </h2>
          <p>
            7.1. In accordance with EU consumer protection law, if you are a consumer purchasing
            from within the EU, you have the right to withdraw from your purchase within 14
            calendar days of receiving your order, without needing to give a reason.
          </p>
          <p className="mt-3">
            7.2. To exercise this right, you must notify us of your decision to withdraw via a
            clear written statement (e.g., email to{" "}
            <a href={`mailto:${contact.email}`} className="text-gold-dark underline underline-offset-2 hover:text-ink">
              {contact.email}
            </a>
            ) before the 14-day period expires.
          </p>
          <p className="mt-3">
            7.3. Products must be returned in their original condition and packaging, unused,
            within 14 days of notifying us of withdrawal. Return shipping costs are the
            Customer&rsquo;s responsibility unless the product was defective or incorrect.
          </p>
          <p className="mt-3">
            7.4. Once we receive and inspect the returned product, we will issue a refund to the
            original payment method within 14 days.
          </p>
          <p className="mt-3">
            7.5. The right of withdrawal does not apply to products made to the Customer&rsquo;s
            specifications, custom-made lighting fixtures, or sealed products that have been
            unsealed and are not suitable for return for hygiene or safety reasons.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">
            8. Warranty and Defective Products
          </h2>
          <p>
            8.1. All products include the legal warranty applicable under Spanish law (currently a
            minimum 3-year warranty for new goods under Spanish consumer protection law) covering
            manufacturing defects and non-conformity with the product as described.
          </p>
          <p className="mt-3">
            8.2. If a product is defective or does not match its description, please contact us at{" "}
            <a href={`mailto:${contact.email}`} className="text-gold-dark underline underline-offset-2 hover:text-ink">
              {contact.email}
            </a>{" "}
            with your order number and details of the issue. We will offer repair, replacement,
            price reduction, or refund in accordance with applicable law.
          </p>
          <p className="mt-3">
            8.3. The warranty does not cover damage resulting from misuse, unauthorized
            modification, normal wear and tear, or improper installation.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">9. Intellectual Property</h2>
          <p>
            All content on the Website — including text, graphics, logos, product images, and
            design — is the property of Safalight or its licensors and is protected by applicable
            intellectual property laws. You may not reproduce, distribute, or use this content
            without our prior written consent.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">
            10. Limitation of Liability
          </h2>
          <p>
            10.1. To the fullest extent permitted by law, Safalight shall not be liable for any
            indirect, incidental, or consequential damages arising from the use of the Website or
            products purchased through it.
          </p>
          <p className="mt-3">
            10.2. Nothing in these Terms limits or excludes liability that cannot be limited or
            excluded under applicable Spanish or EU law, including liability for death, personal
            injury caused by negligence, or fraud.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">11. Data Protection</h2>
          <p>
            Safalight processes limited personal data necessary to process and deliver orders (such
            as shipping address and contact details) in accordance with the GDPR and Spanish data
            protection law (LOPDGDD). Full details on how we collect, use, and protect personal
            data are set out in our separate{" "}
            <Link href="/privacy" className="text-gold-dark underline underline-offset-2 hover:text-ink">
              Privacy Policy
            </Link>
            , which forms part of your agreement with us.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">12. Cookies</h2>
          <p>
            The Website does not currently use marketing or tracking cookies — see the{" "}
            <Link href="/privacy" className="text-gold-dark underline underline-offset-2 hover:text-ink">
              Privacy Policy
            </Link>{" "}
            for full details on what is and isn&rsquo;t collected. If that changes, this section
            will be updated to point to a dedicated Cookie Policy.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">
            13. Governing Law and Jurisdiction
          </h2>
          <p>
            These Terms are governed by Spanish law. Any disputes arising from these Terms or your
            use of the Website shall be submitted to the courts of{" "}
            <Placeholder>Insert City, Spain</Placeholder>, without prejudice to any mandatory
            consumer protection rights that entitle you to bring proceedings in your own country of
            residence if you are an EU consumer.
          </p>
          <p className="mt-3">
            Consumers may also access the European Commission&rsquo;s Online Dispute Resolution
            (ODR) platform at{" "}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-dark underline underline-offset-2 hover:text-ink"
            >
              ec.europa.eu/consumers/odr
            </a>{" "}
            for out-of-court dispute resolution.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">
            14. Changes to These Terms
          </h2>
          <p>
            Safalight reserves the right to update or modify these Terms at any time. Changes will
            be posted on this page with an updated &ldquo;Last updated&rdquo; date. Continued use
            of the Website after changes constitutes acceptance of the revised Terms.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">15. Contact Information</h2>
          <p>For any questions regarding these Terms, please contact us at:</p>
          <p className="mt-3">
            Safalight
            <br />
            L&rsquo;Olleria, Spain
            <br />
            Email:{" "}
            <a href={`mailto:${contact.email}`} className="text-gold-dark underline underline-offset-2 hover:text-ink">
              {contact.email}
            </a>
            <br />
            Tax ID / NIF-CIF: <Placeholder>Insert Tax ID</Placeholder>
          </p>
        </RevealOnScroll>

        <RevealOnScroll className="rounded-[6px] border border-ink/10 bg-paper-dim p-6 text-xs leading-relaxed text-ink/60">
          This document is a starting point, not a substitute for advice from a qualified lawyer —
          have it reviewed by one familiar with Spanish and EU consumer law before relying on it,
          particularly the placeholders above.
        </RevealOnScroll>
      </div>
    </div>
  );
}
