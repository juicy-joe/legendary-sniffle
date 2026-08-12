import { ImageResponse } from "next/og";

// Next.js's icon file convention — generates the favicon at build time (no
// runtime cost) and wires up the correct <link rel="icon"> tag automatically.
// Lives at the true app root (sibling to (site)/ and admin/, not inside
// either) so it applies to both the storefront and the admin panel, same
// as robots.ts/sitemap.ts/opengraph-image.tsx.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0e0d0b",
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 22,
            fontWeight: 700,
            color: "#c9a655",
            lineHeight: 1,
            transform: "translateY(-1px)",
          }}
        >
          S
        </span>
      </div>
    ),
    { ...size }
  );
}
