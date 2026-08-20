'use client';

import * as React from 'react';
import {
  Sparkles,
  Globe,
  Layers,
  Calendar,
  RotateCcw,
  SlidersHorizontal,
  MapPin,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ALL_MICE_ARCHETYPES, ARCHETYPE_DEFAULTS } from '@/lib/theming';
import { type FilterState, type EventFormat, type EventScale } from '@/types/discovery';
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

export function FilterSidebar({
  filters,
  onChange,
  onReset,
  availableCities = [],
  counts,
  className,
}: FilterSidebarProps) {
  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const regionalHubs = [
    { id: 'all', label: 'All Regional Hubs', code: 'ALL' },
    { id: 'id', label: 'Indonesia Hub (JIExpo, ICE BSD)', code: 'ID' },
    { id: 'jp', label: 'Japan Hub (Tokyo Big Sight)', code: 'JP' },
    { id: 'global', label: 'Global Hubs (MBS, Frankfurt)', code: 'GL' },
  ];

  const formatOptions: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Formats' },
    { id: 'IN_PERSON', label: 'In-Person' },
    { id: 'HYBRID', label: 'Hybrid' },
    { id: 'VIRTUAL', label: 'Virtual' },
  ];

  const scaleOptions: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Event Scales' },
    { id: 'GLOBAL_MEGA', label: 'Global Mega (>25k Pax)' },
    { id: 'LARGE', label: 'Large Convention (5k-25k)' },
    { id: 'MEDIUM', label: 'Medium Expo (1k-5k)' },
    { id: 'EXECUTIVE', label: 'Executive Summit (<1k)' },
  ];

  const dateOptions = [
    { id: 'all', label: 'All Dates' },
    { id: 'upcoming', label: 'Upcoming Exhibitions' },
    { id: 'this_month', label: 'This Month' },
    { id: 'next_month', label: 'Next Month' },
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
          <span>Filter Events</span>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* 1. Regional Hub Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-primary" />
          <span>Regional Hub</span>
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
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left',
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

      {/* 2. MICE Category Archetype Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>MICE Archetype (9 Domains)</span>
        </label>
        <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => handleFilterChange('archetype', 'all')}
            className={cn(
              'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left',
              filters.archetype === 'all'
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-3.5 w-3.5 rounded-full border flex items-center justify-center',
                  filters.archetype === 'all' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40'
                )}
              >
                {filters.archetype === 'all' && <Check className="h-2.5 w-2.5 stroke-[3]" />}
              </div>
              <span>All MICE Categories</span>
            </div>
          </button>

          {ALL_MICE_ARCHETYPES.map((archKey) => {
            const item = ARCHETYPE_DEFAULTS[archKey];
            const isSelected = filters.archetype === archKey;
            const count = counts?.archetypes?.[archKey];

            return (
              <button
                key={archKey}
                type="button"
                onClick={() => handleFilterChange('archetype', archKey)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left',
                  isSelected
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.primary }}
                  />
                  <span className="truncate">{item.displayName}</span>
                </div>
                {count !== undefined && (
                  <span className="text-[10px] text-muted-foreground font-mono ml-1">({count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Event Format Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span>Format</span>
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
                  'px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-colors',
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
          <span>Exhibition Scale</span>
        </label>
        <div className="space-y-1">
          {scaleOptions.map((scl) => {
            const isSelected = filters.scale === scl.id;
            return (
              <button
                key={scl.id}
                type="button"
                onClick={() => handleFilterChange('scale', scl.id)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left',
                  isSelected
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <span>{scl.label}</span>
                {isSelected && <Check className="h-3 w-3 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Date Range Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          <span>Timeline</span>
        </label>
        <div className="space-y-1">
          {dateOptions.map((dateOpt) => {
            const isSelected = filters.dateRange === dateOpt.id;
            return (
              <button
                key={dateOpt.id}
                type="button"
                onClick={() => handleFilterChange('dateRange', dateOpt.id)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left',
                  isSelected
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <span>{dateOpt.label}</span>
                {isSelected && <Check className="h-3 w-3 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
