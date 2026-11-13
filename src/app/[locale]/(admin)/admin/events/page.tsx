import * as React from "react";
import { getTranslations } from "next-intl/server";
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
  const tAdm = await getTranslations({ locale, namespace: "admin" });

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
              {tAdm("eventGovernance")}
            </Badge>
            <span className="text-xs text-muted-foreground">{tAdm("eventOwnershipSubtitle")}</span>
            {!isLive && (
              <Badge variant="outline" size="sm" className="text-amber-600 border-amber-500/40">
                {tAdm("previewData")}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {tAdm("platformOrganizerEvents")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
{tAdm("eventGovernanceDesc")}
          </p>
        </div>
      </div>

      <AdminEventsConsoleClient initialEvents={eventsList} locale={locale} isLive={isLive} />
    </div>
  );
}
