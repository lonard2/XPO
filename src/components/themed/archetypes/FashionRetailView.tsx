"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
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
import { parseShowcase } from "@/lib/showcase";
import { ShowcaseProgramGrid } from "@/components/themed/ShowcaseProgramGrid";

export function FashionRetailView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const t = useTranslations("archetypeViews.FASHION_RETAIL");
  const [oemDrawerOpen, setOemDrawerOpen] = React.useState(false);
  const [selectedBrand, setSelectedBrand] = React.useState<string | null>(null);
  const [rfqSubmitted, setRfqSubmitted] = React.useState(false);

  // Organizer-authored showcase: sections render only with backing data.
  const showcase = React.useMemo(
    () => parseShowcase((event as any)?.showcaseJson),
    [event]
  );
  const showcasePrograms = showcase.programs.filter(
    (p) => p.kind === "runway" || p.kind === "generic"
  );

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
                setSelectedBrand("Bio-Clean Cosmetics & Skincare OEM");
                setOemDrawerOpen(true);
              }}
              size="lg"
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow-md min-h-[44px]"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {t("submitCta")}
            </Button>
            <div className="text-xs text-muted-foreground text-center lg:text-right">
              {t("verifiedNote")}
            </div>
          </div>
        </div>
      </section>

      {showcasePrograms.length > 0 && (
        <ShowcaseProgramGrid
          eyebrow={t("featuredEyebrow")}
          title={t("featuredTitle")}
          description={t("featuredDescription")}
          programs={showcasePrograms}
          locale={locale}
          stampedAt={showcase.attestedAt}
        />
      )}

      {/* 3. Cosmetics OEM & Buyer Drawer */}
      <Drawer
        open={oemDrawerOpen}
        onClose={() => {
          setOemDrawerOpen(false);
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
                <h4 className="text-lg font-bold text-foreground">{t("dispatchedTitle")}</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {t("dispatchedBody", { brand: selectedBrand })}
                </p>
              </div>
              <Button
                onClick={() => {
                  setOemDrawerOpen(false);
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
                  {t("brandLabel")}
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
                  {t("channelLabel")}
                </label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium">
                  <option>{t("channelOption1")}</option>
                  <option>{t("channelOption2")}</option>
                  <option>{t("channelOption3")}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {t("moqLabel")}
                </label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium">
                  <option>{t("moqOption1")}</option>
                  <option>{t("moqOption2")}</option>
                  <option>{t("moqOption3")}</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOemDrawerOpen(false)}
                >
                  {t("cancelCta")}
                </Button>
                <Button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700 text-white font-semibold"
                >
                  {t("submitBriefCta")}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Drawer>
    </div>
  );
}
