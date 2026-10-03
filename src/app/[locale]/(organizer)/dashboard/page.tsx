import * as React from "react";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import {
  Users,
  CreditCard,
  CheckCircle2,
  Store,
  PlusCircle,
  QrCode,
  TrendingUp,
  Activity,
  AlertCircle,
  RotateCw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import { OrganizerOnboardingGuide } from "@/components/organizer/OrganizerOnboardingGuide";
import { OrganizerEventsRoster } from "@/components/organizer/OrganizerEventsRoster";

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function OrganizerDashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tOrg = await getTranslations({ locale, namespace: "organizer" });
  const tCom = await getTranslations({ locale, namespace: "common" });

  // Query events from Prisma with related bookings, tiers, booths, and venue
  let events: any[] = [];
  let allBooths: any[] = [];
  let dbError = false;

  try {
    events = await db.event.findMany({
      include: {
        ticketTiers: true,
        booths: true,
        bookings: {
          include: {
            ticketTier: true,
          },
        },
        venue: true,
        venueHall: true,
      },
      orderBy: { startDate: "asc" },
    });

    allBooths = await db.boothTenant.findMany();
  } catch (error) {
    console.error("Dashboard DB query error:", error);
    dbError = true;
  }

  // P0-1: Diagnostic error state recovery if database is unreachable
  if (dbError) {
    return (
      <div className="space-y-6 animate-fade-in p-2 sm:p-4" role="alert">
        <Card className="p-8 sm:p-12 border-destructive/40 bg-destructive/5 text-center space-y-5 shadow-xs rounded-3xl">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Exhibition Operations Data Unavailable
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Unable to establish a secure connection to the event operations database. Your event records, booth allocations, and check-in rosters remain safe in storage.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href={`/${locale}/dashboard`}
              className={cn(
                buttonVariants({ variant: "primary", size: "sm" }),
                "text-xs gap-2 cursor-pointer min-h-[44px] px-5"
              )}
            >
              <RotateCw className="h-4 w-4" />
              <span>Retry Connection</span>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // P1-1: Classify events and determine live exhibition context
  const now = new Date();
  const liveEvents = events.filter((ev) => {
    const start = new Date(ev.startDate);
    const end = new Date(ev.endDate);
    return now >= start && now <= end;
  });
  const upcomingEvents = events.filter((ev) => new Date(ev.startDate) > now);

  // Default active event to pre-select for fast action scanner
  const activeEvent = liveEvents[0] || upcomingEvents[0] || events[0];

  // Calculate Aggregated Metrics
  const totalRegistrations = events.reduce((acc, ev) => acc + (ev.bookings?.length || 0), 0);
  const totalCheckedIn = events.reduce(
    (acc, ev) => acc + (ev.bookings?.filter((b: any) => b.status === "CHECKED_IN").length || 0),
    0
  );
  const checkInRate = totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0;

  // Calculate gross ticket revenue grouped by currency across all bookings
  const revenueByCurrency: Record<string, number> = {};
  for (const ev of events) {
    const fallbackCurrency = ev.regionId === "jp" ? "JPY" : ev.regionId === "global" ? "USD" : "IDR";
    for (const b of ev.bookings || []) {
      const curr = b.ticketTier?.currency || fallbackCurrency;
      const price = b.ticketTier?.price || 0;
      revenueByCurrency[curr] = (revenueByCurrency[curr] || 0) + price;
    }
  }

  // P1-2: Japanese Locale & Regional Currency Detection
  const isJapan = locale === "ja" || locale === "jp";
  const regionCurrency = isJapan ? "JPY" : locale === "en" ? "USD" : "IDR";
  const revenueCurrencies = Object.keys(revenueByCurrency);
  const primaryCurrency = (revenueCurrencies.includes(regionCurrency)
    ? regionCurrency
    : (revenueCurrencies[0] || regionCurrency)) as SupportedCurrency;

  const totalBooths = allBooths.length;
  const occupiedBooths = allBooths.filter((b: any) => b.companyName && b.companyName.trim() !== "").length;
  const boothOccupancy = totalBooths > 0 ? Math.round((occupiedBooths / totalBooths) * 100) : 0;

  const currentFreshnessTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header & Fast Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {tOrg("portalBadge") || "Organizer Portal"}
            </span>
            <Badge variant="secondary" size="sm" className="font-semibold">
              <Activity className="h-3 w-3 mr-1 text-emerald-500 animate-pulse" />
              {tOrg("dashboardTitle") || "Live Operations"}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1 text-balance">
            {tOrg("dashboardTitle") || "Organizer Operations Dashboard"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-pretty">
            {tOrg("dashboardSubtitle") || "Monitor real-time attendee registrations, gross ticket volume, gate check-in rate, and exhibitor booths."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href={activeEvent ? `/${locale}/scanner?eventId=${activeEvent.id}` : `/${locale}/scanner`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5 min-h-[44px] sm:min-h-[36px] text-xs cursor-pointer px-3.5"
            )}
          >
            <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{tOrg("doorScanner") || "Door Scanner"}</span>
          </Link>
          <Link
            href={`/${locale}/events/new`}
            className={cn(
              buttonVariants({ variant: "primary", size: "sm" }),
              "gap-1.5 min-h-[44px] sm:min-h-[36px] text-xs shadow-sm cursor-pointer px-3.5"
            )}
          >
            <PlusCircle className="h-4 w-4" />
            <span>{tOrg("launchNewEvent") || "Launch New Event"}</span>
          </Link>
        </div>
      </div>

      {/* METRIC KPI STAT CARDS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-medium text-muted-foreground">
            Live Metrics • Data as of <span className="tabular-nums">{currentFreshnessTime}</span>
          </span>
          <span className="text-xs text-muted-foreground font-mono tabular-nums">
            {events.length} active {events.length === 1 ? "exhibition" : "exhibitions"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Registrations */}
          <Card className="p-5 border-border/80 bg-card hover:border-primary/60 transition-all shadow-xs rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{tOrg("kpiTickets") || "Total Registrations"}</span>
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-foreground tabular-nums">
                {totalRegistrations.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{tCom("attendees") || "delegates"}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>{totalRegistrations > 0 ? "Active ticket sales" : "Ready for registration"}</span>
              </div>
            </div>
          </Card>

          {/* Card 2: Gross Ticket Revenue */}
          <Card className="p-5 border-border/80 bg-card hover:border-primary/60 transition-all shadow-xs rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{tOrg("kpiRevenue") || "Gross Ticket Revenue"}</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-foreground truncate tabular-nums">
                {formatCurrency(revenueByCurrency[primaryCurrency] || 0, primaryCurrency, locale)}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                {revenueCurrencies.filter((c) => c !== primaryCurrency).map((c) => (
                  <span key={c} className="inline-flex items-center font-medium text-foreground bg-muted/80 px-1.5 py-0.5 rounded text-xs tabular-nums">
                    + {formatCurrency(revenueByCurrency[c], c as SupportedCurrency, locale)}
                  </span>
                ))}
                <span>{tOrg("acrossExhibitions", { count: events.length }) || `Across ${events.length} active exhibitions`}</span>
              </div>
            </div>
          </Card>

          {/* Card 3: Overall Gate Check-In Rate */}
          <Card className="p-5 border-border/80 bg-card hover:border-primary/60 transition-all shadow-xs rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Overall Gate Check-In Rate</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-foreground tabular-nums">
                {checkInRate}%{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  ({totalCheckedIn.toLocaleString()} of {totalRegistrations.toLocaleString()} admitted)
                </span>
              </div>
              <div
                className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden"
                role="progressbar"
                aria-label="Overall Gate Check-In Rate"
                aria-valuenow={checkInRate}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={`${checkInRate}% (${totalCheckedIn} of ${totalRegistrations} delegates admitted)`}
              >
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.max(checkInRate, totalRegistrations > 0 ? 4 : 0)}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Card 4: Booth Occupancy */}
          <Card className="p-5 border-border/80 bg-card hover:border-primary/60 transition-all shadow-xs rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{tOrg("kpiOccupancy") || "Booth Occupancy Rate"}</span>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Store className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-foreground tabular-nums">
                {totalBooths > 0 ? `${boothOccupancy}%` : "0%"}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {tOrg("boothsUnitsCount", { occupied: occupiedBooths, total: totalBooths }) || `(${occupiedBooths}/${totalBooths} units)`}
                </span>
              </div>
              <div
                className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden"
                role="progressbar"
                aria-label={tOrg("kpiOccupancy") || "Booth Occupancy Rate"}
                aria-valuenow={boothOccupancy}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={`${boothOccupancy}% (${occupiedBooths} of ${totalBooths} units occupied)`}
              >
                <div
                  className="bg-purple-500 h-full rounded-full transition-all"
                  style={{ width: `${boothOccupancy}%` }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ONBOARDING & ROADMAP GUIDE */}
      <OrganizerOnboardingGuide
        locale={locale}
        hasEvents={events.length > 0}
        hasTickets={totalRegistrations > 0}
        hasBooths={totalBooths > 0}
        totalEvents={events.length}
      />

      {/* ACTIVE EVENTS ROSTER WITH TABS & STRETCHED LINK CARDS */}
      <OrganizerEventsRoster events={events} locale={locale} />
    </div>
  );
}
