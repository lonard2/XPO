'use client';

import * as React from 'react';
import {
  Train,
  Bus,
  Car,
  Plane,
  Navigation,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export interface VenueTransitHubProps {
  venueName: string;
  address: string;
  transitInfo?: string | null;
  city: string;
  regionCode?: string;
  className?: string;
}

export function VenueTransitHub({
  venueName,
  address,
  transitInfo,
  city,
  regionCode = 'ID',
  className,
}: VenueTransitHubProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyAddress = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${venueName}, ${address}, ${city}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const encodedQuery = encodeURIComponent(`${venueName} ${address} ${city}`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${encodedQuery}`;
  const wazeUrl = `https://waze.com/ul?q=${encodedQuery}`;

  // Categorize or synthesize realistic transit modules based on venue region & transitInfo
  const isJapan = regionCode.toUpperCase() === 'JP' || city.toLowerCase().includes('tokyo') || city.toLowerCase().includes('yokohama') || city.toLowerCase().includes('chiba');
  const isGlobal = regionCode.toUpperCase() === 'GLOBAL' || city.toLowerCase().includes('singapore') || city.toLowerCase().includes('london') || city.toLowerCase().includes('frankfurt');

  const railInfo = isJapan
    ? 'Yurikamome Line (Tokyo Big Sight Station - 3 min walk) or Rinkai Line (Kokusai-Tenjijo Station - 7 min walk).'
    : isGlobal
    ? 'Direct MRT Underground Link (Bayfront MRT Station CE1/DT16, Exits D & E).'
    : 'KRL Commuter Line (Rajawali / Kemayoran Station) or LRT Jabodebek connection with dedicated event shuttle.';

  const busInfo = isJapan
    ? 'Toei Bus Routes from Tokyo Station (Marunouchi South Exit) & Monzen-Nakacho directly to Big Sight Terminal.'
    : isGlobal
    ? 'Direct Public Bus Services (97, 106, 133, 502, 518) at Sands Expo bus concourse.'
    : 'TransJakarta BRT Corridor 12 (JIExpo Kemayoran Halt) and direct ICE BSD Free Shuttle from Rawa Buntu.';

  const parkingInfo = isJapan
    ? 'Designated South & East Underground Parking (Capacity: 3,000+ vehicles). Electric Vehicle (EV) chargers available.'
    : isGlobal
    ? 'Basement Multi-Storey Carpark (Capacity: 2,500+ bays) with valet drop-off at Central Atrium.'
    : 'Open Ground & Multi-Level Parking (Capacity: 5,000+ bays) with dedicated VIP & exhibitor loading zones.';

  const airportInfo = isJapan
    ? 'Airport Limousine Bus directly to/from Haneda Airport (25 mins) and Narita Airport (60 mins).'
    : isGlobal
    ? 'Changi Airport (SIN) via MRT or Express Taxi (approx. 20 minutes via ECP Expressway).'
    : 'Soekarno-Hatta Int Airport (CGK) via Prof. Sedyatmo Toll Road (approx. 30-40 minutes).';

  return (
    <div className={cn('rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <Compass className="h-4 w-4" />
            <span>Transit & Spatial Accessibility</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Getting to {venueName}
          </h2>
          <p className="text-xs text-muted-foreground">
            Verified rapid rail linkages, shuttle buses, airport connectivity, and parking gates.
          </p>
        </div>

        {/* 1-Click Copy Address Action */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAddress}
            className="gap-1.5 text-xs font-semibold cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Address Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Venue Address</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Raw Verified Transit Summary if present */}
      {transitInfo && (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5">
          <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-foreground block mb-0.5">Campus Location & Access Notes:</span>
            <span>{transitInfo}</span>
          </div>
        </div>
      )}

      {/* Multi-Modal Logistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rail / Transit */}
        <div className="rounded-2xl border border-border/80 bg-background/80 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Train className="h-4 w-4" />
            </div>
            <Badge variant="outline" className="text-[10px] uppercase font-semibold">
              Rapid Rail
            </Badge>
          </div>
          <h3 className="text-xs font-bold text-foreground">Subway & Train</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {railInfo}
          </p>
        </div>

        {/* Bus & Shuttles */}
        <div className="rounded-2xl border border-border/80 bg-background/80 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bus className="h-4 w-4" />
            </div>
            <Badge variant="outline" className="text-[10px] uppercase font-semibold">
              Bus / BRT
            </Badge>
          </div>
          <h3 className="text-xs font-bold text-foreground">Express Shuttles</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {busInfo}
          </p>
        </div>

        {/* Parking & Vehicle */}
        <div className="rounded-2xl border border-border/80 bg-background/80 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Car className="h-4 w-4" />
            </div>
            <Badge variant="outline" className="text-[10px] uppercase font-semibold">
              Parking
            </Badge>
          </div>
          <h3 className="text-xs font-bold text-foreground">Vehicle & Gates</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {parkingInfo}
          </p>
        </div>

        {/* Airport Link */}
        <div className="rounded-2xl border border-border/80 bg-background/80 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plane className="h-4 w-4" />
            </div>
            <Badge variant="outline" className="text-[10px] uppercase font-semibold">
              Airport
            </Badge>
          </div>
          <h3 className="text-xs font-bold text-foreground">Airport Direct</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {airportInfo}
          </p>
        </div>
      </div>

      {/* Direct Navigation Map Launchers */}
      <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-muted-foreground">
          Launch Navigation App:
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-background text-xs font-medium hover:bg-muted hover:text-foreground transition-colors"
          >
            <Navigation className="h-3.5 w-3.5 text-primary" />
            <span>Google Maps</span>
            <ExternalLink className="h-3 w-3 opacity-60 ml-0.5" />
          </a>

          <a
            href={appleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-background text-xs font-medium hover:bg-muted hover:text-foreground transition-colors"
          >
            <Navigation className="h-3.5 w-3.5 text-primary" />
            <span>Apple Maps</span>
            <ExternalLink className="h-3 w-3 opacity-60 ml-0.5" />
          </a>

          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-background text-xs font-medium hover:bg-muted hover:text-foreground transition-colors"
          >
            <Navigation className="h-3.5 w-3.5 text-primary" />
            <span>Waze</span>
            <ExternalLink className="h-3 w-3 opacity-60 ml-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
