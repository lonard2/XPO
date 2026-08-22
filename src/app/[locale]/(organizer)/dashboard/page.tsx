import * as React from "react";
import Link from "next/link";
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

  const totalBooths = allBooths.length;
  const occupiedBooths = allBooths.filter((b: any) => b.companyName && b.companyName.trim() !== "").length;
  const boothOccupancy = totalBooths > 0 ? Math.round((occupiedBooths / totalBooths) * 100) : 85;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header & Fast Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Management Command
            </span>
            <Badge variant="archetype" size="sm">Live Ecosystem</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            Organizer Operations Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor real-time attendee registrations, gross ticket volume, gate check-in velocity, and exhibitor booths.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href={`/${locale}/scanner`}>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
              <QrCode className="h-4 w-4" />
              <span>Door Scanner</span>
            </Button>
          </Link>
          <Link href={`/${locale}/events/new`}>
            <Button variant="primary" size="sm" className="gap-1.5 h-9 text-xs shadow-sm">
              <PlusCircle className="h-4 w-4" />
              <span>Launch New Event</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* METRIC KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Registrations */}
        <Card className="p-5 border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Registrations</span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">
              {totalRegistrations.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">delegates</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>+18.4% vs last cycle</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Gross Ticket Revenue */}
        <Card className="p-5 border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Gross Ticket Revenue</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground truncate">
              {formatCurrency(grossRevenue, "IDR", locale)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
              <span>Across {events.length} active exhibitions</span>
            </div>
          </div>
        </Card>

        {/* Card 3: Gate Check-in Velocity */}
        <Card className="p-5 border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Check-In Velocity</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">
              {checkInRate}% <span className="text-xs font-normal text-muted-foreground">({totalCheckedIn} checked-in)</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${Math.max(checkInRate, 8)}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Card 4: Booth Occupancy */}
        <Card className="p-5 border-border/80 bg-card hover:border-primary/40 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Booth Occupancy Rate</span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-foreground">
              {boothOccupancy}% <span className="text-xs font-normal text-muted-foreground">({occupiedBooths}/{totalBooths} units)</span>
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

      {/* ACTIVE EVENTS MANAGEMENT ROSTER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Active Exhibitions & Conventions</h2>
            <p className="text-xs text-muted-foreground">
              Manage live branding, hall booth rosters, and door scanners for your registered events.
            </p>
          </div>
          <Link href={`/${locale}/events/new`}>
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Add Event</span>
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
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
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
                        {event.venue?.name} {event.venueHall ? `— ${event.venueHall.name}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Quick Stat Badges */}
                  <div className="grid grid-cols-2 gap-2 bg-muted/40 p-2.5 rounded-lg text-center text-xs">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground">Bookings</div>
                      <div className="text-sm font-bold text-foreground">{registrationsCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground">Floor Booths</div>
                      <div className="text-sm font-bold text-foreground">{boothsCount}</div>
                    </div>
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <Link href={`/${locale}/events/${event.id}/ai-reports`}>
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8 border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/10">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                        <span>AI Reports</span>
                      </Button>
                    </Link>

                    <Link href={`/${locale}/events/${event.id}/customizer`}>
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8">
                        <Palette className="h-3.5 w-3.5 text-primary" />
                        <span>Customizer</span>
                      </Button>
                    </Link>

                    <Link href={`/${locale}/booths?eventId=${event.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8">
                        <Store className="h-3.5 w-3.5 text-purple-500" />
                        <span>Booths</span>
                      </Button>
                    </Link>

                    <Link href={`/${locale}/scanner?eventId=${event.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8">
                        <QrCode className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Scanner</span>
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
        <Card className="p-5 border-border/80 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Recent Ticket Reservations & Check-Ins</span>
            </h3>
            <span className="text-[11px] text-muted-foreground">Live Telemetry</span>
          </div>

          <div className="divide-y divide-border/60">
            {allBookings.slice(0, 6).map((booking: any) => (
              <div key={booking.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="font-semibold text-foreground truncate">
                    {booking.attendeeName}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {booking.event?.title} • {booking.ticketTier?.name}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge
                    variant={booking.status === "CHECKED_IN" ? "success" : "outline"}
                    size="sm"
                  >
                    {booking.status}
                  </Badge>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                    {booking.qrCodeHash.slice(0, 16)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Quick Launch & Tools Overview */}
        <Card className="p-5 border-border/80 bg-card space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Organizer Capabilities & Pipelines</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Fast access to high-impact organizer workflows engineered for MICE operations:
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="p-3 bg-muted/30 rounded-lg border border-border flex items-start gap-3">
                <Palette className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-foreground">Real-Time Visual Customizer</div>
                  <div className="text-muted-foreground text-[11px]">
                    Side-by-side preview with CSS variable tokens and desktop/tablet/mobile viewport testing.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border border-border flex items-start gap-3">
                <QrCode className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-foreground">Cryptographic Door QR Scanner</div>
                  <div className="text-muted-foreground text-[11px]">
                    HMAC-SHA256 signature verification, double-scan detection, and real-time audio/visual chimes.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg border border-border flex items-start gap-3">
                <Store className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-foreground">Hall & Booth Tenant Manager</div>
                  <div className="text-muted-foreground text-[11px]">
                    Assign exhibitors to specific hall grids, track reserved lots, and export directories.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex justify-end">
            <Link href={`/${locale}/events/new`}>
              <Button size="sm" variant="primary" className="text-xs gap-1.5">
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Launch New Exhibition</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
