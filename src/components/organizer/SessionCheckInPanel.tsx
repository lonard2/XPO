"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CalendarCheck, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface GateEvent {
  id: string;
  title: string;
  isListingOnly?: boolean;
}

interface Session {
  id: string;
  title: string;
  location: string;
  startTime: string;
  endTime: string;
}

interface CheckInResult {
  name: string;
  email: string;
  already: boolean;
  sessionTitle: string;
}

/**
 * Session attendance for door staff. The same pass QR used at the gate marks
 * attendance at one selected session; repeats are reported, not duplicated.
 */
export function SessionCheckInPanel() {
  const t = useTranslations("organizer");

  const [events, setEvents] = React.useState<GateEvent[]>([]);
  const [eventId, setEventId] = React.useState("");
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [sessionId, setSessionId] = React.useState("");
  const [hash, setHash] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<CheckInResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/organizer/events?take=500")
      .then((res) => res.json())
      .then((data) => {
        const list = (data.events || []).filter((event: GateEvent) => !event.isListingOnly);
        setEvents(list);
        if (list[0]) setEventId(list[0].id);
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!eventId) return;
    setSessions([]);
    setSessionId("");
    setResult(null);
    fetch(`/api/organizer/events/${eventId}/agenda`)
      .then((res) => res.json())
      .then((data) => {
        const list: Session[] = data.sessions || [];
        setSessions(list);
        if (list[0]) setSessionId(list[0].id);
      })
      .catch(() => {});
  }, [eventId]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sessionId || !hash.trim()) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/agenda/${sessionId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeHash: hash.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        alreadyCheckedIn?: boolean;
        attendee?: { name: string; email: string };
        session?: { title: string };
      };
      if (!res.ok || !data.attendee) {
        throw new Error(data.error || t("sessionCheckInError"));
      }
      setResult({
        name: data.attendee.name,
        email: data.attendee.email,
        already: Boolean(data.alreadyCheckedIn),
        sessionTitle: data.session?.title || "",
      });
      setHash("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5 border-border/80 bg-card shadow-xs rounded-2xl">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <CalendarCheck className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("sessionCheckInTitle")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t("sessionCheckInDesc")}</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-4 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="text-xs font-semibold text-foreground">
            {t("sessionCheckInEvent")}
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-xs rounded-md bg-background border border-border min-h-[40px]"
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-foreground">
            {t("sessionCheckInSession")}
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-xs rounded-md bg-background border border-border min-h-[40px]"
            >
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {sessions.length === 0 && (
          <p className="text-[11px] text-muted-foreground">{t("sessionCheckInEmpty")}</p>
        )}

        <Input
          aria-label={t("sessionCheckInHash")}
          placeholder={t("sessionCheckInHash")}
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          className="min-h-[40px]"
        />

        {error && (
          <p role="alert" className="text-[11px] text-destructive">
            {error}
          </p>
        )}
        {result && (
          <p
            role="status"
            className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400"
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            {t(result.already ? "sessionCheckInAlready" : "sessionCheckInDone", {
              name: result.name,
              session: result.sessionTitle,
            })}
          </p>
        )}

        <Button
          type="submit"
          size="sm"
          disabled={busy || !sessionId || !hash.trim()}
          className="gap-1.5 min-h-[40px] cursor-pointer"
        >
          {t("sessionCheckInSubmit")}
        </Button>
      </form>
    </Card>
  );
}
