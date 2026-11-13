"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Monitor,
  Tablet,
  Smartphone,
  Calendar,
  Building2,
  Ticket,
  Sparkles,
  Users,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MiceArchetype, getArchetypeTokens } from "@/lib/theming";
import { cn } from "@/lib/utils";

export type ViewportMode = "desktop" | "tablet" | "mobile";

interface LivePreviewFrameProps {
  eventTitle: string;
  tagline?: string;
  eventSlug?: string;
  archetype: MiceArchetype | string;
  venueName?: string;
  hallName?: string;
  datesText?: string;
  heroImageUrl?: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  heroBadge?: string;
  bannerOverlayOpacity?: number;
  sectionsVisibility?: {
    agenda: boolean;
    booths: boolean;
    tickets: boolean;
    perks: boolean;
  };
  ticketTiers?: Array<{
    id?: string;
    name: string;
    price: number;
    currency: string;
    capacity: number;
  }>;
  agendaItems?: Array<{
    id?: string;
    title: string;
    location?: string;
    startTime?: string | Date;
    endTime?: string | Date;
    track?: string | null;
    speakerName?: string | null;
  }>;
  booths?: Array<{
    id?: string;
    companyName: string;
    boothNumber: string;
    hallName?: string;
  }>;
  perks?: Array<{
    id?: string;
    title: string;
    description: string;
  }>;
}

