'use client';

import * as React from 'react';
import Link from 'next/link';
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
  Crown,
  Layers,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface CategoryItem {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  ctaLabel: string;
  highlights: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGradient: string;
  borderColor: string;
}

export const EVENT_CATEGORIES: CategoryItem[] = [
  {
    id: 'INDUSTRIAL_B2B',
    name: 'Industrial & Manufacturing B2B',
    shortName: 'Industrial & Manufacturing',
    tagline: 'Heavy machinery engineering, precision CNC automation, robotics tooling, and global B2B procurement tenders.',
    ctaLabel: 'Browse Industrial Expos',
    highlights: ['Machinery Specs', 'RFQ Tender Quotes', 'Live Robotics Demos', 'Contract Manufacturing'],
    icon: Factory,
    color: '#2563eb', // Steel Blue
    bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
    borderColor: '#3b82f6',
  },
  {
    id: 'TECH_DEV_SUMMIT',
    name: 'Tech, AI & Developer Summits',
    shortName: 'Tech, AI & Code',
    tagline: 'Autonomous AI engineering, distributed cloud systems, developer keynotes, and competitive multi-track hackathons.',
    ctaLabel: 'Explore Developer Summits',
    highlights: ['Multi-Track Keynotes', 'API Sandboxes', 'Open-Source Repos', 'Live Coding Stages'],
    icon: Cpu,
    color: '#6366f1', // Indigo
    bgGradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
    borderColor: '#818cf8',
  },
  {
    id: 'MEDICAL_SYMPOSIUM',
    name: 'Medical & Healthcare Congress',
    shortName: 'Medical & Health',
    tagline: 'Peer-reviewed clinical research abstracts, CME medical accreditation, surgical breakthroughs, and biomedical assemblies.',
    ctaLabel: 'Explore Clinical Symposia',
    highlights: ['Peer-Reviewed Abstracts', 'CME Credit Tracking', 'Clinical Breakouts', 'Biomedical Innovation'],
    icon: Activity,
    color: '#0d9488', // Teal
    bgGradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
    borderColor: '#2dd4bf',
  },
  {
    id: 'FINANCE_INVESTOR',
    name: 'Finance, FinTech & Investor Forums',
    shortName: 'Finance & Capital',
    tagline: 'Private bilateral deal rooms, institutional capital allocation, fintech venture pitch decks, and sovereign wealth assemblies.',
    ctaLabel: 'Access Deal-Room Suites',
    highlights: ['Private Deal Suites', 'Venture Pitch Decks', 'Institutional LP Lounges', 'Fintech Keynotes'],
    icon: TrendingUp,
    color: '#1e3a8a', // Deep Navy
    bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    borderColor: '#10b981',
  },
  {
    id: 'POP_CULTURE_GAMING',
    name: 'Pop Culture & Gaming Expo',
    shortName: 'Pop Culture & Gaming',
    tagline: 'Esports championship tournament arenas, international cosplay catwalks, creator alley showcases, and premiere fandom stages.',
    ctaLabel: 'Explore Esports & Anime Cons',
    highlights: ['Esports Arenas', 'Cosplay Guidelines', 'Creator Alley Stalls', 'Exclusive Merch Rosters'],
    icon: Gamepad2,
    color: '#9333ea', // Purple
    bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
    borderColor: '#c084fc',
  },
  {
    id: 'MUSIC_FESTIVAL',
    name: 'Music Festival & Arena Concerts',
    shortName: 'Music & Arena Sets',
    tagline: 'Multi-stage acoustic arena schedules, dynamic crowd telemetry, festival lineups, and fast-track RFID wristband admissions.',
    ctaLabel: 'Explore Live Arena Stages',
    highlights: ['Multi-Stage Schedules', 'Live Arena Telemetry', 'Artist Lineup Timetables', 'RFID Wristband Gates'],
    icon: Music,
    color: '#e11d48', // Rose
    bgGradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
    borderColor: '#fb7185',
  },
  {
    id: 'MEGA_EXPO_PAVILION',
    name: 'Mega Expo & Multi-Pavilion Fairs',
    shortName: 'Mega Expos & Fairs',
    tagline: 'Multi-hectare regional trade fairs, global nation pavilions, nocturnal fireworks spectacles, and commercial retail concourses.',
    ctaLabel: 'Explore Fair Pavilions',
    highlights: ['Multi-Pavilion Maps', 'Nocturnal Fireworks', 'Culinary Bazaars', 'Tenant Promotion Radar'],
    icon: Tent,
    color: '#ea580c', // Orange
    bgGradient: 'from-orange-500/10 via-orange-500/5 to-transparent',
    borderColor: '#fb923c',
  },
  {
    id: 'AUTOMOTIVE_MOBILITY',
    name: 'Automotive, EV & Mobility Motor Show',
    shortName: 'Automotive & EV',
    tagline: 'Concept vehicle world premieres, closed-circuit test drive reservations, EV battery architectures, and autonomous mobility debuts.',
    ctaLabel: 'Explore Motor Showcases',
    highlights: ['Test Drive Track Slots', 'World Concept Premieres', 'EV Battery Tech', 'Autonomous Mobility'],
    icon: Car,
    color: '#dc2626', // Crimson Red
    bgGradient: 'from-red-500/10 via-red-500/5 to-transparent',
    borderColor: '#f87171',
  },
  {
    id: 'ENERGY_INFRASTRUCTURE',
    name: 'Energy, Mining & Green Infrastructure',
    shortName: 'Energy & Infrastructure',
    tagline: 'Renewable grid distribution, strategic mineral extraction concessions, clean energy transitions, and heavy site machinery.',
    ctaLabel: 'Explore Clean Energy Grids',
    highlights: ['Concession Topographies', 'Clean Energy Grids', 'Mining Heavy Plants', 'Decarbonization Forums'],
    icon: Zap,
    color: '#d97706', // Gold / Amber
    bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    borderColor: '#f59e0b',
  },
  {
    id: 'AGRITECH_FOOD',
    name: 'Agriculture, Agritech & Food Expo',
    shortName: 'Agritech & Food Trade',
    tagline: 'Autonomous farming precision systems, cold-chain logistical corridors, food security symposiums, and global agricultural commodity trade.',
    ctaLabel: 'Explore Agricultural Trade',
    highlights: ['Precision Farming Demos', 'Cold-Chain Logistics', 'Food Commodity Trade', 'Culinary Innovation'],
    icon: Sprout,
    color: '#16a34a', // Forest Green
    bgGradient: 'from-green-500/10 via-green-500/5 to-transparent',
    borderColor: '#22c55e',
  },
  {
    id: 'HOSPITALITY_TOURISM',
    name: 'Hospitality, Tourism & Travel Mart',
    shortName: 'Hospitality & Tourism',
    tagline: 'International travel buyer matchmaking, luxury destination pavilions, hotelier procurement networks, and global airline assemblies.',
    ctaLabel: 'Connect Hospitality Buyers',
    highlights: ['Buyer Matchmaking Mart', 'Destination Pavilions', 'Hotelier Procurement', 'Aviation Networks'],
    icon: Plane,
    color: '#0891b2', // Cyan
    bgGradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
    borderColor: '#06b6d4',
  },
  {
    id: 'EDUCATION_EDTECH',
    name: 'Education, EdTech & Academic Summit',
    shortName: 'Education & EdTech',
    tagline: 'Global university fairs, higher education scholarship counseling, STEM laboratory breakthroughs, and digital curriculum summits.',
    ctaLabel: 'Explore University Summits',
    highlights: ['World University Fairs', 'Scholarship Grant Counsel', 'STEM Research Labs', 'Digital EdTech Demos'],
    icon: GraduationCap,
    color: '#7c3aed', // Violet
    bgGradient: 'from-violet-500/10 via-violet-500/5 to-transparent',
    borderColor: '#8b5cf6',
  },
  {
    id: 'FASHION_RETAIL',
    name: 'Fashion, Beauty & Luxury Retail Expo',
    shortName: 'Fashion & Luxury',
    tagline: 'High-fashion runway premieres, cosmetics contract manufacturing (OEM), luxury brand showrooms, and commercial wholesale procurement.',
    ctaLabel: 'Explore Runway Showrooms',
    highlights: ['Runway Show Schedules', 'Cosmetics OEM Labs', 'Luxury Brand Showrooms', 'Wholesale Buyer Orders'],
    icon: Crown,
    color: '#db2777', // Fuchsia
    bgGradient: 'from-fuchsia-500/10 via-fuchsia-500/5 to-transparent',
    borderColor: '#ec4899',
  },
  {
    id: 'GOVERNMENT_DIPLOMATIC',
    name: 'Government & Diplomatic Summits',
    shortName: 'Diplomatic & Policy',
    tagline: 'High-security bilateral conference suites, sovereign policy briefings, diplomatic protocol coordination, and international state delegations.',
    ctaLabel: 'Access Diplomatic Briefings',
    highlights: ['Protocol Briefing Dossiers', 'Bilateral Room Schedules', 'State Delegation Passes', 'Multilateral Assemblies'],
    icon: Landmark,
    color: '#0284c7', // Sky Blue
    bgGradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
    borderColor: '#38bdf8',
  },
  {
    id: 'INCENTIVE_RETREAT',
    name: 'Corporate Incentive & Luxury Retreats',
    shortName: 'Incentive & Retreats',
    tagline: 'Curated executive incentive itineraries, bespoke gala banquets, private leadership symposiums, and wellness retreat programming.',
    ctaLabel: 'Explore Executive Retreats',
    highlights: ['Curated Day Itineraries', 'Bespoke Gala Seating', 'Executive Retreat Tracks', 'Private Charter Transit'],
    icon: Palmtree,
    color: '#059669', // Emerald
    bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    borderColor: '#10b981',
  },
];

