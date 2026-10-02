// Registry of every static UI-string translation key used anywhere on the
// public storefront (via t(dict, key, fallback) / t(key, fallback)) — the
// admin Translations page reads this to render one editable field per key,
// grouped by section. Keep this in sync by hand whenever a new t(...) call
// site is added: the fallback text here must match the fallback argument at
// the call site, since that's what a visitor sees until a translation is
// saved for a given locale.
export type UiKeyEntry = { key: string; fallback: string };
export type UiKeySection = { section: string; keys: UiKeyEntry[] };

export const uiKeySections: UiKeySection[] = [
  {
    section: "Navigation",
    keys: [
      { key: "nav.freeShipping", fallback: "Free Shipping within the EU" },
      { key: "nav.cartAria", fallback: "Cart" },
      { key: "nav.cart", fallback: "Cart" },
      { key: "nav.closeMenu", fallback: "Close menu" },
      { key: "nav.openMenu", fallback: "Open menu" },
    ],
  },
  {
    section: "Breadcrumbs",
    keys: [
      { key: "breadcrumb.home", fallback: "Home" },
      { key: "breadcrumb.products", fallback: "Table Lamps" },
      { key: "breadcrumb.about", fallback: "About Us" },
      { key: "breadcrumb.contact", fallback: "Contact" },
      { key: "breadcrumb.consulting", fallback: "Consulting & Projects" },
      { key: "breadcrumb.trade", fallback: "B2B" },
    ],
  },
  {
    section: "Footer",
    keys: [
      { key: "footer.explore", fallback: "Explore" },
      { key: "footer.collections", fallback: "Collections" },
      {
        key: "footer.tagline",
        fallback:
          "Hand-finished designer table lamps, mouth-blown from lead-free optical crystalline glass in a traditional European glassworks. Each piece is individually polished and inspected for flawless surface quality and exceptional light refraction, produced in small-batch runs that preserve unique chromatic depth, heirloom-grade durability, crafted to outlast generations.",
      },
      { key: "footer.newsletterHeading", fallback: "Join the Retailer List" },
      { key: "footer.contact", fallback: "Contact" },
      { key: "footer.rightsReserved", fallback: "All rights reserved." },
      { key: "footer.privacyPolicy", fallback: "Privacy Policy" },
      { key: "footer.termsAndConditions", fallback: "Terms and Conditions" },
    ],
  },
  {
    section: "Homepage",
    keys: [
      { key: "home.exploreCollection", fallback: "Explore the Collection" },
      { key: "home.marquee.crystallineGlass", fallback: "Crystalline Glass" },
      { key: "home.marquee.mouthBlown", fallback: "Mouth-Blown in Europe" },
      { key: "home.marquee.handPolished", fallback: "Hand-Polished" },
      { key: "home.marquee.chromaticDepth", fallback: "Unique Chromatic Depth" },
      { key: "home.marquee.edition", fallback: "Edition of 100" },
      { key: "home.marquee.durability", fallback: "Generational Durability" },
      { key: "home.theSelection", fallback: "The Selection" },
      { key: "home.featuredPieces", fallback: "Featured Pieces" },
      { key: "home.viewFullCollection", fallback: "View Full Collection" },
      { key: "home.new", fallback: "New" },
      { key: "home.shop", fallback: "Shop" },
      { key: "home.theCraft", fallback: "The Craft" },
      { key: "home.handFinished", fallback: "Hand-Finished" },
      { key: "home.avgDispatchTime", fallback: "Avg. Dispatch Time" },
      { key: "home.stayIlluminated", fallback: "Stay Illuminated" },
      {
        key: "home.newsletterBlurb",
        fallback:
          "New releases, limited editions, and designer studio visits — delivered rarely, and only when it matters.",
      },
    ],
  },
  {
    section: "Products Grid",
    keys: [
      { key: "products.filterAll", fallback: "All" },
      { key: "products.sort", fallback: "Sort" },
      { key: "products.sortFeatured", fallback: "Featured" },
      { key: "products.sortPriceAsc", fallback: "Price: Low to High" },
      { key: "products.sortPriceDesc", fallback: "Price: High to Low" },
      { key: "products.piece", fallback: "piece" },
      { key: "products.pieces", fallback: "pieces" },
      { key: "products.view", fallback: "View" },
    ],
  },
  {
    section: "Product Detail",
    keys: [
      { key: "product.limitedEdition", fallback: "Limited Edition" },
      { key: "product.no", fallback: "No." },
      { key: "product.designedBy", fallback: "Designed by" },
      { key: "product.materials", fallback: "Materials" },
      { key: "product.dimensions", fallback: "Dimensions" },
      { key: "product.quickDelivery", fallback: "Quick delivery" },
      { key: "product.whiteGlove", fallback: "White-glove delivery included" },
      { key: "product.preferToTalk", fallback: "Prefer to talk first?" },
      { key: "product.enquireWithTeam", fallback: "Enquire with our design team" },
      { key: "product.alsoAdmire", fallback: "You May Also Admire" },
      { key: "product.moreFrom", fallback: "More from" },
      { key: "product.removeFromWishlist", fallback: "Remove from wishlist" },
      { key: "product.addToWishlist", fallback: "Add to wishlist" },
      { key: "product.addToCart", fallback: "Add" },
      { key: "product.toCart", fallback: "to cart" },
      { key: "product.addedToCart", fallback: "Added to Cart" },
      { key: "product.addToCartButton", fallback: "Add to Cart" },
      { key: "product.addedToCartSr", fallback: "added to cart" },
      { key: "product.saved", fallback: "Saved" },
      { key: "product.addToWishlistButton", fallback: "Add to Wishlist" },
      { key: "product.inStock", fallback: "{count} in stock" },
      {
        key: "product.limitedStockWarning",
        fallback: "Only {count} in stock — the rest of your order will take 2-3 weeks to ship.",
      },
      { key: "product.madeToOrderWarning", fallback: "Made to order — ships in 2-3 weeks." },
    ],
  },
  {
    section: "About Page",
    keys: [
      { key: "about.ourStory", fallback: "Our Story" },
      { key: "about.theAtelier", fallback: "The Atelier" },
      { key: "about.residentDesigners", fallback: "Our Resident Designers" },
      { key: "about.whatWeStandFor", fallback: "What We Stand For" },
      { key: "about.valuesHeading", fallback: "Values We Do Not Compromise On" },
      { key: "about.readyToFind", fallback: "Ready to Find Your Piece?" },
      {
        key: "about.ctaBlurb",
        fallback: "Speak with our design team about a commission, a specific finish, or a piece for a space you love.",
      },
      { key: "about.bookConsultation", fallback: "Book a Consultation" },
      { key: "about.value.madeByHand.title", fallback: "Made by Hand" },
      {
        key: "about.value.madeByHand.body",
        fallback: "Mouth-blown by master artisans, each sphere individually shaped and hand-polished.",
      },
      { key: "about.value.premiumMaterials.title", fallback: "Premium Raw Materials" },
      {
        key: "about.value.premiumMaterials.body",
        fallback:
          "Our proprietary, lead-free optical crystalline glass composition guarantees exceptional hardness, brilliant light refraction, and a luminous, jewel-like sheen, developed specifically for sculptural lighting.",
      },
      { key: "about.value.madeToLast.title", fallback: "Made to Last" },
      {
        key: "about.value.madeToLast.body",
        fallback: "Every lamp is designed to be repaired, rewired, and passed down — not replaced.",
      },
      { key: "about.value.limitedEditions.title", fallback: "Limited Editions" },
      {
        key: "about.value.limitedEditions.body",
        fallback: "Produced in small series with meticulous attention to detail — no design is ever made more than 100 times.",
      },
    ],
  },
  {
    section: "Contact Page",
    keys: [
      { key: "contact.email", fallback: "Email" },
      { key: "contact.phone", fallback: "Phone" },
      { key: "contact.showroom", fallback: "Showroom" },
      { key: "contact.hours", fallback: "Hours" },
      { key: "contact.getInTouch", fallback: "Get in Touch" },
      { key: "contact.heroHeadline", fallback: "Let's Talk About Light" },
      {
        key: "contact.heroSubtext",
        fallback:
          "Whether you're commissioning a single piece or lighting an entire project, our design team replies personally — no chatbots, no forms into the void.",
      },
      { key: "contact.sendMessage", fallback: "Send Us a Message" },
      { key: "contact.visitOrReach", fallback: "Visit or Reach Us" },
      { key: "contact.showroomByAppointment", fallback: "Private showroom · by appointment" },
      { key: "contact.interest.general", fallback: "General Inquiry" },
      { key: "contact.interest.commission", fallback: "Request a Commission" },
      { key: "contact.interest.trade", fallback: "Trade / Design Firm" },
      { key: "contact.interest.press", fallback: "Press" },
      { key: "contact.form.sent", fallback: "Message Sent" },
      {
        key: "contact.form.sentBlurb",
        fallback: "Thank you for reaching out. A member of our design team will reply within one business day.",
      },
      { key: "contact.form.company", fallback: "Company" },
      { key: "contact.form.fullName", fallback: "Full Name" },
      { key: "contact.form.emailAddress", fallback: "Email Address" },
      { key: "contact.form.interestedIn", fallback: "I'm Interested In" },
      { key: "contact.form.message", fallback: "Message" },
      {
        key: "contact.form.messagePlaceholder",
        fallback: "Tell us about the space, the piece, or the question on your mind.",
      },
      { key: "contact.form.sending", fallback: "Sending..." },
      { key: "contact.form.send", fallback: "Send Message" },
    ],
  },
  {
    section: "Consulting Page",
    keys: [
      { key: "consulting.howWeWork", fallback: "How We Work Together" },
      { key: "consulting.whatWeOffer", fallback: "What We Offer" },
      { key: "consulting.whoWeWorkWith", fallback: "Who We Work With" },
      { key: "consulting.projectTypes", fallback: "Project Types" },
      { key: "consulting.ctaHeadline", fallback: "Have a Project in Mind?" },
      {
        key: "consulting.ctaBlurb",
        fallback: "Tell us about your space and its timeline — we'll get back to you to discuss fit, scope, and next steps.",
      },
      { key: "consulting.startConversation", fallback: "Start a Conversation" },
      { key: "consulting.offer.bespokeDesign.title", fallback: "Custom Glass Lighting" },
      {
        key: "consulting.offer.bespokeDesign.body",
        fallback:
          "A fixture designed around your space, not the other way around — from a single hero piece in mouth-blown crystalline glass to a full lighting concept with custom colourways.",
      },
      { key: "consulting.offer.specConsulting.title", fallback: "Specification & Consulting" },
      {
        key: "consulting.offer.specConsulting.body",
        fallback:
          "Guidance on material, scale, and placement from concept through construction documents, working alongside your architects and interior designers.",
      },
      { key: "consulting.offer.volumeProduction.title", fallback: "Volume Production" },
      {
        key: "consulting.offer.volumeProduction.body",
        fallback: "The same hand-finishing standard as a single commission, scaled to the quantities a larger hospitality or retail project actually needs.",
      },
      { key: "consulting.projectType.hotels", fallback: "Hotels & Hospitality" },
      { key: "consulting.projectType.restaurants", fallback: "Restaurants & Bars" },
      { key: "consulting.projectType.offices", fallback: "Offices & Commercial Spaces" },
      { key: "consulting.projectType.retail", fallback: "Retail & Showrooms" },
      { key: "consulting.projectType.villas", fallback: "Private Villas & Residences" },
      { key: "consulting.projectType.interiorDesigners", fallback: "Interior Designers & Architects" },
    ],
  },
  {
    section: "Trade Page",
    keys: [
      { key: "trade.applyButton", fallback: "Apply for a Trade Account" },
      { key: "trade.alreadyHaveAccount", fallback: "Already have an account? Log in" },
      { key: "trade.perk.tradePricing.title", fallback: "Trade Pricing" },
      {
        key: "trade.perk.tradePricing.body",
        fallback:
          "Log in to view our exclusive retailer prices. For larger quantities or customised projects, individual pricing and special conditions may be available upon request.",
      },
      { key: "trade.perk.dedicatedContact.title", fallback: "A Dedicated Contact" },
      {
        key: "trade.perk.dedicatedContact.body",
        fallback: "Work directly with our team on special orders, custom finishes, and larger project needs.",
      },
      { key: "trade.perk.reviewedNotAutomated.title", fallback: "Reviewed, Not Automated" },
      {
        key: "trade.perk.reviewedNotAutomated.body",
        fallback: "Every trade account is approved personally — pricing stays protected for genuine trade partners.",
      },
    ],
  },
  {
    section: "Cart & Checkout",
    keys: [
      { key: "cart.aria", fallback: "Shopping cart" },
      { key: "cart.yourSelection", fallback: "Your Selection" },
      { key: "cart.close", fallback: "Close cart" },
      { key: "cart.empty", fallback: "Your selection is empty." },
      { key: "cart.browseCollection", fallback: "Browse the Collection" },
      { key: "cart.remove", fallback: "Remove" },
      { key: "cart.fromCart", fallback: "from cart" },
      { key: "cart.decreaseQty", fallback: "Decrease quantity" },
      { key: "cart.increaseQty", fallback: "Increase quantity" },
      { key: "cart.subtotal", fallback: "Subtotal" },
      { key: "cart.shippingNote", fallback: "Shipping & white-glove delivery calculated at checkout." },
      { key: "cart.proceedToCheckout", fallback: "Proceed to Checkout" },
      { key: "checkout.cartEmpty", fallback: "Your cart is empty." },
      { key: "checkout.selectCountryError", fallback: "Please select your country before continuing." },
      { key: "checkout.orderSummary", fallback: "Order Summary" },
      { key: "checkout.qty", fallback: "Qty" },
      { key: "checkout.subtotal", fallback: "Subtotal" },
      { key: "checkout.shipping", fallback: "Shipping" },
      { key: "checkout.free", fallback: "Free" },
      { key: "checkout.taxNote", fallback: "Tax is calculated on the next step, based on your delivery address." },
      { key: "checkout.country", fallback: "Country" },
      { key: "checkout.selectCountry", fallback: "Select your country…" },
      { key: "checkout.shippingSpeed", fallback: "Shipping Speed" },
      { key: "checkout.expressShipping", fallback: "Express Shipping" },
      { key: "checkout.regularShipping", fallback: "Regular Shipping" },
      { key: "checkout.redirecting", fallback: "Redirecting to Payment..." },
      { key: "checkout.continueToPayment", fallback: "Continue to Payment" },
      {
        key: "checkout.stripeNote",
        fallback: "You'll enter your full address and pay securely on Stripe's checkout page.",
      },
    ],
  },
  {
    section: "Newsletter",
    keys: [
      { key: "newsletter.success", fallback: "You're on the list — welcome to Ollerialight." },
      { key: "newsletter.placeholder", fallback: "Your email address" },
      { key: "newsletter.subscribe", fallback: "Subscribe" },
    ],
  },
  {
    section: "Legal Pages",
    keys: [
      { key: "legal.legal", fallback: "Legal" },
      { key: "legal.lastUpdated", fallback: "Last updated:" },
      { key: "legal.privacyPolicy", fallback: "Privacy Policy" },
      {
        key: "legal.notYetTranslatedNotice",
        fallback:
          "This legal document is currently only available in English. Contact us if you'd like it explained in your language before you rely on it.",
      },
    ],
  },
];

export const allUiKeys: UiKeyEntry[] = uiKeySections.flatMap((s) => s.keys);
