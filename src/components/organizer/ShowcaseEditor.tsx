"use client";

import * as React from "react";
import { Plus, Trash2, Radio, Bell, Layers, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import {
  parseShowcase,
  validateShowcase,
  SHOWCASE_LIMITS,
  type ShowcaseProgram,
} from "@/lib/showcase";

interface ShowcaseEditorProps {
  eventId: string;
  initialJson: string | null;
  className?: string;
}

const PROGRAM_KINDS = ["bounty", "lineup", "runway", "pitch", "demo", "generic"] as const;

const emptyProgram = (): ShowcaseProgram => ({ kind: "generic", title: "", detail: "", sponsor: "" });

export function ShowcaseEditor({ eventId, initialJson, className }: ShowcaseEditorProps) {
  const initial = React.useMemo(() => parseShowcase(initialJson), [initialJson]);
  const [livestreamUrl, setLivestreamUrl] = React.useState(initial.livestreamUrl || "");
  const [livestreamLive, setLivestreamLive] = React.useState(initial.livestreamLive);
  const [programs, setPrograms] = React.useState<ShowcaseProgram[]>(initial.programs);
  const [alerts, setAlerts] = React.useState<string[]>(initial.alerts);
  const [channels, setChannels] = React.useState(initial.channels);
  const [saving, setSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const updateProgram = (i: number, patch: Partial<ShowcaseProgram>) =>
    setPrograms((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const save = async () => {
    setSaving(true);
    setFeedback(null);
    const payload = {
      livestreamUrl: livestreamUrl.trim(),
      livestreamLive,
      programs: programs.filter((p) => p.title.trim() !== ""),
      alerts: alerts.map((a) => a.trim()).filter(Boolean),
      channels: channels.filter((c) => c.code.trim() !== "" && c.lang.trim() !== ""),
    };
    const checked = validateShowcase(payload);
    if (!checked.ok) {
      const first = Object.values(checked.issues || {})[0] || "Invalid content.";
      setFeedback({ type: "error", text: first });
      setSaving(false);
      return;
    }
    try {
      const res = await fetch(`/api/organizer/events/${eventId}/showcase`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checked.data),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Save failed.");
      setFeedback({ type: "success", text: "Showcase content saved. Sections render where data exists." });
    } catch (err) {
      setFeedback({ type: "error", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 sm:p-6 space-y-5", className)}>
      <div>
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" />
          Showcase Content
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Organizer-entered rows only. Empty sections stay hidden on the event page — nothing invented.
        </p>
      </div>

      {/* Livestream */}
      <div className="space-y-2 pt-3 border-t border-border/60">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Livestream
        </span>
        <Input
          label="Stream URL"
          placeholder="https://…"
          value={livestreamUrl}
          onChange={(e) => setLivestreamUrl(e.target.value)}
        />
        <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            checked={livestreamLive}
            onChange={(e) => setLivestreamLive(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Currently live
        </label>
      </div>

      {/* Program rows */}
      <div className="space-y-2 pt-3 border-t border-border/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Program Rows ({programs.length}/{SHOWCASE_LIMITS.programs})
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={programs.length >= SHOWCASE_LIMITS.programs}
            onClick={() => setPrograms((p) => [...p, emptyProgram()])}
            className="h-8 gap-1 text-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add row
          </Button>
        </div>
        {programs.map((p, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 rounded-lg border border-border/60 bg-muted/30 p-2.5">
            <select
              aria-label="Program kind"
              value={p.kind}
              onChange={(e) => updateProgram(i, { kind: e.target.value as ShowcaseProgram["kind"] })}
              className="col-span-4 sm:col-span-3 h-9 rounded-md border border-input bg-background px-1.5 text-xs min-h-[44px] sm:min-h-[36px]"
            >
              {PROGRAM_KINDS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <Input
              aria-label="Program title"
              placeholder="Title"
              value={p.title}
              onChange={(e) => updateProgram(i, { title: e.target.value })}
              className="col-span-7 sm:col-span-4 h-9 text-xs"
            />
            <Input
              aria-label="Program detail"
              placeholder="Detail"
              value={p.detail || ""}
              onChange={(e) => updateProgram(i, { detail: e.target.value })}
              className="col-span-10 sm:col-span-4 h-9 text-xs"
            />
            <div className="col-span-2 sm:col-span-1 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove program row ${i + 1}`}
                onClick={() => setPrograms((prev) => prev.filter((_, idx) => idx !== i))}
                className="h-9 w-9 min-h-[44px] min-w-[44px] text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              aria-label="Program sponsor (optional)"
              placeholder="Sponsor (optional)"
              value={p.sponsor || ""}
              onChange={(e) => updateProgram(i, { sponsor: e.target.value })}
              className="col-span-12 h-9 text-xs"
            />
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div className="space-y-2 pt-3 border-t border-border/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" /> Alerts ({alerts.length}/{SHOWCASE_LIMITS.alerts})
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={alerts.length >= SHOWCASE_LIMITS.alerts}
            onClick={() => setAlerts((a) => [...a, ""])}
            className="h-8 gap-1 text-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add alert
          </Button>
        </div>
        {alerts.map((a, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              aria-label={`Alert ${i + 1}`}
              placeholder="Announcement text"
              value={a}
              onChange={(e) => setAlerts((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))}
              className="h-9 text-xs"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove alert ${i + 1}`}
              onClick={() => setAlerts((prev) => prev.filter((_, idx) => idx !== i))}
              className="h-9 w-9 min-h-[44px] min-w-[44px] shrink-0 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Channels */}
      <div className="space-y-2 pt-3 border-t border-border/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Channels ({channels.length}/{SHOWCASE_LIMITS.channels})
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={channels.length >= SHOWCASE_LIMITS.channels}
            onClick={() => setChannels((c) => [...c, { code: "", lang: "", note: "" }])}
            className="h-8 gap-1 text-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Add channel
          </Button>
        </div>
        {channels.map((c, i) => (
          <div key={i} className="grid grid-cols-12 gap-2">
            <Input
              aria-label={`Channel ${i + 1} code`}
              placeholder="CH 1"
              value={c.code}
              onChange={(e) => setChannels((prev) => prev.map((x, idx) => (idx === i ? { ...x, code: e.target.value } : x)))}
              className="col-span-3 h-9 text-xs"
            />
            <Input
              aria-label={`Channel ${i + 1} language`}
              placeholder="Language"
              value={c.lang}
              onChange={(e) => setChannels((prev) => prev.map((x, idx) => (idx === i ? { ...x, lang: e.target.value } : x)))}
              className="col-span-6 h-9 text-xs"
            />
            <div className="col-span-3 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove channel ${i + 1}`}
                onClick={() => setChannels((prev) => prev.filter((_, idx) => idx !== i))}
                className="h-9 w-9 min-h-[44px] min-w-[44px] text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {feedback && (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className="text-xs font-medium flex items-center gap-1.5"
        >
          {feedback.type === "error" ? (
            <AlertCircle className="h-4 w-4 text-destructive" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          )}
          <span className={feedback.type === "error" ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}>
            {feedback.text}
          </span>
        </p>
      )}

      <div className="flex items-center justify-between pt-1">
        <Badge variant="outline" size="sm" className="text-[11px] text-muted-foreground">
          Only filled rows publish
        </Badge>
        <Button
          type="button"
          onClick={save}
          disabled={saving}
          className="gap-1.5 text-xs font-semibold min-h-[44px] cursor-pointer"
        >
          {saving ? "Saving…" : "Save Showcase"}
        </Button>
      </div>
    </div>
  );
}
