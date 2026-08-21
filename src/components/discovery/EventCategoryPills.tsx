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
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export interface CategoryItem {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
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
    tagline: 'Heavy machinery, precision automation, B2B procurement & RFQ quote matchmaking.',
    highlights: ['Machinery Specs', 'RFQ Quotes', 'Exhibitor Booths'],
    icon: Factory,
    color: '#0284c7', // Sky blue
    bgGradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
    borderColor: '#38bdf8',
  },
  {
    id: 'TECH_DEV_SUMMIT',
    name: 'Tech, AI & Developer Summits',
    shortName: 'Tech & AI',
    tagline: 'Autonomous AI agents, cloud architectures, live code teardowns & 24hr hackathons.',
    highlights: ['Multi-Track Agendas', 'GitHub Tags', 'Livestream Streams'],
    icon: Cpu,
    color: '#6366f1', // Indigo
    bgGradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
    borderColor: '#818cf8',
  },
  {
    id: 'MEDICAL_SYMPOSIUM',
    name: 'Medical & Healthcare Congress',
    shortName: 'Medical & Health',
    tagline: 'Peer-reviewed research abstracts, clinical trials, CME credits & surgical showcases.',
    highlights: ['Abstract Readers', 'CME Credits', 'Accredited Badges'],
    icon: Activity,
    color: '#0d9488', // Teal
    bgGradient: 'from-teal-500/10 via-teal-500/5 to-transparent',
    borderColor: '#2dd4bf',
  },
  {
    id: 'FINANCE_INVESTOR',
    name: 'Finance, FinTech & VC Forums',
    shortName: 'Finance & Deals',
    tagline: 'Executive deal-rooms, startup pitch decks, sovereign funds & private equity lounges.',
    highlights: ['Deal-Room Booking', 'Pitch Decks', 'VIP Investor Passes'],
    icon: TrendingUp,
    color: '#059669', // Emerald
    bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    borderColor: '#34d399',
  },
  {
    id: 'POP_CULTURE_GAMING',
    name: 'Pop Culture, Gaming & Comic Con',
    shortName: 'Gaming & Anime',
    tagline: 'Esports arenas, cosplay catwalks, artist alleys, creator meetups & exclusive merch.',
    highlights: ['Cosplay Rules', 'Creator Alley', 'Merchandise Wishlist'],
    icon: Gamepad2,
    color: '#e11d48', // Rose
    bgGradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
    borderColor: '#fb7185',
  },
  {
    id: 'MUSIC_FESTIVAL',
    name: 'Music Festivals & Arena Concerts',
    shortName: 'Music & Shows',
    tagline: 'Multi-stage real-time timelines, live crowd-density meters & wristband gates.',
    highlights: ['Stage Timelines', 'Crowd Meters', 'Gate Access Guides'],
    icon: Music,
    color: '#9333ea', // Purple
    bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
    borderColor: '#c084fc',
  },
  {
    id: 'MEGA_EXPO_PAVILION',
    name: 'Mega Expos & Multi-Pavilion Fairs',
    shortName: 'Mega Expos (PRJ)',
    tagline: 'Multi-hectare public expositions (e.g. Jakarta Fair), night fireworks & 500+ tenants.',
    highlights: ['Pavilion Maps', 'Fireworks Schedules', 'Tenant Promo Radar'],
    icon: Tent,
    color: '#ea580c', // Orange
    bgGradient: 'from-orange-500/10 via-orange-500/5 to-transparent',
    borderColor: '#fb923c',
  },
  {
    id: 'GOVERNMENT_DIPLOMATIC',
    name: 'Government & Diplomatic Summits',
    shortName: 'Diplomatic Policy',
    tagline: 'Inter-governmental protocol briefings, bilateral schedules & delegation lounges.',
    highlights: ['Protocol Briefs', 'Bilateral Schedules', 'Delegation Access'],
    icon: Landmark,
    color: '#475569', // Slate
    bgGradient: 'from-slate-500/10 via-slate-500/5 to-transparent',
    borderColor: '#94a3b8',
  },
  {
    id: 'INCENTIVE_RETREAT',
    name: 'Incentives & Luxury Retreats',
    shortName: 'Executive Retreats',
    tagline: 'Curated excursion itineraries, gala dinner seating charts & executive wellness.',
    highlights: ['Daily Itineraries', 'Gala Table Seating', 'Wellness Schedulers'],
    icon: Palmtree,
    color: '#d97706', // Amber
    bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    borderColor: '#fbbf24',
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
  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Layers className="h-4 w-4" />
            <span>9 Specialized MICE Verticals</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
            Explore by Event Category
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Discover domain-tailored exhibition layouts, bespoke agendas, and dedicated deal-rooms.
          </p>
        </div>

        <Link href={`/${locale}/events`}>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
            <span>Browse All Categories</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

      {/* Large, Rich & Engaging Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {EVENT_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategoryId === category.id;

          const cardBody = (
            <div
              className={cn(
                'group relative flex flex-col justify-between rounded-2xl border p-5 sm:p-6 transition-all duration-300 overflow-hidden text-left h-full',
                isActive
                  ? 'ring-2 ring-primary border-primary shadow-lg bg-card'
                  : 'border-border/80 bg-card hover:border-primary/50 hover:shadow-md hover:-translate-y-1'
              )}
            >
              {/* Ambient Glow Background */}
              <div
                className={cn(
                  'absolute -top-12 -right-12 h-36 w-36 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40 pointer-events-none',
                  `bg-gradient-to-br ${category.bgGradient}`
                )}
                style={{ backgroundColor: category.color }}
              />

              <div className="relative z-10 space-y-4">
                {/* Header: Icon & Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 shadow-xs"
                    style={{
                      backgroundColor: `${category.color}15`,
                      color: category.color,
                      border: `1px solid ${category.color}30`,
                    }}
                  >
                    <Icon className="h-6 w-6 stroke-[2.2]" />
                  </div>

                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: `${category.color}15`,
                      color: category.color,
                    }}
                  >
                    {category.shortName}
                  </span>
                </div>

                {/* Title & Tagline */}
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-extrabold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {category.tagline}
                  </p>
                </div>

                {/* Highlight Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {category.highlights.map((highlight, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium text-foreground/80 bg-muted/70 px-2 py-0.5 rounded-md"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom CTA Arrow */}
              <div className="relative z-10 pt-4 mt-2 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary">
                <span>View {category.shortName} Expos</span>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
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
                className="w-full text-left"
              >
                {cardBody}
              </button>
            );
          }

          return (
            <Link
              key={category.id}
              href={`/${locale}/events?archetype=${category.id}`}
              className="block h-full"
            >
              {cardBody}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
