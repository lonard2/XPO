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
  Sparkles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export interface CategoryItem {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  specialtyTool: string;
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
    shortName: 'Industrial B2B',
    tagline: 'Heavy machinery, precision tooling & automated B2B procurement.',
    specialtyTool: 'Machinery RFQ Drawer',
    highlights: ['Machinery Specs', 'RFQ Quotes', 'Exhibitor Booths'],
    icon: Factory,
    color: '#2563eb', // Steel Blue
    bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
    borderColor: '#3b82f6',
  },
  {
    id: 'TECH_DEV_SUMMIT',
    name: 'Tech, AI & Developer Summits',
    shortName: 'Tech & AI',
    tagline: 'Autonomous AI agents, cloud architectures & multi-track hackathons.',
    specialtyTool: 'GitHub Livestream Track',
    highlights: ['Multi-Track Agendas', 'GitHub Tags', 'Livestreams'],
    icon: Cpu,
    color: '#6366f1', // Indigo
    bgGradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
    borderColor: '#818cf8',
  },
  {
    id: 'MEDICAL_SYMPOSIUM',
    name: 'Medical & Healthcare Congress',
    shortName: 'Medical & Health',
    tagline: 'Peer-reviewed research abstracts, clinical breakouts & CME accreditation.',
    specialtyTool: 'CME Credit Calculator',
    highlights: ['Abstract Readers', 'CME Credits', 'Accredited Badges'],
    icon: Activity,
    color: '#0d9488', // Teal
    bgGradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
    borderColor: '#2dd4bf',
  },
  {
    id: 'FINANCE_INVESTOR',
    name: 'Finance, FinTech & Investor Forums',
    shortName: 'Finance & Deals',
    tagline: 'Private deal-rooms, venture pitch decks & institutional capital.',
    specialtyTool: 'Deal-Room VIP Booking',
    highlights: ['Deal-Room Booking', 'Pitch Decks', 'VIP Passes'],
    icon: TrendingUp,
    color: '#1e3a8a', // Deep Navy / Emerald
    bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    borderColor: '#10b981',
  },
  {
    id: 'POP_CULTURE_GAMING',
    name: 'Pop Culture & Gaming Expo',
    shortName: 'Gaming & Anime',
    tagline: 'Esports tournament arenas, cosplay catwalks & creator alley showcase.',
    specialtyTool: 'Cosplay Catwalk Radar',
    highlights: ['Cosplay Rules', 'Creator Alley', 'Merch Wishlist'],
    icon: Gamepad2,
    color: '#9333ea', // Purple
    bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
    borderColor: '#c084fc',
  },
  {
    id: 'MUSIC_FESTIVAL',
    name: 'Music Festival & Arena Concerts',
    shortName: 'Music & Shows',
    tagline: 'Multi-stage real-time timelines, acoustic arenas & crowd density radar.',
    specialtyTool: 'Stage Crowd Meter',
    highlights: ['Stage Timelines', 'Crowd Meters', 'Gate Access'],
    icon: Music,
    color: '#e11d48', // Rose
    bgGradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
    borderColor: '#fb7185',
  },
  {
    id: 'MEGA_EXPO_PAVILION',
    name: 'Mega Expo & Multi-Pavilion Fairs',
    shortName: 'Mega Expos & Fairs',
    tagline: 'Multi-hectare public fairs, night fireworks & 500+ commercial tenants.',
    specialtyTool: 'Pavilion Fireworks Map',
    highlights: ['Pavilion Maps', 'Fireworks Schedules', 'Tenant Promos'],
    icon: Tent,
    color: '#ea580c', // Orange
    bgGradient: 'from-orange-500/10 via-orange-500/5 to-transparent',
    borderColor: '#fb923c',
  },
  {
    id: 'AUTOMOTIVE_MOBILITY',
    name: 'Automotive, EV & Mobility Motor Show',
    shortName: 'Auto & Mobility',
    tagline: 'Test drive track bookings, concept vehicle debuts & EV charging tech.',
    specialtyTool: 'Test Drive Slot Booking',
    highlights: ['Test Drive Track', 'Concept Unveils', 'EV Tech'],
    icon: Car,
    color: '#dc2626', // Crimson Red
    bgGradient: 'from-red-500/10 via-red-500/5 to-transparent',
    borderColor: '#f87171',
  },
  {
    id: 'ENERGY_INFRASTRUCTURE',
    name: 'Energy, Mining & Green Infrastructure',
    shortName: 'Energy & Mining',
    tagline: 'Renewable grid concessions, mineral extraction & heavy site equipment.',
    specialtyTool: 'Concession Grid Explorer',
    highlights: ['Concession Maps', 'Green Grids', 'Heavy Machinery'],
    icon: Zap,
    color: '#d97706', // Gold / Amber
    bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    borderColor: '#f59e0b',
  },
  {
    id: 'AGRITECH_FOOD',
    name: 'Agriculture, Agritech & Food Expo',
    shortName: 'Agritech & Food',
    tagline: 'Smart farming robotics, cold-chain logistics & culinary trade stages.',
    specialtyTool: 'Cold-Chain Procurement',
    highlights: ['Smart Farming Demos', 'Cold-Chain Logistics', 'Culinary Stages'],
    icon: Sprout,
    color: '#16a34a', // Forest Green
    bgGradient: 'from-green-500/10 via-green-500/5 to-transparent',
    borderColor: '#22c55e',
  },
  {
    id: 'HOSPITALITY_TOURISM',
    name: 'Hospitality, Tourism & Travel Mart',
    shortName: 'Travel & Tourism',
    tagline: 'Destination showcases, hotelier procurement & international travel buyers.',
    specialtyTool: 'Buyer Matchmaking Mart',
    highlights: ['Buyer Appointments', 'Hotel Procurement', 'Airline Networks'],
    icon: Plane,
    color: '#0891b2', // Cyan
    bgGradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
    borderColor: '#06b6d4',
  },
  {
    id: 'EDUCATION_EDTECH',
    name: 'Education, EdTech & Academic Summit',
    shortName: 'Education & EdTech',
    tagline: 'Global university pavilions, scholarship grants & STEM research labs.',
    specialtyTool: 'Scholarship Grant Radar',
    highlights: ['University Stalls', 'Scholarship Grants', 'STEM Labs'],
    icon: GraduationCap,
    color: '#7c3aed', // Violet
    bgGradient: 'from-violet-500/10 via-violet-500/5 to-transparent',
    borderColor: '#8b5cf6',
  },
  {
    id: 'FASHION_RETAIL',
    name: 'Fashion, Beauty & Luxury Retail Expo',
    shortName: 'Fashion & Beauty',
    tagline: 'Runway premieres, cosmetics OEM laboratories & luxury buyer orders.',
    specialtyTool: 'Runway Live Booking',
    highlights: ['Runway Schedules', 'Cosmetic OEM', 'Wholesale Orders'],
    icon: Crown,
    color: '#db2777', // Fuchsia
    bgGradient: 'from-fuchsia-500/10 via-fuchsia-500/5 to-transparent',
    borderColor: '#ec4899',
  },
  {
    id: 'GOVERNMENT_DIPLOMATIC',
    name: 'Government & Diplomatic Summits',
    shortName: 'Diplomatic Policy',
    tagline: 'Protocol briefings, bilateral summit schedules & delegation security.',
    specialtyTool: 'Bilateral Protocol Portal',
    highlights: ['Protocol Briefs', 'Bilateral Schedules', 'Delegation Access'],
    icon: Landmark,
    color: '#0284c7', // Sky Blue / Slate
    bgGradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
    borderColor: '#38bdf8',
  },
  {
    id: 'INCENTIVE_RETREAT',
    name: 'Corporate Incentive & Luxury Retreats',
    shortName: 'Executive Retreats',
    tagline: 'Curated excursion itineraries, gala banquets & executive wellness.',
    specialtyTool: 'Gala Seating Planner',
    highlights: ['Daily Itineraries', 'Gala Seating', 'Wellness Schedulers'],
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

      {/* Quick Category Jump Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        {onSelectCategory ? (
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer',
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all whitespace-nowrap cursor-pointer shadow-2xs"
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
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap cursor-pointer',
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

      {/* Horizontally Scrollable Category Cards Carousel with Tactile Delight */}
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
              className={cn(
                'group relative flex flex-col justify-between w-[300px] sm:w-[350px] lg:w-[370px] rounded-3xl border p-5 sm:p-6 transition-all duration-300 overflow-hidden text-left h-full snap-start shrink-0 shadow-xs',
                isActive
                  ? 'ring-2 ring-primary border-primary shadow-md bg-card'
                  : 'border-border/80 bg-card hover:border-primary/60 hover:shadow-md hover:-translate-y-0.5'
              )}
            >
              {/* Dynamic Domain Ambient Glow */}
              <div
                className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-2xl opacity-15 transition-opacity duration-300 group-hover:opacity-35 pointer-events-none"
                style={{ backgroundColor: category.color }}
              />

              <div className="relative z-10 space-y-3.5">
                {/* Header: Icon & Category Specialty Tag */}
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
                    className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap border"
                    style={{
                      backgroundColor: `${category.color}12`,
                      color: category.color,
                      borderColor: `${category.color}25`,
                    }}
                  >
                    {translatedTag}
                  </span>
                </div>

                {/* Title & Tagline */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 min-h-[2.75rem]">
                    {translatedTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {translatedDesc}
                  </p>
                </div>

                {/* Domain Specialty Tool Pill (Delight Feature) */}
                <div className="p-2 rounded-xl bg-muted/50 border border-border/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-foreground/90 font-semibold truncate">
                    <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate text-[11px]">{category.specialtyTool}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground px-1.5 py-0.5 rounded bg-card/80 shrink-0">
                    Feature
                  </span>
                </div>

                {/* Highlight Tags */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {category.highlights.slice(0, 3).map((highlight, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium text-foreground/80 bg-muted/80 px-2 py-0.5 rounded-lg whitespace-nowrap"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom CTA Arrow Strip */}
              <div className="relative z-10 pt-3.5 mt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
                <span>{tCom('viewCategory') || `Explore ${category.shortName}`}</span>
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
                className="shrink-0 text-left focus:outline-none cursor-pointer"
              >
                {cardContent}
              </button>
            );
          }

          return (
            <Link
              key={category.id}
              href={`/${locale}/events?archetype=${category.id}`}
              className="shrink-0 block focus:outline-none"
            >
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
