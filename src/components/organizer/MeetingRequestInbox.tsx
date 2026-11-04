"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { X, Inbox, Mail, Building2, Ticket, Store, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Optional schedule attached to a confirm or a reschedule. Empty means the
 * meeting is confirmed without a fixed time; the organizer follows up.
 */
function ScheduleFields({
  busy,
  submitLabel,
  initialScheduledAt = null,
  initialLocation = "",
  onSubmit,
}: {
  busy: boolean;
  submitLabel: string;
  initialScheduledAt?: string | null;
  initialLocation?: string;
  onSubmit: (schedule: { scheduledAt?: string; location?: string }) => void;
}) {
  const t = useTranslations("organizer");
  const [scheduledAt, setScheduledAt] = React.useState(() => toLocalInputValue(initialScheduledAt));
  const [location, setLocation] = React.useState(initialLocation);

  return (
    <div className="mt-2 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
      <label className="text-[11px] font-semibold text-foreground">
        {t("meetingScheduleWhen") || "Date and time"}
        <Input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="mt-1 min-h-[40px]"
        />
      </label>
      <label className="text-[11px] font-semibold text-foreground">
        {t("meetingScheduleWhere") || "Location"}
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Hall A1, Table B-12"
          maxLength={200}
          className="mt-1 min-h-[40px]"
        />
      </label>
      <Button
        type="button"
        size="sm"
        disabled={busy}
        onClick={() =>
          onSubmit({
            ...(scheduledAt ? { scheduledAt: new Date(scheduledAt).toISOString() } : {}),
            ...(location.trim() ? { location: location.trim() } : {}),
          })
        }
        className="gap-1.5 min-h-[40px] cursor-pointer"
      >
        <Check className="h-3.5 w-3.5" />
        {submitLabel}
      </Button>
    </div>
  );
}

export interface MeetingRequestRow {
  id: string;
  type: string;
  requesterName: string;
  requesterEmail: string;
  target: string;
  slot: string;
  message: string;
  status: string;
  scheduledAt: string | null;
  location: string;
  booking: { id: string; status: string; attendeeName: string; ticketTier: { id: string; name: string } } | null;
  booth: { id: string; companyName: string; boothNumber: string; hallName: string } | null;
  requesterInterests: string[];
  createdAt: string | Date;
  event: { id: string; title: string; slug: string };
}

type Decision = "CONFIRMED" | "DECLINED";

function statusVariant(status: string): "warning" | "success" | "destructive" {
  if (status === "CONFIRMED") return "success";
  if (status === "DECLINED") return "destructive";
  return "warning";
}

/**
 * Organizer inbox for meeting and RFQ requests. Pending requests come first;
 * deciding one writes through the API and updates the row in place.
 */
