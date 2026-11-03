"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Check, X, Store, Mail } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface BoothClaimRow {
  id: string;
  companyName: string;
  boothNumber: string;
  hallName: string;
  event: { id: string; title: string };
  claimedBy: { name: string; email: string } | null;
}

/**
 * Organizer review queue for booth claims. Approving links the booth to the
 * exhibitor; rejecting clears the claimant so someone else can ask.
 */
export function BoothClaimsInbox({ initialClaims }: { initialClaims: BoothClaimRow[] }) {
  const t = useTranslations("organizer");
  const [rows, setRows] = React.useState(initialClaims);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  async function decide(id: string, status: "CLAIMED" | "REJECTED") {
    setBusy(id);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/exhibitor/booths/${id}/claim`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || t("boothClaimError"));
      setRows((current) => current.filter((row) => row.id !== id));
      setNotice(t("boothClaimUpdated"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="p-5 border-border/80 bg-card shadow-xs rounded-2xl">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Store className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{t("boothClaimsTitle")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t("boothClaimsDesc")}</p>
        </div>
        {rows.length > 0 && (
          <Badge variant="warning" size="sm" className="ml-auto">
            {rows.length} {t("boothClaimPending")}
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

      {rows.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">{t("boothClaimsEmpty")}</p>
      ) : (
        <ul className="mt-4 divide-y divide-border/70">
          {rows.map((row) => (
            <li key={row.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-sm font-semibold text-foreground">{row.companyName}</span>
                <Badge variant="outline" size="sm" className="font-mono">
                  {row.boothNumber}
                </Badge>
                <span className="text-xs text-muted-foreground">{row.hallName}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{row.event.title}</p>
              {row.claimedBy && (
                <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {row.claimedBy.name} ({row.claimedBy.email})
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={busy === row.id}
                  onClick={() => decide(row.id, "CLAIMED")}
                  className="gap-1.5 min-h-[36px] cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  {t("boothClaimApprove")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy === row.id}
                  onClick={() => decide(row.id, "REJECTED")}
                  className="gap-1.5 min-h-[36px] cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  {t("boothClaimReject")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
