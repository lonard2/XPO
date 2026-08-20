"use client";

import * as React from "react";
import {
  Building2,
  Shield,
  FileCheck,
  Globe2,
  Lock,
  CheckCircle2,
  Clock,
  MapPin,
  Ticket,
  ChevronRight,
  Landmark,
  Scale,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import type { ArchetypeViewProps } from "./IndustrialB2BView";

export function GovernmentDiplomaticView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [bilateralDrawerOpen, setBilateralDrawerOpen] = React.useState(false);
  const [selectedDelegation, setSelectedDelegation] = React.useState<string | null>(null);
  const [scheduled, setScheduled] = React.useState(false);

  // Diplomatic delegations participating
  const delegations = [
    { country: "Republic of Indonesia", head: "Minister of Maritime Affairs & Investment", lounge: "Bilateral Suite Alpha" },
    { country: "Japan", head: "Special Envoy for Green Transformation", lounge: "Bilateral Suite Beta" },
    { country: "Federal Republic of Germany", head: "State Secretary for Economic Affairs", lounge: "Bilateral Suite Gamma" },
    { country: "Republic of Singapore", head: "Senior Minister of State for Trade", lounge: "Bilateral Suite Delta" },
  ];

  // Protocol requirements
  const protocolRules = [
    "Dress Code: Formal Diplomatic Attire (Dark Business Suit, Traditional National Dress, or Black Tie for Gala).",
    "Security Protocol: Biometric iris scan verification and Level-1 background clearance required at Security Gate 1.",
    "Media Restrictions: Pool camera only in Plenary Room; Chatham House Rule strictly applies in Working Sessions.",
  ];

  const handleRequestBilateral = (delCountry: string) => {
    setSelectedDelegation(delCountry);
    setScheduled(false);
    setBilateralDrawerOpen(true);
  };

  return (
    <div className="space-y-12 font-serif">
      {/* 1. Diplomatic Summit Hero Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-xs font-sans font-bold text-sky-400 uppercase tracking-wider">
            <Landmark className="h-4 w-4" aria-hidden="true" />
            <span>Intergovernmental Summit & Multilateral Treaty Assembly</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Bilateral Accords, Climate Compacts & Sovereign Dialogue
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed font-sans">
            {event.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 font-sans">
            <Button
              variant="archetype"
              onClick={() => {
                const el = document.getElementById("bilateral-lounges");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs font-semibold shadow-md"
            >
              <Globe2 className="h-4 w-4" />
              Sovereign Delegations ({delegations.length})
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const el = document.getElementById("protocol-briefing");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs"
            >
              <Shield className="h-4 w-4 text-sky-400" />
              Diplomatic Protocol & Security Briefing
            </Button>
          </div>
        </div>

        {/* Security Clearance & Protocol Card */}
        <Card id="protocol-briefing" className="border-border bg-card shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" size="sm" className="font-sans text-[10px] text-sky-400 border-sky-400/30">
                Diplomatic Protocol
              </Badge>
              <Lock className="h-4 w-4 text-sky-400" />
            </div>
            <CardTitle className="text-base font-sans">Summit Security Briefing</CardTitle>
            <CardDescription className="text-xs font-sans">
              Strict protocol mandates for ministerial delegates and registered observers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs font-sans text-muted-foreground">
            {protocolRules.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>{rule}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* 2. Bilateral Delegation Suites & Lounges */}
      <section id="bilateral-lounges" className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-sans">
            <Building2 className="h-5 w-5 text-sky-400" />
            Sovereign Delegation Suites & Lounges
          </h3>
          <p className="text-xs font-sans text-muted-foreground">
            Official diplomatic mission representations and scheduled bilateral meeting slots.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          {delegations.map((del, i) => (
            <Card key={i} className="border-border hover:border-sky-500/50 transition-all flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <Badge variant="archetype" size="sm">
                    {del.country}
                  </Badge>
                  <span className="text-muted-foreground font-mono text-[11px]">{del.lounge}</span>
                </div>
                <CardTitle className="text-base font-bold">{del.head}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-2.5 rounded bg-muted/40 text-muted-foreground">
                  Bilateral slot capacity: 4 accredited diplomatic attachés per session.
                </div>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRequestBilateral(del.country)}
                    className="w-full gap-2 text-xs"
                  >
                    <FileCheck className="h-3.5 w-3.5" />
                    Request Bilateral Dialogue Slot
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Ministerial Assembly Schedule */}
      {event.agendaItems.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-sans">
            <Clock className="h-5 w-5 text-[var(--archetype-primary)]" />
            Plenary Assembly & Treaty Working Sessions
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
                      {agenda.track || "Plenary Assembly"}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {agenda.location}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-foreground">{agenda.title}</h4>
                  {agenda.speakerName && (
                    <p className="text-xs text-muted-foreground">
                      Session Presiding Chair: <span className="font-semibold text-foreground">{agenda.speakerName}</span>
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
            Delegation Credentials & Official Observers
          </h3>
          <p className="text-xs font-sans text-muted-foreground">
            All passes require government email domain verification and official diplomatic accreditation clearance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          {event.ticketTiers.map((tier) => {
            let benefits: string[] = [];
            try {
              benefits = JSON.parse(tier.benefitsJson);
            } catch {
              benefits = ["Plenary summit access", "Delegation lounge entry", "Official communique draft binder"];
            }

            return (
              <Card key={tier.id} className="flex flex-col border-border/80 hover:border-sky-500 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <Badge variant="secondary" size="sm">
                      {tier.capacity - tier.soldCount} Credentials Left
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-foreground">
                      {tier.price > 0
                        ? formatCurrency(tier.price, (tier.currency as SupportedCurrency) || "IDR", locale)
                        : "Official Delegation Pass"}
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
                      Select Credential Tier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Bilateral Meeting Drawer */}
      <Drawer
        isOpen={bilateralDrawerOpen}
        onClose={() => setBilateralDrawerOpen(false)}
        title="Diplomatic Bilateral Request"
        description={`Formal bilateral audience scheduling with the delegation of ${selectedDelegation}`}
      >
        {scheduled ? (
          <div className="py-12 text-center space-y-3 font-sans animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold text-foreground">Audience Request Dispatched</h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              The diplomatic secretariat has received your bilateral memorandum. Official protocol confirmation will
              follow via diplomatic pouch / encrypted channel.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setScheduled(true);
              setTimeout(() => {
                setBilateralDrawerOpen(false);
                setScheduled(false);
              }, 2500);
            }}
            className="space-y-4 text-xs font-sans"
          >
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Target Sovereign Mission</label>
              <input
                type="text"
                readOnly
                value={selectedDelegation || "Delegation"}
                className="w-full px-3 py-2 rounded bg-muted/50 border border-border text-muted-foreground"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Requesting Ministry / Institution *</label>
              <input
                required
                type="text"
                placeholder="e.g. Ministry of Foreign Affairs & Trade"
                className="w-full px-3 py-2 rounded bg-background border border-border focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Lead Minister / Ambassador *</label>
              <input
                required
                type="text"
                placeholder="Full Name and Diplomatic Rank"
                className="w-full px-3 py-2 rounded bg-background border border-border focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Proposed Agenda Topics</label>
              <textarea
                rows={3}
                placeholder="Bilateral trade agreements, clean energy transition partnerships, or joint diplomatic communiques..."
                className="w-full px-3 py-2 rounded bg-background border border-border focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="pt-2">
              <Button type="submit" variant="archetype" className="w-full gap-2 font-semibold">
                <FileCheck className="h-4 w-4" />
                Submit Protocol Request
              </Button>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
}
