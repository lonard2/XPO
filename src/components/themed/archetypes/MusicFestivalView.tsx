"use client";

import * as React from "react";
import {
  Music2,
  Radio,
  Volume2,
  Users,
  CreditCard,
  CheckCircle2,
  Clock,
  MapPin,
  Ticket,
  Sparkles,
  Layers,
  Flame,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import type { ArchetypeViewProps } from "./IndustrialB2BView";

export function MusicFestivalView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [selectedStage, setSelectedStage] = React.useState("ALL");

  // Stages crowd density
  const stageDensity = [
    { stage: "Neon Main Stage", capacity: "85%", status: "High Energy", color: "bg-rose-500" },
    { stage: "Electro Dome A", capacity: "60%", status: "Moderate Crowd", color: "bg-amber-500" },
    { stage: "Acoustic Forest Grove", capacity: "35%", status: "Comfortable Flow", color: "bg-emerald-500" },
  ];

  // Extract stages
  const stages = [
    "ALL",
    ...Array.from(new Set(event.agendaItems.map((a) => a.location).filter(Boolean))),
  ];

  const filteredActs = event.agendaItems.filter(
    (a) => selectedStage === "ALL" || a.location === selectedStage
  );

  return (
    <div className="space-y-12">
      {/* 1. Live Entertainment Hero Strip */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-wider">
            <Music2 className="h-4 w-4" aria-hidden="true" />
            <span>Multi-Stage Live Festival & Visual Production</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Immersive Audio-Visual Stages & Headliner Lineups
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {event.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="archetype"
              onClick={() => {
                const el = document.getElementById("festival-timetable");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs font-semibold shadow-md"
            >
              <Clock className="h-4 w-4" />
              View Stage Timetable
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const el = document.getElementById("wristband-guide");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs"
            >
              <CreditCard className="h-4 w-4 text-[var(--archetype-accent)]" />
              RFID Wristband & Cashless Guide
            </Button>
          </div>
        </div>

        {/* Real-time Crowd Density Card */}
        <Card className="border-border bg-card shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="archetype" size="sm" className="gap-1">
                <Radio className="h-3.5 w-3.5 text-rose-400" />
                Live Sensor Telemetry
              </Badge>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-base">Stage Crowd Density</CardTitle>
            <CardDescription className="text-xs">
              Live foot-traffic monitoring across outdoor zones and indoor halls.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {stageDensity.map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">{s.stage}</span>
                  <span className="text-muted-foreground font-mono">{s.capacity}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${s.color} transition-all duration-500`}
                    style={{ width: s.capacity }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* 2. RFID Wristband & Cashless Top-up Instructions */}
      <section id="wristband-guide" className="p-6 rounded-xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[var(--archetype-accent)]" />
          <h3 className="text-lg font-bold text-foreground">RFID Wristband & Cashless Ecosystem</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-1.5">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              1. Wristband Redemption
            </h4>
            <p>Exchange your digital pass QR code at Gates 1-4 for your official waterproof NFC fabric wristband.</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-1.5">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              2. Cashless Food & Drinks
            </h4>
            <p>Tap your wristband at all festival beverage bars and food truck villages for instant 100% cashless payment.</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-1.5">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              3. Automatic Refund
            </h4>
            <p>Unused balances are automatically credited back to your original payment method within 48 hours post-festival.</p>
          </div>
        </div>
      </section>

      {/* 3. Live Stage Timetable & Lineup */}
      <section id="festival-timetable" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-rose-500" />
              Stage Timetable & Setlist Breakdown
            </h3>
            <p className="text-xs text-muted-foreground">
              Filter artist performance slots by stage and pavilion.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {stages.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStage(st)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  selectedStage === st
                    ? "bg-[var(--archetype-primary)] text-white font-semibold"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredActs.map((act) => (
            <Card key={act.id} className="border-border hover:border-rose-500/50 transition-colors">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="archetype" size="sm">
                      {act.location}
                    </Badge>
                    {act.track && (
                      <Badge variant="outline" size="sm" className="text-xs font-semibold">
                        {act.track}
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-foreground">{act.title}</h4>
                  {act.speakerName && (
                    <p className="text-xs text-muted-foreground">
                      Featured Artist: <span className="font-semibold text-foreground">{act.speakerName}</span>
                    </p>
                  )}
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 rounded bg-muted font-mono text-xs font-semibold text-foreground">
                    {new Date(act.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                    {new Date(act.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Ticket Tiers & Festival Pass Selection */}
      <section id="tickets-section" className="space-y-6 pt-4 border-t border-border">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-5 w-5 text-[var(--archetype-primary)]" />
            Festival Passes & VIP Skydeck Badges
          </h3>
          <p className="text-xs text-muted-foreground">
            VIP passes include fast-track festival gate entry, elevated Skydeck viewing platforms, and private air-conditioned restrooms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {event.ticketTiers.map((tier) => {
            let benefits: string[] = [];
            try {
              benefits = JSON.parse(tier.benefitsJson);
            } catch {
              benefits = ["All-stage entry", "RFID cashless wristband", "Free festival water refill"];
            }

            return (
              <Card key={tier.id} className="flex flex-col border-border/80 hover:border-rose-500 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <Badge variant="secondary" size="sm">
                      {tier.capacity - tier.soldCount} Left
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-foreground">
                      {tier.price > 0
                        ? formatCurrency(tier.price, (tier.currency as SupportedCurrency) || "IDR", locale)
                        : "Complimentary"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 mt-auto">
                    <Button
                      variant="archetype"
                      className="w-full gap-2 font-semibold"
                      onClick={() => onSelectTier?.(tier.id)}
                    >
                      <Ticket className="h-4 w-4" />
                      Grab Wristband Pass
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
