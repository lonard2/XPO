/**
 * XPO 9-Archetype Dynamic MICE Category Theming Engine
 * 
 * Provides color palettes, surface tokens, font pairings, CSS custom property generators,
 * and organizer branding override logic for all 9 MICE category archetypes.
 */

export type MiceArchetype =
  | "INDUSTRIAL_B2B"
  | "TECH_DEV_SUMMIT"
  | "MEDICAL_SYMPOSIUM"
  | "FINANCE_INVESTOR"
  | "POP_CULTURE_GAMING"
  | "MUSIC_FESTIVAL"
  | "MEGA_EXPO_PAVILION"
  | "GOVERNMENT_DIPLOMATIC"
  | "INCENTIVE_RETREAT";

export interface ArchetypeThemeTokens {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  fontFamily: string;
  badgeStyle: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "archetype" | "neutral" | string;
  name?: string;
  displayName: string;
  tagline?: string;
  accentGlow?: string;
}

export interface BrandingConfig {
  primaryColor?: string;
  accentColor?: string;
  heroBadge?: string;
  bannerOverlayOpacity?: number;
  customLogoUrl?: string;
  fontFamilyOverride?: string;
}

export interface ArchetypeMeta {
  id: MiceArchetype;
  label: string;
  description: string;
  industry: string;
  sampleEventTitle: string;
  accentIcon: string;
}

export const ARCHETYPE_DEFAULTS: Record<MiceArchetype, ArchetypeThemeTokens> = {
  INDUSTRIAL_B2B: {
    primary: "#2563eb",
    accent: "#f59e0b",
    background: "#0f172a",
    surface: "#1e293b",
    border: "#334155",
    fontFamily: "font-sans",
    badgeStyle: "neutral",
    name: "Industrial & Manufacturing B2B",
    displayName: "Industrial B2B & Machinery",
    tagline: "Heavy Equipment, RFQ Tenders & High-Precision Machinery",
    accentGlow: "rgba(37, 99, 235, 0.25)",
  },
  TECH_DEV_SUMMIT: {
    primary: "#6366f1",
    accent: "#06b6d4",
    background: "#090d16",
    surface: "#131b2e",
    border: "#1e293b",
    fontFamily: "font-mono",
    badgeStyle: "archetype",
    name: "Technology & Developer Summit",
    displayName: "Tech & Developer Summit",
    tagline: "Multi-Track Tech Keynotes, Code Demos & Hackathons",
    accentGlow: "rgba(99, 102, 241, 0.3)",
  },
  MEDICAL_SYMPOSIUM: {
    primary: "#0d9488",
    accent: "#10b981",
    background: "#f8fafc",
    surface: "#ffffff",
    border: "#e2e8f0",
    fontFamily: "font-serif",
    badgeStyle: "outline",
    name: "Medical & Clinical Symposium",
    displayName: "Medical & Health Symposium",
    tagline: "Peer-Reviewed Clinical Abstracts & CME Accreditation",
    accentGlow: "rgba(13, 148, 136, 0.2)",
  },
  FINANCE_INVESTOR: {
    primary: "#1e3a8a",
    accent: "#d97706",
    background: "#0a0f1d",
    surface: "#111827",
    border: "#1f2937",
    fontFamily: "font-sans",
    badgeStyle: "success",
    name: "Finance, Banking & Investor Summit",
    displayName: "Finance & Investor Summit",
    tagline: "Private Deal Rooms, Pitch Decks & Institutional Capital",
    accentGlow: "rgba(30, 58, 138, 0.35)",
  },
  POP_CULTURE_GAMING: {
    primary: "#9333ea",
    accent: "#ec4899",
    background: "#180828",
    surface: "#2d124d",
    border: "#4c1d95",
    fontFamily: "font-legible",
    badgeStyle: "warning",
    name: "Pop Culture & Gaming Expo",
    displayName: "Pop Culture & Gaming Expo",
    tagline: "Cosplay Contests, Creator Alley & Esports Arenas",
    accentGlow: "rgba(147, 51, 234, 0.35)",
  },
  MUSIC_FESTIVAL: {
    primary: "#e11d48",
    accent: "#8b5cf6",
    background: "#110714",
    surface: "#260c2c",
    border: "#4c1257",
    fontFamily: "font-sans",
    badgeStyle: "archetype",
    name: "Music Festival & Live Entertainment",
    displayName: "Music Festival & Live Entertainment",
    tagline: "Multi-Stage Live Sets, Wristband Access & Crowd Density",
    accentGlow: "rgba(225, 29, 72, 0.35)",
  },
  MEGA_EXPO_PAVILION: {
    primary: "#ea580c",
    accent: "#16a34a",
    background: "#0c121e",
    surface: "#162032",
    border: "#25334c",
    fontFamily: "font-sans",
    badgeStyle: "default",
    name: "Mega Fair & Multi-Pavilion Expo",
    displayName: "Mega Expo & Multi-Pavilion",
    tagline: "Hall Pavilions, Nightly Fireworks & Consumer Promos",
    accentGlow: "rgba(234, 88, 12, 0.3)",
  },
  GOVERNMENT_DIPLOMATIC: {
    primary: "#0f172a",
    accent: "#0284c7",
    background: "#020617",
    surface: "#0f172a",
    border: "#1e293b",
    fontFamily: "font-serif",
    badgeStyle: "neutral",
    name: "Diplomatic & Government Summit",
    displayName: "Government & Diplomatic Summit",
    tagline: "Protocol Briefings, Bilateral Lounges & High Security",
    accentGlow: "rgba(2, 132, 199, 0.25)",
  },
  INCENTIVE_RETREAT: {
    primary: "#059669",
    accent: "#d97706",
    background: "#062016",
    surface: "#0e3828",
    border: "#165940",
    fontFamily: "font-legible",
    badgeStyle: "outline",
    name: "Corporate Incentive & Wellness Retreat",
    displayName: "Incentive & Luxury Retreat",
    tagline: "Curated Excursions, Gala Dinners & Wellness Itineraries",
    accentGlow: "rgba(5, 150, 105, 0.3)",
  },
};

