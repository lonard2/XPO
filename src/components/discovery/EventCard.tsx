'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Building2,
  MapPin,
  Ticket,
  ArrowRight,
  Sparkles,
  Layers,
  Globe,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { useTranslations } from 'next-intl';
import { formatCurrency, formatDateRange, getTimeZoneForRegion, getEventTemporalStatus, type SupportedCurrency } from '@/lib/i18n/formatters';
import { getArchetypeTokens } from '@/lib/theming';
import { type DiscoveryEvent } from '@/types/discovery';
import { cn } from '@/lib/utils';

export interface EventCardProps {
  event: DiscoveryEvent;
  locale: string;
  className?: string;
  variant?: 'grid' | 'compact' | 'horizontal';
}

export function EventCard({
  event,
  locale,
  className,
  variant = 'grid',
}: EventCardProps) {
  let tArch: any = (k: string) => k;
  let tCom: any = (k: string) => k;
  let tTick: any = (k: string) => k;
  let tDisc: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tArch = useTranslations('archetypes');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tCom = useTranslations('common');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tTick = useTranslations('tickets');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tDisc = useTranslations('discovery');
  } catch {
    // Fallback if rendered outside provider in tests
  }

  const archetypeTokens = getArchetypeTokens(event.archetype);
  const regionCode = (event.region?.code || event.regionId || 'id').toLowerCase();
  const timezone = getTimeZoneForRegion(regionCode);
  const temporal = getEventTemporalStatus(event.startDate, event.endDate);

  // Price Calculation
  const sortedTiers = event.ticketTiers && event.ticketTiers.length > 0
    ? [...event.ticketTiers].sort((a, b) => a.price - b.price)
    : [];
  const lowestTier = sortedTiers[0];
  const lowestPrice = lowestTier?.price ?? 0;
  const currency = (lowestTier?.currency || event.region?.currency || 'IDR') as SupportedCurrency;

  const priceDisplay = lowestPrice > 0
    ? formatCurrency(lowestPrice, currency, locale)
    : (tCom('free') || 'Free');

  const dateRangeDisplay = formatDateRange(
    event.startDate,
    event.endDate,
    locale,
    timezone
  );

  let archetypeDisplayName = archetypeTokens.displayName;
  try {
    if (tArch && typeof tArch.raw === 'function') {
      const raw = tArch.raw(event.archetype);
      if (raw?.title) archetypeDisplayName = raw.title;
    }
  } catch {
    // fallback
  }

  const formatLabel = event.format ? event.format.replace(/_/g, ' ') : 'IN PERSON';
  const scaleLabel = event.scale ? event.scale.replace(/_/g, ' ') : 'LARGE';

  return (
    <Card
      interactive
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden border-border/80 bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1',
        variant === 'horizontal' && 'md:flex-row md:items-center',
        className
      )}
    >
      {/* Visual Header / Hero Background Image */}
      <div className={cn(
        'relative w-full overflow-hidden bg-muted aspect-video max-h-48 border-b border-border/60',
        variant === 'horizontal' && 'md:w-64 md:aspect-auto md:h-full md:max-h-none md:border-b-0 md:border-r'
      )}>
        {event.heroImageUrl ? (
          <img
            src={event.heroImageUrl}
            alt={event.title}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center p-6 text-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${archetypeTokens.primary}25 0%, ${archetypeTokens.accent}25 100%)`,
            }}
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
            <Layers className="h-8 w-8 opacity-50 relative z-10" style={{ color: archetypeTokens.primary }} />
          </div>
        )}

        {/* Floating Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10">
          <Badge
            variant="default"
            className="text-[10px] uppercase font-bold tracking-wider shadow-sm"
            style={{
              backgroundColor: archetypeTokens.primary,
              color: '#ffffff',
            }}
          >
            {archetypeTokens.displayName.split('&')[0].trim()}
          </Badge>

          {temporal.isLive && (
            <Badge className="bg-emerald-600 text-white text-[10px] font-bold gap-1 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white inline-block animate-ping" />
              <span>Live</span>
            </Badge>
          )}

          {temporal.isPast && (
            <Badge variant="secondary" className="text-[10px] font-medium bg-black/70 text-slate-300 border border-slate-700 shadow-sm backdrop-blur-xs">
              <span>Concluded</span>
            </Badge>
          )}

          {temporal.isUpcoming && event.isFeatured && (
            <Badge variant="warning" className="text-[10px] font-semibold gap-1 shadow-sm">
              <Layers className="h-2.5 w-2.5" />
              <span>Featured</span>
            </Badge>
          )}
        </div>

        <div className="absolute top-2.5 right-2.5 z-10">
          <Badge variant="outline" className="text-[10px] uppercase font-mono bg-background/90 backdrop-blur-xs">
            {formatLabel}
          </Badge>
        </div>
      </div>

      {/* Main Content Details */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
        <CardHeader className="p-0 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-medium text-foreground">{dateRangeDisplay}</span>
          </div>

          <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            <Link href={`/${locale}/events/${event.slug}`} className="hover:underline">
              {event.title}
            </Link>
          </h3>

          {event.tagline && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {event.tagline}
            </p>
          )}
        </CardHeader>

        <CardContent className="p-0 space-y-2 text-xs text-muted-foreground">
          {event.venue && (
            <div className="flex items-start gap-1.5 pt-1">
              <Building2 className="h-3.5 w-3.5 text-primary/80 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-medium text-foreground line-clamp-1">{event.venue.name}</span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3 inline text-muted-foreground" />
                  {event.venue.city}
                  {event.venueHall && ` • ${event.venueHall.name}`}
                </span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-0 pt-3 border-t border-border/60 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              {temporal.isPast ? (tCom('date') || 'Status') : (tTick('price') || 'Price')}
            </span>
            <span className="text-sm font-extrabold text-foreground">
              {temporal.isPast ? 'Concluded' : priceDisplay}
            </span>
          </div>

          <Link href={`/${locale}/events/${event.slug}`}>
            <Button size="sm" variant={temporal.isPast ? 'outline' : 'default'} className="gap-1 text-xs font-semibold shadow-sm">
              <Ticket className="h-3.5 w-3.5" />
              <span>{temporal.isPast ? (tCom('viewDetails') || 'View Details') : (tTick('viewPass') || 'View Pass')}</span>
              <ArrowRight className="h-3 w-3 ml-0.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
}
