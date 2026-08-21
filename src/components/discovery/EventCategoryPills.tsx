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
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CategoryItem {
  id: string;
  name: string;
  shortName: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgLight: string;
  bgDark: string;
  borderColor: string;
}

export const EVENT_CATEGORIES: CategoryItem[] = [
  {
    id: 'INDUSTRIAL_B2B',
    name: 'Industrial & B2B Trade',
    shortName: 'Industrial B2B',
    icon: Factory,
    color: '#0284c7', // Sky blue
    bgLight: '#f0f9ff',
    bgDark: '#082f49',
    borderColor: '#7dd3fc',
  },
  {
    id: 'TECH_DEV_SUMMIT',
    name: 'Tech, AI & Developer',
    shortName: 'Tech & AI',
    icon: Cpu,
    color: '#6366f1', // Indigo
    bgLight: '#eef2ff',
    bgDark: '#1e1b4b',
    borderColor: '#a5b4fc',
  },
  {
    id: 'MEDICAL_SYMPOSIUM',
    name: 'Medical & Healthcare',
    shortName: 'Medical & Health',
    icon: Activity,
    color: '#0d9488', // Teal
    bgLight: '#f0fdfa',
    bgDark: '#134e4a',
    borderColor: '#5eead4',
  },
  {
    id: 'FINANCE_INVESTOR',
    name: 'Finance & FinTech',
    shortName: 'Finance & Deals',
    icon: TrendingUp,
    color: '#059669', // Emerald
    bgLight: '#ecfdf5',
    bgDark: '#064e3b',
    borderColor: '#6ee7b7',
  },
  {
    id: 'POP_CULTURE_GAMING',
    name: 'Gaming & Pop Culture',
    shortName: 'Gaming & Anime',
    icon: Gamepad2,
    color: '#e11d48', // Rose
    bgLight: '#fff1f2',
    bgDark: '#4c0519',
    borderColor: '#fda4af',
  },
  {
    id: 'MUSIC_FESTIVAL',
    name: 'Concerts & Festivals',
    shortName: 'Music & Shows',
    icon: Music,
    color: '#9333ea', // Purple
    bgLight: '#faf5ff',
    bgDark: '#3b0764',
    borderColor: '#d8b4fe',
  },
  {
    id: 'MEGA_EXPO_PAVILION',
    name: 'Mega Expos & Fairs',
    shortName: 'Mega Expos (PRJ)',
    icon: Tent,
    color: '#ea580c', // Orange
    bgLight: '#fff7ed',
    bgDark: '#431407',
    borderColor: '#fdba74',
  },
  {
    id: 'GOVERNMENT_DIPLOMATIC',
    name: 'Government & Policy',
    shortName: 'Diplomatic Summits',
    icon: Landmark,
    color: '#475569', // Slate
    bgLight: '#f8fafc',
    bgDark: '#0f172a',
    borderColor: '#94a3b8',
  },
  {
    id: 'INCENTIVE_RETREAT',
    name: 'Luxury & Retreats',
    shortName: 'Corporate Retreats',
    icon: Palmtree,
    color: '#d97706', // Amber
    bgLight: '#fffbeb',
    bgDark: '#451a03',
    borderColor: '#fcd34d',
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
    <div className={cn('w-full space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
          <Layers className="h-4 w-4" />
          <span>Explore by Event Category</span>
        </div>

        <Link
          href={`/${locale}/events`}
          className="text-xs font-medium text-primary hover:underline"
        >
          View all categories
        </Link>
      </div>

      {/* Horizontal Scroll / Multi-Row Grid */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x -mx-1 px-1">
        {EVENT_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategoryId === category.id;

          const content = (
            <button
              key={category.id}
              onClick={() => onSelectCategory?.(category.id)}
              type="button"
              className={cn(
                'group flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 snap-start border shrink-0',
                isActive
                  ? 'ring-2 ring-offset-2 ring-primary shadow-md'
                  : 'bg-card hover:bg-accent/70 hover:shadow-xs border-border/80 text-foreground'
              )}
              style={
                isActive
                  ? {
                      backgroundColor: category.color,
                      color: '#ffffff',
                      borderColor: category.color,
                    }
                  : {}
              }
            >
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-lg transition-transform group-hover:scale-110',
                  isActive ? 'bg-white/20' : 'bg-muted'
                )}
                style={!isActive ? { color: category.color } : { color: '#ffffff' }}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
              </div>

              <span>{category.name}</span>
            </button>
          );

          if (!onSelectCategory) {
            return (
              <Link
                key={category.id}
                href={`/${locale}/events?archetype=${category.id}`}
                className="shrink-0"
              >
                {content}
              </Link>
            );
          }

          return content;
        })}
      </div>
    </div>
  );
}
