import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { WHOLESALE_SESSION_COOKIE, verifyWholesaleSessionToken } from "@/lib/wholesale-session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    return handleAdminAuth(request, pathname);
  }
  return handleWholesaleAuth(request, pathname);
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
  matcher: ["/admin/:path*", "/trade/:path*"],
};
