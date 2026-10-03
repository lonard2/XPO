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
  | "FASHION_RETAIL"
  | "BUILDING_PROPTECH"
  | "AEROSPACE_DEFENSE"
  | "SUPPLY_CHAIN_LOGISTICS"
  | "FRANCHISE_LICENSING"
  | "FAITH_PILGRIMAGE_CONGRESS"
  | "SPORTS_OUTDOOR"
  | "MEDIA_BROADCAST";

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
  subtitle?: string;
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
    name: "Technology, AI & Consumer Electronics",
    displayName: "Tech & Consumer Electronics",
    tagline: "Software, Cloud Platforms & Consumer Electronics",
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
    name: "Music, Stage & Performing Arts",
    displayName: "Music & Performing Arts",
    tagline: "Live Concerts, Theater Shows & Arena Productions",
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
  BUILDING_PROPTECH: {
    primary: "#0284c7",
    accent: "#f59e0b",
    background: "#090d16",
    surface: "#131b2e",
    border: "#38bdf8",
    fontFamily: "font-sans",
    badgeStyle: "neutral",
    name: "Building, Architecture & PropTech Expo",
    displayName: "Building & PropTech",
    tagline: "BIM Modeling, Architectural Materials & Smart Infrastructure",
    accentGlow: "rgba(2, 132, 199, 0.25)",
  },
  AEROSPACE_DEFENSE: {
    primary: "#1e3a8a",
    accent: "#06b6d4",
    background: "#050b14",
    surface: "#0a1628",
    border: "#2563eb",
    fontFamily: "font-mono",
    badgeStyle: "outline",
    name: "Aerospace, Aviation & Defense Expo",
    displayName: "Aerospace & Defense",
    tagline: "Flight Demonstrations, Defense Avionics & Autonomous Drones",
    accentGlow: "rgba(30, 58, 138, 0.35)",
  },
  SUPPLY_CHAIN_LOGISTICS: {
    primary: "#0d9488",
    accent: "#3b82f6",
    background: "#061317",
    surface: "#0c242c",
    border: "#14b8a6",
    fontFamily: "font-sans",
    badgeStyle: "archetype",
    name: "Supply Chain, Logistics & Packaging Tech",
    displayName: "Supply Chain & Logistics",
    tagline: "AGV Warehouse Robotics, Freight Corridors & Packaging Lines",
    accentGlow: "rgba(13, 148, 136, 0.3)",
  },
  FRANCHISE_LICENSING: {
    primary: "#ca8a04",
    accent: "#16a34a",
    background: "#141006",
    surface: "#241d0c",
    border: "#eab308",
    fontFamily: "font-sans",
    badgeStyle: "success",
    name: "Franchise, Retail & SME Business Opportunity",
    displayName: "Franchise & Licensing",
    tagline: "Master Franchise Licensing, Retail Concepts & SME Investments",
    accentGlow: "rgba(202, 138, 4, 0.3)",
  },
  FAITH_PILGRIMAGE_CONGRESS: {
    primary: "#047857",
    accent: "#d97706",
    background: "#061811",
    surface: "#0c2e22",
    border: "#10b981",
    fontFamily: "font-serif",
    badgeStyle: "outline",
    name: "Faith, Pilgrimage & Community Congress",
    displayName: "Faith & Pilgrimage Congress",
    tagline: "Sacred Pilgrimage Services, Halal Standards & Plenary Assemblies",
    accentGlow: "rgba(4, 120, 87, 0.3)",
  },
  SPORTS_OUTDOOR: {
    primary: "#ea580c",
    accent: "#0284c7",
    background: "#160b06",
    surface: "#2a150c",
    border: "#f97316",
    fontFamily: "font-sans",
    badgeStyle: "warning",
    name: "Sports, Fitness & Outdoor Adventure Expo",
    displayName: "Sports & Outdoor Adventure",
    tagline: "Athletic Competitions, Outdoor Gear Arenas & Fitness Expos",
    accentGlow: "rgba(234, 88, 12, 0.3)",
  },
  MEDIA_BROADCAST: {
    primary: "#7c3aed",
    accent: "#06b6d4",
    background: "#0f0b1b",
    surface: "#1c1533",
    border: "#a855f7",
    fontFamily: "font-mono",
    badgeStyle: "archetype",
    name: "Media, Broadcast & Pro-AV Technology Mart",
    displayName: "Media & Broadcast Tech",
    tagline: "Virtual Production Volumes, Pro-Audio Arenas & 8K Transmission",
    accentGlow: "rgba(124, 58, 237, 0.3)",
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
  "BUILDING_PROPTECH",
  "AEROSPACE_DEFENSE",
  "SUPPLY_CHAIN_LOGISTICS",
  "FRANCHISE_LICENSING",
  "FAITH_PILGRIMAGE_CONGRESS",
  "SPORTS_OUTDOOR",
  "MEDIA_BROADCAST",
];

