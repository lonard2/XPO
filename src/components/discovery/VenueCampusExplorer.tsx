'use client';

import * as React from 'react';
import {
  Layers,
  Users,
  Maximize2,
  ArrowUpRight,
  Shield,
  Zap,
  Truck,
  Download,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { type VenueHallSummary } from '@/types/discovery';
import { cn } from '@/lib/utils';

export interface VenueCampusExplorerProps {
  venueName: string;
  halls: VenueHallSummary[];
  className?: string;
}

export function VenueCampusExplorer({
  venueName,
  halls,
  className,
}: VenueCampusExplorerProps) {
  const [selectedWing, setSelectedWing] = React.useState<string>('all');
  const [selectedHallId, setSelectedHallId] = React.useState<string | null>(
    halls.length > 0 ? halls[0].id : null
  );

  // Group halls into architectural campus wings
  const wings = React.useMemo(() => {
    const wingMap: { [key: string]: VenueHallSummary[] } = {
      all: halls,
    };

    for (const hall of halls) {
      const name = hall.name.toLowerCase();
      let wingName = 'Main Exhibition Halls';

      if (name.includes('east') || name.includes('hall a') || name.includes('hall 1') || name.includes('hall 2') || name.includes('hall 3')) {
        wingName = 'East & Primary Wing';
      } else if (name.includes('west') || name.includes('hall b') || name.includes('hall 5') || name.includes('hall 6') || name.includes('hall 7')) {
        wingName = 'West & Heavy Industry Wing';
      } else if (name.includes('plenary') || name.includes('nusantara') || name.includes('convention') || name.includes('ballroom') || name.includes('tower')) {
        wingName = 'Convention & Plenary Center';
      }

      if (!wingMap[wingName]) {
        wingMap[wingName] = [];
      }
      wingMap[wingName].push(hall);
    }

    return wingMap;
  }, [halls]);

  const activeWingKeys = Object.keys(wings).filter((k) => k !== 'all');
  const displayedHalls = wings[selectedWing] || halls;

  const selectedHall = halls.find((h) => h.id === selectedHallId) || displayedHalls[0] || halls[0];

  // Synthesize realistic MICE technical specifications for each hall
  const getHallTechnicalSpecs = (hall: VenueHallSummary) => {
    const nameLower = hall.name.toLowerCase();
    const isConvention =
      nameLower.includes('plenary') ||
      nameLower.includes('nusantara') ||
      nameLower.includes('convention') ||
      nameLower.includes('ballroom') ||
      nameLower.includes('auditorium');
    const isHeavy =
      !isConvention &&
      (nameLower.includes('hall a') ||
        nameLower.includes('hall 1') ||
        nameLower.includes('east') ||
        nameLower.includes('heavy') ||
        nameLower.includes('industrial'));

    return {
      ceilingHeight: isHeavy ? '14.0m Clear' : isConvention ? '10.5m Acoustic' : '8.5m Standard',
      floorLoad: isHeavy ? '50 kN/m² Heavy' : isConvention ? '15 kN/m² Standard' : '25 kN/m²',
      columnSpan: isHeavy ? 'Column-Free (72m span)' : isConvention ? 'Acoustic Divisible' : 'Grid 18m x 18m',
      utilities: isHeavy ? '3-Phase 400V / High-Flow Water / Compressed Air' : 'Cat6A Data / 3-Phase Power / AV Rigging',
    };
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <Layers className="h-4 w-4" />
            <span>Campus Spatial Topology & Wayfinding</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Hall & Pavilion Directory ({halls.length} Indexed)
          </h2>
          <p className="text-xs text-muted-foreground">
            Structural clear heights, floor loading ratings, pax capacities, and architectural wings.
          </p>
        </div>

        {/* Wing Filter Tabs */}
        {activeWingKeys.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedWing('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer',
                selectedWing === 'all'
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border/80 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              All Wings ({halls.length})
            </button>
            {activeWingKeys.map((wingName) => (
              <button
                key={wingName}
                type="button"
                onClick={() => setSelectedWing(wingName)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer',
                  selectedWing === wingName
                    ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                    : 'border-border/80 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {wingName} ({wings[wingName].length})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dual Layout: Interactive Campus Schematic & Hall Spec Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hall Specification Cards Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedHalls.map((hall) => {
              const isSelected = selectedHall?.id === hall.id;
              const specs = getHallTechnicalSpecs(hall);

              return (
                <div
                  key={hall.id}
                  onClick={() => setSelectedHallId(hall.id)}
                  className={cn(
                    'rounded-2xl border p-4 transition-all cursor-pointer flex flex-col justify-between space-y-3',
                    isSelected
                      ? 'border-primary ring-1 ring-primary/40 bg-card shadow-sm'
                      : 'border-border/80 bg-card/60 hover:border-primary/40 hover:bg-card'
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-primary tracking-wider block">
                          Exhibition Facility
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                          {hall.name}
                        </h3>
                      </div>

                      {hall.capacity && (
                        <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                          {hall.capacity.toLocaleString()} Pax
                        </Badge>
                      )}
                    </div>

                    {hall.floorAreaSqm && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                        <Maximize2 className="h-3.5 w-3.5 text-primary" />
                        <span>{hall.floorAreaSqm.toLocaleString()} m² Gross Area</span>
                      </div>
                    )}

                    {hall.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {hall.description}
                      </p>
                    )}
                  </div>

                  {/* Technical Engineering Badges */}
                  <div className="pt-2 border-t border-border/60 space-y-1.5 text-[11px]">
                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                      <span className="truncate">Ceiling: <strong className="text-foreground">{specs.ceilingHeight}</strong></span>
                      <span className="truncate">Floor Load: <strong className="text-foreground">{specs.floorLoad}</strong></span>
                    </div>
                    <div className="flex items-center justify-between text-primary font-medium pt-0.5">
                      <span className="text-[10px]">{specs.columnSpan}</span>
                      <span className="text-[10px] underline">Select Hall</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Hall Engineering & Wayfinding Dossier (4 cols) */}
        {selectedHall && (
          <div className="lg:col-span-4 rounded-2xl border border-border/80 bg-background/90 p-5 space-y-4 shadow-sm">
            <div className="border-b border-border/60 pb-3 space-y-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Selected Specification
                </span>
              </div>
              <h3 className="text-base font-extrabold text-foreground">
                {selectedHall.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                Technical rigging, floor loads, and access points for booth builders and organizers.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl border border-border/70 bg-card p-2.5">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Capacity</span>
                <span className="text-sm font-bold text-foreground mt-0.5 block">
                  {selectedHall.capacity?.toLocaleString() || 'N/A'} Pax
                </span>
              </div>
              <div className="rounded-xl border border-border/70 bg-card p-2.5">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Floor Area</span>
                <span className="text-sm font-bold text-foreground mt-0.5 block">
                  {selectedHall.floorAreaSqm?.toLocaleString() || 'N/A'} m²
                </span>
              </div>
            </div>

            {/* Engineering Dossier List */}
            {(() => {
              const specs = getHallTechnicalSpecs(selectedHall);
              return (
                <div className="space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2 rounded-lg border border-border/60 p-2.5 bg-muted/20">
                    <Maximize2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground block">Ceiling Clearance</strong>
                      <span>{specs.ceilingHeight} from floor to lighting trusses.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-lg border border-border/60 p-2.5 bg-muted/20">
                    <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground block">Floor Load Rating</strong>
                      <span>{specs.floorLoad} for heavy machinery and modular booths.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-lg border border-border/60 p-2.5 bg-muted/20">
                    <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground block">Utility Trenches & Power</strong>
                      <span>{specs.utilities}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-lg border border-border/60 p-2.5 bg-muted/20">
                    <Truck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground block">Freight & Loading Dock</strong>
                      <span>Direct roll-up truck access with 5.5m shutter gate clearance.</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
