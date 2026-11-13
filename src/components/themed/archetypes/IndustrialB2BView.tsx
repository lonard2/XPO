"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Factory,
  FileText,
  Clock,
  MapPin,
  Send,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  DollarSign,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Award,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import { parseShowcase } from "@/lib/showcase";
import { submitMeetingRequest } from "@/lib/meetings/client";
import { ShowcaseProgramGrid } from "@/components/themed/ShowcaseProgramGrid";

export interface ArchetypeViewProps {
  event: {
    id: string;
    title: string;
    description: string;
    scale: string;
    format: string;
    startDate: Date | string;
    endDate: Date | string;
    venue: {
      name: string;
      city: string;
      address: string;
      transitInfo?: string;
    };
    venueHall?: {
      name: string;
      capacity?: number | null;
      floorAreaSqm?: number | null;
    } | null;
    ticketTiers: Array<{
      id: string;
      name: string;
      price: number;
      currency: string;
      capacity: number;
      soldCount: number;
      benefitsJson: string;
    }>;
    agendaItems: Array<{
      id: string;
      title: string;
      speakerName?: string | null;
      speakerRole?: string | null;
      location: string;
      startTime: Date | string;
      endTime: Date | string;
      track?: string | null;
    }>;
    booths: Array<{
      id: string;
      companyName: string;
      boothNumber: string;
      hallName: string;
      industry?: string | null;
      websiteUrl?: string | null;
      logoUrl?: string | null;
      description?: string | null;
      dimensions?: string | null;
      areaSqm?: number | null;
      boothType?: string | null;
    }>;
    perks: Array<{
      id: string;
      title: string;
      description: string;
      tierRequired?: string | null;
      iconName: string;
    }>;
  };
  locale?: string;
  onSelectTier?: (tierId: string) => void;
  /** Explicit presentation tier; meeting drawers and showcase channels hide on SMALL. */
  pageSize?: "LARGE" | "MEDIUM" | "SMALL";
}

