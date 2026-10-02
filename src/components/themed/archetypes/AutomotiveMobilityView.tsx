"use client";

import * as React from "react";
import {
  Car,
  Gauge,
  BatteryCharging,
  Zap,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Award,
  Users,
  Search,
  Sparkles,
  Ticket,
  ArrowRight,
  Sliders,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import { type ArchetypeViewProps } from "./IndustrialB2BView";

export function AutomotiveMobilityView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [testDriveDrawerOpen, setTestDriveDrawerOpen] = React.useState(false);
  const [selectedVehicle, setSelectedVehicle] = React.useState<string | null>(null);
  const [testDriveBooked, setTestDriveBooked] = React.useState(false);
  const [selectedPowertrain, setSelectedPowertrain] = React.useState("ALL");

  // Premier Concept Vehicles & Track Demo Fleet
  const vehicleRoster = [
    {
      id: "veh-01",
      name: "Apex GT Electric Hypercar Concept",
      manufacturer: "Apex Dynamics Mobility",
      powertrain: "BEV",
      specs: "1,200 HP | 0-100 km/h: 1.9s | Range: 680 km | 800V Architecture",
      booth: "Hall 1 - Booth 101",
      trackSlot: "Closed Circuit Slot: 11:00 & 14:30 Daily",
      badge: "World Premiere",
    },
    {
      id: "veh-02",
      name: "Nusantara Volt Urban Commercial AGV",
      manufacturer: "PT Nusantara EV Solusindo",
      powertrain: "HYBRID",
      specs: "Payload: 1,800 kg | Level 4 Autonomous Ready | Swappable 90 kWh Pack",
      booth: "Hall 2 - Booth 210",
      trackSlot: "Autonomous Shuttle Demo: Continuous",
      badge: "Fleet Solution",
    },
    {
      id: "veh-03",
      name: "Kanto Hydrogen Fuel-Cell SUV",
      manufacturer: "Kanto Clean Propulsion Lab",
      powertrain: "FCEV",
      specs: "700 bar H2 Tank | Refuel: 3 mins | Range: 850 km | Zero Tailpipe Emission",
      booth: "Hall 3 - Booth 315",
      trackSlot: "Dyno & Track Slalom: 13:00 Daily",
      badge: "Next-Gen Clean Energy",
    },
  ];

  const filteredVehicles = React.useMemo(() => {
    if (selectedPowertrain === "ALL") return vehicleRoster;
    return vehicleRoster.filter((v) => v.powertrain === selectedPowertrain);
  }, [selectedPowertrain]);

  return (
    <div className="space-y-12">
      {/* 1. Category Mission Statement */}
      <section className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/20 via-card to-background p-6 sm:p-8 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                <Car className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                Automotive & Mobility Experience
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Concept Vehicles, EV Ecosystems & Closed-Circuit Track Drives
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Explore premier automotive premieres, cutting-edge battery chemistries, autonomous vehicle telemetry, and book real-time track slots directly with exhibition factory engineers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Button
              onClick={() => {
                setSelectedVehicle("Apex GT Electric Hypercar Concept");
                setTestDriveDrawerOpen(true);
              }}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md min-h-[44px]"
            >
              <Gauge className="h-4 w-4 mr-2" />
              Book Test Drive Slot
            </Button>
            <div className="text-xs text-muted-foreground text-center lg:text-right">
              Valid driver license required at Paddock Gate
            </div>
          </div>
        </div>
      </section>

      {/* 2. Concept Premieres & Fleet Specs */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">
              <BatteryCharging className="h-4 w-4" />
              <span>Premieres & Demos</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Featured Concepts & Track Roster
            </h3>
          </div>

          {/* Powertrain Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-muted/30">
            {["ALL", "BEV", "HYBRID", "FCEV"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedPowertrain(type)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[36px] ${
                  selectedPowertrain === type
                    ? "bg-red-600 text-white shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="border-border/80 bg-card hover:border-red-500/40 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-red-500/30 text-red-500 bg-red-500/10 text-xs font-semibold">
                    {vehicle.badge}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-muted-foreground">{vehicle.powertrain}</span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground leading-snug">{vehicle.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{vehicle.manufacturer}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs font-mono text-foreground space-y-1">
                  <div className="font-semibold text-red-500/90 flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Technical Specs
                  </div>
                  <div>{vehicle.specs}</div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span>{vehicle.booth}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Clock className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span>{vehicle.trackSlot}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedVehicle(vehicle.name);
                    setTestDriveDrawerOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full border-red-500/30 hover:bg-red-500/10 text-foreground font-semibold min-h-[40px]"
                >
                  <Gauge className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                  Reserve Track Demo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Test Drive Booking Drawer */}
      <Drawer
        open={testDriveDrawerOpen}
        onClose={() => {
          setTestDriveDrawerOpen(false);
          setTestDriveBooked(false);
        }}
        title="Automotive Test Drive & Paddock Registration"
        description="Reserve a closed-circuit demo drive or ride-along session with accredited factory drivers."
      >
        <div className="p-6 space-y-6">
          {testDriveBooked ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-foreground">Track Session Reserved</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Your reservation for <span className="font-semibold text-foreground">{selectedVehicle}</span> has been issued. Present your digital pass and driver license at Pit Lane Gate 2.
                </p>
              </div>
              <Button
                onClick={() => {
                  setTestDriveDrawerOpen(false);
                  setTestDriveBooked(false);
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
                setTestDriveBooked(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Selected Vehicle
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedVehicle || ""}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/50 text-foreground font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Preferred Track Session
                </label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium">
                  <option>Morning Slalom Track Session (10:30 - 11:30)</option>
                  <option>Afternoon Closed-Circuit Acceleration (14:00 - 15:00)</option>
                  <option>Evening Autonomous Fleet Ride-Along (16:30 - 17:30)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Driver License Certification
                </label>
                <div className="p-3 rounded-lg border border-border/80 bg-muted/20 text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Valid National or International Driver License Required</span>
                  </div>
                  <p>All drivers must complete the standard safety briefing at Paddock Briefing Room B prior to circuit entry.</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTestDriveDrawerOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  Confirm Reservation
                </Button>
              </div>
            </form>
          )}
        </div>
      </Drawer>
    </div>
  );
}
