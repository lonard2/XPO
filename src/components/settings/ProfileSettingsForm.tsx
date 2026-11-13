"use client";

import * as React from "react";
import Link from "next/link";
import { User, Building2, Briefcase, Mail, CheckCircle2, BookmarkCheck, Sparkles, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSettings } from "./SettingsProvider";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { MICE_INDUSTRY_CLUSTERS, ARCHETYPE_METAS, type MiceArchetype } from "@/lib/theming";
import { clusterLabel } from "@/lib/i18n/categories";

export function ProfileSettingsForm({ className }: { className?: string }) {
  const { profile, setProfile, isMounted } = useSettings();

  let tSet: any = (k: string) => k;
  let tArch: any = (k: string) => k;
  let tOrg: any = (k: string) => k;
  let locale = "en";
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tSet = useTranslations("settings");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tArch = useTranslations("archetypes");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tOrg = useTranslations("organizer");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    locale = useLocale();
  } catch {
    // Fallback
  }

  const [formData, setFormData] = React.useState(profile);
  const [isSaved, setIsSaved] = React.useState(false);
  const [errors, setErrors] = React.useState<{ fullName?: string; email?: string }>({});
  const [collapsedClusters, setCollapsedClusters] = React.useState<Record<string, boolean>>({});
  // unknown until the first server read: anonymous visitors stay local-only.
  const [syncState, setSyncState] = React.useState<"unknown" | "synced" | "local">("unknown");
  const [syncError, setSyncError] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<
    Array<{
      event: { title: string; slug: string; venueName: string | null; city: string | null };
      score: number;
      matchedInterests: string[];
      reason?: string;
    }>
  >([]);
  const [rankedBy, setRankedBy] = React.useState<"rules" | "ai">("rules");
  const [reranking, setReranking] = React.useState(false);

  // Display title: localized dictionary first, current metadata second.
  const interestTitle = (id: MiceArchetype) => {
    try {
      if (tArch && typeof tArch.raw === "function") {
        const raw = tArch.raw(id);
        if (raw?.title) return raw.title as string;
      }
    } catch {
      // fallback
    }
    const meta = ARCHETYPE_METAS[id];
    return meta?.shortName || meta?.label || id;
  };

  const toggleCluster = (id: string) => {
    setCollapsedClusters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectCluster = (ids: MiceArchetype[]) => {
    setFormData((prev) => ({
      ...prev,
      interests: Array.from(new Set([...prev.interests, ...ids])),
    }));
    setIsSaved(false);
  };

  const clearInterests = () => {
    setFormData((prev) => ({ ...prev, interests: [] }));
    setIsSaved(false);
  };

  React.useEffect(() => {
    if (isMounted) {
      setFormData(profile);
    }
  }, [profile, isMounted]);

  // Signed-in delegates load the stored profile once, so interests survive
  // across devices. Anonymous visitors keep the local-only form.
  React.useEffect(() => {
    if (!isMounted) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("anonymous");
        const data = (await res.json()) as {
          profile?: {
            fullName: string;
            email: string;
            organization: string;
            jobTitle: string;
            interests: string[];
          };
        };
        if (!data.profile || cancelled) return;
        const serverProfile = {
          fullName: data.profile.fullName || "",
          email: data.profile.email || "",
          organization: data.profile.organization || "",
          jobTitle: data.profile.jobTitle || "",
          interests: Array.isArray(data.profile.interests) ? data.profile.interests : [],
        };
        setFormData(serverProfile);
        setProfile(serverProfile);
        setSyncState("synced");
        await loadSuggestions();
      } catch {
        if (!cancelled) setSyncState("local");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  async function loadSuggestions(rerank = false) {
    if (rerank) setReranking(true);
    try {
      const res = await fetch(`/api/profile/suggestions${rerank ? "?rerank=true" : ""}`);
      if (!res.ok) throw new Error("no suggestions");
      const data = (await res.json()) as {
        suggestions?: typeof suggestions;
        rankedBy?: "rules" | "ai";
      };
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions.slice(0, 3) : []);
      setRankedBy(data.rankedBy === "ai" ? "ai" : "rules");
    } catch {
      setSuggestions([]);
      setRankedBy("rules");
    } finally {
      if (rerank) setReranking(false);
    }
  }

  const validate = (data: typeof formData) => {
    const next: { fullName?: string; email?: string } = {};
    if (!data.fullName.trim()) {
      next.fullName = tSet("nameRequired") || "Enter your full name.";
    }
    if (!data.email.trim()) {
      next.email = tSet("emailRequired") || "Enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      next.email = tSet("emailInvalid") || "Enter a valid email address.";
    }
    return next;
  };

  const toggleInterest = (id: string) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(id);
      const updated = exists
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id];
      return { ...prev, interests: updated };
    });
    setIsSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 4000);
    // Best-effort server sync: local save already succeeded, so a failed
    // PATCH only changes where the data lives, never loses it.
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          organization: formData.organization,
          jobTitle: formData.jobTitle,
          interests: formData.interests,
        }),
      });
      if (!res.ok) throw new Error("sync failed");
      setSyncState("synced");
      setSyncError(false);
      await loadSuggestions();
    } catch {
      setSyncState("local");
      setSyncError(true);
    }
  };

  const handleClearProfile = async () => {
    const cleared = { fullName: "", email: "", organization: "", jobTitle: "", interests: [] as string[] };
    setFormData(cleared);
    setProfile(cleared);
    setErrors({});
    setIsSaved(false);
    setSuggestions([]);
    // Stop server-side suggestions without wiping the stored identity.
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: [] }),
      });
    } catch {
      // Local state is already cleared.
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("rounded-xl border border-border bg-card p-4 sm:p-6 space-y-6", className)}
    >
      <div>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h4 className="text-base font-semibold text-foreground">
            {tSet("profileTitle") || "Attendee Profile"}
          </h4>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {tSet("profileSubtitle") || "Your profile information is used for one-click pass registration and personalized MICE event suggestions."}
        </p>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
          {syncState === "synced"
            ? tSet("profileSyncedNote") || "Saved to your account and used for event suggestions."
            : tSet("profileLocalOnly") || "Stored only in this browser. Never sent anywhere until you register for a pass."}
        </p>
      </div>

      {/* Profile Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={tSet("fullName") || "Full Name"}
          placeholder={tSet("profileNamePlaceholder")}
          value={formData.fullName}
          autoComplete="name"
          required
          error={errors.fullName}
          onChange={(e) => {
            setFormData({ ...formData, fullName: e.target.value });
            setIsSaved(false);
          }}
          iconPrefix={<User className="h-4 w-4" />}
        />

        <Input
          label={tSet("email") || "Email Address"}
          type="email"
          placeholder={tSet("profileEmailPlaceholder")}
          value={formData.email}
          autoComplete="email"
          required
          error={errors.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            setIsSaved(false);
          }}
          iconPrefix={<Mail className="h-4 w-4" />}
        />

        <Input
          label={tSet("organization") || "Organization / Company"}
          placeholder={tSet("profileOrgPlaceholder")}
          value={formData.organization}
          autoComplete="organization"
          onChange={(e) => {
            setFormData({ ...formData, organization: e.target.value });
            setIsSaved(false);
          }}
          iconPrefix={<Building2 className="h-4 w-4" />}
        />

        <Input
          label={tSet("jobTitle") || "Job Title / Delegate Role"}
          placeholder={tSet("profileRolePlaceholder")}
          value={formData.jobTitle}
          autoComplete="organization-title"
          onChange={(e) => {
            setFormData({ ...formData, jobTitle: e.target.value });
            setIsSaved(false);
          }}
          iconPrefix={<Briefcase className="h-4 w-4" />}
        />
      </div>

      {/* MICE Interest Matrix: all 22 current categories under 6 clusters */}
      <div className="space-y-3 pt-2 border-t border-border/60">
        <div className="sticky top-0 bg-card py-1 z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <label className="text-sm font-semibold text-foreground">
              {tSet("interestedVerticals") || "MICE Interest Matrix"}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground" aria-live="polite">
              {formData.interests.length} {tSet("profileSelected")}
            </span>
            <button
              type="button"
              onClick={clearInterests}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground underline underline-offset-2 cursor-pointer min-h-[44px] px-1"
            >
              {tSet("clearAll") || "Clear all"}
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {tSet("matrixHint") || "Pick the categories you attend most. Signed-in delegates see event suggestions from these interests below."}
        </p>

        <div className="space-y-4 pt-1">
          {MICE_INDUSTRY_CLUSTERS.map((cluster) => {
            const selectedInCluster = cluster.archetypes.filter((id) =>
              formData.interests.includes(id)
            ).length;
            const collapsed = collapsedClusters[cluster.id] ?? false;
            return (
              <div key={cluster.id} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCluster(cluster.id)}
                    aria-expanded={!collapsed}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-h-[44px]"
                  >
                    <span>{clusterLabel(tOrg, cluster.id, cluster.shortLabel)}</span>
                    <span className="font-mono font-medium text-muted-foreground normal-case">
                      {selectedInCluster}/{cluster.archetypes.length}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => selectCluster(cluster.archetypes)}
                    className="text-[11px] font-semibold text-primary hover:underline underline-offset-2 cursor-pointer min-h-[44px] px-1"
                  >
                    {tSet("selectCluster") || "Select all"}
                  </button>
                </div>
                {!collapsed && (
                  <div className="flex flex-wrap gap-2">
                    {cluster.archetypes.map((id) => {
                      const isSelected = formData.interests.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleInterest(id)}
                          aria-pressed={isSelected}
                          className={cn(
                            "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground font-semibold shadow-sm"
                              : "border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {isSelected && <BookmarkCheck className="h-3.5 w-3.5 stroke-[2.5]" />}
                          <span>{interestTitle(id)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested events: rule-based matches on the stored interests. */}
      {syncState === "synced" && (
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {tSet("suggestionsTitle") || "Suggested for you"}
              </span>
            </div>
            {suggestions.length > 0 && (
              <button
                type="button"
                onClick={() => loadSuggestions(true)}
                disabled={reranking}
                className="text-[11px] font-semibold text-primary hover:underline underline-offset-2 cursor-pointer min-h-[36px] px-1 disabled:opacity-50"
              >
                {tSet("suggestionsRerank") || "Rank with AI"}
              </button>
            )}
          </div>
          {rankedBy === "ai" && suggestions.length > 0 && (
            <p className="text-[11px] text-muted-foreground">
              {tSet("suggestionsAiNote") || "Ranked by AI from your interests and past requests."}
            </p>
          )}
          {suggestions.length === 0 ? (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {tSet("suggestionsEmpty") || "Save interests above and suggestions will appear here."}
            </p>
          ) : (
            <ul className="space-y-2">
              {suggestions.map((suggestion) => {
                const matchNames = suggestion.matchedInterests
                  .map((id) => interestTitle(id as MiceArchetype))
                  .join(", ");
                const matchLine = tSet("suggestionMatch", { names: matchNames });
                return (
                  <li
                    key={suggestion.event.slug}
                    className="rounded-lg border border-border/70 bg-background p-3"
                  >
                    <Link
                      href={`/${locale}/events/${suggestion.event.slug}`}
                      className="text-sm font-semibold text-foreground hover:text-primary hover:underline underline-offset-2"
                    >
                      {suggestion.event.title}
                    </Link>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {[suggestion.event.venueName, suggestion.event.city]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {suggestion.reason ??
                        (matchLine === "suggestionMatch" ? `Matches ${matchNames}` : matchLine)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Form Submission & Feedback */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/60">
        <div className="flex items-center gap-2">
          {isSaved && (
            <div role="status" className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in">
              <CheckCircle2 className="h-4 w-4" />
              <span>{tSet("preferencesSaved") || "Profile preferences successfully saved!"}</span>
            </div>
          )}
          {syncError && (
            <p role="status" className="text-[11px] text-muted-foreground">
              {tSet("profileLocalOnly") || "Stored only in this browser. Never sent anywhere until you register for a pass."}
            </p>
          )}
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearProfile}
            className="px-3 font-semibold text-xs text-muted-foreground hover:text-destructive cursor-pointer min-h-[44px] sm:min-h-[36px]"
          >
            {tSet("clearProfile") || "Clear profile"}
          </Button>
          <Button type="submit" size="sm" className="flex-1 sm:flex-none px-5 font-semibold">
            {tSet("savePreferences") || "Save Profile Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
