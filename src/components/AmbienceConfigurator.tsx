"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/products";
import LampIllustration from "./LampIllustration";
import MagneticButton from "./MagneticButton";

const palettes: { key: Product["palette"]; label: string; swatch: string }[] = [
  { key: "gold", label: "Gilded", swatch: "#a3854f" },
  { key: "ivory", label: "Ivory Marble", swatch: "#efe9d8" },
  { key: "onyx", label: "Onyx", swatch: "#141412" },
  { key: "bronze", label: "Bronze", swatch: "#6f5030" },
  { key: "smoke", label: "Smoked Crystal", swatch: "#43434a" },
];

const shades: { key: Product["shade"]; label: string }[] = [
  { key: "dome", label: "Dome" },
  { key: "drum", label: "Drum" },
  { key: "cone", label: "Cone" },
  { key: "sphere", label: "Sphere" },
  { key: "pleated", label: "Pleated" },
];

export default function AmbienceConfigurator() {
  const [palette, setPalette] = useState<Product["palette"]>("gold");
  const [shade, setShade] = useState<Product["shade"]>("dome");
  const [brightness, setBrightness] = useState(65);

  const previewProduct: Product = useMemo(
    () => ({
      slug: "atelier-preview",
      name: "Your Design",
      designer: "SaFaLight Atelier",
      collection: "Configurator Preview",
      price: 0,
      category: "Brass",
      palette,
      shade,
      base: "column",
      materials: "",
      dimensions: "",
      description: "",
      story: "",
    }),
    [palette, shade]
  );

  return (
    <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
      <div
        className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center rounded-[6px] border border-ink/10 bg-gradient-to-b from-paper-dim to-paper p-10 transition-all duration-500"
        style={{
          filter: `brightness(${0.75 + (brightness / 100) * 0.55})`,
        }}
      >
        <LampIllustration product={previewProduct} className="h-full w-full" />
      </div>

      <div className="space-y-8">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-ink/50">
            01 &mdash; Choose a finish
          </p>
          <div className="flex flex-wrap gap-3">
            {palettes.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPalette(p.key)}
                aria-label={p.label}
                aria-pressed={palette === p.key}
                className={`h-10 w-10 rounded-full border-2 transition-all duration-300 ${
                  palette === p.key
                    ? "scale-110 border-gold-dark"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: p.swatch }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-ink/50">
            02 &mdash; Choose a silhouette
          </p>
          <div className="flex flex-wrap gap-2">
            {shades.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setShade(s.key)}
                className={`rounded-[3px] border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.1em] transition-colors duration-300 ${
                  shade === s.key
                    ? "border-gold-dark bg-gold-dark/10 text-gold-dark"
                    : "border-ink/20 text-ink/60 hover:border-ink"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">
              03 &mdash; Adjust the ambience
            </p>
            <span className="text-xs text-ink/50">{brightness}%</span>
          </div>
          <input
            type="range"
            min={20}
            max={100}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full accent-[#6f5a34]"
            aria-label="Adjust ambience brightness"
          />
        </div>

        <p className="text-sm leading-relaxed text-ink/55">
          Every SaFaLight piece is made to order &mdash; and this isn&rsquo;t
          just a preview toy. Our glass and metal ateliers genuinely take
          custom commissions: configure a starting point here, then bring it
          to our design team to refine into a real piece.
        </p>

        <MagneticButton href="/contact" variant="ghost">
          Start a Custom Commission <ArrowRight className="h-3.5 w-3.5" />
        </MagneticButton>
      </div>
    </div>
  );
}
