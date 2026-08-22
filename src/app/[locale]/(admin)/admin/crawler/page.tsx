import * as React from "react";
import {
  RefreshCw,
  Database,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CrawlerConsoleClient } from "@/components/admin/CrawlerConsoleClient";
import { VENUE_SCRAPER_SOURCES, getCrawlHistory } from "@/lib/crawler/venueScraper";

interface CrawlerPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminCrawlerPage({ params }: CrawlerPageProps) {
  const { locale } = await params;
  const history = getCrawlHistory();
  const registeredVenues = Object.entries(VENUE_SCRAPER_SOURCES).map(([slug, data]) => ({
    slug,
    venueName: data.venueName,
    regionCode: data.regionCode,
    eventCount: data.feed.length,
    events: data.feed,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" size="sm" className="gap-1 text-amber-600 dark:text-amber-400 border-amber-500/30">
              <RefreshCw className="h-3 w-3" />
              Automated Schedule Scraper & Deduplication
            </Badge>
            <span className="text-xs text-muted-foreground">MICE Ingestion Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Venue Schedule Ingestion & Crawler Pipeline
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Ingest upcoming schedules from premier global and regional convention centers, normalize raw MICE formats, perform deterministic SHA-256 fingerprint deduplication, and stage events for platform publishing.
          </p>
        </div>
      </div>

      <CrawlerConsoleClient
        registeredVenues={registeredVenues}
        initialHistory={history}
        locale={locale}
      />
    </div>
  );
}
