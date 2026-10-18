"use client";

import * as React from "react";
import {
  Trophy,
  Flame,
  QrCode,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Award,
  Users,
  Search,
  ArrowRight,
  Gauge,
  Activity,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { type ArchetypeViewProps } from "./IndustrialB2BView";
import { parseShowcase } from "@/lib/showcase";
import { ShowcaseProgramGrid } from "@/components/themed/ShowcaseProgramGrid";

export function SportsOutdoorView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {

  // Organizer-authored showcase: sections render only with backing data.
  const showcase = React.useMemo(
    () => parseShowcase((event as any)?.showcaseJson),
    [event]
  );
  const showcasePrograms = showcase.programs.filter(
    (p) => p.kind === "demo" || p.kind === "generic"
  );

  return (
    <div className="space-y-12">
      {/* 1. Category Mission Statement */}
      <section className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-950/20 via-card to-background p-6 sm:p-8 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
                <Trophy className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
                Sports, Fitness & Outdoor Adventure Expo
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Race Bib Collections, Trail Testing & Sports Science Arenas
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Retrieve official marathon race packets, test high-performance trail equipment on indoor obstacle circuits, and measure athletic physiological metrics with certified sports medicine clinicians.
            </p>
          </div>
        </div>
      </section>


      {showcasePrograms.length > 0 && (
        <ShowcaseProgramGrid
          eyebrow="Competition Program"
          title="Featured Competitions & Trial Circuits"
          description="Competitions and trial circuits published by the organizer."
          programs={showcasePrograms}
          locale={locale}
          stampedAt={showcase.attestedAt}
        />
      )}
    </div>
  );
}
