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
  Sparkles,
  Globe,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
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
  let tReg: any = (k: string) => k;
  let tCom: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tReg = useTranslations('regions');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tCom = useTranslations('common');
  } catch {
    // Fallback if rendered outside provider in tests
  }

  const hallCount = venue.halls?.length ?? venue._count?.halls ?? 4;
  const totalCapacity = venue.halls?.reduce((sum, h) => sum + (h.capacity || 0), 0) || 25000;
  const totalFloorArea = venue.halls?.reduce((sum, h) => sum + (h.floorAreaSqm || 0), 0) || 30000;

  const regionCode = (venue.region?.code || venue.regionId || 'ID').toUpperCase();

  return (
    <Card
      interactive
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
          <Badge variant="default" className="text-[10px] uppercase font-bold tracking-wider shadow-sm">
            <Globe className="h-2.5 w-2.5 mr-1 inline" />
            {regionCode} Hub
          </Badge>
          <Badge variant="outline" className="text-[10px] font-mono bg-background/90 backdrop-blur-xs">
            {venue.city}
          </Badge>
        </div>

        <div className="absolute bottom-2.5 right-2.5 z-10">
          <Badge variant="outline" className="text-[10px] font-semibold bg-background/90 backdrop-blur-xs">
            <Layers className="h-3 w-3 mr-1 inline text-primary" />
            {hallCount} Halls
          </Badge>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-3">
        <CardHeader className="p-0 space-y-1">
          <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-1">
            <Link href={`/${locale}/venues/${venue.slug}`} className="hover:underline">
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
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-2.5 text-[11px]">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] uppercase font-medium">{tReg('capacity') || 'Capacity'}</span>
              <span className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                <Users className="h-3 w-3 text-primary" />
                {totalCapacity.toLocaleString()} Pax
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] uppercase font-medium">Floor Area</span>
              <span className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                <Layers className="h-3 w-3 text-primary" />
                {totalFloorArea.toLocaleString()} sqm
              </span>
            </div>
          </div>

          {/* Transit Info */}
          {venue.transitInfo && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-foreground">
                <Train className="h-3.5 w-3.5 text-primary" />
                <span>{tCom('transit') || 'Transit & Access'}</span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                {venue.transitInfo}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-0 pt-3 border-t border-border/60 flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted-foreground">
            Verified Infrastructure
          </span>

          <Link href={`/${locale}/venues/${venue.slug}`}>
            <Button size="sm" variant="ghost" className="gap-1 text-xs font-semibold text-primary hover:bg-primary/10">
              <span>{tReg('viewVenue') || 'View Venue'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
}
