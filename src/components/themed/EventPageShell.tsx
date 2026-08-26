"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Calendar,
  MapPin,
  Sparkles,
  Ticket,
  Share2,
  Check,
  ChevronRight,
  Globe,
  Layers,
  Building2,
  Clock,
  Map as MapIcon,
  ShieldCheck,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  type MiceArchetype,
  type BrandingConfig,
  getArchetypeTokens,
  getArchetypeCssVariables,
  parseBrandingConfig,
  ARCHETYPE_METAS,
} from "@/lib/theming";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatDateRange, formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import { TicketCheckoutDrawer } from "@/components/tickets/TicketCheckoutDrawer";
import { type TicketTierItem } from "@/components/tickets/TierSelector";
import { HallFloorMap, type BoothItem } from "@/components/perks/HallFloorMap";
import { InteractiveGuidebook, type AgendaSessionItem } from "@/components/perks/InteractiveGuidebook";
import { cn } from "@/lib/utils";

export interface EventVenueData {
  id?: string;
  name: string;
  slug: string;
  city: string;
  address?: string;
  hallName?: string | null;
}

export interface EventPageShellProps {
  id: string;
  title: string;
  slug: string;
  tagline?: string | null;
  description?: string;
  archetype: MiceArchetype | string;
  startDate: Date | string;
  endDate: Date | string;
  venue: EventVenueData;
  heroImageUrl?: string | null;
  brandingConfigJson?: string | null;
  brandingConfig?: BrandingConfig | null;
  scale?: string;
  format?: string;
  isFeatured?: boolean;
  minTicketPrice?: number;
  currency?: string;
  locale?: string;
  children: React.ReactNode;
  onBookPassClick?: () => void;
  ticketTiers?: TicketTierItem[];
  agendaItems?: AgendaSessionItem[];
  booths?: BoothItem[];
}