export interface EventCategoryPillsProps {
  locale: string;
  activeCategoryId?: string;
  onSelectCategory?: (categoryId: string) => void;
  className?: string;
}

export function EventCategoryPills({
  locale,
  activeCategoryId,
  onSelectCategory,
  className,
}: EventCategoryPillsProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const jumpBarRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  let tArch: any = (k: string) => k;
  let tDisc: any = (k: string) => k;
  let tCom: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tArch = useTranslations('archetypes');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tDisc = useTranslations('discovery');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tCom = useTranslations('common');
  } catch {
    // Fallback if rendered outside provider in tests
  }

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  React.useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -380 : 380;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Drag to scroll logic
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeftState, setScrollLeftState] = React.useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  const scrollToCategoryIndex = (index: number, categoryId?: string) => {
    if (onSelectCategory && categoryId) {
      onSelectCategory(categoryId);
    }
    if (!scrollContainerRef.current) return;
    const cardWidth = 380;
    scrollContainerRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
  };

  // Roving keyboard navigation for jump pills
  const handlePillKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const buttons = jumpBarRef.current?.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>('button, a');
    if (!buttons || buttons.length === 0) return;

    const currentIndex = Array.from(buttons).indexOf(document.activeElement as any);
    if (currentIndex === -1) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % buttons.length;
      buttons[nextIndex]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      buttons[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      buttons[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      buttons[buttons.length - 1]?.focus();
    }
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <Layers className="h-4 w-4" />
            <span>{tDisc('verticalsBadge') || '15 Specialized MICE Verticals'}</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-foreground">
            {tDisc('verticalsTitle') || 'Explore by Event Category'}
          </h2>
        </div>

        {/* Scroll Controls & View All */}
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/events`}
            className="text-xs font-semibold text-primary hover:underline hidden sm:inline-flex items-center gap-1 mr-2"
          >
            <span>{tDisc('allArchetypes') || 'All Categories'}</span>
            <ArrowRight className="h-3 w-3" />
          </Link>

          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-lg border-border text-foreground hover:bg-accent disabled:opacity-30 cursor-pointer"
            disabled={!canScrollLeft}
            onClick={() => scroll('left')}
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-lg border-border text-foreground hover:bg-accent disabled:opacity-30 cursor-pointer"
            disabled={!canScrollRight}
            onClick={() => scroll('right')}
            aria-label="Scroll categories right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Category Jump Pill Bar with Keyboard Roving Navigation */}
      <div
        ref={jumpBarRef}
        onKeyDown={handlePillKeyDown}
        role="toolbar"
        aria-label="Event category selection filter"
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1"
      >
        {onSelectCategory ? (
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
              !activeCategoryId || activeCategoryId === 'all'
                ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'border-border/80 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{tDisc('allArchetypes') || 'All (15)'}</span>
          </button>
        ) : (
          <Link
            href={`/${locale}/events`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all whitespace-nowrap cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{tDisc('allArchetypes') || 'All (15)'}</span>
          </Link>
        )}
        {EVENT_CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon;
          const isSelected = activeCategoryId === cat.id;
          let label = cat.shortName;
          try {
            if (tArch && typeof tArch.raw === 'function') {
              const obj = tArch.raw(cat.id);
              if (obj?.tag) label = obj.tag;
            }
          } catch {
            // fallback
          }

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => scrollToCategoryIndex(idx, cat.id)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'border-border/80 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Horizontally Scrollable Category Cards Carousel with Tactile Polish */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={cn(
          'flex items-stretch gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x -mx-1 px-1 select-none touch-pan-y',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
      >
        {EVENT_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategoryId === category.id;

          let translatedTitle = category.name;
          let translatedDesc = category.tagline;
          let translatedTag = category.shortName;
          try {
            if (tArch && typeof tArch.raw === 'function') {
              const obj = tArch.raw(category.id);
              if (obj?.title) translatedTitle = obj.title;
              if (obj?.description) translatedDesc = obj.description;
              if (obj?.tag) translatedTag = obj.tag;
            }
          } catch {
            // fallback
          }

          const cardContent = (
            <div
              style={{
                borderColor: isActive ? category.color : undefined,
                boxShadow: isActive ? `0 0 24px -4px ${category.color}40` : undefined,
              }}
              className={cn(
                'group relative flex flex-col justify-between w-[300px] sm:w-[350px] lg:w-[370px] rounded-3xl border p-5 sm:p-6 transition-all duration-300 overflow-hidden text-left h-full snap-start shrink-0 shadow-xs',
                isActive
                  ? 'ring-2 ring-primary border-primary bg-card'
                  : 'border-border/80 bg-card hover:border-primary/60 hover:shadow-md hover:-translate-y-0.5'
              )}
            >
              {/* Dynamic Domain Ambient Glow */}
              <div
                className={cn(
                  'absolute -top-12 -right-12 h-32 w-32 rounded-full blur-2xl transition-opacity duration-300 pointer-events-none',
                  isActive ? 'opacity-45' : 'opacity-15 group-hover:opacity-35'
                )}
                style={{ backgroundColor: category.color }}
              />

              <div className="relative z-10 space-y-4">
                {/* Header: Icon & Category Tag Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 shadow-2xs"
                    style={{
                      backgroundColor: `${category.color}15`,
                      color: category.color,
                      border: `1px solid ${category.color}30`,
                    }}
                  >
                    <Icon className="h-5 w-5 stroke-[2.2]" />
                  </div>

                  <span
                    className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap border"
                    style={{
                      backgroundColor: `${category.color}12`,
                      color: category.color,
                      borderColor: `${category.color}25`,
                    }}
                  >
                    {translatedTag}
                  </span>
                </div>

                {/* Title & Evocative Tagline */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 min-h-[2.75rem]">
                    {translatedTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed min-h-[3.25rem]">
                    {translatedDesc}
                  </p>
                </div>

                {/* Domain Spectrum Capabilities Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {category.highlights.slice(0, 4).map((highlight, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium text-foreground/85 bg-muted/80 px-2.5 py-0.5 rounded-lg whitespace-nowrap border border-border/40"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Domain CTA Arrow Strip */}
              <div className="relative z-10 pt-4 mt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
                <span>{category.ctaLabel || tCom('viewCategory') || `Explore ${category.shortName}`}</span>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          );

          if (onSelectCategory) {
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(category.id)}
                className="shrink-0 text-left focus:outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary rounded-3xl"
              >
                {cardContent}
              </button>
            );
          }

          return (
            <Link
              key={category.id}
              href={`/${locale}/events?archetype=${category.id}`}
              className="shrink-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-3xl"
            >
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
