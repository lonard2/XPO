"use client";

import * as React from "react";
import { Download, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTranslations } from "next-intl";

/**
 * Export and erase controls for the signed-in delegate's personal data.
 * Export downloads the /api/profile/export JSON; erase requires an explicit
 * two-step confirmation and reports what was scrubbed. Unsigned visitors
 * see the sign-in note instead of dead buttons.
 */
export function DataRightsPanel() {
  const t = useTranslations("settings");
  const [signedIn, setSignedIn] = React.useState<boolean | null>(null);
  const [arming, setArming] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => setSignedIn(res.ok))
      .catch(() => setSignedIn(false));
  }, []);

  async function erase() {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/profile/erase", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        erased?: { bookings: number; meetingRequests: number; waitlistEntries: number; boothClaims: number };
      };
      if (!res.ok) throw new Error(data.error || t("dataError"));
      const total = data.erased
        ? data.erased.bookings + data.erased.meetingRequests + data.erased.waitlistEntries + data.erased.boothClaims
        : 0;
      const done = t("eraseDone", { n: total });
      setNotice(done === "eraseDone" ? `Personal data erased across ${total} records.` : done);
      setArming(false);
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
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {t("dataRightsTitle") || "Your data"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("dataRightsDesc") || "Download a copy of your data, or erase your personal details."}
          </p>
        </div>
      </div>

      {signedIn === false && (
        <p className="mt-3 text-xs text-muted-foreground">
          {t("dataSignIn") || "Sign in to download or erase your data."}
        </p>
      )}

      {signedIn === true && (
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="/api/profile/export"
            download
            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-md border border-input bg-background text-xs font-semibold hover:bg-accent cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            {t("exportData") || "Download my data"}
          </a>
          {!arming ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setArming(true)}
              className="gap-1.5 min-h-[40px] cursor-pointer text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("eraseArm") || "Delete my data"}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={busy}
              onClick={erase}
              className="gap-1.5 min-h-[40px] cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("eraseConfirm") || "Yes, erase everything"}
            </Button>
          )}
        </div>
      )}

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
      {arming && !notice && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          {t("eraseDesc") || "This scrubs your name and contact from passes, requests and queues. Event records stay, anonymized."}
        </p>
      )}
    </Card>
  );
}
