"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";

export function ShortcutInit() {
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const setReducedMotion = useUIStore((s) => s.setReducedMotion);
  const theme = useUIStore((s) => s.theme);
  const highContrast = useUIStore((s) => s.highContrast);
  const setHighContrast = useUIStore((s) => s.setHighContrast);
  const fontScale = useUIStore((s) => s.fontScale);
  const setFontScale = useUIStore((s) => s.setFontScale);

  useEffect(() => {
    const html = document.documentElement;
    if (reducedMotion) {
      html.setAttribute("data-reduce-motion", "true");
    } else {
      html.removeAttribute("data-reduce-motion");
    }
    html.setAttribute("data-theme", theme);
    if (highContrast) {
      html.setAttribute("data-contrast", "high");
    } else {
      html.removeAttribute("data-contrast");
    }
    const safeScale = Number.isFinite(fontScale)
      ? Math.min(1.4, Math.max(0.8, fontScale))
      : 1;
    if (safeScale !== fontScale) {
      setFontScale(safeScale as typeof fontScale);
    }
    html.style.setProperty("--font-scale", String(safeScale));
  }, [reducedMotion, theme, highContrast, fontScale, setFontScale]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("aurelia-ui");
    if (stored) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const prefersContrast = window.matchMedia(
      "(prefers-contrast: more)"
    ).matches;

    if (prefersReduced) setReducedMotion(true);
    if (prefersContrast) setHighContrast(true);
  }, [setReducedMotion, setHighContrast]);

  return null;
}
