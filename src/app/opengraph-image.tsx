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
          backgroundColor: "#0e0d0b",
          backgroundImage:
            "radial-gradient(circle at 78% 22%, rgba(163,133,79,0.35), transparent 60%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 108,
            fontWeight: 600,
            color: "#f8f6f1",
            letterSpacing: "-0.02em",
          }}
        >
          <span>Sa</span>
          <span style={{ color: "#c9a655" }}>Fa</span>
          <span>Light</span>
        </div>
        <div
          style={{
            marginTop: 28,
            width: 120,
            height: 2,
            backgroundColor: "#a3854f",
          }}
        />
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            color: "rgba(248,246,241,0.7)",
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
