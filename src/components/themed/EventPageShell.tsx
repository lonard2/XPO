"use client";

import * as React from "react";
import Link from "next/link";
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
  Clock,
  Building2,
  Shield,
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
import { formatDateRange, formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import { TicketCheckoutDrawer } from "@/components/tickets/TicketCheckoutDrawer";
import { cn } from "@/lib/utils";
import { type TicketTierItem } from "@/components/tickets/TierSelector";

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
}: EventPageShellProps) {
  const [isCopied, setIsCopied] = React.useState(false);
  const [scrolledPastHero, setScrolledPastHero] = React.useState(false);
  const [checkoutDrawerOpen, setCheckoutDrawerOpen] = React.useState(false);

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

  const handleScrollToTickets = () => {
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
      : "Free Admission";

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
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground/60" aria-hidden="true" />
            <Link href={`/${locale}/events`} className="hover:text-foreground transition-colors">
              Events
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pb-16 lg:pt-12">
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
              {tokens.name || archetypeMeta.label}
            </span>

            {isFeatured && (
              <Badge variant="warning" size="sm" className="font-semibold shadow-xs">
                Featured Event
              </Badge>
            )}

            <Badge variant="outline" size="sm" className="border-white/20 text-white/90 bg-white/5">
              <Layers className="h-3 w-3 mr-1 text-white/70" />
              {scale.replace("_", " ")}
            </Badge>

            <Badge variant="outline" size="sm" className="border-white/20 text-white/90 bg-white/5">
              <Globe className="h-3 w-3 mr-1 text-white/70" />
              {format.replace("_", " ")}
            </Badge>

            {resolvedBranding.heroBadge && (
              <Badge variant="archetype" size="sm">
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
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Dates</p>
                <p className="font-semibold text-white">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
              <MapPin className="h-5 w-5 text-[var(--archetype-accent)] shrink-0" aria-hidden="true" />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Venue & Location</p>
                <p className="font-semibold text-white truncate max-w-[180px]">
                  {venue.name}, {venue.city}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
              <Building2 className="h-5 w-5 text-[var(--archetype-accent)] shrink-0" aria-hidden="true" />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Hall / Wing</p>
                <p className="font-semibold text-white truncate max-w-[180px]">
                  {venue.hallName || "Main Exhibition Halls"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
              <Ticket className="h-5 w-5 text-[var(--archetype-accent)] shrink-0" aria-hidden="true" />
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Pass Starting From</p>
                <p className="font-bold text-white">{formattedPrice}</p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              variant="archetype"
              onClick={handleScrollToTickets}
              className="gap-2 font-semibold shadow-lg text-white"
            >
              <Ticket className="h-4 w-4" aria-hidden="true" />
              Reserve Passes & Tickets
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleShare}
              className="gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  Share Event
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* 3. Main Content Container for Specific Archetype View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>

      {/* 4. Sticky Mobile Action Drawer (<768px) */}
      <div
        className={cn(
          "fixed bottom-0 inset-x-0 z-40 md:hidden bg-card/95 backdrop-blur-md border-t border-border p-3 shadow-2xl transition-all duration-300",
          scrolledPastHero ? "translate-y-0 opacity-100" : "translate-y-0 opacity-100"
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
            onClick={handleScrollToTickets}
            className="shrink-0 font-semibold gap-1.5 shadow-md"
          >
            <Ticket className="h-4 w-4" />
            Book Pass
          </Button>
        </div>
      </div>

      {/* 5. Ticket Pass Checkout Drawer */}
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
