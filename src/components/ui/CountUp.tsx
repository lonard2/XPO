"use client";

import * as React from "react";

/** Ease-out cubic: fast start, gentle landing. Pure for unit tests. */
export function easeOutCubic(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - clamped, 3);
}

function motionReduced(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return true;
  if (document.documentElement.classList.contains("motion-off")) return true;
  if (typeof window.matchMedia === "function") {
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    } catch {
      // Ignore media query errors
    }
  }
  return false;
}

export interface CountUpProps {
  value: number;
  decimals?: number;
  durationMs?: number;
  className?: string;
  label?: string;
  format?: (n: number) => string;
}

/**
 * Animated number that counts from 0 to `value` on mount and on change.
 * Renders the final value instantly under reduced motion or motion-off,
 * and always exposes it via aria-label so assistive tech reads truth.
 */
export function CountUp({
  value,
  decimals = 0,
  durationMs = 900,
  className,
  label,
  format,
}: CountUpProps) {
  const render = React.useCallback(
    (n: number) =>
      format
        ? format(n)
        : Number(n.toFixed(decimals)).toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }),
    [format, decimals]
  );

  const [display, setDisplay] = React.useState(0);
  const fromRef = React.useRef(0);

  React.useEffect(() => {
    if (motionReduced()) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }
    const from = fromRef.current;
    if (from === value) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = Date.now();
    const tick = () => {
      const t = durationMs <= 0 ? 1 : Math.min((Date.now() - start) / durationMs, 1);
      const current = from + (value - from) * easeOutCubic(t);
      if (t >= 1) {
        fromRef.current = value;
        setDisplay(value);
        return;
      }
      setDisplay(current);
      if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
        raf = window.requestAnimationFrame(tick);
      } else {
        timer = setTimeout(tick, 16);
      }
    };
    tick();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [value, durationMs]);

  return (
    <span className={className} aria-label={label ?? render(value)}>
      {render(display)}
    </span>
  );
}
