'use client';

import * as React from 'react';
import {
  Globe,
  Layers,
  Calendar,
  RotateCcw,
  SlidersHorizontal,
  Briefcase,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { ALL_MICE_ARCHETYPES, ARCHETYPE_DEFAULTS, type MiceArchetype } from '@/lib/theming';
import { type FilterState } from '@/types/discovery';
import { cn } from '@/lib/utils';

export interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  availableCities?: string[];
  counts?: {
    archetypes?: Record<string, number>;
    regions?: Record<string, number>;
    formats?: Record<string, number>;
    scales?: Record<string, number>;
  };
  className?: string;
}

export const MICE_INDUSTRY_CLUSTERS: Array<{
  id: string;
  label: string;
  archetypes: MiceArchetype[];
}> = [
  {
    id: 'tech_science_policy',
    label: 'Digital, Science & Governance',
    archetypes: [
      'TECH_DEV_SUMMIT',
      'MEDICAL_SYMPOSIUM',
      'GOVERNMENT_DIPLOMATIC',
      'EDUCATION_EDTECH',
    ],
  },
  {
    id: 'industry_infrastructure',
    label: 'Heavy Industry & Mobility',
    archetypes: [
      'INDUSTRIAL_B2B',
      'AUTOMOTIVE_MOBILITY',
      'ENERGY_INFRASTRUCTURE',
      'AGRITECH_FOOD',
    ],
  },
  {
    id: 'finance_trade_enterprise',
    label: 'Finance, Trade & Enterprise',
    archetypes: [
      'FINANCE_INVESTOR',
      'HOSPITALITY_TOURISM',
      'INCENTIVE_RETREAT',
    ],
  },
  {
    id: 'consumer_culture_lifestyle',
    label: 'Culture, Lifestyle & Festivals',
    archetypes: [
      'POP_CULTURE_GAMING',
      'MUSIC_FESTIVAL',
      'MEGA_EXPO_PAVILION',
      'FASHION_RETAIL',
    ],
  },
];

