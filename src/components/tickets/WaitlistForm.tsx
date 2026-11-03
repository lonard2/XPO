"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { BellPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface WaitlistFormProps {
  eventId: string;
  tierId: string;
  tierName: string;
}

/**
 * Sold-out tier entry point. Joining is public and idempotent; the position
 * is the number of pending entries ahead, including this one.
 */
export function WaitlistForm({ eventId, tierId, tierName }: WaitlistFormProps) {
  const t = useTranslations("tickets");
  const tCom = useTranslations("common");

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [position, setPosition] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId, name, email }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        position?: number;
      };
      if (!res.ok) {
        throw new Error(
          data.error?.includes("SEATS_AVAILABLE")
            ? t("waitlistSeatsAvailable")
            : data.error || t("waitlistError")
        );
      }
      setPosition(data.position ?? 1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (position !== null) {
    return (
      <p role="status" className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
        <Check className="h-4 w-4 shrink-0" />
        {t("waitlistJoined", { position })}
      </p>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full font-semibold gap-2 min-h-[44px] cursor-pointer"
      >
        <BellPlus className="h-4 w-4" />
        {t("waitlistJoin")}
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <p className="text-xs font-semibold text-foreground">{t("waitlistTitle")}</p>
      <p className="text-[11px] text-muted-foreground">{t("waitlistDesc", { tier: tierName })}</p>
      <Input
        aria-label={t("waitlistName")}
        placeholder={t("waitlistName")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="min-h-[40px]"
      />
      <Input
        type="email"
        aria-label={t("waitlistEmail")}
        placeholder={t("waitlistEmail")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="min-h-[40px]"
      />
      {error && (
        <p role="alert" className="text-[11px] text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={busy} className="flex-1 min-h-[36px] cursor-pointer">
          {t("waitlistSubmit")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(false)}
          className="min-h-[36px] cursor-pointer"
        >
          {tCom("cancel")}
        </Button>
      </div>
    </form>
  );
}
