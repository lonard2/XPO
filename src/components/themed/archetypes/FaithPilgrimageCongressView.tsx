"use client";

import * as React from "react";
import {
  Compass,
  Headphones,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  BookOpen,
  Award,
  Users,
  Search,
  ArrowRight,
  Globe2,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { type ArchetypeViewProps } from "./IndustrialB2BView";

export function FaithPilgrimageCongressView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [operatorDrawerOpen, setOperatorDrawerOpen] = React.useState(false);
  const [selectedOperator, setSelectedOperator] = React.useState<string | null>(null);
  const [licenseVerified, setLicenseVerified] = React.useState(false);

  // Pilgrimage Operators & Congress Sessions
  const pilgrimageOperators = [
    {
      id: "op-01",
      name: "Konsorsium Muassasa Nusantara Haji Khusus",
      license: "PPIU No. 892/2022 Kemenag RI",
      quota: "Verified Official Hajj Plus & Umrah Quota",
      services: "5-Star Makkah Clock Tower & Madinah Haram Corridors | Arabic-ID Guides",
      booth: "Hall 1 - Grand Plenary Pavilion",
      status: "Direct Booking Open",
    },
    {
      id: "op-02",
      name: "Global Halal Industry & Sharia Certification Board",
      license: "BPJPH Accredited International Halal Halver",
      quota: "Cross-Border Mutual Recognition Standards",
      services: "Food, Cosmetics & Logistics Halal Assurance System Audits",
      booth: "Hall 2 - Standards Pavilion 205",
      status: "Certification Consultation Desk",
    },
    {
      id: "op-03",
      name: "International Clerical & Community Interfaith Council",
      license: "Official Assembly Credential",
      quota: "Multi-Language Simultaneous Interpretation",
      services: "Channels: Ch 1 (Arabic), Ch 2 (Indonesian), Ch 3 (English), Ch 4 (Urdu)",
      booth: "Plenary Arena Auditorium",
      status: "Plenary Keynotes Daily",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Category Mission Statement */}
      <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-card to-background p-6 sm:p-8 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Compass className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                Faith, Pilgrimage & Community Congress
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Pilgrimage Services, Accredited Halal Standards & Plenary Assemblies
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Verify licensed Hajj and Umrah travel operators, access simultaneous multi-language interpretation audio feeds for plenary congress addresses, and audit global Halal compliance standards.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Button
              onClick={() => {
                setSelectedOperator("Konsorsium Muassasa Nusantara Haji Khusus");
                setLicenseVerified(false);
                setOperatorDrawerOpen(true);
              }}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md min-h-[44px]"
            >
              <FileCheck2 className="h-4 w-4 mr-2" />
              Verify Operator Accreditation
            </Button>
            <div className="text-xs text-muted-foreground text-center lg:text-right">
              Official Ministry of Religious Affairs synchronized registry
            </div>
          </div>
        </div>
      </section>

      {/* 2. Plenary Interpretation Channels */}
      <section className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <Headphones className="h-5 w-5 text-emerald-500" />
            <div>
              <h3 className="text-base font-bold text-foreground">Congress Simultaneous Interpretation Channels</h3>
              <p className="text-xs text-muted-foreground">Plug in headphones or connect to venue audio broadcast</p>
            </div>
          </div>
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10 text-xs self-start sm:self-auto font-mono">
            Arena Wi-Fi Audio Active
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { ch: "CH 1", lang: "العربية (Arabic)", voice: "Original Keynote" },
            { ch: "CH 2", lang: "Bahasa Indonesia", voice: "Live Interpretation" },
            { ch: "CH 3", lang: "English", voice: "Live Interpretation" },
            { ch: "CH 4", lang: "اردو (Urdu)", voice: "Live Interpretation" },
          ].map((item) => (
            <div key={item.ch} className="p-3 rounded-lg border border-border/60 bg-muted/30 text-xs space-y-1">
              <span className="font-mono font-bold text-emerald-500 block">{item.ch}</span>
              <span className="font-semibold text-foreground block">{item.lang}</span>
              <span className="text-muted-foreground text-[11px] block">{item.voice}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Operator Directory */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>Accredited Operators</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Official Pilgrimage Services & Halal Boards
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pilgrimageOperators.map((op) => (
            <Card key={op.id} className="border-border/80 bg-card hover:border-emerald-500/40 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10 text-xs font-semibold">
                    {op.license}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-foreground leading-snug">{op.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{op.quota}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs font-mono text-foreground space-y-1">
                  <div className="font-semibold text-emerald-500 flex items-center gap-1">
                    <Compass className="h-3 w-3" /> Services & Logistics
                  </div>
                  <div>{op.services}</div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span>{op.booth}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Clock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{op.status}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedOperator(op.name);
                    setLicenseVerified(false);
                    setOperatorDrawerOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full border-emerald-500/30 hover:bg-emerald-500/10 text-foreground font-semibold min-h-[40px]"
                >
                  <FileCheck2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                  Verify Official License
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Operator Verification Drawer */}
      <Drawer
        open={operatorDrawerOpen}
        onClose={() => setOperatorDrawerOpen(false)}
        title="Official Pilgrimage Operator & Halal Verification"
        description="Verify government regulatory licensing, Muassasa quota guarantees, and financial escrow compliance."
      >
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Selected Pilgrimage / Halal Operator
              </label>
              <input
                type="text"
                readOnly
                value={selectedOperator || ""}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/50 text-foreground font-medium"
              />
            </div>

            <Button
              onClick={() => setLicenseVerified(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              Verify Against SISKOPATUH Ministry Registry
            </Button>
          </div>

          {licenseVerified && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-500">MINISTRY STATUS: ACCREDITED GRADE A</span>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10 text-xs">
                  Escrow Protected
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block text-[11px]">Official License #</span>
                  <span className="font-semibold text-foreground">PPIU-892/Kemenag/2022</span>
                </div>
                <div className="p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block text-[11px]">Audit Track Record</span>
                  <span className="font-semibold text-emerald-500">100% Zero Visa Stranding</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                All attendee booking payments are protected under statutory Islamic banking escrow guarantees.
              </p>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
