"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Code2,
  Terminal,
  AtSign,
  ExternalLink,
  CheckCircle2,
  MapPin,
  Trophy,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import { parseShowcase } from "@/lib/showcase";
import { ShowcaseProgramGrid } from "@/components/themed/ShowcaseProgramGrid";
import type { ArchetypeViewProps } from "./IndustrialB2BView";

export function TechDevSummitView({ event, locale = "en", onSelectTier, pageSize = "LARGE" }: ArchetypeViewProps) {
  const t = useTranslations("archetypeViews.TECH_DEV_SUMMIT");
  const [activeTrack, setActiveTrack] = React.useState("ALL");
  const [hackathonRsvp, setHackathonRsvp] = React.useState(false);

  // Extract all tracks
  const tracks = [
    "ALL",
    ...Array.from(new Set(event.agendaItems.map((a) => a.track || t("generalEngineering")).filter(Boolean))),
  ];

  const filteredAgendas = event.agendaItems.filter(
    (item) =>
      activeTrack === "ALL" ||
      (item.track || t("generalEngineering")) === activeTrack
  );

  // Organizer-authored showcase: sections render only with backing data.
  const showcase = React.useMemo(
    () => parseShowcase((event as any)?.showcaseJson),
    [event]
  );
  const bountyPrograms = showcase.programs.filter(
    (p) => p.kind === "bounty" || p.kind === "generic"
  );

  return (
    <div className="space-y-12">
      {/* 1. Terminal / Keynote Hero Header */}
      <section className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--archetype-accent)] uppercase tracking-wider">
            <Terminal className="h-4 w-4" aria-hidden="true" />
            <span>{t("heroBadge")}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground font-sans">
            {t("heroTitle")}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-sans">
            {event.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                const el = document.getElementById("hackathon-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs font-sans"
            >
              <Trophy className="h-4 w-4 text-amber-400" />
              {t("hackathonCta")}
            </Button>
          </div>
        </div>
      </section>

      {/* Livestream card: only when the organizer published a stream URL, never on SMALL. */}
      {showcase.livestreamUrl && pageSize !== "SMALL" && (
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-3 w-3 shrink-0">
              {showcase.livestreamLive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${showcase.livestreamLive ? "bg-red-500" : "bg-muted-foreground"}`} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">
                {showcase.livestreamLive ? t("liveStreamActive") : t("eventLivestream")}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {showcase.livestreamUrl.replace(/^https?:\/\//, "").split("/")[0]}
              </p>
            </div>
          </div>
          <a
            href={showcase.livestreamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:ml-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 min-h-[44px] cursor-pointer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t("openStream")}
          </a>
        </section>
      )}

      {/* 2. Multi-Track Engineering Agenda Schedule */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-sans">
              <Code2 className="h-5 w-5 text-[var(--archetype-primary)]" />
              {t("scheduleTitle")}
            </h3>
            <p className="text-xs font-semibold text-muted-foreground font-sans">
              {t("scheduleDescription")}
            </p>
          </div>

          {/* Track Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {tracks.map((track) => (
              <button
                key={track}
                onClick={() => setActiveTrack(track)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTrack === track
                    ? "bg-[var(--archetype-primary)] text-white font-semibold"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {track === "ALL" ? t("filterAll") : track}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredAgendas.map((agenda) => (
            <Card key={agenda.id} className="border-border/80 hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="archetype" size="sm" className="font-mono text-xs font-semibold">
                      {agenda.track || t("generalEngineering")}
                    </Badge>
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {agenda.location}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-foreground font-sans">{agenda.title}</h4>
                  {agenda.speakerName && (
                    <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                      <span className="font-medium text-foreground">{agenda.speakerName}</span>
                      {agenda.speakerRole && <span className="text-muted-foreground">({agenda.speakerRole})</span>}
                      <div className="flex items-center gap-2 ml-2">
                        <Code2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
                        <AtSign className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 rounded bg-muted text-xs font-semibold font-mono text-foreground">
                    {new Date(agenda.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                    {new Date(agenda.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. 48-Hour Hackathon & Bounty Track */}
      <section id="hackathon-section" className="p-6 rounded-xl bg-card border border-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="warning" size="sm" className="gap-1 font-semibold text-xs font-semibold">
              <Trophy className="h-3 w-3" />
              {t("hackathonBadge")}
            </Badge>
            <h3 className="text-2xl font-bold text-foreground font-sans">
              {t("hackathonTitle")}
            </h3>
            <p className="text-xs font-semibold sm:text-sm text-muted-foreground font-sans max-w-2xl">
{t("hackathonDescription")}
            </p>
          </div>
          <div className="shrink-0">
            {hackathonRsvp ? (
              <Badge variant="success" size="lg" className="gap-1.5 py-2 px-3 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                {t("rsvpConfirmed")}
              </Badge>
            ) : (
              <Button
                variant="archetype"
                onClick={() => setHackathonRsvp(true)}
                className="gap-2 font-semibold font-sans"
              >
                <Terminal className="h-4 w-4" />
                {t("rsvpCta")}
              </Button>
            )}
          </div>
        </div>

        {bountyPrograms.length > 0 && (
          <ShowcaseProgramGrid
            eyebrow={t("bountiesEyebrow")}
            title={t("bountiesTitle")}
            description={t("bountiesDescription")}
            programs={bountyPrograms}
            locale={locale}
            stampedAt={showcase.attestedAt}
          />
        )}
      </section>

      {/* 4. Ticket Tiers & Developer Access Passes */}
      <section id="tickets-section" className="space-y-6 pt-4 border-t border-border">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-sans">
            <Ticket className="h-5 w-5 text-[var(--archetype-primary)]" />
            {t("ticketsTitle")}
          </h3>
          <p className="text-xs text-muted-foreground font-sans">
            {t("ticketsDescription")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {event.ticketTiers.map((tier) => {
            let benefits: string[] = [];
            try {
              benefits = JSON.parse(tier.benefitsJson);
            } catch {
              benefits = ["All keynote tracks access", "Hackathon team desk", "Workshop slide deck repo"];
            }

            return (
              <Card key={tier.id} className="flex flex-col border-border/80 hover:border-primary transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-sans">{tier.name}</CardTitle>
                    <Badge variant="secondary" size="sm">
                      {tier.capacity - tier.soldCount === 1
                        ? t("availableCountOne")
                        : t("availableCount", { count: tier.capacity - tier.soldCount })}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-foreground font-sans">
                      {tier.price > 0
                        ? formatCurrency(tier.price, (tier.currency as SupportedCurrency) || "IDR", locale)
                        : t("freeTicket")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <ul className="space-y-2 text-xs text-muted-foreground font-sans">
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
                      className="w-full gap-2 font-semibold font-sans"
                      onClick={() => onSelectTier?.(tier.id)}
                    >
                      <Ticket className="h-4 w-4" />
                      {t("selectPass")}
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
