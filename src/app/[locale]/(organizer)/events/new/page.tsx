"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  PlusCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Building2,
  Ticket,
  Palette,
  Sparkles,
  Info,
  Layers,
  Trash2,
  Plus,
  Compass,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Save,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/session";
import { ARCHETYPE_DEFAULTS, ARCHETYPE_METADATA, MiceArchetype, getArchetypeTokens } from "@/lib/theming";
import { cn } from "@/lib/utils";

const DRAFT_STORAGE_KEY = "xpo_wizard_draft_v1";

const ALL_ARCHETYPES: MiceArchetype[] = [
  "INDUSTRIAL_B2B",
  "TECH_DEV_SUMMIT",
  "MEDICAL_SYMPOSIUM",
  "FINANCE_INVESTOR",
  "POP_CULTURE_GAMING",
  "MUSIC_FESTIVAL",
  "MEGA_EXPO_PAVILION",
  "GOVERNMENT_DIPLOMATIC",
  "INCENTIVE_RETREAT",
  "AUTOMOTIVE_MOBILITY",
  "ENERGY_INFRASTRUCTURE",
  "AGRITECH_FOOD",
  "HOSPITALITY_TOURISM",
  "EDUCATION_EDTECH",
  "FASHION_RETAIL",
];

interface TicketTierDraft {
  id: string;
  name: string;
  price: number;
  currency: string;
  capacity: number;
  benefits: string;
}