export const ARCHETYPE_LIST: MiceArchetype[] = [
  "INDUSTRIAL_B2B",
  "TECH_DEV_SUMMIT",
  "MEDICAL_SYMPOSIUM",
  "FINANCE_INVESTOR",
  "POP_CULTURE_GAMING",
  "MUSIC_FESTIVAL",
  "MEGA_EXPO_PAVILION",
  "GOVERNMENT_DIPLOMATIC",
  "INCENTIVE_RETREAT",
];

export const ALL_MICE_ARCHETYPES = ARCHETYPE_LIST;

export const ARCHETYPE_METAS: Record<MiceArchetype, ArchetypeMeta> = {
  INDUSTRIAL_B2B: {
    id: "INDUSTRIAL_B2B",
    label: "Industrial B2B",
    description: "For manufacturing expos, heavy equipment showcases, and RFQ procurement trade shows.",
    industry: "Heavy Machinery & Supply Chain",
    sampleEventTitle: "Indonesia Industrial & Automation Expo 2026",
    accentIcon: "Factory",
  },
  TECH_DEV_SUMMIT: {
    id: "TECH_DEV_SUMMIT",
    label: "Tech Dev Summit",
    description: "For developer conferences, AI symposiums, and engineering hackathons.",
    industry: "Software, Cloud & AI",
    sampleEventTitle: "Tokyo AI & Cloud Architecture Summit 2026",
    accentIcon: "Code2",
  },
  MEDICAL_SYMPOSIUM: {
    id: "MEDICAL_SYMPOSIUM",
    label: "Medical Symposium",
    description: "For clinical congresses, healthcare research summits, and CME-accredited workshops.",
    industry: "Healthcare & Pharmaceuticals",
    sampleEventTitle: "Asia-Pacific Cardiology & Clinical Innovation Congress",
    accentIcon: "Stethoscope",
  },
  FINANCE_INVESTOR: {
    id: "FINANCE_INVESTOR",
    label: "Finance & Investor Forum",
    description: "For sovereign wealth forums, private equity deal-making, and FinTech summits.",
    industry: "Banking, VC & Capital Markets",
    sampleEventTitle: "Global FinTech & Private Capital Forum",
    accentIcon: "TrendingUp",
  },
  POP_CULTURE_GAMING: {
    id: "POP_CULTURE_GAMING",
    label: "Pop Culture & Gaming",
    description: "For comic conventions, esports tournaments, creator alleys, and anime expos.",
    industry: "Gaming & Entertainment",
    sampleEventTitle: "Jakarta Comic & Gaming Championship",
    accentIcon: "Gamepad2",
  },
  MUSIC_FESTIVAL: {
    id: "MUSIC_FESTIVAL",
    label: "Music Festival",
    description: "For multi-stage music festivals, live concert series, and cultural performance stages.",
    industry: "Live Arts & Music",
    sampleEventTitle: "Neon Beats International Music Festival",
    accentIcon: "Music2",
  },
  MEGA_EXPO_PAVILION: {
    id: "MEGA_EXPO_PAVILION",
    label: "Mega Expo & Fair",
    description: "For multi-week mega consumer fairs, national trade expos, and carnival pavilions.",
    industry: "Consumer Goods & Trade Fair",
    sampleEventTitle: "Jakarta Fair Kemayoran (Pekan Raya Jakarta)",
    accentIcon: "Store",
  },
  GOVERNMENT_DIPLOMATIC: {
    id: "GOVERNMENT_DIPLOMATIC",
    label: "Diplomatic Summit",
    description: "For bilateral state meetings, ministerial roundtables, and international treaty conferences.",
    industry: "Public Sector & International Relations",
    sampleEventTitle: "Indo-Pacific Clean Energy & Maritime Diplomatic Summit",
    accentIcon: "Building2",
  },
  INCENTIVE_RETREAT: {
    id: "INCENTIVE_RETREAT",
    label: "Incentive Retreat",
    description: "For luxury executive retreats, corporate rewards travel, and wellness incentive trips.",
    industry: "Hospitality & Corporate Rewards",
    sampleEventTitle: "Global Leaders Horizon Retreat Bali",
    accentIcon: "Palmtree",
  },
};

