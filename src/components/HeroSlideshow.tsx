"use client";

// Same crossfade/pause-friendly pattern as Testimonials.tsx and
// CollectionSlideshow.tsx, plus a slow continuous "Ken Burns" zoom on each
// slide for a more cinematic full-bleed hero — the zoom is the one thing
// unique to this component, so it isn't just CollectionSlideshow reused
// with different sizing.
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export default function HeroSlideshow({
  images,
  intervalMs = 6500,
}: {
  images: { src: string; alt: string }[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  // A lazy initializer (not an effect) — this only needs to read the media
  // query once, and there's no external subscription to keep in sync, so
  // an effect here would just be setState-on-mount with extra steps.
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (reducedMotion || images.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [reducedMotion, images.length, intervalMs]);

  if (images.length === 0) return null;

  return (
    <div className="absolute inset-0">
      {/* initial={false} — without it, AnimatePresence plays the first
          image's own enter transition on mount too, so a first-time visitor
          sees ~1.5s of empty hero before it fades in. Only slide *changes*
          (index updating) should crossfade; the first paint should just be
          there. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1 }}
            animate={{ scale: reducedMotion ? 1 : 1.08 }}
            transition={{ duration: (intervalMs + 1500) / 1000, ease: "linear" }}
          >
            <Image
              src={images[index].src}
              alt={images[index].alt}
              fill
              priority={index === 0}
              quality={92}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
