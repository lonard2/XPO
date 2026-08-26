"use client";

import * as React from "react";
import {
  Code2,
  Terminal,
  Cpu,
  Video,
  Github,
  Twitter,
  ExternalLink,
  CheckCircle2,
  Clock,
  MapPin,
  Trophy,
  Users,
  Sparkles,
  Ticket,
  Play,
  Layers,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import type { ArchetypeViewProps } from "./IndustrialB2BView";

export function TechDevSummitView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [activeTrack, setActiveTrack] = React.useState("ALL");
  const [activeStage, setActiveStage] = React.useState("Main Stage Live");
  const [hackathonRsvp, setHackathonRsvp] = React.useState(false);
  const [streamPlaying, setStreamPlaying] = React.useState(false);

  // Extract all tracks
  const tracks = [
    "ALL",
    ...Array.from(new Set(event.agendaItems.map((a) => a.track || "General Engineering").filter(Boolean))),
  ];

  const filteredAgendas = event.agendaItems.filter(
    (item) => activeTrack === "ALL" || item.track === activeTrack
  );

  // Sample Hackathon Bounties
  const hackathonBounties = [
    { title: "Best Autonomous AI Agent", reward: "$10,000 USD", sponsor: "OpenRouter & DeepSeek" },
    { title: "Distributed Consensus & Edge Compute", reward: "$8,000 USD", sponsor: "Cloud Native Alliance" },
    { title: "Developer Tooling & DX Innovation", reward: "$7,000 USD", sponsor: "Jakarta Devs Community" },
  ];

  return (
    <div className="space-y-12 font-mono">
      {/* 1. Terminal / Keynote Hero Header */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
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
              variant="archetype"
              onClick={() => {
                const el = document.getElementById("livestream-widget");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs font-semibold shadow-md font-sans"
            >
              <Video className="h-4 w-4" />
              Watch Live Stream Broadcast
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const el = document.getElementById("hackathon-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs font-sans"
            >
              <Trophy className="h-4 w-4 text-amber-400" />
              Hackathon ($25k Bounty)
            </Button>
          </div>
        </div>

        {/* Live Stream Stage Card */}
        <div id="livestream-widget" className="bg-card border border-border rounded-xl overflow-hidden shadow-lg flex flex-col">
          <div className="p-3 bg-muted/60 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-foreground font-sans">Live Stream Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" size="sm" className="text-xs font-semibold">
                {activeStage}
              </Badge>
            </div>
          </div>

          <div className="relative aspect-video bg-black flex items-center justify-center text-white">
            {streamPlaying ? (
              <div className="p-4 text-center space-y-2">
                <Radio className="h-8 w-8 text-red-500 animate-pulse mx-auto" />
                <p className="text-xs font-sans font-semibold">Broadcasting: {activeStage}</p>
                <p className="text-xs font-semibold text-slate-400">1080p60 Low-Latency WebRTC Stream</p>
              </div>
            ) : (
              <div className="text-center space-y-3 p-4">
                <div
                  onClick={() => setStreamPlaying(true)}
                  className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center mx-auto cursor-pointer transition-transform hover:scale-105"
                >
                  <Play className="h-6 w-6 text-white fill-white ml-0.5" />
                </div>
                <p className="text-xs font-semibold font-sans text-slate-300">Click to tune in to {activeStage}</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-card border-t border-border flex items-center justify-between text-xs">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveStage("Stage 1 - Main Keynotes");
                  setStreamPlaying(true);
                }}
                className="px-2 py-1 rounded bg-muted hover:bg-accent text-xs font-semibold"
              >
                Main Stage
              </button>
              <button
                onClick={() => {
                  setActiveStage("Stage 2 - AI Workshops");
                  setStreamPlaying(true);
                }}
                className="px-2 py-1 rounded bg-muted hover:bg-accent text-xs font-semibold"
              >
                AI Stage
              </button>
            </div>
            <span className="text-xs font-semibold text-muted-foreground font-mono">1,420 Viewers</span>
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
                RSVP Confirmed (Team Desk Assigned)
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
