import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { WHOLESALE_SESSION_COOKIE, verifyWholesaleSessionToken } from "@/lib/wholesale-session";
import { LOCALE_COOKIE, negotiateLocale } from "@/lib/i18n-shared";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    return handleAdminAuth(request, pathname);
  }

  const response = await handleWholesaleAuth(request, pathname);

  // First visit only — once a visitor (or the language switcher) has set
  // NEXT_LOCALE explicitly, that choice always wins over the browser
  // header; see getLocale() in src/lib/i18n.ts. The admin panel is
  // deliberately excluded (English-only, matched above before this runs).
  if (!request.cookies.get(LOCALE_COOKIE)) {
    const locale = negotiateLocale(request.headers.get("accept-language"));
    response.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }

  return response;
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
// all public (an applicant obviously isn't logged in yet).
async function handleWholesaleAuth(request: NextRequest, pathname: string) {
  const isPortal = pathname.startsWith("/trade/portal");
  const isLoginPage = pathname === "/trade/login";
  if (!isPortal && !isLoginPage) return NextResponse.next();

  const token = request.cookies.get(WHOLESALE_SESSION_COOKIE)?.value;
  const session = token ? await verifyWholesaleSessionToken(token) : null;

  if (!session && isPortal) {
    const loginUrl = new URL("/trade/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/trade/portal", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Broadened from just /admin and /trade so the locale-detection cookie
  // (above) gets a chance to run on every public page — the admin/trade
  // auth checks are unaffected since they still gate on pathname inside
  // proxy() itself. Excludes static assets, Next internals, and metadata
  // files so those aren't needlessly routed through proxy either.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};
