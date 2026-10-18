import * as React from "react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { CalendarDays } from "lucide-react";
import { AdminEventsConsoleClient } from "@/components/admin/AdminEventsConsoleClient";
import { FALLBACK_EVENTS } from "@/lib/discovery/fallbackData";

interface AdminEventsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminEventsPage({ params }: AdminEventsPageProps) {
  const { locale } = await params;

  let eventsList: any[] = [];
  let isLive = true;

  try {
    const dbEvents = await db.event.findMany({
      include: {
        venue: true,
        organizer: { select: { id: true, name: true, organization: true } },
        _count: { select: { ticketTiers: true, booths: true, bookings: true } },
      },
      orderBy: { startDate: "asc" },
    });
    eventsList = dbEvents;
  } catch {
    eventsList = FALLBACK_EVENTS as any[];
    isLive = false;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" size="sm" className="gap-1">
              <CalendarDays className="h-3 w-3 text-primary" />
              Event Governance
            </Badge>
            <span className="text-xs text-muted-foreground">Ownership, Curation & Removal</span>
            {!isLive && (
              <Badge variant="outline" size="sm" className="text-amber-600 border-amber-500/40">
                Preview Data
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Platform & Organizer Events
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Review every exhibition in the system, release owned events back to
            platform curation, or permanently remove retired listings.
          </p>
        </div>
      </div>

      <AdminEventsConsoleClient initialEvents={eventsList} locale={locale} isLive={isLive} />
    </div>
  );
}
