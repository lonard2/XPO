'use client';

import * as React from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { ActiveFilterChips } from '@/components/discovery/ActiveFilterChips';
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
  let tDisc: any = (k: string) => k;
  let tCom: any = (k: string) => k;
  let tEvents: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tDisc = useTranslations('discovery');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tCom = useTranslations('common');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tEvents = useTranslations('events');
  } catch {
    // Fallback if rendered outside provider in tests
  }

  const [searchTerm, setSearchTerm] = React.useState(filters.keyword);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

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

  // Global '/' keyboard accelerator to focus search input
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'SELECT'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClearSearch = () => {
    setSearchTerm('');
    onChange({
      ...filters,
      keyword: '',
    });
  };

  const handleRemoveChip = (key: keyof FilterState, valueToRemove?: string) => {
    if (key === 'keyword') {
      setSearchTerm('');
      onChange({
        ...filters,
        keyword: '',
      });
      return;
    }

    if (key === 'archetype' && valueToRemove && filters.archetype !== 'all') {
      const remaining = filters.archetype
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.toUpperCase() !== valueToRemove.toUpperCase());
      onChange({
        ...filters,
        archetype: remaining.length > 0 ? remaining.join(',') : 'all',
      });
      return;
    }

    onChange({
      ...filters,
      [key]: 'all',
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
      {/* Top Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input with Keyboard Shortcut */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={tDisc('searchPlaceholder') || 'Search exhibitions by title, keyword, city, or venue...'}
            className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-16 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
            aria-label="Search events"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center">
              <kbd className="rounded border border-border bg-muted/70 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                /
              </kbd>
            </div>
          )}
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
              <option value="date_asc">{tEvents('sortUpcoming') || 'Date: Upcoming First'}</option>
              <option value="date_desc">{tEvents('sortLatest') || 'Date: Latest First'}</option>
              <option value="featured">{tEvents('sortFeatured') || 'Featured Priority'}</option>
              <option value="title_asc">{tEvents('sortTitleAsc') || 'Name: A to Z'}</option>
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
            <span>{tCom('filters') || 'Filters'}</span>
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
          {tEvents('showingResults') || 'Showing'} <strong className="text-foreground font-semibold">{totalResults}</strong> {totalResults === 1 ? (tEvents('unitSingular') || 'exhibition') : (tEvents('unitPlural') || 'exhibitions')}
        </span>
      </div>
    </div>
  );
}