export function EventPageShell({
  id,
  title,
  slug,
  tagline,
  description,
  archetype,
  startDate,
  endDate,
  venue,
  heroImageUrl,
  brandingConfigJson,
  brandingConfig,
  scale = "LARGE",
  format = "IN_PERSON",
  isFeatured = false,
  minTicketPrice = 0,
  currency = "IDR",
  locale = "en",
  children,
  onBookPassClick,
  ticketTiers = [],
  agendaItems = [],
  booths = [],
}: EventPageShellProps) {
  const [isCopied, setIsCopied] = React.useState(false);
  const [scrolledPastHero, setScrolledPastHero] = React.useState(false);
  const [checkoutDrawerOpen, setCheckoutDrawerOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"overview" | "agenda" | "floorMap" | "tickets">("overview");

  const tEvents = useTranslations("events");
  const tCommon = useTranslations("common");
  const tArch = useTranslations("archetypes");
  const tPerks = useTranslations("perks");
  const tTickets = useTranslations("tickets");

  // Parse branding override if provided as JSON string
  const resolvedBranding: BrandingConfig = React.useMemo(() => {
    if (brandingConfig) return brandingConfig;
    if (brandingConfigJson) return parseBrandingConfig(brandingConfigJson);
    return {};
  }, [brandingConfig, brandingConfigJson]);

  const safeArchetype = (archetype as MiceArchetype) || "INDUSTRIAL_B2B";
  const tokens = getArchetypeTokens(safeArchetype, resolvedBranding);
  const cssVariables = getArchetypeCssVariables(safeArchetype, resolvedBranding);
  const archetypeMeta = ARCHETYPE_METAS[safeArchetype] || ARCHETYPE_METAS.INDUSTRIAL_B2B;

  // Track scroll for sticky mobile action visibility
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setScrolledPastHero(true);
      } else {
        setScrolledPastHero(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        if (navigator.share) {
          await navigator.share({
            title: title,
            text: tagline || description || title,
            url: window.location.href,
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        }
      } catch {
        // Fallback clipboard write
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    }
  };

  const handleOpenCheckout = () => {
    if (onBookPassClick) {
      onBookPassClick();
      return;
    }
    if (ticketTiers && ticketTiers.length > 0) {
      setCheckoutDrawerOpen(true);
      return;
    }
    const ticketSection = document.getElementById("tickets-section");
    if (ticketSection) {
      ticketSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formattedDate = formatDateRange(startDate, endDate, locale);
  const formattedPrice =
    minTicketPrice > 0
      ? formatCurrency(minTicketPrice, (currency as SupportedCurrency) || "IDR", locale)
      : tEvents("freeAdmission") || "Free Admission";

  let archetypeDisplayTitle = tokens.name || archetypeMeta.label;
  try {
    if (tArch && typeof tArch.raw === "function") {
      const obj = tArch.raw(safeArchetype);
      if (obj?.title) archetypeDisplayTitle = obj.title;
    }
  } catch {
    // fallback
  }

  return (
    <div
      id="event-page-root"
      className={cn("min-h-screen text-foreground transition-colors duration-300", tokens.fontFamily)}
      style={cssVariables as React.CSSProperties}
    >
      {/* 1. Breadcrumb Bar */}
      <div className="border-b border-border/40 bg-muted/20 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <nav className="flex items-center space-x-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href={`/${locale}`} className="hover:text-foreground transition-colors">
              {tCommon("explore") || "Home"}
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" aria-hidden="true" />
            <Link href={`/${locale}/events`} className="hover:text-foreground transition-colors">
              {tEvents("title")?.split("&")?.[0]?.trim() || "Events"}
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" aria-hidden="true" />
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-md" aria-current="page">
              {title}
            </span>
          </nav>
        </div>
      </div>

      {/* 2. Archetype Hero Banner */}
      <header className="relative overflow-hidden border-b border-[var(--archetype-border)] bg-[var(--archetype-bg)] text-white">
        {/* Dynamic Background Image & Ambient Gradients */}
        <div className="absolute inset-0 z-0">
          {heroImageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
              style={{
                backgroundImage: `url(${heroImageUrl})`,
                opacity: resolvedBranding.bannerOverlayOpacity ?? 0.28,
              }}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${tokens.primary}40, transparent 70%), radial-gradient(ellipse 60% 40% at 90% 80%, ${tokens.accent}30, transparent 60%)`,
              }}
            />
          )}
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--archetype-bg)] via-[var(--archetype-bg)]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pb-14 lg:pt-12">
          {/* Top Badges & Archetype Indicator */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border shadow-xs"
              style={{
                backgroundColor: `${tokens.primary}25`,
                borderColor: `${tokens.primary}60`,
                color: "#ffffff",
              }}
            >
              <Sparkles className="h-3.5 w-3.5 text-[var(--archetype-accent)]" aria-hidden="true" />
              {archetypeDisplayTitle}
            </span>

            {isFeatured && (
              <Badge variant="warning" size="sm" className="font-semibold shadow-xs">
                {tEvents("featured") || "Featured Event"}
              </Badge>
            )}

            <Badge variant="outline" size="sm" className="border-white/20 text-white/90 bg-white/5 font-semibold">
              <Layers className="h-3 w-3 mr-1 text-white/70" />
              {scale.replace("_", " ")}
            </Badge>

            <Badge variant="outline" size="sm" className="border-white/20 text-white/90 bg-white/5 font-semibold">
              <Globe className="h-3 w-3 mr-1 text-white/70" />
              {format.replace("_", " ")}
            </Badge>

            {resolvedBranding.heroBadge && (
              <Badge variant="archetype" size="sm" className="font-semibold">
                {resolvedBranding.heroBadge}
              </Badge>
            )}
          </div>

          {/* Title & Tagline */}
          <div className="max-w-4xl space-y-3">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-xs">
              {title}
            </h1>
            {tagline && (
              <p className="text-sm sm:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl">
                {tagline}
              </p>
            )}
          </div>

          {/* Key Event Metadata Strip */}
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm text-slate-200">
            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
              <Calendar className="h-5 w-5 text-[var(--archetype-accent)] shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{tCommon("date") || "Dates"}</p>
                <p className="font-semibold text-white">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
              <MapPin className="h-5 w-5 text-[var(--archetype-accent)] shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{tCommon("venue") || "Venue & Location"}</p>
                <p className="font-semibold text-white truncate max-w-[180px]">
                  {venue.name}, {venue.city}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
              <Building2 className="h-5 w-5 text-[var(--archetype-accent)] shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Hall / Wing</p>
                <p className="font-semibold text-white truncate max-w-[180px]">
                  {venue.hallName || "Main Exhibition Halls"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
              <Ticket className="h-5 w-5 text-[var(--archetype-accent)] shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{tEvents("priceFrom") || "Pass Starting From"}</p>
                <p className="font-bold text-white">{formattedPrice}</p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              variant="archetype"
              onClick={handleOpenCheckout}
              className="gap-2 font-semibold shadow-lg text-white cursor-pointer min-h-[44px]"
            >
              <Ticket className="h-4 w-4" aria-hidden="true" />
              {tEvents("reservePasses") || "Reserve Passes & Tickets"}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleShare}
              className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white cursor-pointer min-h-[44px]"
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  {tEvents("linkCopied") || "Link Copied!"}
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  {tEvents("shareEvent") || "Share Event"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 3. Sub-Navigation Tabs Bar */}
        <div className="border-t border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none" aria-label="Event Sections">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[40px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                  activeTab === "overview"
                    ? "bg-white/20 text-white shadow-xs border border-white/30"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                )}
                aria-current={activeTab === "overview" ? "page" : undefined}
              >
                <Layers className="h-4 w-4" />
                <span>{tEvents("overview") || "Overview"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("agenda")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[40px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                  activeTab === "agenda"
                    ? "bg-white/20 text-white shadow-xs border border-white/30"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                )}
                aria-current={activeTab === "agenda" ? "page" : undefined}
              >
                <Clock className="h-4 w-4" />
                <span>{tEvents("agenda") || "Agenda & Timetable"}</span>
                {agendaItems.length > 0 && (
                  <span className="flex h-5 px-1.5 items-center justify-center rounded-full bg-white/20 text-xs font-mono">
                    {agendaItems.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("floorMap")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[40px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                  activeTab === "floorMap"
                    ? "bg-white/20 text-white shadow-xs border border-white/30"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                )}
                aria-current={activeTab === "floorMap" ? "page" : undefined}
              >
                <MapIcon className="h-4 w-4" />
                <span>{tEvents("floorMap") || "Floor Map & Halls"}</span>
                {booths.length > 0 && (
                  <span className="flex h-5 px-1.5 items-center justify-center rounded-full bg-white/20 text-xs font-mono">
                    {booths.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("tickets")}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[40px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                  activeTab === "tickets"
                    ? "bg-white/20 text-white shadow-xs border border-white/30"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                )}
                aria-current={activeTab === "tickets" ? "page" : undefined}
              >
                <Ticket className="h-4 w-4" />
                <span>{tEvents("tickets") || "Ticket Passes"}</span>
                {ticketTiers.length > 0 && (
                  <span className="flex h-5 px-1.5 items-center justify-center rounded-full bg-white/20 text-xs font-mono">
                    {ticketTiers.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* 4. Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-28 md:pb-16 space-y-12">
        {/* Tab 1: Overview & Archetype Specialized View */}
        {activeTab === "overview" && (
          <div className="space-y-12">
            {children}

            {/* In-page Pass Tiers Section */}
            {ticketTiers && ticketTiers.length > 0 && (
              <section id="tickets-section" className="space-y-6 pt-6 border-t border-border/80">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                      <Ticket className="h-4 w-4" />
                      <span>{tTickets("ticketTiers") || "Pass Tiers"}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      {tTickets("checkoutTitle") || "Select Your Admission Tier"}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      {tTickets("digitalPassSubtitle") || "Cryptographically verified QR passes issued immediately upon reservation."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ticketTiers.map((tier) => {
                    const priceFormatted =
                      tier.price > 0
                        ? formatCurrency(tier.price, (tier.currency || currency) as SupportedCurrency, locale)
                        : tCommon("free") || "Free Admission";

                    const isSoldOut = tier.capacity > 0 && tier.issuedCount >= tier.capacity;

                    return (
                      <Card
                        key={tier.id}
                        className={cn(
                          "flex flex-col justify-between border-border/80 bg-card p-5 sm:p-6 transition-all duration-300 shadow-sm",
                          isSoldOut
                            ? "opacity-60 grayscale-[40%]"
                            : "hover:border-primary/50 hover:shadow-md"
                        )}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Badge
                                variant={tier.tier === "VIP" ? "default" : tier.tier === "EXHIBITOR" ? "secondary" : "outline"}
                                className="text-xs font-bold uppercase mb-2"
                              >
                                {tier.tier}
                              </Badge>
                              <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
                            </div>
                            <span className="text-lg font-extrabold text-foreground">{priceFormatted}</span>
                          </div>

                          {tier.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed">{tier.description}</p>
                          )}

                          {tier.perks && tier.perks.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-border/60">
                              <span className="text-xs font-semibold text-foreground block">
                                {tTickets("benefits") || "Included Benefits"}:
                              </span>
                              <ul className="space-y-1.5 text-xs text-muted-foreground">
                                {tier.perks.map((perk, idx) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                                    <span>{perk}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="pt-6 mt-4 border-t border-border/60">
                          <Button
                            variant={tier.tier === "VIP" ? "default" : "outline"}
                            className="w-full font-semibold gap-2 min-h-[44px] cursor-pointer"
                            disabled={isSoldOut}
                            onClick={handleOpenCheckout}
                          >
                            <Ticket className="h-4 w-4" />
                            <span>{isSoldOut ? "Sold Out" : tTickets("bookPass") || "Book Pass"}</span>
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Tab 2: Agenda & Timetable Guidebook */}
        {activeTab === "agenda" && (
          <div className="space-y-6">
            <InteractiveGuidebook
              agendaItems={agendaItems}
              eventTitle={title}
              locale={locale}
            />
          </div>
        )}

        {/* Tab 3: Floor Map & Booths */}
        {activeTab === "floorMap" && (
          <div className="space-y-6">
            <HallFloorMap
              booths={booths}
              venueName={venue.name}
              hallName={venue.hallName}
              locale={locale}
            />
          </div>
        )}

        {/* Tab 4: Passes & Ticket Selection */}
        {activeTab === "tickets" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/80 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                  <Ticket className="h-4 w-4" />
                  <span>{tTickets("ticketTiers") || "Pass Tiers"}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {tTickets("checkoutTitle") || "Select Your Admission Tier"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {tTickets("digitalPassSubtitle") || "Cryptographically verified QR passes issued immediately upon reservation."}
                </p>
              </div>
            </div>

            {ticketTiers && ticketTiers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ticketTiers.map((tier) => {
                  const priceFormatted =
                    tier.price > 0
                      ? formatCurrency(tier.price, (tier.currency || currency) as SupportedCurrency, locale)
                      : tCommon("free") || "Free Admission";

                  const isSoldOut = tier.capacity > 0 && tier.issuedCount >= tier.capacity;

                  return (
                    <Card
                      key={tier.id}
                      className={cn(
                        "flex flex-col justify-between border-border/80 bg-card p-5 sm:p-6 transition-all duration-300 shadow-sm",
                        isSoldOut
                          ? "opacity-60 grayscale-[40%]"
                          : "hover:border-primary/50 hover:shadow-md"
                      )}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Badge
                              variant={tier.tier === "VIP" ? "default" : tier.tier === "EXHIBITOR" ? "secondary" : "outline"}
                              className="text-xs font-bold uppercase mb-2"
                            >
                              {tier.tier}
                            </Badge>
                            <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
                          </div>
                          <span className="text-lg font-extrabold text-foreground">{priceFormatted}</span>
                        </div>

                        {tier.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">{tier.description}</p>
                        )}

                        {tier.perks && tier.perks.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-border/60">
                            <span className="text-xs font-semibold text-foreground block">
                              {tTickets("benefits") || "Included Benefits"}:
                            </span>
                            <ul className="space-y-1.5 text-xs text-muted-foreground">
                              {tier.perks.map((perk, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                                  <span>{perk}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="pt-6 mt-4 border-t border-border/60">
                        <Button
                          variant={tier.tier === "VIP" ? "default" : "outline"}
                          className="w-full font-semibold gap-2 min-h-[44px] cursor-pointer"
                          disabled={isSoldOut}
                          onClick={handleOpenCheckout}
                        >
                          <Ticket className="h-4 w-4" />
                          <span>{isSoldOut ? "Sold Out" : tTickets("bookPass") || "Book Pass"}</span>
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl border border-dashed border-border text-muted-foreground">
                <p className="text-sm">Pass details are currently being finalized by the event organizer.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 5. Sticky Mobile Action Drawer (<768px) */}
      <div
        className={cn(
          "fixed bottom-0 inset-x-0 z-40 md:hidden bg-card/95 backdrop-blur-md border-t border-border p-3 shadow-2xl transition-all duration-300"
        )}
      >
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground truncate">{title}</p>
            <p className="text-sm font-bold text-foreground">{formattedPrice}</p>
          </div>
          <Button
            size="default"
            variant="archetype"
            onClick={handleOpenCheckout}
            className="shrink-0 font-semibold gap-1.5 shadow-md min-h-[44px] cursor-pointer"
          >
            <Ticket className="h-4 w-4" />
            {tEvents("bookPass") || "Book Pass"}
          </Button>
        </div>
      </div>

      {/* 6. Ticket Pass Checkout Drawer */}
      {ticketTiers && ticketTiers.length > 0 && (
        <TicketCheckoutDrawer
          isOpen={checkoutDrawerOpen}
          onClose={() => setCheckoutDrawerOpen(false)}
          locale={locale}
          event={{
            id,
            title,
            slug,
            startDate,
            endDate,
            venue: {
              name: venue.name,
              city: venue.city,
              hallName: venue.hallName,
            },
            ticketTiers,
          }}
        />
      )}
    </div>
  );
}
