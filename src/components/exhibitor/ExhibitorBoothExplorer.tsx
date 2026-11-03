"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { BadgeCheck, Building2, Check, Loader2, Search, Store, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export interface ExhibitorBooth {
  id: string;
  companyName: string;
  boothNumber: string;
  hallName: string;
  industry: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  description: string | null;
  dimensions: string | null;
  areaSqm: number | null;
  boothType: string | null;
  claimStatus: string;
  userId: string | null;
  event: { id: string; title: string; slug: string };
  claimedBy: { name: string; email: string } | null;
}

function statusVariant(status: string): "success" | "warning" | "destructive" | "neutral" {
  if (status === "CLAIMED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "REJECTED") return "destructive";
  return "neutral";
}

export function ExhibitorBoothExplorer({
  userId,
  booths,
}: {
  userId: string;
  booths: ExhibitorBooth[];
}) {
  const t = useTranslations("exhibitor");
  const tCom = useTranslations("common");

  const [rows, setRows] = React.useState(booths);
  const [query, setQuery] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const mine = rows.filter((row) => row.userId === userId);
  const available = rows.filter(
    (row) =>
      row.claimStatus === "UNCLAIMED" ||
      (row.claimStatus === "REJECTED" && !row.userId)
  );
  const matches = available.filter((row) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return (
      row.companyName.toLowerCase().includes(term) ||
      row.boothNumber.toLowerCase().includes(term) ||
      row.event.title.toLowerCase().includes(term)
    );
  });

  function statusLabel(status: string) {
    if (status === "CLAIMED") return t("statusClaimed");
    if (status === "PENDING") return t("statusPending");
    if (status === "REJECTED") return t("statusRejected");
    return t("statusUnclaimed");
  }

  async function claim(id: string) {
    setBusy(id);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/exhibitor/booths/${id}/claim`, { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || t("error"));
      setRows((current) =>
        current.map((row) =>
          row.id === id ? { ...row, claimStatus: "PENDING", userId } : row
        )
      );
      setNotice(t("claimSubmitted"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function withdraw(id: string) {
    setBusy(id);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/exhibitor/booths/${id}/claim`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || t("error"));
      setRows((current) =>
        current.map((row) =>
          row.id === id ? { ...row, claimStatus: "UNCLAIMED", userId: null } : row
        )
      );
      setNotice(t("withdrawDone"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {notice && !error && (
        <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">
          {notice}
        </p>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">{t("mineTitle")}</h2>
        {mine.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("mineEmpty")}</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mine.map((row) => (
              <Card key={row.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-primary" />
                      <h3 className="text-base font-semibold text-foreground">{row.companyName}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {row.event.title} · {row.hallName} · {row.boothNumber}
                    </p>
                  </div>
                  <Badge variant={statusVariant(row.claimStatus)} size="sm">
                    {statusLabel(row.claimStatus)}
                  </Badge>
                </div>

                <BoothProfileForm
                  booth={row}
                  onSaved={(updated) =>
                    setRows((current) =>
                      current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
                    )
                  }
                />

                {row.claimStatus === "PENDING" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy === row.id}
                    onClick={() => withdraw(row.id)}
                    className="gap-1.5 min-h-[36px] cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    {t("withdraw")}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">{t("findTitle")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t("findDesc")}</p>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            aria-label={t("searchPlaceholder")}
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 min-h-[44px]"
          />
        </div>
        {matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("findEmpty")}</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {matches.map((row) => (
              <li key={row.id}>
                <Card className="p-4 h-full flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm font-semibold text-foreground line-clamp-1">
                        {row.companyName || t("unnamedBooth")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {row.event.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.hallName} · {row.boothNumber}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={busy === row.id}
                    onClick={() => claim(row.id)}
                    className="gap-1.5 min-h-[36px] cursor-pointer"
                  >
                    {busy === row.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <BadgeCheck className="h-3.5 w-3.5" />
                    )}
                    {t("claim")}
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function BoothProfileForm({
  booth,
  onSaved,
}: {
  booth: ExhibitorBooth;
  onSaved: (updated: Partial<ExhibitorBooth> & { id: string }) => void;
}) {
  const t = useTranslations("exhibitor");
  const tCom = useTranslations("common");
  const [form, setForm] = React.useState({
    companyName: booth.companyName,
    description: booth.description || "",
    websiteUrl: booth.websiteUrl || "",
    logoUrl: booth.logoUrl || "",
    dimensions: booth.dimensions || "",
    areaSqm: booth.areaSqm?.toString() || "",
    boothType: booth.boothType || "",
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/exhibitor/booths/${booth.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          description: form.description,
          websiteUrl: form.websiteUrl,
          logoUrl: form.logoUrl,
          dimensions: form.dimensions,
          areaSqm: form.areaSqm,
          boothType: form.boothType,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        booth?: Partial<ExhibitorBooth>;
      };
      if (!res.ok || !data.booth) throw new Error(data.error || t("error"));
      onSaved({ id: booth.id, ...data.booth });
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2 border-t border-border/60 pt-3">
      <p className="text-xs font-semibold text-foreground">{t("profileTitle")}</p>
      <Input
        aria-label={t("fieldCompany")}
        placeholder={t("fieldCompany")}
        value={form.companyName}
        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
        required
        className="min-h-[40px]"
      />
      <textarea
        aria-label={t("fieldDescription")}
        placeholder={t("fieldDescription")}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={2}
        className="w-full px-3 py-2 text-xs rounded-md bg-background border border-border min-h-[60px]"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Input
          aria-label={t("fieldWebsite")}
          placeholder={t("fieldWebsite")}
          value={form.websiteUrl}
          onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
          className="min-h-[40px]"
        />
        <Input
          aria-label={t("fieldLogo")}
          placeholder={t("fieldLogo")}
          value={form.logoUrl}
          onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
          className="min-h-[40px]"
        />
        <Input
          aria-label={t("fieldDimensions")}
          placeholder={t("fieldDimensions")}
          value={form.dimensions}
          onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
          className="min-h-[40px]"
        />
        <Input
          aria-label={t("fieldArea")}
          placeholder={t("fieldArea")}
          inputMode="decimal"
          value={form.areaSqm}
          onChange={(e) => setForm({ ...form, areaSqm: e.target.value })}
          className="min-h-[40px]"
        />
      </div>
      <Input
        aria-label={t("fieldType")}
        placeholder={t("fieldType")}
        value={form.boothType}
        onChange={(e) => setForm({ ...form, boothType: e.target.value })}
        className="min-h-[40px]"
      />
      {error && (
        <p role="alert" className="text-[11px] text-destructive">
          {error}
        </p>
      )}
      {saved && !error && (
        <p role="status" className="text-[11px] text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
          <Check className="h-3 w-3" />
          {t("saved")}
        </p>
      )}
      <Button type="submit" size="sm" disabled={busy} className="min-h-[36px] cursor-pointer">
        {tCom("save")}
      </Button>
    </form>
  );
}
