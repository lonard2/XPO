"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Plane,
  Building2,
  CalendarCheck,
  Compass,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Globe2,
  Users,
  Award,
  ArrowRight,
  Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { type ArchetypeViewProps } from "./IndustrialB2BView";
import { submitMeetingRequest } from "@/lib/meetings/client";

export function HospitalityTourismView({ event, locale = "en", onSelectTier, pageSize = "LARGE" }: ArchetypeViewProps) {
  const t = useTranslations("archetypeViews.HOSPITALITY_TOURISM");
  const [buyerDrawerOpen, setBuyerDrawerOpen] = React.useState(false);
  const [selectedPavilion, setSelectedPavilion] = React.useState<string | null>(null);
  const [appointmentBooked, setAppointmentBooked] = React.useState(false);
  const [appointmentReference, setAppointmentReference] = React.useState<string | null>(null);
  const [appointmentError, setAppointmentError] = React.useState<string | null>(null);
  const [appointmentSending, setAppointmentSending] = React.useState(false);

  const handleAppointmentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setAppointmentSending(true);
    setAppointmentError(null);
    try {
      const reference = await submitMeetingRequest({
        eventId: event.id,
        type: "BUYER_APPOINTMENT",
        requesterName: String(form.get("name") || ""),
        requesterEmail: String(form.get("email") || ""),
        target: selectedPavilion || "Hosted buyer session",
        message: String(form.get("category") || ""),
      });
      setAppointmentReference(reference);
      setAppointmentBooked(true);
    } catch (err) {
      setAppointmentError((err as Error).message);
    } finally {
      setAppointmentSending(false);
    }
  };

  // Tourism Pavilions & Hospitality Procurement Hub
  const destinationPavilions = [
    {
      id: "dest-01",
      name: "Wonderful Indonesia Luxury Archipelago Pavilion",
      region: "Southeast Asia",
      highlights: "Komodo & Raja Ampat Luxury Charters | Bali Wellness Resorts",
      buyers: "45 Hosted Buyers Active",
      booth: "Hall 1 - Central Pavilion",
      sessions: "1-on-1 Buyer Sessions Every 20 Mins",
    },
    {
      id: "dest-02",
      name: "Japan National Tourism Organization (JNTO) Hub",
      region: "East Asia",
      highlights: "Kanto High-Speed Rail Corridors | Hokkaido Ski Chalets",
      buyers: "38 Hosted Buyers Active",
      booth: "Hall 2 - Pavilion 201",
      sessions: "Incentive Travel Planning Lounge",
    },
    {
      id: "dest-03",
      name: "Global Airline Alliances & MICE Booking Corridor",
      region: "International",
      highlights: "Direct Group Fare Contracts | Convention Air Credits",
      buyers: "50+ Airline Key Accounts",
      booth: "Hall 3 - Aviation Concourse",
      sessions: "Fleet Contract Consultations",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Category Mission Statement */}
      <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 via-card to-background p-6 sm:p-8 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                <Plane className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">
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
                setSelectedPavilion("Wonderful Indonesia Luxury Archipelago Pavilion");
                setBuyerDrawerOpen(true);
              }}
              size="lg"
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold shadow-md min-h-[44px]"
            >
              <CalendarCheck className="h-4 w-4 mr-2" />
              {t("scheduleCta")}
            </Button>
            <div className="text-xs text-muted-foreground text-center lg:text-right">
              {t("qualifiedNote")}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Destination Pavilions & Matchmaking Hub */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-500 uppercase tracking-wider mb-1">
            <Globe2 className="h-4 w-4" />
            <span>{t("showcasesBadge")}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t("showcasesTitle")}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {destinationPavilions.map((dest) => (
            <Card key={dest.id} className="border-border/80 bg-card hover:border-cyan-500/40 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-cyan-500/30 text-cyan-500 bg-cyan-500/10 text-xs font-semibold">
                    {dest.region}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-muted-foreground">{dest.buyers}</span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground leading-snug">{dest.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{dest.highlights}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span>{dest.booth}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Clock className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                    <span>{dest.sessions}</span>
                  </div>
                </div>

                {pageSize !== "SMALL" && (
                <Button
                  onClick={() => {
                    setSelectedPavilion(dest.name);
                    setBuyerDrawerOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full border-cyan-500/30 hover:bg-cyan-500/10 text-foreground font-semibold min-h-[40px]"
                >
                  <Handshake className="h-3.5 w-3.5 mr-1.5 text-cyan-500" />
                  {t("requestCta")}
                </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Hosted Buyer Matchmaking Drawer */}
      <Drawer
        open={buyerDrawerOpen}
        onClose={() => {
          setBuyerDrawerOpen(false);
          setAppointmentBooked(false);
        }}
        title={t("drawerTitle")}
        description={t("drawerDescription")}
      >
        <div className="p-6 space-y-6">
          {appointmentBooked ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-foreground">{t("requestedTitle")}</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {t("requestedBody", { pavilion: selectedPavilion ?? "" })}
                  {appointmentReference && (
                    <span className="block mt-1 font-mono">
                      {t("referenceLabel", { reference: appointmentReference })}
                    </span>
                  )}
                </p>
              </div>
              <Button
                onClick={() => {
                  setBuyerDrawerOpen(false);
                  setAppointmentBooked(false);
                }}
                className="mt-4"
              >
                {t("doneCta")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleAppointmentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    {t("nameLabel")} *
                  </label>
                  <input
                    required
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder={t("namePlaceholder")}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    {t("emailLabel")} *
                  </label>
                  <input
                    required
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium min-h-[44px]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {t("pavilionLabel")}
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedPavilion || ""}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/50 text-foreground font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {t("categoryLabel")}
                </label>
                <select name="category" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium">
                  <option>{t("categoryOption1")}</option>
                  <option>{t("categoryOption2")}</option>
                  <option>{t("categoryOption3")}</option>
                  <option>{t("categoryOption4")}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {t("credentialLabel")}
                </label>
                <div className="p-3 rounded-lg border border-border/80 bg-muted/20 text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>{t("credentialValue")}</span>
                  </div>
                  <p>{t("credentialNote")}</p>
                </div>
              </div>

              {appointmentError && (
                <p role="alert" className="text-xs text-destructive">
                  {appointmentError}
                </p>
              )}
              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBuyerDrawerOpen(false)}
                >
                  {t("cancelCta")}
                </Button>
                <Button
                  type="submit"
                  disabled={appointmentSending}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
                >
                  {appointmentSending ? t("sendingCta") : t("submitCta")}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Drawer>
    </div>
  );
}
