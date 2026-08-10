"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { ProductPhoto as ProductPhotoType } from "@/lib/catalog";

function PhotoFallback({ swatch }: { swatch: string }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center transition-colors duration-700"
      style={{
        background: `radial-gradient(circle at 50% 38%, ${swatch}55, ${swatch}15 60%, transparent 75%)`,
      }}
    >
      <div
        className="h-1/3 w-1/3 rounded-full opacity-70 blur-[2px]"
        style={{ backgroundColor: swatch }}
        aria-hidden="true"
      />
    </div>
  );
}

export default function ProductPhoto({
  images,
  alt,
  priority = false,
  showSelector = true,
  className,
}: {
  images: ProductPhotoType[];
  alt: string;
  priority?: boolean;
  showSelector?: boolean;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [errored, setErrored] = useState<Record<number, boolean>>({});
  const active = images[index];

  return (
    <div className={clsx("relative h-full w-full", className)}>
      <div className="corner-ticks relative h-full w-full overflow-hidden rounded-2xl">
        {errored[index] ? (
          <PhotoFallback swatch={active.swatch} />
        ) : (
          <Image
            src={active.src}
            alt={`${alt} — ${active.label}`}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-opacity duration-500"
            onError={() => setErrored((prev) => ({ ...prev, [index]: true }))}
          />
        )}
      </div>

      {showSelector && images.length > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <div className="flex flex-wrap gap-2">
            {images.map((img, i) => (
              <button
                key={img.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${img.label} view`}
                aria-pressed={i === index}
                title={img.label}
                className={clsx(
                  "relative h-11 w-11 overflow-hidden rounded-[3px] border transition-all duration-300",
                  i === index
                    ? "border-ink"
                    : "border-ink/15 opacity-60 hover:opacity-100"
                )}
              >
                {errored[i] ? (
                  <div
                    className="h-full w-full"
                    style={{ backgroundColor: img.swatch }}
                  />
                ) : (
                  <Image
                    src={img.src}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                    onError={() =>
                      setErrored((prev) => ({ ...prev, [i]: true }))
                    }
                  />
                )}
              </button>
            ))}
          </div>
          <span className="ml-1 text-[11px] uppercase tracking-[0.1em] text-ink/65">
            {active.label}
          </span>
        </div>
      )}
    </div>
  );
}
