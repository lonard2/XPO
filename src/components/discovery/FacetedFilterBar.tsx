'use client';

import * as React from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Globe,
  Layers,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ActiveFilterChips } from '@/components/discovery/ActiveFilterChips';
import { ALL_MICE_ARCHETYPES, ARCHETYPE_DEFAULTS } from '@/lib/theming';
import { type FilterState } from '@/types/discovery';
import { cn } from '@/lib/utils';

export interface FacetedFilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  totalResults: number;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onOpenMobileFilters: () => void;
  className?: string;
}

export function FacetedFilterBar({
  filters,
  onChange,
  onReset,
  totalResults,
  sortBy,
  onSortChange,
  onOpenMobileFilters,
  className,
}: FacetedFilterBarProps) {
  const [searchTerm, setSearchTerm] = React.useState(filters.keyword);

  // Synchronize local search term if filters are cleared from outside
  React.useEffect(() => {
    setSearchTerm(filters.keyword);
  }, [filters.keyword]);

  // Debounce search input changes by 300ms
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== filters.keyword) {
        onChange({
          ...filters,
          keyword: searchTerm,
        });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, filters, onChange]);

  const handleClearSearch = () => {
    setSearchTerm('');
    onChange({
      ...filters,
      keyword: '',
    });
  };

  const handleRemoveChip = (key: keyof FilterState) => {
    if (key === 'keyword') {
      setSearchTerm('');
    }
    onChange({
      ...filters,
      [key]: key === 'keyword' ? '' : 'all',
    });
  };

  const activeFilterCount =
    (filters.keyword.trim() ? 1 : 0) +
    (filters.region !== 'all' ? 1 : 0) +
    (filters.city !== 'all' ? 1 : 0) +
    (filters.archetype !== 'all' ? 1 : 0) +
    (filters.format !== 'all' ? 1 : 0) +
    (filters.scale !== 'all' ? 1 : 0) +
    (filters.dateRange !== 'all' ? 1 : 0);

  return (
    <div className={cn('space-y-3', className)} aria-label="Search and filter toolbar">
      {/* Top Search and Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exhibitions by title, keyword, city, or venue..."
            className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-9 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
            aria-label="Search events"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Clear search query"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Quick Hub Selector (Desktop Only) */}
        <div className="hidden lg:flex items-center gap-2">
          <select
            value={filters.region}
            onChange={(e) => onChange({ ...filters, region: e.target.value })}
            className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs cursor-pointer"
            aria-label="Select Region Hub"
          >
            <option value="all">All Regional Hubs</option>
            <option value="id">Indonesia Hub (ID)</option>
            <option value="jp">Japan Hub (JP)</option>
            <option value="global">Global Gateways (GL)</option>
          </select>

          <select
            value={filters.archetype}
            onChange={(e) => onChange({ ...filters, archetype: e.target.value })}
            className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs cursor-pointer max-w-[180px]"
            aria-label="Select MICE Category"
          >
            <option value="all">All Categories</option>
            {ALL_MICE_ARCHETYPES.map((arch) => (
              <option key={arch} value={arch}>
                {ARCHETYPE_DEFAULTS[arch].displayName}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Selector & Mobile Filter Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="h-10 w-full sm:w-auto rounded-xl border border-border bg-card pl-3 pr-8 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs cursor-pointer"
              aria-label="Sort events"
            >
              <option value="date_asc">Date: Upcoming First</option>
              <option value="date_desc">Date: Latest First</option>
              <option value="featured">Featured Priority</option>
              <option value="title_asc">Name: A to Z</option>
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Mobile Filter Toggle Drawer Button */}
          <Button
            variant="outline"
            onClick={onOpenMobileFilters}
            className="lg:hidden h-10 gap-2 px-3 text-xs font-semibold shrink-0"
            aria-label="Open filter sidebar drawer"
          >
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Active Filter Chips & Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
        <ActiveFilterChips
          filters={filters}
          onRemoveFilter={handleRemoveChip}
          onClearAll={onReset}
        />

        <span className="text-xs text-muted-foreground sm:ml-auto whitespace-nowrap">
          Showing <strong className="text-foreground font-semibold">{totalResults}</strong> {totalResults === 1 ? 'exhibition' : 'exhibitions'}
        </span>
      </div>
    </div>
  );
}
