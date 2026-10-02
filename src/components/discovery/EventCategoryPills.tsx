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
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  ARCHETYPE_LIST,
  ARCHETYPE_METAS,
  MiceArchetype,
} from '@/lib/theming';
import { cn } from '@/lib/utils';

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
};

export interface CategoryItem {
  id: MiceArchetype;
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

export const EVENT_CATEGORIES: CategoryItem[] = ARCHETYPE_LIST.map((id) => {
  const meta = ARCHETYPE_METAS[id];
  return {
    id,
    name: meta.label,
    shortName: meta.shortName,
    tagline: meta.tagline,
    ctaLabel: meta.ctaLabel,
    highlights: meta.highlights,
    icon: ICON_MAP[meta.accentIcon] || Layers,
    color: meta.color,
    bgGradient: meta.bgGradient,
    borderColor: meta.borderColor,
  };
});

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
  const tArch = useTranslations('archetypes');
  const tDisc = useTranslations('discovery');

  return (
    <div className={cn('w-full space-y-4 sm:space-y-6', className)}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Layers className="h-4 w-4" />
            <span>{tDisc('verticalsBadge') || '15 Specialized MICE Verticals'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
            {tDisc('verticalsTitle') || 'Explore by Event Category'}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Discover exhibitions, summits, and symposiums tailored to industry sectors.
          </p>
        </div>

        <Link
          href={`/${locale}/events`}
          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 self-start sm:self-auto shrink-0 min-h-[36px] items-center"
        >
          <span>{tDisc('allArchetypes') || 'View All Categories'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Distilled 5-Column Responsive Matrix */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
        role="region"
        aria-label="MICE Event Categories Matrix"
      >
        {EVENT_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategoryId === category.id;

          let translatedTitle = category.name;
          let translatedTag = category.shortName;
          try {
            if (tArch && typeof tArch.raw === 'function') {
              const obj = tArch.raw(category.id);
              if (obj?.title) translatedTitle = obj.title;
              if (obj?.tag) translatedTag = obj.tag;
            }
          } catch {
            // fallback
          }

          const tileContent = (
            <div
              className={cn(
                'group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 text-left h-full min-h-[110px] sm:min-h-[120px] shadow-xs cursor-pointer',
                isActive
                  ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-sm'
                  : 'border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30 hover:shadow-sm'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105"
                  style={{
                    backgroundColor: `${category.color}15`,
                    color: category.color,
                    border: `1px solid ${category.color}30`,
                  }}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.2]" />
                </div>

                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide line-clamp-1 text-right">
                  {translatedTag}
                </span>
              </div>

              <div className="mt-2.5">
                <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                  {translatedTitle}
                </h3>
              </div>
            </div>
          );

          if (onSelectCategory) {
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(category.id)}
                className="w-full text-left focus:outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
                aria-pressed={isActive}
              >
                {tileContent}
              </button>
            );
          }

          return (
            <Link
              key={category.id}
              href={`/${locale}/events?archetype=${category.id}`}
              className="w-full block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
            >
              {tileContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