export function IndustrialB2BView({ event, locale = "en", onSelectTier, pageSize = "LARGE" }: ArchetypeViewProps) {
  const t = useTranslations("archetypeViews.INDUSTRIAL_B2B");
  const tCommon = useTranslations("archetypeViews.common");
  const [rfqDrawerOpen, setRfqDrawerOpen] = React.useState(false);
  const [selectedBooth, setSelectedBooth] = React.useState<string | null>(null);
  const [rfqSubmitted, setRfqSubmitted] = React.useState(false);
  const [rfqReference, setRfqReference] = React.useState<string | null>(null);
  const [rfqError, setRfqError] = React.useState<string | null>(null);
  const [rfqSending, setRfqSending] = React.useState(false);

  const [boothSearch, setBoothSearch] = React.useState("");
  const [selectedIndustry, setSelectedIndustry] = React.useState("ALL");


  // Unique industries
  const industries = ["ALL", ...Array.from(new Set(event.booths.map((b) => b.industry || t("generalIndustry"))))];

  const filteredBooths = event.booths.filter((booth) => {
    const matchesSearch =
      booth.companyName.toLowerCase().includes(boothSearch.toLowerCase()) ||
      booth.boothNumber.toLowerCase().includes(boothSearch.toLowerCase()) ||
      (booth.description && booth.description.toLowerCase().includes(boothSearch.toLowerCase()));
    const matchesIndustry = selectedIndustry === "ALL" || booth.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const handleOpenRfq = (companyName?: string) => {
    setSelectedBooth(companyName || null);
    setRfqSubmitted(false);
    setRfqDrawerOpen(true);
  };

  const handleRfqSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setRfqSending(true);
    setRfqError(null);
    try {
      const reference = await submitMeetingRequest({
        eventId: event.id,
        type: "RFQ",
        requesterName: String(form.get("company") || ""),
        requesterEmail: String(form.get("email") || ""),
        target: selectedBooth || t("targetDefault"),
        slot: String(form.get("quantity") || ""),
        message: String(form.get("specs") || ""),
      });
      setRfqReference(reference);
      setRfqSubmitted(true);
    } catch (err) {
      setRfqError((err as Error).message);
    } finally {
      setRfqSending(false);
    }
  };

  // Slot booking needs an identity to reply to, so it opens the request drawer
  // for that booth instead of recording an anonymous inquiry.
  const handleBookSlot = (companyName: string) => {
    handleOpenRfq(companyName);
  };

  // Organizer-authored showcase: sections render only with backing data.
  const showcase = React.useMemo(
    () => parseShowcase((event as any)?.showcaseJson),
    [event]
  );
  const showcasePrograms = showcase.programs.filter(
    (p) => p.kind === "demo" || p.kind === "generic"
  );

  return (
    <div className="space-y-12">
      {/* 1. Industrial Domain Header Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--archetype-primary)]">
            <Factory className="h-5 w-5" aria-hidden="true" />
            <span>{t("heroBadge")}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t("heroTitle")}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            {event.description}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {pageSize !== "SMALL" && (
            <Button
              variant="archetype"
              onClick={() => handleOpenRfq()}
              className="gap-2 font-semibold shadow-md"
            >
              <FileText className="h-4 w-4" />
              {t("rfqCta")}
            </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                const el = document.getElementById("exhibitor-directory");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              {event.booths.length === 1
                ? t("browseCtaOne")
                : t("browseCta", { count: event.booths.length })}
            </Button>
          </div>
        </div>

        {/* Industrial Highlights Card */}
        <Card className="bg-card border-border/80 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--archetype-primary)]" />
              {t("dealRoomTitle")}
            </CardTitle>
            <CardDescription className="text-xs">
              {t("dealRoomDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{t("highlight1")}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{t("highlight2")}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{t("highlight3")}</span>
            </div>
          </CardContent>
        </Card>
      </section>

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

      {/* 3. Exhibitor & Booth Directory with RFQ triggers */}
      <section id="exhibitor-directory" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Building className="h-5 w-5 text-[var(--archetype-primary)]" />
              {t("directoryTitle", { count: filteredBooths.length })}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("directoryDesc")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={boothSearch}
                onChange={(e) => setBoothSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary min-h-[38px]"
              />
            </div>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary min-h-[38px]"
              aria-label={t("filterAria")}
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind === "ALL" ? t("filterAll") : ind}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooths.map((booth) => (
            <Card key={booth.id} className="border-border/80 hover:shadow-md transition-shadow">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="archetype" size="sm" className="font-mono text-xs font-semibold">
                    {booth.boothNumber}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{booth.hallName}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {booth.logoUrl && (
                    <img
                      src={booth.logoUrl}
                      alt=""
                      loading="lazy"
                      className="h-8 w-8 rounded object-contain bg-muted/40 shrink-0"
                    />
                  )}
                  <CardTitle className="text-base">{booth.companyName}</CardTitle>
                </div>
                {booth.industry && (
                  <p className="text-xs text-[var(--archetype-primary)] font-medium">{booth.industry}</p>
                )}
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-3 text-xs">
                {booth.description && (
                  <p className="text-muted-foreground line-clamp-2">{booth.description}</p>
                )}
                {(booth.dimensions || typeof booth.areaSqm === "number" || booth.boothType) && (
                  <div className="flex flex-wrap gap-1.5">
                    {booth.dimensions && (
                      <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                        {booth.dimensions}
                      </Badge>
                    )}
                    {typeof booth.areaSqm === "number" && (
                      <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                        {booth.areaSqm} m²
                      </Badge>
                    )}
                    {booth.boothType && (
                      <Badge variant="outline" size="sm" className="text-[10px]">
                        {booth.boothType.replace(/_/g, " ")}
                      </Badge>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenRfq(booth.companyName)}
                    className="h-8 text-xs gap-1.5 min-h-[36px] cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {t("requestRfq")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBookSlot(booth.companyName)}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {t("bookSlot")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </section>

      {/* 4. Technical Demos & Workshop Schedule */}
      {event.agendaItems.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--archetype-primary)]" />
            {t("demosTitle")}
          </h3>
          <div className="space-y-3">
            {event.agendaItems.map((agenda) => (
              <div
                key={agenda.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-card border border-border/70 hover:border-border transition-colors gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" size="sm">
                      {agenda.track || t("defaultTrack")}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                      <MapPin className="h-3 w-3" />
                      {agenda.location}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-foreground">{agenda.title}</h4>
                  {agenda.speakerName && (
                    <p className="text-xs text-muted-foreground">
                      {t("demonstratorLabel")} <span className="font-medium text-foreground">{agenda.speakerName}</span>{" "}
                      {agenda.speakerRole && `(${agenda.speakerRole})`}
                    </p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground sm:text-right shrink-0">
                  <p className="font-mono font-medium text-foreground">
                    {new Date(agenda.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                    {new Date(agenda.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Ticket Tiers & B2B Trade Pass Selection */}
      <section id="tickets-section" className="space-y-6 pt-4 border-t border-border">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-5 w-5 text-[var(--archetype-primary)]" />
            {t("tradePassesTitle")}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("tradePassesDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {event.ticketTiers.map((tier) => {
            let benefits: string[] = [];
            try {
              benefits = JSON.parse(tier.benefitsJson);
            } catch {
              benefits = ["Full exhibition floor access", "Official event guide & badge"];
            }

            return (
              <Card key={tier.id} className="flex flex-col border-border/80 hover:border-primary transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <Badge variant="secondary" size="sm">
                      {tier.capacity - tier.soldCount === 1
                        ? t("passesLeftOne")
                        : t("passesLeft", { count: tier.capacity - tier.soldCount })}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-foreground">
                      {tier.price > 0
                        ? formatCurrency(tier.price, (tier.currency as SupportedCurrency) || "IDR", locale)
                        : t("complimentary")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 mt-auto">
                    <Button
                      variant="archetype"
                      className="w-full gap-2 font-semibold"
                      onClick={() => onSelectTier?.(tier.id)}
                    >
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

      {/* RFQ Tender Drawer */}
      <Drawer
        isOpen={rfqDrawerOpen}
        onClose={() => setRfqDrawerOpen(false)}
        title={t("drawerTitle")}
        description={
          selectedBooth
            ? t("drawerDescDirect", { booth: selectedBooth })
            : t("drawerDescBroadcast")
        }
      >
        {rfqSubmitted ? (
          <div className="py-12 text-center space-y-3 animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold text-foreground">{t("rfqSubmittedTitle")}</h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              {t("rfqSubmittedBody")}
              {rfqReference && (
                <span className="block mt-1 font-mono">
                  {tCommon("referenceLabel", { reference: rfqReference })}
                </span>
              )}
            </p>
          </div>
        ) : (
          <form onSubmit={handleRfqSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">{t("targetLabel")}</label>
              <input
                type="text"
                readOnly
                value={selectedBooth || t("targetDefault")}
                className="w-full px-3 py-2 text-xs rounded-md bg-muted/50 border border-border text-muted-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">{t("companyLabel")} *</label>
                <input
                  required
                  name="company"
                  type="text"
                  autoComplete="organization"
                  placeholder={t("companyPlaceholder")}
                  className="w-full px-3 py-2 text-xs rounded-md bg-background border border-border focus:ring-1 focus:ring-primary min-h-[40px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">{t("quantityLabel")} *</label>
                <input
                  required
                  name="quantity"
                  type="text"
                  placeholder={t("quantityPlaceholder")}
                  className="w-full px-3 py-2 text-xs rounded-md bg-background border border-border focus:ring-1 focus:ring-primary min-h-[40px]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">{tCommon("emailLabel")} *</label>
              <input
                required
                name="email"
                type="email"
                autoComplete="email"
                placeholder="procurement@company.com"
                className="w-full px-3 py-2 text-xs rounded-md bg-background border border-border focus:ring-1 focus:ring-primary min-h-[40px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">{t("specsLabel")} *</label>
              <textarea
                required
                name="specs"
                rows={4}
                placeholder={t("specsPlaceholder")}
                className="w-full px-3 py-2 text-xs rounded-md bg-background border border-border focus:ring-1 focus:ring-primary"
              />
            </div>
            {rfqError && (
              <p role="alert" className="text-xs text-destructive">
                {rfqError}
              </p>
            )}
            <div className="pt-2">
              <Button
                type="submit"
                variant="archetype"
                disabled={rfqSending}
                className="w-full gap-2 min-h-[44px] cursor-pointer"
              >
                <Send className="h-4 w-4" />
                {rfqSending ? t("submitting") : t("submitCta")}
              </Button>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
}
