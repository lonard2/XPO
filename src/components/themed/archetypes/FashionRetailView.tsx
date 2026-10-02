"use client";

import * as React from "react";
import {
  Sparkles,
  ShoppingBag,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Search,
  Layers,
  Award,
  ArrowRight,
  Eye,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { type ArchetypeViewProps } from "./IndustrialB2BView";

export function FashionRetailView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [oemDrawerOpen, setOemDrawerOpen] = React.useState(false);
  const [selectedBrand, setSelectedBrand] = React.useState<string | null>(null);
  const [rfqSubmitted, setRfqSubmitted] = React.useState(false);

  // Runway Premieres & Luxury Showroom Roster
  const runwaySchedule = [
    {
      id: "run-01",
      designer: "Atelier Nusantara Couture SS26",
      origin: "Jakarta, Indonesia",
      category: "Sustainable Heritage Silk & Modern Batik",
      slot: "Catwalk Stage 1: Today @ 15:30",
      seats: "Front Row VIP Reserved",
      booth: "Hall 1 - VIP Catwalk Pavilion",
    },
    {
      id: "run-02",
      designer: "Ginza Minimalist Outerwear Lab",
      origin: "Tokyo, Japan",
      category: "Technical Waterproof Fabrics & Tailored Coats",
      slot: "Catwalk Stage 2: Tomorrow @ 13:00",
      seats: "Buyer Seating Available",
      booth: "Hall 2 - Designer Row 204",
    },
    {
      id: "run-03",
      designer: "Bio-Clean Cosmetics & Skincare OEM",
      origin: "Seoul & Paris Laboratories",
      category: "Fermented Peptides, SPF50+ & Vegan Lip Care",
      slot: "Showroom Live Formulation: 11:00 & 16:00",
      seats: "OEM Buyer Consultation Active",
      booth: "Hall 3 - Cosmetics Pavilion 312",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Category Mission Statement */}
      <section className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-950/20 via-card to-background p-6 sm:p-8 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500 border border-pink-500/20">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-pink-500">
                Fashion, Beauty & Luxury Retail Expo
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Catwalk Premieres, Cosmetics OEM & Wholesale Showrooms
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Experience live designer runway collections, submit private-label cosmetics formulation briefs, and negotiate wholesale buyer price sheets with accredited fashion houses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Button
              onClick={() => {
                setSelectedBrand("Bio-Clean Cosmetics & Skincare OEM");
                setOemDrawerOpen(true);
              }}
              size="lg"
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow-md min-h-[44px]"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Submit Cosmetics OEM Brief
            </Button>
            <div className="text-xs text-muted-foreground text-center lg:text-right">
              Verified retail buyers & private-label brands
            </div>
          </div>
        </div>
      </section>

      {/* 2. Runway Timetable & Luxury Showrooms */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-pink-500 uppercase tracking-wider mb-1">
            <Eye className="h-4 w-4" />
            <span>Runway Catwalks</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Featured Collections & Live Presentations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {runwaySchedule.map((run) => (
            <Card key={run.id} className="border-border/80 bg-card hover:border-pink-500/40 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-pink-500/30 text-pink-500 bg-pink-500/10 text-xs font-semibold">
                    {run.origin}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-muted-foreground">{run.seats}</span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground leading-snug">{run.designer}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{run.category}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span>{run.booth}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Clock className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                    <span>{run.slot}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedBrand(run.designer);
                    setOemDrawerOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full border-pink-500/30 hover:bg-pink-500/10 text-foreground font-semibold min-h-[40px]"
                >
                  <ShoppingBag className="h-3.5 w-3.5 mr-1.5 text-pink-500" />
                  Access Wholesale Lookbook
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Cosmetics OEM & Buyer Drawer */}
      <Drawer
        open={oemDrawerOpen}
        onClose={() => {
          setOemDrawerOpen(false);
          setRfqSubmitted(false);
        }}
        title="Cosmetics OEM & Wholesale Procurement Hub"
        description="Submit private-label formulation briefs or request minimum order quantity (MOQ) wholesale pricing."
      >
        <div className="p-6 space-y-6">
          {rfqSubmitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-foreground">OEM Inquiry Dispatched</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Your manufacturing brief for <span className="font-semibold text-foreground">{selectedBrand}</span> has been securely transmitted. Sample formulation kits will be prepared for collection at VIP Showroom A.
                </p>
              </div>
              <Button
                onClick={() => {
                  setOemDrawerOpen(false);
                  setRfqSubmitted(false);
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
                setRfqSubmitted(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Design House / OEM Manufacturer
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedBrand || ""}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/50 text-foreground font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Procurement Channel
                </label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium">
                  <option>Private Label Cosmetics Contract Manufacturing</option>
                  <option>Luxury Ready-to-Wear Wholesale Boutique Order</option>
                  <option>Textile & Fabric Sourcing Tender</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Target Minimum Order Quantity (MOQ)
                </label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium">
                  <option>Small Batch / Pilot (500 - 2,000 units)</option>
                  <option>Commercial Production (5,000 - 25,000 units)</option>
                  <option>Enterprise Retail Distribution (50,000+ units)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOemDrawerOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700 text-white font-semibold"
                >
                  Submit Brief
                </Button>
              </div>
            </form>
          )}
        </div>
      </Drawer>
    </div>
  );
}