export function MeetingRequestInbox({
  initialRequests,
}: {
  initialRequests: MeetingRequestRow[];
}) {
  const t = useTranslations("organizer");
  const locale = useLocale();
  const [rows, setRows] = React.useState(initialRequests);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const dateFormat = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale]
  );

  const scheduleDisplay = React.useCallback(
    (iso: string) => {
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return iso;
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    },
    [locale]
  );

  const pendingCount = rows.filter((row) => row.status === "PENDING").length;
  const ordered = React.useMemo(
    () =>
      [...rows].sort((a, b) => {
        const aPending = a.status === "PENDING" ? 0 : 1;
        const bPending = b.status === "PENDING" ? 0 : 1;
        if (aPending !== bPending) return aPending - bPending;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [rows]
  );

  async function decide(
    id: string,
    status: Decision,
    schedule?: { scheduledAt?: string; location?: string }
  ) {
    setBusy(id);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/meetings/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...schedule }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        request?: { scheduledAt?: string | null; location?: string };
      };
      if (!res.ok) throw new Error(data.error || t("meetingRequestError"));
      setRows((current) =>
        current.map((row) =>
          row.id === id
            ? {
                ...row,
                status,
                scheduledAt: data.request?.scheduledAt ?? row.scheduledAt,
                location: data.request?.location ?? row.location,
              }
            : row
        )
      );
      setNotice(t("meetingRequestUpdated"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function reschedule(id: string, schedule: { scheduledAt?: string; location?: string }) {
    setBusy(id);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/meetings/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        request?: { scheduledAt?: string | null; location?: string };
      };
      if (!res.ok) throw new Error(data.error || t("meetingRequestError"));
      setRows((current) =>
        current.map((row) =>
          row.id === id
            ? {
                ...row,
                scheduledAt: data.request?.scheduledAt ?? row.scheduledAt,
                location: data.request?.location ?? row.location,
              }
            : row
        )
      );
      setNotice(t("meetingRequestUpdated"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function statusLabel(status: string) {
    if (status === "CONFIRMED") return t("meetingRequestStatusConfirmed");
    if (status === "DECLINED") return t("meetingRequestStatusDeclined");
    return t("meetingRequestStatusPending");
  }

  return (
    <Card className="p-5 border-border/80 bg-card shadow-xs rounded-2xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Inbox className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {t("meetingRequestsTitle")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("meetingRequestsDesc")}
            </p>
          </div>
        </div>
        {pendingCount > 0 && (
          <Badge variant="warning" size="sm">
            {pendingCount} {t("meetingRequestStatusPending")}
          </Badge>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs text-destructive">
          {error}
        </p>
      )}
      {notice && !error && (
        <p role="status" className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
          {notice}
        </p>
      )}

      {ordered.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">{t("meetingRequestsEmpty")}</p>
      ) : (
        <ul className="mt-4 divide-y divide-border/70">
          {ordered.map((row) => (
            <li key={row.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" size="sm" className="font-mono">
                  {row.type.replace(/_/g, " ")}
                </Badge>
                <Badge variant={statusVariant(row.status)} size="sm">
                  {statusLabel(row.status)}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {dateFormat.format(new Date(row.createdAt))}
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-sm font-semibold text-foreground">
                  {row.requesterName}
                </span>
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {row.requesterEmail}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {row.event.title}
                </span>
                {row.target && <span>{row.target}</span>}
                {row.slot && <span>{row.slot}</span>}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                {row.booking ? (
                  <Badge variant="outline" size="sm" className="gap-1">
                    <Ticket className="h-3 w-3" />
                    {row.booking.ticketTier.name} · {row.booking.status}
                  </Badge>
                ) : (
                  <Badge variant="outline" size="sm" className="text-muted-foreground">
                    {t("meetingNoPass") || "No pass linked"}
                  </Badge>
                )}
                {row.booth && (
                  <Badge variant="outline" size="sm" className="gap-1">
                    <Store className="h-3 w-3" />
                    {row.booth.companyName} · {row.booth.boothNumber}
                  </Badge>
                )}
                {row.requesterInterests.length > 0 && (
                  <span className="text-muted-foreground">
                    {t("meetingInterests") || "Interests"}: {row.requesterInterests.join(", ")}
                  </span>
                )}
              </div>

              {row.message && (
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                  {row.message}
                </p>
              )}

              {row.status === "CONFIRMED" && (row.scheduledAt || row.location) && (
                <p className="mt-1.5 text-xs font-medium text-foreground">
                  {[row.scheduledAt ? scheduleDisplay(row.scheduledAt) : null, row.location || null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}

              {row.status === "PENDING" && (
                <ScheduleFields
                  key={`pending-${row.id}`}
                  busy={busy === row.id}
                  submitLabel={t("meetingRequestAccept")}
                  onSubmit={(schedule) => decide(row.id, "CONFIRMED", schedule)}
                />
              )}
              {row.status === "PENDING" && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy === row.id}
                    onClick={() => decide(row.id, "DECLINED")}
                    className="gap-1.5 min-h-[36px] cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    {t("meetingRequestDecline")}
                  </Button>
                </div>
              )}
              {row.status === "CONFIRMED" && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground min-h-[32px] inline-flex items-center">
                    {t("meetingReschedule") || "Change time or location"}
                  </summary>
                  <div className="mt-1">
                    <ScheduleFields
                      key={`confirmed-${row.id}-${row.scheduledAt}-${row.location}`}
                      busy={busy === row.id}
                      initialScheduledAt={row.scheduledAt}
                      initialLocation={row.location}
                      submitLabel={t("meetingScheduleSave") || "Save schedule"}
                      onSubmit={(schedule) => reschedule(row.id, schedule)}
                    />
                  </div>
                </details>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