export default function NewEventWizardPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const { role, switchRole } = useAuth();

  const tOrg = useTranslations("organizer");
  const tCom = useTranslations("common");
  const tArch = useTranslations("archetypes");

  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [hasDraftAvailable, setHasDraftAvailable] = React.useState(false);

  // Step 1: General Info & Archetype
  const [title, setTitle] = React.useState("Indonesia Green Energy & Battery Expo 2027");
  const [slug, setSlug] = React.useState("indonesia-green-energy-battery-expo-2027");
  const [tagline, setTagline] = React.useState("The Premier EV Ecosystem, Battery Logistics & Clean Grid Assembly");
  const [description, setDescription] = React.useState(
    "Join 15,000+ industry delegates, OEMs, and battery grid engineers across 4 exhibition halls. Featuring bilateral procurement contracts, live technical keynotes, and renewable power infrastructure demos."
  );
  const [archetype, setArchetype] = React.useState<MiceArchetype>("ENERGY_INFRASTRUCTURE");
  const [format, setFormat] = React.useState("IN_PERSON");
  const [scale, setScale] = React.useState("LARGE");

  // Step 2: Venue & Hall
  const [regionId, setRegionId] = React.useState("id");
  const [venueId, setVenueId] = React.useState("");
  const [venueHallId, setVenueHallId] = React.useState("");
  const [venuesList, setVenuesList] = React.useState<any[]>([]);
  const [startDate, setStartDate] = React.useState("2027-04-14");
  const [endDate, setEndDate] = React.useState("2027-04-17");

  // Step 3: Ticket Tiers
  const [ticketTiers, setTicketTiers] = React.useState<TicketTierDraft[]>([
    {
      id: "tier-1",
      name: "Standard Trade Visitor Pass",
      price: 0,
      currency: "IDR",
      capacity: 3500,
      benefits: "Exhibition Floor Access, Daily Open Keynotes, Digital Guidebook",
    },
    {
      id: "tier-2",
      name: "VIP Buyer & Delegate Pass",
      price: 750000,
      currency: "IDR",
      capacity: 400,
      benefits: "Fast-Track QR Gate, VIP Procurement Lounge, B2B Matchmaking App, Speaker Slide Downloads",
    },
  ]);

  // Step 4: Branding Tokens
  const [primaryColor, setPrimaryColor] = React.useState("#ca8a04");
  const [accentColor, setAccentColor] = React.useState("#16a34a");
  const [heroImageUrl, setHeroImageUrl] = React.useState(
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80"
  );

  // Fetch Venues on Mount & Check Draft
  React.useEffect(() => {
    async function loadVenues() {
      try {
        const res = await fetch("/api/venues");
        if (res.ok) {
          const data = await res.json();
          if (data.venues && data.venues.length > 0) {
            setVenuesList(data.venues);
            setVenueId(data.venues[0].id);
            if (data.venues[0].halls && data.venues[0].halls.length > 0) {
              setVenueHallId(data.venues[0].halls[0].id);
            }
            return;
          }
        }
      } catch {
        // Fallback below
      }

      // Fallback Seeded Venues
      const defaultVenues = [
        {
          id: "v-jiexpo",
          name: "JIExpo Kemayoran",
          regionId: "id",
          city: "Jakarta Pusat",
          halls: [
            { id: "h-jiexpo-a1", name: "Hall A1 (Main Exhibition)", capacity: 5000 },
            { id: "h-jiexpo-a2", name: "Hall A2 (Machinery Pavilion)", capacity: 4500 },
            { id: "h-jiexpo-b1", name: "Hall B1 (B2B Summit)", capacity: 3500 },
          ],
        },
        {
          id: "v-ice",
          name: "ICE BSD City",
          regionId: "id",
          city: "Tangerang",
          halls: [
            { id: "h-ice-1", name: "Nusantara Hall 1", capacity: 6000 },
            { id: "h-ice-2", name: "Hall 3A (Convention)", capacity: 4000 },
          ],
        },
        {
          id: "v-bigsight",
          name: "Tokyo Big Sight",
          regionId: "jp",
          city: "Tokyo (Odaiba)",
          halls: [
            { id: "h-tbs-east", name: "East Exhibition Hall 1-3", capacity: 8000 },
            { id: "h-tbs-west", name: "West Exhibition Hall", capacity: 6000 },
          ],
        },
        {
          id: "v-mbs",
          name: "Marina Bay Sands Expo",
          regionId: "global",
          city: "Singapore",
          halls: [
            { id: "h-mbs-sands", name: "Sands Expo Grand Ballroom", capacity: 7000 },
          ],
        },
      ];

      setVenuesList(defaultVenues);
      setVenueId(defaultVenues[0].id);
      setVenueHallId(defaultVenues[0].halls[0].id);
    }

    loadVenues();

    // Check LocalStorage Draft
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        setHasDraftAvailable(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save Draft to LocalStorage whenever critical fields change
  React.useEffect(() => {
    try {
      const draftData = {
        title,
        slug,
        tagline,
        description,
        archetype,
        format,
        scale,
        regionId,
        venueId,
        venueHallId,
        startDate,
        endDate,
        ticketTiers,
        primaryColor,
        accentColor,
        heroImageUrl,
        currentStep,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    } catch {
      // Storage full or disabled
    }
  }, [
    title,
    slug,
    tagline,
    description,
    archetype,
    format,
    scale,
    regionId,
    venueId,
    venueHallId,
    startDate,
    endDate,
    ticketTiers,
    primaryColor,
    accentColor,
    heroImageUrl,
    currentStep,
  ]);

  // Restore Draft
  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!saved) return;
      const d = JSON.parse(saved);
      if (d.title) setTitle(d.title);
      if (d.slug) setSlug(d.slug);
      if (d.tagline) setTagline(d.tagline);
      if (d.description) setDescription(d.description);
      if (d.archetype) setArchetype(d.archetype);
      if (d.format) setFormat(d.format);
      if (d.scale) setScale(d.scale);
      if (d.regionId) setRegionId(d.regionId);
      if (d.venueId) setVenueId(d.venueId);
      if (d.venueHallId) setVenueHallId(d.venueHallId);
      if (d.startDate) setStartDate(d.startDate);
      if (d.endDate) setEndDate(d.endDate);
      if (d.ticketTiers && Array.isArray(d.ticketTiers)) setTicketTiers(d.ticketTiers);
      if (d.primaryColor) setPrimaryColor(d.primaryColor);
      if (d.accentColor) setAccentColor(d.accentColor);
      if (d.heroImageUrl) setHeroImageUrl(d.heroImageUrl);
      if (d.currentStep) setCurrentStep(d.currentStep);
      setHasDraftAvailable(false);
    } catch {
      // Error restoring
    }
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setHasDraftAvailable(false);
    } catch {
      // Ignore
    }
  };

  // Update Archetype default colors when archetype changes
  const handleArchetypeSelect = (arch: MiceArchetype) => {
    setArchetype(arch);
    const defaults = getArchetypeTokens(arch);
    setPrimaryColor(defaults.primary);
    setAccentColor(defaults.accent);
  };

  // Auto-slug generator
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generated);
  };

  // Filtered Venues by Region
  const filteredVenues = React.useMemo(() => {
    return venuesList.filter((v) => !v.regionId || v.regionId.toLowerCase() === regionId.toLowerCase());
  }, [venuesList, regionId]);

  // Selected Venue Halls
  const selectedVenue = React.useMemo(() => {
    return venuesList.find((v) => v.id === venueId);
  }, [venuesList, venueId]);

  const handleRegionChange = (newReg: string) => {
    setRegionId(newReg);
    const matching = venuesList.filter((v) => !v.regionId || v.regionId.toLowerCase() === newReg.toLowerCase());
    if (matching.length > 0) {
      setVenueId(matching[0].id);
      if (matching[0].halls && matching[0].halls.length > 0) {
        setVenueHallId(matching[0].halls[0].id);
      }
    }
  };

  // Add/Remove Tiers
  const handleAddTier = () => {
    const newTier: TicketTierDraft = {
      id: `tier-${Date.now()}`,
      name: `Exhibitor / Delegate Pass ${ticketTiers.length + 1}`,
      price: 1000000,
      currency: regionId === "jp" ? "JPY" : regionId === "global" ? "USD" : "IDR",
      capacity: 250,
      benefits: "All-Access Pass, Networking Dinner, Exhibition Booth Passes",
    };
    setTicketTiers([...ticketTiers, newTier]);
  };

  const handleRemoveTier = (id: string) => {
    if (ticketTiers.length <= 1) return;
    setTicketTiers(ticketTiers.filter((t) => t.id !== id));
  };

  const handleUpdateTier = (id: string, field: keyof TicketTierDraft, val: any) => {
    setTicketTiers(
      ticketTiers.map((t) => (t.id === id ? { ...t, [field]: val } : t))
    );
  };

  // Validation before advancing
  const validateStep = (step: number): boolean => {
    setErrorMessage("");
    if (step === 1) {
      if (!title.trim()) {
        setErrorMessage("Please enter an event title.");
        return false;
      }
      if (!description.trim()) {
        setErrorMessage("Please provide an event description.");
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!venueId) {
        setErrorMessage("Please select a hosting venue.");
        return false;
      }
      if (!startDate || !endDate) {
        setErrorMessage("Please specify start and end dates.");
        return false;
      }
      if (new Date(endDate) < new Date(startDate)) {
        setErrorMessage("End date cannot be prior to start date.");
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (ticketTiers.length === 0) {
        setErrorMessage("Please configure at least one ticket pass tier.");
        return false;
      }
      for (const t of ticketTiers) {
        if (!t.name.trim()) {
          setErrorMessage("All ticket tiers must have a descriptive title.");
          return false;
        }
      }
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setErrorMessage("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit and launch event
  const handleSubmitEvent = async () => {
    if (role === "ATTENDEE") {
      setErrorMessage(tOrg("wizardRbacBlocked") || "Attendee accounts are restricted from launching events. Please switch to an Organizer or Admin role to proceed.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const payload = {
      title,
      slug,
      tagline,
      description,
      archetype,
      format,
      scale,
      regionId,
      venueId,
      venueHallId,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      primaryColor,
      accentColor,
      heroImageUrl,
      ticketTiers: ticketTiers.map((t) => ({
        name: t.name,
        price: t.price,
        currency: t.currency,
        capacity: t.capacity,
        benefits: t.benefits.split(",").map((b) => b.trim()).filter(Boolean),
      })),
    };

    try {
      const res = await fetch("/api/organizer/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create event");
      }

      // Clear LocalStorage Draft upon successful creation
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Ignore
      }

      // Redirect to live visual customizer for the created event
      router.push(`/${locale}/events/${data.event.id}/customizer`);
    } catch (err) {
      setErrorMessage((err as Error).message);
      setIsSubmitting(false);
    }
  };

  // RBAC Access Barrier for Attendee
  if (role === "ATTENDEE") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-12 text-center animate-fade-in">
        <div className="p-8 bg-card border border-border rounded-2xl shadow-sm space-y-5">
          <div className="h-16 w-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <Badge variant="warning" size="sm">{tOrg("rbacRequiredTitle") || "Organizer Access Required"}</Badge>
            <h2 className="text-xl font-bold text-foreground">
              {tOrg("wizardTitle") || "Create & Launch MICE Exhibition"}
            </h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {tOrg("wizardRbacBlocked") || "Attendee accounts are restricted from launching events. Please switch to an Organizer or Admin role to proceed."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-border">
            <Button
              variant="primary"
              onClick={() => switchRole("ORGANIZER")}
              className="w-full sm:w-auto gap-2 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
            >
              <UserCheck className="h-4 w-4" />
              <span>{tOrg("switchToOrganizer") || "Switch to Organizer Persona"}</span>
            </Button>
            <Link href={`/${locale}`}>
              <Button variant="outline" className="w-full sm:w-auto cursor-pointer">
                {tCom("backToHome") || "Back to Discovery"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      {/* Wizard Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {tOrg("wizardHeader") || "Event Launch Wizard"}
          </span>
          <Badge variant="outline" size="sm">{tOrg("wizardStepOf", { current: currentStep, total: 4 }) || `Step ${currentStep} of 4`}</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
          {tOrg("wizardTitle") || "Create & Launch MICE Exhibition"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {tOrg("wizardSubtitle") || "Follow the 4-step pipeline to configure event category archetypes, hall allocations, ticket passes, and visual branding."}
        </p>
      </div>

      {/* DRAFT RESTORATION ALERT */}
      {hasDraftAvailable && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-between gap-3 text-xs animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <Save className="h-4 w-4 text-primary shrink-0" />
            <span>
              <strong>Unsaved Event Draft Detected.</strong> Would you like to resume your previous event configuration?
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="primary"
              onClick={handleRestoreDraft}
              className="h-8 text-xs gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Resume Draft</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDiscardDraft}
              className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Discard
            </Button>
          </div>
        </div>
      )}

      {/* STEP PROGRESS TRACKER BAR */}
      <nav aria-label="Wizard Steps" className="grid grid-cols-4 gap-2 border-b border-border/80 pb-4">
        {[
          { step: 1, label: tOrg("wizardStep1") || "General & Archetype", icon: Info },
          { step: 2, label: tOrg("wizardStep2") || "Venue & Halls", icon: Building2 },
          { step: 3, label: tOrg("wizardStep3") || "Ticket Passes", icon: Ticket },
          { step: 4, label: tOrg("wizardStep4") || "Branding & Review", icon: Palette },
        ].map((s) => {
          const Icon = s.icon;
          const isCompleted = currentStep > s.step;
          const isCurrent = currentStep === s.step;
          const canClick = s.step < currentStep;

          return (
            <button
              key={s.step}
              type="button"
              disabled={!canClick && !isCurrent}
              onClick={() => {
                if (canClick) {
                  setErrorMessage("");
                  setCurrentStep(s.step);
                }
              }}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg text-xs transition-colors text-left focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                canClick ? "cursor-pointer hover:bg-muted/60" : "cursor-default",
                isCurrent
                  ? "bg-primary/10 text-primary font-semibold border border-primary/30"
                  : isCompleted
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center text-xs shrink-0 font-bold",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : s.step}
              </div>
              <span className="hidden sm:inline truncate">{s.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2.5 text-xs text-destructive animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: General Info & Category Archetype */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <Card className="p-6 border-border bg-card space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <span>{tOrg("wizardDetailsTitle") || "Event Details & Scale"}</span>
            </h3>

            <div className="space-y-4">
              <Input
                id="wizard-event-title"
                label={tOrg("wizardEventTitle") || "Event Title"}
                placeholder="e.g. Indonesia Green Energy & Battery Expo"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Input
                    id="wizard-slug"
                    label={tOrg("wizardSlug") || "URL Slug"}
                    placeholder="event-slug-identifier"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    helperText={tOrg("wizardSlugHelper") || "Unique public URL path for attendee exploration."}
                    required
                  />
                  <span className="text-xs text-muted-foreground block font-mono pl-1">
                    Slug generated from title
                  </span>
                </div>
                <Input
                  id="wizard-tagline"
                  label={tOrg("wizardTagline") || "Tagline / Hero Subtitle"}
                  placeholder={tOrg("wizardTaglinePlaceholder") || "Short tagline summary"}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="wizard-description" className="block text-xs font-semibold text-foreground mb-1.5">
                  {tOrg("wizardDescription") || "Executive Description"}
                </label>
                <textarea
                  id="wizard-description"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={tOrg("wizardDescPlaceholder") || "Provide comprehensive details about the scheduled convention..."}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label htmlFor="wizard-format-select" className="block text-xs font-semibold text-foreground mb-1.5">
                    {tOrg("wizardFormat") || "Event Format"}
                  </label>
                  <select
                    id="wizard-format-select"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <option value="IN_PERSON">{tOrg("wizardFormatInPerson") || "In-Person Only"}</option>
                    <option value="HYBRID">{tOrg("wizardFormatHybrid") || "Hybrid (In-Person + Live Stream)"}</option>
                    <option value="VIRTUAL">{tOrg("wizardFormatVirtual") || "Virtual Convention"}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="wizard-scale-select" className="block text-xs font-semibold text-foreground mb-1.5">
                    {tOrg("wizardScale") || "Event Scale"}
                  </label>
                  <select
                    id="wizard-scale-select"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                    value={scale}
                    onChange={(e) => setScale(e.target.value)}
                  >
                    <option value="GLOBAL_MEGA">{tOrg("wizardScaleGlobalMega") || "Global Mega Exposition (20,000+)"}</option>
                    <option value="LARGE">{tOrg("wizardScaleLarge") || "Large Convention (5,000 - 20,000)"}</option>
                    <option value="MEDIUM">{tOrg("wizardScaleMedium") || "Medium Industry Summit (1,000 - 5,000)"}</option>
                    <option value="EXECUTIVE">{tOrg("wizardScaleExecutive") || "Executive / VIP Symposium (< 1,000)"}</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* 15 Archetype Category Cards Grid */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {tOrg("wizardArchetypeSelect") || "Select MICE Category Archetype"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {tOrg("wizardArchetypeSubtitle") || "Each archetype automatically tailors UI tokens, custom badges, and specialized domain layouts."}
              </p>
            </div>

            <div
              role="radiogroup"
              aria-label="Select MICE Category Archetype"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {ALL_ARCHETYPES.map((arch) => {
                const meta = ARCHETYPE_METADATA[arch];
                const tokens = ARCHETYPE_DEFAULTS[arch];
                const isSelected = archetype === arch;

                const displayName = tArch(`${arch}.title`) || tokens.displayName;
                const desc = tArch(`${arch}.description`) || meta?.description || tokens.tagline;

                return (
                  <button
                    key={arch}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleArchetypeSelect(arch)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleArchetypeSelect(arch);
                      }
                    }}
                    className={cn(
                      "p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-3 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs"
                        : "border-border bg-card hover:border-primary/40"
                    )}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          {displayName}
                        </span>
                        {isSelected ? (
                          <Badge variant="archetype" size="sm">{tCom("selected") || "Selected"}</Badge>
                        ) : (
                          <div
                            className="h-3.5 w-3.5 rounded-full border border-border"
                            style={{ backgroundColor: tokens.primary }}
                          />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: tokens.accent }}
                      />
                      <span className="truncate">{tCom("category") || "Category"}: {displayName}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Venue & Hall Selection */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Card className="p-6 border-border bg-card space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span>{tOrg("wizardVenueHalls") || "Hosting Venue & Hall Allocation"}</span>
            </h3>

            <div
              role="radiogroup"
              aria-label="Select Target Country Region Hub"
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {[
                { id: "id", name: "Indonesia Hub", desc: "JIExpo, ICE BSD, JICC, GBK" },
                { id: "jp", name: "Japan Hub", desc: "Tokyo Big Sight, Makuhari Messe" },
                { id: "global", name: "Global Hub", desc: "Marina Bay Sands, Messe Frankfurt" },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={regionId === r.id}
                  onClick={() => handleRegionChange(r.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleRegionChange(r.id);
                    }
                  }}
                  className={cn(
                    "p-3.5 rounded-xl border text-left cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                    regionId === r.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30 shadow-xs"
                      : "border-border hover:border-primary/40 bg-card"
                  )}
                >
                  <div className="text-xs font-bold text-foreground">{r.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label htmlFor="wizard-venue-select" className="block text-xs font-semibold text-foreground mb-1.5">
                  {tOrg("wizardSelectVenue") || "Select Exhibition Venue"}
                </label>
                <select
                  id="wizard-venue-select"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                  value={venueId}
                  onChange={(e) => {
                    setVenueId(e.target.value);
                    const v = venuesList.find((ven) => ven.id === e.target.value);
                    if (v && v.halls && v.halls.length > 0) {
                      setVenueHallId(v.halls[0].id);
                    }
                  }}
                >
                  {filteredVenues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="wizard-hall-select" className="block text-xs font-semibold text-foreground mb-1.5">
                  {tOrg("wizardSelectHall") || "Select Primary Exhibition Hall"}
                </label>
                <select
                  id="wizard-hall-select"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                  value={venueHallId}
                  onChange={(e) => setVenueHallId(e.target.value)}
                >
                  {selectedVenue?.halls?.map((h: any) => (
                    <option key={h.id} value={h.id}>
                      {h.name} {h.capacity ? `(Cap: ${h.capacity.toLocaleString()})` : ""}
                    </option>
                  )) || <option value="">Main Exhibition Complex</option>}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
              <Input
                id="wizard-start-date"
                label={tOrg("wizardStartDate") || "Opening Date"}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <Input
                id="wizard-end-date"
                label={tOrg("wizardEndDate") || "Closing Date"}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </Card>
        </div>
      )}

      {/* STEP 3: Ticket Tiers & Pricing */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">{tOrg("wizardTiersTitle") || "Ticket Pass Tiers & Capacities"}</h3>
              <p className="text-xs text-muted-foreground">
                {tOrg("wizardTiersSubtitle") || "Define pass pricing, capacities, and perks unlocked upon QR validation."}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={handleAddTier} className="text-xs gap-1.5 cursor-pointer">
              <Plus className="h-3.5 w-3.5" />
              <span>{tOrg("wizardAddTier") || "Add Ticket Pass Tier"}</span>
            </Button>
          </div>

          <div className="space-y-4">
            {ticketTiers.map((tier, idx) => (
              <Card key={tier.id} className="p-5 border-border bg-card space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" size="sm">{tOrg("wizardTierBadge", { num: idx + 1 }) || `Tier #${idx + 1}`}</Badge>
                  {ticketTiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(tier.id)}
                      className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{tCom("delete") || "Remove"}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      id={`wizard-tier-name-${idx}`}
                      label={tOrg("wizardTierName") || "Pass Tier Name"}
                      placeholder="e.g. Standard Delegate Pass"
                      value={tier.name}
                      onChange={(e) => handleUpdateTier(tier.id, "name", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      id={`wizard-tier-capacity-${idx}`}
                      label={tOrg("wizardTierCapacity") || "Capacity (Slots)"}
                      type="number"
                      placeholder="500"
                      value={tier.capacity}
                      onChange={(e) => handleUpdateTier(tier.id, "capacity", Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Input
                      id={`wizard-tier-price-${idx}`}
                      label={tOrg("wizardTierPrice") || "Price"}
                      type="number"
                      placeholder="0"
                      value={tier.price}
                      onChange={(e) => handleUpdateTier(tier.id, "price", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label htmlFor={`wizard-tier-currency-${idx}`} className="block text-xs font-semibold text-foreground mb-1.5">
                      {tOrg("wizardTierCurrency") || "Currency"}
                    </label>
                    <select
                      id={`wizard-tier-currency-${idx}`}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                      value={tier.currency}
                      onChange={(e) => handleUpdateTier(tier.id, "currency", e.target.value)}
                    >
                      <option value="IDR">IDR (Rp)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-1">
                    <Input
                      id={`wizard-tier-benefits-${idx}`}
                      label={tOrg("wizardTierBenefits") || "Included Benefits (comma separated)"}
                      placeholder="Floor Access, VIP Lounge"
                      value={tier.benefits}
                      onChange={(e) => handleUpdateTier(tier.id, "benefits", e.target.value)}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: Branding & Confirmation Review */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <Card className="p-6 border-border bg-card space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              <span>{tOrg("wizardBrandingTitle") || "Visual Branding & Review"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="wizard-primary-color" className="block text-xs font-semibold text-foreground mb-1.5">
                  {tOrg("wizardPrimaryColor") || "Primary Accent Color"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="wizard-primary-color"
                    type="color"
                    className="h-9 w-12 rounded cursor-pointer border border-border"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                  <Input
                    id="wizard-primary-color-text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="wizard-accent-color" className="block text-xs font-semibold text-foreground mb-1.5">
                  {tOrg("wizardAccentColor") || "Secondary Accent Color"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="wizard-accent-color"
                    type="color"
                    className="h-9 w-12 rounded cursor-pointer border border-border"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                  />
                  <Input
                    id="wizard-accent-color-text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            <Input
              id="wizard-hero-image"
              label={tOrg("wizardHeroImage") || "Hero Banner Image URL"}
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
            />
          </Card>

          {/* Review Summary Card */}
          <Card className="p-6 border-border bg-card space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{tOrg("wizardSummaryTitle") || "Event Specification Summary"}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <div className="text-muted-foreground">{tOrg("wizardSummaryTitleCat") || "Title & Category:"}</div>
                <div className="font-bold text-foreground text-sm">{title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="archetype" size="sm">{tArch(`${archetype}.title`) || ARCHETYPE_DEFAULTS[archetype].displayName}</Badge>
                  <span className="text-muted-foreground uppercase">{format} • {scale}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-muted-foreground">{tOrg("wizardSummaryVenueDates") || "Hosting Venue & Dates:"}</div>
                <div className="font-semibold text-foreground">
                  {selectedVenue?.name || "Selected Venue"}
                </div>
                <div className="text-muted-foreground">
                  {startDate} to {endDate}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60">
              <div className="text-xs font-semibold text-foreground mb-2">
                {tOrg("wizardSummaryTiers", { count: ticketTiers.length }) || `Configured Pass Tiers (${ticketTiers.length})`}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ticketTiers.map((t) => (
                  <div key={t.id} className="p-2.5 bg-muted/40 rounded-lg text-xs">
                    <div className="font-semibold text-foreground">{t.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {t.price === 0 ? "Free" : `${t.currency} ${t.price.toLocaleString()}`} • Cap: {t.capacity}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* WIZARD NAVIGATION CONTROLS */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        {currentStep > 1 ? (
          <Button variant="outline" size="sm" onClick={prevStep} className="gap-1.5 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            <span>{tOrg("wizardBack") || "Previous Step"}</span>
          </Button>
        ) : (
          <div />
        )}

        {currentStep < 4 ? (
          <Button variant="primary" size="sm" onClick={nextStep} className="gap-1.5 cursor-pointer">
            <span>{tOrg("wizardNext") || "Continue"}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmitEvent}
            disabled={isSubmitting}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isSubmitting ? (tOrg("wizardCreating") || "Launching Event...") : (tOrg("wizardPublishButton") || "Publish & Open Customizer")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
