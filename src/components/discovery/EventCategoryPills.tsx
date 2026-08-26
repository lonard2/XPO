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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
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
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const jumpBarRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [activeScrollIndex, setActiveScrollIndex] = React.useState(0);

  const tArch = useTranslations('archetypes');
  const tDisc = useTranslations('discovery');
  const tCom = useTranslations('common');

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Compute approximate card index for progress tracking
    const cardWidth = 350 + 16; // approximate card width + gap
    const index = Math.min(
      EVENT_CATEGORIES.length - 1,
      Math.max(0, Math.round(scrollLeft / cardWidth))
    );
    setActiveScrollIndex(index);
  };

  React.useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const scrollToCategoryIndex = (index: number, categoryId: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cards = container.children;
    if (cards[index]) {
      const targetEl = cards[index] as HTMLElement;
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  };

  // Keyboard Roving Navigation
  const handlePillKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!jumpBarRef.current) return;
    const buttons = Array.from(jumpBarRef.current.querySelectorAll<HTMLButtonElement>('button'));
    const currentIndex = buttons.findIndex((btn) => btn === document.activeElement);
    if (currentIndex === -1) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (currentIndex + 1) % buttons.length;
      buttons[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = (currentIndex - 1 + buttons.length) % buttons.length;
      buttons[prev]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      buttons[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      buttons[buttons.length - 1]?.focus();
    }
  };

  // Mouse Drag-to-Scroll Support
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeftState, setScrollLeftState] = React.useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftState(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">
            <Layers className="h-4 w-4" />
            <span>{tDisc('verticalsBadge') || '15 Specialized MICE Verticals'}</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-foreground">
            {tDisc('verticalsTitle') || 'Explore by Event Category'}
          </h2>
        </div>

        {/* Scroll Controls & View All */}
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/events`}
            className="text-xs font-semibold text-primary hover:underline hidden sm:inline-flex items-center gap-1 mr-2"
          >
            <span>{tDisc('allArchetypes') || 'All Categories'}</span>
            <ArrowRight className="h-3 w-3" />
          </Link>

          <Button
            size="icon"
            variant="outline"
            className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl border-border text-foreground hover:bg-accent disabled:opacity-30 cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
            disabled={!canScrollLeft}
            onClick={() => scroll('left')}
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl border-border text-foreground hover:bg-accent disabled:opacity-30 cursor-pointer min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
            disabled={!canScrollRight}
            onClick={() => scroll('right')}
            aria-label="Scroll categories right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Category Jump Pill Bar with Keyboard Roving Navigation */}
      <div
        ref={jumpBarRef}
        onKeyDown={handlePillKeyDown}
        role="toolbar"
        aria-label="Event category selection filter"
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1"
      >
        <button
          type="button"
          onClick={() => {
            if (onSelectCategory) {
              onSelectCategory('all');
            } else {
              scrollToCategoryIndex(0, 'all');
            }
          }}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
            !activeCategoryId || activeCategoryId === 'all'
              ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
              : 'border-border/80 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
          aria-pressed={!activeCategoryId || activeCategoryId === 'all'}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>{tDisc('allArchetypes') || 'All (15)'}</span>
        </button>

        {EVENT_CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon;
          const isSelected = activeCategoryId === cat.id;
          let label = cat.shortName;
          try {
            if (tArch && typeof tArch.raw === 'function') {
              const obj = tArch.raw(cat.id);
              if (obj?.tag) label = obj.tag;
            }
          } catch {
            // fallback
          }

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => scrollToCategoryIndex(idx, cat.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all whitespace-nowrap cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'border-border/80 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              aria-pressed={isSelected}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Horizontally Scrollable Category Cards Carousel with Tactile Polish */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={cn(
          'flex items-stretch gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x -mx-1 px-1 touch-pan-y',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
      >
        {EVENT_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategoryId === category.id;

          let translatedTitle = category.name;
          let translatedDesc = category.tagline;
          let translatedTag = category.shortName;
          try {
            if (tArch && typeof tArch.raw === 'function') {
              const obj = tArch.raw(category.id);
              if (obj?.title) translatedTitle = obj.title;
              if (obj?.description) translatedDesc = obj.description;
              if (obj?.tag) translatedTag = obj.tag;
            }
          } catch {
            // fallback
          }

          const cardContent = (
            <div
              style={{
                borderColor: isActive ? category.color : undefined,
                boxShadow: isActive ? `0 0 24px -4px ${category.color}40` : undefined,
              }}
              className={cn(
                'group relative flex flex-col justify-between w-[300px] sm:w-[350px] lg:w-[370px] rounded-3xl border p-5 sm:p-6 transition-all duration-300 overflow-hidden text-left h-full snap-start shrink-0 shadow-xs',
                isActive
                  ? 'ring-2 ring-primary border-primary bg-card'
                  : 'border-border/80 bg-card hover:border-primary/60 hover:shadow-md hover:-translate-y-0.5'
              )}
            >
              {/* Dynamic Domain Ambient Glow */}
              <div
                className={cn(
                  'absolute -top-12 -right-12 h-32 w-32 rounded-full blur-2xl transition-opacity duration-300 pointer-events-none',
                  isActive ? 'opacity-45' : 'opacity-15 group-hover:opacity-35'
                )}
                style={{ backgroundColor: category.color }}
              />

              <div className="relative z-10 space-y-4">
                {/* Header: Icon & Category Tag Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 shadow-2xs"
                    style={{
                      backgroundColor: `${category.color}15`,
                      color: category.color,
                      border: `1px solid ${category.color}30`,
                    }}
                  >
                    <Icon className="h-5 w-5 stroke-[2.2]" />
                  </div>

                  <span
                    className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap border bg-muted/80 text-foreground border-border/80"
                  >
                    {translatedTag}
                  </span>
                </div>

                {/* Title & Evocative Tagline */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 min-h-[2.75rem]">
                    {translatedTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed min-h-[3.25rem]">
                    {translatedDesc}
                  </p>
                </div>

                {/* Domain Spectrum Capabilities Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {category.highlights.slice(0, 4).map((highlight, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold text-foreground bg-muted/80 px-2.5 py-1 rounded-lg whitespace-nowrap border border-border/60"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Domain CTA Arrow Strip */}
              <div className="relative z-10 pt-4 mt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
                <span>{category.ctaLabel || tCom('viewCategory') || `Explore ${category.shortName}`}</span>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          );

          if (onSelectCategory) {
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(category.id)}
                className="shrink-0 text-left focus:outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary rounded-3xl"
              >
                {cardContent}
              </button>
            );
          }

          return (
            <Link
              key={category.id}
              href={`/${locale}/events?archetype=${category.id}`}
              className="shrink-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-3xl"
            >
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
