"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("archetypeViews.ENERGY_INFRASTRUCTURE");
  const tCommon = useTranslations("archetypeViews.common");
  const [auditDrawerOpen, setAuditDrawerOpen] = React.useState(false);
  const [selectedConcession, setSelectedConcession] = React.useState<string | null>(null);
  const [auditRequested, setAuditRequested] = React.useState(false);

  // Power and resource concessions exhibiting at this event
  const concessionBlocks = event.booths.map((booth) => ({
    id: booth.id,
    name: booth.companyName,
    operator: booth.hallName,
    type: booth.industry ?? "",
    capacity: booth.dimensions ?? "",
    esgRating: booth.boothType ?? "",
    booth: booth.boothNumber,
    status: booth.description ?? "",
  }));

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
                setSelectedConcession(event.booths[0]?.companyName ?? "");
                setAuditDrawerOpen(true);
              }}
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md min-h-[44px]"
            >
              <FileCheck2 className="h-4 w-4 mr-2" />
              {t("requestCta")}
            </Button>
            <div className="text-xs text-muted-foreground text-center lg:text-right">
              {t("verifiedNote")}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Grid Output & Telemetry Blocks */}
      {concessionBlocks.length > 0 && (
        <section className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
              <Activity className="h-4 w-4" />
              <span>{t("gridsBadge")}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {t("rosterTitle")}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {concessionBlocks.map((blk) => (
              <Card key={blk.id} className="border-border/80 bg-card hover:border-amber-500/40 transition-all shadow-xs flex flex-col justify-between">
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex items-center justify-between">
                    {blk.type && (
                      <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/10 text-xs font-semibold">
                        {blk.type}
                      </Badge>
                    )}
                    {blk.esgRating && (
                      <span className="text-xs font-mono font-bold text-emerald-500">{blk.esgRating}</span>
                    )}
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground leading-snug">{blk.name}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">{blk.operator}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  {blk.capacity && (
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs font-mono text-foreground space-y-1">
                      <div className="font-semibold text-amber-500 flex items-center gap-1">
                        <Zap className="h-3 w-3" /> {t("outputLabel")}
                      </div>
                      <div>{blk.capacity}</div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                      <span>{blk.booth}</span>
                    </div>
                    {blk.status && (
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <TrendingUp className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>{blk.status}</span>
                      </div>
                    )}
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
                    {t("prospectusCta")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 3. ESG & Grid Audit Drawer */}
      <Drawer
        open={auditDrawerOpen}
        onClose={() => {
          setAuditDrawerOpen(false);
          setAuditRequested(false);
        }}
        title={t("drawerTitle")}
        description={t("drawerDescription")}
      >
        <div className="p-6 space-y-6">
          {auditRequested ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-foreground">{t("grantedTitle")}</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {t("grantedBody", { concession: selectedConcession ?? "" })}
                </p>
              </div>
              <Button
                onClick={() => {
                  setAuditDrawerOpen(false);
                  setAuditRequested(false);
                }}
                className="mt-4"
              >
                {tCommon("doneCta")}
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
                  {t("blockLabel")}
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
                  {t("scopeLabel")}
                </label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium">
                  <option>{t("scopeOption1")}</option>
                  <option>{t("scopeOption2")}</option>
                  <option>{t("scopeOption3")}</option>
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
                  onClick={() => setAuditDrawerOpen(false)}
                >
                  {tCommon("cancelCta")}
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
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
