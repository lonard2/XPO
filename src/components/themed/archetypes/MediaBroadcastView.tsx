"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Video,
  Radio,
  Volume2,
  Tv,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Award,
  Users,
  Search,
  ArrowRight,
  Sliders,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { type ArchetypeViewProps } from "./IndustrialB2BView";

export function MediaBroadcastView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const t = useTranslations("archetypeViews.MEDIA_BROADCAST");
  const tCommon = useTranslations("archetypeViews.common");
  const [stageDrawerOpen, setStageDrawerOpen] = React.useState(false);
  const [selectedStage, setSelectedStage] = React.useState<string | null>(null);
  const [stageReserved, setStageReserved] = React.useState(false);

  // Broadcast Systems & Virtual Production Volumes
  const mediaStages = [
    {
      id: "med-01",
      name: "Ultra-Fine Pitch MicroLED Virtual Production Volume",
      provider: "Tokyo Pro-AV & Optical Systems",
      category: "In-Camera VFX & Virtual Production",
      specs: "1.5mm Pixel Pitch | 7,680Hz Refresh | Sub-Millisecond Gen-Lock",
      demoSlot: "Live Unreal Engine 5.6 Cam-Track Demo: Hourly",
      booth: "Hall 1 - Virtual Stage A",
      badge: "Broadcast Flagship",
    },
    {
      id: "med-02",
      name: "SMPTE ST 2110 IP Routing & Cloud Studio Hub",
      provider: "Global Broadcast Transmission Labs",
      category: "Uncompressed IP Live Video & Audio",
      specs: "100 Gbps Core Redundant Fabrics | NMOS IS-04/05 Discovery",
      demoSlot: "Low-Latency Remote OB Truck Shootout: 13:30",
      booth: "Hall 2 - Stand 210",
      badge: "IP Broadcast",
    },
    {
      id: "med-03",
      name: "Immersive Dolby Atmos Concert Sound Stage & Line-Array",
      provider: "Acoustic Engineering Nusantara",
      category: "Pro-Audio & Concert Sound Reinforcement",
      specs: "128 Audio Channels | 142 dB Peak SPL | Phase Linear Array",
      demoSlot: "Acoustic Tuning & Spatial Audio Shootout: 15:00",
      booth: "Hall 3 - Audio Arena",
      badge: "Spatial Audio",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Category Mission Statement */}
      <section className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/20 via-card to-background p-6 sm:p-8 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 border border-violet-500/20">
                <Video className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-violet-500">
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
                setSelectedStage("Ultra-Fine Pitch MicroLED Virtual Production Volume");
                setStageReserved(false);
                setStageDrawerOpen(true);
              }}
              size="lg"
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md min-h-[44px]"
            >
              <Radio className="h-4 w-4 mr-2" />
              {t("bookCta")}
            </Button>
            <div className="text-xs text-muted-foreground text-center lg:text-right">
              {t("accreditedNote")}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Broadcast Stages Showcase */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-500 uppercase tracking-wider mb-1">
            <Tv className="h-4 w-4" />
            <span>{t("stagesBadge")}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t("stagesTitle")}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mediaStages.map((stage) => (
            <Card key={stage.id} className="border-border/80 bg-card hover:border-violet-500/40 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-violet-500/30 text-violet-500 bg-violet-500/10 text-xs font-semibold">
                    {stage.badge}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-muted-foreground">{stage.category}</span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground leading-snug">{stage.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{stage.provider}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs font-mono text-foreground space-y-1">
                  <div className="font-semibold text-violet-500 flex items-center gap-1">
                    <Sliders className="h-3 w-3" /> {t("technicalSpecs")}
                  </div>
                  <div>{stage.specs}</div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span>{stage.booth}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Clock className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                    <span>{stage.demoSlot}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedStage(stage.name);
                    setStageReserved(false);
                    setStageDrawerOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full border-violet-500/30 hover:bg-violet-500/10 text-foreground font-semibold min-h-[40px]"
                >
                  <Video className="h-3.5 w-3.5 mr-1.5 text-violet-500" />
                  {t("reserveCta")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Stage Demo Reservation Drawer */}
      <Drawer
        open={stageDrawerOpen}
        onClose={() => setStageDrawerOpen(false)}
        title={t("drawerTitle")}
        description={t("drawerDescription")}
      >
        <div className="p-6 space-y-6">
          {stageReserved ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-foreground">{t("confirmedTitle")}</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {t("confirmedBody", { stage: selectedStage ?? "" })}
                </p>
              </div>
              <Button
                onClick={() => {
                  setStageDrawerOpen(false);
                  setStageReserved(false);
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
                setStageReserved(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {t("studioLabel")}
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedStage || ""}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/50 text-foreground font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {t("specialtyLabel")}
                </label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium">
                  <option>{t("specialtyOption1")}</option>
                  <option>{t("specialtyOption2")}</option>
                  <option>{t("specialtyOption3")}</option>
                  <option>{t("specialtyOption4")}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {t("accreditationLabel")}
                </label>
                <div className="p-3 rounded-lg border border-border/80 bg-muted/20 text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>{t("accreditationValue")}</span>
                  </div>
                  <p>{t("sessionNote")}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStageDrawerOpen(false)}
                >
                  {tCommon("cancelCta")}
                </Button>
                <Button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700 text-white font-semibold"
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
