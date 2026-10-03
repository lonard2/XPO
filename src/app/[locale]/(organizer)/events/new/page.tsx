"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Factory,
  Cpu,
  Activity,
  TrendingUp,
  Gamepad2,
  Music,
  Tent,
  Landmark,
  Palmtree,
  Car,
  Zap,
  Sprout,
  Plane,
  GraduationCap,
  Sparkles,
  Building2,
  Shield,
  Truck,
  Store,
  Compass,
  Trophy,
  Video,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Ticket,
  Palette,
  Info,
  Trash2,
  Plus,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Save,
  Globe,
  Calendar,
  Check,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/session";
import {
  ARCHETYPE_DEFAULTS,
  ARCHETYPE_LIST,
  ARCHETYPE_METADATA,
  ARCHETYPE_METAS,
  ARCHETYPE_SUBTITLES,
  MICE_INDUSTRY_CLUSTERS,
  type MiceArchetype,
  getArchetypeTokens,
} from "@/lib/theming";
import { LivePreviewFrame } from "@/components/organizer/LivePreviewFrame";
import { cn } from "@/lib/utils";

const DRAFT_STORAGE_KEY = "xpo_wizard_draft_v1";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Factory,
  Cpu,
  Activity,
  TrendingUp,
  Gamepad2,
  Music,
  Tent,
  Landmark,
  Palmtree,
  Car,
  Zap,
  Sprout,
  Plane,
  GraduationCap,
  Sparkles,
  Building2,
  Shield,
  Truck,
  Store,
  Compass,
  Trophy,
  Video,
};

interface VenueHall {
  id: string;
  name: string;
  capacity?: number;
}

interface Venue {
  id: string;
  name: string;
  regionId?: string;
  city: string;
  halls?: VenueHall[];
}

interface TicketTierDraft {
  id: string;
  name: string;
  price: number;
  currency: string;
  capacity: number;
  benefits: string;
}

interface TemplatePreset {
  id: string;
  label: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  archetype: MiceArchetype;
  format: string;
  scale: string;
  primaryColor: string;
  accentColor: string;
  ticketTiers: TicketTierDraft[];
}

const TEMPLATES: Record<string, TemplatePreset> = {
  industrial: {
    id: "industrial",
    label: "Industrial B2B Machinery Expo",
    title: "Indonesia International Industrial Machinery & Automation Expo 2027",
    slug: "indonesia-industrial-machinery-automation-expo-2027",
    tagline: "Smart Manufacturing, CNC Robotics & Heavy Precision Engineering",
    description: "Connecting 20,000+ trade buyers, procurement directors, and industrial automation specialists across 5 halls. Features RFQ matchmaking, bilateral machinery contracts, and live robotics demonstrations.",
    archetype: "INDUSTRIAL_B2B",
    format: "IN_PERSON",
    scale: "GLOBAL_MEGA",
    primaryColor: "#0284c7",
    accentColor: "#d97706",
    ticketTiers: [
      {
        id: "tier-ind-1",
        name: "Standard Trade Buyer Pass",
        price: 0,
        currency: "IDR",
        capacity: 5000,
        benefits: "Exhibition Floor Access, Daily Open Keynotes, Digital Guidebook",
      },
      {
        id: "tier-ind-2",
        name: "VIP Procurement Delegate Pass",
        price: 1000000,
        currency: "IDR",
        capacity: 500,
        benefits: "Fast-Track Turnstile Entry, VIP Deal Room Access, B2B Matchmaking App, Gala Dinner",
      },
    ],
  },
  tech: {
    id: "tech",
    label: "Technology, AI & Electronics Summit",
    title: "Asia AI Systems & Consumer Electronics Expo 2027",
    slug: "asia-ai-systems-consumer-electronics-expo-2027",
    tagline: "Frontier Foundation Models, Agentic Tooling & Smart Devices",
    description: "3 days of deep-dive technical keynotes, multi-track code workshops, and product premieres with 6,000+ software engineers, consumer tech buyers, and venture partners.",
    archetype: "TECH_DEV_SUMMIT",
    format: "HYBRID",
    scale: "LARGE",
    primaryColor: "#4f46e5",
    accentColor: "#06b6d4",
    ticketTiers: [
      {
        id: "tier-tech-1",
        name: "Developer & Trade General Pass",
        price: 250000,
        currency: "IDR",
        capacity: 3000,
        benefits: "All-Track Keynotes, Workshop Access, Digital Badge",
      },
      {
        id: "tier-tech-2",
        name: "All-Access Speaker & VIP Pass",
        price: 1500000,
        currency: "IDR",
        capacity: 300,
        benefits: "VIP Lounge, Speaker Dinner, Device Showcase Fast-Track, Slide Archive",
      },
    ],
  },
  gaming: {
    id: "gaming",
    label: "Pop Culture & Gaming Fair",
    title: "Tokyo & Jakarta Pop Culture & Gaming Expo 2027",
    slug: "tokyo-jakarta-pop-culture-gaming-expo-2027",
    tagline: "Cosplay Championships, Indie Game Alley & Interactive Esports Arena",
    description: "Celebrating pop culture, creator alley art, gaming tournaments, and international cosplay showcases across 4 interactive pavilions.",
    archetype: "POP_CULTURE_GAMING",
    format: "IN_PERSON",
    scale: "LARGE",
    primaryColor: "#e11d48",
    accentColor: "#8b5cf6",
    ticketTiers: [
      {
        id: "tier-game-1",
        name: "Single-Day Fan Pass",
        price: 150000,
        currency: "IDR",
        capacity: 8000,
        benefits: "Pavilion Access, Cosplay Hall Entry, Stage Viewing",
      },
      {
        id: "tier-game-2",
        name: "VIP Fast-Pass & Creator Meet",
        price: 600000,
        currency: "IDR",
        capacity: 600,
        benefits: "Early Hall Access, Priority Stage Seating, Exclusive Merch Pack",
      },
    ],
  },
};

const CLUSTER_FILTERS = [
  { id: "ALL", label: `All Categories (${ARCHETYPE_LIST.length})` },
  ...MICE_INDUSTRY_CLUSTERS.map((c) => ({
    id: c.id,
    label: `${c.shortLabel} (${c.archetypes.length})`,
    archetypes: c.archetypes,
  })),
];

const BRANDING_PALETTES = [
  { label: "Classic Industrial", primary: "#0284c7", accent: "#f59e0b" },
  { label: "Frontier Tech", primary: "#4f46e5", accent: "#06b6d4" },
  { label: "Clinical Health", primary: "#0d9488", accent: "#10b981" },
  { label: "Luxury Retail", primary: "#db2777", accent: "#4f46e5" },
  { label: "Stage & Concert", primary: "#e11d48", accent: "#8b5cf6" },
  { label: "Enterprise Gold", primary: "#1e3a8a", accent: "#d97706" },
];

