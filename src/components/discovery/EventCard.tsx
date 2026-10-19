'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Building2,
  MapPin,
  Ticket,
  ArrowRight,
  Layers,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
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
  priority?: boolean;
  shortlisted?: boolean;
  onToggleShortlist?: (id: string) => void;
  shortlistLabel?: string;
}

export const EventCard = React.memo(function EventCard({
  event,
  locale,
  className,
  variant = 'grid',
  priority = false,
  shortlisted = false,
  onToggleShortlist,
  shortlistLabel,
}: EventCardProps) {
  const tArch = useTranslations('archetypes');
  const tCom = useTranslations('common');
  const tTick = useTranslations('tickets');
  const tDisc = useTranslations('discovery');
  const tEvents = useTranslations('events');

  const archetypeTokens = React.useMemo(
    () => getArchetypeTokens(event.archetype),
    [event.archetype]
  );
  const regionCode = (event.region?.code || event.regionId || 'id').toLowerCase();
  const timezone = React.useMemo(() => getTimeZoneForRegion(regionCode), [regionCode]);
  const temporal = React.useMemo(
    () => getEventTemporalStatus(event.startDate, event.endDate),
    [event.startDate, event.endDate]
  );

  // Price Calculation
  const priceDisplay = React.useMemo(() => {
    const sortedTiers = event.ticketTiers && event.ticketTiers.length > 0
      ? [...event.ticketTiers].sort((a, b) => a.price - b.price)
      : [];
    const lowestTier = sortedTiers[0];
    const lowestPrice = lowestTier?.price ?? 0;
    const currency = (lowestTier?.currency || event.region?.currency || 'IDR') as SupportedCurrency;

    return lowestPrice > 0
      ? formatCurrency(lowestPrice, currency, locale)
      : (tCom('free') || 'Free');
  }, [event.ticketTiers, event.region?.currency, locale, tCom]);

  const dateRangeDisplay = React.useMemo(() => {
    return formatDateRange(
      event.startDate,
      event.endDate,
      locale,
      timezone
    );
  }, [event.startDate, event.endDate, locale, timezone]);

  let archetypeBadgeLabel = archetypeTokens.displayName.split('&')[0].trim();
  try {
    if (tArch && typeof tArch.raw === 'function') {
      const raw = tArch.raw(event.archetype);
      // `tag` is the authored short label and is translated per locale. The token
      // display name is the untranslated fallback.
      if (raw?.tag) archetypeBadgeLabel = raw.tag;
    }
  } catch {
    // fallback
  }

  const isCurated = Boolean(
    event.isPlatformCurated ||
    (event.organizerId === null && Boolean(event.organizerName))
  );
  const curatedBadgeLabel = event.organizerName ? tEvents('curatedListing') : tEvents('officialListing');
  const organizerAttribution = React.useMemo(() => {
    if (isCurated) {
      return event.organizerName || event.venue?.name || tEvents('officialListingFallback');
    }
    if (event.organizer?.organization || event.organizer?.name) {
      return event.organizer.organization || event.organizer.name;
    }
    if (event.organizerName) {
      return event.organizerName;
    }
    return null;
  }, [isCurated, event.organizerName, event.venue?.name, event.organizer]);

  const formatLabel = event.format ? event.format.replace(/_/g, ' ') : tDisc('inPerson');

  return (
    <Card
      interactive
      data-tilt
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden border-border/80 bg-card transition-all duration-300 hover:border-primary/60 hover:shadow-md hover:-translate-y-0.5',
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
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center p-6 text-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${archetypeTokens.primary}25 0%, ${archetypeTokens.accent}25 100%)`,
            }}
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#090d16_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
            <Layers className="h-8 w-8 opacity-50 relative z-10" style={{ color: archetypeTokens.primary }} />
          </div>
        )}

        {/* Floating Top Badges: capped at two — live status, then curation.
            Category and format live in the body metadata row instead. */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10">
          {temporal.isLive && (
            <Badge className="bg-emerald-600 text-white text-xs font-bold gap-1 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white inline-block animate-ping" />
              <span>{tEvents('live')}</span>
            </Badge>
          )}

          {temporal.isPast && (
            <Badge variant="secondary" className="text-xs font-medium bg-black/70 text-slate-300 border border-slate-700 shadow-sm backdrop-blur-sm">
              <span>{tEvents('concluded')}</span>
            </Badge>
          )}

          {isCurated && (
            <Badge variant="outline" className="text-xs font-semibold gap-1 shadow-sm bg-background/90 backdrop-blur-sm text-foreground border-border">
              <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span>{curatedBadgeLabel}</span>
            </Badge>
          )}
        </div>

        {onToggleShortlist && (
          <button
            type="button"
            onClick={() => onToggleShortlist(event.id)}
            aria-pressed={shortlisted}
            aria-label={shortlistLabel || 'Compare this event'}
            title={shortlistLabel || 'Compare this event'}
            className={cn(
              'absolute top-2.5 right-2.5 z-10 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              shortlisted
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background/90 text-muted-foreground hover:text-foreground'
            )}
          >
            <Scale className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Main Content Details */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
        <CardHeader className="p-0 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-medium text-foreground tabular-nums">{dateRangeDisplay}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="font-bold uppercase tracking-wider truncate" style={{ color: archetypeTokens.primary }}>
              {archetypeBadgeLabel}
            </span>
            <span aria-hidden="true" className="shrink-0">·</span>
            <span className="whitespace-nowrap">{formatLabel}</span>
            {event.scale && (
              <>
                <span aria-hidden="true" className="shrink-0">·</span>
                <span className="capitalize whitespace-nowrap">{event.scale.replace(/_/g, ' ').toLowerCase()}</span>
              </>
            )}
          </div>

          <div className="flex items-start gap-2">
            <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 text-balance group-hover:text-primary transition-colors flex-1">
              <Link href={`/${locale}/events/${event.slug}`} className="hover:underline after:absolute after:inset-0">
                {event.title}
              </Link>
            </h3>
            {temporal.isUpcoming && event.isFeatured && (
              <Badge variant="warning" className="text-[11px] font-semibold gap-1 shadow-sm shrink-0 mt-0.5">
                <Layers className="h-2.5 w-2.5" />
                <span>{tEvents('featuredBadge')}</span>
              </Badge>
            )}
          </div>

          {event.tagline && (
            <p className="text-xs text-muted-foreground line-clamp-2 text-pretty leading-relaxed">
              {event.tagline}
            </p>
          )}
        </CardHeader>

        <CardContent className="p-0 space-y-2 text-xs text-muted-foreground">
          {organizerAttribution && (
            <div className="flex items-center gap-1.5 pt-0.5">
              {isCurated ? (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Building2 className="h-3.5 w-3.5 text-primary/80 shrink-0" />
              )}
              <span className="truncate">
                {isCurated ? (
                  <span>
                    {tEvents('curatedBy')} <span className="font-medium text-foreground">{organizerAttribution}</span>
                  </span>
                ) : (
                  <span>
                    {tEvents('organizedBy')} <span className="font-medium text-foreground">{organizerAttribution}</span>
                  </span>
                )}
              </span>
            </div>
          )}

          {event.venue && (
            <div className="flex items-start gap-1.5 pt-1">
              <Building2 className="h-3.5 w-3.5 text-primary/80 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <Link href={`/${locale}/venues/${event.venue.slug}`} className="relative z-10 font-medium text-foreground line-clamp-1 hover:underline hover:text-primary transition-colors">
                  {event.venue.name}
                </Link>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3 inline text-muted-foreground" />
                  {event.venue.city}
                  {event.venueHall && ` • ${event.venueHall.name}`}
                </span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-0 pt-3 border-t border-border/60 flex items-center justify-between relative z-10">
          <div className="flex flex-col">
            <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
              {temporal.isPast ? (tCom('date') || 'Status') : (tTick('price') || 'Price')}
            </span>
            <span className="text-sm font-extrabold text-foreground tabular-nums">
              {temporal.isPast ? tEvents('concluded') : priceDisplay}
            </span>
          </div>

          <Link
            href={`/${locale}/events/${event.slug}`}
            className={cn(
              buttonVariants({ variant: temporal.isPast ? 'outline' : 'default', size: 'sm' }),
              'gap-1 text-xs font-semibold shadow-sm min-h-[44px] min-w-[44px] px-3.5 cursor-pointer'
            )}
          >
            <Ticket className="h-3.5 w-3.5" />
            <span>{temporal.isPast ? (tCom('viewDetails') || 'View Details') : (tTick('viewPass') || 'View Pass')}</span>
            <ArrowRight className="h-3 w-3 ml-0.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
});
