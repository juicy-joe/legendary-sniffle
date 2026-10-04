// Records one first-party page view, for the admin "Traffic" dashboard
// (src/app/admin/(dashboard)/analytics/page.tsx). Written only by the
// consent-gated client beacon (src/components/analytics/PageViewTracker.tsx)
// via navigator.sendBeacon — never includes IP address or any other
// directly-identifying field, only what's needed to chart traffic and break
// it down by page/referrer/device/country.
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SESSION_COOKIE = "ollerialight_session";
const SESSION_MAX_AGE_DAYS = 180;

function parseDevice(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet(?!.*mobile)/.test(ua)) return "tablet";
  if (/mobi|iphone|android/.test(ua)) return "mobile";
  return "desktop";
}

export async function POST(req: NextRequest) {
  let body: { path?: unknown; referrer?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const path = typeof body.path === "string" ? body.path.slice(0, 500) : null;
  if (!path) return NextResponse.json({ ok: false }, { status: 400 });
  const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 500) || null : null;

  const userAgent = req.headers.get("user-agent") ?? "";
  // Vercel's own edge geolocation header — free, no third-party geo-IP
  // service needed, and never resolves a raw IP address ourselves.
  const country = req.headers.get("x-vercel-ip-country") ?? null;

  let sessionId = req.cookies.get(SESSION_COOKIE)?.value ?? null;
  const isNewSession = !sessionId;
  if (!sessionId) sessionId = randomUUID();

  await prisma.pageView.create({
    data: {
      path,
      referrer,
      device: parseDevice(userAgent),
      country,
      sessionId,
    },
  });

  const res = NextResponse.json({ ok: true });
  if (isNewSession) {
    res.cookies.set(SESSION_COOKIE, sessionId, {
      path: "/",
      maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
      sameSite: "lax",
      httpOnly: true,
    });
  }
  return res;
}
