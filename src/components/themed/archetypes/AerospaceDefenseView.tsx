"use client";

import * as React from "react";
import {
  Shield,
  Plane,
  Radar,
  Radio,
  FileText,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Award,
  Users,
  Search,
  Lock,
  ArrowRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { type ArchetypeViewProps } from "./IndustrialB2BView";

export function AerospaceDefenseView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [briefingDrawerOpen, setBriefingDrawerOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<string | null>(null);
  const [briefingRequested, setBriefingRequested] = React.useState(false);

  // Flight Demonstrations & Static Tarmac Aircraft
  const flightDemos = [
    {
      id: "aero-01",
      name: "KF-21 Boramae Next-Gen Multirole Fighter",
      manufacturer: "Korea Aerospace Industries & PT DI",
      role: "Air Superiority & Tactical Interception",
      specs: "Max Speed: Mach 1.81 | AESA Radar | Internal Weapons Bay",
      demoSlot: "Tarmac Static + Flight Demo: 11:00 Daily",
      clearance: "Military & Defense Contractor L2",
      booth: "Tarmac Gate 4 - Static Line A",
    },
    {
      id: "aero-02",
      name: "Autonomous High-Altitude Loitering Drone (MALE)",
      manufacturer: "PT Dirgantara Indonesia (PTDI)",
      role: "Maritime ISR & Border Surveillance",
      specs: "Endurance: 30 Hours | SATCOM Data-Link | Payload: 300 kg",
      demoSlot: "Sensor Live Feed Telemetry: 14:00 Daily",
      clearance: "Restricted Delegation",
      booth: "Hall A - Booth 101",
    },
    {
      id: "aero-03",
      name: "Multi-Domain C4ISR Command Network Suite",
      manufacturer: "Global Defense Avionics Systems",
      role: "Integrated Tactical Battlefield Network",
      specs: "Quantum-Resistant Encryption | Anti-Jam GPS | Real-Time Mesh",
      demoSlot: "Closed Briefing Suite: Hourly",
      clearance: "Top Secret / Bilateral Only",
      booth: "Hall B - Secure Pavilion 208",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Category Mission Statement */}
      <section className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/20 via-card to-background p-6 sm:p-8 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Shield className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
                Aerospace, Aviation & Defense Expo
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Airshow Flight Demos, Tactical Avionics & Defense Briefings
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Inspect static tarmac fighter aircraft, autonomous unmanned aerial systems (UAS), multi-domain C4ISR defense networks, and schedule accredited military protocol briefings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Button
              onClick={() => {
                setSelectedAsset("KF-21 Boramae Next-Gen Multirole Fighter");
                setBriefingDrawerOpen(true);
              }}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md min-h-[44px]"
            >
              <Lock className="h-4 w-4 mr-2" />
              Request Defense Briefing Access
            </Button>
            <div className="text-xs text-muted-foreground text-center lg:text-right">
              Government credentials & security clearance required
            </div>
          </div>
        </div>
      </section>

      {/* 2. Flight Demonstrations & Static Assets */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">
            <Radar className="h-4 w-4" />
            <span>Flight Operations & Static Line</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Featured Aircraft & Tactical Systems
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {flightDemos.map((demo) => (
            <Card key={demo.id} className="border-border/80 bg-card hover:border-blue-500/40 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-blue-500/30 text-blue-500 bg-blue-500/10 text-xs font-semibold">
                    {demo.role}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-amber-500">{demo.clearance}</span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground leading-snug">{demo.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{demo.manufacturer}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs font-mono text-foreground space-y-1">
                  <div className="font-semibold text-blue-500 flex items-center gap-1">
                    <Plane className="h-3 w-3" /> Avionics & Payload Specs
                  </div>
                  <div>{demo.specs}</div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span>{demo.booth}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span>{demo.demoSlot}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedAsset(demo.name);
                    setBriefingDrawerOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full border-blue-500/30 hover:bg-blue-500/10 text-foreground font-semibold min-h-[40px]"
                >
                  <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                  View Tactical Technical Brief
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Defense Protocol Briefing Drawer */}
      <Drawer
        open={briefingDrawerOpen}
        onClose={() => {
          setBriefingDrawerOpen(false);
          setBriefingRequested(false);
        }}
        title="Defense Delegation & Tactical Briefing Clearance"
        description="Verify security credentials for restricted flight line tarmac access and classified bilateral briefings."
      >
        <div className="p-6 space-y-6">
          {briefingRequested ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-foreground">Security Clearance Verified</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Access pass for <span className="font-semibold text-foreground">{selectedAsset}</span> has been provisioned. Proceed to Security Checkpoint Gate C for Flight Line Tarmac Escort.
                </p>
              </div>
              <Button
                onClick={() => {
                  setBriefingDrawerOpen(false);
                  setBriefingRequested(false);
                }}
                className="mt-4"
              >
                Done
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setBriefingRequested(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Aerospace / Defense Asset
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedAsset || ""}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/50 text-foreground font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Delegation Credential Level
                </label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium">
                  <option>Accredited Defense Contractor (Level 2)</option>
                  <option>Military / Naval / Air Force Official Attache</option>
                  <option>Civil Aviation & Airport Infrastructure Executive</option>
                  <option>Aerospace Engineering Faculty / R&D Institute</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Tarmac Security Requirement
                </label>
                <div className="p-3 rounded-lg border border-border/80 bg-muted/20 text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Flight Line Safety Regulations Enforced</span>
                  </div>
                  <p>All tarmac visitors must wear official high-visibility credentials and present photographic identification at Flight Line Gate 4.</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBriefingDrawerOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Validate Credentials
                </Button>
              </div>
            </form>
          )}
        </div>
      </Drawer>
    </div>
  );
}
