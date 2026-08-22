"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Cpu,
  Zap,
  BarChart3,
  HeartPulse,
  Footprints,
  FileSpreadsheet,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Download,
  Copy,
  Check,
  RotateCcw,
  History,
  Send,
  Trash2,
  ExternalLink,
  Layers,
  ShieldCheck,
  ChevronRight,
  Clock,
  Building2,
  Users,
  CreditCard,
  Store,
  Terminal,
  FileText,
  HelpCircle,
  Maximize2,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  OpenRouterModel,
  ReportType,
  ModelSpec,
  OPENROUTER_MODEL_SPECS,
  EventMetricsContext,
  SavedAIReportItem,
} from "@/lib/ai/types";
import {
  DailyExecutiveDigest,
  SentimentFeedback,
  FootTrafficOptimization,
} from "@/lib/ai/schemas";
import { formatCurrency } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

interface AIReportsHubProps {
  event: EventMetricsContext;
  initialReports?: SavedAIReportItem[];
  locale?: string;
}

const REPORT_TYPE_CONFIG: Record<
  ReportType,
  {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
    samplePrompts: string[];
  }
> = {
  DAILY_DIGEST: {
    title: "Daily Executive Digest",
    description: "End-of-day operational summary, gate registration velocity, top sessions, and executive action items.",
    icon: BarChart3,
    colorClass: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    samplePrompts: [
      "Analyze VIP pass velocity and afternoon keynote attendance.",
      "Summarize operational bottlenecks and gate check-in throughput.",
      "Highlight revenue pacing vs initial capacity forecast.",
    ],
  },
  SENTIMENT: {
    title: "Sentiment & Feedback Synthesis",
    description: "Multi-track delegate satisfaction analysis, positive themes, facility ratings, and urgent attendee concerns.",
    icon: HeartPulse,
    colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    samplePrompts: [
      "Evaluate attendee satisfaction regarding on-site Wi-Fi and catering.",
      "Synthesize feedback for afternoon breakout sessions in Hall A.",
      "Identify top 3 friction points reported by international delegates.",
    ],
  },
  FOOT_TRAFFIC: {
    title: "Foot-Traffic & Booth Optimization",
    description: "Spatial congestion heuristics, pavilion dwell times, hallway bottleneck mitigation, and booth density recommendations.",
    icon: Footprints,
    colorClass: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    samplePrompts: [
      "Identify spatial congestion between Hall A1 and Hall A2 corridors.",
      "Examine delegate dwell times around robotics and machinery exhibits.",
      "Recommend booth flow rebalancing strategies for underutilized zones.",
    ],
  },
};

