import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { WHOLESALE_SESSION_COOKIE, verifyWholesaleSessionToken } from "@/lib/wholesale-session";
import {
  LOCALE_COOKIE,
  LOCALE_HEADER,
  negotiateLocale,
  localeFromCountry,
  defaultLocale,
  isRoutableLocale,
  type Locale,
} from "@/lib/i18n-shared";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return pathname.startsWith("/admin") ? handleAdminAuth(request, pathname) : NextResponse.next();
  }

  // Every (site) route is reached through exactly one of two paths below —
  // never both, never neither — which is what makes the explicit-URL
  // guarantee in the master spec hold: a request that already names a
  // locale in its URL is routed on that alone, and never consults geo-IP
  // or Accept-Language at all.
  const localeMatch = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  if (localeMatch && isRoutableLocale(localeMatch[1])) {
    return handleLocalizedRequest(request, localeMatch[1] as Locale, localeMatch[2] || "/");
  }

  return redirectToLocalizedUrl(request, pathname);
}

// The URL already names a supported locale (/es/products/foo) — rewritten
// internally to the unprefixed route Next.js actually has a page for
// (/products/foo), carrying the matched locale along as a request header
// so getLocale() can read it back for this render without touching the
// cookie at all. The cookie is still refreshed as a side effect, purely so
// a later visit to a bare, unprefixed URL (old bookmark, typed-in path)
// picks up this same locale instead of re-negotiating from scratch.
async function handleLocalizedRequest(request: NextRequest, locale: Locale, rest: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);

  const rewrittenUrl = request.nextUrl.clone();
  rewrittenUrl.pathname = rest;

  const response = await handleWholesaleAuth(request, rest, locale, requestHeaders, rewrittenUrl);
  response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: ONE_YEAR });
  return response;
}

// No locale in the URL at all — either a first-ever visit to the bare
// domain, or an old URL indexed/bookmarked/linked from before this site
// had locale prefixes. Permanently redirected (308) to the locale-prefixed
// equivalent so search engines consolidate on the new URL rather than
// treating the two as separate pages, using the same preference order as
// before this feature existed: an explicit prior choice (cookie) first,
// then geo-IP, then the browser's own Accept-Language, then English.
function redirectToLocalizedUrl(request: NextRequest, pathname: string) {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale =
    cookieLocale && isRoutableLocale(cookieLocale)
      ? (cookieLocale as Locale)
      : resolveLocaleFromSignals(request);

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  const response = NextResponse.redirect(redirectUrl, 308);
  response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: ONE_YEAR });
  return response;
}

// Geo-IP (Vercel's own `x-vercel-ip-country` header, free — no third-party
// lookup) is the authoritative signal when it's present: a Spanish/German/
// Icelandic IP always gets that language, and every other country gets
// English, regardless of the browser's own Accept-Language. That header
// only exists on Vercel's infrastructure though, so local dev (and any
// non-Vercel environment) falls back to Accept-Language purely so testing
// locally doesn't always land on English — a real visitor in production
// always has the header and never hits that path.
function resolveLocaleFromSignals(request: NextRequest): Locale {
  const countryCode = request.headers.get("x-vercel-ip-country");
  return countryCode
    ? localeFromCountry(countryCode) ?? defaultLocale
    : negotiateLocale(request.headers.get("accept-language"));
}

async function handleAdminAuth(request: NextRequest, pathname: string) {
  const isLoginPage = pathname === "/admin/login";

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

// Only /trade/portal (and anything under it) requires a wholesale login —
// /trade itself, /trade/apply, /trade/login, and /trade/set-password are
// all public (an applicant obviously isn't logged in yet). `pathname` here
// is always already the unprefixed route (handleLocalizedRequest strips the
// locale before calling this) — every redirect this builds re-adds that
// same `locale` so a wholesale buyer never gets bounced out of the
// language they were browsing in.
async function handleWholesaleAuth(
  request: NextRequest,
  pathname: string,
  locale: Locale,
  requestHeaders: Headers,
  rewrittenUrl: URL
) {
  const isPortal = pathname.startsWith("/trade/portal");
  const isLoginPage = pathname === "/trade/login";

  if (isPortal || isLoginPage) {
    const token = request.cookies.get(WHOLESALE_SESSION_COOKIE)?.value;
    const session = token ? await verifyWholesaleSessionToken(token) : null;

    if (!session && isPortal) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = `/${locale}/trade/login`;
      loginUrl.searchParams.set("from", `/${locale}${pathname}`);
      return NextResponse.redirect(loginUrl);
    }

    if (session && isLoginPage) {
      const portalUrl = request.nextUrl.clone();
      portalUrl.pathname = `/${locale}/trade/portal`;
      return NextResponse.redirect(portalUrl);
    }
  }

  return NextResponse.rewrite(rewrittenUrl, { request: { headers: requestHeaders } });
}

export const config = {
  // Broadened from just /admin and /trade so the locale-routing logic
  // above gets a chance to run on every public page — the admin/trade auth
  // checks are unaffected since they still gate on pathname inside proxy()
  // itself. Excludes static assets, Next internals, and metadata routes so
  // those are never swept into a locale redirect/rewrite: most have a file
  // extension already caught by the trailing `.*\\..*` clause (favicon.ico,
  // sitemap.xml, robots.txt, icon.png, ...), but Next's image-convention
  // routes (opengraph-image, twitter-image, apple-icon) render as plain
  // extensionless paths at request time, so they're named explicitly —
  // a real bug caught in testing: /opengraph-image was getting 308'd to
  // /en/opengraph-image, a path with no actual route behind it, which
  // would have broken every social-share preview in production.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|opengraph-image|twitter-image|apple-icon|.*\\..*).*)",
  ],
};
