import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import CartDrawer from "@/components/CartDrawer";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// Weight lists are trimmed to exactly what's used in the UI (verified via
// grep for font-* weight utility classes) — every unused weight is another
// font file the browser has to download.
const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const description =
  "SaFaLight curates rare, museum-quality designer table lamps from the world's most celebrated lighting artisans — hand-finished, individually numbered, made to be inherited.";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f6f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0d0b" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SaFaLight | Luxury Designer Table Lamps",
    template: "%s | SaFaLight",
  },
  description,
  keywords: [
    "luxury table lamps",
    "designer lamps",
    "designer lighting",
    "luxury lighting",
    "premium table lamps",
    "SaFaLight",
  ],
  authors: [{ name: "SaFaLight" }],
  openGraph: {
    title: "SaFaLight | Luxury Designer Table Lamps",
    description,
    url: siteUrl,
    siteName: "SaFaLight",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaFaLight | Luxury Designer Table Lamps",
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SaFaLight",
              url: siteUrl,
              description,
              sameAs: [],
            }),
          }}
        />
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
            <Navbar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
