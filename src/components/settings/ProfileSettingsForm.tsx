"use client";

import * as React from "react";
import { User, Building2, Briefcase, Mail, CheckCircle2, BookmarkCheck, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSettings } from "./SettingsProvider";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const MICE_INTEREST_ARCHETYPES = [
  { id: "INDUSTRIAL_B2B", label: "Industrial & Manufacturing B2B" },
  { id: "TECH_DEV_SUMMIT", label: "Tech & Developer Summit" },
  { id: "MEDICAL_SYMPOSIUM", label: "Medical & Healthcare Congress" },
  { id: "FINANCE_INVESTOR", label: "Finance, FinTech & VC Forum" },
  { id: "POP_CULTURE_GAMING", label: "Pop Culture, Gaming & Comic Con" },
  { id: "MUSIC_FESTIVAL", label: "Music Festival & Live Arena" },
  { id: "MEGA_EXPO_PAVILION", label: "Mega Fair & Consumer Pavilion" },
  { id: "AUTOMOTIVE_MOBILITY", label: "Automotive, EV & Mobility Expo" },
  { id: "ENERGY_INFRASTRUCTURE", label: "Energy, Mining & Infrastructure" },
  { id: "AGRITECH_FOOD", label: "Agriculture, Agritech & Food Expo" },
  { id: "HOSPITALITY_TOURISM", label: "Hospitality, Tourism & Travel Mart" },
  { id: "EDUCATION_EDTECH", label: "Education, EdTech & Academic Summit" },
  { id: "FASHION_RETAIL", label: "Fashion, Beauty & Luxury Retail" },
  { id: "GOVERNMENT_DIPLOMATIC", label: "Government & Diplomatic Summit" },
  { id: "INCENTIVE_RETREAT", label: "Incentive & Corporate Retreat" },
];

export function ProfileSettingsForm({ className }: { className?: string }) {
  const { profile, setProfile, isMounted } = useSettings();

  let tSet: any = (k: string) => k;
  let tArch: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tSet = useTranslations("settings");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tArch = useTranslations("archetypes");
  } catch {
    // Fallback
  }

  const [formData, setFormData] = React.useState(profile);
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    if (isMounted) {
      setFormData(profile);
    }
  }, [profile, isMounted]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 4000);
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
      </div>

      {/* Profile Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={tSet("fullName") || "Full Name"}
          placeholder="e.g. Budi Santoso / Kenji Takahashi"
          value={formData.fullName}
          onChange={(e) => {
            setFormData({ ...formData, fullName: e.target.value });
            setIsSaved(false);
          }}
          iconPrefix={<User className="h-4 w-4" />}
        />

        <Input
          label={tSet("email") || "Email Address"}
          type="email"
          placeholder="e.g. attendee@company.com"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            setIsSaved(false);
          }}
          iconPrefix={<Mail className="h-4 w-4" />}
        />

        <Input
          label={tSet("organization") || "Organization / Company"}
          placeholder="e.g. Global Robotics Corp"
          value={formData.organization}
          onChange={(e) => {
            setFormData({ ...formData, organization: e.target.value });
            setIsSaved(false);
          }}
          iconPrefix={<Building2 className="h-4 w-4" />}
        />

        <Input
          label={tSet("jobTitle") || "Job Title / Delegate Role"}
          placeholder="e.g. Chief Technology Officer / Buyer"
          value={formData.jobTitle}
          onChange={(e) => {
            setFormData({ ...formData, jobTitle: e.target.value });
            setIsSaved(false);
          }}
          iconPrefix={<Briefcase className="h-4 w-4" />}
        />
      </div>

      {/* MICE Interest Matrix */}
      <div className="space-y-3 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <label className="text-sm font-semibold text-foreground">
              {tSet("interestedVerticals") || "MICE Interest Matrix"}
            </label>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {formData.interests.length} selected
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {tSet("profileSubtitle") || "Select the exhibition categories you frequently attend for tailored discovery feeds."}
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {MICE_INTEREST_ARCHETYPES.map((cat) => {
            const isSelected = formData.interests.includes(cat.id);
            let catTitle = cat.label;
            try {
              if (tArch && typeof tArch.raw === "function") {
                const raw = tArch.raw(cat.id);
                if (raw?.title) catTitle = raw.title;
              }
            } catch {
              // fallback
            }

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleInterest(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                {isSelected && <BookmarkCheck className="h-3.5 w-3.5 stroke-[2.5]" />}
                <span>{catTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Submission & Feedback */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/60">
        <div className="flex items-center gap-2">
          {isSaved && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in">
              <CheckCircle2 className="h-4 w-4" />
              <span>{tSet("preferencesSaved") || "Profile preferences successfully saved!"}</span>
            </div>
          )}
        </div>

        <Button type="submit" size="sm" className="w-full sm:w-auto px-5 font-semibold">
          {tSet("savePreferences") || "Save Profile Changes"}
        </Button>
      </div>
    </form>
  );
}
