"use client";

import * as React from "react";
import {
  Building2,
  Layers,
  FileCode,
  Package,
  Award,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Clock,
  Download,
  Sparkles,
  ArrowRight,
  Hammer,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { type ArchetypeViewProps } from "./IndustrialB2BView";

export function BuildingPropTechView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [sampleDrawerOpen, setSampleDrawerOpen] = React.useState(false);
  const [selectedMaterial, setSelectedMaterial] = React.useState<string | null>(null);
  const [sampleRequested, setSampleRequested] = React.useState(false);

  // Architectural Materials & BIM Assets
  const materialCatalog = [
    {
      id: "mat-01",
      name: "Ultra-High Performance Carbon-Negative Concrete (UHPC)",
      manufacturer: "PT Semen Nusantara Inovasi",
      category: "Structural Facades & Precast",
      specs: "Compressive Strength: 140 MPa | 65% Recycled Pozzolan | EPD Certified",
      bimFormat: "Revit 2026 (.rfa) + IFC4",
      booth: "Hall 1 - Booth 108",
      cpdCredit: "2.0 IAI / AIA Credits",
    },
    {
      id: "mat-02",
      name: "Dynamic Electrochromic Solar-Control Glazing",
      manufacturer: "Tokyo Smart Glass Systems",
      category: "Building Envelope & Fenestration",
      specs: "SHGC: 0.09 - 0.41 Tunable | IoT Light Sensor Integration | U-Value: 0.8",
      bimFormat: "Revit BIM Family + EnergyPlus IDF",
      booth: "Hall 2 - Booth 215",
      cpdCredit: "1.5 CPD Hours",
    },
    {
      id: "mat-03",
      name: "Acoustic Recycled Wood Fiber Composite Panels",
      manufacturer: "Nordic EcoAcoustics Global",
      category: "Interior Finishes & Soundproofing",
      specs: "NRC: 0.95 | Class A Fire Rated | Zero Formaldehyde Outgassing",
      bimFormat: "Archicad (.gsm) + Revit (.rfa)",
      booth: "Hall 3 - Booth 302",
      cpdCredit: "1.0 CPD Hour",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Category Mission Statement */}
      <section className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-950/20 via-card to-background p-6 sm:p-8 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
                <Building2 className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-500">
                Building, Architecture & PropTech Expo
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              BIM Architecture Models, Smart Facades & CPD Certification
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Download certified BIM/CAD building components, order curated physical material sample kits directly to your studio, and accumulate Continuing Professional Development (CPD) credits.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Button
              onClick={() => {
                setSelectedMaterial("Ultra-High Performance Carbon-Negative Concrete (UHPC)");
                setSampleDrawerOpen(true);
              }}
              size="lg"
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-md min-h-[44px]"
            >
              <Package className="h-4 w-4 mr-2" />
              Request Material Sample Kit
            </Button>
            <div className="text-xs text-muted-foreground text-center lg:text-right">
              Free courier dispatch to licensed architects & developers
            </div>
          </div>
        </div>
      </section>

      {/* 2. Materials & BIM Roster */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-500 uppercase tracking-wider mb-1">
            <Layers className="h-4 w-4" />
            <span>Architectural Systems</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Specified Building Materials & BIM Assets
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {materialCatalog.map((mat) => (
            <Card key={mat.id} className="border-border/80 bg-card hover:border-sky-500/40 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-sky-500/30 text-sky-500 bg-sky-500/10 text-xs font-semibold">
                    {mat.category}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-emerald-500">{mat.cpdCredit}</span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground leading-snug">{mat.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{mat.manufacturer}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs font-mono text-foreground space-y-1">
                  <div className="font-semibold text-sky-500 flex items-center gap-1">
                    <FileCode className="h-3 w-3" /> Specification & BIM
                  </div>
                  <div>{mat.specs}</div>
                  <div className="text-muted-foreground pt-1">Format: {mat.bimFormat}</div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span>{mat.booth}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setSelectedMaterial(mat.name);
                      setSampleDrawerOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-sky-500/30 hover:bg-sky-500/10 text-foreground font-semibold min-h-[40px]"
                  >
                    <Package className="h-3.5 w-3.5 mr-1.5 text-sky-500" />
                    Order Sample
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-muted font-semibold min-h-[40px] px-3"
                    onClick={() => {
                      alert(`Downloading BIM CAD library for ${mat.name}`);
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Sample Kit Request Drawer */}
      <Drawer
        open={sampleDrawerOpen}
        onClose={() => {
          setSampleDrawerOpen(false);
          setSampleRequested(false);
        }}
        title="Physical Architectural Material Sample Dispatch"
        description="Receive verified physical sample swatches, structural test reports, and environmental product declarations (EPD)."
      >
        <div className="p-6 space-y-6">
          {sampleRequested ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-foreground">Sample Courier Order Created</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Your physical material request for <span className="font-semibold text-foreground">{selectedMaterial}</span> has been dispatched to the manufacturer booth. Delivery tracking will be delivered to your registered email.
                </p>
              </div>
              <Button
                onClick={() => {
                  setSampleDrawerOpen(false);
                  setSampleRequested(false);
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
                setSampleRequested(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Selected Material Specification
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedMaterial || ""}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/50 text-foreground font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Architect / Studio Accreditation
                </label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium">
                  <option>Licensed Principal Architect (IAI / AIA / RIBA)</option>
                  <option>Structural / MEP Consulting Engineer</option>
                  <option>Real Estate Developer & Procurement Director</option>
                  <option>Interior Designer / Spatial Planner</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Dispatch Address or Exhibition Pick-up
                </label>
                <input
                  type="text"
                  defaultValue="Pick up at IndoBuildTech Exhibition Hall 1 Sample Hub"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSampleDrawerOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-700 text-white font-semibold"
                >
                  Confirm Dispatch Request
                </Button>
              </div>
            </form>
          )}
        </div>
      </Drawer>
    </div>
  );
}
