"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Requester rating for a held meeting, 1 to 5 stars. Latest rating stands.
 */
export function MeetingRatingControl({
  requestId,
  initialRating,
}: {
  requestId: string;
  initialRating: number | null;
}) {
  const t = useTranslations("myTickets");
  const [rating, setRating] = React.useState<number | null>(initialRating);
  const [hover, setHover] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function rate(value: number) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/requests/${requestId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: value }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || t("meetingRateError"));
      setRating(value);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-1.5">
      <p className="text-[11px] font-semibold text-foreground">
        {rating
          ? t("meetingRated", { n: rating })
          : t("meetingRate") || "Rate this meeting"}
      </p>
      <div className="mt-1 flex items-center gap-1" role="group" aria-label={t("meetingRate") || "Rate this meeting"}>
        {[1, 2, 3, 4, 5].map((value) => {
          const active = value <= (hover || rating || 0);
          return (
            <button
              key={value}
              type="button"
              disabled={busy}
              onClick={() => rate(value)}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${value} / 5`}
              className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-md hover:bg-muted cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  active ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                )}
              />
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="text-[11px] text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
