"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Building2,
  Calendar,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Filter,
  Search,
  Activity,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTranslations } from "next-intl";

export interface VerificationRequest {
  id: string;
  organizerName: string;
  organization: string;
  email: string;
  eventTitle: string;
  requestedVenue: string;
  countryCode: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedDate: string;
  notes: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  actor: string;
  target: string;
  severity: "INFO" | "SUCCESS" | "WARN" | "ALERT";
  timestamp: string;
  details: string;
}

interface AdminDashboardClientProps {
  initialQueue: VerificationRequest[];
  initialLogs: AuditLogItem[];
  locale: string;
}

export function AdminDashboardClient({
  initialQueue,
  initialLogs,
  locale,
}: AdminDashboardClientProps) {
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

  const [queue, setQueue] = React.useState<VerificationRequest[]>(initialQueue);
  const [logs, setLogs] = React.useState<AuditLogItem[]>(initialLogs);
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isCrawling, setIsCrawling] = React.useState(false);
  const [crawlMessage, setCrawlMessage] = React.useState<string | null>(null);

  const handleApprove = (id: string) => {
    const target = queue.find((q) => q.id === id);
    if (!target) return;

    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "APPROVED" } : item))
    );

    const newLog: AuditLogItem = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      action: "ORGANIZER_VERIFICATION_APPROVED",
      actor: "Platform Administrator",
      target: `${target.organization} (${target.eventTitle})`,
      severity: "SUCCESS",
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      details: `Approved credentials and venue allocation for ${target.organizerName} at ${target.requestedVenue}.`,
    };

    setLogs((prev) => [newLog, ...prev]);
  };

  const handleReject = (id: string) => {
    const target = queue.find((q) => q.id === id);
    if (!target) return;

    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "REJECTED" } : item))
    );

    const newLog: AuditLogItem = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      action: "ORGANIZER_VERIFICATION_REJECTED",
      actor: "Platform Administrator",
      target: `${target.organization} (${target.eventTitle})`,
      severity: "WARN",
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      details: `Rejected application for ${target.organizerName}. Missing documentation or hall conflict.`,
    };

    setLogs((prev) => [newLog, ...prev]);
  };

  const handleTriggerCrawl = async () => {
    setIsCrawling(true);
    setCrawlMessage(null);
    try {
      const res = await fetch("/api/crawler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun: false, persistToDb: true }),
      });
      const data = await res.json();
      if (data.success) {
        setCrawlMessage(data.message);
        const newLog: AuditLogItem = {
          id: `LOG-${Date.now().toString().slice(-4)}`,
          action: "CRAWLER_BATCH_SYNC",
          actor: "Platform Admin (Manual Trigger)",
          target: "All 7 Flagship Venues",
          severity: "SUCCESS",
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          details: `Batch complete: ${data.data?.insertedCount || 0} inserted, ${data.data?.skippedDuplicatesCount || 0} duplicates skipped.`,
        };
        setLogs((prev) => [newLog, ...prev]);
      } else {
        setCrawlMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setCrawlMessage(`Network error triggering crawler: ${(err as Error).message}`);
    } finally {
      setIsCrawling(false);
    }
  };

  const filteredQueue = queue.filter((item) => {
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      item.organizerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.requestedVenue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: VerificationRequest["status"]) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge variant="success" size="sm" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" size="sm" className="gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      case "PENDING":
      default:
        return (
          <Badge variant="warning" size="sm" className="gap-1">
            <Clock className="h-3 w-3" /> Pending Review
          </Badge>
        );
    }
  };

  const getSeverityBadge = (sev: AuditLogItem["severity"]) => {
    switch (sev) {
      case "SUCCESS":
        return <Badge variant="success" size="sm">SUCCESS</Badge>;
      case "WARN":
        return <Badge variant="warning" size="sm">WARN</Badge>;
      case "ALERT":
        return <Badge variant="destructive" size="sm">ALERT</Badge>;
      case "INFO":
      default:
        return <Badge variant="neutral" size="sm">INFO</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT COLUMN: Organizer Verification Queue (7 Cols) */}
      <div className="lg:col-span-7 space-y-6">
        <Card className="border-border/80 bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Organizer Verification Governance Queue</CardTitle>
                </div>
                <CardDescription className="mt-1 text-xs">
                  Review and attest organizer credentials, hall occupancy requests, and compliance contracts.
                </CardDescription>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60 text-xs">
                {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      statusFilter === tab
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Search filter */}
            <div className="mt-3">
              <Input
                placeholder="Search organizers, events, or venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                iconPrefix={<Search className="h-4 w-4" />}
                className="h-8 text-xs bg-background/80"
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-3.5 pt-0">
            {filteredQueue.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
                No organizer verification requests found matching your filter criteria.
              </div>
            ) : (
              filteredQueue.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-border bg-background/60 hover:bg-background/90 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{req.organization}</span>
                        <Badge variant="outline" size="sm">{req.countryCode}</Badge>
                        {getStatusBadge(req.status)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Contact: <span className="text-foreground font-medium">{req.organizerName}</span> ({req.email})
                      </div>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Submitted {req.submittedDate}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-lg border border-border/50">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Event Title</span>
                      <span className="font-medium text-foreground">{req.eventTitle}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Requested Venue</span>
                      <span className="font-medium text-foreground">{req.requestedVenue}</span>
                    </div>
                    <div className="sm:col-span-2 pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground">Operational Notes: </span>
                      {req.notes}
                    </div>
                  </div>

                  {/* Actions */}
                  {req.status === "PENDING" && (
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                        onClick={() => handleReject(req.id)}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject Request
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        className="h-7 text-xs"
                        onClick={() => handleApprove(req.id)}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approve & Grant Privileges
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: Quick Ingestion Control & Platform Audit Logs (5 Cols) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Quick Ingestion Engine Card */}
        <Card className="border-border/80 bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-base">MICE Ingestion Scraper</CardTitle>
              </div>
              <Badge variant="outline" size="sm">7 Venues Registered</Badge>
            </div>
            <CardDescription className="text-xs">
              Automated ingestion pipeline scraping schedules from JIExpo, ICE BSD, Tokyo Big Sight, Marina Bay Sands, Messe Frankfurt, ExCeL London, and McCormick Place.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fingerprint Algorithm:</span>
                <span className="font-mono text-[10px] font-semibold text-foreground">SHA-256 (Venue+Title+Date)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Deduplication State:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active In-Memory & DB Hash Check</span>
              </div>
            </div>

            {crawlMessage && (
              <div className="p-2.5 rounded-lg text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                {crawlMessage}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full h-8 text-xs gap-1.5"
                onClick={handleTriggerCrawl}
                disabled={isCrawling}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isCrawling ? "animate-spin" : ""}`} />
                {isCrawling ? "Running Batch Crawl..." : "Execute Scheduled Ingestion"}
              </Button>
              <Link href={`/${locale}/admin/crawler`}>
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Platform Audit Logs Feed */}
        <Card className="border-border/80 bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-base">System Audit & Governance Feed</CardTitle>
              </div>
              <Link href={`/${locale}/admin/audit`} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <CardDescription className="text-xs">
              Live cryptographic pass check-ins, organizer approvals, and crawler mutations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg border border-border/70 bg-background/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-foreground truncate">
                      {log.action}
                    </span>
                    {getSeverityBadge(log.severity)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Actor: <span className="text-foreground font-medium">{log.actor}</span>
                  </div>
                  <p className="text-[11px] text-foreground leading-relaxed pt-0.5">
                    {log.details}
                  </p>
                  <div className="text-[10px] text-muted-foreground font-mono pt-1">
                    {log.timestamp} • {log.id}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