export default function NewEventWizardPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const { role, switchRole } = useAuth();

  const tOrg = useTranslations("organizer");
  const tCom = useTranslations("common");
  const tArch = useTranslations("archetypes");
  const tReg = useTranslations("regions");

  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [hasDraftAvailable, setHasDraftAvailable] = React.useState(false);
  const [isSlugDirty, setIsSlugDirty] = React.useState(false);
  const [selectedCluster, setSelectedCluster] = React.useState<string>("ALL");
  const [showDiscardModal, setShowDiscardModal] = React.useState(false);
  const isInitializedRef = React.useRef(false);

  const clearFieldError = React.useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // Step 1: General Info & Archetype (Clean initial canvas with template accelerators)
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [tagline, setTagline] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [archetype, setArchetype] = React.useState<MiceArchetype>("INDUSTRIAL_B2B");
  const [format, setFormat] = React.useState("IN_PERSON");
  const [scale, setScale] = React.useState("MEDIUM");

  const handleApplyTemplate = React.useCallback((templateKey: string) => {
    const tmpl = TEMPLATES[templateKey];
    if (!tmpl) return;
    setTitle(tmpl.title);
    setSlug(tmpl.slug);
    setTagline(tmpl.tagline);
    setDescription(tmpl.description);
    setArchetype(tmpl.archetype);
    setFormat(tmpl.format);
    setScale(tmpl.scale);
    setPrimaryColor(tmpl.primaryColor);
    setAccentColor(tmpl.accentColor);
    setTicketTiers(tmpl.ticketTiers);
    setIsSlugDirty(true);
    setErrorMessage("");
  }, []);

  // Step 2: Venue & Hall (Regional defaults derived from route locale)
  const initialRegion = React.useMemo(() => {
    return locale === "ja" ? "jp" : locale === "global" ? "global" : "id";
  }, [locale]);

  const [regionId, setRegionId] = React.useState(initialRegion);
  const [venueId, setVenueId] = React.useState("");
  const [venueHallId, setVenueHallId] = React.useState("");
  const [venueHallIds, setVenueHallIds] = React.useState<string[]>([]);
  const [venuesList, setVenuesList] = React.useState<Venue[]>([]);
  const [startDate, setStartDate] = React.useState("2027-04-14");
  const [endDate, setEndDate] = React.useState("2027-04-17");

  // Step 3: Ticket Tiers
  const defaultCurrency = initialRegion === "jp" ? "JPY" : initialRegion === "global" ? "USD" : "IDR";
  const defaultPaidPrice = initialRegion === "jp" ? 10000 : initialRegion === "global" ? 99 : 750000;

  const [ticketTiers, setTicketTiers] = React.useState<TicketTierDraft[]>([
    {
      id: "tier-1",
      name: "Standard Trade Visitor Pass",
      price: 0,
      currency: defaultCurrency,
      capacity: 3500,
      benefits: "Exhibition Floor Access, Daily Open Keynotes, Digital Guidebook",
    },
    {
      id: "tier-2",
      name: "VIP Buyer & Delegate Pass",
      price: defaultPaidPrice,
      currency: defaultCurrency,
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
            const matching = data.venues.filter((v: Venue) => !v.regionId || v.regionId.toLowerCase() === initialRegion.toLowerCase());
            const chosenVenue = matching[0] || data.venues[0];
            setVenueId(chosenVenue.id);
            const initialHalls = chosenVenue.halls?.[0]?.id ? [chosenVenue.halls[0].id] : [];
            setVenueHallId(initialHalls[0] || "");
            setVenueHallIds(initialHalls);
            return;
          }
        }
      } catch {
        // Fallback below
      }

      // Fallback Seeded Venues
      const defaultVenues: Venue[] = [
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
      const matching = defaultVenues.filter((v) => !v.regionId || v.regionId.toLowerCase() === initialRegion.toLowerCase());
      const chosenVenue = matching[0] || defaultVenues[0];
      setVenueId(chosenVenue.id);
      const initialHalls = chosenVenue.halls?.[0]?.id ? [chosenVenue.halls[0].id] : [];
      setVenueHallId(initialHalls[0] || "");
      setVenueHallIds(initialHalls);
    }

    loadVenues().finally(() => {
      // Check LocalStorage Draft
      let foundDraft = false;
      try {
        const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.title || parsed.ticketTiers?.length)) {
            setHasDraftAvailable(true);
            foundDraft = true;
          }
        }
      } catch {
        // Ignore storage errors
      }

      // Check URL query parameter for onboarding template if no draft is waiting
      if (!foundDraft) {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const tmplKey = urlParams.get("template");
          if (tmplKey && TEMPLATES[tmplKey]) {
            handleApplyTemplate(tmplKey);
          }
        } catch {
          // Ignore
        }
      }

      isInitializedRef.current = true;
    });
  }, [handleApplyTemplate]);

  // Save Draft to LocalStorage whenever critical fields change
  React.useEffect(() => {
    if (!isInitializedRef.current) return;
    if (hasDraftAvailable) return; // P0-1: Prevent overwriting stored draft before user decision
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
        venueHallIds,
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
    hasDraftAvailable,
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
    venueHallIds,
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
      if (d.slug) {
        setSlug(d.slug);
        setIsSlugDirty(true);
      }
      if (d.tagline) setTagline(d.tagline);
      if (d.description) setDescription(d.description);
      if (d.archetype) setArchetype(d.archetype);
      if (d.format) setFormat(d.format);
      if (d.scale) setScale(d.scale);
      if (d.regionId) setRegionId(d.regionId);
      if (d.venueId) setVenueId(d.venueId);
      if (d.venueHallIds && Array.isArray(d.venueHallIds) && d.venueHallIds.length > 0) {
        setVenueHallIds(d.venueHallIds);
        setVenueHallId(d.venueHallIds[0]);
      } else if (d.venueHallId) {
        setVenueHallId(d.venueHallId);
        setVenueHallIds([d.venueHallId]);
      }
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
    setShowDiscardModal(true);
  };

  const handleConfirmDiscardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setHasDraftAvailable(false);
    setShowDiscardModal(false);
  };

  // Update Archetype default colors when archetype changes
  const handleArchetypeSelect = (arch: MiceArchetype) => {
    setArchetype(arch);
    const defaults = getArchetypeTokens(arch);
    setPrimaryColor(defaults.primary);
    setAccentColor(defaults.accent);
  };

  // Auto-slug generator (respects custom manually edited slugs)
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugDirty) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  // Filtered Venues by Region
  const filteredVenues = React.useMemo(() => {
    return venuesList.filter((v) => !v.regionId || v.regionId.toLowerCase() === regionId.toLowerCase());
  }, [venuesList, regionId]);

  // Selected Venue & Halls (Supports multi-hall campus bookings)
  const selectedVenue = React.useMemo(() => {
    return venuesList.find((v) => v.id === venueId);
  }, [venuesList, venueId]);

  const selectedHalls = React.useMemo(() => {
    if (!selectedVenue?.halls) return [];
    const activeIds = venueHallIds.length > 0 ? venueHallIds : (venueHallId ? [venueHallId] : []);
    return selectedVenue.halls.filter((h) => activeIds.includes(h.id));
  }, [selectedVenue, venueHallIds, venueHallId]);

  const selectedHall = React.useMemo(() => {
    return selectedHalls[0] || selectedVenue?.halls?.find((h) => h.id === venueHallId);
  }, [selectedHalls, selectedVenue, venueHallId]);

  const totalHallsCapacity = React.useMemo(() => {
    return selectedHalls.reduce((sum, h) => sum + (h.capacity || 0), 0);
  }, [selectedHalls]);

  const totalTicketCapacity = React.useMemo(() => {
    return ticketTiers.reduce((sum, t) => sum + (Number(t.capacity) || 0), 0);
  }, [ticketTiers]);

  const isCapacityExceeded = React.useMemo(() => {
    const effectiveCapacity = totalHallsCapacity > 0 ? totalHallsCapacity : (selectedHall?.capacity || 0);
    return effectiveCapacity > 0 ? totalTicketCapacity > effectiveCapacity : false;
  }, [totalHallsCapacity, selectedHall, totalTicketCapacity]);

  const handleRegionChange = (newReg: string) => {
    setRegionId(newReg);
    clearFieldError("venueId");
    const matching = venuesList.filter((v) => !v.regionId || v.regionId.toLowerCase() === newReg.toLowerCase());
    if (matching.length > 0) {
      setVenueId(matching[0].id);
      const initialHalls = matching[0].halls?.[0]?.id ? [matching[0].halls[0].id] : [];
      setVenueHallIds(initialHalls);
      setVenueHallId(initialHalls[0] || "");
    } else {
      setVenueId("");
      setVenueHallIds([]);
      setVenueHallId("");
    }

    // Adapt ticket tier currencies dynamically to match selected country edition
    const targetCurrency = newReg === "jp" ? "JPY" : newReg === "global" ? "USD" : "IDR";
    setTicketTiers((prev) =>
      prev.map((t) => {
        if (t.currency === targetCurrency) return t;
        let newPrice = t.price;
        if (t.price > 0) {
          if (targetCurrency === "JPY") {
            newPrice = 10000;
          } else if (targetCurrency === "USD") {
            newPrice = 99;
          } else {
            newPrice = 750000;
          }
        }
        return { ...t, currency: targetCurrency, price: newPrice };
      })
    );
  };

  const handleToggleHall = (hallId: string) => {
    let nextIds: string[];
    if (venueHallIds.includes(hallId)) {
      if (venueHallIds.length === 1) return; // Maintain at least one allocated hall
      nextIds = venueHallIds.filter((id) => id !== hallId);
    } else {
      nextIds = [...venueHallIds, hallId];
    }
    setVenueHallIds(nextIds);
    setVenueHallId(nextIds[0] || "");
  };

  const handleSelectAllHalls = () => {
    if (!selectedVenue?.halls) return;
    const allIds = selectedVenue.halls.map((h) => h.id);
    setVenueHallIds(allIds);
    setVenueHallId(allIds[0] || "");
  };

  // Add/Remove Tiers
  const handleAddTier = () => {
    const newTier: TicketTierDraft = {
      id: `tier-${Date.now()}`,
      name: `Exhibitor & Delegate Pass ${ticketTiers.length + 1}`,
      price: regionId === "jp" ? 10000 : regionId === "global" ? 75 : 1000000,
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

  const handleUpdateTier = <K extends keyof TicketTierDraft>(id: string, field: K, val: TicketTierDraft[K]) => {
    setTicketTiers(
      ticketTiers.map((t) => (t.id === id ? { ...t, [field]: val } : t))
    );
  };

  // Calculate event duration in days
  const eventDurationDays = React.useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  // Validation before advancing
  const validateStep = (step: number): boolean => {
    setErrorMessage("");
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!title.trim()) {
        errors.title = "Please enter an event title.";
      }
      if (!slug.trim()) {
        errors.slug = "Please enter a valid URL slug.";
      }
      if (!description.trim()) {
        errors.description = "Please provide an event description.";
      }
    } else if (step === 2) {
      if (!venueId) {
        errors.venueId = "Please select a hosting venue.";
      }
      if (!startDate) {
        errors.startDate = "Please specify an opening date.";
      }
      if (!endDate) {
        errors.endDate = "Please specify a closing date.";
      }
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          errors.startDate = "Please specify valid start and end dates.";
        } else if (end < start) {
          errors.endDate = "Closing date cannot be prior to opening date.";
        }
      }
    } else if (step === 3) {
      if (ticketTiers.length === 0) {
        errors.tiers = "Please configure at least one ticket pass tier.";
      }
      for (const t of ticketTiers) {
        if (!t.name.trim()) {
          errors[`tier_name_${t.id}`] = "All ticket tiers must have a descriptive title.";
        }
        if (!t.capacity || isNaN(Number(t.capacity)) || Number(t.capacity) <= 0) {
          errors[`tier_capacity_${t.id}`] = "Ticket tier capacities must be a positive integer.";
        }
        if (isNaN(Number(t.price)) || Number(t.price) < 0) {
          errors[`tier_price_${t.id}`] = "Ticket tier price cannot be negative.";
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstError = Object.values(errors)[0];
      setErrorMessage(firstError);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return false;
    }

    setFieldErrors({});
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setFieldErrors({});
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setErrorMessage("");
    setFieldErrors({});
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
      venueHallId: venueHallIds[0] || venueHallId,
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
            <h1 className="text-xl font-bold text-foreground">
              {tOrg("wizardTitle") || "Create & Launch MICE Exhibition"}
            </h1>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {tOrg("wizardRbacBlocked") || "Attendee accounts are restricted from launching events. Please switch to an Organizer or Admin role to proceed."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-border">
            <Button
              variant="primary"
              onClick={() => switchRole("ORGANIZER")}
              className="w-full sm:w-auto gap-2 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer min-h-[44px]"
            >
              <UserCheck className="h-4 w-4" />
              <span>{tOrg("switchToOrganizer") || "Switch to Organizer Persona"}</span>
            </Button>
            <Link
              href={`/${locale}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full sm:w-auto cursor-pointer min-h-[44px] flex items-center justify-center"
              )}
            >
              {tCom("backToHome") || "Back to Discovery"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active cluster archetypes filter
  const displayedArchetypes = React.useMemo(() => {
    if (selectedCluster === "ALL") return ARCHETYPE_LIST;
    const cluster = MICE_INDUSTRY_CLUSTERS.find((c) => c.id === selectedCluster);
    return cluster ? cluster.archetypes : ARCHETYPE_LIST;
  }, [selectedCluster]);

  const WIZARD_STEPS = [
    { step: 1, label: tOrg("wizardStep1") || "Identity & Archetype", sub: "22 MICE Categories", icon: Info },
    { step: 2, label: tOrg("wizardStep2") || "Venue & Dates", sub: "Hall Allocation", icon: Building2 },
    { step: 3, label: tOrg("wizardStep3") || "Pass Tiers", sub: "Capacities & Perks", icon: Ticket },
    { step: 4, label: tOrg("wizardStep4") || "Branding & Launch", sub: "Live Simulation", icon: Palette },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Wizard Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" size="sm" className="font-semibold text-primary border-primary/30 bg-primary/5">
              {tOrg("wizardStepOf", { current: currentStep, total: 4 }) || `Step ${currentStep} of 4`}
            </Badge>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {tOrg("wizardHeader") || "Event Launch Pipeline"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {tOrg("wizardTitle") || "Create & Launch MICE Exhibition"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {tOrg("wizardSubtitle") || "Configure 22 specialized event categories, hall allocation quotas, ticketing tiers, and live branding."}
          </p>
        </div>

        {/* Step Counter Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-border/60 text-xs">
          <span className="text-muted-foreground font-medium">Progress:</span>
          <span className="font-bold text-foreground">{Math.round((currentStep / 4) * 100)}% Completed</span>
        </div>
      </div>

      {/* DRAFT RESTORATION ALERT */}
      {hasDraftAvailable && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in shadow-xs">
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
              className="min-h-[44px] px-4 text-xs gap-1.5 cursor-pointer font-semibold"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Resume Draft</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDiscardDraft}
              className="min-h-[44px] px-3.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Discard
            </Button>
          </div>
        </div>
      )}

      {/* DISCARD DRAFT CONFIRMATION MODAL */}
      <Modal
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        title="Discard Unsaved Event Draft?"
        size="md"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to discard your stored event draft? All previously configured title, venue, hall allocation quotas, and ticket tiers will be permanently removed. This action cannot be reversed.
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDiscardModal(false)}
              className="min-h-[44px] px-4 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDiscardDraft}
              className="min-h-[44px] px-4 text-xs font-semibold cursor-pointer gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Discard Draft</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* STEP PROGRESS TRACKER BAR */}
      <nav aria-label="Wizard Steps" className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 border-b border-border/80 pb-5">
        {WIZARD_STEPS.map((s) => {
          const isCompleted = currentStep > s.step;
          const isCurrent = currentStep === s.step;
          const canClick = s.step < currentStep;
          const StepIcon = s.icon;

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
              aria-label={`Step ${s.step}: ${s.label}`}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "min-h-[52px] p-3 rounded-xl border text-left transition-all flex items-center gap-3 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                canClick ? "cursor-pointer hover:bg-muted/50 hover:border-primary/40" : "cursor-default",
                isCurrent
                  ? "bg-primary/10 border-primary text-primary font-bold shadow-xs ring-1 ring-primary/30"
                  : isCompleted
                  ? "bg-card border-border/80 text-foreground font-semibold"
                  : "bg-muted/20 border-border/40 text-muted-foreground opacity-75"
              )}
            >
              <span
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs shrink-0 font-bold transition-all",
                  isCurrent
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : isCompleted
                    ? "bg-emerald-600 text-white"
                    : "bg-muted text-muted-foreground border border-border"
                )}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : s.step}
              </span>
              <div className="min-w-0">
                <span className="block text-xs font-bold truncate leading-tight">{s.label}</span>
                <span className="hidden sm:block text-[11px] text-muted-foreground font-normal truncate mt-0.5">{s.sub}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center gap-3 text-xs text-destructive animate-fade-in shadow-xs"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: General Info & 22 Category Archetypes */}
      {currentStep === 1 && (
        <div className="space-y-8">
          {/* Fast-Track Templates Onboarding Bar */}
          <div className="p-4 sm:p-5 bg-primary/5 border border-primary/20 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-foreground">
                  Fast-Track Onboarding: Launch with a Specialized Exhibition Template
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                Auto-configures metadata, archetype tokens, and sample passes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {Object.values(TEMPLATES).map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl.id)}
                  className="min-h-[44px] p-3.5 rounded-xl border border-border/80 bg-background hover:border-primary/60 hover:bg-primary/5 text-left transition-all cursor-pointer group shadow-xs hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {tmpl.label}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {tmpl.tagline}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Event Details Card */}
          <Card className="p-6 border-border bg-card space-y-5 shadow-sm">
            <div className="border-b border-border/60 pb-3">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <span>{tOrg("wizardDetailsTitle") || "Primary Event Identity"}</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Define the public exhibition title, customized URL path, and executive overview.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                id="wizard-event-title"
                label={tOrg("wizardEventTitle") || "Exhibition Title"}
                placeholder="e.g. Indonesia Green Energy & Battery Expo 2027"
                value={title}
                onChange={(e) => {
                  handleTitleChange(e.target.value);
                  clearFieldError("title");
                }}
                error={fieldErrors.title}
                aria-invalid={!!fieldErrors.title}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Input
                    id="wizard-slug"
                    label={tOrg("wizardSlug") || "URL Slug Identifier"}
                    placeholder="event-slug-identifier"
                    value={slug}
                    onChange={(e) => {
                      setIsSlugDirty(true);
                      setSlug(e.target.value);
                      clearFieldError("slug");
                    }}
                    error={fieldErrors.slug}
                    aria-invalid={!!fieldErrors.slug}
                    helperText={tOrg("wizardSlugHelper") || "Unique public URL path for attendee exploration."}
                    required
                  />
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono bg-muted/50 px-2.5 py-1 rounded-md border border-border/40">
                    <Globe className="h-3 w-3 shrink-0" />
                    <span className="truncate">/{locale}/events/{slug || "slug"}</span>
                  </div>
                </div>

                <Input
                  id="wizard-tagline"
                  label={tOrg("wizardTagline") || "Hero Tagline / Subtitle"}
                  placeholder={tOrg("wizardTaglinePlaceholder") || "Short tagline summary"}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="wizard-description" className="block text-xs font-semibold text-foreground mb-1.5">
                  {tOrg("wizardDescription") || "Executive Exhibition Overview"}
                </label>
                <textarea
                  id="wizard-description"
                  rows={3}
                  className={cn(
                    "w-full rounded-md border bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors",
                    fieldErrors.description
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-input"
                  )}
                  aria-invalid={!!fieldErrors.description}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    clearFieldError("description");
                  }}
                  placeholder={tOrg("wizardDescPlaceholder") || "Provide comprehensive details about the scheduled convention..."}
                />
                {fieldErrors.description && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50">
                <div>
                  <label htmlFor="wizard-format-select" className="block text-xs font-semibold text-foreground mb-1.5">
                    {tOrg("wizardFormat") || "Event Delivery Format"}
                  </label>
                  <select
                    id="wizard-format-select"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <option value="IN_PERSON">{tOrg("wizardFormatInPerson") || "In-Person Physical Exhibition"}</option>
                    <option value="HYBRID">{tOrg("wizardFormatHybrid") || "Hybrid (In-Person + Digital Livestreams)"}</option>
                    <option value="VIRTUAL">{tOrg("wizardFormatVirtual") || "Virtual Trade Showcase"}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="wizard-scale-select" className="block text-xs font-semibold text-foreground mb-1.5">
                    {tOrg("wizardScale") || "Anticipated Attendance Scale"}
                  </label>
                  <select
                    id="wizard-scale-select"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={scale}
                    onChange={(e) => setScale(e.target.value)}
                  >
                    <option value="GLOBAL_MEGA">{tOrg("wizardScaleGlobalMega") || "Global Mega Exposition (20,000+ Attendees)"}</option>
                    <option value="LARGE">{tOrg("wizardScaleLarge") || "Large Convention (5,000 - 20,000 Attendees)"}</option>
                    <option value="MEDIUM">{tOrg("wizardScaleMedium") || "Medium Industry Summit (1,000 - 5,000 Attendees)"}</option>
                    <option value="EXECUTIVE">{tOrg("wizardScaleExecutive") || "Executive / VIP Symposium (< 1,000 Attendees)"}</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* 22 Specialized Archetype Categories Matrix */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border/80 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>{tOrg("wizardArchetypeSelect") || "Select MICE Category Archetype (22 Verticals)"}</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tOrg("wizardArchetypeSubtitle") || "Each archetype automatically configures design tokens, specialized widgets, and category branding."}
                </p>
              </div>

              <span className="text-xs font-semibold text-primary">
                Selected: {ARCHETYPE_DEFAULTS[archetype]?.name || archetype}
              </span>
            </div>

            {/* Archetype Domain Cluster Filter Tabs */}
            <div
              role="tablist"
              aria-label="Filter category archetypes by industry cluster"
              className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-0.5"
            >
              {CLUSTER_FILTERS.map((cluster) => {
                const isSelected = selectedCluster === cluster.id;
                return (
                  <button
                    key={cluster.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setSelectedCluster(cluster.id)}
                    className={cn(
                      "inline-flex items-center shrink-0 min-h-[44px] px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <span>{cluster.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 22 Cards Grid */}
            <div
              role="radiogroup"
              aria-label="Select MICE Category Archetype"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-1"
            >
              {displayedArchetypes.map((arch) => {
                const meta = ARCHETYPE_METAS[arch] || ARCHETYPE_METADATA[arch];
                const tokens = ARCHETYPE_DEFAULTS[arch];
                const isSelected = archetype === arch;
                const IconComponent = meta?.accentIcon ? ICON_MAP[meta.accentIcon] || Layers : Layers;

                const displayName = tArch(`${arch}.title`) || tokens?.name || arch;
                const subtitle = ARCHETYPE_SUBTITLES[arch] || meta?.tagline || tokens?.tagline;

                return (
                  <button
                    key={arch}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => handleArchetypeSelect(arch)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleArchetypeSelect(arch);
                      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                        e.preventDefault();
                        const currentIndex = displayedArchetypes.indexOf(arch);
                        const nextArch = displayedArchetypes[(currentIndex + 1) % displayedArchetypes.length];
                        handleArchetypeSelect(nextArch);
                      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                        e.preventDefault();
                        const currentIndex = displayedArchetypes.indexOf(arch);
                        const prevArch = displayedArchetypes[(currentIndex - 1 + displayedArchetypes.length) % displayedArchetypes.length];
                        handleArchetypeSelect(prevArch);
                      }
                    }}
                    className={cn(
                      "p-3.5 sm:p-4 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-3 min-h-[130px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none shadow-xs hover:shadow-sm",
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-sm"
                        : "border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30"
                    )}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0 transition-transform duration-200"
                          style={{
                            backgroundColor: `${tokens.primary}18`,
                            color: tokens.primary,
                            border: `1px solid ${tokens.primary}30`,
                          }}
                        >
                          <IconComponent className="h-4 w-4 stroke-[2.2]" />
                        </div>

                        {isSelected ? (
                          <Badge variant="default" size="sm" className="font-semibold text-[11px]">
                            {tCom("selected") || "Selected"}
                          </Badge>
                        ) : (
                          <span
                            aria-hidden="true"
                            className="h-3 w-3 rounded-full border border-border/80 inline-block shrink-0 mt-1"
                            style={{ backgroundColor: tokens.primary }}
                          />
                        )}
                      </div>

                      <span className="block text-xs sm:text-sm font-bold text-foreground leading-snug line-clamp-1">
                        {displayName}
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground w-full">
                      <span className="flex items-center gap-1.5">
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: tokens.accent }}
                        />
                        <span className="truncate">{tokens.badgeStyle}</span>
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground/80">{tokens.primary}</span>
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
          <Card className="p-6 border-border bg-card space-y-6 shadow-sm">
            <div className="border-b border-border/60 pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span>{tOrg("wizardVenueHalls") || "Hosting Venue & Hall Allocation"}</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select target country edition, flagship convention center, hall assignments, and operational dates.
              </p>
            </div>

            {/* Country Edition Region Selection Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Target Regional Country Edition:
              </label>
              <div
                role="radiogroup"
                aria-label="Select Target Country Region Hub"
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                {[
                  {
                    id: "id",
                    code: "IDR (Rp)",
                    name: `${tReg("id.name")} (${tReg("id.code")})`,
                    desc: "JIExpo, ICE BSD, JCC, NICE PIK 2",
                    currency: "Indonesian Rupiah",
                  },
                  {
                    id: "jp",
                    code: "JPY (¥)",
                    name: `${tReg("jp.name")} (${tReg("jp.code")})`,
                    desc: "Tokyo Big Sight, Makuhari Messe, Pacifico",
                    currency: "Japanese Yen",
                  },
                  {
                    id: "global",
                    code: "USD ($)",
                    name: `${tReg("global.name")} (${tReg("global.code")})`,
                    desc: "Marina Bay Sands, Messe Frankfurt, ExCeL",
                    currency: "US Dollar",
                  },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={regionId === r.id}
                    tabIndex={regionId === r.id ? 0 : -1}
                    onClick={() => handleRegionChange(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleRegionChange(r.id);
                      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                        e.preventDefault();
                        const regions = ["id", "jp", "global"];
                        const currentIndex = regions.indexOf(r.id);
                        const nextReg = regions[(currentIndex + 1) % regions.length];
                        handleRegionChange(nextReg);
                      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                        e.preventDefault();
                        const regions = ["id", "jp", "global"];
                        const currentIndex = regions.indexOf(r.id);
                        const prevReg = regions[(currentIndex - 1 + regions.length) % regions.length];
                        handleRegionChange(prevReg);
                      }
                    }}
                    className={cn(
                      "p-4 rounded-xl border text-left cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none min-h-[88px] flex flex-col justify-between shadow-xs",
                      regionId === r.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-sm"
                        : "border-border/80 hover:border-primary/50 bg-card"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-foreground block">{r.name}</span>
                      <Badge variant={regionId === r.id ? "default" : "outline"} size="sm" className="font-mono text-[11px]">
                        {r.code}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 line-clamp-1 block">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Venue and Hall Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/50">
              <div>
                <label htmlFor="wizard-venue-select" className="block text-xs font-semibold text-foreground mb-1.5">
                  {tOrg("wizardSelectVenue") || "Select Flagship Convention Center"}
                </label>
                <select
                  id="wizard-venue-select"
                  className={cn(
                    "w-full h-11 rounded-md border bg-background px-3 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors",
                    fieldErrors.venueId ? "border-destructive focus-visible:ring-destructive" : "border-input"
                  )}
                  aria-invalid={!!fieldErrors.venueId}
                  value={venueId}
                  onChange={(e) => {
                    setVenueId(e.target.value);
                    clearFieldError("venueId");
                    const v = venuesList.find((ven) => ven.id === e.target.value);
                    const initialHalls = v?.halls?.[0]?.id ? [v.halls[0].id] : [];
                    setVenueHallIds(initialHalls);
                    setVenueHallId(initialHalls[0] || "");
                  }}
                >
                  {filteredVenues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.city})
                    </option>
                  ))}
                </select>
                {fieldErrors.venueId && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.venueId}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="wizard-hall-select" className="block text-xs font-semibold text-foreground">
                    {tOrg("wizardSelectHall") || "Primary Exhibition Hall"}
                  </label>
                  {selectedVenue?.halls && selectedVenue.halls.length > 1 && (
                    <button
                      type="button"
                      onClick={handleSelectAllHalls}
                      className="min-h-[44px] inline-flex items-center text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      {venueHallIds.length === selectedVenue.halls.length
                        ? "All Halls Allocated"
                        : "Allocate All Campus Halls"}
                    </button>
                  )}
                </div>
                <select
                  id="wizard-hall-select"
                  className="w-full h-11 rounded-md border border-input bg-background px-3 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={venueHallId}
                  onChange={(e) => {
                    const chosen = e.target.value;
                    setVenueHallId(chosen);
                    if (chosen && !venueHallIds.includes(chosen)) {
                      setVenueHallIds([chosen, ...venueHallIds]);
                    }
                  }}
                >
                  {selectedVenue?.halls?.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} {h.capacity ? `(Capacity: ${h.capacity.toLocaleString()} Attendees)` : ""}
                    </option>
                  )) || <option value="">Main Complex Pavilion</option>}
                </select>
              </div>
            </div>

            {/* Multi-Hall Selection Grid for Multi-Hall Campus Bookings */}
            {selectedVenue?.halls && selectedVenue.halls.length > 1 && (
              <div className="pt-2 border-t border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Campus Hall Allocation (Multi-Hall Booking):
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Select all wings reserved for this exhibition
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {selectedVenue.halls.map((h) => {
                    const isAllocated = venueHallIds.includes(h.id) || h.id === venueHallId;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        role="checkbox"
                        aria-checked={isAllocated}
                        onClick={() => handleToggleHall(h.id)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 min-h-[44px]",
                          isAllocated
                            ? "border-primary bg-primary/5 text-foreground shadow-xs ring-1 ring-primary/30"
                            : "border-border/70 hover:border-border text-muted-foreground hover:text-foreground bg-card"
                        )}
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <div
                            className={cn(
                              "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                              isAllocated
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground/40 bg-background"
                            )}
                          >
                            {isAllocated && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-semibold truncate">{h.name}</span>
                        </div>
                        <span className="text-[11px] font-mono tabular-nums shrink-0 text-muted-foreground">
                          {h.capacity ? `${h.capacity.toLocaleString()} cap` : "Flexible"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
                  <span className="text-muted-foreground">
                    Combined Campus Allocation: <strong className="text-foreground">{selectedHalls.length} {selectedHalls.length === 1 ? "Hall" : "Halls"}</strong> ({selectedHalls.map((h) => h.name).join(", ")})
                  </span>
                  <Badge variant="outline" size="sm" className="font-mono text-xs font-bold shrink-0">
                    {totalHallsCapacity.toLocaleString()} Combined Slots
                  </Badge>
                </div>
              </div>
            )}

            {/* Operational Date Window */}
            <div className="pt-2 border-t border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Convention Operating Window:
                </label>
                {eventDurationDays !== null && (
                  <Badge variant="outline" size="sm" className="font-semibold text-primary border-primary/30 bg-primary/5">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{eventDurationDays} Days Physical Exhibition</span>
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="wizard-start-date"
                  label={tOrg("wizardStartDate") || "Opening Date"}
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    clearFieldError("startDate");
                  }}
                  error={fieldErrors.startDate}
                  aria-invalid={!!fieldErrors.startDate}
                  required
                />
                <Input
                  id="wizard-end-date"
                  label={tOrg("wizardEndDate") || "Closing Date"}
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    clearFieldError("endDate");
                  }}
                  error={fieldErrors.endDate}
                  aria-invalid={!!fieldErrors.endDate}
                  required
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* STEP 3: Ticket Tiers & Capacity Allocation */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Ticket className="h-4 w-4 text-primary" />
                <span>{tOrg("wizardTiersTitle") || "Ticket Pass Tiers & Capacities"}</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tOrg("wizardTiersSubtitle") || "Define pass pricing tiers, capacities, and perks unlocked upon QR turnstile validation."}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddTier}
              className="min-h-[44px] px-4 text-xs font-semibold gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{tOrg("wizardAddTier") || "Add Ticket Pass Tier"}</span>
            </Button>
          </div>

          {/* Quick Add Pass Presets Bar */}
          <div className="p-3.5 bg-muted/40 border border-border/70 rounded-xl flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5 mr-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Pass Presets:</span>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const freeTier: TicketTierDraft = {
                  id: `tier-${Date.now()}`,
                  name: "Complimentary Trade Visitor Pass",
                  price: 0,
                  currency: regionId === "jp" ? "JPY" : regionId === "global" ? "USD" : "IDR",
                  capacity: 2500,
                  benefits: "General Floor Access, Digital Guidebook, Open Keynotes",
                };
                setTicketTiers([...ticketTiers, freeTier]);
              }}
              className="text-xs min-h-[44px] sm:min-h-[36px] px-3.5 cursor-pointer bg-background"
            >
              + Free Trade Pass
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const vipTier: TicketTierDraft = {
                  id: `tier-${Date.now()}`,
                  name: "VIP Procurement Delegate Pass",
                  price: regionId === "jp" ? 25000 : regionId === "global" ? 200 : 1500000,
                  currency: regionId === "jp" ? "JPY" : regionId === "global" ? "USD" : "IDR",
                  capacity: 250,
                  benefits: "Fast-Track Gate, VIP Lounge, B2B Matchmaking, Gala Dinner",
                };
                setTicketTiers([...ticketTiers, vipTier]);
              }}
              className="text-xs min-h-[44px] sm:min-h-[36px] px-3.5 cursor-pointer bg-background"
            >
              + VIP Buyer Pass
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const allAccessTier: TicketTierDraft = {
                  id: `tier-${Date.now()}`,
                  name: "All-Access Speaker & Sponsor Pass",
                  price: regionId === "jp" ? 45000 : regionId === "global" ? 400 : 3000000,
                  currency: regionId === "jp" ? "JPY" : regionId === "global" ? "USD" : "IDR",
                  capacity: 100,
                  benefits: "Backstage Access, Speaker Lounge, Keynote Slides, VIP Parking",
                };
                setTicketTiers([...ticketTiers, allAccessTier]);
              }}
              className="text-xs min-h-[44px] sm:min-h-[36px] px-3.5 cursor-pointer bg-background"
            >
              + All-Access Pass
            </Button>
          </div>

          {/* Physical Hall Capacity Safeguard Widget */}
          {selectedHalls.length > 0 && (
            <Card className="p-5 border-border bg-card shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Building2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">
                    Physical Hall Allocation: {selectedHalls.map((h) => h.name).join(", ")}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-muted-foreground font-medium">
                    Allocated: {totalTicketCapacity.toLocaleString()} / {(totalHallsCapacity || 0).toLocaleString()} slots
                  </span>
                  <Badge
                    variant={isCapacityExceeded ? "destructive" : "outline"}
                    size="sm"
                    className="font-mono text-xs font-bold"
                  >
                    {totalHallsCapacity ? Math.round((totalTicketCapacity / totalHallsCapacity) * 100) : 0}% Allocated
                  </Badge>
                </div>
              </div>

              {/* Allocation Progress Bar */}
              <div
                role="progressbar"
                aria-label="Hall Capacity Allocation"
                aria-valuenow={totalTicketCapacity}
                aria-valuemin={0}
                aria-valuemax={totalHallsCapacity || 100}
                aria-valuetext={`${totalHallsCapacity ? Math.round((totalTicketCapacity / totalHallsCapacity) * 100) : 0}% (${totalTicketCapacity} of ${totalHallsCapacity} allocated seats across ${selectedHalls.length} halls)`}
                className="h-2.5 w-full bg-muted rounded-full overflow-hidden"
              >
                <div
                  className={cn(
                    "h-full transition-all duration-300 rounded-full",
                    isCapacityExceeded ? "bg-destructive" : "bg-primary"
                  )}
                  style={{
                    width: `${Math.min(
                      totalHallsCapacity ? (totalTicketCapacity / totalHallsCapacity) * 100 : 0,
                      100
                    )}%`,
                  }}
                />
              </div>

              {isCapacityExceeded && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-400 animate-fade-in">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Capacity Alert:</strong> Total ticket pass allocation ({totalTicketCapacity.toLocaleString()}) exceeds the combined physical limit of {selectedHalls.map((h) => h.name).join(", ")} ({(totalHallsCapacity || 0).toLocaleString()}). Consider allocating additional halls in Step 2 or adjusting pass capacities.
                  </span>
                </div>
              )}
            </Card>
          )}

          {/* Ticket Pass Cards */}
          {fieldErrors.tiers && (
            <div role="alert" className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-xs text-destructive font-semibold">
              {fieldErrors.tiers}
            </div>
          )}

          <div aria-live="polite" className="space-y-4">
            {ticketTiers.map((tier, idx) => (
              <Card key={tier.id} className="p-5 border-border bg-card space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" size="sm" className="font-bold">
                      {tOrg("wizardTierBadge", { num: idx + 1 }) || `Tier #${idx + 1}`}
                    </Badge>
                    <span className="text-xs font-semibold text-foreground">
                      {tier.name || "Untitled Tier"}
                    </span>
                  </div>
                  {ticketTiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(tier.id)}
                      className="min-h-[44px] px-3 text-xs text-destructive hover:text-destructive/80 flex items-center gap-1 cursor-pointer font-semibold"
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
                      placeholder="e.g. Standard Trade Visitor Pass"
                      value={tier.name}
                      onChange={(e) => {
                        handleUpdateTier(tier.id, "name", e.target.value);
                        clearFieldError(`tier_name_${tier.id}`);
                      }}
                      error={fieldErrors[`tier_name_${tier.id}`]}
                      aria-invalid={!!fieldErrors[`tier_name_${tier.id}`]}
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
                      onChange={(e) => {
                        handleUpdateTier(tier.id, "capacity", Number(e.target.value));
                        clearFieldError(`tier_capacity_${tier.id}`);
                      }}
                      error={fieldErrors[`tier_capacity_${tier.id}`]}
                      aria-invalid={!!fieldErrors[`tier_capacity_${tier.id}`]}
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
                      onChange={(e) => {
                        handleUpdateTier(tier.id, "price", Number(e.target.value));
                        clearFieldError(`tier_price_${tier.id}`);
                      }}
                      error={fieldErrors[`tier_price_${tier.id}`]}
                      aria-invalid={!!fieldErrors[`tier_price_${tier.id}`]}
                    />
                  </div>
                  <div>
                    <label htmlFor={`wizard-tier-currency-${idx}`} className="block text-xs font-semibold text-foreground mb-1.5">
                      {tOrg("wizardTierCurrency") || "Currency"}
                    </label>
                    <select
                      id={`wizard-tier-currency-${idx}`}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                      placeholder="Floor Access, VIP Lounge, Gala Dinner"
                      value={tier.benefits}
                      onChange={(e) => handleUpdateTier(tier.id, "benefits", e.target.value)}
                    />
                  </div>
                </div>

                {/* Benefits Chips Preview */}
                {tier.benefits && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-muted-foreground mr-1">Perks:</span>
                    {tier.benefits.split(",").map((b, bIdx) => {
                      const clean = b.trim();
                      if (!clean) return null;
                      return (
                        <span key={bIdx} className="px-2 py-0.5 rounded-md text-[11px] bg-muted/60 border border-border/50 text-foreground font-medium">
                          {clean}
                        </span>
                      );
                    })}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: Branding & Live Simulation Review */}
      {currentStep === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Branding Controls and Specification Summary */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 border-border bg-card space-y-5 shadow-sm">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <span>{tOrg("wizardBrandingTitle") || "Visual Branding & Palette"}</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select color accents and hero imagery to personalize your event landing page.
                </p>
              </div>

              {/* Colorway Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Quick Palette Swatches:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BRANDING_PALETTES.map((pal) => (
                    <button
                      key={pal.label}
                      type="button"
                      onClick={() => {
                        setPrimaryColor(pal.primary);
                        setAccentColor(pal.accent);
                      }}
                      className={cn(
                        "min-h-[44px] p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center gap-2 hover:border-primary/60",
                        primaryColor === pal.primary
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border/80 bg-background"
                      )}
                    >
                      <div className="flex -space-x-1 shrink-0">
                        <span className="h-4 w-4 rounded-full border border-background shrink-0" style={{ backgroundColor: pal.primary }} />
                        <span className="h-4 w-4 rounded-full border border-background shrink-0" style={{ backgroundColor: pal.accent }} />
                      </div>
                      <span className="truncate text-[11px] font-medium text-foreground">{pal.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50">
                <div>
                  <label htmlFor="wizard-primary-color" className="block text-xs font-semibold text-foreground mb-1.5">
                    {tOrg("wizardPrimaryColor") || "Primary Brand Color"}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="wizard-primary-color"
                      type="color"
                      className="h-11 w-12 rounded-lg cursor-pointer border border-border shrink-0"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                    />
                    <Input
                      id="wizard-primary-color-text"
                      aria-label="Primary accent color hex code"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="font-mono min-h-[44px]"
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
                      className="h-11 w-12 rounded-lg cursor-pointer border border-border shrink-0"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                    />
                    <Input
                      id="wizard-accent-color-text"
                      aria-label="Secondary accent color hex code"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="font-mono min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              <Input
                id="wizard-hero-image"
                label={tOrg("wizardHeroImage") || "Hero Banner Image URL"}
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                className="min-h-[44px]"
              />
            </Card>

            {/* Launch Readiness Summary Card */}
            <Card className="p-6 border-border bg-card space-y-4 shadow-sm">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{tOrg("wizardSummaryTitle") || "Pre-Flight Launch Verification"}</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Confirm all operational parameters before publishing to the digital ecosystem.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-muted/40">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Exhibition Title:</span>
                    <span className="font-bold text-foreground text-sm">{title}</span>
                  </div>
                  <Badge variant="secondary" size="sm" className="font-semibold shrink-0">
                    {ARCHETYPE_DEFAULTS[archetype]?.displayName || archetype}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/30">
                    <span className="text-muted-foreground block text-[11px]">Venue & Hall:</span>
                    <span className="font-semibold text-foreground truncate block">
                      {selectedVenue?.name || "Selected Venue"}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate block">
                      {selectedHall?.name || "Main Complex"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/30">
                    <span className="text-muted-foreground block text-[11px]">Operating Dates:</span>
                    <span className="font-semibold text-foreground block">
                      {startDate} to {endDate}
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      {eventDurationDays ? `${eventDurationDays} Days Window` : "Single Day"}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-muted/30">
                  <span className="text-muted-foreground block text-[11px] mb-1">
                    Pass Tiers ({ticketTiers.length} configured):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ticketTiers.map((t) => (
                      <span key={t.id} className="px-2 py-0.5 rounded-md text-[11px] bg-background border border-border/60 text-foreground font-medium">
                        {t.name}: {t.price === 0 ? "Free" : `${t.currency} ${t.price.toLocaleString()}`} ({t.capacity} slots)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Live Visual Preview Canvas */}
          <div className="lg:col-span-7 lg:sticky lg:top-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Live Multi-Device Visual Simulation</span>
              </h2>
              <Badge variant="outline" size="sm" className="text-xs font-semibold text-primary border-primary/30 bg-primary/5">
                Real-Time Preview
              </Badge>
            </div>
            <LivePreviewFrame
              eventTitle={title || "Untitled Exhibition"}
              tagline={tagline}
              archetype={archetype}
              venueName={selectedVenue?.name}
              hallName={selectedHall?.name}
              datesText={startDate && endDate ? `${startDate} to ${endDate}` : undefined}
              heroImageUrl={heroImageUrl}
              primaryColor={primaryColor}
              accentColor={accentColor}
              fontFamily={ARCHETYPE_DEFAULTS[archetype]?.fontFamily || "font-sans"}
              ticketTiers={ticketTiers}
            />
          </div>
        </div>
      )}

      {/* WIZARD NAVIGATION CONTROLS */}
      <div className="flex items-center justify-between pt-6 border-t border-border/80">
        {currentStep > 1 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={prevStep}
            className="min-h-[44px] px-5 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{tOrg("wizardBack") || "Previous Step"}</span>
          </Button>
        ) : (
          <div />
        )}

        {currentStep < 4 ? (
          <Button
            variant="primary"
            size="sm"
            onClick={nextStep}
            className="min-h-[44px] px-6 text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
          >
            <span>{tOrg("wizardNext") || "Continue to Next Step"}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmitEvent}
            disabled={isSubmitting}
            className="min-h-[44px] px-6 text-xs font-semibold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
          >
            <Sparkles className="h-4 w-4" />
            <span>
              {isSubmitting
                ? (tOrg("wizardCreating") || "Launching Exhibition...")
                : (tOrg("wizardPublishButton") || "Publish & Open Customizer")}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}
