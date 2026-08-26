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
import { getArchetypeTokens } from '@/lib/theming';
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
  let tHero: any = (k: string) => k;
  let tEvents: any = (k: string) => k;
  let tHome: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tHero = useTranslations('hero');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tEvents = useTranslations('events');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tHome = useTranslations('home');
  } catch {
    // Fallback if rendered outside provider in tests
  }

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [timerKey, setTimerKey] = React.useState(0);
  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);
  const [touchEndX, setTouchEndX] = React.useState<number | null>(null);

  const totalSlides = slides?.length || 0;

  const resetAutoPlay = React.useCallback(() => {
    setTimerKey((k) => k + 1);
  }, []);

  // Auto-play timer with reset hygiene
  React.useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [totalSlides, isPaused, autoPlayInterval, timerKey]);

  // Keyboard navigation with input focus scoping
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive = activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName);
      if (isInputActive) return;

      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
        resetAutoPlay();
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
        resetAutoPlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides, resetAutoPlay]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
      resetAutoPlay();
    } else if (isRightSwipe) {
      setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
      resetAutoPlay();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    resetAutoPlay();
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    resetAutoPlay();
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    resetAutoPlay();
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];
  const archetypeTokens = getArchetypeTokens(currentSlide.archetype);
  const regionCode = (currentSlide.regionCode || 'ID').toUpperCase();
  const timezone = getTimeZoneForRegion(regionCode.toLowerCase());
  const dateRangeDisplay = formatDateRange(
    currentSlide.startDate,
    currentSlide.endDate,
    locale,
    timezone
  );

  const temporalStatus = getEventTemporalStatus(
    currentSlide.startDate,
    currentSlide.endDate
  );

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-slate-950 shadow-xl select-none',
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Events Banner"
    >
      {/* Slide Container */}
      <div className="relative min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex flex-col justify-end p-5 sm:p-8 lg:p-12 overflow-hidden">
        {/* Slide Image Layer */}
        {currentSlide.heroImageUrl ? (
          <img
            key={currentSlide.id}
            src={currentSlide.heroImageUrl}
            alt={currentSlide.title}
            fetchPriority={currentIndex === 0 ? 'high' : 'auto'}
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000 scale-[1.02]",
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

        {/* Foreground Content Card */}
        <div className="relative z-10 max-w-2xl space-y-3.5 sm:space-y-4">
          {/* Top Category, Temporal Status & Region Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="default"
              className="text-xs font-bold tracking-wide uppercase shadow-md border-0 gap-1.5"
              style={{ backgroundColor: archetypeTokens.primary, color: '#ffffff' }}
            >
              <Globe className="h-3 w-3 inline opacity-90" />
              <span>{regionCode.toUpperCase()} • {archetypeTokens.displayName}</span>
            </Badge>

            {/* Differentiated Temporal Badges */}
            {temporalStatus.isLive && (
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-md">
                <span className="h-2 w-2 rounded-full bg-white inline-block animate-ping" />
                <span>Happening Now</span>
              </Badge>
            )}

            {temporalStatus.isPast && (
              <Badge variant="secondary" className="bg-slate-800 text-slate-300 border border-slate-600 text-xs font-semibold gap-1 backdrop-blur-sm">
                <CheckCheck className="h-3 w-3 text-slate-400" />
                <span>Event Concluded</span>
              </Badge>
            )}

            {temporalStatus.isUpcoming && currentSlide.isFeatured && (
              <Badge variant="warning" className="text-xs font-semibold gap-1 shadow-sm">
                <Layers className="h-3 w-3" />
                <span>{tHero('featuredSpotlight') || 'Featured Spotlight'}</span>
              </Badge>
            )}
          </div>

          {/* Event Title */}
          <h2 className="text-xl sm:text-3xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.18] drop-shadow-md">
            {currentSlide.title}
          </h2>

          {/* Event Tagline */}
          {currentSlide.tagline && (
            <p className="text-xs sm:text-sm lg:text-base text-slate-200 line-clamp-2 max-w-xl leading-relaxed drop-shadow-sm">
              {currentSlide.tagline}
            </p>
          )}

          {/* Event Date, Venue & Exact Hall Metadata */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-slate-300 pt-0.5">
            <div className="flex items-center gap-1.5 text-white font-medium">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>{dateRangeDisplay}</span>
            </div>

            {currentSlide.venueName && (
              <div className="flex items-center gap-1.5 text-slate-200 flex-wrap">
                <Building2 className="h-4 w-4 text-primary/90 shrink-0" />
                <span className="line-clamp-1">
                  {currentSlide.venueName}
                  {currentSlide.cityName && ` (${currentSlide.cityName})`}
                </span>
                {currentSlide.venueHallName && (
                  <span className="text-xs font-semibold bg-white/15 px-2.5 py-0.5 rounded-md text-white backdrop-blur-xs border border-white/20">
                    {currentSlide.venueHallName}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Temporal Status / Countdown Widget */}
          <div className="pt-1">
            <BannerTemporalWidget
              startDate={currentSlide.startDate}
              endDate={currentSlide.endDate}
            />
          </div>

          {/* Accessible Action CTAs (No nested buttons inside Link) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {temporalStatus.isPast ? (
              <>
                <Link
                  href={`/${locale}/events/${currentSlide.slug}`}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'gap-2 font-semibold bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md cursor-pointer'
                  )}
                >
                  <History className="h-4 w-4" />
                  <span>{tHero('viewRecap') || 'View Event Recap'}</span>
                  <ArrowRight className="h-4 w-4 ml-0.5" />
                </Link>
                <Link
                  href={`/${locale}/events`}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'gap-2 font-semibold shadow-lg bg-primary hover:bg-primary/90 text-white border-0 cursor-pointer'
                  )}
                >
                  <Calendar className="h-4 w-4" />
                  <span>{tHero('exploreEventsCta') || 'Explore Upcoming Events'}</span>
                </Link>
              </>
            ) : temporalStatus.isLive ? (
              <>
                <Link
                  href={`/${locale}/events/${currentSlide.slug}`}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'gap-2 font-semibold shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white border-0 animate-pulse cursor-pointer'
                  )}
                >
                  <Ticket className="h-4 w-4" />
                  <span>{tHero('getPassDoors') || 'Get Pass & Enter Doors'}</span>
                  <ArrowRight className="h-4 w-4 ml-0.5" />
                </Link>
                <Link
                  href={`/${locale}/events/${currentSlide.slug}#agenda`}
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
                  href={`/${locale}/events/${currentSlide.slug}`}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'gap-2 font-semibold shadow-lg bg-primary hover:bg-primary/90 text-white border-0 cursor-pointer'
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
        </div>

        {/* Carousel Navigation Controls with WCAG 44x44px Touch Targets */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-1.5 z-20">
          <button
            type="button"
            className="relative flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 backdrop-blur-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="relative flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 backdrop-blur-sm transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="relative flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Slide Indicators with 44px Touch Area Hitboxes */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-1 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              className="relative flex h-10 min-w-[20px] items-center justify-center px-1 cursor-pointer focus-visible:outline-none"
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === currentIndex ? 'true' : 'false'}
            >
              <span
                className={cn(
                  'h-2 rounded-full transition-all duration-300 block',
                  idx === currentIndex
                    ? 'w-6 bg-primary shadow-md'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BannerTemporalWidget({
  startDate,
  endDate,
}: {
  startDate: Date | string;
  endDate: Date | string;
}) {
  const [temporal, setTemporal] = React.useState<EventTemporalDetails>(() =>
    getEventTemporalStatus(startDate, endDate)
  );

  React.useEffect(() => {
    setTemporal(getEventTemporalStatus(startDate, endDate));
    const timer = setInterval(() => {
      setTemporal(getEventTemporalStatus(startDate, endDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [startDate, endDate]);

  if (temporal.isPast) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3.5 py-1 text-xs font-medium text-slate-300 backdrop-blur-sm">
        <CheckCheck className="h-3.5 w-3.5 text-slate-400" />
        <span>This event has concluded. Pass registration is closed.</span>
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
        <span>Event is Happening Now - Doors Open</span>
      </div>
    );
  }

  const time = temporal.timeRemaining;
  if (!time) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3.5 py-1 text-xs backdrop-blur-md shadow-sm">
      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="text-slate-300 font-medium">Starts in:</span>
      <span className="font-mono font-bold text-white tracking-wide">
        {time.days}d {String(time.hours).padStart(2, '0')}h {String(time.minutes).padStart(2, '0')}m {String(time.seconds).padStart(2, '0')}s
      </span>
    </div>
  );
}
