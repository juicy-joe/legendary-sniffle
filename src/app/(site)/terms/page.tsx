import type { Metadata } from "next";
import Link from "next/link";
import RevealOnScroll from "@/components/RevealOnScroll";
import { getContactInfo } from "@/lib/content";
import { getLocale, getUiTranslations, t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "The terms and conditions governing purchases made on Ollerialight.",
  alternates: { canonical: "/terms" },
};

const lastUpdated = "1 October 2026";

export default async function TermsPage() {
  const locale = await getLocale();
  const [contact, dict] = await Promise.all([getContactInfo(), getUiTranslations(locale)]);
  const emailLink = (
    <a href={`mailto:${contact.email}`} className="text-gold-dark underline underline-offset-2 hover:text-ink">
      {contact.email}
    </a>
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 md:px-10 md:py-28">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-ink/65">
        <Link href="/" className="hover:text-ink">{t(dict, "breadcrumb.home", "Home")}</Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink/70">{t(dict, "footer.termsAndConditions", "Terms and Conditions")}</span>
      </nav>

      <RevealOnScroll>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">{t(dict, "legal.legal", "Legal")}</p>
        <h1 className="font-serif text-4xl font-light text-ink md:text-5xl">
          {t(dict, "footer.termsAndConditions", "Terms and Conditions")}
        </h1>
        <p className="mt-4 text-sm text-ink/65">
          {t(dict, "legal.lastUpdated", "Last updated:")} {lastUpdated}
        </p>
      </RevealOnScroll>

      {locale !== "en" && (
        <RevealOnScroll className="mt-8 rounded-[6px] border border-gold/25 bg-gold/5 p-5 text-xs leading-relaxed text-ink/70">
          {t(
            dict,
            "legal.notYetTranslatedNotice",
            "This legal document is currently only available in English. Contact us if you'd like it explained in your language before you rely on it."
          )}
        </RevealOnScroll>
      )}

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-ink/75">
        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">1. Company Information and Scope</h2>
          <p>
            These Terms and Conditions (&ldquo;Terms&rdquo;) govern the use of the website
            Ollerialight.com (the &ldquo;Website&rdquo;) and the purchase of lighting products,
            lamps, lighting objects, accessories and related products offered through the Website.
          </p>
          <p className="mt-3">The Website is operated by:</p>
          <p className="mt-3">
            New World Developments, S.L.
            <br />
            CIF/NIF: B05618996
            <br />
            Registered address: Pol&iacute;gono 5, Parcela 34, 46850 L&rsquo;Olleria (Valencia), Spain
            <br />
            Email: {emailLink}
            <br />
            Website: Ollerialight.com
          </p>
          <p className="mt-3">
            Hereinafter, New World Developments, S.L. may be referred to as &ldquo;Olleria
            Light&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;.
          </p>
          <p className="mt-3">These Terms apply to both:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              consumers purchasing products for purposes outside their business or professional
              activity (&ldquo;Consumers&rdquo; or &ldquo;B2C Customers&rdquo;); and
            </li>
            <li>
              businesses, professionals and other customers purchasing for business or
              professional purposes (&ldquo;Business Customers&rdquo; or &ldquo;B2B
              Customers&rdquo;).
            </li>
          </ul>
          <p className="mt-3">
            Where different legal rules apply to Consumers and Business Customers, the applicable
            provisions are stated separately below.
          </p>
          <p className="mt-3">
            These Terms are intended to comply with applicable Spanish and European Union
            legislation, including, where applicable, Royal Legislative Decree 1/2007, of 16
            November, approving the consolidated text of the General Law for the Defence of
            Consumers and Users, Law 34/2002 on Information Society Services and Electronic
            Commerce (&ldquo;LSSI-CE&rdquo;), applicable Spanish VAT legislation, and applicable
            European Union consumer protection and VAT legislation.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">2. Eligibility and Customer Status</h2>
          <p>2.1. Customers must be legally capable of entering into binding contracts.</p>
          <p className="mt-3">2.2. Consumers must be at least 18 years old.</p>
          <p className="mt-3">
            2.3. A customer purchasing products for purposes relating to their trade, business,
            craft or profession is considered a Business Customer.
          </p>
          <p className="mt-3">
            2.4. Customers creating or using a B2B account must provide accurate and complete
            company information, including, where applicable:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>company or trading name;</li>
            <li>registered address;</li>
            <li>billing address;</li>
            <li>VAT identification number (VAT ID / EU VAT number);</li>
            <li>contact details; and</li>
            <li>any other information reasonably required for invoicing or tax purposes.</li>
          </ul>
          <p className="mt-3">
            2.5. Olleria Light may request evidence of a customer&rsquo;s business status or VAT
            registration before activating or maintaining B2B pricing or VAT treatment.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">3. Products</h2>
          <p>
            3.1. Olleria Light sells lamps, lighting fixtures, lighting objects, accessories and
            related products as described on the Website.
          </p>
          <p className="mt-3">
            3.2. Product descriptions, dimensions, specifications, colours and images are provided
            as accurately as reasonably possible. Minor variations may occur due to manufacturing
            tolerances, materials, lighting conditions or differences in screen settings.
          </p>
          <p className="mt-3">
            3.3. Unless expressly stated otherwise, electrical products must be installed and used
            in accordance with the applicable manufacturer&rsquo;s instructions and applicable
            safety requirements.
          </p>
          <p className="mt-3">
            3.4. Customers are responsible for ensuring that a product is suitable for its intended
            use and installation environment where such suitability depends on information
            supplied by the Customer.
          </p>
          <p className="mt-3">
            3.5. Custom-made, personalised or specially manufactured products may be subject to
            different cancellation and return conditions as described in these Terms and
            applicable law.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">4. Prices</h2>
          <h3 className="mt-5 font-serif text-lg text-ink">4.1. Consumer Prices</h3>
          <p className="mt-2">
            Unless expressly stated otherwise, prices displayed to Consumers are gross prices in
            EUR (&euro;), including applicable VAT.
          </p>
          <p className="mt-3">
            Any applicable delivery charges will be displayed before the Customer submits the
            order.
          </p>
          <h3 className="mt-5 font-serif text-lg text-ink">4.2. B2B Prices</h3>
          <p className="mt-2">
            Olleria Light may offer registered Business Customers net prices excluding VAT.
          </p>
          <p className="mt-3">
            B2B prices may only be displayed or applied where the customer has been accepted as a
            Business Customer and has provided the information required by Olleria Light.
          </p>
          <h3 className="mt-5 font-serif text-lg text-ink">4.3. Spanish Business Customers</h3>
          <p className="mt-2">
            Where a Business Customer is established in Spain and the transaction is subject to
            Spanish VAT, the applicable Spanish VAT will be added to the net price.
          </p>
          <h3 className="mt-5 font-serif text-lg text-ink">4.4. EU Business Customers Outside Spain</h3>
          <p className="mt-2">
            Where a Business Customer is established in another EU Member State and provides a
            valid EU VAT identification number issued by a Member State other than Spain, Olleria
            Light may apply the VAT exemption applicable to an intra-Community supply of goods.
          </p>
          <p className="mt-3">
            The VAT ID must be valid and attributable to the Business Customer placing the order.
            Olleria Light may verify the VAT ID through the applicable European VAT verification
            systems.
          </p>
          <p className="mt-3">
            The VAT exemption is subject to the legal requirements for an intra-Community supply,
            including the movement of the goods from Spain to another EU Member State and the
            provision of the required VAT identification information.
          </p>
          <p className="mt-3">
            Where the requirements for VAT exemption are not satisfied, Olleria Light reserves the
            right to charge the applicable VAT.
          </p>
          <p className="mt-3">
            The relevant intra-Community supply will be reported in accordance with applicable
            Spanish VAT and reporting requirements.
          </p>
          <h3 className="mt-5 font-serif text-lg text-ink">4.5. Customers Outside the European Union</h3>
          <p className="mt-2">
            Orders delivered outside the European Union may be subject to different VAT, customs
            duties, import taxes or other charges.
          </p>
          <p className="mt-3">
            Where an export transaction qualifies for VAT exemption under Spanish law, Olleria
            Light may invoice the transaction without Spanish VAT, subject to the applicable legal
            requirements and documentary evidence.
          </p>
          <p className="mt-3">
            Any import duties, customs charges, local taxes or other charges imposed in the
            destination country are the responsibility of the Customer unless expressly stated
            otherwise.
          </p>
          <h3 className="mt-5 font-serif text-lg text-ink">4.6. VAT Treatment</h3>
          <p className="mt-2">
            The VAT treatment displayed at checkout may depend on the Customer&rsquo;s country,
            customer status, delivery address and, for B2B transactions, the validity and
            applicability of the VAT identification number supplied.
          </p>
          <p className="mt-3">
            A VAT number does not automatically entitle a Customer to VAT-free treatment in every
            transaction.
          </p>
          <h3 className="mt-5 font-serif text-lg text-ink">4.7. Price Changes</h3>
          <p className="mt-2">Olleria Light reserves the right to change prices at any time.</p>
          <p className="mt-3">
            The price applicable to an order is the price displayed at the time the order is
            submitted, subject to obvious pricing or technical errors.
          </p>
          <p className="mt-3">
            In the event of an obvious pricing error, Olleria Light may cancel the affected order
            and refund any payment already made.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">5. B2B Accounts</h2>
          <p>
            5.1. Olleria Light may provide registered Business Customers with access to a dedicated
            B2B account and/or B2B pricing.
          </p>
          <p className="mt-3">
            5.2. B2B account holders must provide accurate and up-to-date company and tax
            information.
          </p>
          <p className="mt-3">
            5.3. Olleria Light reserves the right to verify VAT identification numbers and business
            information.
          </p>
          <p className="mt-3">
            5.4. B2B net pricing does not itself determine the VAT treatment of an order. VAT
            treatment is determined according to applicable tax law and the circumstances of the
            particular transaction.
          </p>
          <p className="mt-3">
            5.5. For EU Business Customers outside Spain, a valid VAT identification number from an
            EU Member State other than Spain must be provided before the order can be treated as an
            exempt intra-Community supply.
          </p>
          <p className="mt-3">
            5.6. If a VAT number is invalid, cannot be verified, does not belong to the Customer, or
            the legal requirements for VAT exemption are otherwise not met, Olleria Light may
            charge the applicable VAT.
          </p>
          <p className="mt-3">
            5.7. B2B customers are responsible for providing correct tax information and for
            complying with any VAT, accounting or reporting obligations applicable to them in their
            country.
          </p>
          <p className="mt-3">
            5.8. Unless mandatory law provides otherwise, purchases made by Business Customers are
            commercial transactions and do not benefit from statutory consumer rights that are
            reserved exclusively for Consumers.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">6. Orders and Contract Formation</h2>
          <p>
            6.1. The products displayed on the Website constitute an invitation to customers to
            submit an order.
          </p>
          <p className="mt-3">
            6.2. By submitting an order, the Customer makes an offer to purchase the selected
            products.
          </p>
          <p className="mt-3">
            6.3. A contract is formed when Olleria Light sends an order confirmation to the email
            address provided by the Customer, unless Olleria Light informs the Customer that the
            order has been rejected or cancelled.
          </p>
          <p className="mt-3">6.4. Olleria Light may refuse or cancel an order where, for example:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>the product is unavailable;</li>
            <li>there is an obvious pricing or technical error;</li>
            <li>payment cannot be processed;</li>
            <li>fraudulent or abusive activity is reasonably suspected;</li>
            <li>required B2B or VAT information cannot be verified; or</li>
            <li>delivery to the requested destination is not possible.</li>
          </ul>
          <p className="mt-3">
            6.5. If an order is cancelled after payment has been received, Olleria Light will
            refund the amount paid for the cancelled order.
          </p>
          <p className="mt-3">
            6.6. Customers are responsible for ensuring that all information provided during
            checkout is correct.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">7. Payment</h2>
          <p>
            7.1. Payment must be made using the payment methods made available on the Website.
          </p>
          <p className="mt-3">
            7.2. Unless otherwise agreed in writing, orders must be paid in full before shipment.
          </p>
          <p className="mt-3">
            7.3. Payments may be processed through third-party payment service providers.
          </p>
          <p className="mt-3">
            7.4. Olleria Light does not ordinarily store complete payment card details on its own
            servers.
          </p>
          <p className="mt-3">
            7.5. For B2B customers purchasing on agreed payment terms, separate written payment
            terms may apply.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">8. Delivery and Shipping</h2>
          <p>8.1. Olleria Light offers shipping to the destinations displayed on the Website.</p>
          <p className="mt-3">
            8.2. Delivery times displayed on the Website or during checkout are estimates unless
            expressly stated as guaranteed.
          </p>
          <p className="mt-3">
            8.3. Free shipping within the EU may be offered for qualifying orders. Any applicable
            conditions, exclusions or minimum order values will be displayed on the Website or
            during checkout.
          </p>
          <p className="mt-3">
            8.4. Delivery dates may be affected by circumstances outside Olleria Light&rsquo;s
            reasonable control, including carrier delays, customs procedures, strikes, shortages,
            extreme weather or other force majeure events.
          </p>
          <p className="mt-3">
            8.5. For Consumer purchases, the risk of loss or damage passes to the Consumer when the
            Consumer or a third party designated by the Consumer, other than the carrier, acquires
            physical possession of the goods, subject to applicable mandatory law.
          </p>
          <p className="mt-3">
            8.6. For Business Customers, risk passes in accordance with the agreed delivery terms
            or, where no specific delivery term has been agreed, applicable commercial law.
          </p>
          <p className="mt-3">
            8.7. Customers are responsible for providing a complete and accurate delivery address.
          </p>
          <p className="mt-3">
            8.8. Additional costs arising from an incorrect or incomplete delivery address, refused
            delivery, or failure to accept delivery may be charged to the Customer where legally
            permissible.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">9. Consumer Right of Withdrawal</h2>
          <p>
            9.1. This section applies only to Consumers who enter into distance contracts for
            products and who have a statutory right of withdrawal.
          </p>
          <p className="mt-3">
            9.2. Subject to the statutory exceptions, Consumers have the right to withdraw from the
            purchase contract within 14 calendar days without giving any reason.
          </p>
          <p className="mt-3">
            9.3. For sales of goods, the withdrawal period normally begins on the day on which the
            Consumer, or a third party designated by the Consumer other than the carrier, acquires
            physical possession of the goods.
          </p>
          <p className="mt-3">
            9.4. To exercise the right of withdrawal, the Consumer must inform Olleria Light of the
            decision to withdraw by an unequivocal statement, for example by email to {emailLink},
            before the withdrawal period expires. The Consumer is not required to use a specific
            form.
          </p>
          <p className="mt-3">
            9.5. The Consumer must return the goods without undue delay and, in any event, no later
            than 14 calendar days from the date on which the Consumer communicated the withdrawal.
          </p>
          <p className="mt-3">
            9.6. Unless the goods are defective, incorrect or otherwise subject to a legal
            exception, the Consumer bears the direct cost of returning the goods where the Consumer
            has been properly informed of this obligation before entering into the contract.
          </p>
          <p className="mt-3">
            9.7. The Consumer is responsible for any diminished value of the goods resulting from
            handling beyond what is necessary to establish the nature, characteristics and
            functioning of the goods.
          </p>
          <p className="mt-3">
            9.8. Olleria Light will reimburse the payments received from the Consumer, including
            standard delivery costs where required by applicable law, without undue delay and
            normally within 14 days of receiving notification of withdrawal.
          </p>
          <p className="mt-3">
            9.9. Olleria Light may withhold reimbursement until the goods have been received back
            or the Consumer has provided evidence that the goods have been returned, whichever
            occurs first, where permitted by applicable law.
          </p>
          <p className="mt-3">
            9.10. The refund will normally be made using the same payment method used for the
            original transaction, unless otherwise agreed.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">
            10. Exceptions to the Right of Withdrawal
          </h2>
          <p>
            The statutory right of withdrawal does not apply where an applicable legal exception
            exists, including, where applicable:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>products made to the Consumer&rsquo;s specifications or clearly personalised;</li>
            <li>goods made according to the Consumer&rsquo;s specific requirements; or</li>
            <li>other products expressly excluded by applicable mandatory consumer law.</li>
          </ul>
          <p className="mt-3">
            Where a product is made to order, customised or manufactured specifically for the
            Customer, the applicable cancellation and return conditions will be communicated
            before or during the order process where required by law.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">
            11. Consumer Legal Guarantee and Defective Products
          </h2>
          <p>11.1. Nothing in these Terms limits the mandatory statutory rights of Consumers.</p>
          <p className="mt-3">
            11.2. Consumer purchases are covered by the statutory legal guarantee applicable under
            Spanish and EU consumer law.
          </p>
          <p className="mt-3">
            11.3. For new goods sold to Consumers in Spain, the statutory period for lack of
            conformity is generally three years from delivery, subject to applicable legislation
            and any statutory exceptions.
          </p>
          <p className="mt-3">
            11.4. If a product is defective, damaged, does not conform to the contract, or does not
            correspond to the agreed description, the Consumer should contact Olleria Light at{" "}
            {emailLink}.
          </p>
          <p className="mt-3">
            The Customer should provide the order number and, where useful, photographs or other
            information describing the problem.
          </p>
          <p className="mt-3">
            11.5. Depending on the circumstances and applicable law, the Consumer may be entitled
            to repair, replacement, price reduction, termination of the contract and/or
            reimbursement.
          </p>
          <p className="mt-3">
            11.6. The legal guarantee does not exclude or limit any mandatory statutory rights.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">12. B2B Warranty and Conformity</h2>
          <p>
            12.1. Business Customers do not acquire the statutory consumer protections reserved
            for Consumers.
          </p>
          <p className="mt-3">
            12.2. Products supplied to Business Customers will nevertheless comply with the
            contractual specifications and any mandatory commercial or product-conformity
            requirements applicable to the transaction.
          </p>
          <p className="mt-3">
            12.3. Unless mandatory law provides otherwise, a Business Customer must inspect the
            products within a reasonable period after delivery and notify Olleria Light promptly
            of any apparent shortage, transport damage or non-conformity.
          </p>
          <p className="mt-3">
            12.4. Business Customers should contact {emailLink} and provide the order number and
            details of the alleged defect or non-conformity.
          </p>
          <p className="mt-3">
            12.5. Nothing in this section excludes mandatory liability that cannot legally be
            excluded or limited.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">13. Installation and Product Use</h2>
          <p>
            13.1. Customers must follow all applicable installation, operating and safety
            instructions supplied with the products.
          </p>
          <p className="mt-3">
            13.2. Electrical installation work should be carried out by a suitably qualified
            professional where required by applicable law or where the nature of the installation
            requires professional expertise.
          </p>
          <p className="mt-3">
            13.3. Olleria Light is not responsible for damage caused by incorrect installation,
            improper use, unauthorised modification, failure to follow product instructions or use
            outside the product&rsquo;s intended purpose, except where mandatory law provides
            otherwise.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">14. Intellectual Property</h2>
          <p>
            14.1. Unless otherwise indicated, all content on the Website, including text,
            photographs, product images, graphics, logos, designs, layouts and other materials, is
            owned by or licensed to Olleria Light.
          </p>
          <p className="mt-3">14.2. Such content is protected by applicable intellectual property laws.</p>
          <p className="mt-3">
            14.3. No Customer may reproduce, distribute, modify, publish or commercially exploit
            Website content without prior written permission, except where such use is permitted
            by mandatory law.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">
            15. Website Availability and Errors
          </h2>
          <p>
            15.1. Olleria Light aims to keep the Website available and information accurate but
            does not guarantee that the Website will always be uninterrupted, error-free or free
            from technical defects.
          </p>
          <p className="mt-3">
            15.2. Temporary interruptions may occur for maintenance, security, technical upgrades
            or circumstances outside Olleria Light&rsquo;s reasonable control.
          </p>
          <p className="mt-3">15.3. Nothing in this section limits mandatory statutory rights.</p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">16. Limitation of Liability</h2>
          <p>
            16.1. Olleria Light is liable in accordance with applicable law for losses caused by
            its breach of legal obligations or contractual obligations.
          </p>
          <p className="mt-3">
            16.2. To the maximum extent permitted by law, Olleria Light shall not be liable for
            indirect or consequential losses suffered by Business Customers where such losses are
            not reasonably foreseeable or are not directly caused by a breach of contract.
          </p>
          <p className="mt-3">
            16.3. Nothing in these Terms excludes or limits liability that cannot legally be
            excluded or limited, including liability for death or personal injury caused by
            negligence, fraud, or other mandatory statutory liability.
          </p>
          <p className="mt-3">16.4. Nothing in these Terms limits the mandatory rights of Consumers.</p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">17. Data Protection</h2>
          <p>
            17.1. Olleria Light processes personal data in accordance with applicable data
            protection legislation, including Regulation (EU) 2016/679 (&ldquo;GDPR&rdquo;) and
            applicable Spanish data protection legislation.
          </p>
          <p className="mt-3">17.2. Personal data may be processed for purposes including:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>processing and fulfilling orders;</li>
            <li>customer service;</li>
            <li>payment processing;</li>
            <li>invoicing and accounting;</li>
            <li>delivery and logistics;</li>
            <li>fraud prevention and security;</li>
            <li>compliance with legal obligations; and</li>
            <li>other purposes described in the Privacy Policy.</li>
          </ul>
          <p className="mt-3">
            17.3. Further information regarding the processing of personal data, legal bases,
            retention periods and data subject rights is provided in the Website&rsquo;s{" "}
            <Link href="/privacy" className="text-gold-dark underline underline-offset-2 hover:text-ink">
              Privacy Policy
            </Link>
            .
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">18. Cookies</h2>
          <p>18.1. The Website may use cookies and similar technologies.</p>
          <p className="mt-3">
            18.2. The categories of cookies used, their purposes and the choices available to users
            are described in the Website&rsquo;s Cookie Policy and/or cookie consent mechanism.
          </p>
          <p className="mt-3">
            18.3. Where legally required, non-essential cookies will only be used after the
            required consent has been obtained.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">
            19. Consumer Complaints and Alternative Dispute Resolution
          </h2>
          <p>19.1. Customers may contact Olleria Light regarding any complaint or dispute at {emailLink}.</p>
          <p className="mt-3">
            19.2. Consumers retain any mandatory rights available under applicable Spanish or EU
            consumer protection legislation, including rights relating to applicable alternative
            dispute resolution mechanisms.
          </p>
          <p className="mt-3">
            19.3. The former European Commission Online Dispute Resolution (ODR) platform is no
            longer available. References to that platform in older legal documents should not be
            understood as creating an ongoing obligation to use or link to that platform.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">
            20. Governing Law and Jurisdiction
          </h2>
          <p>
            20.1. These Terms are governed by Spanish law, without prejudice to mandatory consumer
            protection provisions that may apply to Consumers residing in another country.
          </p>
          <p className="mt-3">
            20.2. For Consumers, nothing in these Terms affects mandatory rights to bring
            proceedings before the courts having jurisdiction under applicable consumer protection
            legislation.
          </p>
          <p className="mt-3">
            20.3. For Business Customers, unless mandatory law provides otherwise, disputes arising
            from or relating to these Terms or a purchase from the Website shall be submitted to
            the competent courts in Spain in accordance with applicable jurisdiction rules.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">21. Changes to These Terms</h2>
          <p>
            21.1. Olleria Light may update these Terms from time to time to reflect changes in the
            Website, products, business practices or applicable legislation.
          </p>
          <p className="mt-3">
            21.2. The version applicable to an order is the version in force when the order was
            submitted, unless a change is required by mandatory law.
          </p>
          <p className="mt-3">
            21.3. The date shown at the beginning of these Terms indicates when they were last
            updated.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">22. Severability</h2>
          <p>
            If any provision of these Terms is found to be invalid, unlawful or unenforceable, the
            remaining provisions shall remain in full force to the extent permitted by law.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <h2 className="mb-3 font-serif text-2xl font-light text-ink">23. Contact Information</h2>
          <p>
            New World Developments, S.L.
            <br />
            CIF/NIF: B05618996
            <br />
            Registered address: Pol&iacute;gono 5, Parcela 34
            <br />
            46850 L&rsquo;Olleria (Valencia), Spain
            <br />
            Email: {emailLink}
            <br />
            Website: Ollerialight.com
          </p>
        </RevealOnScroll>
      </div>
    </div>
  );
}
