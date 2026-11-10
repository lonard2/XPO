'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building2,
  Ticket,
  Clock,
  Layers,
  ArrowRight,
  Globe,
  Pause,
  Play,
  CheckCheck,
  Radio,
  History,
  MapPin,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { formatDateRange, getTimeZoneForRegion, getEventTemporalStatus, type EventTemporalDetails } from '@/lib/i18n/formatters';
import { getArchetypeTokens, getReadableBadgeColors } from '@/lib/theming';
import { type BannerSlide } from '@/types/discovery';
import { cn } from '@/lib/utils';

export interface BannerCarouselProps {
  slides: BannerSlide[];
  locale: string;
  autoPlayInterval?: number; // default: 7000ms
  className?: string;
}

export function BannerCarousel({
  slides,
  locale,
  autoPlayInterval = 7000,
  className,
}: BannerCarouselProps) {
  const tHero = useTranslations('hero');
  const tEvents = useTranslations('events');
  const tHome = useTranslations('home');

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isManuallyPaused, setIsManuallyPaused] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [timerKey, setTimerKey] = React.useState(0);
  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);
  const [touchEndX, setTouchEndX] = React.useState<number | null>(null);
  const [touchStartY, setTouchStartY] = React.useState<number | null>(null);
  const [touchEndY, setTouchEndY] = React.useState<number | null>(null);
  // Outgoing slide index for the crossfade. Null means a single layer.
  const [prevIndex, setPrevIndex] = React.useState<number | null>(null);
  const stripRef = React.useRef<HTMLDivElement | null>(null);

  const totalSlides = slides?.length || 0;
  const isEffectivePaused = isManuallyPaused || isHovered || isFocused;

  const resetAutoPlay = React.useCallback(() => {
    setTimerKey((k) => k + 1);
  }, []);

  // Single navigation path: records the outgoing slide for the crossfade,
  // then moves. All arrows, swipe, dots, keyboard and autoplay route here.
  const goToIndex = React.useCallback((index: number) => {
    if (index !== currentIndex) setPrevIndex(currentIndex);
    setCurrentIndex(index);
    resetAutoPlay();
  }, [currentIndex, resetAutoPlay]);

  // Auto-play timer with reset hygiene
  React.useEffect(() => {
    if (totalSlides <= 1 || isEffectivePaused) return;

    const timer = setInterval(() => {
      goToIndex((currentIndex + 1) % totalSlides);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [totalSlides, isEffectivePaused, autoPlayInterval, timerKey, currentIndex, goToIndex]);

  // Keyboard navigation with input focus scoping
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive = activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName);
      if (isInputActive) return;

      if (e.key === 'ArrowLeft') {
        goToIndex(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        goToIndex((currentIndex + 1) % totalSlides);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides, currentIndex, goToIndex]);

  // Touch Swipe Handlers with vertical scroll cancellation guard
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.targetTouches.length > 0) {
      setTouchStartX(e.targetTouches[0].clientX);
      setTouchStartY(e.targetTouches[0].clientY ?? null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.targetTouches.length > 0) {
      setTouchEndX(e.targetTouches[0].clientX);
      setTouchEndY(e.targetTouches[0].clientY ?? null);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) {
      setTouchStartX(null);
      setTouchEndX(null);
      setTouchStartY(null);
      setTouchEndY(null);
      return;
    }
    const deltaX = touchStartX - touchEndX;
    const deltaY = touchStartY !== null && touchEndY !== null ? touchStartY - touchEndY : 0;

    // If vertical scroll intent is greater than horizontal swipe, ignore horizontal swipe
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      setTouchStartX(null);
      setTouchEndX(null);
      setTouchStartY(null);
      setTouchEndY(null);
      return;
    }

    const isLeftSwipe = deltaX > 50;
    const isRightSwipe = deltaX < -50;

    if (isLeftSwipe) {
      goToIndex((currentIndex + 1) % totalSlides);
    } else if (isRightSwipe) {
      goToIndex(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
    }

    setTouchStartX(null);
    setTouchEndX(null);
    setTouchStartY(null);
    setTouchEndY(null);
  };

  const goToSlide = (index: number) => {
    goToIndex(index);
  };

  const nextSlide = () => {
    goToIndex((currentIndex + 1) % totalSlides);
  };

  const prevSlide = () => {
    goToIndex(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
  };

  const clearPrevIndex = React.useCallback(() => setPrevIndex(null), []);

  // Roving focus follows selection when the visitor is tabbing through the
  // strip: arrows move both the slide and the single tab stop.
  React.useEffect(() => {
    const strip = stripRef.current;
    if (!strip || !strip.contains(document.activeElement)) return;
    const active = strip.querySelector<HTMLElement>('[data-active="true"]');
    active?.focus();
  }, [currentIndex]);

  // Fallback in case onTransitionEnd never fires (e.g. instant cut under
  // reduced motion): the outgoing layer always unmounts promptly.
  React.useEffect(() => {
    if (prevIndex === null) return;
    const timer = setTimeout(() => setPrevIndex(null), 700);
    return () => clearTimeout(timer);
  }, [prevIndex, currentIndex]);

  // An edition switch can hand this component a shorter slide array. Clamp
  // the index before the next render reads past the end.
  React.useEffect(() => {
    if (totalSlides === 0) return;
    if (currentIndex > totalSlides - 1) {
      setCurrentIndex(totalSlides - 1);
      setPrevIndex(null);
    }
  }, [totalSlides, currentIndex]);


  if (!slides || slides.length === 0) {
    return null;
  }


  // One slide layer. The outgoing layer renders stacked, inert and
  // hidden from assistive tech while the incoming layer fades over it.
  const renderSlide = (index: number, hidden: boolean) => {
    const slide = slides[index];
    if (!slide) return null;
    const slideTokens = getArchetypeTokens(slide.archetype);
    const slideBadge = getReadableBadgeColors(slideTokens.primary);
    const slideRegionCode = (slide.regionCode || 'ID').toUpperCase();
    const slideTimezone = getTimeZoneForRegion(slideRegionCode.toLowerCase());
    const slideDateRange = formatDateRange(
      slide.startDate,
      slide.endDate,
      locale,
      slideTimezone
    );

    const slideTemporal = getEventTemporalStatus(
      slide.startDate,
      slide.endDate
    );

    // Local aliases so the extracted JSX below reads unchanged.
    const archetypeTokens = slideTokens;
    const archetypeBadge = slideBadge;
    const regionCode = slideRegionCode;
    const dateRangeDisplay = slideDateRange;
    const temporalStatus = slideTemporal;

    return (
      <div
        key={slide.id}
        role="group"
        aria-roledescription="slide"
        {...(hidden
          ? { "aria-hidden": true as const, inert: true }
          : {
              "aria-label": tHero('slideLabel', {
                current: index + 1,
                total: totalSlides,
                title: slide.title,
              }),
            })}
        aria-live={isEffectivePaused ? 'polite' : 'off'}
        onAnimationEnd={hidden ? undefined : (e) => {
          // CSS entrance is an animation, not a transition; only the layer's
          // own animation end counts (child stagger/drift events bubble up).
          if (e.target === e.currentTarget) clearPrevIndex();
        }}
        className={cn(
          "relative min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex flex-col justify-end p-5 pt-20 pb-16 sm:p-8 sm:pb-20 lg:p-12 overflow-hidden",
          "lg:grid lg:grid-cols-[1fr_1.4fr] lg:justify-stretch lg:gap-0 lg:p-0",
          hidden && "absolute inset-0 pointer-events-none"
        )}
      >
        {/* Image column: full-bleed backdrop on mobile, left panel on desktop.
            The entrance fade lives here, not on the slide root: text must
            never sit under a running CSS animation (assistive tech
            evaluates animated text against the wrong background). */}
        <div className="hero-crossfade-in absolute inset-0 lg:relative lg:min-h-[520px]">
        {/* Slide Image Layer */}
        {slide.heroImageUrl ? (
          <img
            key={slide.id}
            src={slide.heroImageUrl}
            alt={slide.title}
            fetchPriority={currentIndex === 0 ? 'high' : 'auto'}
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000 scale-[1.02]",
              "hero-drift",
              temporalStatus.isPast && "grayscale-[35%] opacity-75"
            )}
          />
        ) : (
          <div
            className="absolute inset-0 h-full w-full"
            style={{
              background: `radial-gradient(circle at 70% 30%, ${archetypeTokens.primary}55 0%, #030712 85%)`,
            }}
          />
        )}

        {/* High-Contrast Multi-Layer Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 via-55% to-black/35 lg:bg-gradient-to-r lg:from-black/95 lg:via-black/80 lg:via-50% lg:to-black/25" />
        </div>

        {/* Story column: overlay content on mobile, dark panel on desktop */}
        <div
          key={`story-${slide.id}`}
          className="hero-story stagger-children relative z-10 max-w-2xl space-y-2.5 sm:space-y-4 lg:max-w-none lg:bg-slate-950 lg:border-l lg:p-8 lg:space-y-3"
          style={{ borderColor: archetypeTokens.primary }}
        >
          {/* Top Category, Temporal Status & Region Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="default"
              className="text-xs font-bold tracking-wide uppercase shadow-md border-0 gap-1.5"
              style={{ backgroundColor: archetypeBadge.background, color: archetypeBadge.color }}
            >
              <Globe className="h-3 w-3 inline opacity-90" />
              <span>{regionCode.toUpperCase()} • {archetypeTokens.displayName}</span>
            </Badge>

            {/* Differentiated Temporal Badges */}
            {temporalStatus.isLive && (
              <Badge className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold gap-1.5 shadow-md">
                <span className="h-2 w-2 rounded-full bg-white inline-block animate-ping" />
                <span>{tHero('happeningNow')}</span>
              </Badge>
            )}

            {temporalStatus.isPast && (
              <Badge variant="secondary" className="bg-slate-800 text-slate-300 border border-slate-600 text-xs font-semibold gap-1 backdrop-blur-sm">
                <CheckCheck className="h-3 w-3 text-slate-400" />
                <span>{tHero('eventConcluded')}</span>
              </Badge>
            )}

            {temporalStatus.isUpcoming && slide.isFeatured && (
              <Badge variant="warning" className="text-xs font-semibold gap-1 shadow-sm">
                <Layers className="h-3 w-3" />
                <span>{tHero('featuredSpotlight') || 'Featured Spotlight'}</span>
              </Badge>
            )}
          </div>

          {/* Event Title */}
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-[1.18] drop-shadow-md text-balance">
            {slide.title}
          </h2>

          {/* Event Tagline */}
          {slide.tagline && (
            <p className="text-xs sm:text-sm lg:text-base text-slate-200 line-clamp-2 max-w-xl leading-relaxed drop-shadow-sm text-pretty">
              {slide.tagline}
            </p>
          )}

          {/* Event Date, Venue & Exact Hall Metadata */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-slate-300 pt-0.5">
            <div className="flex items-center gap-1.5 text-white font-medium">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span className="tabular-nums">{dateRangeDisplay}</span>
            </div>

            {slide.venueName && (
              <div className="flex items-center gap-1.5 text-slate-200 flex-wrap">
                <Building2 className="h-4 w-4 text-primary/90 shrink-0" />
                <span className="line-clamp-2">{slide.venueName}</span>
                {slide.cityName && (
                  <span className="text-slate-400">• {slide.cityName}</span>
                )}
                {slide.venueHallName && (
                  <span className="text-xs font-semibold bg-white/15 px-2.5 py-0.5 rounded-md text-white backdrop-blur-xs border border-white/20">
                    {slide.venueHallName}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Temporal Status / Countdown Widget */}
          <div className="pt-1">
            <BannerTemporalWidget
              startDate={slide.startDate}
              endDate={slide.endDate}
            />
          </div>

          {/* Accessible Action CTAs (No nested buttons inside Link) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {temporalStatus.isPast ? (
              <>
                <Link
                  href={`/${locale}/events/${slide.slug}`}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'gap-2 font-semibold bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md cursor-pointer'
                  )}
                >
                  <History className="h-4 w-4" />
                  <span>{tHero('viewDetails') || 'View Event Details'}</span>
                  <ArrowRight className="h-4 w-4 ml-0.5" />
                </Link>
                <Link
                  href={`/${locale}/events`}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'gap-2 font-semibold shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground border-0 cursor-pointer'
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  <span>{tHero('exploreEventsCta') || 'Explore Upcoming Events'}</span>
                </Link>
              </>
            ) : temporalStatus.isLive ? (
              <>
                <Link
                  href={`/${locale}/events/${slide.slug}`}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'gap-2 font-semibold shadow-lg bg-emerald-700 hover:bg-emerald-800 text-white border-0 cursor-pointer'
                  )}
                >
                  <Ticket className="h-4 w-4" />
                  <span>{tHero('getPassDoors') || 'Get Pass & Enter Doors'}</span>
                  <ArrowRight className="h-4 w-4 ml-0.5" />
                </Link>
                <Link
                  href={`/${locale}/events/${slide.slug}#agenda`}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md cursor-pointer gap-2'
                  )}
                >
                  <Radio className="h-4 w-4 text-emerald-400" />
                  <span>{tHero('liveTimetable') || 'Live Timetable'}</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/events/${slide.slug}`}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'gap-2 font-semibold shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground border-0 cursor-pointer'
                  )}
                >
                  <Ticket className="h-4 w-4" />
                  <span>{tHero('getPass') || 'Get Event Pass'}</span>
                  <ArrowRight className="h-4 w-4 ml-0.5" />
                </Link>
                <Link
                  href={`/${locale}/events`}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md cursor-pointer'
                  )}
                >
                  <span>{tHome('viewFullSchedule') || 'View Full Schedule'}</span>
                </Link>
              </>
            )}
          </div>
          {/* Editorial footnote: quarantined voice below the CTA row.
              Renders only when a blurb resolved; otherwise no element. */}
          {slide.editorialBlurb && (
            <p className="hero-footnote border-t border-white/10 pt-2.5 text-xs leading-relaxed text-slate-400">
              <span className="mr-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                {tHero('editorialByline')}
              </span>
              <span className="line-clamp-3">{slide.editorialBlurb}</span>
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-slate-950 shadow-xl',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsFocused(false);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label={tHero('carouselLabel')}
    >

      {/* Slide stage: bounds the absolutely-positioned outgoing layer to
          the slide area so its image cannot bleed behind the strip below. */}
      <div className="hero-stage relative">
      {prevIndex !== null && prevIndex !== currentIndex && renderSlide(prevIndex, true)}
      {renderSlide(currentIndex, false)}
      </div>

        {/* Carousel Navigation Controls with WCAG 44x44px Touch Targets */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-4 lg:left-4 lg:bottom-auto lg:right-auto flex items-center gap-1.5 z-20">
          <button
            type="button"
            className="relative flex h-10 w-10 sm:h-9 sm:w-9 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 backdrop-blur-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/60 focus-visible:outline-none"
            onClick={prevSlide}
            aria-label={tHero('previousSlide')}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="relative flex h-10 w-10 sm:h-9 sm:w-9 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 backdrop-blur-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/60 focus-visible:outline-none"
            onClick={nextSlide}
            aria-label={tHero('nextSlide')}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="relative flex h-10 w-10 sm:h-9 sm:w-9 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 backdrop-blur-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/60 focus-visible:outline-none"
            onClick={() => setIsManuallyPaused(!isManuallyPaused)}
            aria-label={isManuallyPaused ? tHero('resumeAutoplay') : tHero('pauseAutoplay')}
          >
            {isManuallyPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Slide Indicators with Backdrop Pill Scrim & 44px Touch Area Hitboxes.
            Dots serve mobile; desktop uses the up-next strip below. */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 lg:hidden flex items-center gap-1 z-20 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 shadow-sm">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              className="relative flex h-10 min-w-[24px] items-center justify-center px-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50 rounded-full"
              aria-label={tHero('goToSlide', { index: idx + 1 })}
              aria-current={idx === currentIndex ? 'true' : undefined}
            >
              <span
                className={cn(
                  'h-2 rounded-full transition-all duration-300 block relative overflow-hidden',
                  idx === currentIndex
                    ? 'w-6 bg-primary shadow-md'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                )}
              >
                {idx === currentIndex && totalSlides > 1 && (
                  <span
                    key={`${currentIndex}-${timerKey}`}
                    className="hero-progress-fill absolute inset-0 bg-white/70"
                    style={{
                      animationDuration: `${autoPlayInterval}ms`,
                      animationPlayState: isEffectivePaused ? 'paused' : 'running',
                    }}
                  />
                )}
              </span>
            </button>
          ))}
        </div>

        {/* Up-next strip: desktop indicators with thumbnails. Hidden for a
            single slide; mobile keeps the dots above. */}
        {totalSlides > 1 && (
          <div
            ref={stripRef}
            className="hero-strip hidden lg:flex items-stretch gap-2 mt-3 overflow-x-auto pb-1 snap-x"
            role="group"
            aria-label={tHero('upNext') || 'Up next'}
          >
            {slides.map((slide, idx) => {
              const tokens = getArchetypeTokens(slide.archetype);
              const active = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  tabIndex={active ? 0 : -1}
                  data-active={active ? "true" : undefined}
                  aria-label={tHero('goToSlide', { index: idx + 1 })}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    "relative flex items-center gap-2.5 min-w-52 max-w-52 rounded-xl border p-2 text-left snap-start cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    active
                      ? "border-primary/60 bg-card"
                      : "border-white/15 bg-slate-950 hover:bg-slate-900"
                  )}
                >
                  {slide.heroImageUrl ? (
                    <img
                      src={slide.heroImageUrl}
                      alt=""
                      loading="lazy"
                      className="h-14 w-20 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="h-14 w-20 shrink-0 rounded-md"
                      style={{ background: `linear-gradient(135deg, ${tokens.primary}55, #030712)` }}
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block line-clamp-2 text-xs font-semibold",
                        active ? "text-foreground" : "text-white"
                      )}
                    >
                      {slide.title}
                    </span>
                    <span
                      className={cn(
                        "block truncate text-[11px]",
                        active ? "text-muted-foreground" : "text-slate-400"
                      )}
                    >
                      {formatDateRange(slide.startDate, slide.endDate, locale, getTimeZoneForRegion((slide.regionCode || 'ID').toLowerCase()))}
                    </span>
                  </span>
                  {active && totalSlides > 1 && (
                    <span className="absolute inset-x-2 -bottom-0 h-0.5 overflow-hidden rounded-full bg-muted">
                      <span
                        key={`${slide.id}-${timerKey}`}
                        className="hero-progress-fill block h-full w-0 bg-primary"
                        style={{
                          animationDuration: `${autoPlayInterval}ms`,
                          animationPlayState: isEffectivePaused ? 'paused' : 'running',
                        }}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
    </div>
  );
}

export function BannerTemporalWidget({
  startDate,
  endDate,
}: {
  startDate: Date | string;
  endDate: Date | string;
}) {
  const [temporal, setTemporal] = React.useState<EventTemporalDetails>(() =>
    getEventTemporalStatus(startDate, endDate)
  );
  // The countdown ticks every second, so it cannot be part of the server markup:
  // the client would hydrate with a different value and React would discard the
  // server tree. The digits appear once the component is mounted, and the slot is
  // reserved beforehand so the pill does not resize when they arrive.
  const [isMounted, setIsMounted] = React.useState(false);
  const tHero = useTranslations('hero');

  React.useEffect(() => {
    setIsMounted(true);
    setTemporal(getEventTemporalStatus(startDate, endDate));
    // Minute granularity: an event days away does not need a ticking second
    // counter pulling attention, and the digits stay stable long enough to read.
    const timer = setInterval(() => {
      setTemporal(getEventTemporalStatus(startDate, endDate));
    }, 60000);

    return () => clearInterval(timer);
  }, [startDate, endDate]);

  if (temporal.isPast) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3.5 py-1 text-xs font-medium text-slate-300 backdrop-blur-sm">
        <CheckCheck className="h-3.5 w-3.5 text-slate-400" />
        <span>{tHero('concludedNotice')}</span>
      </div>
    );
  }

  if (temporal.isLive) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-sm shadow-md">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>{tHero('liveNotice')}</span>
      </div>
    );
  }

  const time = temporal.timeRemaining;
  if (!time) return null;

  const countdown = `${time.days}d ${String(time.hours).padStart(2, '0')}h ${String(
    time.minutes
  ).padStart(2, '0')}m`;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3.5 py-1 text-xs backdrop-blur-md shadow-sm">
      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="text-slate-300 font-medium">{tHero('startsIn')}</span>
      <span
        className={cn(
          'font-mono font-bold text-white tracking-wide tabular-nums',
          !isMounted && 'invisible'
        )}
        aria-hidden={isMounted ? undefined : true}
      >
        {isMounted ? countdown : '00d 00h 00m'}
      </span>
    </div>
  );
}
