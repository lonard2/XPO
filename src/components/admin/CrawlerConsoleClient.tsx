"use client";

import * as React from "react";
import {
  RefreshCw,
  Database,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { type CrawlRunRecord, type ScrapedEventRaw } from "@/lib/crawler/venueScraper";

interface RegisteredVenue {
  slug: string;
  venueName: string;
  regionCode: string;
  eventCount: number;
  events: ScrapedEventRaw[];
}

interface CrawlerConsoleClientProps {
  registeredVenues: RegisteredVenue[];
  initialHistory: CrawlRunRecord[];
  locale: string;
}

export function CrawlerConsoleClient({
  registeredVenues,
  initialHistory,
  locale,
}: CrawlerConsoleClientProps) {
  const [selectedVenues, setSelectedVenues] = React.useState<string[]>(
    registeredVenues.map((v) => v.slug)
  );
  const [dryRun, setDryRun] = React.useState<boolean>(false);
  const [persistToDb, setPersistToDb] = React.useState<boolean>(true);
  const [isRunning, setIsRunning] = React.useState<boolean>(false);
  const [history, setHistory] = React.useState<CrawlRunRecord[]>(initialHistory);
  const [activeResult, setActiveResult] = React.useState<CrawlRunRecord | null>(
    initialHistory[0] || null
  );

  const toggleVenue = (slug: string) => {
    setSelectedVenues((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const selectAll = () => {
    setSelectedVenues(registeredVenues.map((v) => v.slug));
  };

  const deselectAll = () => {
    setSelectedVenues([]);
  };

  const handleRunCrawl = async () => {
    if (selectedVenues.length === 0) {
      alert("Please select at least one venue feed to scrape.");
      return;
    }

    setIsRunning(true);
    try {
      const res = await fetch("/api/crawler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueSlugs: selectedVenues,
          dryRun,
          persistToDb,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const record: CrawlRunRecord = data.data;
        setActiveResult(record);
        setHistory((prev) => [record, ...prev]);
      } else {
        alert(`Crawler execution failed: ${data.error}`);
      }
    } catch (err) {
      alert(`Network error triggering crawler: ${(err as Error).message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Configuration & Trigger Card */}
      <Card className="border-border/80 bg-card/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-amber-500" />
                Configure & Execute Scheduled Scraper Run
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Select target international venue feeds and execution mode (Dry Run test vs Database persistence).
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={selectedVenues.length === registeredVenues.length ? deselectAll : selectAll}
              >
                {selectedVenues.length === registeredVenues.length ? "Deselect All" : "Select All Feeds"}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunCrawl}
                disabled={isRunning || selectedVenues.length === 0}
                className="h-8 gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRunning ? "animate-spin" : ""}`} />
                {isRunning ? "Running Scraper..." : "Execute Crawler Batch"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {/* Target Venues Grid */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Target Venue Feeds ({selectedVenues.length}/{registeredVenues.length} Selected):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {registeredVenues.map((venue) => {
                const isSelected = selectedVenues.includes(venue.slug);
                return (
                  <button
                    key={venue.slug}
                    type="button"
                    onClick={() => toggleVenue(venue.slug)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-start justify-between cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 text-foreground font-semibold"
                        : "border-border/70 bg-background/50 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <div>
                      <div className="leading-tight">{venue.venueName}</div>
                      <div className="text-[10px] font-normal text-muted-foreground mt-0.5">
                        {venue.regionCode.toUpperCase()} • {venue.eventCount} Scheduled Feeds
                      </div>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-border shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Execution Mode Controls */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-border text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-foreground">Dry Run Mode (Simulate normalization without DB writes)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={persistToDb}
                onChange={(e) => setPersistToDb(e.target.checked)}
                disabled={dryRun}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <span className={dryRun ? "text-muted-foreground" : "text-foreground"}>
                Persist New Events into Prisma Relational Database
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Active Run Results & Summary */}
      {activeResult && (
        <Card className="border-border/80 bg-card/70 backdrop-blur-sm animate-fade-in">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={activeResult.status === "COMPLETED" ? "success" : "warning"} size="sm">
                    {activeResult.status}
                  </Badge>
                  <CardTitle className="text-base">Batch Ingestion Run: {activeResult.runId}</CardTitle>
                </div>
                <CardDescription className="text-xs mt-0.5">
                  Executed at {activeResult.timestamp} • Duration: {activeResult.durationMs}ms
                </CardDescription>
              </div>

              {/* Stats Counters */}
              <div className="flex items-center gap-2 text-xs">
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-semibold">
                  {activeResult.insertedCount} Inserted / Normalized
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-muted/60 border border-border/80 text-muted-foreground font-medium">
                  {activeResult.skippedDuplicatesCount} Duplicate Fingerprints Skipped
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            {/* Ingested Items Table */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border sticky top-0">
                    <tr>
                      <th className="p-3">Event Title</th>
                      <th className="p-3">Venue</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">SHA-256 Fingerprint</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 font-sans">
                    {activeResult.events.map((evt, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-semibold text-foreground">
                          {evt.title}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {evt.venueSlug}
                        </td>
                        <td className="p-3">
                          {evt.action === "INSERTED" ? (
                            <Badge variant="success" size="sm" className="text-[10px]">
                              INSERTED
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="sm" className="text-[10px]">
                              SKIPPED (DUPLICATE)
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[10px] text-muted-foreground">
                          {evt.fingerprint.slice(0, 16)}...{evt.fingerprint.slice(-8)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Crawl Run History Log */}
      <Card className="border-border/80 bg-card/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Ingestion Execution History Registry
            </CardTitle>
            <span className="text-xs text-muted-foreground">{history.length} Runs Logged</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {history.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
              No crawler runs executed yet. Trigger a batch ingestion run above.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((rec) => (
                <div
                  key={rec.runId}
                  onClick={() => setActiveResult(rec)}
                  className={`p-3 rounded-lg border text-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer ${
                    activeResult?.runId === rec.runId
                      ? "border-primary bg-primary/5"
                      : "border-border/70 bg-background/50 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Badge variant={rec.status === "COMPLETED" ? "success" : "warning"} size="sm">
                      {rec.status}
                    </Badge>
                    <span className="font-mono font-bold text-foreground">{rec.runId}</span>
                    <span className="text-muted-foreground text-[11px]">{rec.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      +{rec.insertedCount} new
                    </span>
                    <span className="text-muted-foreground">
                      {rec.skippedDuplicatesCount} skipped
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {rec.durationMs}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
