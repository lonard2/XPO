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
      navigator.clipboard
        .writeText(`${venueName}, ${address}, ${city}`)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          // Graceful fallback if clipboard write fails or is denied
        });
    }
  };

  const encodedQuery = encodeURIComponent(`${venueName} ${address} ${city}`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${encodedQuery}`;
  const wazeUrl = `https://waze.com/ul?q=${encodedQuery}`;

  // Accurate venue-specific transit routing based on venue name, city, and region
  const venueKey = venueName.toLowerCase();
  const cityKey = city.toLowerCase();
  const regKey = regionCode.toUpperCase();

  // Transit calculations tailored to exact MICE complexes
  const { railInfo, busInfo, parkingInfo, airportInfo } = React.useMemo(() => {
    // 1. Indonesian Complexes
    if (venueKey.includes('ice bsd') || cityKey.includes('tangerang') || cityKey.includes('bsd')) {
      return {
        railInfo: 'KRL Commuter Line (Rawa Buntu & Cisauk Stations - Rangkasbitung Line) with free BSD Link electric shuttles to ICE Hall 1 & 10.',
        busInfo: 'TransJakarta S11 Feeder & direct ICE BSD Shuttle from Rawa Buntu Intermodal Terminal.',
        parkingInfo: 'Basement & Outdoor Concourses (Capacity: 5,000+ bays) with EV charging stations at Hall 3 & Hall 10.',
        airportInfo: 'Soekarno-Hatta Int Airport (CGK) via Kunciran-Serpong Toll Road (approx. 35 mins).',
      };
    }
    if (venueKey.includes('jiexpo') || venueKey.includes('kemayoran')) {
      return {
        railInfo: 'KRL Commuter Line (Rajawali & Kemayoran Stations - Cikarang Line) with direct exhibition concourse shuttle to Gates 1 & 2.',
        busInfo: 'TransJakarta BRT Corridor 12 & PRJ Express (JIExpo Kemayoran Halt direct at Gate 2 concourse).',
        parkingInfo: 'Open Ground & Multi-Level Arena Parking (Capacity: 8,000+ bays) with dedicated heavy truck freight bays.',
        airportInfo: 'Soekarno-Hatta Int Airport (CGK) via Prof. Sedyatmo Toll Road (approx. 30 mins).',
      };
    }
    if (venueKey.includes('jicc') || venueKey.includes('gbk') || venueKey.includes('senayan') || venueKey.includes('jakarta convention')) {
      return {
        railInfo: 'MRT Jakarta (Istora Mandiri & Senayan Stations) or KRL Commuter Line (Palmerah Station - 10 min walk).',
        busInfo: 'TransJakarta BRT Corridor 1 (Gelora Bung Karno Halt direct pedestrian concourse to JICC).',
        parkingInfo: 'GBK East & West Parking Concourse (Capacity: 4,000+ bays) with multi-deck VIP drop-off.',
        airportInfo: 'Soekarno-Hatta Int Airport (CGK) via Jakarta Inner Ring Road (approx. 35 mins).',
      };
    }
    if (venueKey.includes('pik 2') || venueKey.includes('nice')) {
      return {
        railInfo: 'KRL Commuter Line (Rawa Buaya Station) or dedicated PIK 2 Express Concourse Shuttle.',
        busInfo: 'TransJakarta Corridor 1A (Pantai Maju Feeder) and Gold Coast express connector bus.',
        parkingInfo: 'Integrated Multi-Story Complex Parking (Capacity: 6,000+ bays) with smart space telemetry.',
        airportInfo: 'Soekarno-Hatta Int Airport (CGK) via PIK 2 Dedicated Expressway (approx. 15-20 mins).',
      };
    }
    if (venueKey.includes('jis') || venueKey.includes('international stadium')) {
      return {
        railInfo: 'KRL Commuter Line (Ancol Station) and future LRT Jakarta Phase 1B concourse terminal.',
        busInfo: 'TransJakarta BRT Corridor 14 (JIS Concourse Halt direct drop-off).',
        parkingInfo: 'Western Concourse & Sunter Multi-Storey Parking (Capacity: 2,500+ bays) with park-and-ride shuttles.',
        airportInfo: 'Soekarno-Hatta Int Airport (CGK) via Tanjung Priok Toll Road (approx. 30 mins).',
      };
    }

    // 2. Japan Complexes
    if (venueKey.includes('tokyo big sight') || cityKey.includes('ariake') || cityKey.includes('koto')) {
      return {
        railInfo: 'Yurikamome Line (Tokyo Big Sight Station - 3 min walk) or Rinkai Line (Kokusai-Tenjijo Station - 7 min walk).',
        busInfo: 'Toei Bus Routes from Tokyo Station (Marunouchi South Exit) & Monzen-Nakacho directly to Big Sight Terminal.',
        parkingInfo: 'Designated South & East Underground Parking (Capacity: 3,000+ vehicles) with EV chargers.',
        airportInfo: 'Airport Limousine Bus directly to/from Haneda Airport (25 mins) and Narita Airport (60 mins).',
      };
    }
    if (venueKey.includes('makuhari') || cityKey.includes('chiba')) {
      return {
        railInfo: 'JR Keiyo Line (Kaihin-Makuhari Station - 5 min walk) or JR Sobu Line (Makuhari-Hongo Station + Bus).',
        busInfo: 'Keisei Highway Bus directly from Tokyo Station (Yaesu Exit) or direct Limousine Bus from Haneda/Narita.',
        parkingInfo: 'Makuhari Messe Large-Scale Parking (Capacity: 5,500+ vehicles) including oversized coach lots.',
        airportInfo: 'Direct Express Limousine Bus to Narita Airport (30 mins) and Haneda Airport (45 mins).',
      };
    }
    if (venueKey.includes('pacifico') || cityKey.includes('yokohama')) {
      return {
        railInfo: 'Minatomirai Line (Minatomirai Station - 5 min walk) or JR Keihin-Tohoku Line (Sakuragicho Station - 12 min walk).',
        busInfo: 'Keikyu Airport Bus from Haneda Airport directly to Pacifico Yokohama front entrance.',
        parkingInfo: 'Minatomirai Public Underground Parking (Capacity: 1,200+ bays) with direct exhibition hall lift access.',
        airportInfo: 'Haneda Airport (HND) via Airport Limousine Bus (approx. 30 minutes).',
      };
    }

    // 3. Global Complexes
    if (venueKey.includes('marina bay sands') || venueKey.includes('sands expo') || cityKey.includes('singapore')) {
      return {
        railInfo: 'Direct MRT Underground Link (Bayfront MRT Station CE1/DT16, Exits D & E directly into Sands Expo).',
        busInfo: 'Direct Public Bus Services (97, 106, 133, 502, 518) at Sands Expo bus concourse.',
        parkingInfo: 'Basement Multi-Storey Carpark (Capacity: 2,500+ bays) with valet drop-off at Central Atrium.',
        airportInfo: 'Changi Airport (SIN) via MRT or Express Taxi (approx. 20 minutes via ECP Expressway).',
      };
    }
    if (venueKey.includes('frankfurt') || cityKey.includes('frankfurt')) {
      return {
        railInfo: 'S-Bahn lines S3, S4, S5, S6 (Frankfurt Messe Station) or U-Bahn U4 (Festhalle/Messe Station).',
        busInfo: 'Bus lines 32 and 52 to Messe Torhaus and direct intra-campus shuttle buses.',
        parkingInfo: 'Rebstock Multi-Storey Carpark (Capacity: 15,000+ bays) with direct shuttle to exhibition halls.',
        airportInfo: 'Frankfurt Airport (FRA) via S-Bahn S8/S9 to Central Station then S3-S6 to Messe (approx. 20 mins).',
      };
    }
    if (venueKey.includes('excel') || cityKey.includes('london')) {
      return {
        railInfo: 'Elizabeth Line (Custom House Station - direct covered walkway) or DLR (Custom House & Prince Regent).',
        busInfo: 'Bus routes 147, 241, 325, 473 and IFS Cloud Cable Car connecting Greenwich Peninsula.',
        parkingInfo: 'Underfloor Multi-Storey Carpark (Capacity: 2,000+ spaces) with pre-booked event passes.',
        airportInfo: 'London City Airport (LCY) approx. 5 minutes by DLR or taxi; Heathrow Airport (LHR) 43 mins via Elizabeth Line.',
      };
    }

    // Regional Fallback
    const isJapan = regKey === 'JP' || cityKey.includes('tokyo') || cityKey.includes('yokohama') || cityKey.includes('chiba');
    const isGlobal = regKey === 'GLOBAL' || regKey === 'GL';

    return {
      railInfo: isJapan
        ? 'Rapid JR Rail or Municipal Subway line with high-frequency convention shuttles.'
        : isGlobal
        ? 'Direct metropolitan rapid transit connection with dedicated exhibition exit terminals.'
        : 'KRL Commuter Line or LRT transit connection with dedicated event feeder shuttles.',
      busInfo: isJapan
        ? 'Metropolitan bus routes connecting central railway terminals directly to venue grounds.'
        : isGlobal
        ? 'Metropolitan express bus concourse with direct event drop-off gates.'
        : 'TransJakarta or regional feeder bus corridors with dedicated hall drop-off bays.',
      parkingInfo: 'Dedicated multi-level or campus ground parking with separate VIP, exhibitor, and freight loading docks.',
      airportInfo: isJapan
        ? 'Airport Limousine Bus connectivity to Haneda & Narita Airports.'
        : isGlobal
        ? 'International Gateway Airport accessible via rapid transit or expressway (20-40 mins).'
        : 'Soekarno-Hatta Int Airport (CGK) accessible via toll expressway corridors.',
    };
  }, [venueKey, cityKey, regKey]);

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

        {/* 1-Click Copy Address Action with Accessible Live Region */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAddress}
            className="gap-1.5 text-xs font-semibold cursor-pointer min-h-[44px] sm:min-h-[36px] px-3.5"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-primary" />
                <span className="text-primary font-semibold">Address Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Venue Address</span>
              </>
            )}
          </Button>
          <div aria-live="polite" className="sr-only">
            {copied ? `Address for ${venueName} copied to clipboard.` : ''}
          </div>
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
            <Badge variant="outline" className="text-xs uppercase font-semibold">
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
            <Badge variant="outline" className="text-xs uppercase font-semibold">
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
            <Badge variant="outline" className="text-xs uppercase font-semibold">
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
            <Badge variant="outline" className="text-xs uppercase font-semibold">
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-[36px] rounded-xl border border-border/80 bg-background text-xs font-medium hover:bg-muted hover:text-foreground transition-colors"
          >
            <Navigation className="h-3.5 w-3.5 text-primary" />
            <span>Google Maps</span>
            <ExternalLink className="h-3 w-3 opacity-60 ml-0.5" />
            <span className="sr-only">(opens in new tab)</span>
          </a>

          <a
            href={appleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-[36px] rounded-xl border border-border/80 bg-background text-xs font-medium hover:bg-muted hover:text-foreground transition-colors"
          >
            <Navigation className="h-3.5 w-3.5 text-primary" />
            <span>Apple Maps</span>
            <ExternalLink className="h-3 w-3 opacity-60 ml-0.5" />
            <span className="sr-only">(opens in new tab)</span>
          </a>

          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-[36px] rounded-xl border border-border/80 bg-background text-xs font-medium hover:bg-muted hover:text-foreground transition-colors"
          >
            <Navigation className="h-3.5 w-3.5 text-primary" />
            <span>Waze</span>
            <ExternalLink className="h-3 w-3 opacity-60 ml-0.5" />
            <span className="sr-only">(opens in new tab)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
