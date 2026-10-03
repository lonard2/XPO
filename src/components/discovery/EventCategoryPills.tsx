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
  Building2,
  Shield,
  Truck,
  Store,
  Compass,
  Trophy,
  Video,
  Layers,
  ArrowRight,
  ArrowUpRight,
  Filter,
  Check,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  ARCHETYPE_LIST,
  ARCHETYPE_METAS,
  ARCHETYPE_SUBTITLES,
  MICE_INDUSTRY_CLUSTERS,
  type MiceArchetype,
  type MiceIndustryCluster,
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
  Building2,
  Shield,
  Truck,
  Store,
  Compass,
  Trophy,
  Video,
};

export interface CategoryItem {
  id: MiceArchetype;
  name: string;
  shortName: string;
  subtitle: string;
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
    subtitle: ARCHETYPE_SUBTITLES[id] || meta.tagline,
    tagline: meta.tagline,
    ctaLabel: meta.ctaLabel,
    highlights: meta.highlights,
    icon: ICON_MAP[meta.accentIcon] || Layers,
    color: meta.color,
    bgGradient: meta.bgGradient,
    borderColor: meta.borderColor,
  };
});

const CATEGORY_MAP: Record<MiceArchetype, CategoryItem> = EVENT_CATEGORIES.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<MiceArchetype, CategoryItem>
);

const CLUSTER_IDS = ['all', ...MICE_INDUSTRY_CLUSTERS.map((c) => c.id)];

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

  const [selectedCluster, setSelectedCluster] = React.useState<string>('all');
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = CLUSTER_IDS.indexOf(selectedCluster);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % CLUSTER_IDS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + CLUSTER_IDS.length) % CLUSTER_IDS.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = CLUSTER_IDS.length - 1;
    }

    if (nextIndex !== null) {
      const nextClusterId = CLUSTER_IDS[nextIndex];
      setSelectedCluster(nextClusterId);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  const renderCategoryTile = (category: CategoryItem) => {
    const Icon = category.icon;
    const isActive = activeCategoryId === category.id;

    let translatedTitle = category.name;
    let translatedSubtitle = category.subtitle;
    try {
      if (tArch && typeof tArch.raw === 'function') {
        const obj = tArch.raw(category.id);
        if (obj?.title) translatedTitle = obj.title;
        if (obj?.subtitle) translatedSubtitle = obj.subtitle;
      }
    } catch {
      // fallback
    }

    const tileContent = (
      <div
        className={cn(
          'group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 text-left h-full min-h-[125px] sm:min-h-[135px] shadow-xs cursor-pointer',
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

          <div className="flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground/40 transition-all duration-200 group-hover:text-primary group-hover:bg-primary/5">
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        <div className="mt-2.5">
          <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
            {translatedTitle}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1 leading-normal font-normal">
            {translatedSubtitle}
          </p>
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
  };

  const getClusterGridClass = (itemCount: number) => {
    switch (itemCount) {
      case 2:
        return 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4';
      case 3:
        return 'grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4';
      case 4:
        return 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4';
      case 5:
        return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4';
      default:
        return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4';
    }
  };

  const activeClusterObj = MICE_INDUSTRY_CLUSTERS.find(
    (c) => c.id === selectedCluster
  );

  return (
    <div className={cn('w-full space-y-4 sm:space-y-6', className)}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Layers className="h-4 w-4" />
            <span>{tDisc('verticalsBadge') || '22 Specialized MICE Verticals'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
            {tDisc('verticalsTitle') || 'Explore by Event Category'}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Discover exhibitions, summits, and symposiums tailored across 6 industry sectors.
          </p>
        </div>

        <Link
          href={`/${locale}/events`}
          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 self-start sm:self-auto shrink-0 min-h-[44px] px-2 py-2 items-center"
        >
          <span>{tDisc('allArchetypes') || 'View All Categories'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Segmented Cluster Tabs (Horizontal Scrollable Thumb Zone on Mobile) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between sm:hidden">
          <span className="text-xs font-semibold text-muted-foreground">
            Industry Clusters:
          </span>
          {selectedCluster !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedCluster('all')}
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer min-h-[36px]"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Show All (22)</span>
            </button>
          )}
        </div>

        <div
          role="tablist"
          aria-label="Filter MICE categories by industry cluster"
          onKeyDown={handleTabKeyDown}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1"
        >
          <button
            ref={(el) => {
              tabRefs.current[0] = el;
            }}
            id="cluster-tab-all"
            type="button"
            role="tab"
            aria-selected={selectedCluster === 'all'}
            aria-controls="cluster-panel-all"
            tabIndex={selectedCluster === 'all' ? 0 : -1}
            onClick={() => setSelectedCluster('all')}
            className={cn(
              'min-h-[44px] min-w-[44px] px-3.5 py-2.5 rounded-xl text-xs whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              selectedCluster === 'all'
                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                : 'bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium'
            )}
          >
            <span>All Categories</span>
            <span
              className={cn(
                'text-[11px] px-1.5 py-0.2 rounded-full font-bold',
                selectedCluster === 'all'
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              22
            </span>
          </button>

          {MICE_INDUSTRY_CLUSTERS.map((cluster, idx) => {
            const isSelected = selectedCluster === cluster.id;
            return (
              <button
                key={cluster.id}
                ref={(el) => {
                  tabRefs.current[idx + 1] = el;
                }}
                id={`cluster-tab-${cluster.id}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={`cluster-panel-${cluster.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setSelectedCluster(cluster.id)}
                className={cn(
                  'min-h-[44px] min-w-[44px] px-3.5 py-2.5 rounded-xl text-xs whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  isSelected
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium'
                )}
              >
                <span>{cluster.shortLabel}</span>
                <span
                  className={cn(
                    'text-[11px] px-1.5 py-0.2 rounded-full font-bold',
                    isSelected
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {cluster.archetypes.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories View Engine: Balanced Cluster Groups */}
      {selectedCluster === 'all' ? (
        <div
          id="cluster-panel-all"
          role="tabpanel"
          aria-labelledby="cluster-tab-all"
          tabIndex={0}
          className="space-y-6 sm:space-y-8 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 rounded-2xl"
        >
          {MICE_INDUSTRY_CLUSTERS.map((cluster) => {
            const items = cluster.archetypes
              .map((arch) => CATEGORY_MAP[arch])
              .filter(Boolean);

            return (
              <div key={cluster.id} className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                      {cluster.label}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border/40">
                      {items.length} Verticals
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCluster(cluster.id)}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer min-h-[36px] px-2 flex items-center gap-1"
                  >
                    <span>Focus Cluster</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                <div className={getClusterGridClass(items.length)}>
                  {items.map((category) => renderCategoryTile(category))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        activeClusterObj && (
          <div
            id={`cluster-panel-${activeClusterObj.id}`}
            role="tabpanel"
            aria-labelledby={`cluster-tab-${activeClusterObj.id}`}
            tabIndex={0}
            className="space-y-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 rounded-2xl"
          >
            <div className="flex items-center justify-between bg-muted/40 border border-border/60 p-3 sm:p-4 rounded-xl">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  {activeClusterObj.label}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Displaying all {activeClusterObj.archetypes.length} specialized archetypes in this sector.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCluster('all')}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer min-h-[44px] px-3 py-2 flex items-center gap-1.5 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Show All (22)</span>
              </button>
            </div>

            <div className={getClusterGridClass(activeClusterObj.archetypes.length)}>
              {activeClusterObj.archetypes
                .map((arch) => CATEGORY_MAP[arch])
                .filter(Boolean)
                .map((category) => renderCategoryTile(category))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
