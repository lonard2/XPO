"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  TrendingUp,
  Lock,
  DollarSign,
  ShieldCheck,
  Briefcase,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  MapPin,
  Building,
  KeyRound,
  Ticket,
  ChevronRight,
  ExternalLink,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { DemonstrationBadge } from "@/components/themed/DemonstrationBadge";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import type { ArchetypeViewProps } from "./IndustrialB2BView";
import { submitMeetingRequest } from "@/lib/meetings/client";
import { parseShowcase } from "@/lib/showcase";
import { ShowcaseProgramGrid } from "@/components/themed/ShowcaseProgramGrid";

export function FinanceInvestorView({ event, locale = "en", onSelectTier, pageSize = "LARGE" }: ArchetypeViewProps) {
  const t = useTranslations("archetypeViews.FINANCE_INVESTOR");
  const tCommon = useTranslations("archetypeViews.common");
  const [dealRoomOpen, setDealRoomOpen] = React.useState(false);
  const [selectedDeal, setSelectedDeal] = React.useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = React.useState(false);
  const [bookingReference, setBookingReference] = React.useState<string | null>(null);
  const [bookingError, setBookingError] = React.useState<string | null>(null);
  const [bookingSending, setBookingSending] = React.useState(false);

  const handleDealSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBookingSending(true);
    setBookingError(null);
    try {
      const reference = await submitMeetingRequest({
        eventId: event.id,
        type: "DEAL_ROOM",
        requesterName: String(form.get("fund") || ""),
        requesterEmail: String(form.get("email") || ""),
        target: selectedDeal || t("dealRoomDefault"),
        slot: String(form.get("slot") || ""),
        message: `Horizon: ${String(form.get("horizon") || "")}. ${String(form.get("agenda") || "")}`,
      });
      setBookingReference(reference);
      setBookingConfirmed(true);
    } catch (err) {
      setBookingError((err as Error).message);
    } finally {
      setBookingSending(false);
    }
  };
  const [kycVerified, setKycVerified] = React.useState(false);

  const handleBookDealRoom = (dealName: string) => {
    setSelectedDeal(dealName);
    setBookingConfirmed(false);
    setDealRoomOpen(true);
  };

  // Organizer-authored showcase: sections render only with backing data.
  const showcase = React.useMemo(
    () => parseShowcase((event as any)?.showcaseJson),
    [event]
  );
  const showcasePrograms = showcase.programs.filter(
    (p) => p.kind === "pitch" || p.kind === "generic"
  );

  return (
    <div className="space-y-12">
      {/* 1. Institutional Investor & Sovereign Wealth Banner */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            <span>{t("heroBadge")}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            {t("heroTitle")}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {event.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            

            {pageSize !== "SMALL" && (
            <Button
              variant="outline"
              onClick={() => handleBookDealRoom("Sovereign Investor Deal Room 1")}
              className="gap-2 text-xs"
            >
              <Lock className="h-4 w-4 text-amber-500" />
              {t("dealCta")}
            </Button>
            )}
          </div>
        </div>

        {/* Encrypted Badge & Chatham House Protocol */}
        <Card className="border-border bg-card shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="success" size="sm" className="gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t("kycBadge")}
                </Badge>
                <DemonstrationBadge />
              </div>
              <Lock className="h-4 w-4 text-[var(--archetype-accent)]" />
            </div>
            <CardTitle className="text-base">{t("chathamTitle")}</CardTitle>
            <CardDescription className="text-xs">
              {t("chathamDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <div className="p-2.5 rounded-md bg-muted/40 border border-border/80 flex items-center justify-between">
              <span>{t("encryptedLabel")}</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {kycVerified ? t("kycVerifiedCode") : t("kycPendingCode")}
              </span>
            </div>
            {!kycVerified && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setKycVerified(true)}
                className="w-full text-xs gap-1.5"
              >
                <KeyRound className="h-3.5 w-3.5" />
                {t("verifyCta")}
              </Button>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 3. Plenary & Macroeconomic Roundtables */}
      {event.agendaItems.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Coins className="h-5 w-5 text-emerald-400" />
            {t("panelsTitle")}
          </h3>
          <div className="space-y-3">
            {event.agendaItems.map((agenda) => (
              <Card key={agenda.id} className="border-border hover:border-emerald-500/40 transition-colors">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" size="sm" className="font-mono text-xs font-semibold">
                        {agenda.track || t("defaultTrack")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{agenda.location}</span>
                    </div>
                    <h4 className="text-base font-bold text-foreground">{agenda.title}</h4>
                    {agenda.speakerName && (
                      <p className="text-xs text-muted-foreground">
                        {t("keynoteLabel")} <span className="font-semibold text-foreground">{agenda.speakerName}</span>{" "}
                        {agenda.speakerRole && `(${agenda.speakerRole})`}
                      </p>
                    )}
                  </div>
                  <div className="sm:text-right shrink-0">
                    <span className="inline-block px-2.5 py-1 rounded bg-muted font-mono text-xs font-semibold text-foreground">
                      {new Date(agenda.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                      {new Date(agenda.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {showcasePrograms.length > 0 && (
        <ShowcaseProgramGrid
          eyebrow={t("showcaseEyebrow")}
          title={t("showcaseTitle")}
          description={t("showcaseDesc")}
          programs={showcasePrograms}
          locale={locale}
          stampedAt={showcase.attestedAt}
        />
      )}

      {/* 4. Ticket Passes & Investor Credentials */}
      <section id="tickets-section" className="space-y-6 pt-4 border-t border-border">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-5 w-5 text-[var(--archetype-primary)]" />
            {t("credentialsTitle")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("credentialsDesc")}
          </p>
          <div className="mt-2">
            <DemonstrationBadge />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {event.ticketTiers.map((tier: any) => {
            const priceFormatted =
              tier.price > 0
                ? formatCurrency(tier.price, (tier.currency || "USD") as SupportedCurrency, locale)
                : t("complimentaryObserver");
            const tierBadge = tier.tier || (tier.name?.toLowerCase().includes("vip") ? "VIP" : t("standardTier"));

            return (
              <Card key={tier.id} className="border-border hover:border-emerald-500/50 transition-all flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={tierBadge === "VIP" ? "default" : "outline"} className="text-xs font-semibold">
                      {tierBadge}
                    </Badge>
                    <span className="text-lg font-bold text-foreground">{priceFormatted}</span>
                  </div>
                  <CardTitle className="text-lg mt-2">{tier.name}</CardTitle>
                  {tier.description && (
                    <CardDescription className="text-xs">{tier.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {tier.perks && tier.perks.length > 0 && (
                    <ul className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3">
                      {tier.perks.map((perk: string, i: number) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="pt-2">
                    <Button variant="archetype" className="w-full gap-2 font-semibold min-h-[44px] cursor-pointer">
                      <Ticket className="h-4 w-4" />
                      {t("selectTier", { tier: tier.name })}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Deal Room Drawer */}
      <Drawer
        isOpen={dealRoomOpen}
        onClose={() => setDealRoomOpen(false)}
        title={t("drawerTitle")}
        description={t("drawerDescription", { deal: selectedDeal ?? "" })}
      >
        {bookingConfirmed ? (
          <div className="py-12 text-center space-y-3 animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold text-foreground">{t("requestedTitle")}</h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              {t("requestedBody")}
              {bookingReference && (
                <span className="block mt-1 font-mono">
                  {tCommon("referenceLabel", { reference: bookingReference })}
                </span>
              )}
            </p>
          </div>
        ) : (
          <form onSubmit={handleDealSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">{tCommon("emailLabel")} *</label>
              <input
                required
                name="email"
                type="email"
                autoComplete="email"
                placeholder="partner@fund.com"
                className="w-full px-3 py-2 rounded bg-background border border-border focus:ring-1 focus:ring-primary min-h-[40px]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">{t("targetLabel")}</label>
              <input
                type="text"
                readOnly
                value={selectedDeal || t("dealRoomDefault")}
                className="w-full px-3 py-2 rounded bg-muted/50 border border-border text-muted-foreground font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">{t("fundLabel")} *</label>
              <input
                required
                name="fund"
                type="text"
                autoComplete="organization"
                placeholder={t("fundPlaceholder")}
                className="w-full px-3 py-2 rounded bg-background border border-border focus:ring-1 focus:ring-primary min-h-[40px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">{t("slotLabel")} *</label>
                <select name="slot" className="w-full px-3 py-2 rounded bg-background border border-border focus:ring-1 focus:ring-primary min-h-[40px]">
                  <option>{t("slotOption1")}</option>
                  <option>{t("slotOption2")}</option>
                  <option>{t("slotOption3")}</option>
                  <option>{t("slotOption4")}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">{t("horizonLabel")}</label>
                <select name="horizon" className="w-full px-3 py-2 rounded bg-background border border-border focus:ring-1 focus:ring-primary min-h-[40px]">
                  <option>{t("horizonOption1")}</option>
                  <option>{t("horizonOption2")}</option>
                  <option>{t("horizonOption3")}</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">{t("agendaLabel")}</label>
              <textarea
                name="agenda"
                rows={3}
                placeholder={t("agendaPlaceholder")}
                className="w-full px-3 py-2 rounded bg-background border border-border focus:ring-1 focus:ring-primary"
              />
            </div>
            {bookingError && (
              <p role="alert" className="text-xs text-destructive">
                {bookingError}
              </p>
            )}
            <div className="pt-2">
              <Button
                type="submit"
                variant="archetype"
                disabled={bookingSending}
                className="w-full gap-2 font-semibold min-h-[44px] cursor-pointer"
              >
                <Lock className="h-4 w-4" />
                {bookingSending ? t("submitting") : t("submitCta")}
              </Button>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
}
