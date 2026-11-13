"use client";

import { useTranslations } from "next-intl";
import {
  Palmtree,
  Compass,
  Car,
  HeartHandshake,
  CheckCircle2,
  MapPin,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import type { ArchetypeViewProps } from "./IndustrialB2BView";

export function IncentiveRetreatView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const t = useTranslations("archetypeViews.INCENTIVE_RETREAT");

  // Itinerary derived from the event's published agenda items
  const excursions = event.agendaItems.map((agenda) => {
    const start = new Date(agenda.startTime);
    const end = new Date(agenda.endTime);
    const speaker = [agenda.speakerName, agenda.speakerRole].filter(Boolean).join(", ");
    return {
      id: agenda.id,
      title: agenda.title,
      location: agenda.location,
      day: start.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" }),
      duration: `${start.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`,
      perks: [agenda.track, speaker].filter(Boolean).join(" - ") || "",
    };
  });

  return (
    <div className="space-y-12">
      {/* 1. Luxury Corporate Incentive Hero Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Palmtree className="h-4 w-4" aria-hidden="true" />
            <span>{t("heroBadge")}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            {t("heroTitle")}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {event.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {excursions.length > 0 && (
              <Button
                variant="archetype"
                onClick={() => {
                  const el = document.getElementById("excursions-itinerary");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="gap-2 text-xs font-semibold shadow-md"
              >
                <Compass className="h-4 w-4" />
                {excursions.length === 1
                  ? t("itineraryCtaOne")
                  : t("itineraryCta", { count: excursions.length })}
              </Button>
            )}
          </div>
        </div>

        {/* Chauffeur & Concierge Hospitality Card */}
        <Card className="border-border bg-card shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" size="sm" className="gap-1 text-emerald-400 border-emerald-400/30">
                <Car className="h-3.5 w-3.5" />
                {t("chauffeurBadge")}
              </Badge>
              <HeartHandshake className="h-4 w-4 text-emerald-400" />
            </div>
            <CardTitle className="text-base">{t("transfersTitle")}</CardTitle>
            <CardDescription className="text-xs">
              {t("transfersDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{t("escortNote")}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{t("wifiNote")}</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 2. Curated Excursion Itinerary */}
      {excursions.length > 0 && (
        <section id="excursions-itinerary" className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-400" />
              {t("itineraryTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("itineraryDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {excursions.map((item) => (
              <Card key={item.id} className="border-border hover:border-emerald-500/50 transition-all flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <Badge variant="archetype" size="sm">
                      {item.day}
                    </Badge>
                    <span className="font-mono text-muted-foreground text-xs font-medium">{item.duration}</span>
                  </div>
                  <CardTitle className="text-base font-bold">{item.title}</CardTitle>
                  <CardDescription className="text-xs flex items-center gap-1 mt-1 text-muted-foreground">
                    <MapPin className="h-3 w-3 text-emerald-400" />
                    {item.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {item.perks && (
                    <div className="p-2.5 rounded bg-muted/40 text-muted-foreground text-xs">
                      <span className="font-semibold text-emerald-400">{t("includedPerk")}</span> {item.perks}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 3. Ticket Tiers & Villa Suite Packages */}
      <section id="tickets-section" className="space-y-6 pt-4 border-t border-border">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-5 w-5 text-[var(--archetype-primary)]" />
            {t("packagesTitle")}
          </h3>
          <p className="text-xs text-muted-foreground">
{t("packagesDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {event.ticketTiers.map((tier) => {
            let benefits: string[] = [];
            try {
              benefits = JSON.parse(tier.benefitsJson);
            } catch {
              benefits = [];
            }

            return (
              <Card key={tier.id} className="flex flex-col border-border/80 hover:border-emerald-500 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <Badge variant="success" size="sm">
                      {tier.capacity - tier.soldCount === 1
                        ? t("suitesRemainingOne")
                        : t("suitesRemaining", { count: tier.capacity - tier.soldCount })}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-foreground">
                      {tier.price > 0
                        ? formatCurrency(tier.price, (tier.currency as SupportedCurrency) || "IDR", locale)
                        : t("corporateInvitation")}
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
                      {t("reserveCta")}
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
