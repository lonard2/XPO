"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Building2,
  Sparkles,
  Palette,
  Store,
  QrCode,
  Search,
  X,
  CheckCircle2,
  PlusCircle,
  Clock,
  Layers,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { formatDateRange } from "@/lib/i18n/formatters";
import { getArchetypeTokens } from "@/lib/theming";

export type EventOperationalStatus = "ALL" | "LIVE" | "UPCOMING" | "CONCLUDED";

export interface OrganizerEventItem {
  id: string;
  slug: string;
  title: string;
  tagline?: string | null;
  description: string;
  archetype: string;
  format: string;
  startDate: Date | string;
  endDate: Date | string;
  venue?: { id: string; name: string } | null;
  venueHall?: { id: string; name: string } | null;
  bookings?: Array<{ status: string }> | null;
  booths?: Array<any> | null;
}

interface OrganizerEventsRosterProps {
  events: OrganizerEventItem[];
  locale: string;
}

export function OrganizerEventsRoster({ events, locale }: OrganizerEventsRosterProps) {
  const [activeTab, setActiveTab] = React.useState<EventOperationalStatus>("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");

  const now = new Date();

  // Helper to determine status for an individual event
  const getEventStatus = (event: OrganizerEventItem): "LIVE" | "UPCOMING" | "CONCLUDED" => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    if (now >= start && now <= end) return "LIVE";
    if (now < start) return "UPCOMING";
    return "CONCLUDED";
  };

  // Pre-calculate status counts
  const statusCounts = React.useMemo(() => {
    let live = 0;
    let upcoming = 0;
    let concluded = 0;

    for (const evt of events) {
      const status = getEventStatus(evt);
      if (status === "LIVE") live++;
      else if (status === "UPCOMING") upcoming++;
      else concluded++;
    }

    return {
      ALL: events.length,
      LIVE: live,
      UPCOMING: upcoming,
      CONCLUDED: concluded,
    };
  }, [events]);

  // Filter and sort events
  const filteredEvents = React.useMemo(() => {
    let result = events.map((ev) => ({
      ...ev,
      _status: getEventStatus(ev),
    }));

    // Filter by tab
    if (activeTab !== "ALL") {
      result = result.filter((ev) => ev._status === activeTab);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (ev) =>
          ev.title.toLowerCase().includes(q) ||
          (ev.tagline && ev.tagline.toLowerCase().includes(q)) ||
          (ev.venue?.name && ev.venue.name.toLowerCase().includes(q)) ||
          (ev.venueHall?.name && ev.venueHall.name.toLowerCase().includes(q)) ||
          ev.archetype.toLowerCase().includes(q)
      );
    }

    // Sort: Live first, then Upcoming (closest first), then Concluded (most recent first)
    result.sort((a, b) => {
      const rank = { LIVE: 1, UPCOMING: 2, CONCLUDED: 3 };
      if (rank[a._status] !== rank[b._status]) {
        return rank[a._status] - rank[b._status];
      }
      if (a._status === "CONCLUDED") {
        return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
      }
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    return result;
  }, [events, activeTab, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Active Exhibitions & Conventions</h2>
          <p className="text-xs text-muted-foreground">
            Manage live branding, hall booth rosters, and door scanners for your registered events.
          </p>
        </div>
        <Link
          href={`/${locale}/events/new`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "text-xs gap-1.5 cursor-pointer min-h-[44px] sm:min-h-[36px] self-start sm:self-auto shrink-0"
          )}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Exhibition</span>
        </Link>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Status Segmented Tabs */}
        <div
          role="tablist"
          aria-label="Exhibition Operational Status"
          className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/60"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "ALL"}
            onClick={() => setActiveTab("ALL")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer min-h-[36px] flex items-center gap-1.5",
              activeTab === "ALL"
                ? "bg-background text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>All</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-muted font-mono">
              {statusCounts.ALL}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "LIVE"}
            onClick={() => setActiveTab("LIVE")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer min-h-[36px] flex items-center gap-1.5",
              activeTab === "LIVE"
                ? "bg-background text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Now</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
              {statusCounts.LIVE}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "UPCOMING"}
            onClick={() => setActiveTab("UPCOMING")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer min-h-[36px] flex items-center gap-1.5",
              activeTab === "UPCOMING"
                ? "bg-background text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Upcoming</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-muted font-mono">
              {statusCounts.UPCOMING}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "CONCLUDED"}
            onClick={() => setActiveTab("CONCLUDED")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer min-h-[36px] flex items-center gap-1.5",
              activeTab === "CONCLUDED"
                ? "bg-background text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Concluded</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-muted font-mono">
              {statusCounts.CONCLUDED}
            </span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by title, hall, or venue..."
            aria-label="Filter exhibitions by title, hall, or venue"
            className="pl-8 pr-8 h-9 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search query"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Roster Cards Grid */}
      {filteredEvents.length === 0 ? (
        <Card className="p-8 border-border bg-card text-center space-y-3 shadow-xs rounded-2xl">
          <div className="h-10 w-10 rounded-xl bg-muted text-muted-foreground mx-auto flex items-center justify-center">
            <Search className="h-5 w-5" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-foreground">No Exhibitions Match Criteria</h3>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? `No exhibitions match "${searchQuery}" in this view. Try adjusting keywords or clear the filter.`
                : "There are no exhibitions currently categorized under this operational status."}
            </p>
          </div>
          {(searchQuery || activeTab !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveTab("ALL");
              }}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "text-xs cursor-pointer min-h-[44px] sm:min-h-[36px]"
              )}
            >
              Reset Filters
            </button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredEvents.map((event) => {
            const tokens = getArchetypeTokens(event.archetype);
            const registrationsCount = event.bookings?.length || 0;
            const checkedInCount =
              event.bookings?.filter((b: any) => b.status === "CHECKED_IN").length || 0;
            const eventCheckInRate =
              registrationsCount > 0 ? Math.round((checkedInCount / registrationsCount) * 100) : 0;
            const boothsCount = event.booths?.length || 0;
            const dates = formatDateRange(event.startDate, event.endDate, locale);

            return (
              <Card
                key={event.id}
                className="group relative border-border/80 bg-card flex flex-col justify-between hover:border-primary/60 hover:shadow-md transition-all shadow-xs rounded-2xl"
              >
                <CardHeader className="p-5 pb-3 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    {/* Operational Status Pill */}
                    {event._status === "LIVE" && (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-bold gap-1 px-2 py-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Now
                      </Badge>
                    )}
                    {event._status === "UPCOMING" && (
                      <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/40 bg-primary/5 px-2 py-0.5">
                        Upcoming
                      </Badge>
                    )}
                    {event._status === "CONCLUDED" && (
                      <Badge variant="outline" className="text-xs font-medium text-muted-foreground border-border bg-muted/60 px-2 py-0.5">
                        Concluded
                      </Badge>
                    )}

                    {/* Archetype Token Badge */}
                    <Badge
                      variant="secondary"
                      size="sm"
                      className="font-semibold text-xs truncate max-w-[170px]"
                      style={{
                        backgroundColor: `${tokens.primary}18`,
                        color: tokens.primary,
                        borderColor: `${tokens.primary}30`,
                      }}
                    >
                      {tokens.displayName}
                    </Badge>
                  </div>

                  <div>
                    {/* Stretched Link on Card Title */}
                    <Link
                      href={`/${locale}/events/${event.id}/ai-reports`}
                      className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {event.title}
                      </CardTitle>
                    </Link>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {event.tagline || event.description}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4">
                  {/* Event Details Grid */}
                  <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border/60">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="tabular-nums font-medium text-foreground">{dates}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">
                        {event.venue?.name} {event.venueHall ? `- ${event.venueHall.name}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Operational Telemetry Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-muted/40 p-2.5 rounded-xl text-center text-xs">
                    <div>
                      <div className="text-[11px] uppercase font-semibold text-muted-foreground">Bookings</div>
                      <div className="text-sm font-bold text-foreground tabular-nums">{registrationsCount}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase font-semibold text-muted-foreground">Admitted</div>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {checkedInCount} <span className="text-[11px] font-normal text-muted-foreground">({eventCheckInRate}%)</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase font-semibold text-muted-foreground">Booths</div>
                      <div className="text-sm font-bold text-foreground tabular-nums">{boothsCount}</div>
                    </div>
                  </div>

                  {/* Action Buttons Toolbar with relative z-10 and touch targets */}
                  <div className="pt-1 grid grid-cols-2 gap-2 relative z-10">
                    <Link
                      href={`/${locale}/events/${event.id}/ai-reports`}
                      aria-label={`View AI analytics reports for ${event.title}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "w-full text-xs gap-1.5 min-h-[44px] sm:min-h-[36px] border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/10 cursor-pointer"
                      )}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                      <span>AI Reports</span>
                    </Link>

                    <Link
                      href={`/${locale}/events/${event.id}/customizer`}
                      aria-label={`Open visual branding customizer for ${event.title}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "w-full text-xs gap-1.5 min-h-[44px] sm:min-h-[36px] cursor-pointer"
                      )}
                    >
                      <Palette className="h-3.5 w-3.5 text-primary" />
                      <span>Customizer</span>
                    </Link>

                    <Link
                      href={`/${locale}/booths?eventId=${event.id}`}
                      aria-label={`Manage floor booths and tenant roster for ${event.title}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "w-full text-xs gap-1.5 min-h-[44px] sm:min-h-[36px] cursor-pointer"
                      )}
                    >
                      <Store className="h-3.5 w-3.5 text-purple-500" />
                      <span>Booths</span>
                    </Link>

                    <Link
                      href={`/${locale}/scanner?eventId=${event.id}`}
                      aria-label={`Launch turnstile QR scanner for ${event.title}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "w-full text-xs gap-1.5 min-h-[44px] sm:min-h-[36px] border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer"
                      )}
                    >
                      <QrCode className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Scanner</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
