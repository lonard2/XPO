"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { rowGridClass } from "@/lib/discovery/grids";

interface ResponsiveRowProps {
  children: React.ReactNode;
  className?: string;
  /** Accessible name for the scroller region. */
  label?: string;
  /** Column cap at desktop widths. Dense cards cap lower than text rows. */
  maxColumns?: number;
}

/**
 * One DOM, two layouts. Below `md` the items scroll horizontally with
 * snap and prev/next controls; at `md` and above the same container
 * becomes the count-aware grid. Cards keep their own motion hooks
 * (tilt, sheen, press), so the row never imposes motion on them.
 */
export function ResponsiveRow({ children, className, label, maxColumns = 5 }: ResponsiveRowProps) {
  const tCom = useTranslations("common");
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);
  const items = React.Children.toArray(children);
  // An odd final item in a two-column tablet grid would sit alone in the
  // left cell and read as a rendering error. Centre it instead.
  const hasOddTail = items.length > 1 && items.length % 2 === 1;

  const updateEdges = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    // No overflow means neither control can do anything.
    setCanNext(maxScroll > 4 && el.scrollLeft < maxScroll - 4);
  }, []);

  React.useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateEdges);
      return () => window.removeEventListener("resize", updateEdges);
    }
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    window.addEventListener("resize", updateEdges);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges, items.length]);

  const scrollByStep = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: direction * Math.max(240, el.clientWidth * 0.8),
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const controlButton =
    "flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border/80 bg-background text-foreground shadow-xs transition-all active:scale-[0.98] hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <div className="space-y-3">
      <div className="flex md:hidden items-center justify-end gap-2">
        <button
          type="button"
          aria-label={tCom("previousItems")}
          disabled={!canPrev}
          onClick={() => scrollByStep(-1)}
          className={controlButton}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={tCom("nextItems")}
          disabled={!canNext}
          onClick={() => scrollByStep(1)}
          className={controlButton}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="relative">
        <div
          ref={scrollerRef}
          role="region"
          aria-label={label}
          onScroll={updateEdges}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              scrollByStep(1);
            } else if (event.key === "ArrowLeft") {
              event.preventDefault();
              scrollByStep(-1);
            }
          }}
          className={cn(
            "flex gap-6 overflow-x-auto snap-x snap-mandatory pb-2",
            "md:grid md:overflow-visible md:pb-0",
            rowGridClass(items.length, maxColumns),
            className
          )}
        >
          {items.map((child, index) => (
            <div
              key={index}
              className={cn(
                "snap-start shrink-0 w-[85%] sm:w-[60%] md:w-auto h-full",
                hasOddTail &&
                  index === items.length - 1 &&
                  "md:col-span-2 md:mx-auto md:w-1/2 lg:col-span-1 lg:w-auto"
              )}
            >
              {child}
            </div>
          ))}
        </div>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent md:hidden"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent md:hidden"
        />
      </div>
    </div>
  );
}
