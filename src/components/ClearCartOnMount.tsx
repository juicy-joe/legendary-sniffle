"use client";

// The cart lives in localStorage (see CartContext), so nothing server-side
// can clear it — this tiny component's only job is running that one
// effect once the success page (which only renders after Stripe confirms
// the payment actually went through) mounts.
import { useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";

export default function ClearCartOnMount() {
  const { clear } = useCart();
  const hasCleared = useRef(false);

  useEffect(() => {
    if (hasCleared.current) return;
    hasCleared.current = true;
    clear();
  }, [clear]);

  return null;
}
