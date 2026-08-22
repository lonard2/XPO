"use client";

import * as React from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Database,
  FileText,
  Lock,
  Code,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTranslations } from "next-intl";

export interface AuditLogDetailed {
  id: string;
  action: string;
  category: string;
  actor: string;
  target: string;
  severity: "INFO" | "SUCCESS" | "WARN" | "ALERT";
  timestamp: string;
  details: string;
  metadataJson?: string;
}

interface AuditLogsViewerClientProps {
  initialLogs: AuditLogDetailed[];
  locale: string;
}

export function AuditLogsViewerClient({
  initialLogs,
  locale,
}: AuditLogsViewerClientProps) {
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

  const [logs, setLogs] = React.useState<AuditLogDetailed[]>(initialLogs);
  const [categoryFilter, setCategoryFilter] = React.useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [expandedLogId, setExpandedLogId] = React.useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  const filteredLogs = logs.filter((log) => {
    const matchesCat = categoryFilter === "ALL" || log.category === categoryFilter;
    const matchesSev = severityFilter === "ALL" || log.severity === severityFilter;
    const matchesSearch =
      searchQuery === "" ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSev && matchesSearch;
  });

  const getSeverityBadge = (sev: AuditLogDetailed["severity"]) => {
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
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card/70 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60 text-xs">
            {[
              { id: "ALL", label: "All Categories" },
              { id: "PASS_VALIDATION", label: "Pass Validations" },
              { id: "CRAWLER", label: "Crawler Sync" },
              { id: "VENUE_GOVERNANCE", label: "Venues" },
              { id: "AUTH_SECURITY", label: "Auth & Roles" },
              { id: "SECURITY_ALERT", label: "Security Alerts" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  categoryFilter === cat.id
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Severities</option>
            <option value="SUCCESS">SUCCESS Only</option>
            <option value="INFO">INFO Only</option>
            <option value="WARN">WARN Only</option>
            <option value="ALERT">ALERT Only</option>
          </select>
        </div>

        {/* Search */}
        <div className="w-full md:w-64">
          <Input
            placeholder="Search action, actor, target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            iconPrefix={<Search className="h-4 w-4" />}
            className="h-8 text-xs bg-background/80"
          />
        </div>
      </div>

      {/* Logs Table / List */}
      <Card className="border-border/80 bg-card/70 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Platform Security Log Feed ({filteredLogs.length} Events)
            </CardTitle>
            <span className="text-xs text-muted-foreground">Immutable Append-Only Records</span>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
              No audit log events found matching the specified filter criteria.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div
                  key={log.id}
                  className="rounded-xl border border-border/80 bg-background/60 hover:bg-background/90 transition-all p-4 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {log.action}
                      </span>
                      <Badge variant="outline" size="sm" className="text-[10px]">
                        {log.category}
                      </Badge>
                      {getSeverityBadge(log.severity)}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                      <span>{log.timestamp}</span>
                      <span>•</span>
                      <span>{log.id}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-lg border border-border/40">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Actor / Origin</span>
                      <span className="font-medium text-foreground">{log.actor}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Target Resource</span>
                      <span className="font-medium text-foreground">{log.target}</span>
                    </div>
                    <div className="sm:col-span-2 pt-1 border-t border-border/40">
                      <span className="text-muted-foreground font-medium">Summary: </span>
                      <span className="text-foreground">{log.details}</span>
                    </div>
                  </div>

                  {/* Metadata Expand Toggle */}
                  {log.metadataJson && (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleExpand(log.id)}
                        className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium cursor-pointer"
                      >
                        <Code className="h-3 w-3" />
                        <span>{isExpanded ? "Hide Structured Metadata" : "View Structured JSON Metadata"}</span>
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-3 bg-muted/60 rounded-lg border border-border/70 font-mono text-[11px] text-foreground overflow-x-auto">
                          <pre>{log.metadataJson}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