export function LivePreviewFrame({
  eventTitle,
  tagline,
  eventSlug,
  archetype,
  venueName = "",
  hallName = "",
  datesText = "",
  heroImageUrl = "",
  primaryColor,
  accentColor,
  fontFamily,
  heroBadge,
  bannerOverlayOpacity = 0.8,
  sectionsVisibility = {
    agenda: true,
    booths: true,
    tickets: true,
    perks: true,
  },
  ticketTiers = [],
  agendaItems = [],
  booths = [],
  perks = [],
}: LivePreviewFrameProps) {
  const t = useTranslations("organizer");
  const locale = useLocale();
  const [viewport, setViewport] = React.useState<ViewportMode>("desktop");
  const [heroFailed, setHeroFailed] = React.useState(false);
  React.useEffect(() => {
    setHeroFailed(false);
  }, [heroImageUrl]);
  const tokens = getArchetypeTokens(archetype as MiceArchetype);
  const totalPassCapacity = ticketTiers.reduce((sum, tier) => sum + tier.capacity, 0);
  const formatTime = (value?: string | Date) =>
    value
      ? new Date(value).toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  const getViewportWidthClass = () => {
    switch (viewport) {
      case "mobile":
        return "w-[375px] max-w-[375px]";
      case "tablet":
        return "w-[768px] max-w-[768px]";
      case "desktop":
      default:
        return "w-full max-w-[1024px]";
    }
  };

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case "serif":
      case "font-serif":
        return "font-serif";
      case "mono":
      case "font-mono":
        return "font-mono";
      case "legible":
      case "font-legible":
        return "font-sans tracking-wide";
      case "sans":
      case "font-sans":
      default:
        return "font-sans";
    }
  };

  return (
    <div className="space-y-4 w-full flex flex-col items-center">
      {/* Top Device Switcher Controls */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("previewCanvasTitle")}
          </span>
          <Badge variant="outline" size="sm" className="hidden sm:inline-flex text-xs">
            {t("previewCanvasBadge")}
          </Badge>
        </div>

        {/* Viewport Toggles */}
        <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/60 gap-1">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={cn(
              "min-h-[44px] px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
              viewport === "desktop"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={t("previewDesktopAria")}
          >
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">{t("previewDesktopLabel")}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewport("tablet")}
            className={cn(
              "min-h-[44px] px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
              viewport === "tablet"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={t("previewTabletAria")}
          >
            <Tablet className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">{t("previewTabletLabel")}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={cn(
              "min-h-[44px] px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
              viewport === "mobile"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={t("previewMobileAria")}
          >
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">{t("previewMobileLabel")}</span>
          </button>
        </div>
      </div>

      {/* Simulated Device Frame */}
      <div className="w-full flex justify-center bg-muted/30 p-2 sm:p-4 rounded-2xl border border-border/80 overflow-x-auto min-h-[600px]">
        <div
          className={cn(
            "transition-all duration-300 border border-border shadow-lg rounded-xl overflow-hidden bg-background flex flex-col shrink-0",
            getViewportWidthClass(),
            getFontFamilyClass()
          )}
          style={
            {
              "--archetype-primary": primaryColor,
              "--archetype-accent": accentColor,
            } as React.CSSProperties
          }
        >
          {/* Simulated Browser Address Bar */}
          <div
            aria-hidden="true"
            className="bg-muted/80 border-b border-border px-3 py-1.5 flex items-center gap-2 text-xs text-muted-foreground select-none"
          >
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-red-400/80" />
              <div className="h-2 w-2 rounded-full bg-amber-400/80" />
              <div className="h-2 w-2 rounded-full bg-emerald-400/80" />
            </div>
            <div className="flex-1 bg-background/80 px-2.5 py-0.5 rounded text-foreground font-mono text-center truncate border border-border/50 text-xs">
              https://xpo.io/events/{eventSlug || "preview-live"}
            </div>
          </div>

          {/* SIMULATED EVENT PAGE CONTENT */}
          <div className="space-y-6 pb-8 overflow-y-auto max-h-[750px]">
            {/* HERO BANNER SECTION */}
            <div className="relative min-h-[280px] sm:min-h-[320px] flex items-end p-5 sm:p-8 overflow-hidden">
              {/* Hero Image Background (probe tracks load failure) */}
              <img
                src={heroImageUrl}
                alt=""
                aria-hidden="true"
                data-hero-probe="true"
                className="hidden"
                onError={() => setHeroFailed(true)}
              />
              <div
                className="absolute inset-0 bg-cover bg-center transition-all"
                style={
                  heroFailed
                    ? { background: `linear-gradient(135deg, ${primaryColor}30 0%, ${accentColor}30 100%)` }
                    : { backgroundImage: `url(${heroImageUrl})` }
                }
              />
              {heroFailed && (
                <p className="absolute top-3 left-3 z-20 text-[11px] text-white/80 bg-black/50 px-2 py-1 rounded-md">
                  {t("previewHeroFallback")}
                </p>
              )}

              {/* Dynamic Gradient Overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity"
                style={{ opacity: bannerOverlayOpacity }}
              />

              {/* Banner Content */}
              <div className="relative z-10 space-y-3 max-w-2xl text-white">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {heroBadge || tokens.displayName}
                  </span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full border border-white/30 text-white/90"
                  >
                    {t("previewVerifiedBadge")}
                  </span>
                </div>

                <div role="heading" aria-level={2} className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                  {eventTitle}
                </div>

                {tagline && (
                  <p className="text-xs sm:text-sm text-white/80 line-clamp-2">
                    {tagline}
                  </p>
                )}

                {/* Date & Venue Bar */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-white/90 pt-2 border-t border-white/20">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-amber-400" />
                    <span>{datesText}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-amber-400" />
                    <span>{venueName} {hallName ? `(${hallName})` : ""}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS BAR */}
            <div className="px-5 sm:px-8 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm flex items-center gap-1.5 transition-transform pointer-events-none"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Ticket className="h-3.5 w-3.5" />
                  <span>{t("previewReserveCta")}</span>
                </button>

                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="px-3 py-2 rounded-lg text-xs font-medium border border-border bg-card transition-colors flex items-center gap-1.5 pointer-events-none"
                >
                  <Sparkles className="h-3.5 w-3.5" style={{ color: accentColor }} />
                  <span>{t("previewFloorPlan")}</span>
                </button>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>{t("previewPassCapacity", { count: totalPassCapacity.toLocaleString() })}</span>
              </div>
            </div>

            {/* SECTION 1: TICKET TIERS */}
            {sectionsVisibility.tickets && (
              <div className="px-5 sm:px-8 space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Ticket className="h-4 w-4" style={{ color: primaryColor }} />
                  <span>{t("previewPassTiers")}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ticketTiers.map((tier, idx) => (
                    <div
                      key={tier.id || `${tier.name}-${idx}`}
                      className={cn(
                        "p-4 rounded-xl border transition-all flex flex-col justify-between gap-2",
                        idx === 1
                          ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                          : "border-border bg-card"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-bold text-foreground">{tier.name}</div>
                          <div className="text-sm font-bold mt-1" style={{ color: primaryColor }}>
                            {tier.price === 0 ? t("previewComplimentary") : `${tier.currency} ${tier.price.toLocaleString()}`}
                          </div>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {t("previewCap", { capacity: tier.capacity })}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-border/60 text-xs text-muted-foreground">
                        {t("previewPassFeature")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: KEYNOTE TIMETABLE */}
            {sectionsVisibility.agenda && agendaItems.length > 0 && (
              <div className="px-5 sm:px-8 space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" style={{ color: primaryColor }} />
                  <span>{t("previewKeynoteTracks")}</span>
                </h3>

                <div className="space-y-2">
                  {agendaItems.map((session, idx) => (
                    <div key={session.id || `${session.title}-${idx}`} className="p-3 bg-muted/40 rounded-lg border border-border/80 text-xs space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-primary">
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </span>
                        <span className="text-muted-foreground">{session.location}</span>
                      </div>
                      <div className="font-bold text-foreground">{session.title}</div>
                      <div className="text-xs text-muted-foreground">{session.speakerName || session.track}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: EXHIBITOR BOOTHS */}
            {sectionsVisibility.booths && booths.length > 0 && (
              <div className="px-5 sm:px-8 space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4" style={{ color: primaryColor }} />
                  <span>{t("previewExhibitors")}</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {booths.map((ex, idx) => (
                    <div key={ex.id || `${ex.companyName}-${idx}`} className="p-2.5 bg-card border border-border rounded-lg text-xs">
                      <div className="font-semibold text-foreground truncate">{ex.companyName}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        {[ex.hallName, ex.boothNumber].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4: ATTENDEE PERKS */}
            {sectionsVisibility.perks && perks.length > 0 && (
              <div className="px-5 sm:px-8 space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
                  <span>{t("previewPerks")}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {perks.map((perk, idx) => (
                    <div
                      key={perk.id || `${perk.title}-${idx}`}
                      className="p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-xs flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-foreground">{perk.title}</div>
                        <div className="text-xs text-muted-foreground">{perk.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
