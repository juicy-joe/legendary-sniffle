// Single source of truth for motion across the site.
// One easing curve, a small set of durations — consistency reads as intention.
export const EASE = [0.16, 1, 0.3, 1] as const;
export const EASE_SOFT = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  fast: 0.25,
  base: 0.45,
  slow: 0.7,
  drawer: 0.5,
} as const;

export const reveal = (delay = 0, y = 24) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: DURATION.slow, delay, ease: EASE },
});

export const fade = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATION.base, delay, ease: EASE },
});
