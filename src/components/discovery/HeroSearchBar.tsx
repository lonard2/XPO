'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export interface HeroSearchBarProps {
  locale: string;
  regionCode?: string;
  className?: string;
}

interface QuickTag {
  label: string;
  query: string;
  type?: 'keyword' | 'archetype';
}

const REGIONAL_SUGGESTIONS: Record<string, QuickTag[]> = {
  id: [
    { label: 'Industrial B2B', query: 'INDUSTRIAL_B2B', type: 'archetype' },
    { label: 'Tech & AI', query: 'TECH_DEV_SUMMIT', type: 'archetype' },
    { label: 'JIExpo Kemayoran', query: 'JIExpo' },
    { label: 'ICE BSD City', query: 'ICE BSD' },
    { label: 'Mega Expo Fair', query: 'MEGA_EXPO_PAVILION', type: 'archetype' },
  ],
  jp: [
    { label: 'Tech & Developer', query: 'TECH_DEV_SUMMIT', type: 'archetype' },
    { label: 'Gaming & Anime', query: 'POP_CULTURE_GAMING', type: 'archetype' },
    { label: 'Tokyo Big Sight', query: 'Tokyo Big Sight' },
    { label: 'Makuhari Messe', query: 'Makuhari Messe' },
    { label: 'Green Energy', query: 'ENERGY_MINING_GREEN', type: 'archetype' },
  ],
  global: [
    { label: 'Financial Forum', query: 'FINANCIAL_FINTECH_INVESTOR', type: 'archetype' },
    { label: 'Medical Symposium', query: 'MEDICAL_HEALTHCARE_SCIENCE', type: 'archetype' },
    { label: 'Marina Bay Sands', query: 'Marina Bay Sands' },
    { label: 'ExCeL London', query: 'ExCeL London' },
    { label: 'Manufacturing B2B', query: 'INDUSTRIAL_B2B', type: 'archetype' },
  ],
};

export function HeroSearchBar({
  locale,
  regionCode = 'id',
  className,
}: HeroSearchBarProps) {
  let router: any = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    router = useRouter();
  } catch {
    // Graceful fallback when rendered outside AppRouter in unit tests
  }

  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  let tHome: any = (k: string) => k;
  let tCom: any = (k: string) => k;

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tHome = useTranslations('home');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tCom = useTranslations('common');
  } catch {
    // Graceful fallback if rendered outside NextIntlClientProvider in testing
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    const targetUrl = trimmed
      ? `/${locale}/events?keyword=${encodeURIComponent(trimmed)}`
      : `/${locale}/events`;
    if (router?.push) {
      router.push(targetUrl);
    } else if (typeof window !== 'undefined') {
      window.location.href = targetUrl;
    }
  };

  const handleTagClick = (tag: QuickTag) => {
    const targetUrl =
      tag.type === 'archetype'
        ? `/${locale}/events?archetype=${encodeURIComponent(tag.query)}`
        : `/${locale}/events?keyword=${encodeURIComponent(tag.query)}`;
    if (router?.push) {
      router.push(targetUrl);
    } else if (typeof window !== 'undefined') {
      window.location.href = targetUrl;
    }
  };

  // Keyboard shortcut: '/' focuses the search input when not typing in form controls or modals
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const isInputActive =
        activeEl &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName) ||
          activeEl.isContentEditable ||
          activeEl.getAttribute('contenteditable') === 'true');
      const isModalOpen = Boolean(
        document.querySelector('[role="dialog"][data-state="open"], [aria-modal="true"]')
      );

      if (e.key === '/' && !isInputActive && !isModalOpen) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const suggestions = REGIONAL_SUGGESTIONS[regionCode] || REGIONAL_SUGGESTIONS.id;

  return (
    <div
      className={cn(
        'w-full border-t border-border/80 bg-background/95 backdrop-blur-md px-4 sm:px-8 py-3.5 sm:py-4 flex flex-col gap-3',
        className
      )}
      role="search"
      aria-label="Homepage event search cockpit"
    >
      <form onSubmit={handleSearch} className="flex items-center gap-2 sm:gap-3 w-full">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              tHome('searchCockpitPlaceholder') ||
              'Search exhibitions, summits, venues (e.g. JIExpo, Robotics, Medical)...'
            }
            className="w-full h-11 sm:h-12 pl-10 pr-20 rounded-xl border border-border/80 bg-card text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
            aria-label={tCom('search') || 'Search events'}
            autoComplete="off"
          />

          <div className="absolute right-2.5 flex items-center gap-1.5">
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label={tCom('clear') || 'Clear search query'}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            <kbd className="hidden md:inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-mono font-medium text-muted-foreground bg-muted/60 border border-border/60 rounded">
              /
            </kbd>
          </div>
        </div>

        <Button
          type="submit"
          variant="default"
          size="sm"
          className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl text-xs sm:text-sm font-semibold gap-1.5 shadow-sm min-h-[44px] shrink-0 cursor-pointer"
        >
          <span>{tHome('searchCockpitSubmit') || tCom('search') || 'Search Expos'}</span>
          <ArrowRight className="h-3.5 w-3.5 hidden sm:inline" />
        </Button>
      </form>

      {/* Quick Search Suggestions */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
        <span className="text-muted-foreground font-medium flex items-center gap-1 mr-0.5 text-xs">
          <Tag className="h-3 w-3 text-primary" />
          <span>{tHome('popularSearches') || 'Popular Searches'}:</span>
        </span>

        {suggestions.map((tag) => (
          <button
            key={tag.label}
            type="button"
            onClick={() => handleTagClick(tag)}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted/60 hover:bg-primary/15 text-muted-foreground hover:text-primary border border-border/60 hover:border-primary/30 transition-all cursor-pointer min-h-[28px]"
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}
