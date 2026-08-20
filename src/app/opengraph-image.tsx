import { ImageResponse } from "next/og";

export const alt = "SaFaLight — Luxury Designer Table Lamps";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#121212",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 108,
            fontWeight: 600,
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          <span>SaFaLight</span>
        </div>
        <div
          style={{
            marginTop: 28,
            width: 120,
            height: 2,
            backgroundColor: "#3d5c4c",
          }}
        />
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Luxury Designer Table Lamps
        </div>
      </div>
    ),
    { ...size }
  );
}
