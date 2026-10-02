"use client";

import * as React from "react";
import {
  Sprout,
  ScanLine,
  ThermometerSnowflake,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  Search,
  Layers,
  Utensils,
  Award,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { type ArchetypeViewProps } from "./IndustrialB2BView";

export function AgritechFoodView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [traceDrawerOpen, setTraceDrawerOpen] = React.useState(false);
  const [batchCode, setBatchCode] = React.useState("LOT-ORGANIC-2026-904");
  const [traceResult, setTraceResult] = React.useState(false);

  // Precision Farming & Agritech Showcase
  const agriShowcase = [
    {
      id: "agri-01",
      name: "Autonomous High-Precision Crop Sprayer Drone",
      developer: "PT Nusantara Agritech Robotics",
      cropFocus: "Paddy, Corn & Palm Plantation",
      tech: "LiDAR Altitude Radar | 60L Payload | Variable Rate Spraying",
      booth: "Hall 1 - Booth 115",
      status: "Live Drone Slalom Demo @ 11:30 Daily",
    },
    {
      id: "agri-02",
      name: "Smart IoT Hydroponic Vertical Tower Array",
      developer: "Tokyo Vertical Farms Consortium",
      cropFocus: "Nutrient-Dense Greens & Microgreens",
      tech: "Closed-Loop Nutrient Dosing | 95% Less Water | AI Yield Predictor",
      booth: "Hall 2 - Booth 220",
      status: "Tasting Bar Active All Day",
    },
    {
      id: "agri-03",
      name: "Ultra-Cold Pharma & Fresh Produce Refrigerated Corridor",
      developer: "Global Cold-Chain Logistics Hub",
      cropFocus: "Export Seafood & Tropical Fruits",
      tech: "-25°C to +4°C Monitored | Real-time GPS & Temp Telemetry",
      booth: "Hall 3 - Booth 308",
      status: "Container Inspection Walkthrough",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Category Mission Statement */}
      <section className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-950/20 via-card to-background p-6 sm:p-8 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/10 text-green-500 border border-green-500/20">
                <Sprout className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-green-500">
                Agriculture, Agritech & Food Processing
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Precision Farming, Cold-Chain Logistics & Culinary Innovation
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Discover autonomous agricultural robotics, verifiable farm-to-table batch traceability, smart soil analytics, and global commodity export corridors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Button
              onClick={() => {
                setTraceResult(false);
                setTraceDrawerOpen(true);
              }}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md min-h-[44px]"
            >
              <ScanLine className="h-4 w-4 mr-2" />
              Inspect Batch Traceability
            </Button>
            <div className="text-xs text-muted-foreground text-center lg:text-right">
              Verified organic & food safety credentials
            </div>
          </div>
        </div>
      </section>

      {/* 2. Precision Equipment & Demos */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-green-500 uppercase tracking-wider mb-1">
            <ThermometerSnowflake className="h-4 w-4" />
            <span>Smart Agritech Demos</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Featured Agriculture Technology & Cold-Chain Systems
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {agriShowcase.map((agri) => (
            <Card key={agri.id} className="border-border/80 bg-card hover:border-green-500/40 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/10 text-xs font-semibold">
                    {agri.cropFocus}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-foreground leading-snug">{agri.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{agri.developer}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs font-mono text-foreground space-y-1">
                  <div className="font-semibold text-green-500 flex items-center gap-1">
                    <Sprout className="h-3 w-3" /> Technical Architecture
                  </div>
                  <div>{agri.tech}</div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span>{agri.booth}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Clock className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span>{agri.status}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setTraceResult(false);
                    setTraceDrawerOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full border-green-500/30 hover:bg-green-500/10 text-foreground font-semibold min-h-[40px]"
                >
                  <ScanLine className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                  View Harvest Verification
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Farm-to-Table Traceability Drawer */}
      <Drawer
        open={traceDrawerOpen}
        onClose={() => setTraceDrawerOpen(false)}
        title="Farm-to-Table Batch Traceability Inspector"
        description="Verify origin harvest altitude, cold-chain temperature telemetry, and laboratory phytosanitary certificates."
      >
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-semibold text-foreground block">
              Enter or Select Agricultural Batch Lot Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-mono"
              />
              <Button
                onClick={() => setTraceResult(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                Verify Batch
              </Button>
            </div>
          </div>

          {traceResult ? (
            <div className="p-4 rounded-xl border border-green-500/30 bg-green-950/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-green-500">LOT STATUS: VERIFIED AUTHENTIC</span>
                <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/10 text-xs">
                  Phytosanitary Passed
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block text-[11px]">Harvest Origin</span>
                  <span className="font-semibold text-foreground">Gayo Highlands, Aceh (1,450m ASL)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block text-[11px]">Cold Chain Transit</span>
                  <span className="font-semibold text-foreground">Continuous 3.8°C Monitored</span>
                </div>
                <div className="p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block text-[11px]">Residue Screen</span>
                  <span className="font-semibold text-foreground">0.00 ppm Synthetic Pesticides</span>
                </div>
                <div className="p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block text-[11px]">Export Certificate</span>
                  <span className="font-semibold text-foreground">Indonesian Agricultural Quarantine</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
              Click &quot;Verify Batch&quot; to inspect digital ledger records for this agricultural shipment.
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
