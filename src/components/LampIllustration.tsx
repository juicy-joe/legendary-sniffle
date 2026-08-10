import type { CatalogProduct } from "@/lib/catalog";

const paletteMap: Record<
  CatalogProduct["palette"],
  { fill: string; fillSoft: string; stroke: string; glow: string; shadow: string }
> = {
  gold: {
    fill: "url(#goldFill)",
    fillSoft: "#e9dcb8",
    stroke: "#6f5a34",
    glow: "#a3854f",
    shadow: "#6f5a34",
  },
  ivory: {
    fill: "#efe9d8",
    fillSoft: "#f6f2e8",
    stroke: "#0e0d0b",
    glow: "#d8c69a",
    shadow: "#0e0d0b",
  },
  onyx: {
    fill: "#141412",
    fillSoft: "#232320",
    stroke: "#a3854f",
    glow: "#a3854f",
    shadow: "#000000",
  },
  bronze: {
    fill: "url(#bronzeFill)",
    fillSoft: "#b28f61",
    stroke: "#4a3823",
    glow: "#a3854f",
    shadow: "#4a3823",
  },
  smoke: {
    fill: "#43434a",
    fillSoft: "#5c5c64",
    stroke: "#d8c69a",
    glow: "#8890a0",
    shadow: "#2a2a2e",
  },
};

type Colors = (typeof paletteMap)["gold"];

function ShadeShape({ shade, colors }: { shade: CatalogProduct["shade"]; colors: Colors }) {
  switch (shade) {
    case "dome":
      return (
        <path
          d="M95 150 C95 100 120 68 150 68 C180 68 205 100 205 150 Z"
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth="1"
        />
      );
    case "drum":
      return (
        <path
          d="M100 150 L100 90 Q100 80 150 80 Q200 80 200 90 L200 150 Z"
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth="1"
        />
      );
    case "cone":
      return (
        <path
          d="M128 150 L138 78 Q150 70 162 78 L172 150 Z"
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth="1"
        />
      );
    case "sphere":
      return (
        <circle cx="150" cy="118" r="52" fill={colors.fill} stroke={colors.stroke} strokeWidth="1" />
      );
    case "pleated":
      return (
        <g>
          <path
            d="M95 150 C95 100 120 68 150 68 C180 68 205 100 205 150 Z"
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth="1"
          />
          {[-32, -16, 0, 16, 32].map((dx) => (
            <path
              key={dx}
              d={`M${150 + dx * 0.55} 150 Q${150 + dx * 0.75} 108 ${150 + dx * 0.35} 70`}
              stroke={colors.stroke}
              strokeOpacity="0.3"
              strokeWidth="0.75"
              fill="none"
            />
          ))}
        </g>
      );
  }
}

function BaseShape({ base, colors }: { base: CatalogProduct["base"]; colors: Colors }) {
  switch (base) {
    case "urn":
      return (
        <path
          d="M138 210 L138 240 Q118 258 118 285 Q118 320 150 320 Q182 320 182 285 Q182 258 162 240 L162 210 Z"
          fill={colors.fillSoft}
          stroke={colors.stroke}
          strokeWidth="1"
        />
      );
    case "column":
      return (
        <rect
          x="140"
          y="205"
          width="20"
          height="118"
          rx="2"
          fill={colors.fillSoft}
          stroke={colors.stroke}
          strokeWidth="1"
        />
      );
    case "sculpted":
      return (
        <path
          d="M133 208 Q150 232 168 208 L172 260 Q150 285 128 260 Z"
          fill={colors.fillSoft}
          stroke={colors.stroke}
          strokeWidth="1"
        />
      );
    case "orb":
      return (
        <circle cx="150" cy="255" r="34" fill={colors.fillSoft} stroke={colors.stroke} strokeWidth="1" />
      );
    case "disc":
      return (
        <ellipse cx="150" cy="300" rx="46" ry="12" fill={colors.fillSoft} stroke={colors.stroke} strokeWidth="1" />
      );
  }
}

function parseHeight(dimensions: string) {
  const match = dimensions.match(/H\s*(\d+)/i);
  return match ? match[1] : null;
}

export default function LampIllustration({
  product,
  className = "",
  animated = true,
}: {
  product: CatalogProduct;
  className?: string;
  animated?: boolean;
}) {
  const colors = paletteMap[product.palette];
  const height = parseHeight(product.dimensions);

  return (
    <svg
      viewBox="0 0 300 360"
      className={className}
      role="img"
      aria-label={`${product.name} by ${product.designer}, a ${product.category.toLowerCase()} table lamp`}
    >
      <defs>
        <linearGradient id="goldFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d8c69a" />
          <stop offset="55%" stopColor="#a3854f" />
          <stop offset="100%" stopColor="#6f5a34" />
        </linearGradient>
        <linearGradient id="bronzeFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b28f61" />
          <stop offset="100%" stopColor="#4a3823" />
        </linearGradient>
        <radialGradient id={`glow-${product.slug}`} cx="50%" cy="36%" r="52%">
          <stop offset="0%" stopColor={colors.glow} stopOpacity="0.4" />
          <stop offset="100%" stopColor={colors.glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`shadow-${product.slug}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colors.shadow} stopOpacity="0.28" />
          <stop offset="100%" stopColor={colors.shadow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`sheen-${product.slug}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient glow */}
      <circle
        cx="150"
        cy="112"
        r="108"
        fill={`url(#glow-${product.slug})`}
        className={animated ? "animate-glow-pulse" : ""}
        style={{ transformOrigin: "150px 112px" }}
      />

      {/* Grounding shadow */}
      <ellipse cx="150" cy="332" rx="52" ry="7" fill={`url(#shadow-${product.slug})`} />

      <ShadeShape shade={product.shade} colors={colors} />

      {/* Light-catch highlight */}
      <ellipse cx="127" cy="92" rx="16" ry="22" fill={`url(#sheen-${product.slug})`} opacity="0.5" />

      <line x1="150" y1="150" x2="150" y2="208" stroke={colors.stroke} strokeWidth="1" />

      <BaseShape base={product.base} colors={colors} />

      {/* Atelier dimension mark */}
      {height && (
        <g stroke={colors.stroke} strokeOpacity="0.4" strokeWidth="0.5">
          <line x1="222" y1="68" x2="222" y2="322" />
          <line x1="217" y1="68" x2="227" y2="68" />
          <line x1="217" y1="322" x2="227" y2="322" />
          <text
            x="230"
            y="198"
            fill={colors.stroke}
            fillOpacity="0.45"
            fontSize="9"
            style={{ fontFamily: "var(--font-sans)" }}
            letterSpacing="0.05em"
            stroke="none"
            transform="rotate(90 230 198)"
          >
            H {height}cm
          </text>
        </g>
      )}

      <line x1="112" y1="330" x2="188" y2="330" stroke={colors.stroke} strokeOpacity="0.2" strokeWidth="0.75" />
    </svg>
  );
}
