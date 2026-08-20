import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import CartDrawer from "@/components/CartDrawer";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { getCatalog } from "@/lib/catalog";
import { getMenuItems, getSocialLinks } from "@/lib/menus";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site";
import { jsonLdScriptProps } from "@/lib/json-ld";
import "../globals.css";

// Theme C ("Monochrome Atelier") uses one typeface family for everything —
// hierarchy comes from size/weight, not a serif/sans pairing. Loaded twice
// under the two variable names the rest of the app already references
// (--font-serif for display headings, --font-sans for body/UI) so no
// component className needed to change — see globals.css for the same
// reasoning applied to the color tokens.
// Weight list is trimmed to exactly what's used in the UI (verified via
// grep for font-* weight utility classes) — every unused weight is another
// font file the browser has to download.
const archivoDisplay = Archivo({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "500", "600"],
  display: "swap",
});

const archivoText = Archivo({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

// The homepage has no metadata of its own, so this default title/description
// is what actually renders there — sourced from the admin-editable Settings
// singleton (src/lib/settings.ts) rather than hardcoded.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.defaultMetaTitle,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.defaultMetaDesc,
    alternates: { canonical: "/" },
    keywords: [
      "luxury table lamps",
      "designer lamps",
      "designer lighting",
      "luxury lighting",
      "premium table lamps",
      settings.siteName,
    ],
    authors: [{ name: settings.siteName }],
    openGraph: {
      title: settings.defaultMetaTitle,
      description: settings.defaultMetaDesc,
      url: siteUrl,
      siteName: settings.siteName,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.defaultMetaTitle,
      description: settings.defaultMetaDesc,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    // No explicit `icons` entry — src/app/icon.tsx (Next.js's icon file
    // convention) generates the favicon and wires up the <link rel="icon">
    // tag automatically.
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [catalog, navLinks, socialLinks, settings] = await Promise.all([
    getCatalog(),
    getMenuItems("navbar"),
    getSocialLinks(),
    getSettings(),
  ]);
  // Placeholder "#" URLs (not yet configured in admin) shouldn't be
  // advertised to search engines as the brand's real social profiles.
  const sameAs = socialLinks.map((s) => s.url).filter((url) => url && url !== "#");

  return (
    <html
      lang="en"
      className={`${archivoDisplay.variable} ${archivoText.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink font-sans">
        <script
          type="application/ld+json"
          {...jsonLdScriptProps({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: settings.siteName,
            url: siteUrl,
            description: settings.defaultMetaDesc,
            sameAs,
          })}
        />
        <CatalogProvider products={catalog}>
          <WishlistProvider>
            <CartProvider>
              <div className="grain-overlay" aria-hidden="true" />
              <CursorGlow />
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-ink focus:px-5 focus:py-2 focus:text-sm focus:text-paper"
              >
                Skip to content
              </a>
              <Navbar links={navLinks} />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <Footer />
              <CartDrawer />
            </CartProvider>
          </WishlistProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
