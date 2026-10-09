"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useTranslations } from "@/components/TranslationsProvider";
import { localizedHref } from "@/lib/i18n-shared";

// Drop-in replacement for next/link's <Link> — every internal <Link
// href="/table-lamps"> in the app imports this instead, so it automatically
// carries the current page's locale prefix (-> "/es/table-lamps") without
// each call site building that itself. localizedHref() already leaves
// external URLs, mailto:/tel:, and hash-only anchors untouched, so this is
// safe to use everywhere next/link's Link was used for an internal route.
// A Client Component so it can read the locale from TranslationsProvider's
// context — safe to render from Server Component parents too, same as any
// other Client Component leaf.
export default function Link({ href, ...rest }: ComponentProps<typeof NextLink>) {
  const { locale } = useTranslations();
  const resolvedHref = typeof href === "string" ? localizedHref(locale, href) : href;
  return <NextLink href={resolvedHref} {...rest} />;
}
