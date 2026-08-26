"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Palette,
  Eye,
  Save,
  RotateCcw,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Type,
  Image as ImageIcon,
  Sliders,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { LivePreviewFrame } from "@/components/organizer/LivePreviewFrame";
import { useTranslations } from "next-intl";
import {
  ARCHETYPE_DEFAULTS,
  MiceArchetype,
  getArchetypeTokens,
  parseBrandingConfig,
} from "@/lib/theming";
import { cn } from "@/lib/utils";

const COLOR_PRESETS = [
  { name: "Modern Navy", primary: "#1e3a8a", accent: "#d97706" },
  { name: "Electric Indigo", primary: "#6366f1", accent: "#06b6d4" },
  { name: "Emerald Grid", primary: "#059669", accent: "#10b981" },
  { name: "Amber Industrial", primary: "#ca8a04", accent: "#16a34a" },
  { name: "Sunset Crimson", primary: "#dc2626", accent: "#f97316" },
  { name: "Cyber Violet", primary: "#9333ea", accent: "#ec4899" },
  { name: "Dark Titanium", primary: "#0f172a", accent: "#0284c7" },
];

const HERO_IMAGE_PRESETS = [
  {
    name: "Industrial Expo Hall",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "Tech Keynote Stage",
    url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "Medical Symposium Forum",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "Mega Fair Grounds",
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80",
  },
];

const ALL_ARCHETYPE_OPTIONS: Array<{ id: MiceArchetype; name: string; tag: string }> = [
  { id: "INDUSTRIAL_B2B", name: "Industrial & Manufacturing B2B", tag: "Heavy Machinery & Sourcing" },
  { id: "TECH_DEV_SUMMIT", name: "Tech, AI & Developer Summit", tag: "AI & Cloud Architecture" },
  { id: "MEDICAL_SYMPOSIUM", name: "Medical & Healthcare Congress", tag: "CME & Clinical Trials" },
  { id: "FINANCE_INVESTOR", name: "Finance, FinTech & VC Forum", tag: "Venture & Institutional Capital" },
  { id: "POP_CULTURE_GAMING", name: "Pop Culture, Gaming & Comic Con", tag: "Esports & Creator Alley" },
  { id: "MUSIC_FESTIVAL", name: "Music Festival & Live Arena", tag: "Multi-Stage Live Concerts" },
  { id: "MEGA_EXPO_PAVILION", name: "Mega Fair & Consumer Pavilion", tag: "Consumer & Fireworks Expo" },
  { id: "AUTOMOTIVE_MOBILITY", name: "Automotive, EV & Mobility Expo", tag: "Concept Cars & Test Drives" },
  { id: "ENERGY_INFRASTRUCTURE", name: "Energy, Mining & Infrastructure", tag: "Clean Grids & Mining" },
  { id: "AGRITECH_FOOD", name: "Agriculture, Agritech & Food Expo", tag: "Smart Farming & Logistics" },
  { id: "HOSPITALITY_TOURISM", name: "Hospitality, Tourism & Travel Mart", tag: "Hoteliers & Airline Buyers" },
  { id: "EDUCATION_EDTECH", name: "Education, EdTech & Academic Summit", tag: "University Fairs & STEM" },
  { id: "FASHION_RETAIL", name: "Fashion, Beauty & Luxury Retail", tag: "Runways & Cosmetic OEM" },
  { id: "GOVERNMENT_DIPLOMATIC", name: "Government & Diplomatic Summit", tag: "Protocols & Bilateral Rooms" },
  { id: "INCENTIVE_RETREAT", name: "Incentive & Corporate Retreat", tag: "Excursions & Executive Galas" },
];

