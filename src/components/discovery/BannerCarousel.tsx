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
  Sparkles,
  ArrowRight,
  Globe,
  Pause,
  Play,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateRange, getTimeZoneForRegion } from '@/lib/i18n/formatters';
import { getArchetypeTokens } from '@/lib/theming';
import { type BannerSlide } from '@/types/discovery';
import { cn } from '@/lib/utils';

export interface BannerCarouselProps {
  slides: BannerSlide[];
  locale: string;
  autoPlayInterval?: number; // default: 7000ms
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calculateTimeRemaining(targetDate: Date | string): TimeRemaining {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: false };
}

export function BannerCarousel({
  slides,
  locale,
  autoPlayInterval = 7000,
  className,
}: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);
  const [touchEndX, setTouchEndX] = React.useState<number | null>(null);

  const totalSlides = slides.length;

  // Auto-play timer
  React.useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [totalSlides, isPaused, autoPlayInterval]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides]);

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
    } else if (isRightSwipe) {
      setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
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
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000 scale-[1.02]"
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
          {/* Top Category & Region Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="default"
              className="text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-md border-0"
              style={{ backgroundColor: archetypeTokens.primary, color: '#ffffff' }}
            >
              {archetypeTokens.displayName}
            </Badge>

            <Badge variant="outline" className="bg-black/60 text-white text-[11px] sm:text-xs font-medium gap-1 border-white/20 backdrop-blur-sm">
              <Globe className="h-3 w-3 text-primary" />
              <span>{regionCode} Edition</span>
            </Badge>

            {currentSlide.isFeatured && (
              <Badge variant="warning" className="text-[11px] sm:text-xs font-semibold gap-1 shadow-sm">
                <Sparkles className="h-3 w-3" />
                <span>Featured Spotlight</span>
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

          {/* Event Date & Venue Metadata */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-slate-300 pt-0.5">
            <div className="flex items-center gap-1.5 text-white font-medium">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>{dateRangeDisplay}</span>
            </div>

            {currentSlide.venueName && (
              <div className="flex items-center gap-1.5 text-slate-200">
                <Building2 className="h-4 w-4 text-primary/90 shrink-0" />
                <span className="line-clamp-1">
                  {currentSlide.venueName}
                  {currentSlide.cityName && ` (${currentSlide.cityName})`}
                </span>
              </div>
            )}
          </div>

          {/* Countdown Widget */}
          <div className="pt-1">
            <CountdownTimer targetDate={currentSlide.startDate} />
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href={`/${locale}/events/${currentSlide.slug}`}>
              <Button size="lg" className="gap-2 font-semibold shadow-lg bg-primary hover:bg-primary/90 text-white border-0">
                <Ticket className="h-4 w-4" />
                <span>Get Event Pass</span>
                <ArrowRight className="h-4 w-4 ml-0.5" />
              </Button>
            </Link>

            <Link href={`/${locale}/events`}>
              <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md">
                <span>View Full Schedule</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Carousel Navigation Controls */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-20">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/80 text-white border-white/20 backdrop-blur-sm"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/80 text-white border-white/20 backdrop-blur-sm"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full text-slate-300 hover:text-white hover:bg-white/10 hidden sm:flex"
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-1.5 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                idx === currentIndex
                  ? 'w-6 bg-primary shadow-md'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              )}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CountdownTimer({ targetDate }: { targetDate: Date | string }) {
  const [time, setTime] = React.useState<TimeRemaining>(() => calculateTimeRemaining(targetDate));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (time.isPast) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-sm">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Event is Happening Now</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/60 px-3 py-1.5 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
        <Clock className="h-3.5 w-3.5 animate-pulse" />
        <span className="uppercase tracking-wider">Starts in:</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
        <div className="flex flex-col items-center rounded-md bg-white/10 px-2 py-0.5 min-w-[28px]">
          <span>{time.days}</span>
          <span className="text-[8px] font-sans font-normal text-slate-300 uppercase">d</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center rounded-md bg-white/10 px-2 py-0.5 min-w-[28px]">
          <span>{String(time.hours).padStart(2, '0')}</span>
          <span className="text-[8px] font-sans font-normal text-slate-300 uppercase">h</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center rounded-md bg-white/10 px-2 py-0.5 min-w-[28px]">
          <span>{String(time.minutes).padStart(2, '0')}</span>
          <span className="text-[8px] font-sans font-normal text-slate-300 uppercase">m</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center rounded-md bg-white/10 px-2 py-0.5 min-w-[28px]">
          <span>{String(time.seconds).padStart(2, '0')}</span>
          <span className="text-[8px] font-sans font-normal text-slate-300 uppercase">s</span>
        </div>
      </div>
    </div>
  );
}