export const ALL_MICE_ARCHETYPES = ARCHETYPE_LIST;

export const ARCHETYPE_SUBTITLES: Record<MiceArchetype, string> = {
  INDUSTRIAL_B2B: "Factory machinery, robotics, and industrial tools",
  AUTOMOTIVE_MOBILITY: "Cars, electric vehicles, and transport technology",
  BUILDING_PROPTECH: "Building materials, construction, and property technology",
  ENERGY_INFRASTRUCTURE: "Power generation, mining equipment, and renewables",
  TECH_DEV_SUMMIT: "Software, cloud platforms, and consumer electronics",
  MEDIA_BROADCAST: "Audio-video gear, studio equipment, and broadcasting",
  EDUCATION_EDTECH: "Universities, student exchange, and learning tools",
  SUPPLY_CHAIN_LOGISTICS: "Warehousing, freight shipping, and packaging lines",
  FINANCE_INVESTOR: "Banking, financial technology, and investment firms",
  FRANCHISE_LICENSING: "Franchise brands, retail concepts, and business licenses",
  AGRITECH_FOOD: "Farming equipment, crops, and food processing",
  GOVERNMENT_DIPLOMATIC: "Intergovernmental forums and public policy meetings",
  AEROSPACE_DEFENSE: "Commercial aviation, defense equipment, and aircraft",
  MEDICAL_SYMPOSIUM: "Hospital equipment, clinical medicine, and pharmaceuticals",
  HOSPITALITY_TOURISM: "Hotels, tour operators, and tourism boards",
  FAITH_PILGRIMAGE_CONGRESS: "Hajj travel services, community gatherings, and halal goods",
  INCENTIVE_RETREAT: "Company offsites, group travel, and executive retreats",
  POP_CULTURE_GAMING: "Video games, comics, animation, and cosplay",
  MUSIC_FESTIVAL: "Live concerts, theater shows, and arena productions",
  MEGA_EXPO_PAVILION: "Country pavilions, trade fairs, and consumer expos",
  FASHION_RETAIL: "Clothing, cosmetics, jewelry, and fashion brands",
  SPORTS_OUTDOOR: "Sporting equipment, gym gear, and outdoor recreation",
};

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
    label: "Technology, AI & Consumer Electronics",
    shortName: "Tech & Electronics",
    description: "Software engineering, cloud infrastructure, developer keynotes, and consumer electronics showcases.",
    tagline: "Software engineering, cloud infrastructure, developer keynotes, and consumer electronics showcases.",
    subtitle: "Software, cloud platforms, and consumer electronics",
    ctaLabel: "Explore Tech & Electronics",
    industry: "Software, Cloud & Consumer Electronics",
    sampleEventTitle: "Tokyo AI & Consumer Electronics Expo 2026",
    accentIcon: "Cpu",
    highlights: ["Multi-Track Keynotes", "API Sandboxes", "Hardware Showcases", "Live Coding Stages"],
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
    label: "Music, Stage & Performing Arts",
    shortName: "Music & Performing Arts",
    description: "Live arena concerts, theatrical stage productions, festival lineups, and performing arts showcases.",
    tagline: "Live arena concerts, theatrical stage productions, festival lineups, and performing arts showcases.",
    subtitle: "Live concerts, theater shows, and arena productions",
    ctaLabel: "Explore Stage & Concerts",
    industry: "Live Entertainment & Performing Arts",
    sampleEventTitle: "Neon Beats International Music Festival 2026",
    accentIcon: "Music",
    highlights: ["Multi-Stage Schedules", "Theatrical Stages", "Artist Timetables", "RFID Wristband Gates"],
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
  BUILDING_PROPTECH: {
    id: "BUILDING_PROPTECH",
    label: "Building, Architecture & PropTech Expo",
    shortName: "Building & PropTech",
    description: "Sustainable building materials, architectural BIM technology, smart property automation, and civil construction procurement.",
    tagline: "Sustainable building materials, architectural BIM technology, smart property automation, and civil construction procurement.",
    ctaLabel: "Explore Building Materials",
    industry: "Architecture, Building Materials & PropTech",
    sampleEventTitle: "IndoBuildTech Architecture & PropTech Expo 2026",
    accentIcon: "Building2",
    highlights: ["BIM CAD Downloads", "Material Sample Requests", "CPD Architect Credits", "Smart City Tech"],
    color: "#0284c7",
    borderColor: "#38bdf8",
    bgGradient: "from-sky-500/10 via-sky-500/5 to-transparent",
  },
  AEROSPACE_DEFENSE: {
    id: "AEROSPACE_DEFENSE",
    label: "Aerospace, Aviation & Defense Expo",
    shortName: "Aerospace & Defense",
    description: "Supersonic flight demonstrations, military defense systems, commercial aviation procurement, and unmanned drone avionics.",
    tagline: "Supersonic flight demonstrations, military defense systems, commercial aviation procurement, and unmanned drone avionics.",
    ctaLabel: "Access Defense Briefings",
    industry: "Aerospace, Military Defense & Aviation Systems",
    sampleEventTitle: "Indo Defence & International Aerospace Expo 2026",
    accentIcon: "Shield",
    highlights: ["Flight Demo Timetable", "Static Aircraft Specs", "Security Clearance Badges", "Drone Swarm Demos"],
    color: "#1e3a8a",
    borderColor: "#2563eb",
    bgGradient: "from-blue-600/10 via-blue-600/5 to-transparent",
  },
  SUPPLY_CHAIN_LOGISTICS: {
    id: "SUPPLY_CHAIN_LOGISTICS",
    label: "Supply Chain, Logistics & Packaging Tech",
    shortName: "Logistics & Packaging",
    description: "Autonomous warehouse robotics (AGV/AMR), multimodal freight logistics, smart packaging automation, and cold-chain distribution.",
    tagline: "Autonomous warehouse robotics (AGV/AMR), multimodal freight logistics, smart packaging automation, and cold-chain distribution.",
    ctaLabel: "Explore Logistics Corridors",
    industry: "Supply Chain, Freight Logistics & Automated Packaging",
    sampleEventTitle: "Logis-Tech & Supply Chain Automation Expo 2026",
    accentIcon: "Truck",
    highlights: ["AGV Robotics Demos", "Freight Route RFP Quotes", "Cold-Chain Telemetry", "Pallet Packaging Lines"],
    color: "#0d9488",
    borderColor: "#14b8a6",
    bgGradient: "from-teal-500/10 via-teal-500/5 to-transparent",
  },
  FRANCHISE_LICENSING: {
    id: "FRANCHISE_LICENSING",
    label: "Franchise, Retail & SME Business Opportunity",
    shortName: "Franchise & SME",
    description: "Turnkey retail franchise concepts, intellectual property licensing, SME business opportunities, and F&B multi-unit agreements.",
    tagline: "Turnkey retail franchise concepts, intellectual property licensing, SME business opportunities, and F&B multi-unit agreements.",
    ctaLabel: "Explore Franchise Concepts",
    industry: "Franchise Licensing, Retail Concepts & SME Investment",
    sampleEventTitle: "International Franchise & Business Concept Expo 2026",
    accentIcon: "Store",
    highlights: ["ROI & Payback Calculator", "1-on-1 Discovery Suites", "F&B Multi-Unit Brands", "SME Capital Matching"],
    color: "#ca8a04",
    borderColor: "#eab308",
    bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
  },
  FAITH_PILGRIMAGE_CONGRESS: {
    id: "FAITH_PILGRIMAGE_CONGRESS",
    label: "Faith, Pilgrimage & Community Congress",
    shortName: "Faith & Pilgrimage",
    description: "Hajj & Umrah pilgrimage logistics, accredited Halal industry standards, international clerical assemblies, and religious community conventions.",
    tagline: "Hajj & Umrah pilgrimage logistics, accredited Halal industry standards, international clerical assemblies, and religious community conventions.",
    ctaLabel: "Explore Pilgrimage Services",
    industry: "Faith Communities, Pilgrimage Services & Halal Economy",
    sampleEventTitle: "International Hajj, Umrah & Halal Expo 2026",
    accentIcon: "Compass",
    highlights: ["Plenary Arena Seating", "Translation Audio Channels", "Licensed Operator Verification", "Halal Standards Forum"],
    color: "#047857",
    borderColor: "#10b981",
    bgGradient: "from-emerald-600/10 via-emerald-600/5 to-transparent",
  },
  SPORTS_OUTDOOR: {
    id: "SPORTS_OUTDOOR",
    label: "Sports, Fitness & Outdoor Adventure Expo",
    shortName: "Sports & Outdoor",
    description: "Competitive marathon bib collections, endurance equipment testing arenas, high-altitude expedition gear, and sports medicine summits.",
    tagline: "Competitive marathon bib collections, endurance equipment testing arenas, high-altitude expedition gear, and sports medicine summits.",
    ctaLabel: "Explore Sports Expos",
    industry: "Athletics, Outdoor Recreation & Sports Medicine",
    sampleEventTitle: "National Sports, Marathon & Outdoor Adventure Expo 2026",
    accentIcon: "Trophy",
    highlights: ["Race Bib Collection QR", "Trail Gear Testing Arena", "Coaching & Sports Medicine", "Obstacle Course Slalom"],
    color: "#ea580c",
    borderColor: "#f97316",
    bgGradient: "from-orange-500/10 via-orange-500/5 to-transparent",
  },
  MEDIA_BROADCAST: {
    id: "MEDIA_BROADCAST",
    label: "Media, Broadcast & Pro-AV Technology Mart",
    shortName: "Media & Broadcast",
    description: "Virtual production LED walls, SMPTE ST 2110 IP broadcast routing, line-array pro-audio listening, and cinema camera optics.",
    tagline: "Virtual production LED walls, SMPTE ST 2110 IP broadcast routing, line-array pro-audio listening, and cinema camera optics.",
    ctaLabel: "Explore Broadcast Stages",
    industry: "Broadcast Engineering, Pro-AV & Digital Media",
    sampleEventTitle: "Asia Pro-AV & Broadcast Engineering Expo 2026",
    accentIcon: "Video",
    highlights: ["Virtual Production LED Stage", "Pro-Audio Listening Sessions", "SMPTE ST 2110 Specs", "Cinema Optics Gallery"],
    color: "#7c3aed",
    borderColor: "#a855f7",
    bgGradient: "from-violet-500/10 via-violet-500/5 to-transparent",
  },
};