/**
 * Validates whether a string is a recognized MiceArchetype.
 */
export function isValidArchetype(archetype: string): archetype is MiceArchetype {
  return archetype in ARCHETYPE_DEFAULTS;
}

/**
 * Resolves theme tokens for a given archetype, applying any organizer branding overrides.
 */
export function getArchetypeTokens(
  archetype: MiceArchetype | string,
  overrides?: BrandingConfig
): ArchetypeThemeTokens {
  const base = (archetype && isValidArchetype(archetype))
    ? ARCHETYPE_DEFAULTS[archetype]
    : ARCHETYPE_DEFAULTS.INDUSTRIAL_B2B;

  return {
    ...base,
    primary: (overrides?.primaryColor && overrides.primaryColor.trim() !== "") ? overrides.primaryColor : base.primary,
    accent: (overrides?.accentColor && overrides.accentColor.trim() !== "") ? overrides.accentColor : base.accent,
    fontFamily: (overrides?.fontFamilyOverride && overrides.fontFamilyOverride.trim() !== "") ? overrides.fontFamilyOverride : base.fontFamily,
    displayName: base.displayName,
  };
}

/**
 * Generates dynamic CSS variables for HTML inline styling and runtime theme injection.
 */
export function getArchetypeCssVariables(
  archetype: MiceArchetype | string,
  overrides?: BrandingConfig
): Record<string, string> {
  const tokens = getArchetypeTokens(archetype, overrides);
  return {
    "--archetype-primary": tokens.primary,
    "--archetype-accent": tokens.accent,
    "--archetype-bg": tokens.background,
    "--archetype-surface": tokens.surface,
    "--archetype-border": tokens.border,
  };
}

/**
 * Safely parses branding configuration JSON string into a typed object.
 */
export function parseBrandingConfig(jsonString?: string | null): BrandingConfig {
  if (!jsonString) return {};
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as BrandingConfig;
    }
    return {};
  } catch {
    return {};
  }
}
