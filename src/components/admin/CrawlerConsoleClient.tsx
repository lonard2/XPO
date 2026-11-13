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
import { useTranslations } from "next-intl";
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
  let tAdmin: any = (k: string) => k;
  let tCom: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tAdmin = useTranslations("admin");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tCom = useTranslations("common");
  } catch {
    // Fallback
  }

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
                {tAdmin("crawlerConfigTitle")}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {tAdmin("crawlerConfigDesc")}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={selectedVenues.length === registeredVenues.length ? deselectAll : selectAll}
              >
                {selectedVenues.length === registeredVenues.length ? tAdmin("deselectAll") : tAdmin("selectAllFeeds")}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunCrawl}
                disabled={isRunning || selectedVenues.length === 0}
                className="h-8 gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRunning ? "animate-spin" : ""}`} />
                {isRunning ? tAdmin("runningScraper") : tAdmin("executeBatch")}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {/* Target Venues Grid */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              {tAdmin("targetFeeds", { selected: selectedVenues.length, total: registeredVenues.length })}
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
                      <div className="text-xs font-normal text-muted-foreground mt-0.5">
                        {venue.regionCode.toUpperCase()} • {tAdmin("scheduledFeeds", { count: venue.eventCount })}
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
              <span className="text-foreground">{tAdmin("dryRunMode")}</span>
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
                {tAdmin("persistMode")}
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
                    {activeResult.status === "COMPLETED" ? tAdmin("statusCompleted") : tAdmin("statusPartial")}
                  </Badge>
                  <CardTitle className="text-base">{tAdmin("batchRun", { id: activeResult.runId })}</CardTitle>
                </div>
                <CardDescription className="text-xs mt-0.5">
                  {tAdmin("executedAt", { timestamp: activeResult.timestamp, ms: activeResult.durationMs })}
                </CardDescription>
              </div>

              {/* Stats Counters */}
              <div className="flex items-center gap-2 text-xs">
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-semibold">
                  {tAdmin("insertedNormalized", { count: activeResult.insertedCount })}
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-muted/60 border border-border/80 text-muted-foreground font-medium">
                  {tAdmin("duplicatesSkipped", { count: activeResult.skippedDuplicatesCount })}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-4">
            {/* Ingested Items Table */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border sticky top-0">
                    <tr>
                      <th className="p-3">{tAdmin("eventTitleHeader")}</th>
                      <th className="p-3">{tAdmin("venueHeader")}</th>
                      <th className="p-3">{tAdmin("actionHeader")}</th>
                      <th className="p-3">{tAdmin("fingerprintHeader")}</th>
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
                            <Badge variant="success" size="sm">
                              {tAdmin("actionInserted")}
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="sm">
                              {tAdmin("actionSkipped")}
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">
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
              {tAdmin("historyTitle")}
            </CardTitle>
            <span className="text-xs text-muted-foreground">{tAdmin("runsLogged", { count: history.length })}</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {history.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
              {tAdmin("historyEmpty")}
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
                      {rec.status === "COMPLETED" ? tAdmin("statusCompleted") : tAdmin("statusPartial")}
                    </Badge>
                    <span className="font-mono font-bold text-foreground">{rec.runId}</span>
                    <span className="text-muted-foreground text-xs">{rec.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {tAdmin("newCount", { count: rec.insertedCount })}
                    </span>
                    <span className="text-muted-foreground">
                      {tAdmin("skippedCount", { count: rec.skippedDuplicatesCount })}
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {tAdmin("durationMs", { ms: rec.durationMs })}
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