export function AIReportsHub({ event, initialReports = [], locale = "en" }: AIReportsHubProps) {
  // State
  const [selectedModel, setSelectedModel] = React.useState<OpenRouterModel>("google/gemini-3.7-flash");
  const [selectedReportType, setSelectedReportType] = React.useState<ReportType>("DAILY_DIGEST");
  const [focusArea, setFocusArea] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [streamedText, setStreamedText] = React.useState("");
  const [structuredData, setStructuredData] = React.useState<any>(null);
  const [activeViewTab, setActiveViewTab] = React.useState("report");
  const [copied, setCopied] = React.useState(false);
  const [savedReports, setSavedReports] = React.useState<SavedAIReportItem[]>(initialReports);
  const [selectedHistoryId, setSelectedHistoryId] = React.useState<string | null>(null);
  const [isDeletingHistory, setIsDeletingHistory] = React.useState(false);

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const markdownOutputRef = React.useRef<HTMLDivElement | null>(null);

  // Generate Report Action
  const handleGenerateReport = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setStreamedText("");
    setStructuredData(null);
    setSelectedHistoryId(null);
    setActiveViewTab("report");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/ai/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          model: selectedModel,
          reportType: selectedReportType,
          focusArea: focusArea.trim() || undefined,
          saveToHistory: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Report generation failed (${response.status})`);
      }

      // Read metadata from header if present
      const metadataHeader = response.headers.get("x-report-metadata");
      if (metadataHeader) {
        try {
          const decoded = atob(metadataHeader);
          setStructuredData(JSON.parse(decoded));
        } catch {
          // Skip header parse failure
        }
      }

      if (!response.body) {
        throw new Error("No readable stream received");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamedText(accumulated);

        // Auto-scroll reader to bottom
        if (markdownOutputRef.current) {
          markdownOutputRef.current.scrollTop = markdownOutputRef.current.scrollHeight;
        }
      }

      // Refresh saved reports history
      fetchReportsHistory();
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setStreamedText(
          `## Report Generation Error\n\nFailed to complete AI report generation: ${(error as Error).message}\n\nPlease verify your connection and try again.`
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleAbort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const fetchReportsHistory = async () => {
    try {
      const res = await fetch(`/api/ai/reports?eventId=${event.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.reports) {
          setSavedReports(data.reports);
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleCopy = () => {
    if (!streamedText) return;
    navigator.clipboard.writeText(streamedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!streamedText) return;
    const blob = new Blob([streamedText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.slug}-${selectedReportType.toLowerCase()}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    if (!structuredData) return;
    const blob = new Blob([JSON.stringify(structuredData, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.slug}-${selectedReportType.toLowerCase()}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectHistoryItem = (item: SavedAIReportItem) => {
    try {
      const payload = JSON.parse(item.contentJson);
      setSelectedModel(item.modelUsed);
      setSelectedReportType(item.reportType);
      setSelectedHistoryId(item.id);
      if (payload.markdownContent) {
        setStreamedText(payload.markdownContent);
      }
      if (payload.structuredData) {
        setStructuredData(payload.structuredData);
      }
      if (payload.focusArea) {
        setFocusArea(payload.focusArea);
      }
      setActiveViewTab("report");
    } catch {
      // Parse error fallback
      setStreamedText(item.contentJson);
    }
  };

  const handleDeleteHistoryItem = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeletingHistory) return;
    setIsDeletingHistory(true);
    try {
      const res = await fetch(`/api/ai/reports?reportId=${reportId}`, { method: "DELETE" });
      if (res.ok) {
        setSavedReports((prev) => prev.filter((r) => r.id !== reportId));
        if (selectedHistoryId === reportId) {
          setSelectedHistoryId(null);
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsDeletingHistory(false);
    }
  };

  const currentModelSpec = OPENROUTER_MODEL_SPECS[selectedModel];
  const currentReportConfig = REPORT_TYPE_CONFIG[selectedReportType];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER & EVENT METRICS OVERVIEW */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              AI Multi-Model Intelligence Suite
            </span>
            <Badge variant="archetype" size="sm">
              OpenRouter Multi-Model Gateway
            </Badge>
            <Badge variant="success" size="sm">
              6 Enterprise Models Online
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1.5">
            Event Intelligence & Analytics Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Synthesize real-time registrations, gate foot-traffic, and attendee feedback across Google Gemini, DeepSeek, Qwen, and OpenAI models.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href={`/${locale}/dashboard`}>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
              <ChevronRight className="h-4 w-4 rotate-180" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
          <Link href={`/${locale}/events/${event.slug}`} target="_blank">
            <Button variant="secondary" size="sm" className="gap-1.5 h-9 text-xs">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Public Page</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* EVENT STATS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 p-4 rounded-xl border border-border/70">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground">Bookings</div>
            <div className="text-sm font-bold text-foreground truncate">{event.totalBookings.toLocaleString()} delegates</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground">Gate Check-In</div>
            <div className="text-sm font-bold text-foreground truncate">
              {event.checkInRatePercent}% ({event.totalCheckedIn})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Store className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground">Booths / Halls</div>
            <div className="text-sm font-bold text-foreground truncate">
              {event.booths.length} booths ({event.venue.name})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <CreditCard className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground">Ticket Volume</div>
            <div className="text-sm font-bold text-foreground truncate">
              {formatCurrency(event.grossRevenue, event.currency as any, locale)}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: MODEL SELECTOR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              <span>Select OpenRouter Foundation Model</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Choose an AI engine optimized for your analytical depth, latency, or multilingual requirements.
            </p>
          </div>
          <Badge variant="outline" size="sm" className="text-[10px]">
            Selected: {currentModelSpec.displayName}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {Object.values(OPENROUTER_MODEL_SPECS).map((spec) => {
            const isSelected = selectedModel === spec.id;
            return (
              <div
                key={spec.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedModel(spec.id)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedModel(spec.id)}
                className={cn(
                  "p-4 rounded-xl border transition-all text-left cursor-pointer flex flex-col justify-between relative group",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                    : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30"
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {spec.displayName}
                        </h3>
                        {isSelected && (
                          <div className="h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{spec.provider}</div>
                    </div>
                    <Badge variant={spec.badgeVariant} size="sm">
                      {spec.speedRating}
                    </Badge>
                  </div>

                  <p className="text-xs text-foreground/90 mt-2.5 font-medium leading-snug">
                    {spec.primaryCapability}
                  </p>

                  <div className="mt-3 space-y-1">
                    {spec.strengths.slice(0, 2).map((strength, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                        <span className="truncate">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Context: {(spec.contextWindow / 1000).toFixed(0)}k tokens</span>
                  <span className="font-semibold text-primary">{spec.latencyClass.toUpperCase()} TIER</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: REPORT TYPE SELECTION */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <span>Select Report Category</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Choose the analytical lens and structured Zod schema for output generation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(REPORT_TYPE_CONFIG) as [ReportType, typeof REPORT_TYPE_CONFIG[ReportType]][]).map(
            ([typeKey, config]) => {
              const Icon = config.icon;
              const isSelected = selectedReportType === typeKey;

              return (
                <div
                  key={typeKey}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedReportType(typeKey)}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedReportType(typeKey)}
                  className={cn(
                    "p-5 rounded-xl border transition-all text-left cursor-pointer flex flex-col justify-between",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                      : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30"
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center border", config.colorClass)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {isSelected && (
                        <Badge variant="archetype" size="sm">
                          Active
                        </Badge>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{config.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Suggested Focus Prompts
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {config.samplePrompts.slice(0, 1).map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReportType(typeKey);
                            setFocusArea(prompt);
                          }}
                          className="text-[10px] text-left text-primary hover:underline line-clamp-1 bg-primary/5 px-2 py-0.5 rounded"
                        >
                          &quot;{prompt}&quot;
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* SECTION 3: FOCUS AREA PROMPT & GENERATE BAR */}
      <Card className="p-5 border-border/80 bg-card space-y-4 shadow-sm">
        <div>
          <label htmlFor="focus-prompt-input" className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-primary" />
            <span>Targeted Focus Area & Custom Analysis Prompt (Optional)</span>
          </label>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Instruct {currentModelSpec.displayName} to prioritize specific halls, exhibitors, keynote sessions, or financial thresholds.
          </p>
        </div>

        <div className="space-y-2">
          <Input
            id="focus-prompt-input"
            value={focusArea}
            onChange={(e) => setFocusArea(e.target.value)}
            placeholder={`e.g. ${currentReportConfig.samplePrompts[0]}`}
            className="text-xs h-10"
            disabled={isGenerating}
          />

          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] text-muted-foreground font-medium">Quick suggestions:</span>
            {currentReportConfig.samplePrompts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFocusArea(sample)}
                className="text-[10px] px-2 py-1 rounded-md bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
              >
                {sample}
              </button>
            ))}
            {focusArea && (
              <button
                type="button"
                onClick={() => setFocusArea("")}
                className="text-[10px] text-muted-foreground hover:text-foreground underline ml-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border/60">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <span>
              Generating with <strong>{currentModelSpec.displayName}</strong> for <strong>{currentReportConfig.title}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isGenerating ? (
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5 h-9 text-xs shadow-sm"
                onClick={handleAbort}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Abort Generation</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="gap-2 h-9 text-xs shadow-md font-semibold"
                onClick={handleGenerateReport}
              >
                <Sparkles className="h-4 w-4" />
                <span>Synthesize AI Report</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* SECTION 4: STREAMING VIEWER & STRUCTURED KPI METRICS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Intelligence Output & Verified Metrics</span>
            </h2>
            {isGenerating && (
              <Badge variant="warning" size="sm" className="animate-pulse">
                Streaming Tokens...
              </Badge>
            )}
            {!isGenerating && streamedText && (
              <Badge variant="success" size="sm">
                Generated
              </Badge>
            )}
          </div>

          {streamedText && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy Markdown"}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleDownloadMarkdown}
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export .md</span>
              </Button>

              {structuredData && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={handleDownloadJSON}
                >
                  <Download className="h-3.5 w-3.5 text-purple-500" />
                  <span>Export JSON</span>
                </Button>
              )}
            </div>
          )}
        </div>

        <Tabs value={activeViewTab} onValueChange={setActiveViewTab}>
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="report" className="text-xs gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>Formatted Report</span>
            </TabsTrigger>
            <TabsTrigger value="kpi" className="text-xs gap-1.5" disabled={!structuredData}>
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Structured KPI Summary</span>
            </TabsTrigger>
            <TabsTrigger value="raw" className="text-xs gap-1.5" disabled={!structuredData}>
              <Terminal className="h-3.5 w-3.5" />
              <span>JSON Schema Data</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: FORMATTED MARKDOWN REPORT */}
          <TabsContent value="report">
            <Card className="border-border/80 bg-card p-6 min-h-[420px] shadow-sm">
              {streamedText ? (
                <div
                  ref={markdownOutputRef}
                  className="prose prose-sm dark:prose-invert max-w-none space-y-4 font-sans text-foreground leading-relaxed whitespace-pre-wrap selection:bg-primary/20"
                >
                  {streamedText}
                  {isGenerating && (
                    <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 align-middle" />
                  )}
                </div>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">No Report Generated Yet</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md">
                      Select your preferred foundation model and report category above, then click &quot;Synthesize AI Report&quot; to generate grounded analytics.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="gap-2 text-xs mt-2"
                    onClick={handleGenerateReport}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Run Default Analysis</span>
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* TAB 2: STRUCTURED KPI SUMMARY */}
          <TabsContent value="kpi">
            {structuredData ? (
              <div className="space-y-4">
                {/* Dynamic KPI Widget Rendering */}
                {selectedReportType === "DAILY_DIGEST" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 bg-card border-border">
                      <div className="text-xs text-muted-foreground font-medium">Sentiment Index</div>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        {((structuredData as DailyExecutiveDigest).sentimentScore * 100).toFixed(0)}% Positive
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Based on attendee sentiment sampling</p>
                    </Card>

                    <Card className="p-4 bg-card border-border">
                      <div className="text-xs text-muted-foreground font-medium">Foot-Traffic Encounters</div>
                      <div className="text-2xl font-bold text-foreground mt-1">
                        {(structuredData as DailyExecutiveDigest).footTrafficIndex.toLocaleString()}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Total delegate floor density index</p>
                    </Card>

                    <Card className="p-4 bg-card border-border">
                      <div className="text-xs text-muted-foreground font-medium">Gate Check-In Rate</div>
                      <div className="text-2xl font-bold text-primary mt-1">
                        {(structuredData as DailyExecutiveDigest).registrationVelocity?.checkInRatePercent}%
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {(structuredData as DailyExecutiveDigest).registrationVelocity?.totalCheckedIn} delegates scanned
                      </p>
                    </Card>

                    <Card className="p-4 bg-card border-border">
                      <div className="text-xs text-muted-foreground font-medium">Gross Revenue Pacing</div>
                      <div className="text-2xl font-bold text-foreground truncate mt-1">
                        {(structuredData as DailyExecutiveDigest).revenueMetrics?.currency}{" "}
                        {(structuredData as DailyExecutiveDigest).revenueMetrics?.grossRevenue.toLocaleString()}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Top tier: {(structuredData as DailyExecutiveDigest).revenueMetrics?.topTierByRevenue}
                      </p>
                    </Card>
                  </div>
                )}

                {selectedReportType === "SENTIMENT" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 bg-card border-border">
                      <div className="text-xs text-muted-foreground font-medium">Overall CSAT Score</div>
                      <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        {(structuredData as SentimentFeedback).attendeeSatisfactionIndex}/100
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Aggregate attendee satisfaction score</p>
                    </Card>

                    <Card className="p-4 bg-card border-border">
                      <div className="text-xs text-muted-foreground font-medium">Wi-Fi Quality Rating</div>
                      <div className="text-2xl font-bold text-foreground mt-1">
                        {(structuredData as SentimentFeedback).facilitiesFeedback?.wifiQuality}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">On-premise network telemetry</p>
                    </Card>

                    <Card className="p-4 bg-card border-border">
                      <div className="text-xs text-muted-foreground font-medium">Wayfinding Clarity</div>
                      <div className="text-2xl font-bold text-foreground mt-1">
                        {(structuredData as SentimentFeedback).facilitiesFeedback?.wayfindingClarity}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Hall and booth navigation assessment</p>
                    </Card>
                  </div>
                )}

                {selectedReportType === "FOOT_TRAFFIC" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 bg-card border-border">
                      <div className="text-xs text-muted-foreground font-medium">Overall Congestion Level</div>
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                        {(structuredData as FootTrafficOptimization).overallCongestionLevel}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Active floor heuristic evaluation</p>
                    </Card>

                    <Card className="p-4 bg-card border-border col-span-2">
                      <div className="text-xs text-muted-foreground font-medium">Peak Congestion Windows</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(structuredData as FootTrafficOptimization).peakCongestionHours?.map((hour, i) => (
                          <Badge key={i} variant="warning" size="sm">
                            {hour}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}

                {/* Recommendations Checklist */}
                <Card className="p-5 bg-card border-border space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Recommended Action Items & Mitigations
                  </h3>
                  <div className="space-y-2">
                    {((structuredData.recommendedActions ||
                      structuredData.urgentActionItems ||
                      structuredData.boothTrafficRecommendations ||
                      []) as string[]).map((action, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 text-xs text-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-muted-foreground">
                Generate a report to unlock structured KPI summary cards.
              </div>
            )}
          </TabsContent>

          {/* TAB 3: RAW JSON DATA */}
          <TabsContent value="raw">
            <Card className="p-4 bg-muted/40 border-border">
              <pre className="text-[11px] font-mono overflow-x-auto text-foreground p-2">
                {structuredData ? JSON.stringify(structuredData, null, 2) : "// No JSON output available"}
              </pre>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* SECTION 5: SAVED REPORTS HISTORY */}
      <div className="space-y-3 pt-6 border-t border-border/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <span>Saved Reports History</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Audit and review historical digests synthesized for this event.
            </p>
          </div>
          <Badge variant="outline" size="sm">
            {savedReports.length} reports archived
          </Badge>
        </div>

        {savedReports.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedReports.map((item) => {
              const isSelected = selectedHistoryId === item.id;
              const dateFormatted = new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectHistoryItem(item)}
                  onKeyDown={(e) => e.key === "Enter" && handleSelectHistoryItem(item)}
                  className={cn(
                    "p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between group",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary"
                      : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/20"
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="archetype" size="sm">
                        {item.reportType.replace(/_/g, " ")}
                      </Badge>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        title="Delete report"
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-foreground truncate">
                        {OPENROUTER_MODEL_SPECS[item.modelUsed]?.displayName || item.modelUsed}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{dateFormatted}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-primary">
                    <span>View Report</span>
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-border rounded-xl bg-card/40">
            <div className="text-xs text-muted-foreground">
              No historical reports saved yet. Reports generated via the synthesizer will be archived here automatically.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
