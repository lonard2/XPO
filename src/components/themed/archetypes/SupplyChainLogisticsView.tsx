"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Truck,
  Boxes,
  Container,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Award,
  Users,
  Search,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { type ArchetypeViewProps } from "./IndustrialB2BView";

export function SupplyChainLogisticsView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const t = useTranslations("archetypeViews.SUPPLY_CHAIN_LOGISTICS");
  const [rfqDrawerOpen, setRfqDrawerOpen] = React.useState(false);
  const [selectedRoute, setSelectedRoute] = React.useState<string | null>(null);
  const [rfqSubmitted, setRfqSubmitted] = React.useState(false);

  // Logistics Systems & Fleet Demonstrations
  const logisticsSystems = [
    {
      id: "log-01",
      name: "High-Speed Pallet AGV & Autonomous Sorting Fleet",
      provider: "PT Nusantara LogisRobotics",
      category: "Intralogistics & Warehouse Robotics",
      specs: "Throughput: 3,500 picks/hour | Fleet: 50 AMRs | Zero Infrastructure Grid",
      demoSlot: "Live Sortation Arena: Hourly on the half-hour",
      booth: "Hall 1 - Arena 105",
      coverage: "National Distribution Centers",
    },
    {
      id: "log-02",
      name: "Multimodal Southeast Asia Cross-Border Freight Corridor",
      provider: "Kanto Maritime & Air Cargo Logistics",
      category: "Freight Forwarding & Customs Fast-Track",
      specs: "Transit: Jakarta - Tokyo in 4 Days (Ocean) / 8 Hours (Air) | AEO Customs",
      demoSlot: "Freight Rate Negotiation Desk: Open Daily",
      booth: "Hall 2 - Booth 218",
      coverage: "Tokyo Big Sight to Tanjung Priok",
    },
    {
      id: "log-03",
      name: "Ultra-Cold Pharmaceutical & Vaccine Cold-Chain Corridor",
      provider: "Global PharmaLogix Network",
      category: "Cold-Chain Logistics & Life Sciences",
      specs: "-80°C Cryogenic to +4°C Monitored | GDP & WHO Pre-Qualified",
      demoSlot: "Cold Container Telemetry Walkthrough: 11:00 & 15:00",
      booth: "Hall 3 - Booth 310",
      coverage: "Global Air & Maritime Corridors",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Category Mission Statement */}
      <section className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-950/20 via-card to-background p-6 sm:p-8 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500 border border-teal-500/20">
                <Truck className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-500">
                {t("heroBadge")}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {t("heroTitle")}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("heroDescription")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Button
              onClick={() => {
                setSelectedRoute("Multimodal Southeast Asia Cross-Border Freight Corridor");
                setRfqDrawerOpen(true);
              }}
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md min-h-[44px]"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {t("rfpCta")}
            </Button>
            <div className="text-xs text-muted-foreground text-center lg:text-right">
              {t("verifiedNote")}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Logistics Showcase */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-500 uppercase tracking-wider mb-1">
            <Boxes className="h-4 w-4" />
            <span>{t("corridorsBadge")}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t("corridorsTitle")}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {logisticsSystems.map((sys) => (
            <Card key={sys.id} className="border-border/80 bg-card hover:border-teal-500/40 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-teal-500/30 text-teal-500 bg-teal-500/10 text-xs font-semibold">
                    {sys.category}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-muted-foreground">{sys.coverage}</span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground leading-snug">{sys.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{sys.provider}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs font-mono text-foreground space-y-1">
                  <div className="font-semibold text-teal-500 flex items-center gap-1">
                    <Cpu className="h-3 w-3" /> {t("fleetLabel")}
                  </div>
                  <div>{sys.specs}</div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span>{sys.booth}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Clock className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                    <span>{sys.demoSlot}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedRoute(sys.name);
                    setRfqDrawerOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full border-teal-500/30 hover:bg-teal-500/10 text-foreground font-semibold min-h-[40px]"
                >
                  <Container className="h-3.5 w-3.5 mr-1.5 text-teal-500" />
                  {t("tenderCta")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Freight RFP Drawer */}
      <Drawer
        open={rfqDrawerOpen}
        onClose={() => {
          setRfqDrawerOpen(false);
          setRfqSubmitted(false);
        }}
        title={t("drawerTitle")}
        description={t("drawerDescription")}
      >
        <div className="p-6 space-y-6">
          {rfqSubmitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-foreground">{t("transmittedTitle")}</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {t("transmittedBody", { route: selectedRoute ?? "" })}
                </p>
              </div>
              <Button
                onClick={() => {
                  setRfqDrawerOpen(false);
                  setRfqSubmitted(false);
                }}
                className="mt-4"
              >
                {t("doneCta")}
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
                  {t("targetLabel")}
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedRoute || ""}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/50 text-foreground font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {t("volumeLabel")}
                </label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium">
                  <option>{t("volumeOption1")}</option>
                  <option>{t("volumeOption2")}</option>
                  <option>{t("volumeOption3")}</option>
                  <option>{t("volumeOption4")}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {t("complianceLabel")}
                </label>
                <div className="p-3 rounded-lg border border-border/80 bg-muted/20 text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>{t("complianceValue")}</span>
                  </div>
                  <p>{t("complianceNote")}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRfqDrawerOpen(false)}
                >
                  {t("cancelCta")}
                </Button>
                <Button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                >
                  {t("confirmCta")}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Drawer>
    </div>
  );
}
