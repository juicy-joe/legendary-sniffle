import { NextResponse, type NextRequest } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Product photos travel straight from the admin's browser to Vercel Blob
// storage using this route only to issue a short-lived upload token — the
// actual file bytes never pass through a Server Action/serverless function
// body. Routing them through a Server Action (the original approach) hit
// Vercel's ~4.5MB request body cap: anything larger came back as a raw
// platform-level 413 that the Server Actions client runtime can't parse as
// an RSC response, surfacing to the admin as a hard crash rather than a
// friendly error. This route isn't covered by proxy.ts's matcher
// (/admin/:path*, not /api/:path*), so the same session check it does is
// repeated here — otherwise anyone could mint themselves a token to write
// into this store.
export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        maximumSizeInBytes: 25 * 1024 * 1024, // 25MB — generous; a direct-to-blob
        // upload has no serverless body-size cap to work around, this is just a
        // sanity ceiling against someone uploading something absurd.
        addRandomSuffix: true,
      }),
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 }
    );
  }
}
