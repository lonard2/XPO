"use client";

import * as React from "react";
import { calcTilt, tiltTransform } from "@/lib/motion/tilt";

/**
 * Site-wide Expressive tilt engine. One delegated, rAF-throttled pointer
 * listener drives pointer-tracked 3D tilt on `[data-tilt]` surfaces — event
 * cards, venue cards, and the motion preview card.
 *
 * Active only when all hold: `motion-expressive` on `<html>`, fine pointer,
 * and no OS reduced-motion request. Touch, keyboard, reduced-motion, and
 * subtle/off visitors are untouched; their CSS hover fallbacks still apply.
 */
export function MotionTilt() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Coarse pointers (touch) never get tilt: text must not shift under thumbs.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let current: HTMLElement | null = null;
    let raf = 0;
    let pending: { x: number; y: number } | null = null;

    const expressiveOn = () =>
      document.documentElement.classList.contains("motion-expressive");

    const clear = () => {
      if (current) {
        current.style.transform = "";
        current = null;
      }
      pending = null;
    };

    const apply = () => {
      raf = 0;
      if (!pending || !current || !current.isConnected) {
        pending = null;
        return;
      }
      const rect = current.getBoundingClientRect();
      current.style.transform = tiltTransform(calcTilt(rect, pending.x, pending.y));
      pending = null;
    };

    const onMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        !target ||
        target.closest("input,textarea,select,[contenteditable]") ||
        !expressiveOn()
      ) {
        if (current && !(target && current.contains(target))) clear();
        return;
      }
      const card = target.closest("[data-tilt]") as HTMLElement | null;
      if (!card) {
        clear();
        return;
      }
      if (card !== current) {
        clear();
        current = card;
      }
      pending = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onLeave = () => clear();

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      clear();
    };
  }, []);

  return null;
}
