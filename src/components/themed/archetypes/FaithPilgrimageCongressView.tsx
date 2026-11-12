"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Compass,
  Headphones,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  BookOpen,
  Award,
  Users,
  Search,
  ArrowRight,
  Globe2,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { type ArchetypeViewProps } from "./IndustrialB2BView";
import { parseShowcase, showcaseAgeDays, showcaseDateLabel, SHOWCASE_STALE_DAYS } from "@/lib/showcase";

export function FaithPilgrimageCongressView({ event, locale = "en", onSelectTier, pageSize = "LARGE" }: ArchetypeViewProps) {
  const t = useTranslations("archetypeViews.FAITH_PILGRIMAGE_CONGRESS");
  const tEvents = useTranslations("events");

  // Organizer-authored showcase: channels render only with backing data.
  const showcase = React.useMemo(
    () => parseShowcase((event as any)?.showcaseJson),
    [event]
  );

  return (
    <div className="space-y-12">
      {/* 1. Category Mission Statement */}
      <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-card to-background p-6 sm:p-8 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Compass className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                {t("heroBadge")}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {t("heroTitle")}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("heroDescription")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <div className="text-xs text-muted-foreground text-center lg:text-right">
              {t("accreditationNote")}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Plenary Interpretation Channels (organizer data only; silent when empty or SMALL) */}
      {showcase.channels.length > 0 && pageSize !== "SMALL" && (
      <section className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <Headphones className="h-5 w-5 text-emerald-500" />
            <div>
              <h3 className="text-base font-bold text-foreground">{t("channelsTitle")}</h3>
              <p className="text-xs text-muted-foreground">{t("channelsDescription")}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {showcase.channels.map((item) => (
            <div key={item.code} className="p-3 rounded-lg border border-border/60 bg-muted/30 text-xs space-y-1">
              <span className="font-mono font-bold text-emerald-500 block">{item.code}</span>
              <span className="font-semibold text-foreground block">{item.lang}</span>
              {item.note && (
                <span className="text-muted-foreground text-[11px] block">{item.note}</span>
              )}
            </div>
          ))}
        </div>
        {(() => {
          const dateLabel = showcaseDateLabel(showcase, locale);
          if (!dateLabel) return null;
          const stale = (showcaseAgeDays(showcase) || 0) > SHOWCASE_STALE_DAYS;
          return (
            <p className="text-[11px] text-muted-foreground mt-3">
              {tEvents("showcaseUpdated", { date: dateLabel })}
              {stale && ` · ${tEvents("showcaseStale")}`}
            </p>
          );
        })()}
      </section>
      )}


    </div>
  );
}
