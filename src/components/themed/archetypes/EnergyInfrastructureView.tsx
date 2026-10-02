"use client";

import * as React from "react";
import {
  Zap,
  Activity,
  Flame,
  Wind,
  Sun,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  Layers,
  FileCheck2,
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { type ArchetypeViewProps } from "./IndustrialB2BView";

export function EnergyInfrastructureView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [auditDrawerOpen, setAuditDrawerOpen] = React.useState(false);
  const [selectedConcession, setSelectedConcession] = React.useState<string | null>(null);
  const [auditRequested, setAuditRequested] = React.useState(false);

  // Power & Resource Concessions Telemetry
  const concessionBlocks = [
    {
      id: "blk-01",
      name: "North Sumatra Geothermal Block IV",
      operator: "PT Nusantara GeoPower Utama",
      capacity: "350 MW Continuous Baseload",
      type: "Geothermal",
      esgRating: "AAA Certified Clean Energy",
      booth: "Hall 1 - Booth 104",
      status: "Operational Grid Feeder",
    },
    {
      id: "blk-02",
      name: "Sulawesi High-Purity Nickel Processing Grid",
      operator: "Apex Industrial Minerals & Metals",
      capacity: "1.2 GW Captive Renewable Hybrid",
      type: "Renewable Hybrid",
      esgRating: "ISO 14064 Carbon Audited",
      booth: "Hall 2 - Booth 212",
      status: "Phase 2 Expansion Tender",
    },
    {
      id: "blk-03",
      name: "Java Offshore Wind & Solar Array Beta",
      operator: "Global Clean Power Consortium",
      capacity: "600 MW Peak Marine Generation",
      type: "Offshore Wind",
      esgRating: "Green Bond Verified",
      booth: "Hall 3 - Booth 318",
      status: "PPAs Ready for Negotiation",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Category Mission Statement */}
      <section className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/20 via-card to-background p-6 sm:p-8 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Zap className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                Energy & Mining Infrastructure
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Renewable Power Grids, Heavy Extraction Tech & Decarbonization
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Explore critical concession topographies, heavy plant machinery, high-voltage transmission lines, and institutional decarbonization partnerships.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Button
              onClick={() => {
                setSelectedConcession("North Sumatra Geothermal Block IV");
                setAuditDrawerOpen(true);
              }}
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md min-h-[44px]"
            >
              <FileCheck2 className="h-4 w-4 mr-2" />
              Request ESG & Grid Dossier
            </Button>
            <div className="text-xs text-muted-foreground text-center lg:text-right">
              Verified energy delegates and compliance officers
            </div>
          </div>
        </div>
      </section>

      {/* 2. Grid Output & Telemetry Blocks */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
            <Activity className="h-4 w-4" />
            <span>Concessions & Grids</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Featured Energy Blocks & Heavy Plants
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {concessionBlocks.map((blk) => (
            <Card key={blk.id} className="border-border/80 bg-card hover:border-amber-500/40 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/10 text-xs font-semibold">
                    {blk.type}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-emerald-500">{blk.esgRating}</span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground leading-snug">{blk.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{blk.operator}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs font-mono text-foreground space-y-1">
                  <div className="font-semibold text-amber-500 flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Output & Capacity
                  </div>
                  <div>{blk.capacity}</div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span>{blk.booth}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>{blk.status}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedConcession(blk.name);
                    setAuditDrawerOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full border-amber-500/30 hover:bg-amber-500/10 text-foreground font-semibold min-h-[40px]"
                >
                  <FileCheck2 className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                  View Concession Prospectus
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. ESG & Grid Audit Drawer */}
      <Drawer
        open={auditDrawerOpen}
        onClose={() => {
          setAuditDrawerOpen(false);
          setAuditRequested(false);
        }}
        title="Energy Concession & Decarbonization Dossier"
        description="Access technical grid interconnect studies, carbon accounting baselines, and concession rights documentation."
      >
        <div className="p-6 space-y-6">
          {auditRequested ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-foreground">Dossier Access Granted</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Technical filings for <span className="font-semibold text-foreground">{selectedConcession}</span> have been unlocked. Download the encrypted PPA brief or visit the energy lounge.
                </p>
              </div>
              <Button
                onClick={() => {
                  setAuditDrawerOpen(false);
                  setAuditRequested(false);
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
                setAuditRequested(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Concession Block
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedConcession || ""}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/50 text-foreground font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Requested Information Scope
                </label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium">
                  <option>Power Purchase Agreement (PPA) Framework</option>
                  <option>High-Voltage Grid Interconnection Feasibility</option>
                  <option>Scope 1/2/3 Decarbonization Audit & Carbon Credits</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Regulatory Compliance Assurance
                </label>
                <div className="p-3 rounded-lg border border-border/80 bg-muted/20 text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Ministry of Energy & Mineral Resources Verified</span>
                  </div>
                  <p>All concession data is synchronized with national clean energy targets and regional transmission blueprints.</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAuditDrawerOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                >
                  Request Technical Dossier
                </Button>
              </div>
            </form>
          )}
        </div>
      </Drawer>
    </div>
  );
}
