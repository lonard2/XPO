import * as React from "react";
import { ShieldCheck, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export function EventOrganizerSection({
  event,
  locale = "en",
}: {
  event: any;
  locale?: string;
}) {
  const isCurated = Boolean(event.isPlatformCurated || !event.organizer);
  const promoterName = isCurated
    ? (event.organizerName || event.venue?.name || "Official Listing")
    : (event.organizer?.organization || event.organizer?.name || event.organizerName || "Registered Organizer");

  return (
    <section className="pt-8 border-t border-border/80" data-testid="event-organizer-section">
      <Card className="p-5 sm:p-6 bg-card/60 border-border/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {isCurated ? (
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold gap-1 text-xs"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Official Listing</span>
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-primary/40 bg-primary/10 text-primary font-semibold gap-1 text-xs"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span>Verified Organizer</span>
                </Badge>
              )}
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isCurated ? "Platform Curation" : "Event Host"}
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-bold text-foreground">
              {promoterName}
            </h4>

            <p className="text-xs text-muted-foreground">
              {isCurated
                ? "Curated MICE Directory Listing - Verified by XPO Platform Administration"
                : "Registered Event Organizer on XPO MICE Ecosystem"}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground flex flex-wrap items-center gap-4">
          {event.venue?.name && (
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Venue: {event.venue.name}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {isCurated ? "Governance: Curated Directory" : "Account Status: Active Organizer Tenant"}
            </span>
          </span>
        </div>
      </Card>
    </section>
  );
}
