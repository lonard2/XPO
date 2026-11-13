"use client";

import { useTranslations } from "next-intl";
import {
  Shield,
  Lock,
  CheckCircle2,
  Clock,
  MapPin,
  Ticket,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import type { ArchetypeViewProps } from "./IndustrialB2BView";

export function GovernmentDiplomaticView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const t = useTranslations("archetypeViews.GOVERNMENT_DIPLOMATIC");

  return (
    <div className="space-y-12 font-serif">
      {/* 1. Diplomatic Summit Hero Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-xs font-sans font-bold text-sky-400 uppercase tracking-wider">
            <Landmark className="h-4 w-4" aria-hidden="true" />
            <span>{t("heroBadge")}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            {t("heroTitle")}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed font-sans">
            {event.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 font-sans">
            <Button
              variant="outline"
              onClick={() => {
                const el = document.getElementById("protocol-briefing");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs"
            >
              <Shield className="h-4 w-4 text-sky-400" />
              {t("protocolCta")}
            </Button>
          </div>
        </div>

        {/* Security Clearance & Protocol Card */}
        <Card id="protocol-briefing" className="border-border bg-card shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" size="sm" className="font-sans text-xs font-semibold text-sky-400 border-sky-400/30">
                {t("protocolBadge")}
              </Badge>
              <Lock className="h-4 w-4 text-sky-400" />
            </div>
            <CardTitle className="text-base font-sans">{t("securityTitle")}</CardTitle>
            <CardDescription className="text-xs font-sans">
              {t("securityDesc")}
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* 2. Ministerial Assembly Schedule */}
      {event.agendaItems.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-sans">
            <Clock className="h-5 w-5 text-[var(--archetype-primary)]" />
            {t("assemblyTitle")}
          </h3>
          <div className="space-y-3 font-sans">
            {event.agendaItems.map((agenda) => (
              <div
                key={agenda.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-card border border-border gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" size="sm">
                      {agenda.track || t("defaultTrack")}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {agenda.location}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-foreground">{agenda.title}</h4>
                  {agenda.speakerName && (
                    <p className="text-xs text-muted-foreground">
                      {t("chairLabel")} <span className="font-semibold text-foreground">{agenda.speakerName}</span>
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

      {/* 4. Ticket Tiers & Delegation Credentials Pass Selection */}
      <section id="tickets-section" className="space-y-6 pt-4 border-t border-border">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-sans">
            <Ticket className="h-5 w-5 text-[var(--archetype-primary)]" />
            {t("credentialsTitle")}
          </h3>
          <p className="text-xs font-sans text-muted-foreground">
            {t("credentialsDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          {event.ticketTiers.map((tier) => {
            let benefits: string[] = [];
            try {
              benefits = JSON.parse(tier.benefitsJson);
            } catch {
              benefits = [];
            }

            return (
              <Card key={tier.id} className="flex flex-col border-border/80 hover:border-sky-500 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <Badge variant="secondary" size="sm">
                      {tier.capacity - tier.soldCount === 1
                        ? t("credentialsLeftOne")
                        : t("credentialsLeft", { count: tier.capacity - tier.soldCount })}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-foreground">
                      {tier.price > 0
                        ? formatCurrency(tier.price, (tier.currency as SupportedCurrency) || "IDR", locale)
                        : t("officialDelegationPass")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
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
                      {t("selectTierCta")}
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
