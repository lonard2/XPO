'use client';

import * as React from 'react';
import { BannerCarousel } from './BannerCarousel';
import { HeroVenueQuickGlanceRail } from './HeroVenueQuickGlanceRail';
import { type BannerSlide, type VenueWithEvents } from '@/types/discovery';
import { cn } from '@/lib/utils';

export interface HeroSectionProps {
  slides: BannerSlide[];
  venues: VenueWithEvents[];
  locale: string;
  regionCode: string;
  className?: string;
}

export function HeroSection({
  slides,
  venues,
  locale,
  regionCode,
  className,
}: HeroSectionProps) {
  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-lg flex flex-col',
        className
      )}
    >
      {/* 1. Main Hero Banner (Top) */}
      <BannerCarousel
        slides={slides}
        locale={locale}
        className="rounded-none border-0 shadow-none"
      />

      {/* 2. Seamlessly Attached Horizontally Scrollable Major Venues Quick-Glance Rail (Bottom) */}
      {venues.length > 0 && (
        <HeroVenueQuickGlanceRail
          venues={venues}
          locale={locale}
          regionCode={regionCode}
        />
      )}
    </div>
  );
}
