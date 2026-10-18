"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Palette,
  Bot,
  User,
  Globe2,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Building,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSettings, DEFAULT_SETTINGS } from "@/components/settings/SettingsProvider";
import { ThemeModeSelector } from "@/components/settings/ThemeModeSelector";
import { UIDensitySelector } from "@/components/settings/UIDensitySelector";
import { TypographySelector } from "@/components/settings/TypographySelector";
import { FontScaleSlider } from "@/components/settings/FontScaleSlider";
import { MotionController } from "@/components/settings/MotionController";
import { AIConciergeToggle } from "@/components/settings/AIConciergeToggle";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher, LANGUAGE_OPTIONS } from "@/components/layout/LanguageSwitcher";
import { RegionSwitcher, REGION_OPTIONS } from "@/components/layout/RegionSwitcher";
import { regionForLocale } from "@/lib/i18n/regions";

interface SettingsPageProps {
  params: Promise<{ locale: string }>;
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const resolvedParams = React.use(params);
  const locale = resolvedParams.locale || "en";
  const { resetToDefaults, theme, density, typography, fontScale, motionMode } = useSettings();
  const [activeTab, setActiveTab] = React.useState("appearance");
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  // Theme + Font Scale stay open: highest-frequency controls. The rest disclose.
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    theme: true,
    fontScale: true,
  });

  // Deep-linkable tabs via hash (#appearance, #ai, #profile, #localization).
  React.useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (["appearance", "ai", "profile", "localization"].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.history.replaceState(null, "", `#${value}`);
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const prettyValue = (value: string | number) =>
    String(value).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Live consequence summary for the Localization tab. Initialized from the
  // URL locale; the switcher reports the resolved region (query, cookie, prop).
  const [summaryRegion, setSummaryRegion] = React.useState<string>(
    () => regionForLocale(locale) || "id"
  );
  const summaryLanguage =
    LANGUAGE_OPTIONS.find((l) => l.code === locale) || LANGUAGE_OPTIONS[0];
  const summaryRegionOption =
    REGION_OPTIONS.find((r) => r.code === summaryRegion) || REGION_OPTIONS[0];

  let tSet: any = (k: string) => k;
  let tCom: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tSet = useTranslations("settings");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tCom = useTranslations("common");
  } catch {
    // Fallback if rendered outside provider in tests
  }

  const handleReset = () => {
    resetToDefaults();
    setShowResetConfirm(false);
  };

  return (
    <div className="container max-w-5xl py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href={`/${locale}`} className="hover:text-foreground transition-colors">
          {tCom("explore") || "Home"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{tSet("title") || "Settings"}</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              {tSet("systemPreferences") || "System Preferences"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {tSet("title") || "UI/UX & Account Settings"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            {tSet("subtitle") || "Customize your typography engine, responsive display density, spatial motion mode, attendee profile, and event concierge preferences."}
          </p>
        </div>

        {/* Global Reset Action */}
        <div className="relative self-start md:self-auto">
          {showResetConfirm ? (
            <div className="flex items-center gap-2 p-1.5 rounded-lg border border-destructive/40 bg-destructive/5 animate-fade-in">
              <span className="text-xs text-destructive font-medium px-2">
                {tSet("resetConfirm") || "Reset all?"}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReset}
                className="h-7 px-2.5 text-xs"
              >
                {tSet("confirm") || "Confirm"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
                className="h-7 px-2 text-xs"
              >
                {tCom("cancel") || "Cancel"}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              className="gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{tSet("resetDefaults") || "Reset to Defaults"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Categorized Settings Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 p-1 gap-1">
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            <span>{tSet("appearanceTab") || "Appearance"}</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Bot className="h-4 w-4" />
            <span>{tSet("aiTab") || "AI Concierge"}</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span>{tSet("profileTab") || "Profile & MICE"}</span>
          </TabsTrigger>
          <TabsTrigger value="localization" className="gap-2">
            <Globe2 className="h-4 w-4" />
            <span>{tSet("localizationTab") || "Localization"}</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Appearance & Display */}
        <TabsContent value="appearance" className="space-y-4 animate-fade-in">
          {[
            { id: "theme", active: prettyValue(theme), isDefault: theme === DEFAULT_SETTINGS.theme, content: <ThemeModeSelector /> },
            { id: "density", title: tSet("density") || "UI Density", active: prettyValue(density), isDefault: density === DEFAULT_SETTINGS.density, content: <UIDensitySelector /> },
            { id: "typography", title: tSet("typography") || "Typography Engine", active: prettyValue(typography), isDefault: typography === DEFAULT_SETTINGS.typography, content: <TypographySelector /> },
            { id: "fontScale", title: tSet("fontScaling") || "Font Scale", active: `${Math.round(fontScale * 100)}%`, isDefault: fontScale === DEFAULT_SETTINGS.fontScale, content: <FontScaleSlider /> },
            { id: "motion", title: tSet("motionMode") || "Motion Dynamics", active: prettyValue(motionMode), isDefault: motionMode === DEFAULT_SETTINGS.motionMode, content: <MotionController /> },
          ].map((section, index) => {
            const open = openSections[section.id] ?? false;
            const title = section.id === "theme"
              ? (tSet("themeMode") || "Theme Mode")
              : section.title;
            return (
              <section
                key={section.id}
                className={index > 0 ? "pt-4 border-t border-border/60 space-y-3" : "space-y-3"}
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={open}
                  aria-controls={`appearance-section-${section.id}`}
                  className="w-full flex items-center justify-between gap-2 rounded-lg py-1 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-h-[44px]"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span>{title}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {tSet("activeSelection") || "Active"}: {section.active}
                    </span>
                    {section.isDefault && (
                      <span className="px-1.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">
                        {tSet("defaultBadge") || "Default"}
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && <div id={`appearance-section-${section.id}`}>{section.content}</div>}
              </section>
            );
          })}
        </TabsContent>

        {/* Tab 2: AI Concierge & Assistant */}
        <TabsContent value="ai" className="space-y-6 animate-fade-in">
          <AIConciergeToggle />

          {/* Model Specification Card */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  {tSet("aiArchitecture") || "AI Architecture & Model Routing"}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {tSet("openRouterEngine") || "OpenRouter high-throughput inference engine with offline fallback"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground font-mono">
                    google/gemini-3.5-flash-lite
                  </span>
                  <span className="text-xs uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    Default Copilot
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-xs">
                  Sub-second token streaming for real-time attendee FAQs, shuttle schedules, and hall wayfinding.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground font-mono">
                    google/gemini-3.7-flash
                  </span>
                  <span className="text-xs uppercase font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                    Multi-Modal
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-xs">
                  Complex reasoning across multi-day exhibition schedules and spatial hall floor maps.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Attendee Profile & MICE Interest */}
        <TabsContent value="profile" className="space-y-6 animate-fade-in">
          <ProfileSettingsForm />
        </TabsContent>

        {/* Tab 4: Language & Regional Hubs */}
        <TabsContent value="localization" className="space-y-6 animate-fade-in">
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-primary" />
                <h4 className="text-base font-semibold text-foreground">
                  {tSet("localizationTab") || "Language & Regional Localization"}
                </h4>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {tSet("subtitle") || "Choose your display language and primary MICE region for localized venue schedules and currency."}
              </p>
              <p aria-live="polite" className="text-xs font-semibold text-foreground mt-2 rounded-lg bg-muted/50 px-2.5 py-1.5">
                {tSet("viewingSummary", {
                  language: summaryLanguage.nativeLabel,
                  region: summaryRegionOption.editionTitle,
                  currency: summaryRegionOption.currency,
                  timezone: summaryRegionOption.timezoneName,
                  count: summaryRegionOption.venueCount,
                }) || `Viewing: ${summaryLanguage.nativeLabel} · ${summaryRegionOption.editionTitle} · ${summaryRegionOption.currency} · ${summaryRegionOption.timezoneName} · ${summaryRegionOption.venueCount} venues`}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-border/60">
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono block">
                  {tSet("interfaceLanguage") || "Interface Language"}
                </label>
                <LanguageSwitcher currentLocale={locale} />
                <p className="text-[11px] text-muted-foreground leading-normal">
                  {tSet("interfaceLanguageDesc") || "Supported in English, Japanese, Chinese, Indonesian, German, and Spanish."}
                </p>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono block">
                  {tSet("regionalHub") || "Regional MICE Hub"}
                </label>
                <RegionSwitcher currentLocale={locale} />
                <p className="text-[11px] text-muted-foreground leading-normal">
                  {tSet("regionalHubDesc") || "Toggle between Indonesia (JIExpo, ICE BSD), Japan (Big Sight, Makuhari), and Global Hubs."}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-border/60">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono block">
                {tSet("allHubs") || "All Regional Hubs"}
              </span>
              <RegionSwitcher
                currentLocale={locale}
                variant="cards"
                onActiveRegionChange={setSummaryRegion}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
