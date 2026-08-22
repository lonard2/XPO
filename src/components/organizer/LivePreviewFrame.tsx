"use client";

import * as React from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  Calendar,
  Building2,
  Ticket,
  Sparkles,
  ExternalLink,
  Users,
  CheckCircle2,
  ArrowRight,
  Coffee,
  Download,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MiceArchetype, getArchetypeTokens, BrandingConfig } from "@/lib/theming";
import { cn } from "@/lib/utils";

export type ViewportMode = "desktop" | "tablet" | "mobile";

interface LivePreviewFrameProps {
  eventTitle: string;
  tagline?: string;
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
    name: string;
    price: number;
    currency: string;
    capacity: number;
  }>;
}

export function LivePreviewFrame({
  eventTitle,
  tagline,
  archetype,
  venueName = "JIExpo Kemayoran",
  hallName = "Hall A1 (Main Exhibition)",
  datesText = "Apr 14 - Apr 17, 2027",
  heroImageUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
  primaryColor,
  accentColor,
  fontFamily = "font-sans",
  heroBadge,
  bannerOverlayOpacity = 0.75,
  sectionsVisibility = {
    agenda: true,
    booths: true,
    tickets: true,
    perks: true,
  },
  ticketTiers = [
    { name: "Standard Trade Visitor", price: 0, currency: "IDR", capacity: 3500 },
    { name: "VIP Buyer Delegate", price: 750000, currency: "IDR", capacity: 400 },
  ],
}: LivePreviewFrameProps) {
  const [viewport, setViewport] = React.useState<ViewportMode>("desktop");

  const tokens = getArchetypeTokens(archetype, {
    primaryColor,
    accentColor,
    fontFamilyOverride: fontFamily,
  });

  const getViewportWidthClass = () => {
    switch (viewport) {
      case "mobile":
        return "max-w-[380px]";
      case "tablet":
        return "max-w-[768px]";
      case "desktop":
      default:
        return "w-full max-w-full";
    }
  };

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case "font-serif":
        return "font-serif";
      case "font-mono":
        return "font-mono";
      case "font-legible":
        return "font-sans tracking-wide";
      case "font-sans":
      default:
        return "font-sans";
    }
  };

  return (
    <div className="space-y-3 w-full">
      {/* Viewport Switcher Toolbar */}
      <div className="flex items-center justify-between bg-card p-2 px-3 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Live Preview
          </span>
          <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-foreground font-mono">
            {viewport === "desktop" ? "Desktop (100%)" : viewport === "tablet" ? "Tablet (768px)" : "Mobile (375px)"}
          </span>
        </div>

        {/* Viewport Mode Buttons */}
        <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/60 gap-1">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={cn(
              "p-1.5 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer",
              viewport === "desktop"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Desktop viewport"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[11px]">Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => setViewport("tablet")}
            className={cn(
              "p-1.5 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer",
              viewport === "tablet"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Tablet viewport"
          >
            <Tablet className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[11px]">Tablet</span>
          </button>

          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={cn(
              "p-1.5 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer",
              viewport === "mobile"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Mobile viewport"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[11px]">Mobile</span>
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
          style={{
            // @ts-ignore
            "--archetype-primary": primaryColor,
            "--archetype-accent": accentColor,
          }}
        >
          {/* Simulated Browser Address Bar */}
          <div className="bg-muted/80 border-b border-border px-3 py-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-red-400/80" />
              <div className="h-2 w-2 rounded-full bg-amber-400/80" />
              <div className="h-2 w-2 rounded-full bg-emerald-400/80" />
            </div>
            <div className="flex-1 bg-background/80 px-2.5 py-0.5 rounded text-foreground font-mono text-center truncate border border-border/50">
              https://xpo.io/events/preview-live
            </div>
          </div>

          {/* SIMULATED EVENT PAGE CONTENT */}
          <div className="space-y-6 pb-8 overflow-y-auto max-h-[750px]">
            {/* HERO BANNER SECTION */}
            <div className="relative min-h-[280px] sm:min-h-[320px] flex items-end p-5 sm:p-8 overflow-hidden">
              {/* Hero Image Background */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-all"
                style={{
                  backgroundImage: `url(${heroImageUrl})`,
                }}
              />

              {/* Dynamic Gradient Overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity"
                style={{ opacity: bannerOverlayOpacity }}
              />

              {/* Banner Content */}
              <div className="relative z-10 space-y-3 max-w-2xl text-white">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {heroBadge || tokens.displayName}
                  </span>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-white/30 text-white/90"
                  >
                    Verified MICE Exhibition
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                  {eventTitle}
                </h1>

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
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm flex items-center gap-1.5 transition-transform hover:scale-102"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Ticket className="h-3.5 w-3.5" />
                  <span>Reserve Delegate Pass</span>
                </button>

                <button
                  type="button"
                  className="px-3 py-2 rounded-lg text-xs font-medium border border-border bg-card hover:bg-accent transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" style={{ color: accentColor }} />
                  <span>Interactive Floor Plan</span>
                </button>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>3,900+ registered delegates</span>
              </div>
            </div>

            {/* SECTION 1: TICKET TIERS */}
            {sectionsVisibility.tickets && (
              <div className="px-5 sm:px-8 space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Ticket className="h-4 w-4" style={{ color: primaryColor }} />
                  <span>Delegate & Buyer Pass Tiers</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ticketTiers.map((tier, idx) => (
                    <div
                      key={tier.name}
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
                            {tier.price === 0 ? "Complimentary" : `${tier.currency} ${tier.price.toLocaleString()}`}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          Cap: {tier.capacity}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                        Instant HMAC QR Pass & Guidebook Access
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: KEYNOTE TIMETABLE */}
            {sectionsVisibility.agenda && (
              <div className="px-5 sm:px-8 space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" style={{ color: primaryColor }} />
                  <span>Featured Keynote Tracks & Timetable</span>
                </h3>

                <div className="space-y-2">
                  {[
                    {
                      time: "09:30 - 10:45",
                      title: "Opening Plenary: Global Battery Tech & Green Grid Standards",
                      speaker: "Dr. Kenji Takahashi (Renewable Energy Institute)",
                      stage: "Plenary Stage - Hall A1",
                    },
                    {
                      time: "11:15 - 12:30",
                      title: "Cross-Border Procurement & Industrial Machinery Logistics",
                      speaker: "Sarah Jenkins (Global Supply Chain Council)",
                      stage: "Procurement Theatre 2",
                    },
                  ].map((session) => (
                    <div key={session.title} className="p-3 bg-muted/40 rounded-lg border border-border/80 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-primary">{session.time}</span>
                        <span className="text-muted-foreground">{session.stage}</span>
                      </div>
                      <div className="font-bold text-foreground">{session.title}</div>
                      <div className="text-[11px] text-muted-foreground">{session.speaker}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: EXHIBITOR BOOTHS */}
            {sectionsVisibility.booths && (
              <div className="px-5 sm:px-8 space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4" style={{ color: primaryColor }} />
                  <span>Featured Exhibitors & Floor Booths</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { name: "Pacific Lithium Corp", booth: "Hall A1 - B04" },
                    { name: "Nusantara Grid Robotics", booth: "Hall A1 - B08" },
                    { name: "Tokyo Automation Labs", booth: "Hall A2 - C12" },
                  ].map((ex) => (
                    <div key={ex.name} className="p-2.5 bg-card border border-border rounded-lg text-xs">
                      <div className="font-semibold text-foreground truncate">{ex.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{ex.booth}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4: ATTENDEE PERKS */}
            {sectionsVisibility.perks && (
              <div className="px-5 sm:px-8 space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
                  <span>Attendee Perks & Exclusive Guidebook Treats</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-xs flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-foreground">VIP Lounge & Artisan Barista</div>
                      <div className="text-[10px] text-muted-foreground">Unlocked with VIP Buyer pass</div>
                    </div>
                  </div>
                  <div className="p-2.5 bg-primary/5 border border-primary/20 rounded-lg text-xs flex items-center gap-2">
                    <Download className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <div className="font-semibold text-foreground">Speaker Slide Decks & Whitepapers</div>
                      <div className="text-[10px] text-muted-foreground">Digital pass cloud unlock</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
