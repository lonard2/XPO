'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Ticket,
  QrCode,
  Calendar,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Search,
  X,
  Globe2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button, buttonVariants } from '@/components/ui/Button';
import { formatDateRange } from '@/lib/i18n/formatters';
import { generateSvgQrCode } from '@/lib/tickets/qrPass';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export interface BookingSummary {
  id: string;
  status: string;
  qrCodeHash: string;
  attendeeName: string;
  attendeeEmail: string;
  createdAt: Date | string;
  ticketTier: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  event: {
    id: string;
    title: string;
    slug: string;
    startDate: Date | string;
    endDate: Date | string;
    venue: {
      name: string;
      city: string;
      region?: {
        code: string;
        name: string;
      };
    };
    venueHall?: {
      name: string;
    } | null;
  };
}

export interface PassWalletExplorerProps {
  bookings: BookingSummary[];
  locale: string;
}

export function PassWalletExplorer({ bookings, locale }: PassWalletExplorerProps) {
  const tMy = useTranslations('myTickets');
  const tTix = useTranslations('tickets');
  const tCom = useTranslations('common');

  const [activeTab, setActiveTab] = React.useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [selectedRegion, setSelectedRegion] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const now = new Date();

  // Helper to compute event temporal status
  const getEventTemporalStatus = (startDateStr: Date | string, endDateStr: Date | string) => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (now >= start && now <= end) {
      return { label: 'Happening Today', isToday: true, isPast: false };
    }
    if (now > end) {
      return { label: 'Concluded Expo', isToday: false, isPast: true };
    }

    const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      return { label: 'Starts Tomorrow', isToday: false, isPast: false };
    }
    if (diffDays <= 7) {
      return { label: `Starts in ${diffDays} days`, isToday: false, isPast: false };
    }
    return { label: 'Upcoming Expo', isToday: false, isPast: false };
  };

  // Categorize and filter passes
  const filteredBookings = React.useMemo(() => {
    return bookings.filter((booking) => {
      const end = new Date(booking.event.endDate);
      const isPast = now > end;

      // 1. Tab filter
      if (activeTab === 'upcoming' && isPast) return false;
      if (activeTab === 'past' && !isPast) return false;

      // 2. Region filter
      const regionCode = (booking.event.venue.region?.code || '').toLowerCase();
      if (selectedRegion === 'id' && regionCode !== 'id') return false;
      if (selectedRegion === 'jp' && regionCode !== 'jp') return false;
      if (selectedRegion === 'global' && !['gl', 'global', 'sg', 'de', 'uk', 'us'].includes(regionCode)) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = booking.event.title.toLowerCase().includes(q);
        const venueMatch = booking.event.venue.name.toLowerCase().includes(q);
        const cityMatch = booking.event.venue.city.toLowerCase().includes(q);
        const hallMatch = (booking.event.venueHall?.name || '').toLowerCase().includes(q);
        const attendeeMatch = booking.attendeeName.toLowerCase().includes(q);
        const refMatch = booking.id.toLowerCase().includes(q);

        if (!titleMatch && !venueMatch && !cityMatch && !hallMatch && !attendeeMatch && !refMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const startA = new Date(a.event.startDate).getTime();
      const startB = new Date(b.event.startDate).getTime();
      // For upcoming: earliest first. For past: most recent first.
      return activeTab === 'past' ? startB - startA : startA - startB;
    });
  }, [bookings, activeTab, selectedRegion, searchQuery, now]);

  const upcomingCount = bookings.filter((b) => now <= new Date(b.event.endDate)).length;
  const pastCount = bookings.filter((b) => now > new Date(b.event.endDate)).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Controls Bar: Tabs, Country Switcher & Search */}
      <div className="space-y-4 p-4 rounded-3xl border border-border/80 bg-card shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Triage Tabs (Upcoming vs Past) */}
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-2xl border border-border/60">
            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2',
                activeTab === 'upcoming'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>Upcoming Passes</span>
              <span className="text-xs font-mono opacity-80 px-1.5 py-0.5 rounded bg-muted">
                {upcomingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('past')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2',
                activeTab === 'past'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>Past Expos</span>
              <span className="text-xs font-mono opacity-80 px-1.5 py-0.5 rounded bg-muted">
                {pastCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2',
                activeTab === 'all'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span>All ({bookings.length})</span>
            </button>
          </div>

          {/* Regional Pills & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Region Selector Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedRegion('all')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer whitespace-nowrap',
                  selectedRegion === 'all'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                All Regions
              </button>
              <button
                type="button"
                onClick={() => setSelectedRegion('id')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer whitespace-nowrap',
                  selectedRegion === 'id'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                Indonesia (ID)
              </button>
              <button
                type="button"
                onClick={() => setSelectedRegion('jp')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer whitespace-nowrap',
                  selectedRegion === 'jp'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                Japan (JP)
              </button>
              <button
                type="button"
                onClick={() => setSelectedRegion('global')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer whitespace-nowrap',
                  selectedRegion === 'global'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                Global Gateways
              </button>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full sm:w-64">
              <Input
                aria-label="Search passes by event, venue, or hall"
                placeholder="Search event, venue, or hall..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                iconPrefix={<Search className="h-4 w-4 text-muted-foreground" />}
                className="h-10 text-xs pr-8"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Summary Bar */}
        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{filteredBookings.length}</strong> of{' '}
            <strong className="text-foreground">{bookings.length}</strong> registered passes
          </span>

          {(searchQuery || selectedRegion !== 'all' || activeTab !== 'upcoming') && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('upcoming');
                setSelectedRegion('all');
                setSearchQuery('');
              }}
              className="text-primary hover:underline text-xs font-semibold cursor-pointer"
            >
              Reset view
            </button>
          )}
        </div>
      </div>

      {/* Bookings Card Grid */}
      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBookings.map((booking) => {
            const formattedDate = formatDateRange(
              booking.event.startDate,
              booking.event.endDate,
              locale
            );
            const isCheckedIn = booking.status === 'CHECKED_IN';
            const isCancelled = booking.status === 'CANCELLED';
            const temporalStatus = getEventTemporalStatus(
              booking.event.startDate,
              booking.event.endDate
            );

            // Generate Mini SVG QR Code with accessible image container
            const miniSvgQr = generateSvgQrCode(booking.qrCodeHash, {
              size: 140,
              primaryColor: '#0f172a',
            });

            return (
              <div
                key={booking.id}
                className="group relative rounded-3xl border border-border/80 bg-card hover:border-primary/60 transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                {/* Card Header Strip */}
                <div className="p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" size="sm" className="font-semibold uppercase tracking-wider text-xs">
                      {booking.ticketTier.name}
                    </Badge>

                    {isCheckedIn ? (
                      <Badge variant="success" size="sm" className="gap-1 font-semibold text-xs">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{tTix('verifiedStatus') || 'Checked In'}</span>
                      </Badge>
                    ) : isCancelled ? (
                      <Badge variant="outline" size="sm" className="border-red-500 text-red-500 text-xs">
                        <span>{tCom('cancel') || 'Cancelled'}</span>
                      </Badge>
                    ) : temporalStatus.isToday ? (
                      <Badge variant="success" size="sm" className="gap-1 font-semibold text-xs">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Happening Today</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="sm" className="font-semibold text-xs">
                        <span>{temporalStatus.label}</span>
                      </Badge>
                    )}
                  </div>

                  {/* Title & Spatial Hall Wayfinding */}
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-foreground line-clamp-2">
                      <Link
                        href={`/${locale}/my-tickets/${booking.id}`}
                        className="hover:text-primary transition-colors after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-3xl"
                      >
                        {booking.event.title}
                      </Link>
                    </h2>

                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground pt-0.5">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{booking.event.venue.name}</span>
                      </div>
                      {booking.event.venueHall?.name && (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-foreground/80 pl-4.5">
                          <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{booking.event.venueHall.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* QR Thumbnail & Metadata Row */}
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-muted/40 border border-border/50">
                    <div
                      role="img"
                      aria-label={`QR Admission Pass Code for ${booking.attendeeName}`}
                      className="w-16 h-16 bg-white p-1 rounded-xl border border-slate-200 shrink-0 select-none shadow-2xs"
                      dangerouslySetInnerHTML={{ __html: miniSvgQr }}
                    />
                    <div className="min-w-0 flex-1 space-y-1 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground font-mono text-[11px]">
                        <Calendar className="h-3 w-3 shrink-0 text-primary" />
                        <span className="truncate">{formattedDate}</span>
                      </div>
                      <p className="font-semibold text-foreground truncate">
                        {booking.attendeeName}
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground truncate">
                        Pass Ref: {booking.id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-muted/30 border-t border-border/80 mt-auto relative z-10">
                  <Link
                    href={`/${locale}/my-tickets/${booking.id}`}
                    className={cn(
                      buttonVariants({ variant: 'default', size: 'sm' }),
                      'w-full justify-center gap-2 text-xs font-semibold shadow-xs cursor-pointer'
                    )}
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>{tMy('showPass') || 'Open Digital Pass & Treats'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border bg-card/40 space-y-4 max-w-lg mx-auto">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Ticket className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {tMy('noPassesTitle') || 'No Passes Found in this View'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {searchQuery
                ? `No passes match "${searchQuery}". Try resetting your search filters.`
                : activeTab === 'past'
                ? 'You have no concluded event passes.'
                : tMy('noPassesDesc') || 'You have no active convention passes reserved yet.'}
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            {(searchQuery || selectedRegion !== 'all' || activeTab !== 'upcoming') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveTab('upcoming');
                  setSelectedRegion('all');
                  setSearchQuery('');
                }}
                className="text-xs cursor-pointer"
              >
                Reset Filters
              </Button>
            )}
            <Link
              href={`/${locale}/events`}
              className={cn(
                buttonVariants({ variant: 'default', size: 'sm' }),
                'gap-2 text-xs font-semibold cursor-pointer'
              )}
            >
              <span>{tMy('browseEvents') || 'Discover Upcoming Events'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
