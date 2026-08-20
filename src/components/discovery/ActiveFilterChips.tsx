'use client';

import * as React from 'react';
import { X, RotateCcw, Tag, Globe, Sparkles, Calendar, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getArchetypeTokens } from '@/lib/theming';
import { type FilterState } from '@/types/discovery';
import { cn } from '@/lib/utils';

export interface ActiveFilterChipsProps {
  filters: FilterState;
  onRemoveFilter: (key: keyof FilterState) => void;
  onClearAll: () => void;
  className?: string;
}

export function ActiveFilterChips({
  filters,
  onRemoveFilter,
  onClearAll,
  className,
}: ActiveFilterChipsProps) {
  const activeChips: Array<{
    key: keyof FilterState;
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [];

  if (filters.keyword && filters.keyword.trim().length > 0) {
    activeChips.push({
      key: 'keyword',
      label: `Search: "${filters.keyword}"`,
      value: filters.keyword,
      icon: Tag,
    });
  }

  if (filters.region && filters.region !== 'all') {
    const regionNames: Record<string, string> = {
      id: 'Indonesia Hub',
      jp: 'Japan Hub',
      global: 'Global Hubs',
    };
    activeChips.push({
      key: 'region',
      label: regionNames[filters.region.toLowerCase()] || `Region: ${filters.region}`,
      value: filters.region,
      icon: Globe,
    });
  }

  if (filters.city && filters.city !== 'all') {
    activeChips.push({
      key: 'city',
      label: `City: ${filters.city}`,
      value: filters.city,
      icon: Globe,
    });
  }

  if (filters.archetype && filters.archetype !== 'all') {
    const tokens = getArchetypeTokens(filters.archetype);
    activeChips.push({
      key: 'archetype',
      label: tokens.displayName,
      value: filters.archetype,
      icon: Sparkles,
    });
  }

  if (filters.format && filters.format !== 'all') {
    activeChips.push({
      key: 'format',
      label: `Format: ${filters.format.replace(/_/g, ' ')}`,
      value: filters.format,
      icon: Layers,
    });
  }

  if (filters.scale && filters.scale !== 'all') {
    activeChips.push({
      key: 'scale',
      label: `Scale: ${filters.scale.replace(/_/g, ' ')}`,
      value: filters.scale,
      icon: Layers,
    });
  }

  if (filters.dateRange && filters.dateRange !== 'all') {
    const dateLabels: Record<string, string> = {
      upcoming: 'Upcoming Events',
      this_month: 'This Month',
      next_month: 'Next Month',
    };
    activeChips.push({
      key: 'dateRange',
      label: dateLabels[filters.dateRange] || filters.dateRange,
      value: filters.dateRange,
      icon: Calendar,
    });
  }

  if (activeChips.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2 pt-1', className)} aria-label="Active filters">
      <span className="text-xs font-semibold text-muted-foreground">
        Active Filters ({activeChips.length}):
      </span>

      {activeChips.map((chip) => {
        const Icon = chip.icon;
        return (
          <span
            key={chip.key}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary shadow-xs transition-colors hover:bg-primary/15"
          >
            <Icon className="h-3 w-3 shrink-0" />
            <span>{chip.label}</span>
            <button
              type="button"
              onClick={() => onRemoveFilter(chip.key)}
              className="rounded-full p-0.5 text-primary/70 hover:bg-primary/20 hover:text-primary transition-colors"
              aria-label={`Remove filter ${chip.label}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
      >
        <RotateCcw className="h-3 w-3" />
        <span>Clear All</span>
      </Button>
    </div>
  );
}
