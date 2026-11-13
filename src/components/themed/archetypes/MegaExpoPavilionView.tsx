"use client";

import { useTranslations } from "next-intl";
import {
  Store,
  CheckCircle2,
  Ticket,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import type { ArchetypeViewProps } from "./IndustrialB2BView";

type ExpoBooth = ArchetypeViewProps["event"]["booths"][number];

/**
 * Groups the event's registered exhibitors by hall so the pavilion directory
 * reflects the real floor plan instead of a fixed list.
 */
function groupPavilionsByHall(booths: ExpoBooth[]) {
  const halls = new Map<
    string,
    { id: string; name: string; tenantsCount: number; industries: Set<string> }
  >();

  for (const booth of booths) {
    const hallName = booth.hallName.trim();
    if (!hallName) continue;

    const hall = halls.get(hallName) ?? {
      id: hallName,
      name: hallName,
      tenantsCount: 0,
      industries: new Set<string>(),
    };

    hall.tenantsCount += 1;
    if (booth.industry) hall.industries.add(booth.industry);
    halls.set(hallName, hall);
  }

  return Array.from(halls.values()).map((hall) => ({
    id: hall.id,
    name: hall.name,
    tenantsCount: hall.tenantsCount,
    theme: Array.from(hall.industries).join(", "),
  }));
}

export function MegaExpoPavilionView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const t = useTranslations("archetypeViews.MEGA_EXPO_PAVILION");

  // Pavilions directory derived from the halls that actually host registered exhibitors
  const pavilions = groupPavilionsByHall(event.booths);

  return (
    <div className="space-y-12">
      {/* 1. Mega Fair & Pavilion Hero Strip */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-wider">
          <Store className="h-4 w-4" aria-hidden="true" />
          <span>{t("heroBadge")}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
          {t("heroTitle")}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {event.description}
        </p>

        {pavilions.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="archetype"
              onClick={() => {
                const el = document.getElementById("pavilions-guide");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs font-semibold shadow-md"
            >
              <Store className="h-4 w-4" />
              {t("exploreCta")}
            </Button>
          </div>
        )}
      </section>

      {/* 2. Multi-Pavilion Guide */}
      {pavilions.length > 0 && (
        <section id="pavilions-guide" className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-orange-500" />
              {t("directoryTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("directoryDescription")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pavilions.map((pavilion) => (
              <Card key={pavilion.id} className="border-border hover:border-orange-500 transition-all flex flex-col justify-between">
                <CardHeader className="p-4 pb-2">
                  <Badge variant="archetype" size="sm" className="w-fit mb-2 font-mono">
                    {pavilion.tenantsCount === 1
                      ? t("brandsCountOne")
                      : t("brandsCount", { count: pavilion.tenantsCount })}
                  </Badge>
                  <CardTitle className="text-sm font-bold">{pavilion.name}</CardTitle>
                  {pavilion.theme && (
                    <CardDescription className="text-xs text-muted-foreground mt-1">
                      {pavilion.theme}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="pt-2 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground">
                    <span>{t("airConditioned")}</span>
                    <span className="text-orange-500 font-semibold cursor-pointer hover:underline">
                      {t("viewBoothMap")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 3. Ticket Tiers & Mega Fair Pass Selection */}
      <section id="tickets-section" className="space-y-6 pt-4 border-t border-border">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-5 w-5 text-[var(--archetype-primary)]" />
            {t("ticketsTitle")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("ticketsDescription")}
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
              <Card key={tier.id} className="flex flex-col border-border/80 hover:border-orange-500 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <Badge variant="secondary" size="sm">
                      {tier.capacity - tier.soldCount === 1
                        ? t("availableCountOne")
                        : t("availableCount", { count: tier.capacity - tier.soldCount })}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-foreground">
                      {tier.price > 0
                        ? formatCurrency(tier.price, (tier.currency as SupportedCurrency) || "IDR", locale)
                        : t("freeEntry")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
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
                      {t("cta")}
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
