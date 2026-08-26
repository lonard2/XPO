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
  Palette,
  QrCode,
  Sparkles,
  ExternalLink,
  Calendar,
  Building2,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Layers,
  Activity,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDateRange } from "@/lib/i18n/formatters";
import { getArchetypeTokens } from "@/lib/theming";

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
  let allBookings: any[] = [];
  let allBooths: any[] = [];

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

    allBookings = await db.booking.findMany({
      include: {
        ticketTier: true,
        event: {
          include: {
            venue: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    allBooths = await db.boothTenant.findMany();
  } catch (error) {
    console.error("Dashboard DB query error:", error);
  }

  // Calculate Aggregated Metrics
  const totalRegistrations = events.reduce((acc, ev) => acc + (ev.bookings?.length || 0), 0);
  const totalCheckedIn = events.reduce(
    (acc, ev) => acc + (ev.bookings?.filter((b: any) => b.status === "CHECKED_IN").length || 0),
    0
  );
  const checkInRate = totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0;

  // Calculate gross ticket revenue across all bookings
  const grossRevenue = events.reduce((acc, ev) => {
    const eventRev = ev.bookings?.reduce((bAcc: number, b: any) => bAcc + (b.ticketTier?.price || 0), 0) || 0;
    return acc + eventRev;
  }, 0);

  // Region-aware currency mapping
  const regionCurrency = locale === "jp" ? "JPY" : locale === "en" ? "USD" : "IDR";

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
            <Badge variant="archetype" size="sm">
              <Activity className="h-3 w-3 mr-1 text-emerald-500 animate-pulse" />
              {tOrg("dashboardTitle") || "Live Operations"}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            {tOrg("dashboardTitle") || "Organizer Operations Dashboard"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {tOrg("dashboardSubtitle") || "Monitor real-time attendee registrations, gross ticket volume, gate check-in velocity, and exhibitor booths."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href={`/${locale}/scanner`}>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs cursor-pointer">
              <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{tOrg("doorScanner") || "Door Scanner"}</span>
            </Button>
          </Link>
          <Link href={`/${locale}/events/new`}>
            <Button variant="primary" size="sm" className="gap-1.5 h-9 text-xs shadow-sm cursor-pointer">
              <PlusCircle className="h-4 w-4" />
              <span>{tOrg("launchNewEvent") || "Launch New Event"}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* METRIC KPI STAT CARDS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-medium text-muted-foreground">
            Live Metrics • Data as of {currentFreshnessTime}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {events.length} active {events.length === 1 ? "exhibition" : "exhibitions"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Registrations */}
          <Card className="p-5 border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{tOrg("kpiTickets") || "Total Registrations"}</span>
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-foreground">
                {totalRegistrations.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{tCom("attendees") || "delegates"}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>{totalRegistrations > 0 ? "Active ticket sales" : "Ready for registration"}</span>
              </div>
            </div>
          </Card>

          {/* Card 2: Gross Ticket Revenue */}
          <Card className="p-5 border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{tOrg("kpiRevenue") || "Gross Ticket Revenue"}</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-foreground truncate">
                {formatCurrency(grossRevenue, regionCurrency, locale)}
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <span>{tOrg("acrossExhibitions", { count: events.length }) || `Across ${events.length} active exhibitions`}</span>
              </div>
            </div>
          </Card>

          {/* Card 3: Gate Check-in Velocity */}
          <Card className="p-5 border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{tOrg("kpiCheckIn") || "Check-In Velocity"}</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-foreground">
                {checkInRate}% <span className="text-xs font-normal text-muted-foreground">{tOrg("checkedInCount", { count: totalCheckedIn }) || `(${totalCheckedIn} checked-in)`}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.max(checkInRate, totalRegistrations > 0 ? 4 : 0)}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Card 4: Booth Occupancy */}
          <Card className="p-5 border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{tOrg("kpiOccupancy") || "Booth Occupancy Rate"}</span>
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Store className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-foreground">
                {totalBooths > 0 ? `${boothOccupancy}%` : "0%"} <span className="text-xs font-normal text-muted-foreground">{tOrg("boothsUnitsCount", { occupied: occupiedBooths, total: totalBooths }) || `(${occupiedBooths}/${totalBooths} units)`}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all"
                  style={{ width: `${boothOccupancy}%` }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ACTIVE EVENTS MANAGEMENT ROSTER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">{tOrg("activeEvents") || "Active Exhibitions & Conventions"}</h2>
            <p className="text-xs text-muted-foreground">
              {tOrg("activeEventsDesc") || "Manage live branding, hall booth rosters, and door scanners for your registered events."}
            </p>
          </div>
          <Link href={`/${locale}/events/new`}>
            <Button variant="outline" size="sm" className="text-xs gap-1.5 cursor-pointer">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>{tOrg("addEvent") || "Add Event"}</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((event) => {
            const tokens = getArchetypeTokens(event.archetype);
            const registrationsCount = event.bookings?.length || 0;
            const boothsCount = event.booths?.length || 0;

            return (
              <Card key={event.id} className="border-border/80 bg-card flex flex-col justify-between hover:shadow-md transition-all">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <Badge variant="archetype" size="sm">
                      {tokens.displayName}
                    </Badge>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {event.format}
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold text-foreground mt-2 line-clamp-1">
                    {event.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {event.tagline || event.description}
                  </p>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4">
                  {/* Event Details Grid */}
                  <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border/60">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{formatDateRange(event.startDate, event.endDate, locale)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">
                        {event.venue?.name} {event.venueHall ? `- ${event.venueHall.name}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Quick Stat Badges */}
                  <div className="grid grid-cols-2 gap-2 bg-muted/40 p-2.5 rounded-lg text-center text-xs">
                    <div>
                      <div className="text-xs uppercase font-semibold text-muted-foreground">{tOrg("bookingsCount") || "Bookings"}</div>
                      <div className="text-sm font-bold text-foreground">{registrationsCount}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase font-semibold text-muted-foreground">{tOrg("boothsCount") || "Floor Booths"}</div>
                      <div className="text-sm font-bold text-foreground">{boothsCount}</div>
                    </div>
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <Link href={`/${locale}/events/${event.id}/ai-reports`}>
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8 border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/10 cursor-pointer">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                        <span>{tOrg("viewAiReports") || "AI Reports"}</span>
                      </Button>
                    </Link>

                    <Link href={`/${locale}/events/${event.id}/customizer`}>
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8 cursor-pointer">
                        <Palette className="h-3.5 w-3.5 text-primary" />
                        <span>{tOrg("viewCustomizer") || "Customizer"}</span>
                      </Button>
                    </Link>

                    <Link href={`/${locale}/booths?eventId=${event.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8 cursor-pointer">
                        <Store className="h-3.5 w-3.5 text-purple-500" />
                        <span>{tOrg("viewBooths") || "Booths"}</span>
                      </Button>
                    </Link>

                    <Link href={`/${locale}/scanner?eventId=${event.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8 cursor-pointer">
                        <QrCode className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{tOrg("viewScanner") || "Scanner"}</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* RECENT CHECK-INS & BOOKINGS AUDIT FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Activity Feed */}
        <Card className="p-5 border-border/80 bg-card space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>{tOrg("recentBookings") || "Recent Delegate Check-Ins & Bookings"}</span>
            </h3>
            <span className="text-xs text-muted-foreground font-mono">{allBookings.length} entries</span>
          </div>

          <div className="divide-y divide-border/60">
            {allBookings.slice(0, 6).map((booking: any) => {
              const isAdmitted = booking.status === "CHECKED_IN";
              return (
                <div key={booking.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate">
                      {booking.attendeeName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {booking.event?.title} • {booking.ticketTier?.name}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge
                      variant={isAdmitted ? "success" : "outline"}
                      size="sm"
                      className="font-semibold"
                    >
                      {isAdmitted ? "Admitted" : "Confirmed"}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                      {booking.qrCodeHash?.slice(0, 16) || "PASS-REF"}...
                    </div>
                  </div>
                </div>
              );
            })}

            {allBookings.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No delegate check-ins recorded yet today.
              </div>
            )}
          </div>
        </Card>

        {/* Right: Operational Status Deck */}
        <Card className="p-5 border-border/80 bg-card space-y-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Live Operations Shortcuts</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Direct access to essential on-site MICE operational workflows:
            </p>

            <div className="space-y-2.5 pt-2">
              <Link
                href={`/${locale}/scanner`}
                className="p-3 bg-muted/40 hover:bg-muted/80 rounded-xl border border-border/70 flex items-start gap-3 transition-colors block"
              >
                <QrCode className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-foreground">Door QR Check-In Scanner</div>
                  <div className="text-muted-foreground text-xs mt-0.5">
                    Launch optical pass camera scanner with cryptographic validation.
                  </div>
                </div>
              </Link>

              <Link
                href={`/${locale}/booths`}
                className="p-3 bg-muted/40 hover:bg-muted/80 rounded-xl border border-border/70 flex items-start gap-3 transition-colors block"
              >
                <Store className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-foreground">Exhibitor Booth & Floor Manager</div>
                  <div className="text-muted-foreground text-xs mt-0.5">
                    Allocate lots, manage tenants, and import CSV booth rosters.
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Ready to launch a new exhibition?</span>
            <Link href={`/${locale}/events/new`}>
              <Button size="sm" variant="primary" className="text-xs gap-1.5 cursor-pointer">
                <PlusCircle className="h-3.5 w-3.5" />
                <span>{tOrg("launchNewEvent") || "Create Event"}</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
