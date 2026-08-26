'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Train,
  Layers,
  Users,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { useTranslations } from 'next-intl';
import { type VenueSummary } from '@/types/discovery';
import { cn } from '@/lib/utils';

export interface VenueSpotlightCardProps {
  venue: VenueSummary;
  locale: string;
  className?: string;
}

export function VenueSpotlightCard({
  venue,
  locale,
  className,
}: VenueSpotlightCardProps) {
  const tReg = useTranslations('regions');
  const tCom = useTranslations('common');
  const tVen = useTranslations('venues');
  const tFoot = useTranslations('footer');

  const hallCount = venue.halls?.length ?? venue._count?.halls ?? (venue as any).hallCount ?? 0;
  const calculatedCapacity = venue.halls?.reduce((sum, h) => sum + (h.capacity || 0), 0) || (venue as any).capacity || 0;
  const calculatedFloorArea = venue.halls?.reduce((sum, h) => sum + (h.floorAreaSqm || 0), 0) || (venue as any).floorAreaSqm || 0;

  const regionCode = (venue.region?.code || venue.regionId || 'ID').toUpperCase();
  const venueUrl = `/${locale}/venues/${venue.slug}`;

  return (
    <Card
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden border-border/80 bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1',
        className
      )}
    >
      {/* Venue Photo / Visual Banner */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted border-b border-border/60">
        {venue.imageUrl ? (
          <img
            src={venue.imageUrl}
            alt={venue.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-6">
            <Building2 className="h-10 w-10 text-primary/40" />
          </div>
        )}

        {/* Badges Over Image */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <Badge variant="default" className="text-xs uppercase font-bold tracking-wider shadow-sm">
            <Globe className="h-3 w-3 mr-1 inline" />
            {regionCode} Hub
          </Badge>
          <Badge variant="outline" className="text-xs font-mono bg-background/90 backdrop-blur-xs">
            {venue.city}
          </Badge>
        </div>

        <div className="absolute bottom-2.5 right-2.5 z-10">
          <Badge variant="outline" className="text-xs font-semibold bg-background/90 backdrop-blur-xs">
            <Layers className="h-3.5 w-3.5 mr-1 inline text-primary" />
            {hallCount > 0 ? `${hallCount} Halls` : 'Multi-Hall Complex'}
          </Badge>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
        <CardHeader className="p-0 space-y-1">
          <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-1">
            <Link
              href={venueUrl}
              className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {venue.name}
            </Link>
          </h3>

          <p className="text-xs text-muted-foreground flex items-center gap-1 line-clamp-1">
            <MapPin className="h-3.5 w-3.5 text-primary/70 shrink-0" />
            <span>{venue.address}</span>
          </p>
        </CardHeader>

        <CardContent className="p-0 space-y-3 text-xs text-muted-foreground">
          {/* Capacity and Specs Grid */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-2.5 text-xs">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[11px] uppercase font-medium">
                {tReg('capacity') || 'Capacity'}
              </span>
              <span className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                {calculatedCapacity > 0 ? `${calculatedCapacity.toLocaleString()} Pax` : 'Campus Scale'}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-muted-foreground text-[11px] uppercase font-medium">
                {tVen('grossSpace') || 'Floor Area'}
              </span>
              <span className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                <Layers className="h-3.5 w-3.5 text-primary" />
                {calculatedFloorArea > 0 ? `${calculatedFloorArea.toLocaleString()} sqm` : 'Multi-Hall Layout'}
              </span>
            </div>
          </div>

          {/* Transit Info */}
          {venue.transitInfo && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                <Train className="h-3.5 w-3.5 text-primary" />
                <span>{tCom('transit') || 'Transit & Access'}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {venue.transitInfo}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-0 pt-3 border-t border-border/60 flex items-center justify-between z-10 relative">
          <span className="text-xs font-medium text-muted-foreground">
            {tFoot('infrastructureBadge') || 'Verified Infrastructure'}
          </span>

          <Link
            href={venueUrl}
            className={buttonVariants({
              variant: 'ghost',
              size: 'sm',
              className: 'gap-1 text-xs font-semibold text-primary hover:bg-primary/10 cursor-pointer',
            })}
          >
            <span>{tReg('viewVenue') || 'View Venue'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
}
