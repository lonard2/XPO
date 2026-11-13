import * as React from "react";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import {
  Building2,
  PlusCircle,
  MapPin,
  Layers,
  Train,
  Globe,
  Search,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VenueDirectoryManagerClient } from "@/components/admin/VenueDirectoryManagerClient";
import { FALLBACK_VENUES } from "@/lib/discovery/fallbackData";

interface AdminVenuesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminVenuesPage({ params }: AdminVenuesPageProps) {
  const { locale } = await params;
  const tAdm = await getTranslations({ locale, namespace: "admin" });

  let venuesList: any[] = [];

  try {
    const dbVenues = await db.venue.findMany({
      include: {
        region: true,
        halls: true,
        events: {
          select: { id: true, title: true, startDate: true, archetype: true },
        },
      },
      orderBy: { name: "asc" },
    });

    if (dbVenues.length > 0) {
      venuesList = dbVenues;
    } else {
      venuesList = FALLBACK_VENUES;
    }
  } catch {
    venuesList = FALLBACK_VENUES;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" size="sm" className="gap-1">
              <Building2 className="h-3 w-3 text-primary" />
              {tAdm("venueGovernance")}
            </Badge>
            <span className="text-xs text-muted-foreground">{tAdm("venueHierarchy")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {tAdm("venueDirectoryTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            {tAdm("venueDirectoryDesc")}
          </p>
        </div>
      </div>

      {/* Interactive Venue Manager Client Component */}
      <VenueDirectoryManagerClient initialVenues={venuesList} locale={locale} />
    </div>
  );
}
