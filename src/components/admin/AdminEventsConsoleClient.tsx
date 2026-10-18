"use client";

import * as React from "react";
import Link from "next/link";
import { Search, PlusCircle, Undo2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export interface AdminEventItem {
  id: string;
  slug: string;
  title: string;
  archetype: string;
  startDate: string | Date;
  endDate: string | Date;
  organizerId?: string | null;
  organizerName?: string | null;
  isPlatformCurated?: boolean;
  showcaseJson?: string | null;
  venue?: { name: string; city?: string } | null;
  organizer?: { name: string; organization?: string | null } | null;
  _count?: { ticketTiers: number; booths: number; bookings: number };
}

interface AdminEventsConsoleClientProps {
  initialEvents: AdminEventItem[];
  locale: string;
  isLive: boolean;
}

function isCurated(e: AdminEventItem) {
  return e.isPlatformCurated || !e.organizerId;
}

function ownerLabel(e: AdminEventItem) {
  if (isCurated(e)) return "XPO Platform Administration";
  return e.organizer?.organization || e.organizer?.name || e.organizerName || "External organizer";
}

/** Admin visibility: who published showcase content and when, if any. */
function showcaseLine(e: AdminEventItem): string | null {
  if (!e.showcaseJson) return null;
  try {
    const s = JSON.parse(e.showcaseJson);
    const rows =
      (Array.isArray(s.programs) ? s.programs.length : 0) +
      (Array.isArray(s.alerts) ? s.alerts.length : 0) +
      (Array.isArray(s.channels) ? s.channels.length : 0) +
      (s.livestreamUrl ? 1 : 0);
    if (rows === 0) return null;
    const who = s.attestedBy || "unattested";
    const when = s.attestedAt ? ` · ${String(s.attestedAt).slice(0, 10)}` : "";
    return `Showcase: ${rows} row${rows === 1 ? "" : "s"} · by ${who}${when}`;
  } catch {
    return null;
  }
}

export function AdminEventsConsoleClient({ initialEvents, locale, isLive }: AdminEventsConsoleClientProps) {
  const [events, setEvents] = React.useState<AdminEventItem[]>(initialEvents);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [organizers, setOrganizers] = React.useState<Array<{ id: string; name: string; organization?: string | null }>>([]);
  const [assignFor, setAssignFor] = React.useState<string | null>(null);
  const [assignTo, setAssignTo] = React.useState<string>("");

  // Organizer directory for the assign picker (admin console only).
  React.useEffect(() => {
    if (!isLive) return;
    fetch("/api/admin/users?role=ORGANIZER")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrganizers(data.users);
      })
      .catch(() => {});
  }, [isLive]);

  const filtered = events.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return e.title.toLowerCase().includes(q) || (e.venue?.name || "").toLowerCase().includes(q);
  });
  const curated = filtered.filter(isCurated);
  const owned = filtered.filter((e) => !isCurated(e));

  const runAction = async (
    id: string,
    action: "release" | "delete",
    confirmText: string
  ) => {
    if (!isLive) {
      setFeedback({ type: "error", text: "Preview data is read-only. Connect the database to manage events." });
      return;
    }
    if (!confirm(confirmText)) return;
    setBusyId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/events/${id}/${action}`, { method: action === "delete" ? "DELETE" : "PATCH" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || `${action} failed`);
      if (action === "delete") {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      } else {
        setEvents((prev) => prev.map((e) => (e.id === id ? data.event : e)));
      }
      setFeedback({ type: "success", text: data.message });
    } catch (err) {
      setFeedback({ type: "error", text: (err as Error).message });
    } finally {
      setBusyId(null);
    }
  };

  const runAssign = async (id: string) => {
    if (!assignTo) {
      setFeedback({ type: "error", text: "Select an organizer first." });
      return;
    }
    setBusyId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/events/${id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizerId: assignTo }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Assign failed");
      setEvents((prev) => prev.map((e) => (e.id === id ? data.event : e)));
      setAssignFor(null);
      setAssignTo("");
      setFeedback({ type: "success", text: data.message });
    } catch (err) {
      setFeedback({ type: "error", text: (err as Error).message });
    } finally {
      setBusyId(null);
    }
  };

  const renderRow = (e: AdminEventItem) => (
    <Card key={e.id} className="border-border/80 bg-card shadow-xs rounded-2xl">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-foreground truncate">{e.title}</span>
            {isCurated(e) ? (
              <Badge variant="outline" className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 border-amber-500/40 bg-amber-500/10">
                Platform Curated
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px] font-semibold text-primary border-primary/40 bg-primary/5">
                {ownerLabel(e)}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {e.venue?.name || "Venue pending"}
            {e.startDate ? ` · ${new Date(e.startDate).toLocaleDateString(locale)}` : ""}
            {e._count ? ` · ${e._count.bookings} passes · ${e._count.booths} booths` : ""}
          </p>
          {showcaseLine(e) && (
            <p className="text-[11px] text-muted-foreground truncate">{showcaseLine(e)}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {isCurated(e) ? (
            assignFor === e.id ? (
              <span className="flex items-center gap-1.5">
                <select
                  aria-label={`Assign organizer for ${e.title}`}
                  value={assignTo}
                  onChange={(ev) => setAssignTo(ev.target.value)}
                  className="h-9 rounded-lg border border-input bg-background px-2 text-xs min-h-[44px] sm:min-h-[36px] max-w-[180px]"
                >
                  <option value="">Select organizer…</option>
                  {organizers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.organization || o.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busyId === e.id || !assignTo}
                  onClick={() => runAssign(e.id)}
                  className="h-9 gap-1.5 text-xs cursor-pointer"
                >
                  <span>Confirm</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setAssignFor(null); setAssignTo(""); }}
                  className="h-9 px-2 text-xs cursor-pointer"
                >
                  <span>Cancel</span>
                </Button>
              </span>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busyId === e.id || !isLive}
                onClick={() => { setAssignFor(e.id); setAssignTo(""); setFeedback(null); }}
                className="h-9 gap-1.5 text-xs cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Assign</span>
              </Button>
            )
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busyId === e.id}
              onClick={() => runAction(e.id, "release", `Release '${e.title}' back to platform curation? It will leave the organizer portal.`)}
              className="h-9 gap-1.5 text-xs cursor-pointer"
            >
              <Undo2 className="h-3.5 w-3.5" />
              <span>Release</span>
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busyId === e.id}
            onClick={() => runAction(e.id, "delete", `Permanently delete '${e.title}' and its ${e._count?.bookings ?? 0} bookings? This cannot be undone.`)}
            className="h-9 gap-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderGroup = (title: string, desc: string, list: AdminEventItem[]) => (
    <section className="space-y-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        <span className="text-xs font-mono text-muted-foreground">({list.length})</span>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">{desc}</p>
      {list.length === 0 ? (
        <p className="text-xs text-muted-foreground rounded-xl border border-dashed border-border/80 p-4 text-center">
          No events in this group.
        </p>
      ) : (
        <div className="space-y-2">{list.map(renderRow)}</div>
      )}
    </section>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground pointer-events-none" />
          <Input
            aria-label="Search events"
            placeholder="Search by title or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11 min-h-[44px]"
          />
        </div>
        <Link
          href={`/${locale}/events/new`}
          className={cn("inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-background px-4 text-xs font-semibold hover:bg-muted min-h-[44px] sm:min-h-[36px]")}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create via Wizard</span>
        </Link>
      </div>

      {feedback && (
        <p role={feedback.type === "error" ? "alert" : "status"} className={cn(
          "text-xs font-medium rounded-xl border px-3 py-2",
          feedback.type === "error"
            ? "text-destructive border-destructive/40 bg-destructive/5"
            : "text-emerald-700 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/5"
        )}>
          {feedback.text}
        </p>
      )}

      {renderGroup("Organizer Events", "Owned by organizers. Release returns one to platform curation.", owned)}
      {renderGroup("Platform-Curated Events", "Owned by XPO Platform Administration. Assign an organizer via API to move one.", curated)}
    </div>
  );
}
