"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Store,
  DollarSign,
  Calculator,
  Percent,
  TrendingUp,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Award,
  Users,
  Search,
  ArrowRight,
  Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { type ArchetypeViewProps } from "./IndustrialB2BView";

export function FranchiseLicensingView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const t = useTranslations("archetypeViews.FRANCHISE_LICENSING");
  const [calcDrawerOpen, setCalcDrawerOpen] = React.useState(false);
  const [selectedBrand, setSelectedBrand] = React.useState<string | null>(null);
  const [investBudget, setInvestBudget] = React.useState("500000000");
  const [calcDone, setCalcDone] = React.useState(false);

  // Franchise Brand Directory & SME Investment Hub
  const franchiseBrands = [
    {
      id: "fran-01",
      name: "Kopi Nusantara Roasters (Drive-Thru & Cafe)",
      origin: "Jakarta, Indonesia",
      industry: "F&B Specialty Coffee",
      initialCapital: "Rp 350M - 600M",
      payback: "12 - 16 Months Projected",
      royalty: "4% Net Sales",
      booth: "Hall 1 - Franchise Row 102",
      activeUnits: "240+ Outlets Nationwide",
    },
    {
      id: "fran-02",
      name: "Tokyo Bento Express & Cloud Kitchen Hub",
      origin: "Tokyo, Japan",
      industry: "Quick-Service Restaurant (QSR)",
      initialCapital: "¥8,000,000 - 15,000,000",
      payback: "14 - 18 Months Projected",
      royalty: "5% Master License",
      booth: "Hall 2 - Booth 204",
      activeUnits: "85 Outlets in East Asia",
    },
    {
      id: "fran-03",
      name: "Smart 24/7 Automated Fitness & Wellness Box",
      origin: "Singapore & Global",
      industry: "Boutique Fitness & IoT Health",
      initialCapital: "$75,000 - $120,000 USD",
      payback: "10 - 14 Months Projected",
      royalty: "Fixed Tech Subscription",
      booth: "Hall 3 - Booth 315",
      activeUnits: "120 Units Regionally",
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
                <Store className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
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
                setSelectedBrand("Kopi Nusantara Roasters (Drive-Thru & Cafe)");
                setCalcDone(false);
                setCalcDrawerOpen(true);
              }}
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md min-h-[44px]"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {t("roiCta")}
            </Button>
            <div className="text-xs text-muted-foreground text-center lg:text-right">
              {t("verifiedNote")}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Franchise Brands Directory */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
            <TrendingUp className="h-4 w-4" />
            <span>{t("conceptsBadge")}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t("conceptsTitle")}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {franchiseBrands.map((brand) => (
            <Card key={brand.id} className="border-border/80 bg-card hover:border-amber-500/40 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/10 text-xs font-semibold">
                    {brand.industry}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-muted-foreground">{brand.origin}</span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground leading-snug">{brand.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{brand.activeUnits}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs font-mono text-foreground space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("initialCapital")}</span>
                    <span className="font-semibold text-foreground">{brand.initialCapital}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("payback")}</span>
                    <span className="font-semibold text-emerald-500">{brand.payback}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("royalty")}</span>
                    <span className="font-semibold text-foreground">{brand.royalty}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span>{brand.booth}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedBrand(brand.name);
                    setCalcDone(false);
                    setCalcDrawerOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full border-amber-500/30 hover:bg-amber-500/10 text-foreground font-semibold min-h-[40px]"
                >
                  <Handshake className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                  {t("discoveryCta")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Franchise ROI Calculator Drawer */}
      <Drawer
        open={calcDrawerOpen}
        onClose={() => setCalcDrawerOpen(false)}
        title={t("drawerTitle")}
        description={t("drawerDescription")}
      >
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                {t("conceptLabel")}
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
                {t("budgetLabel")}
              </label>
              <input
                type="text"
                value={investBudget}
                onChange={(e) => setInvestBudget(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                {t("formatLabel")}
              </label>
              <select className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium">
                <option>{t("formatOption1")}</option>
                <option>{t("formatOption2")}</option>
                <option>{t("formatOption3")}</option>
                <option>{t("formatOption4")}</option>
              </select>
            </div>

            <Button
              onClick={() => setCalcDone(true)}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              {t("simulateCta")}
            </Button>
          </div>

          {calcDone && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-500">{t("reportTitle")}</span>
                <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/10 text-xs">
                  {t("afiVerified")}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block text-[11px]">{t("breakEvenLabel")}</span>
                  <span className="font-semibold text-emerald-500">{t("breakEvenValue")}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block text-[11px]">{t("marginLabel")}</span>
                  <span className="font-semibold text-foreground">62.5%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block text-[11px]">{t("cashflowLabel")}</span>
                  <span className="font-semibold text-foreground">{t("cashflowValue")}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block text-[11px]">{t("territoryLabel")}</span>
                  <span className="font-semibold text-emerald-500">{t("territoryValue")}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {t("visitNote")}
              </p>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
