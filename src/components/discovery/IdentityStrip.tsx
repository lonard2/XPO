import * as React from "react";
import { cn } from "@/lib/utils";

export interface IdentityStripProps {
  /** Small mono label naming what the platform is. */
  badge: string;
  /** First half of the page heading, before the highlighted phrase. */
  title: string;
  /** Highlighted tail of the page heading. */
  highlight: string;
  /** One or two plain sentences on what a visitor can do here. */
  subtitle: string;
  /** Short, checkable facts. Rendered as a mono row under the heading. */
  proofs: string[];
  /** Active country edition, shown at the top right on wider screens. */
  regionName: string;
  className?: string;
}

/**
 * Page-level masthead for the attendee homepage.
 *
 * The homepage used to open straight into an event carousel, so the first thing a
 * visitor saw was one expo rather than the platform. This plate states what XPO is,
 * who it serves, and the three facts that back the claim, using the signage register
 * the design system commits to: mono micro-labels, hairline rules, and no decorative
 * gradient washes.
 */
export function IdentityStrip({
  badge,
  title,
  highlight,
  subtitle,
  proofs,
  regionName,
  className,
}: IdentityStripProps) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border/80 bg-card", className)}>
      {/* Signage header: what this is, and which edition you are reading. */}
      <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-4 py-2 sm:px-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {badge}
        </span>
        <span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
          {regionName}
        </span>
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-5">
        <h1 className="text-[1.7rem] leading-tight font-extrabold tracking-tight text-foreground text-balance sm:text-4xl">
          {title} <span className="text-primary">{highlight}</span>
        </h1>
        <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-muted-foreground text-pretty sm:text-sm">
          {subtitle}
        </p>
      </div>

      {/* Proof row: facts a delegate can check, not adjectives. */}
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border/60 px-4 py-2.5 sm:px-6">
        {proofs.map((proof) => (
          <li
            key={proof}
            className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
          >
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-primary" />
            {proof}
          </li>
        ))}
      </ul>
    </div>
  );
}
