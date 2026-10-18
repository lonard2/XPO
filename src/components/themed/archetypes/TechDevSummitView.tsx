"use client";

import * as React from "react";
import {
  Code2,
  Terminal,
  Github,
  Twitter,
  CheckCircle2,
  MapPin,
  Trophy,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import type { ArchetypeViewProps } from "./IndustrialB2BView";

export function TechDevSummitView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [activeTrack, setActiveTrack] = React.useState("ALL");
  const [hackathonRsvp, setHackathonRsvp] = React.useState(false);

  // Extract all tracks
  const tracks = [
    "ALL",
    ...Array.from(new Set(event.agendaItems.map((a) => a.track || "General Engineering").filter(Boolean))),
  ];

  const filteredAgendas = event.agendaItems.filter(
    (item) => activeTrack === "ALL" || item.track === activeTrack
  );

  // Hackathon program: no prize or sponsor amounts are shown unless the
  // event provides them. Without backing data there is nothing to render.
  const hackathonBounties: Array<{ title: string; reward: string; sponsor: string }> = [];

  return (
    <div className="space-y-12">
      {/* 1. Terminal / Keynote Hero Header */}
      <section className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--archetype-accent)] uppercase tracking-wider">
            <Terminal className="h-4 w-4" aria-hidden="true" />
            <span>Developer Keynotes, Code Labs & Hackathon 2026</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground font-sans">
            Building Next-Generation Distributed Systems & Autonomous AI
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
              Hackathon Program
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Multi-Track Engineering Agenda Schedule */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-sans">
              <Code2 className="h-5 w-5 text-[var(--archetype-primary)]" />
              Multi-Track Schedule & Breakouts
            </h3>
            <p className="text-xs font-semibold text-muted-foreground font-sans">
              Filter keynotes, code walk-throughs, and lightning talks by track.
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
                {track}
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
                      {agenda.track || "General Track"}
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
                        <Github className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
                        <Twitter className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
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
              Global Developer Hackathon
            </Badge>
            <h3 className="text-2xl font-bold text-foreground font-sans">
              48-Hour Autonomous Systems Hackathon
            </h3>
            <p className="text-xs font-semibold sm:text-sm text-muted-foreground font-sans max-w-2xl">
              Build production-ready multi-model agents or high-throughput distributed engines. Mentorship from lead
              architects and direct VC pitch slots for finalists.
            </p>
          </div>
          <div className="shrink-0">
            {hackathonRsvp ? (
              <Badge variant="success" size="lg" className="gap-1.5 py-2 px-3 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                RSVP Confirmed
              </Badge>
            ) : (
              <Button
                variant="archetype"
                onClick={() => setHackathonRsvp(true)}
                className="gap-2 font-semibold font-sans"
              >
                <Terminal className="h-4 w-4" />
                RSVP for Hackathon
              </Button>
            )}
          </div>
        </div>

        {hackathonBounties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {hackathonBounties.map((bounty, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-400">{bounty.reward}</span>
                  <Badge variant="outline" size="sm" className="text-xs font-semibold">
                    Bounty {i + 1}
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold text-foreground font-sans">{bounty.title}</h4>
                <p className="text-xs font-semibold text-muted-foreground">Supported by {bounty.sponsor}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Ticket Tiers & Developer Access Passes */}
      <section id="tickets-section" className="space-y-6 pt-4 border-t border-border">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-sans">
            <Ticket className="h-5 w-5 text-[var(--archetype-primary)]" />
            Developer Passes & Workshop Badges
          </h3>
          <p className="text-xs text-muted-foreground font-sans">
            Includes access to all stage recordings, hackathon desks, and speaker VIP networking receptions.
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
                      {tier.capacity - tier.soldCount} Available
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-foreground font-sans">
                      {tier.price > 0
                        ? formatCurrency(tier.price, (tier.currency as SupportedCurrency) || "IDR", locale)
                        : "Free Ticket"}
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
                      Select Pass
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
