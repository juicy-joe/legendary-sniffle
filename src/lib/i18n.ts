import "server-only";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  LOCALE_COOKIE,
  LOCALE_HEADER,
  isLocale,
  negotiateLocale,
  routableLocales,
  defaultLocale,
  type Locale,
} from "./i18n-shared";

// Re-exported so existing server-side call sites can keep importing
// everything locale-related from "@/lib/i18n" — only client components need
// to reach for "@/lib/i18n-shared" directly (see its own comment for why).
export { locales, defaultLocale, localeNames, LOCALE_COOKIE, negotiateLocale, type Locale } from "./i18n-shared";

/** Builds a page's `alternates` metadata (canonical + hreflang) from its
 * locale-agnostic path, e.g. localeAlternates("es", "/table-lamps") for a
 * page reached at /es/table-lamps. `path` is always the UNPREFIXED route
 * (what the page itself is mounted at, e.g. "/table-lamps" or "/" for the
 * homepage) — this derives every locale's URL from it, so canonicals never
 * drift from hreflang the way they would if each were built by hand at the
 * call site. x-default points at English, the site's fallback locale for
 * any visitor/crawler whose language isn't one of the four translated
 * ones. */
export function localeAlternates(locale: Locale, path: string) {
  const urlFor = (l: Locale) => (path === "/" ? `/${l}` : `/${l}${path}`);
  const languages: Record<string, string> = { "x-default": urlFor(defaultLocale) };
  for (const l of routableLocales) languages[l] = urlFor(l);
  return { canonical: urlFor(locale), languages };
}

/** The current request's locale. proxy.ts resolves the URL's locale prefix
 * (/es/..., /de/..., ...) and attaches it as the x-locale request header
 * before rewriting to the unprefixed route — that header is authoritative
 * whenever present, since it reflects exactly what's in the address bar
 * right now. The NEXT_LOCALE cookie (set by the same rewrite, and by the
 * language switcher) is only a fallback for requests that never went
 * through that rewrite at all — practically, just the admin panel and API
 * routes, which proxy.ts deliberately excludes from locale routing. */
export async function getLocale(): Promise<Locale> {
  const headerList = await headers();
  const headerValue = headerList.get(LOCALE_HEADER);
  if (headerValue && isLocale(headerValue)) return headerValue;

  const store = await cookies();
  const cookieValue = store.get(LOCALE_COOKIE)?.value;
  if (cookieValue && isLocale(cookieValue)) return cookieValue;

  return negotiateLocale(headerList.get("accept-language"));
}

/** Bulk-loads every UI string translated for a locale into a plain object,
 * keyed exactly as stored (e.g. "nav.home") — one query per page render
 * instead of one per string. English callers get an empty map back
 * (there's nothing to look up; see t() below), so this never runs a query
 * needlessly for the majority-English admin/default case. */
export async function getUiTranslations(locale: Locale): Promise<Record<string, string>> {
  if (locale === "en") return {};
  const rows = await prisma.uiTranslation.findMany({ where: { locale }, select: { key: true, value: true } });
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
}

/** Looks up `key` in a pre-loaded translation map (see getUiTranslations),
 * falling back to `fallback` (the existing English copy already hardcoded
 * at the call site) when untranslated. Used as `t(dict, "nav.home", "Home")`
 * — the fallback argument is what keeps every call site correct even
 * before a translation exists, and doubles as living documentation of
 * what the key means. */
export function t(dict: Record<string, string>, key: string, fallback: string): string {
  return dict[key] ?? fallback;
}

/** Same fallback pattern as t(), for a translated field on a specific
 * database record (a product's description/story, a designer's bio, a
 * content-singleton's heading, etc.) rather than a static UI string. */
export async function getContentField(
  locale: Locale,
  model: string,
  recordId: string,
  field: string,
  fallback: string
): Promise<string> {
  if (locale === "en") return fallback;
  const row = await prisma.contentTranslation.findUnique({
    where: { locale_model_recordId_field: { locale, model, recordId, field } },
    select: { value: true },
  });
  return row?.value ?? fallback;
}

/** Bulk variant of getContentField for a whole record at once (e.g. every
 * translatable field on one Product) — one query instead of one per
 * field. Returns a plain field->value map of only the fields that have a
 * translation for this locale; missing entries mean "use the English
 * column value", exactly like getUiTranslations/t(). */
export async function getContentFields(
  locale: Locale,
  model: string,
  recordId: string
): Promise<Record<string, string>> {
  if (locale === "en") return {};
  const rows = await prisma.contentTranslation.findMany({
    where: { locale, model, recordId },
    select: { field: true, value: true },
  });
  const map: Record<string, string> = {};
  for (const row of rows) map[row.field] = row.value;
  return map;
}

/** Bulk variant of getContentFields across many records of the same model
 * at once (e.g. every nav MenuItem, every Designer in a listing) — one
 * query instead of one per record. Returns recordId -> field -> value;
 * missing entries mean "use the English column value". */
export async function getContentFieldsForModel(
  locale: Locale,
  model: string,
  recordIds: string[]
): Promise<Record<string, Record<string, string>>> {
  if (locale === "en" || recordIds.length === 0) return {};
  const rows = await prisma.contentTranslation.findMany({
    where: { locale, model, recordId: { in: recordIds } },
    select: { recordId: true, field: true, value: true },
  });
  const map: Record<string, Record<string, string>> = {};
  for (const row of rows) {
    (map[row.recordId] ??= {})[row.field] = row.value;
  }
  return map;
}
