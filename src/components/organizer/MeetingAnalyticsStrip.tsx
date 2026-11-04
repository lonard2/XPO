"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ChartColumn, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface TierUsage {
  tierId: string;
  name: string;
  quota: number;
  confirmed: number;
}

interface Analytics {
  requested: number;
  pending: number;
  confirmed: number;
  declined: number;
  held: number;
  noShow: number;
  awaitingOutcome: number;
  ratedCount: number;
  avgRating: number | null;
  tiers: TierUsage[];
  unlinkedConfirmed: number;
}

/**
 * Booked-vs-held-vs-rated funnel for the hosted-buyer program, plus the
 * per-tier quota controls. Quota 0 means unlimited; the confirmed count
 * beside it is buyer appointments attributed through the linked pass.
 */
export function MeetingAnalyticsStrip() {
  const t = useTranslations("organizer");
  const [data, setData] = React.useState<Analytics | null>(null);
  const [quotas, setQuotas] = React.useState<Record<string, string>>({});
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/meetings/analytics")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.analytics);
          const initial: Record<string, string> = {};
          for (const tier of json.analytics.tiers as TierUsage[]) {
            initial[tier.tierId] = String(tier.quota);
          }
          setQuotas(initial);
        }
      })
      .catch(() => {});
  }, []);

  async function saveQuota(tierId: string) {
    const quota = Number(quotas[tierId]);
    if (!Number.isInteger(quota) || quota < 0) {
      setError(t("meetingQuotaError") || "Quota must be a whole number from 0 upward.");
      return;
    }
    setBusy(tierId);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/organizer/tiers/${tierId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingQuota: quota }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || t("meetingRequestError"));
      setData((current) =>
        current
          ? {
              ...current,
              tiers: current.tiers.map((tier) =>
                tier.tierId === tierId ? { ...tier, quota } : tier
              ),
            }
          : current
      );
      setNotice(t("meetingRequestUpdated"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  if (!data) return null;

  const stats: Array<[string, number | string]> = [
    [t("meetingStatRequested") || "Requested", data.requested],
    [t("meetingStatConfirmed") || "Confirmed", data.confirmed],
    [t("meetingStatHeld") || "Held", data.held],
    [
      t("meetingStatRated") || "Rated",
      data.avgRating === null ? data.ratedCount : `${data.avgRating}/5 (${data.ratedCount})`,
    ],
  ];

  return (
    <Card className="p-5 border-border/80 bg-card shadow-xs rounded-2xl">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <ChartColumn className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {t("meetingAnalyticsTitle") || "Hosted-buyer funnel"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("meetingAnalyticsDesc") ||
              "Booked, held and rated meetings across your events."}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {stats.map(([label, value]) => (
          <Badge key={label} variant="outline" size="sm" className="tabular-nums">
            {label}: {value}
          </Badge>
        ))}
        {data.noShow > 0 && (
          <Badge variant="destructive" size="sm" className="tabular-nums">
            {t("meetingOutcomeNoShow") || "No-show"}: {data.noShow}
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

      {data.tiers.length > 0 && (
        <ul className="mt-3 space-y-2">
          {data.tiers.map((tier) => (
            <li
              key={tier.tierId}
              className="flex flex-wrap items-center gap-2 text-xs rounded-lg border border-border/60 px-3 py-2"
            >
              <span className="font-semibold text-foreground flex-1 min-w-32">
                {tier.name}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {tier.confirmed}/{tier.quota === 0 ? "∞" : tier.quota}
              </span>
              <label className="inline-flex items-center gap-1.5 text-muted-foreground">
                {t("meetingQuotaLabel") || "Quota"}
                <Input
                  type="number"
                  min={0}
                  max={1000}
                  aria-label={`${t("meetingQuotaLabel") || "Quota"}: ${tier.name}`}
                  value={quotas[tier.tierId] ?? String(tier.quota)}
                  onChange={(e) =>
                    setQuotas((current) => ({ ...current, [tier.tierId]: e.target.value }))
                  }
                  className="w-20 min-h-[36px]"
                />
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy === tier.tierId}
                onClick={() => saveQuota(tier.tierId)}
                className="gap-1 min-h-[36px] cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                {t("meetingQuotaSave") || "Save"}
              </Button>
            </li>
          ))}
        </ul>
      )}
      {data.unlinkedConfirmed > 0 && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          {t("meetingUnlinkedNote", { n: data.unlinkedConfirmed }) ||
            `${data.unlinkedConfirmed} confirmed without a linked pass, outside quotas.`}
        </p>
      )}
    </Card>
  );
}
