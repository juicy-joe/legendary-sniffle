"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import clsx from "clsx";
import { useCart } from "@/context/CartContext";
import { EASE } from "@/lib/motion";

// Theme C ("Monochrome Atelier") header: logo, nav links, cart — nothing
// else. The wishlist icon and "Book a Consultation" button that used to
// live here are dropped from the nav specifically (not removed as
// features — the heart toggle still lives on every product card, and
// "Book a Consultation" still appears on the pages that need it); B&O's
// header is the direct reference: logo left, cart right, no clutter.
export default function Navbar({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const { count: cartCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > lastScrollY.current && y > 160);
      lastScrollY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Basic focus trap + Escape-to-close for the full-screen mobile menu.
  useEffect(() => {
    if (!open) return;
    const container = menuRef.current;
    const focusable = container?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    );
    focusable?.[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
    <header
      className={clsx(
        "sticky top-0 z-50 transition-transform duration-500 ease-out",
        hidden && !open ? "-translate-y-full" : "translate-y-0",
        scrolled
          ? "border-b border-ink/10 bg-paper/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.webp"
            alt="SaFaLight"
            width={1600}
            height={307}
            priority
            className="h-6 w-auto md:h-7"
          />
        </Link>

        <ul className="hidden items-center gap-9 md:flex">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "relative text-[11px] font-medium uppercase tracking-[0.16em] transition-colors",
                    active ? "text-ink" : "text-ink/65 hover:text-ink"
                  )}
                >
                  {link.label}
                  <span
                    className={clsx(
                      "absolute -bottom-2 left-0 h-px bg-gold transition-all duration-300",
                      active ? "w-full" : "w-0"
                    )}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={openCart}
            aria-label={`Cart, ${cartCount} items`}
            className="relative text-ink/70 transition-colors hover:text-gold-dark"
          >
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-paper"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="text-ink md:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>
    </header>

      {/* Deliberately a sibling of <header>, not nested inside it — the
          header has a `translate-y-*` transform for its hide-on-scroll
          behavior, and ANY transform on an ancestor (even translateY(0))
          makes that ancestor the containing block for descendant
          `position: fixed` elements instead of the viewport. Nested here,
          this overlay was being sized against the header's own short box
          instead of the screen, collapsing to zero height. */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed inset-0 top-[73px] z-40 flex flex-col bg-paper md:hidden"
          >
            <ul className="flex flex-1 flex-col justify-center gap-1 px-8">
              {links.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 + i * 0.06, ease: EASE }}
                  className="border-b border-ink/10 py-4"
                >
                  <Link href={link.href} className="font-serif text-4xl font-medium text-ink">
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="border-t border-ink/10 px-8 py-6">
              <button
                type="button"
                onClick={openCart}
                className="flex items-center gap-2 text-sm text-ink/70"
              >
                <ShoppingBag className="h-4 w-4" /> Cart ({cartCount})
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
