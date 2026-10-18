"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { ShowcaseProgram } from "@/lib/showcase";
import { showcaseAgeDays, showcaseDateLabel, SHOWCASE_STALE_DAYS } from "@/lib/showcase";
import { cn } from "@/lib/utils";

interface ShowcaseProgramGridProps {
  eyebrow: string;
  title: string;
  description?: string;
  programs: ShowcaseProgram[];
  accentClass?: string;
  className?: string;
  locale?: string;
  /** ISO timestamp of last attestation; renders the content-age stamp. */
  stampedAt?: string | null;
}

/**
 * Data-backed program grid shared by archetype views. Renders nothing when
 * there are no rows: every cell traces to an organizer-entered program row.
 */
export function ShowcaseProgramGrid({
  eyebrow,
  title,
  description,
  programs,
  accentClass,
  className,
  locale = "en",
  stampedAt,
}: ShowcaseProgramGridProps) {
  if (!programs || programs.length === 0) return null;

  const ageDays = stampedAt ? showcaseAgeDays({ attestedAt: stampedAt }) : null;
  const dateLabel = stampedAt ? showcaseDateLabel({ attestedAt: stampedAt }, locale) : null;
  const stale = ageDays !== null && ageDays > SHOWCASE_STALE_DAYS;

  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
          {eyebrow}
        </p>
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{description}</p>
        )}
        {dateLabel && (
          <p className="text-[11px] text-muted-foreground mt-1">
            Organizer content · updated {dateLabel}
            {stale && " · may be outdated — verify with the organizer"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {programs.map((program, idx) => (
          <Card key={idx} className="border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-2 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" size="sm" className={cn("text-xs font-semibold capitalize", accentClass)}>
                  {program.kind}
                </Badge>
                {program.sponsor && (
                  <span className="text-[11px] text-muted-foreground truncate">{program.sponsor}</span>
                )}
              </div>
              <CardTitle className="text-base font-bold text-foreground leading-snug">
                {program.title}
              </CardTitle>
              {program.detail && (
                <CardDescription className="text-xs">{program.detail}</CardDescription>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
