"use client";

import * as React from "react";
import Link from "next/link";
import { Search, PlusCircle, Undo2, Trash2, PenLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { cn } from "@/lib/utils";
import { EDITORIAL_LOCALES } from "@/lib/discovery/editorial";

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
  editorialBlurb?: string | null;
  editorialBlurbI18n?: Record<string, string> | null;
  editorialApproved?: boolean;
  pageSize?: string | null;
  visibility?: string | null;
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
  const [blurbFor, setBlurbFor] = React.useState<AdminEventItem | null>(null);
  const [blurbText, setBlurbText] = React.useState("");
  const [blurbI18n, setBlurbI18n] = React.useState<Record<string, string>>({});
  const [blurbApproved, setBlurbApproved] = React.useState(false);
  const [reviewFilter, setReviewFilter] = React.useState<"DRAFT" | "APPROVED">("DRAFT");
  const [reviewItems, setReviewItems] = React.useState<Array<{
    id: string;
    title: string;
    body: string;
    status: string;
    event?: { id: string; title: string; regionId?: string } | null;
  }>>([]);
  const [reviewLoading, setReviewLoading] = React.useState(false);
  const [slotRegion, setSlotRegion] = React.useState("id");
  const [slotIds, setSlotIds] = React.useState<string[]>([]);
  const [slotTitles, setSlotTitles] = React.useState<Record<string, string>>({});
  const [slotAddId, setSlotAddId] = React.useState("");
  const [slotOptions, setSlotOptions] = React.useState<Array<{ id: string; title: string }>>([]);

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

  const openBlurbEditor = (e: AdminEventItem) => {
    setBlurbFor(e);
    setBlurbText(e.editorialBlurb ?? "");
    setBlurbI18n({ ...(e.editorialBlurbI18n ?? {}) });
    setBlurbApproved(e.editorialApproved ?? false);
    setFeedback(null);
  };

  const runBlurbSave = async () => {
    if (!blurbFor) return;
    if (!isLive) {
      setFeedback({ type: "error", text: "Preview data is read-only. Connect the database to manage events." });
      return;
    }
    setBusyId(blurbFor.id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/events/${blurbFor.id}/blurb`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editorialBlurb: blurbText,
          editorialBlurbI18n: blurbI18n,
          editorialApproved: blurbApproved,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Blurb save failed");
      setEvents((prev) => prev.map((e) => (e.id === blurbFor.id ? data.event : e)));
      setBlurbFor(null);
      setFeedback({ type: "success", text: data.message });
    } catch (err) {
      setFeedback({ type: "error", text: (err as Error).message });
    } finally {
      setBusyId(null);
    }
  };

  const loadReview = React.useCallback(async (filter: "DRAFT" | "APPROVED") => {
    if (!isLive) return;
    setReviewLoading(true);
    try {
      const res = await fetch(`/api/admin/updates?status=${filter}`);
      const data = await res.json();
      if (res.ok && data.success) setReviewItems(data.updates ?? []);
    } catch {
      // Keep previous list on transient failure.
    } finally {
      setReviewLoading(false);
    }
  }, [isLive]);

  const loadSlots = React.useCallback(async (region: string) => {
    if (!isLive) return;
    try {
      const [slotsRes, approvedRes] = await Promise.all([
        fetch(`/api/admin/news-slots?region=${region}`),
        fetch(`/api/admin/updates?status=APPROVED&region=${region}`),
      ]);
      const slotsData = await slotsRes.json();
      const approvedData = await approvedRes.json();
      if (slotsRes.ok && slotsData.success) {
        const list = (slotsData.slots ?? []) as Array<{ updateId: string; update?: { id: string; title: string } | null }>;
        setSlotIds(list.map((s) => s.updateId));
        const titles: Record<string, string> = {};
        for (const s of list) {
          if (s.update) titles[s.update.id] = s.update.title;
        }
        setSlotTitles(titles);
      }
      if (approvedRes.ok && approvedData.success) {
        setSlotOptions(
          ((approvedData.updates ?? []) as Array<{ id: string; title: string }>).map((u) => ({
            id: u.id,
            title: u.title,
          }))
        );
      }
    } catch {
      // Keep previous slots on transient failure.
    }
  }, [isLive]);

  const runModerate = async (updateId: string, approved: boolean) => {
    if (!isLive) {
      setFeedback({ type: "error", text: "Preview data is read-only. Connect the database to manage events." });
      return;
    }
    setBusyId(updateId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/updates/${updateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Moderation failed");
      setFeedback({ type: "success", text: data.message ?? "Update moderated." });
      await loadReview(reviewFilter);
    } catch (err) {
      setFeedback({ type: "error", text: (err as Error).message });
    } finally {
      setBusyId(null);
    }
  };

  const runSaveSlots = async () => {
    if (!isLive) {
      setFeedback({ type: "error", text: "Preview data is read-only. Connect the database to manage events." });
      return;
    }
    setBusyId(`slots-${slotRegion}`);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/news-slots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regionId: slotRegion, slots: slotIds }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Slot save failed");
      setFeedback({ type: "success", text: "Homepage slots saved." });
      await loadSlots(slotRegion);
    } catch (err) {
      setFeedback({ type: "error", text: (err as Error).message });
    } finally {
      setBusyId(null);
    }
  };

  const runPresentation = async (
    id: string,
    patch: { pageSize?: string | null; visibility?: string }
  ) => {
    if (!isLive) {
      setFeedback({ type: "error", text: "Preview data is read-only. Connect the database to manage events." });
      return;
    }
    setBusyId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/events/${id}/presentation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Presentation save failed");
      setEvents((prev) => prev.map((e) => (e.id === id ? data.event : e)));
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
            variant="outline"
            size="sm"
            disabled={busyId === e.id || !isLive}
            onClick={() => openBlurbEditor(e)}
            className="h-9 gap-1.5 text-xs cursor-pointer"
          >
            <PenLine className="h-3.5 w-3.5" />
            <span>Editorial</span>
          </Button>
          <select
            aria-label={`Page size for ${e.title}`}
            value={e.pageSize || ""}
            disabled={busyId === e.id || !isLive}
            onChange={(ev) => runPresentation(e.id, { pageSize: ev.target.value || null })}
            className="h-9 rounded-lg border border-input bg-background px-2 text-xs min-h-[44px] sm:min-h-[36px] max-w-[130px] cursor-pointer"
          >
            <option value="">Tier: venue</option>
            <option value="LARGE">Tier: large</option>
            <option value="MEDIUM">Tier: medium</option>
            <option value="SMALL">Tier: small</option>
          </select>
          <select
            aria-label={`Visibility for ${e.title}`}
            value={e.visibility || "PUBLIC"}
            disabled={busyId === e.id || !isLive}
            onChange={(ev) => {
              if (confirm(`Set '${e.title}' visibility to ${ev.target.value}? Discreet hides identity; hidden unlists.`)) {
                runPresentation(e.id, { visibility: ev.target.value });
              }
            }}
            className="h-9 rounded-lg border border-input bg-background px-2 text-xs min-h-[44px] sm:min-h-[36px] max-w-[130px] cursor-pointer"
          >
            <option value="PUBLIC">Public</option>
            <option value="DISCREET">Discreet</option>
            <option value="HIDDEN">Hidden</option>
          </select>
          {!isLive && (
            <span className="text-[11px] text-muted-foreground">Preview data is read-only.</span>
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

  const [tab, setTab] = React.useState("events");

  const openNewsTab = (value: string) => {
    setTab(value);
    if (value === "news" && isLive) {
      void loadReview(reviewFilter);
      void loadSlots(slotRegion);
    }
  };

  return (
    <div className="space-y-8">
      <Tabs value={tab} onValueChange={openNewsTab}>
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="news" disabled={!isLive}>News review</TabsTrigger>
        </TabsList>
        {!isLive && (
          <p className="text-[11px] text-muted-foreground">Preview data is read-only.</p>
        )}
        <TabsContent value="events">
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
        </TabsContent>
        <TabsContent value="news">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {(["DRAFT", "APPROVED"] as const).map((f) => (
                <Button
                  key={f}
                  type="button"
                  variant={reviewFilter === f ? "primary" : "outline"}
                  size="sm"
                  onClick={() => {
                    setReviewFilter(f);
                    void loadReview(f);
                  }}
                  className="h-9 text-xs cursor-pointer"
                >
                  <span>{f === "DRAFT" ? "Pending" : "Approved"}</span>
                </Button>
              ))}
            </div>
            {reviewLoading ? (
              <p className="text-xs text-muted-foreground">Loading updates…</p>
            ) : reviewItems.length === 0 ? (
              <p className="text-xs text-muted-foreground rounded-xl border border-dashed border-border/80 p-4 text-center">
                No updates in this state.
              </p>
            ) : (
              <div className="space-y-2">
                {reviewItems.map((u) => (
                  <Card key={u.id} className="border-border/80 bg-card shadow-xs rounded-2xl">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="text-sm font-bold text-foreground">{u.title}</span>
                        <p className="text-xs text-muted-foreground truncate">
                          {u.event?.title || "Event removed"}
                          {u.event?.regionId ? ` · ${u.event.regionId}` : ""}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busyId === u.id}
                        onClick={() => runModerate(u.id, u.status !== "APPROVED")}
                        className="h-9 gap-1.5 text-xs cursor-pointer shrink-0"
                      >
                        <span>{u.status === "APPROVED" ? "Unapprove" : "Approve"}</span>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <div className="rounded-2xl border border-border/80 p-4 space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="news-slot-region" className="block text-xs font-medium text-foreground">
                  Slots for region
                </label>
                <select
                  id="news-slot-region"
                  value={slotRegion}
                  onChange={(ev) => {
                    setSlotRegion(ev.target.value);
                    void loadSlots(ev.target.value);
                  }}
                  className="h-9 rounded-lg border border-input bg-background px-2 text-xs min-h-[44px] sm:min-h-[36px] max-w-[220px]"
                >
                  <option value="id">Indonesia (id)</option>
                  <option value="jp">Japan (jp)</option>
                  <option value="global">Global (global)</option>
                </select>
              </div>
              {slotIds.length === 0 ? (
                <p className="text-xs text-muted-foreground">No slots saved for this region.</p>
              ) : (
                <ul className="space-y-1.5">
                  {slotIds.map((id, idx) => (
                    <li key={id} className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-muted-foreground w-6">{idx + 1}.</span>
                      <span className="flex-1 truncate text-foreground">{slotTitles[id] || id}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSlotIds((prev) => prev.filter((s) => s !== id))}
                        className="h-8 px-2 text-xs cursor-pointer"
                      >
                        <span>Remove</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Add approved update to slots"
                  value={slotAddId}
                  onChange={(ev) => setSlotAddId(ev.target.value)}
                  className="h-9 rounded-lg border border-input bg-background px-2 text-xs min-h-[44px] sm:min-h-[36px] max-w-[260px]"
                >
                  <option value="">Add approved update…</option>
                  {slotOptions
                    .filter((o) => !slotIds.includes(o.id))
                    .map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title}
                      </option>
                    ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!slotAddId}
                  onClick={() => {
                    if (slotAddId) {
                      setSlotIds((prev) => [...prev, slotAddId]);
                      setSlotAddId("");
                    }
                  }}
                  className="h-9 text-xs cursor-pointer"
                >
                  <span>Add</span>
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={busyId === `slots-${slotRegion}`}
                  onClick={runSaveSlots}
                  className="h-9 text-xs cursor-pointer"
                >
                  <span>Save slots</span>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Modal
        isOpen={blurbFor !== null}
        onClose={() => setBlurbFor(null)}
        title={blurbFor ? `Editorial blurb — ${blurbFor.title}` : "Editorial blurb"}
        description="Carousel footnote. Renders only when approved; empty locales fall back to the default."
        size="lg"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="blurb-default" className="block text-xs font-medium text-foreground">
              Default blurb (English) <span className="text-muted-foreground font-mono">{blurbText.length}/280</span>
            </label>
            <textarea
              id="blurb-default"
              rows={3}
              maxLength={280}
              value={blurbText}
              onChange={(ev) => setBlurbText(ev.target.value)}
              placeholder="Editors pick: why this event matters."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
            />
          </div>
          {EDITORIAL_LOCALES.filter((code) => code !== "en").map((code) => (
            <div key={code} className="space-y-1.5">
              <label htmlFor={`blurb-${code}`} className="block text-xs font-medium text-foreground">
                {code} <span className="text-muted-foreground font-mono">{(blurbI18n[code] ?? "").length}/280</span>
              </label>
              <textarea
                id={`blurb-${code}`}
                rows={2}
                maxLength={280}
                value={blurbI18n[code] ?? ""}
                onChange={(ev) => setBlurbI18n((prev) => ({ ...prev, [code]: ev.target.value }))}
                placeholder="Empty falls back to the default."
                className="flex min-h-[64px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
              />
            </div>
          ))}
          <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={blurbApproved}
              onChange={(ev) => setBlurbApproved(ev.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            Approved for carousel
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setBlurbFor(null)} className="h-9 text-xs cursor-pointer">
              <span>Cancel</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={busyId === blurbFor?.id}
              onClick={runBlurbSave}
              className="h-9 text-xs cursor-pointer"
            >
              <span>Save</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
