/**
 * XPO Comprehensive MICE Category Theming Engine
 * 
 * Provides color palettes, surface tokens, font pairings, CSS custom property generators,
 * and organizer branding override logic for 15 specialized MICE event categories.
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
  | "INCENTIVE_RETREAT"
  | "AUTOMOTIVE_MOBILITY"
  | "ENERGY_INFRASTRUCTURE"
  | "AGRITECH_FOOD"
  | "HOSPITALITY_TOURISM"
  | "EDUCATION_EDTECH"
  | "FASHION_RETAIL";

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
  shortName: string;
  description: string;
  tagline: string;
  ctaLabel: string;
  industry: string;
  sampleEventTitle: string;
  accentIcon: string;
  highlights: string[];
  color: string;
  borderColor: string;
  bgGradient: string;
}

export const ARCHETYPE_DEFAULTS: Record<MiceArchetype, ArchetypeThemeTokens> = {
  INDUSTRIAL_B2B: {
    primary: "#2563eb",
    accent: "#f59e0b",
    background: "#0f172a",
    surface: "#1e293b",
    border: "#3b82f6",
    fontFamily: "font-sans",
    badgeStyle: "neutral",
    name: "Industrial & Manufacturing B2B",
    displayName: "Industrial B2B & Machinery",
    tagline: "Heavy Machinery, Precision Tooling & B2B Procurement",
    accentGlow: "rgba(37, 99, 235, 0.25)",
  },
  TECH_DEV_SUMMIT: {
    primary: "#6366f1",
    accent: "#06b6d4",
    background: "#090d16",
    surface: "#131b2e",
    border: "#818cf8",
    fontFamily: "font-mono",
    badgeStyle: "archetype",
    name: "Tech, AI & Developer Summit",
    displayName: "Tech & Developer Summit",
    tagline: "Multi-Track Tech Keynotes, Code Architecture & Hackathons",
    accentGlow: "rgba(99, 102, 241, 0.3)",
  },
  MEDICAL_SYMPOSIUM: {
    primary: "#0d9488",
    accent: "#10b981",
    background: "#f8fafc",
    surface: "#ffffff",
    border: "#2dd4bf",
    fontFamily: "font-serif",
    badgeStyle: "outline",
    name: "Medical & Healthcare Symposium",
    displayName: "Medical & Clinical Symposium",
    tagline: "Peer-Reviewed Research, Clinical Breakouts & CME Accreditation",
    accentGlow: "rgba(13, 148, 136, 0.2)",
  },
  FINANCE_INVESTOR: {
    primary: "#1e3a8a",
    accent: "#10b981",
    background: "#0a0f1d",
    surface: "#111827",
    border: "#10b981",
    fontFamily: "font-sans",
    badgeStyle: "success",
    name: "Finance, FinTech & Investor Forum",
    displayName: "Finance & Investor Forum",
    tagline: "Private Deal Rooms, Pitch Decks & Institutional Capital",
    accentGlow: "rgba(30, 58, 138, 0.35)",
  },
  POP_CULTURE_GAMING: {
    primary: "#9333ea",
    accent: "#ec4899",
    background: "#180828",
    surface: "#2d124d",
    border: "#c084fc",
    fontFamily: "font-legible",
    badgeStyle: "warning",
    name: "Pop Culture & Gaming Expo",
    displayName: "Pop Culture & Gaming",
    tagline: "Cosplay Stages, Creator Alley & Esports Tournament Arenas",
    accentGlow: "rgba(147, 51, 234, 0.35)",
  },
  MUSIC_FESTIVAL: {
    primary: "#e11d48",
    accent: "#8b5cf6",
    background: "#110714",
    surface: "#260c2c",
    border: "#fb7185",
    fontFamily: "font-sans",
    badgeStyle: "archetype",
    name: "Music Festival & Arena Concert",
    displayName: "Music Festival & Concert",
    tagline: "Multi-Stage Live Sets, Acoustic Arenas & RFID Wristband Gates",
    accentGlow: "rgba(225, 29, 72, 0.35)",
  },
  MEGA_EXPO_PAVILION: {
    primary: "#ea580c",
    accent: "#16a34a",
    background: "#0c121e",
    surface: "#162032",
    border: "#fb923c",
    fontFamily: "font-sans",
    badgeStyle: "default",
    name: "Mega Expo & Multi-Pavilion Fair",
    displayName: "Mega Expo & Multi-Pavilion",
    tagline: "Multi-Pavilion Shopping, Nightly Fireworks & Culinary Bazaars",
    accentGlow: "rgba(234, 88, 12, 0.3)",
  },
  GOVERNMENT_DIPLOMATIC: {
    primary: "#0284c7",
    accent: "#ca8a04",
    background: "#020617",
    surface: "#0f172a",
    border: "#38bdf8",
    fontFamily: "font-serif",
    badgeStyle: "neutral",
    name: "Government & Diplomatic Summit",
    displayName: "Government & Diplomacy",
    tagline: "Diplomatic Protocol Briefings, Bilateral Suites & Delegation Access",
    accentGlow: "rgba(2, 132, 199, 0.25)",
  },
  INCENTIVE_RETREAT: {
    primary: "#059669",
    accent: "#d97706",
    background: "#062016",
    surface: "#0e3828",
    border: "#10b981",
    fontFamily: "font-legible",
    badgeStyle: "outline",
    name: "Corporate Incentive & Luxury Retreat",
    displayName: "Incentive & Corporate Retreat",
    tagline: "Curated Reward Itineraries, Leadership Retreats & Waterfront Galas",
    accentGlow: "rgba(5, 150, 105, 0.3)",
  },
  AUTOMOTIVE_MOBILITY: {
    primary: "#dc2626",
    accent: "#f97316",
    background: "#09090b",
    surface: "#18181b",
    border: "#f87171",
    fontFamily: "font-sans",
    badgeStyle: "destructive",
    name: "Automotive, EV & Mobility Expo",
    displayName: "Automotive & Mobility",
    tagline: "Test Drive Tracks, EV Tech Ecosystems & Concept Vehicle Premieres",
    accentGlow: "rgba(220, 38, 38, 0.3)",
  },
  ENERGY_INFRASTRUCTURE: {
    primary: "#d97706",
    accent: "#16a34a",
    background: "#0c0a09",
    surface: "#1c1917",
    border: "#f59e0b",
    fontFamily: "font-mono",
    badgeStyle: "warning",
    name: "Energy, Mining & Green Infrastructure",
    displayName: "Energy & Infrastructure",
    tagline: "Renewable Power Grids, Heavy Extraction Tech & Maritime Energy",
    accentGlow: "rgba(217, 119, 6, 0.3)",
  },
  AGRITECH_FOOD: {
    primary: "#16a34a",
    accent: "#84cc16",
    background: "#052e16",
    surface: "#064e3b",
    border: "#22c55e",
    fontFamily: "font-sans",
    badgeStyle: "success",
    name: "Agriculture, Agritech & Food Expo",
    displayName: "Agritech & Food Expo",
    tagline: "Smart Precision Farming, Cold-Chain Logistics & Commodity Trade",
    accentGlow: "rgba(22, 163, 74, 0.3)",
  },
  HOSPITALITY_TOURISM: {
    primary: "#0891b2",
    accent: "#38bdf8",
    background: "#083344",
    surface: "#0e7490",
    border: "#06b6d4",
    fontFamily: "font-legible",
    badgeStyle: "archetype",
    name: "Hospitality, Tourism & Travel Mart",
    displayName: "Travel & Hospitality Mart",
    tagline: "Destination Showcases, Hotelier Procurement & Buyer Appointments",
    accentGlow: "rgba(8, 145, 178, 0.3)",
  },
  EDUCATION_EDTECH: {
    primary: "#7c3aed",
    accent: "#a855f7",
    background: "#1e1b4b",
    surface: "#312e81",
    border: "#8b5cf6",
    fontFamily: "font-legible",
    badgeStyle: "default",
    name: "Education, EdTech & Academic Expo",
    displayName: "Education & EdTech Expo",
    tagline: "Global University Fairs, Scholarship Grants & Learning Platforms",
    accentGlow: "rgba(124, 58, 237, 0.3)",
  },
  FASHION_RETAIL: {
    primary: "#db2777",
    accent: "#4f46e5",
    background: "#2e1065",
    surface: "#3b0764",
    border: "#ec4899",
    fontFamily: "font-serif",
    badgeStyle: "secondary",
    name: "Fashion, Beauty & Luxury Retail Expo",
    displayName: "Fashion & Beauty Expo",
    tagline: "Designer Runway Shows, Cosmetic OEM Labs & Wholesale Buyer Orders",
    accentGlow: "rgba(219, 39, 119, 0.3)",
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
  "AUTOMOTIVE_MOBILITY",
  "ENERGY_INFRASTRUCTURE",
  "AGRITECH_FOOD",
  "HOSPITALITY_TOURISM",
  "EDUCATION_EDTECH",
  "FASHION_RETAIL",
];

export const ALL_MICE_ARCHETYPES = ARCHETYPE_LIST;

export const ARCHETYPE_METAS: Record<MiceArchetype, ArchetypeMeta> = {
  INDUSTRIAL_B2B: {
    id: "INDUSTRIAL_B2B",
    label: "Industrial & Manufacturing B2B",
    shortName: "Industrial & Manufacturing",
    description: "Heavy machinery engineering, precision CNC automation, robotics tooling, and global B2B procurement tenders.",
    tagline: "Heavy machinery engineering, precision CNC automation, robotics tooling, and global B2B procurement tenders.",
    ctaLabel: "Browse Industrial Expos",
    industry: "Heavy Machinery & Industrial Automation",
    sampleEventTitle: "Indonesia Industrial & Automation Expo 2026",
    accentIcon: "Factory",
    highlights: ["Machinery Specs", "RFQ Tender Quotes", "Live Robotics Demos", "Contract Manufacturing"],
    color: "#2563eb",
    borderColor: "#3b82f6",
    bgGradient: "from-blue-500/10 via-blue-500/5 to-transparent",
  },
  TECH_DEV_SUMMIT: {
    id: "TECH_DEV_SUMMIT",
    label: "Tech, AI & Developer Summits",
    shortName: "Tech, AI & Code",
    description: "Autonomous AI engineering, distributed cloud systems, developer keynotes, and competitive multi-track hackathons.",
    tagline: "Autonomous AI engineering, distributed cloud systems, developer keynotes, and competitive multi-track hackathons.",
    ctaLabel: "Explore Developer Summits",
    industry: "Software, Cloud Architecture & AI",
    sampleEventTitle: "Tokyo AI & Cloud Architecture Summit 2026",
    accentIcon: "Cpu",
    highlights: ["Multi-Track Keynotes", "API Sandboxes", "Open-Source Repos", "Live Coding Stages"],
    color: "#6366f1",
    borderColor: "#818cf8",
    bgGradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
  },
  MEDICAL_SYMPOSIUM: {
    id: "MEDICAL_SYMPOSIUM",
    label: "Medical & Healthcare Congress",
    shortName: "Medical & Health",
    description: "Peer-reviewed clinical research abstracts, CME medical accreditation, surgical breakthroughs, and biomedical assemblies.",
    tagline: "Peer-reviewed clinical research abstracts, CME medical accreditation, surgical breakthroughs, and biomedical assemblies.",
    ctaLabel: "Explore Clinical Symposia",
    industry: "Healthcare, Clinical Medicine & Pharmaceuticals",
    sampleEventTitle: "Asia-Pacific Cardiology & Clinical Innovation Congress 2026",
    accentIcon: "Activity",
    highlights: ["Peer-Reviewed Abstracts", "CME Credit Tracking", "Clinical Breakouts", "Biomedical Innovation"],
    color: "#0d9488",
    borderColor: "#2dd4bf",
    bgGradient: "from-teal-500/10 via-teal-500/5 to-transparent",
  },
  FINANCE_INVESTOR: {
    id: "FINANCE_INVESTOR",
    label: "Finance, FinTech & Investor Forums",
    shortName: "Finance & Capital",
    description: "Private bilateral deal rooms, institutional capital allocation, fintech venture pitch decks, and sovereign wealth assemblies.",
    tagline: "Private bilateral deal rooms, institutional capital allocation, fintech venture pitch decks, and sovereign wealth assemblies.",
    ctaLabel: "Access Deal-Room Suites",
    industry: "Banking, FinTech & Institutional Capital",
    sampleEventTitle: "Global FinTech & Private Capital Forum 2026",
    accentIcon: "TrendingUp",
    highlights: ["Private Deal Suites", "Venture Pitch Decks", "Institutional LP Lounges", "Fintech Keynotes"],
    color: "#1e3a8a",
    borderColor: "#10b981",
    bgGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
  },
  POP_CULTURE_GAMING: {
    id: "POP_CULTURE_GAMING",
    label: "Pop Culture & Gaming Expo",
    shortName: "Pop Culture & Gaming",
    description: "Esports championship tournament arenas, international cosplay catwalks, creator alley showcases, and premiere fandom stages.",
    tagline: "Esports championship tournament arenas, international cosplay catwalks, creator alley showcases, and premiere fandom stages.",
    ctaLabel: "Explore Esports & Anime Cons",
    industry: "Gaming, Esports & Pop Culture",
    sampleEventTitle: "Jakarta Comic & Gaming Championship 2026",
    accentIcon: "Gamepad2",
    highlights: ["Esports Arenas", "Cosplay Guidelines", "Creator Alley Stalls", "Exclusive Merch Rosters"],
    color: "#9333ea",
    borderColor: "#c084fc",
    bgGradient: "from-purple-500/10 via-purple-500/5 to-transparent",
  },
  MUSIC_FESTIVAL: {
    id: "MUSIC_FESTIVAL",
    label: "Music Festival & Arena Concerts",
    shortName: "Music & Arena Sets",
    description: "Multi-stage acoustic arena schedules, dynamic crowd telemetry, festival lineups, and fast-track RFID wristband admissions.",
    tagline: "Multi-stage acoustic arena schedules, dynamic crowd telemetry, festival lineups, and fast-track RFID wristband admissions.",
    ctaLabel: "Explore Live Arena Stages",
    industry: "Live Entertainment & Performing Arts",
    sampleEventTitle: "Neon Beats International Music Festival 2026",
    accentIcon: "Music",
    highlights: ["Multi-Stage Schedules", "Live Arena Telemetry", "Artist Lineup Timetables", "RFID Wristband Gates"],
    color: "#e11d48",
    borderColor: "#fb7185",
    bgGradient: "from-rose-500/10 via-rose-500/5 to-transparent",
  },
  MEGA_EXPO_PAVILION: {
    id: "MEGA_EXPO_PAVILION",
    label: "Mega Expo & Multi-Pavilion Fairs",
    shortName: "Mega Expos & Fairs",
    description: "Multi-hectare regional trade fairs, global nation pavilions, nocturnal fireworks spectacles, and commercial retail concourses.",
    tagline: "Multi-hectare regional trade fairs, global nation pavilions, nocturnal fireworks spectacles, and commercial retail concourses.",
    ctaLabel: "Explore Fair Pavilions",
    industry: "Consumer Goods, Cultural Fairs & Public Expos",
    sampleEventTitle: "International Mega Trade Fair & Expo 2026",
    accentIcon: "Tent",
    highlights: ["Multi-Pavilion Maps", "Nocturnal Fireworks", "Culinary Bazaars", "Tenant Promotion Radar"],
    color: "#ea580c",
    borderColor: "#fb923c",
    bgGradient: "from-orange-500/10 via-orange-500/5 to-transparent",
  },
  GOVERNMENT_DIPLOMATIC: {
    id: "GOVERNMENT_DIPLOMATIC",
    label: "Government & Diplomatic Summits",
    shortName: "Diplomatic & Policy",
    description: "High-security bilateral conference suites, sovereign policy briefings, diplomatic protocol coordination, and international state delegations.",
    tagline: "High-security bilateral conference suites, sovereign policy briefings, diplomatic protocol coordination, and international state delegations.",
    ctaLabel: "Access Diplomatic Briefings",
    industry: "Governance, Diplomatic Protocol & Public Policy",
    sampleEventTitle: "Indo-Pacific Clean Energy & Maritime Diplomatic Summit 2026",
    accentIcon: "Landmark",
    highlights: ["Protocol Briefing Dossiers", "Bilateral Room Schedules", "State Delegation Passes", "Multilateral Assemblies"],
    color: "#0284c7",
    borderColor: "#38bdf8",
    bgGradient: "from-sky-500/10 via-sky-500/5 to-transparent",
  },
  INCENTIVE_RETREAT: {
    id: "INCENTIVE_RETREAT",
    label: "Corporate Incentive & Luxury Retreats",
    shortName: "Incentive & Retreats",
    description: "Curated executive incentive itineraries, bespoke gala banquets, private leadership symposiums, and wellness retreat programming.",
    tagline: "Curated executive incentive itineraries, bespoke gala banquets, private leadership symposiums, and wellness retreat programming.",
    ctaLabel: "Explore Executive Retreats",
    industry: "Corporate Incentive Travel & Executive Retreats",
    sampleEventTitle: "Global Leadership Horizon Incentive Retreat Bali 2026",
    accentIcon: "Palmtree",
    highlights: ["Curated Day Itineraries", "Bespoke Gala Seating", "Executive Retreat Tracks", "Private Charter Transit"],
    color: "#059669",
    borderColor: "#10b981",
    bgGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
  },
  AUTOMOTIVE_MOBILITY: {
    id: "AUTOMOTIVE_MOBILITY",
    label: "Automotive, EV & Mobility Motor Show",
    shortName: "Automotive & EV",
    description: "Concept vehicle world premieres, closed-circuit test drive reservations, EV battery architectures, and autonomous mobility debuts.",
    tagline: "Concept vehicle world premieres, closed-circuit test drive reservations, EV battery architectures, and autonomous mobility debuts.",
    ctaLabel: "Explore Motor Showcases",
    industry: "Automotive, EV & Clean Mobility",
    sampleEventTitle: "International Auto & EV Mobility Motor Show 2026",
    accentIcon: "Car",
    highlights: ["Test Drive Track Slots", "World Concept Premieres", "EV Battery Tech", "Autonomous Mobility"],
    color: "#dc2626",
    borderColor: "#f87171",
    bgGradient: "from-red-500/10 via-red-500/5 to-transparent",
  },
  ENERGY_INFRASTRUCTURE: {
    id: "ENERGY_INFRASTRUCTURE",
    label: "Energy, Mining & Green Infrastructure",
    shortName: "Energy & Infrastructure",
    description: "Renewable grid distribution, strategic mineral extraction concessions, clean energy transitions, and heavy site machinery.",
    tagline: "Renewable grid distribution, strategic mineral extraction concessions, clean energy transitions, and heavy site machinery.",
    ctaLabel: "Explore Clean Energy Grids",
    industry: "Energy, Mining & Green Infrastructure",
    sampleEventTitle: "Asia Energy, Mining & Green Infrastructure Expo 2026",
    accentIcon: "Zap",
    highlights: ["Concession Topographies", "Clean Energy Grids", "Mining Heavy Plants", "Decarbonization Forums"],
    color: "#d97706",
    borderColor: "#f59e0b",
    bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
  },
  AGRITECH_FOOD: {
    id: "AGRITECH_FOOD",
    label: "Agriculture, Agritech & Food Expo",
    shortName: "Agritech & Food Trade",
    description: "Autonomous farming precision systems, cold-chain logistical corridors, food security symposiums, and global agricultural commodity trade.",
    tagline: "Autonomous farming precision systems, cold-chain logistical corridors, food security symposiums, and global agricultural commodity trade.",
    ctaLabel: "Explore Agricultural Trade",
    industry: "Agriculture, Food Processing & Cold-Chain",
    sampleEventTitle: "Global Agritech & Food Processing Expo 2026",
    accentIcon: "Sprout",
    highlights: ["Precision Farming Demos", "Cold-Chain Logistics", "Food Commodity Trade", "Culinary Innovation"],
    color: "#16a34a",
    borderColor: "#22c55e",
    bgGradient: "from-green-500/10 via-green-500/5 to-transparent",
  },
  HOSPITALITY_TOURISM: {
    id: "HOSPITALITY_TOURISM",
    label: "Hospitality, Tourism & Travel Mart",
    shortName: "Hospitality & Tourism",
    description: "International travel buyer matchmaking, luxury destination pavilions, hotelier procurement networks, and global airline assemblies.",
    tagline: "International travel buyer matchmaking, luxury destination pavilions, hotelier procurement networks, and global airline assemblies.",
    ctaLabel: "Connect Hospitality Buyers",
    industry: "Tourism, Travel Trade & Hospitality Procurement",
    sampleEventTitle: "World Travel & Hospitality Buyer Mart 2026",
    accentIcon: "Plane",
    highlights: ["Buyer Matchmaking Mart", "Destination Pavilions", "Hotelier Procurement", "Aviation Networks"],
    color: "#0891b2",
    borderColor: "#06b6d4",
    bgGradient: "from-cyan-500/10 via-cyan-500/5 to-transparent",
  },
  EDUCATION_EDTECH: {
    id: "EDUCATION_EDTECH",
    label: "Education, EdTech & Academic Summit",
    shortName: "Education & EdTech",
    description: "Global university fairs, higher education scholarship counseling, STEM laboratory breakthroughs, and digital curriculum summits.",
    tagline: "Global university fairs, higher education scholarship counseling, STEM laboratory breakthroughs, and digital curriculum summits.",
    ctaLabel: "Explore University Summits",
    industry: "Higher Education & Educational Technology",
    sampleEventTitle: "Global Education & EdTech Innovation Expo 2026",
    accentIcon: "GraduationCap",
    highlights: ["World University Fairs", "Scholarship Grant Counsel", "STEM Research Labs", "Digital EdTech Demos"],
    color: "#7c3aed",
    borderColor: "#8b5cf6",
    bgGradient: "from-violet-500/10 via-violet-500/5 to-transparent",
  },
  FASHION_RETAIL: {
    id: "FASHION_RETAIL",
    label: "Fashion, Beauty & Luxury Retail Expo",
    shortName: "Fashion & Luxury",
    description: "High-fashion runway premieres, cosmetics contract manufacturing (OEM), luxury brand showrooms, and commercial wholesale procurement.",
    tagline: "High-fashion runway premieres, cosmetics contract manufacturing (OEM), luxury brand showrooms, and commercial wholesale procurement.",
    ctaLabel: "Explore Runway Showrooms",
    industry: "Fashion, Cosmetics OEM & Luxury Retail",
    sampleEventTitle: "International Fashion & Cosmetics Trade Expo 2026",
    accentIcon: "Sparkles",
    highlights: ["Runway Show Schedules", "Cosmetics OEM Labs", "Luxury Brand Showrooms", "Wholesale Buyer Orders"],
    color: "#db2777",
    borderColor: "#ec4899",
    bgGradient: "from-fuchsia-500/10 via-fuchsia-500/5 to-transparent",
  },
};

export const ARCHETYPE_METADATA = ARCHETYPE_METAS;

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