export default function EventCustomizerPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const eventId = (params?.slug || params?.id || "") as string;

  let tOrg: any = (k: string) => k;
  let tCom: any = (k: string) => k;
  let tArch: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tOrg = useTranslations("organizer");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tCom = useTranslations("common");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tArch = useTranslations("archetypes");
  } catch {
    // Fallback
  }

  const [eventData, setEventData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  // Customizer State
  const [archetype, setArchetype] = React.useState<MiceArchetype>("INDUSTRIAL_B2B");
  const [primaryColor, setPrimaryColor] = React.useState("#1e3a8a");
  const [accentColor, setAccentColor] = React.useState("#d97706");
  const [fontFamily, setFontFamily] = React.useState("font-sans");
  const [heroBadge, setHeroBadge] = React.useState("");
  const [heroImageUrl, setHeroImageUrl] = React.useState(
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80"
  );
  const [bannerOverlayOpacity, setBannerOverlayOpacity] = React.useState(0.75);

  const [sectionsVisibility, setSectionsVisibility] = React.useState({
    agenda: true,
    booths: true,
    tickets: true,
    perks: true,
  });

  // Fetch Event Data on Mount
  React.useEffect(() => {
    async function loadEvent() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.event) {
            setEventData(data.event);
            if (data.event.archetype) {
              setArchetype(data.event.archetype as MiceArchetype);
            }
            const branding = parseBrandingConfig(data.event.brandingConfigJson);
            const defaults = getArchetypeTokens(data.event.archetype, branding);
            setPrimaryColor(defaults.primary);
            setAccentColor(defaults.accent);
            setFontFamily(branding.fontFamilyOverride || defaults.fontFamily);
            setHeroBadge(branding.heroBadge || "");
            if (data.event.heroImageUrl) setHeroImageUrl(data.event.heroImageUrl);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Fallback
      }

      // Default mock event for test / new events
      const fallbackEvent = {
        id: eventId,
        title: "Indonesia Green Energy & Battery Expo 2027",
        slug: "indonesia-green-energy-battery-expo-2027",
        tagline: "The Premier EV Ecosystem, Battery Logistics & Clean Grid Assembly",
        archetype: "ENERGY_INFRASTRUCTURE" as MiceArchetype,
        startDate: "2027-04-14",
        endDate: "2027-04-17",
        venue: { name: "JIExpo Kemayoran" },
        venueHall: { name: "Hall A1 (Main Exhibition)" },
        heroImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
        ticketTiers: [
          { name: "Standard Trade Pass", price: 0, currency: "IDR", capacity: 3500 },
          { name: "VIP Buyer Delegate", price: 750000, currency: "IDR", capacity: 400 },
        ],
      };

      setEventData(fallbackEvent);
      setArchetype(fallbackEvent.archetype);
      const defaults = getArchetypeTokens(fallbackEvent.archetype);
      setPrimaryColor(defaults.primary);
      setAccentColor(defaults.accent);
      setFontFamily(defaults.fontFamily);
      setIsLoading(false);
    }

    loadEvent();
  }, [eventId]);

  const handleSelectArchetype = (newArch: MiceArchetype) => {
    setArchetype(newArch);
    const defaults = ARCHETYPE_DEFAULTS[newArch] || ARCHETYPE_DEFAULTS.INDUSTRIAL_B2B;
    setPrimaryColor(defaults.primary);
    setAccentColor(defaults.accent);
    setFontFamily(defaults.fontFamily);
    setHeroBadge(defaults.displayName);
  };

  const handleApplyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setPrimaryColor(preset.primary);
    setAccentColor(preset.accent);
  };

  const handleResetDefaults = () => {
    if (!eventData) return;
    const defaults = ARCHETYPE_DEFAULTS[archetype] || ARCHETYPE_DEFAULTS.INDUSTRIAL_B2B;
    setPrimaryColor(defaults.primary);
    setAccentColor(defaults.accent);
    setFontFamily(defaults.fontFamily);
    setHeroBadge("");
    setBannerOverlayOpacity(0.75);
  };

  const handleSaveBranding = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage("");

    const brandingConfig = {
      primaryColor,
      accentColor,
      fontFamilyOverride: fontFamily,
      heroBadge: heroBadge || undefined,
      bannerOverlayOpacity,
    };

    try {
      const res = await fetch(`/api/organizer/events/${eventId}/branding`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandingConfig,
          heroImageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save branding");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1800px] mx-auto animate-fade-in">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/dashboard`}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <Badge variant="archetype" size="sm">Live Customizer</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
            {eventData?.title || "Visual Branding Customizer"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure CSS variable theme tokens, typography, hero media, and section visibility with real-time responsive preview.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs gap-1.5 h-9 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{tOrg("resetDefaults") || "Reset Defaults"}</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveBranding}
            disabled={isSaving}
            className="text-xs gap-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? (tOrg("saving") || "Saving...") : (tOrg("saveBranding") || "Save Branding")}</span>
          </Button>

          {eventData?.slug && (
            <Link href={`/${locale}/events/${eventData.slug}`} target="_blank">
              <Button variant="secondary" size="sm" className="text-xs gap-1.5 h-9 cursor-pointer">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{tOrg("viewPublic") || "View Public"}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{tOrg("saveSuccess") || "Visual branding configuration persisted successfully to event database!"}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2.5 text-xs text-destructive animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2-COLUMN SIDE-BY-SIDE RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: CUSTOMIZER CONTROLS (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 0: Event Category Archetype */}
          <Card className="p-5 border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span>MICE Event Category</span>
              </h3>
              <Badge variant="neutral" size="sm">15 Types</Badge>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Select an event category to switch layout behavior, default color tokens, and domain features.
            </p>

            <div className="space-y-2">
              <select
                value={archetype}
                onChange={(e) => handleSelectArchetype(e.target.value as MiceArchetype)}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground cursor-pointer"
              >
                {ALL_ARCHETYPE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name} ({opt.tag})
                  </option>
                ))}
              </select>
            </div>
          </Card>

          {/* Card 1: Theme Color Tokens */}
          <Card className="p-5 border-border bg-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <span>Primary & Accent Color Tokens</span>
              </h3>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground block">
                Quick Palette Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-muted/40 hover:bg-accent text-[11px] text-foreground transition-colors cursor-pointer"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: p.primary }}
                    />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary & Accent Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Primary Brand Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="h-9 w-12 rounded cursor-pointer border border-border"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="h-9 w-12 rounded cursor-pointer border border-border"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Typography Tokens */}
          <Card className="p-5 border-border bg-card space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Type className="h-4 w-4 text-primary" />
              <span>Event Typography Pairings</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "font-sans", label: "Modern Sans", desc: "Plus Jakarta Sans / Modern" },
                { id: "font-serif", label: "Editorial Serif", desc: "Classic & Medical" },
                { id: "font-mono", label: "Technical Mono", desc: "Tech & Industrial" },
                { id: "font-legible", label: "Accessible Legible", desc: "High Readability" },
              ].map((f) => (
                <div
                  key={f.id}
                  onClick={() => setFontFamily(f.id)}
                  className={cn(
                    "p-2.5 rounded-lg border text-left cursor-pointer transition-all",
                    fontFamily === f.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border hover:border-primary/40 bg-card"
                  )}
                >
                  <div className="text-xs font-bold text-foreground">{f.label}</div>
                  <div className="text-[10px] text-muted-foreground">{f.desc}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Card 3: Hero Media & Badge Overrides */}
          <Card className="p-5 border-border bg-card space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              <span>Hero Media & Overlay Controls</span>
            </h3>

            <Input
              label="Custom Hero Badge Label"
              placeholder="e.g. Official 2027 Flagship Summit"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              helperText="Overrides default archetype category badge."
            />

            <div>
              <Input
                label="Hero Banner Image URL"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {HERO_IMAGE_PRESETS.map((hip) => (
                  <button
                    key={hip.name}
                    type="button"
                    onClick={() => setHeroImageUrl(hip.url)}
                    className="text-[10px] px-2 py-1 bg-muted/60 hover:bg-muted border border-border rounded text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {hip.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Banner Overlay Opacity</span>
                <span className="font-mono text-muted-foreground">{Math.round(bannerOverlayOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.95"
                step="0.05"
                value={bannerOverlayOpacity}
                onChange={(e) => setBannerOverlayOpacity(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-primary"
              />
            </div>
          </Card>

          {/* Card 4: Section Visibility Toggles */}
          <Card className="p-5 border-border bg-card space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              <span>Event Page Section Visibility</span>
            </h3>

            <div className="space-y-2 text-xs">
              {[
                { key: "tickets", label: "Delegate Pass Checkout Drawer" },
                { key: "agenda", label: "Keynote Track Timetable" },
                { key: "booths", label: "Exhibitor Floor Directory" },
                { key: "perks", label: "Attendee Perks & Guidebook Unlock" },
              ].map((sec) => {
                const isChecked = (sectionsVisibility as any)[sec.key];
                return (
                  <label
                    key={sec.key}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border/60 cursor-pointer"
                  >
                    <span className="font-medium text-foreground">{sec.label}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setSectionsVisibility({
                          ...sectionsVisibility,
                          [sec.key]: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded accent-primary cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: REAL-TIME LIVE PREVIEW FRAME (7 cols on lg) */}
        <div className="lg:col-span-7 sticky top-20">
          <LivePreviewFrame
            eventTitle={eventData?.title || "Event Title Preview"}
            tagline={eventData?.tagline}
            archetype={archetype}
            venueName={eventData?.venue?.name}
            hallName={eventData?.venueHall?.name}
            datesText="Apr 14 - Apr 17, 2027"
            heroImageUrl={heroImageUrl}
            primaryColor={primaryColor}
            accentColor={accentColor}
            fontFamily={fontFamily}
            heroBadge={heroBadge}
            bannerOverlayOpacity={bannerOverlayOpacity}
            sectionsVisibility={sectionsVisibility}
            ticketTiers={eventData?.ticketTiers}
          />
        </div>
      </div>
    </div>
  );
}
