"use client";

import * as React from "react";
import {
  Gamepad2,
  Sparkles,
  ShieldAlert,
  Camera,
  ShoppingBag,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  Ticket,
  Star,
  Swords,
  Heart,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import type { ArchetypeViewProps } from "./IndustrialB2BView";
import { parseShowcase } from "@/lib/showcase";
import { ShowcaseProgramGrid } from "@/components/themed/ShowcaseProgramGrid";

export function PopCultureGamingView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {

  // Organizer-authored showcase: sections render only with backing data.
  const showcase = React.useMemo(
    () => parseShowcase((event as any)?.showcaseJson),
    [event]
  );
  const showcasePrograms = showcase.programs.filter(
    (p) => p.kind === "lineup" || p.kind === "generic"
  );

  return (
    <div className="space-y-12">
      {/* 1. Pop Culture & Gaming Hero Strip */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-fuchsia-400 uppercase tracking-wider">
            <Gamepad2 className="h-4 w-4" aria-hidden="true" />
            <span>Gaming Championship, Cosplay Arena & Creator Alley</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Esports Arena, Celebrity Meet & Greets & Merch Drops
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {event.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            

            <Button
              variant="outline"
              onClick={() => {
                const el = document.getElementById("cosplay-rules");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs"
            >
              <ShieldAlert className="h-4 w-4 text-pink-400" />
              Cosplay Prop Safety Rules
            </Button>
          </div>
        </div>

        {/* Cosplay Safety Guidelines Card */}
        <Card id="cosplay-rules" className="border-border bg-card shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="warning" size="sm" className="gap-1">
                <ShieldAlert className="h-3.5 w-3.5" />
                Prop Check Desk
              </Badge>
              <Swords className="h-4 w-4 text-purple-400" />
            </div>
            <CardTitle className="text-base">Cosplay Security Guidelines</CardTitle>
            <CardDescription className="text-xs">
              All weapon props must pass safety inspection at Hall A Entrance Inspection Desk.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Foam, EVA, plastic, and lightweight 3D prints permitted.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Zero metal blades, live steel, airsoft, or explosive effects.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Dedicated cosplay repair lounge & changing rooms at Hall C.</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 4. Stage Agendas & Esports Tournaments */}
      {event.agendaItems.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--archetype-primary)]" />
            Main Stage & Esports Tournament Schedule
          </h3>
          <div className="space-y-3">
            {event.agendaItems.map((agenda) => (
              <div
                key={agenda.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-card border border-border gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning" size="sm">
                      {agenda.track || "Esports Stage"}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {agenda.location}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-foreground">{agenda.title}</h4>
                  {agenda.speakerName && (
                    <p className="text-xs text-muted-foreground">
                      Host/Caster: <span className="font-semibold text-foreground">{agenda.speakerName}</span>
                    </p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground sm:text-right shrink-0">
                  <p className="font-mono font-medium text-foreground">
                    {new Date(agenda.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                    {new Date(agenda.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Ticket Tiers & Cosplay Passes */}
      {showcasePrograms.length > 0 && (
        <ShowcaseProgramGrid
          eyebrow="Guest Lineup"
          title="Creators, Guests & Lineup"
          description="Appearances published by the organizer."
          programs={showcasePrograms}
          locale={locale}
          stampedAt={showcase.attestedAt}
        />
      )}

      <section id="tickets-section" className="space-y-6 pt-4 border-t border-border">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-5 w-5 text-[var(--archetype-primary)]" />
            Convention Badges & VIP Express Passes
          </h3>
          <p className="text-xs text-muted-foreground">
            VIP passes include 30-minute early exhibition floor entry, fast-lane merch queues, and reserved main stage
            seating.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {event.ticketTiers.map((tier) => {
            let benefits: string[] = [];
            try {
              benefits = JSON.parse(tier.benefitsJson);
            } catch {
              benefits = ["Full convention floor access", "Cosplay locker access", "Collectible lanyard"];
            }

            return (
              <Card key={tier.id} className="flex flex-col border-border/80 hover:border-purple-500 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <Badge variant="secondary" size="sm">
                      {tier.capacity - tier.soldCount} Badges Left
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-foreground">
                      {tier.price > 0
                        ? formatCurrency(tier.price, (tier.currency as SupportedCurrency) || "IDR", locale)
                        : "Free Ticket"}
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
                      Get Convention Pass
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
