'use client';

import * as React from 'react';
import { X, RotateCcw, Tag, Globe, Sparkles, Calendar, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
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
    // Fallback
  }

  const activeChips: Array<{
    key: keyof FilterState;
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [];

  if (filters.keyword && filters.keyword.trim().length > 0) {
    activeChips.push({
      key: 'keyword',
      label: `${tCom('search') || 'Search'}: "${filters.keyword}"`,
      value: filters.keyword,
      icon: Tag,
    });
  }

  if (filters.region && filters.region !== 'all') {
    const regKey = filters.region.toLowerCase();
    const localizedName = tReg(`${regKey}.name`) || `${filters.region.toUpperCase()} Hub`;
    activeChips.push({
      key: 'region',
      label: localizedName,
      value: filters.region,
      icon: Globe,
    });
  }

  if (filters.city && filters.city !== 'all') {
    activeChips.push({
      key: 'city',
      label: `${tCom('location') || 'City'}: ${filters.city}`,
      value: filters.city,
      icon: Globe,
    });
  }

  if (filters.archetype && filters.archetype !== 'all') {
    const localizedArch = tArch(`${filters.archetype}.title`);
    const tokens = getArchetypeTokens(filters.archetype);
    activeChips.push({
      key: 'archetype',
      label: localizedArch || tokens.displayName,
      value: filters.archetype,
      icon: Sparkles,
    });
  }

  if (filters.format && filters.format !== 'all') {
    const fmtKey = filters.format === 'IN_PERSON' ? 'inPerson' : filters.format === 'HYBRID' ? 'hybrid' : 'virtual';
    activeChips.push({
      key: 'format',
      label: `${tDisc('format') || 'Format'}: ${tDisc(fmtKey) || filters.format.replace(/_/g, ' ')}`,
      value: filters.format,
      icon: Layers,
    });
  }

  if (filters.scale && filters.scale !== 'all') {
    activeChips.push({
      key: 'scale',
      label: `${tDisc('scale') || 'Scale'}: ${filters.scale.replace(/_/g, ' ')}`,
      value: filters.scale,
      icon: Layers,
    });
  }

  if (filters.dateRange && filters.dateRange !== 'all') {
    const dateKey = filters.dateRange === 'upcoming' ? 'upcomingExhibitions' : filters.dateRange === 'this_month' ? 'thisMonth' : 'nextMonth';
    activeChips.push({
      key: 'dateRange',
      label: tDisc(dateKey) || filters.dateRange,
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
        {tDisc('activeFilters') || 'Active Filters'} ({activeChips.length}):
      </span>

      {activeChips.map((chip) => {
        const Icon = chip.icon;
        return (
          <span
            key={chip.key}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary shadow-xs transition-colors hover:bg-primary/15"
          >
            <Icon className="h-3 w-3 shrink-0" />
            <span className="max-w-[160px] truncate">{chip.label}</span>
            <button
              type="button"
              onClick={() => onRemoveFilter(chip.key)}
              className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors focus:outline-none cursor-pointer"
              aria-label={`Remove filter: ${chip.label}`}
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
        className="h-6 px-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
      >
        <RotateCcw className="h-3 w-3" />
        <span>{tDisc('clearAll') || tDisc('clearFilters') || 'Clear All'}</span>
      </Button>
    </div>
  );
}
