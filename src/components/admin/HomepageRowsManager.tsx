"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { EDITORIAL_LOCALES } from "@/lib/discovery/editorial";

interface RowItem {
  id: string;
  title: string;
  subtitle?: string | null;
  titleI18n?: Record<string, string> | null;
  subtitleI18n?: Record<string, string> | null;
  regionId: string | null;
  position: number;
  eventIdsJson: string;
  isActive: boolean;
}

interface Candidate {
  id: string;
  title: string;
  startDate: string;
  regionId: string;
}

interface Draft {
  id?: string;
  title: string;
  subtitle: string;
  regionId: string;
  eventIds: string[];
  titleI18n: Record<string, string>;
  subtitleI18n: Record<string, string>;
}

const SCOPES = ["id", "jp", "global", "all"] as const;

const emptyDraft = (regionId: string): Draft => ({
  title: "",
  subtitle: "",
  regionId,
  eventIds: [],
  titleI18n: {},
  subtitleI18n: {},
});

export function HomepageRowsManager({ locale }: { locale: string }) {
  const tAdmin = useTranslations("admin");
  const tCom = useTranslations("common");
  const defaultOverride = (EDITORIAL_LOCALES as readonly string[]).includes(locale) ? locale : "id";
  const [scope, setScope] = React.useState<string>("id");
  const [rows, setRows] = React.useState<RowItem[]>([]);
  const [candidates, setCandidates] = React.useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [overrideLocale, setOverrideLocale] = React.useState<string>(defaultOverride);
  const [busy, setBusy] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [search, setSearch] = React.useState("");

  const load = React.useCallback(async (nextScope: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/homepage-rows?region=${nextScope}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setRows(data.rows ?? []);
        setCandidates(data.candidates ?? []);
      }
    } catch {
      // Keep the previous list on transient failure.
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load(scope);
  }, [load, scope]);

  const openNew = () => {
    setDraft(emptyDraft(scope === "all" ? "all" : scope));
    setOverrideLocale(defaultOverride);
    setFeedback(null);
  };

  const openEdit = (row: RowItem) => {
    let eventIds: string[] = [];
    try {
      const parsed = JSON.parse(row.eventIdsJson);
      if (Array.isArray(parsed)) eventIds = parsed;
    } catch {
      eventIds = [];
    }
    setDraft({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle ?? "",
      regionId: row.regionId ?? "all",
      eventIds,
      titleI18n: { ...(row.titleI18n ?? {}) },
      subtitleI18n: { ...(row.subtitleI18n ?? {}) },
    });
    setOverrideLocale(defaultOverride);
    setFeedback(null);
  };

  const save = async () => {
    if (!draft || !draft.title.trim()) {
      setFeedback({ type: "error", text: tAdmin("homepageRowsTitleRequired") });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const body = {
        title: draft.title.trim(),
        subtitle: draft.subtitle.trim() || null,
        titleI18n: draft.titleI18n,
        subtitleI18n: draft.subtitleI18n,
        regionId: draft.regionId === "all" ? null : draft.regionId,
        eventIds: draft.eventIds,
      };
      const res = await fetch(
        draft.id
          ? `/api/admin/homepage-rows/${draft.id}`
          : "/api/admin/homepage-rows",
        {
          method: draft.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Save failed");
      const savedScope = draft.regionId;
      setDraft(null);
      setFeedback({ type: "success", text: tAdmin("homepageRowsSaved") });
      if (savedScope !== scope) setScope(savedScope);
      else await load(scope);
    } catch (err) {
      setFeedback({ type: "error", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row: RowItem) => {
    if (!confirm(tAdmin("homepageRowsConfirmDelete", { title: row.title }))) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/homepage-rows/${row.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Delete failed");
      await load(scope);
    } catch (err) {
      setFeedback({ type: "error", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const move = async (row: RowItem, direction: -1 | 1) => {
    const index = rows.findIndex((r) => r.id === row.id);
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const ordered = rows.map((r) => r.id);
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    setBusy(true);
    try {
      const res = await fetch("/api/admin/homepage-rows/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regionId: scope === "all" ? null : scope,
          orderedIds: ordered,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Reorder failed");
      setRows(data.rows ?? rows);
    } catch (err) {
      setFeedback({ type: "error", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const filteredCandidates = React.useMemo(
    () =>
      candidates.filter((candidate) =>
        candidate.title.toLowerCase().includes(search.toLowerCase())
      ),
    [candidates, search]
  );

  const toggleActive = async (row: RowItem) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/homepage-rows/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: row.title,
          subtitle: row.subtitle ?? null,
          titleI18n: row.titleI18n ?? undefined,
          subtitleI18n: row.subtitleI18n ?? undefined,
          regionId: row.regionId,
          eventIds: JSON.parse(row.eventIdsJson) as string[],
          isActive: !row.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Toggle failed");
      await load(scope);
    } catch (err) {
      setFeedback({ type: "error", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const toggleEvent = (id: string) => {
    if (!draft) return;
    setDraft({
      ...draft,
      eventIds: draft.eventIds.includes(id)
        ? draft.eventIds.filter((e) => e !== id)
        : [...draft.eventIds, id],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="homepage-row-scope" className="text-xs font-semibold text-foreground">
            {tAdmin("homepageRowsScope")}
          </label>
          <select
            id="homepage-row-scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-2 text-xs min-h-[44px] sm:min-h-[36px]"
          >
            {SCOPES.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? tAdmin("homepageRowsAllEditions") : s}
              </option>
            ))}
          </select>
        </div>
        <Button type="button" size="sm" onClick={openNew} className="h-9 gap-1.5 text-xs cursor-pointer">
          <Plus className="h-3.5 w-3.5" />
          <span>{tAdmin("homepageRowsNew")}</span>
        </Button>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Input
          aria-label={tAdmin("homepageRowsSearch")}
          placeholder={tAdmin("homepageRowsSearch")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10"
        />
      </div>

      {feedback && (
        <p role={feedback.type === "error" ? "alert" : "status"} className="text-xs font-medium text-muted-foreground">
          {feedback.text}
        </p>
      )}

      {isLoading ? (
        <p className="text-xs text-muted-foreground">{tAdmin("homepageRowsLoading")}</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-muted-foreground rounded-xl border border-dashed border-border/80 p-4 text-center">
          {tAdmin("homepageRowsEmpty")}
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) => (
            <Card key={row.id} className="border-border/80 bg-card shadow-xs rounded-2xl">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{row.title}</span>
                    <Badge variant="outline" className="text-[11px]">
                      {row.regionId ?? "all"}
                    </Badge>
                  </div>
                  {row.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{row.subtitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={tAdmin("homepageRowsMoveUp")}
                    disabled={busy || index === 0}
                    onClick={() => move(row, -1)}
                    className="h-9 w-9 p-0 cursor-pointer"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={tAdmin("homepageRowsMoveDown")}
                    disabled={busy || index === rows.length - 1}
                    onClick={() => move(row, 1)}
                    className="h-9 w-9 p-0 cursor-pointer"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(row)}
                    disabled={busy}
                    className="h-9 text-xs cursor-pointer"
                  >
                    <span>{row.isActive ? tAdmin("homepageRowsHide") : tAdmin("homepageRowsShow")}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(row)}
                    className="h-9 gap-1.5 text-xs cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>{tAdmin("homepageRowsEditTitle")}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(row)}
                    disabled={busy}
                    className="h-9 gap-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{tAdmin("homepageRowsDelete")}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.id ? tAdmin("homepageRowsEditTitle") : tAdmin("homepageRowsNewTitle")}
        description="Title, subtitle, scope, and an ordered event list."
        size="lg"
      >
        {draft && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="row-title" className="block text-xs font-medium text-foreground">
                {tAdmin("homepageRowsTitleField")}
              </label>
              <Input
                id="row-title"
                value={draft.title}
                maxLength={80}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="row-subtitle" className="block text-xs font-medium text-foreground">
                {tAdmin("homepageRowsSubtitleField")}
              </label>
              <Input
                id="row-subtitle"
                value={draft.subtitle}
                maxLength={160}
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="row-scope" className="block text-xs font-medium text-foreground">
                {tAdmin("homepageRowsScope")}
              </label>
              <select
                id="row-scope"
                value={draft.regionId}
                onChange={(e) => setDraft({ ...draft, regionId: e.target.value })}
                className="w-full h-9 rounded-lg border border-input bg-background px-2 text-xs min-h-[44px] sm:min-h-[36px]"
              >
                {SCOPES.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? tAdmin("homepageRowsAllEditions") : s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-medium text-foreground">
                {tAdmin("homepageRowsLocalized")}
              </span>
              <select
                aria-label={tAdmin("homepageRowsLocalized")}
                value={overrideLocale}
                onChange={(e) => setOverrideLocale(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-background px-2 text-xs min-h-[44px] sm:min-h-[36px]"
              >
                {EDITORIAL_LOCALES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
              <Input
                aria-label={`${overrideLocale} title`}
                placeholder={`${overrideLocale} title`}
                value={draft.titleI18n[overrideLocale] ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    titleI18n: { ...draft.titleI18n, [overrideLocale]: e.target.value },
                  })
                }
              />
              <Input
                aria-label={`${overrideLocale} subtitle`}
                placeholder={`${overrideLocale} subtitle`}
                value={draft.subtitleI18n[overrideLocale] ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    subtitleI18n: { ...draft.subtitleI18n, [overrideLocale]: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-medium text-foreground">
                {tAdmin("homepageRowsEvents")} ({tAdmin("homepageRowsEventCount", { count: draft.eventIds.length })})
              </span>
              <div className="max-h-52 overflow-y-auto rounded-xl border border-border/80 divide-y divide-border/60">
                {filteredCandidates.length === 0 ? (
                  <p className="p-3 text-xs text-muted-foreground">{tAdmin("homepageRowsNoEligible")}</p>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <label
                      key={candidate.id}
                      className={cn(
                        "flex items-center gap-2 p-2.5 text-xs cursor-pointer",
                        draft.eventIds.includes(candidate.id) ? "bg-primary/5" : ""
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={draft.eventIds.includes(candidate.id)}
                        onChange={() => toggleEvent(candidate.id)}
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                      <span className="text-foreground">{candidate.title}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDraft(null)} className="h-9 text-xs cursor-pointer">
                <span>{tCom("cancel")}</span>
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={busy}
                onClick={save}
                className="h-9 text-xs cursor-pointer"
              >
                <span>{tAdmin("homepageRowsSave")}</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
