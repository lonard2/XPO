"use client";

import * as React from "react";
import {
  Trophy,
  Flame,
  QrCode,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Award,
  Users,
  Search,
  ArrowRight,
  Gauge,
  Activity,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { type ArchetypeViewProps } from "./IndustrialB2BView";

export function SportsOutdoorView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [bibDrawerOpen, setBibDrawerOpen] = React.useState(false);
  const [selectedSport, setSelectedSport] = React.useState<string | null>(null);
  const [bibIssued, setBibIssued] = React.useState(false);

  // Sports Competitions & Trail Arenas
  const competitionArenas = [
    {
      id: "sport-01",
      name: "International Marathon Race Expo & Bib Collection",
      discipline: "Road Running & Ultra Marathon",
      specs: "Wave 1: Sub-3h (05:00 AM) | Wave 2: Sub-4h | Timing Tag Synchronized",
      booth: "Hall 1 - Race Packet Arena",
      status: "Bib Dispenser Active (Halls Open 09:00 - 20:00)",
      badge: "Official WMM Qualifier",
    },
    {
      id: "sport-02",
      name: "Gravel Trail & Technical Mountain Bike Slalom Arena",
      discipline: "Gravel & Enduro Cycling",
      specs: "400m Indoor Pumptrack & Rock Garden Obstacle Circuit",
      booth: "Hall 2 - Open Trail Ground",
      status: "Test Rides Open Every 30 Mins",
      badge: "UCI Sanctioned Gear",
    },
    {
      id: "sport-03",
      name: "High-Altitude Simulation & Sports Science Clinic",
      discipline: "VO2 Max & Hypoxic Training",
      specs: "Simulated 3,500m Altitude Chamber | Lactate Threshold Diagnostics",
      booth: "Hall 3 - Sports Med Lab 304",
      status: "Athlete Screenings Ongoing",
      badge: "Sports Medicine",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Category Mission Statement */}
      <section className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-950/20 via-card to-background p-6 sm:p-8 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
                <Trophy className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
                Sports, Fitness & Outdoor Adventure Expo
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Race Bib Collections, Trail Testing & Sports Science Arenas
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Retrieve official marathon race packets, test high-performance trail equipment on indoor obstacle circuits, and measure athletic physiological metrics with certified sports medicine clinicians.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Button
              onClick={() => {
                setSelectedSport("International Marathon Race Expo & Bib Collection");
                setBibIssued(false);
                setBibDrawerOpen(true);
              }}
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md min-h-[44px]"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Retrieve Race Bib & Packet QR
            </Button>
            <div className="text-xs text-muted-foreground text-center lg:text-right">
              Valid registration ID required at Bib Desk
            </div>
          </div>
        </div>
      </section>

      {/* 2. Arenas & Competitions Roster */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-500 uppercase tracking-wider mb-1">
            <Activity className="h-4 w-4" />
            <span>Arenas & Testing Grounds</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Featured Competitions & Trial Circuits
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {competitionArenas.map((arena) => (
            <Card key={arena.id} className="border-border/80 bg-card hover:border-orange-500/40 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-orange-500/30 text-orange-500 bg-orange-500/10 text-xs font-semibold">
                    {arena.badge}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-muted-foreground">{arena.discipline}</span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground leading-snug">{arena.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{arena.specs}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span>{arena.booth}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Clock className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                    <span>{arena.status}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedSport(arena.name);
                    setBibIssued(false);
                    setBibDrawerOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full border-orange-500/30 hover:bg-orange-500/10 text-foreground font-semibold min-h-[40px]"
                >
                  <Trophy className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
                  Reserve Gear Trial Slot
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Bib & Packet Dispenser Drawer */}
      <Drawer
        open={bibDrawerOpen}
        onClose={() => setBibDrawerOpen(false)}
        title="Athlete Bib & Race Packet Collection QR"
        description="Verify your race registration, start wave corral assignment, and timing chip activation."
      >
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Competition Category / Race
              </label>
              <input
                type="text"
                readOnly
                value={selectedSport || ""}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/50 text-foreground font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Race Distance / Discipline
              </label>
              <select className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium">
                <option>Full Marathon 42.195 km (Corral Wave A)</option>
                <option>Half Marathon 21.1 km (Corral Wave B)</option>
                <option>10K Road Speed Race (Corral Wave C)</option>
                <option>50K Ultra Mountain Trail (Mandatory Gear Vetted)</option>
              </select>
            </div>

            <Button
              onClick={() => setBibIssued(true)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
            >
              Generate Instant Collection QR
            </Button>
          </div>

          {bibIssued && (
            <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-950/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-orange-500">ATHLETE BIB: #4208-A</span>
                <Badge variant="outline" className="border-orange-500/30 text-orange-500 bg-orange-500/10 text-xs">
                  Timing Tag Activated
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block text-[11px]">Corral Start Time</span>
                  <span className="font-semibold text-foreground">05:15 AM WIB (Wave A)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block text-[11px]">Technical Singlet</span>
                  <span className="font-semibold text-foreground">Size L (Fast-Drying)</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Present this screen at Race Expo Hall 1 Collection Counter 04 for express bag collection.
              </p>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
