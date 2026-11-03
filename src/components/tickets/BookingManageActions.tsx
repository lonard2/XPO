"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, Ban } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface BookingManageActionsProps {
  bookingId: string;
  attendeeName: string;
  attendeeEmail: string;
  status: string;
  onChanged?: () => void;
}

/**
 * Holder actions on a confirmed pass: transfer to another person, or cancel
 * and release the seat. Both write through the API; the server decides who
 * may act.
 */
export function BookingManageActions({
  bookingId,
  attendeeName,
  attendeeEmail,
  status,
  onChanged,
}: BookingManageActionsProps) {
  const t = useTranslations("myTickets");
  const tCom = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const [mode, setMode] = React.useState<"idle" | "transfer" | "cancel">("idle");
  const [name, setName] = React.useState(attendeeName);
  const [email, setEmail] = React.useState(attendeeEmail);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  if (status !== "CONFIRMED") return null;

  async function call(path: string, body?: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || t("manageError"));
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function submitTransfer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = await call("transfer", { attendeeName: name, attendeeEmail: email, locale });
    if (ok) {
      setNotice(t("manageTransferDone"));
      setMode("idle");
      onChanged?.();
      router.refresh();
    }
  }

  async function confirmCancel() {
    const ok = await call("cancel");
    if (ok) {
      setNotice(t("manageCancelDone"));
      setMode("idle");
      onChanged?.();
      router.refresh();
    }
  }

  return (
    <div className="mt-2 space-y-2">
      {mode === "idle" && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMode("transfer")}
            className="flex-1 gap-1.5 text-xs min-h-[36px] cursor-pointer"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            {t("manageTransfer")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMode("cancel")}
            className="flex-1 gap-1.5 text-xs text-destructive hover:text-destructive min-h-[36px] cursor-pointer"
          >
            <Ban className="h-3.5 w-3.5" />
            {t("manageCancel")}
          </Button>
        </div>
      )}

      {mode === "transfer" && (
        <form onSubmit={submitTransfer} className="space-y-2 rounded-lg border border-border/70 p-3">
          <p className="text-xs font-semibold text-foreground">{t("manageTransferTitle")}</p>
          <p className="text-[11px] text-muted-foreground">{t("manageTransferDesc")}</p>
          <Input
            aria-label={t("manageName")}
            placeholder={t("manageName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="min-h-[40px]"
          />
          <Input
            type="email"
            aria-label={t("manageEmail")}
            placeholder={t("manageEmail")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="min-h-[40px]"
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={busy} className="flex-1 min-h-[36px] cursor-pointer">
              {t("manageTransferSubmit")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMode("idle")}
              className="min-h-[36px] cursor-pointer"
            >
              {tCom("cancel")}
            </Button>
          </div>
        </form>
      )}

      {mode === "cancel" && (
        <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-xs font-semibold text-foreground">{t("manageCancelTitle")}</p>
          <p className="text-[11px] text-muted-foreground">{t("manageCancelDesc")}</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={busy}
              onClick={confirmCancel}
              className="flex-1 min-h-[36px] cursor-pointer"
            >
              {t("manageConfirmCancel")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMode("idle")}
              className="min-h-[36px] cursor-pointer"
            >
              {t("manageKeep")}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-[11px] text-destructive">
          {error}
        </p>
      )}
      {notice && !error && (
        <p role="status" className="text-[11px] text-emerald-600 dark:text-emerald-400">
          {notice}
        </p>
      )}
    </div>
  );
}