export const ARCHETYPE_METADATA = ARCHETYPE_METAS;

export interface MiceIndustryCluster {
  id: string;
  label: string;
  shortLabel: string;
  archetypes: MiceArchetype[];
}

export const MICE_INDUSTRY_CLUSTERS: MiceIndustryCluster[] = [
  {
    id: 'heavy_industry_infrastructure',
    label: 'Heavy Industry & Infrastructure',
    shortLabel: 'Heavy Industry',
    archetypes: [
      'INDUSTRIAL_B2B',
      'AUTOMOTIVE_MOBILITY',
      'BUILDING_PROPTECH',
      'ENERGY_INFRASTRUCTURE',
    ],
  },
  {
    id: 'digital_tech_media',
    label: 'Digital, Tech & Media',
    shortLabel: 'Digital & Tech',
    archetypes: [
      'TECH_DEV_SUMMIT',
      'MEDIA_BROADCAST',
      'EDUCATION_EDTECH',
    ],
  },
  {
    id: 'enterprise_supply_finance',
    label: 'Enterprise Trade, Supply Chain & Finance',
    shortLabel: 'Enterprise & Trade',
    archetypes: [
      'SUPPLY_CHAIN_LOGISTICS',
      'FINANCE_INVESTOR',
      'FRANCHISE_LICENSING',
      'AGRITECH_FOOD',
    ],
  },
  {
    id: 'sovereign_defense_aviation',
    label: 'Sovereign Affairs, Defense & Aviation',
    shortLabel: 'Sovereign & Defense',
    archetypes: [
      'GOVERNMENT_DIPLOMATIC',
      'AEROSPACE_DEFENSE',
    ],
  },
  {
    id: 'health_travel_faith',
    label: 'Healthcare, Travel & Faith Communities',
    shortLabel: 'Health & Faith',
    archetypes: [
      'MEDICAL_SYMPOSIUM',
      'HOSPITALITY_TOURISM',
      'FAITH_PILGRIMAGE_CONGRESS',
      'INCENTIVE_RETREAT',
    ],
  },
  {
    id: 'culture_lifestyle_sports',
    label: 'Culture, Lifestyle, Sports & Entertainment',
    shortLabel: 'Culture & Sports',
    archetypes: [
      'POP_CULTURE_GAMING',
      'MUSIC_FESTIVAL',
      'MEGA_EXPO_PAVILION',
      'FASHION_RETAIL',
      'SPORTS_OUTDOOR',
    ],
  },
];

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