export function FilterSidebar({
  filters,
  onChange,
  onReset,
  availableCities = [],
  counts,
  className,
}: FilterSidebarProps) {
  let tDisc: any = (k: string) => k;
  let tReg: any = (k: string) => k;
  let tArch: any = (k: string) => k;
  let tCom: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tDisc = useTranslations('discovery');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tReg = useTranslations('regions');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tArch = useTranslations('archetypes');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tCom = useTranslations('common');
  } catch {
    // Fallback if rendered outside provider in tests
  }

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const selectedArchetypes = React.useMemo(() => {
    if (!filters.archetype || filters.archetype === 'all') return [];
    return filters.archetype.split(',').map((s) => s.trim().toUpperCase());
  }, [filters.archetype]);

  const handleToggleArchetype = (archKey: string) => {
    if (archKey === 'all') {
      handleFilterChange('archetype', 'all');
      return;
    }
    const current = new Set(selectedArchetypes);
    if (current.has(archKey.toUpperCase())) {
      current.delete(archKey.toUpperCase());
    } else {
      current.add(archKey.toUpperCase());
    }
    if (current.size === 0) {
      handleFilterChange('archetype', 'all');
    } else {
      handleFilterChange('archetype', Array.from(current).join(','));
    }
  };

  const getRegionAllLabel = () => {
    const val = tReg('all');
    if (!val || val === 'regions.all' || val === 'all') {
      return 'All Regional Hubs';
    }
    return val;
  };

  const regionalHubs = [
    { id: 'all', label: getRegionAllLabel(), code: 'ALL' },
    { id: 'id', label: tReg('id.name') ? `${tReg('id.name')} (JIExpo, ICE)` : 'Indonesia Hub (JIExpo, ICE BSD)', code: 'ID' },
    { id: 'jp', label: tReg('jp.name') ? `${tReg('jp.name')} (Tokyo Big Sight)` : 'Japan Hub (Tokyo Big Sight)', code: 'JP' },
    { id: 'global', label: tReg('global.name') ? `${tReg('global.name')} (MBS, Frankfurt)` : 'Global Hubs (MBS, Frankfurt)', code: 'GL' },
  ];

  const formatOptions: Array<{ id: string; label: string }> = [
    { id: 'all', label: tDisc('allFormats') || 'All Formats' },
    { id: 'IN_PERSON', label: tDisc('inPerson') || 'In-Person' },
    { id: 'HYBRID', label: tDisc('hybrid') || 'Hybrid' },
    { id: 'VIRTUAL', label: tDisc('virtual') || 'Virtual' },
  ];

  const scaleOptions: Array<{ id: string; label: string }> = [
    { id: 'all', label: tDisc('allScales') || 'All Event Scales' },
    { id: 'GLOBAL_MEGA', label: 'Global Mega (>25k)' },
    { id: 'LARGE', label: 'Large Convention (5k-25k)' },
    { id: 'MEDIUM', label: 'Medium Expo (1k-5k)' },
    { id: 'EXECUTIVE', label: 'Executive Summit (<1k)' },
  ];

  const dateOptions = [
    { id: 'all', label: tDisc('allDates') || 'All Dates' },
    { id: 'upcoming', label: tDisc('upcomingExhibitions') || 'Upcoming Exhibitions' },
    { id: 'this_month', label: tDisc('thisMonth') || 'This Month' },
    { id: 'next_month', label: tDisc('nextMonth') || 'Next Month' },
  ];

  const hasActiveFilters =
    filters.region !== 'all' ||
    filters.archetype !== 'all' ||
    filters.format !== 'all' ||
    filters.scale !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.city !== 'all' ||
    (filters.keyword && filters.keyword.trim().length > 0);

  return (
    <div className={cn('space-y-6', className)} aria-label="Faceted Filter Controls">
      {/* Header with Title and Reset */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>{tDisc('filterEvents') || 'Filter Events'}</span>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{tCom('clear') || 'Reset'}</span>
          </Button>
        )}
      </div>

      {/* 1. Regional Localization Hub Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-primary" />
          <span>{tDisc('regionalHub') || tDisc('filterByRegion') || 'Regional Hub'}</span>
        </label>
        <div className="space-y-1">
          {regionalHubs.map((hub) => {
            const isSelected = filters.region === hub.id;
            const count = counts?.regions?.[hub.id];
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => handleFilterChange('region', hub.id)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer',
                  isSelected
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-3.5 w-3.5 rounded-full border flex items-center justify-center transition-colors',
                      isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40'
                    )}
                  >
                    {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </div>
                  <span>{hub.label}</span>
                </div>
                {count !== undefined && (
                  <span className="text-[10px] text-muted-foreground font-mono">({count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MICE Category Archetype Filter (Grouped into 4 Industry Clusters) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-primary" />
            <span>{tDisc('verticalsTitle') || tDisc('filterByArchetype') || 'Explore by Event Category'}</span>
          </label>
          {selectedArchetypes.length > 0 && (
            <span className="text-[10px] text-primary font-semibold font-mono">
              {selectedArchetypes.length} selected
            </span>
          )}
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {/* All Categories Pill */}
          <button
            type="button"
            onClick={() => handleToggleArchetype('all')}
            className={cn(
              'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer',
              selectedArchetypes.length === 0
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-3.5 w-3.5 rounded-md border flex items-center justify-center',
                  selectedArchetypes.length === 0 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40'
                )}
              >
                {selectedArchetypes.length === 0 && <Check className="h-2.5 w-2.5 stroke-[3]" />}
              </div>
              <span>{tDisc('allArchetypes') || 'All MICE Categories'}</span>
            </div>
          </button>

          {/* 4 Industry Clusters */}
          {MICE_INDUSTRY_CLUSTERS.map((cluster) => (
            <div key={cluster.id} className="space-y-1 pt-1 border-t border-border/50">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 block">
                {cluster.label}
              </span>
              {cluster.archetypes.map((archKey) => {
                const item = ARCHETYPE_DEFAULTS[archKey] || {
                  primary: '#2563eb',
                  displayName: archKey.replace(/_/g, ' '),
                };
                const isSelected = selectedArchetypes.includes(archKey);
                const count = counts?.archetypes?.[archKey];

                return (
                  <button
                    key={archKey}
                    type="button"
                    onClick={() => handleToggleArchetype(archKey)}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer',
                      isSelected
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          'h-3.5 w-3.5 rounded-md border flex items-center justify-center shrink-0 transition-colors',
                          isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40'
                        )}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.primary }}
                      />
                      <span className="truncate">
                        {tArch(`${archKey}.title`) && tArch(`${archKey}.title`) !== `${archKey}.title`
                          ? tArch(`${archKey}.title`)
                          : item.displayName}
                      </span>
                    </div>
                    {count !== undefined && (
                      <span className="text-[10px] text-muted-foreground font-mono ml-1 shrink-0">({count})</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Event Format Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span>{tDisc('format') || tDisc('filterByFormat') || 'Format'}</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {formatOptions.map((fmt) => {
            const isSelected = filters.format === fmt.id;
            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => handleFilterChange('format', fmt.id)}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border/60 bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {fmt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Event Scale Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span>{tDisc('scale') || tDisc('filterByScale') || 'Exhibition Scale'}</span>
        </label>
        <div className="space-y-1">
          {scaleOptions.map((sc) => {
            const isSelected = filters.scale === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleFilterChange('scale', sc.id)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer',
                  isSelected
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <span>{sc.label}</span>
                {isSelected && <Check className="h-3 w-3 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Timeline Date Range Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span>{tDisc('timeline') || tDisc('dateRange') || 'Timeline'}</span>
        </label>
        <div className="space-y-1">
          {dateOptions.map((dt) => {
            const isSelected = filters.dateRange === dt.id;
            return (
              <button
                key={dt.id}
                type="button"
                onClick={() => handleFilterChange('dateRange', dt.id)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer',
                  isSelected
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <span>{dt.label}</span>
                {isSelected && <Check className="h-3 w-3 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
