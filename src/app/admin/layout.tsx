import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "../globals.css";

// A separate root layout from the storefront's (src/app/(site)/layout.tsx) —
// the admin panel doesn't need the storefront's Navbar/Footer/cart/wishlist
// providers, cursor effects, or public SEO metadata. It reuses the same
// design tokens (fonts, colors from globals.css) for visual consistency.
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

export const viewport: Viewport = {
  themeColor: "#0e0d0b",
};

export const metadata: Metadata = {
  title: { default: "SaFaLight Admin", template: "%s | SaFaLight Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper text-ink font-sans">{children}</body>
    </html>
  );
}
