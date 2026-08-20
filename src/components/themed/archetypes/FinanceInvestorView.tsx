"use client";

import * as React from "react";
import {
  TrendingUp,
  Lock,
  DollarSign,
  ShieldCheck,
  Briefcase,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  MapPin,
  Building,
  KeyRound,
  Ticket,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import type { ArchetypeViewProps } from "./IndustrialB2BView";

export function FinanceInvestorView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [dealRoomOpen, setDealRoomOpen] = React.useState(false);
  const [selectedDeal, setSelectedDeal] = React.useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = React.useState(false);
  const [kycVerified, setKycVerified] = React.useState(false);

  // Curated pitch decks & investment opportunities
  const pitchDecks = [
    {
      company: "NexusPay Sovereign Gateway",
      sector: "Cross-Border Liquidity",
      seeking: "$15M Series B",
      valuation: "$90M Pre-Money",
      metrics: "ARR: $6.2M | YoY Growth: 180% | EBITDA Positive",
      pitchSummary: "Next-generation multi-currency settlement rails for Southeast Asia & Middle East trade corridors.",
    },
    {
      company: "Aether AI Quantitative Alpha",
      sector: "Asset Management AI",
      seeking: "$25M Venture Debt / Growth",
      valuation: "$140M Post-Money",
      metrics: "AUM: $320M | Sharpe Ratio: 2.84 | 0% Drawdown in Q1 2026",
      pitchSummary: "Ultra-low latency deep reinforcement learning model for automated FX hedging and macro arbitrage.",
    },
    {
      company: "Verde Carbon Registry ESG",
      sector: "Climate FinTech & Tokenized Credits",
      seeking: "$8M Series A",
      valuation: "$40M Pre-Money",
      metrics: "Registered Credits: 4.2M Tons | 14 Sovereign Partners",
      pitchSummary: "High-integrity carbon credit issuance platform with real-time satellite sensor verification.",
    },
  ];

  const handleBookDealRoom = (dealName: string) => {
    setSelectedDeal(dealName);
    setBookingConfirmed(false);
    setDealRoomOpen(true);
  };

  return (
    <div className="space-y-12">
      {/* 1. Institutional Investor & Sovereign Wealth Banner */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            <span>Private Equity, Venture Capital & Sovereign Forum</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Capital Allocation, Deal Structuring & Liquidity Horizons
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {event.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="archetype"
              onClick={() => {
                const el = document.getElementById("pitch-decks");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs font-semibold shadow-md"
            >
              <Briefcase className="h-4 w-4" />
              Review Curated Pitch Decks ({pitchDecks.length})
            </Button>

            <Button
              variant="outline"
              onClick={() => handleBookDealRoom("Sovereign Investor Deal Room 1")}
              className="gap-2 text-xs"
            >
              <Lock className="h-4 w-4 text-amber-500" />
              Book Private 1-on-1 Deal Suite
            </Button>
          </div>
        </div>

        {/* Encrypted Badge & Chatham House Protocol */}
        <Card className="border-border bg-card shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="success" size="sm" className="gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                KYC Level 3
              </Badge>
              <Lock className="h-4 w-4 text-[var(--archetype-accent)]" />
            </div>
            <CardTitle className="text-base">Chatham House Rule</CardTitle>
            <CardDescription className="text-xs">
              All discussions within closed-door plenary halls and bilateral rooms are non-attributable.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <div className="p-2.5 rounded-md bg-muted/40 border border-border/80 flex items-center justify-between">
              <span>Encrypted Pass Verification:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {kycVerified ? "SEC-VERIFIED-PASS" : "PENDING-CONFIRMATION"}
              </span>
            </div>
            {!kycVerified && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setKycVerified(true)}
                className="w-full text-xs gap-1.5"
              >
                <KeyRound className="h-3.5 w-3.5" />
                Verify Institutional Accreditation
              </Button>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 2. Curated Pitch Decks & Venture Pipeline */}
      <section id="pitch-decks" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-[var(--archetype-accent)]" />
              Curated Pitch Decks & Deal Pipeline
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Vetted growth-stage founders presenting to accredited investors.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pitchDecks.map((deck, idx) => (
            <Card key={idx} className="border-border hover:border-emerald-500/50 transition-all flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                    {deck.sector}
                  </Badge>
                  <span className="font-bold text-emerald-400">{deck.seeking}</span>
                </div>
                <CardTitle className="text-base">{deck.company}</CardTitle>
                <CardDescription className="text-xs font-mono text-muted-foreground">
                  Valuation: {deck.valuation}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 text-xs flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-muted-foreground leading-relaxed">{deck.pitchSummary}</p>
                  <div className="p-2 rounded bg-muted/40 font-mono text-[11px] text-muted-foreground">
                    {deck.metrics}
                  </div>
                </div>
                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBookDealRoom(deck.company)}
                    className="w-full gap-1.5 text-xs font-semibold"
                  >
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    Request Deal-Room Slot
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Plenary & Macroeconomic Roundtables */}
      {event.agendaItems.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--archetype-primary)]" />
            Executive Roundtables & Keynotes
          </h3>
          <div className="space-y-3">
            {event.agendaItems.map((agenda) => (
              <div
                key={agenda.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-card border border-border gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="archetype" size="sm">
                      {agenda.track || "Macro Strategy"}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {agenda.location}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-foreground">{agenda.title}</h4>
                  {agenda.speakerName && (
                    <p className="text-xs text-muted-foreground">
                      Chair: <span className="font-semibold text-foreground">{agenda.speakerName}</span>{" "}
                      {agenda.speakerRole && `(${agenda.speakerRole})`}
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

      {/* 4. Ticket Tiers & VIP Delegate Credentials */}
      <section id="tickets-section" className="space-y-6 pt-4 border-t border-border">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-5 w-5 text-[var(--archetype-primary)]" />
            Delegate Accreditation & LP / GP Passes
          </h3>
          <p className="text-xs text-muted-foreground">
            Accredited passes include access to private investor lounges, pitch sessions, and bilateral deal suites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {event.ticketTiers.map((tier) => {
            let benefits: string[] = [];
            try {
              benefits = JSON.parse(tier.benefitsJson);
            } catch {
              benefits = ["Private Deal Room access", "Encrypted attendee directory", "VIP Gala Banquet invitation"];
            }

            return (
              <Card key={tier.id} className="flex flex-col border-border/80 hover:border-emerald-500 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <Badge variant="success" size="sm">
                      {tier.capacity - tier.soldCount} Passes
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-foreground">
                      {tier.price > 0
                        ? formatCurrency(tier.price, (tier.currency as SupportedCurrency) || "IDR", locale)
                        : "Institutional Invitation"}
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
                      Acquire Credential
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Deal Room Drawer */}
      <Drawer
        isOpen={dealRoomOpen}
        onClose={() => setDealRoomOpen(false)}
        title="Schedule Private Bilateral Deal Room"
        description={`Direct investor meeting suite booking for ${selectedDeal}`}
      >
        {bookingConfirmed ? (
          <div className="py-12 text-center space-y-3 animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold text-foreground">Deal Room Requested</h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              The founder/fund team has been alerted. An encrypted calendar invite and NDA token will be dispatched to
              your email.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setBookingConfirmed(true);
              setTimeout(() => {
                setDealRoomOpen(false);
                setBookingConfirmed(false);
              }, 2500);
            }}
            className="space-y-4 text-xs"
          >
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Target Opportunity</label>
              <input
                type="text"
                readOnly
                value={selectedDeal || "Institutional Deal Room"}
                className="w-full px-3 py-2 rounded bg-muted/50 border border-border text-muted-foreground font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Fund / Institution Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Apex Global Ventures"
                className="w-full px-3 py-2 rounded bg-background border border-border focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Preferred Time Slot *</label>
                <select className="w-full px-3 py-2 rounded bg-background border border-border focus:ring-1 focus:ring-primary">
                  <option>Day 1 — 14:00 - 14:45</option>
                  <option>Day 1 — 15:30 - 16:15</option>
                  <option>Day 2 — 10:00 - 10:45</option>
                  <option>Day 2 — 11:30 - 12:15</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Investment Horizon / Check Size</label>
                <select className="w-full px-3 py-2 rounded bg-background border border-border focus:ring-1 focus:ring-primary">
                  <option>$1M - $5M USD</option>
                  <option>$5M - $15M USD</option>
                  <option>$15M+ Growth Equity</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Discussion Agenda / Due Diligence Topics</label>
              <textarea
                rows={3}
                placeholder="Briefly state your investment thesis, current portfolio synergy, or specific questions regarding financial metrics..."
                className="w-full px-3 py-2 rounded bg-background border border-border focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="pt-2">
              <Button type="submit" variant="archetype" className="w-full gap-2 font-semibold">
                <Lock className="h-4 w-4" />
                Confirm Deal-Room Reservation
              </Button>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
}
