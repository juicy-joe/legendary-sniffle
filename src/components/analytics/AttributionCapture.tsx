"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

// Renders nothing — just records UTM/gclid attribution (if the current URL
// carries any) on first mount of every page. See src/lib/attribution.ts.
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return null;
}
