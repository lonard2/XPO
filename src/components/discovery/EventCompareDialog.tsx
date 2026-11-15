'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import {
  formatCurrency,
  formatDateRange,
  type SupportedCurrency,
} from '@/lib/i18n/formatters';
import { type DiscoveryEvent } from '@/types/discovery';

export interface EventCompareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  events: DiscoveryEvent[];
  locale: string;
  onRemove: (id: string) => void;
}

function lowestPrice(event: DiscoveryEvent): { price: number; currency: string } {
  if (event.ticketTiers && event.ticketTiers.length > 0) {
    const tier = event.ticketTiers.reduce((lowest, current) =>
      current.price < lowest.price ? current : lowest
    );
    return { price: tier.price, currency: tier.currency };
  }
  return { price: 0, currency: event.region?.currency || 'IDR' };
}

export function EventCompareDialog({
  isOpen,
  onClose,
  events,
  locale,
  onRemove,
}: EventCompareDialogProps) {
  const tDisc = useTranslations('discovery');
  const tEvents = useTranslations('events');
  const tCom = useTranslations('common');
  const tVen = useTranslations('venues');

  React.useEffect(() => {
    if (isOpen && events.length === 0) onClose();
  }, [isOpen, events.length, onClose]);

  const formatLabel = (value: string) => {
    const labels: Record<string, string> = {
      IN_PERSON: tEvents('formatInPerson') || 'In Person',
      HYBRID: tEvents('formatHybrid') || 'Hybrid',
      VIRTUAL: tEvents('formatVirtual') || 'Virtual',
    };
    return labels[value.toUpperCase()] || value.replace(/_/g, ' ');
  };

  const scaleLabel = (value: string) => {
    const labels: Record<string, string> = {
      GLOBAL_MEGA: tEvents('scaleGlobalMega') || 'Global Mega',
      LARGE: tEvents('scaleLarge') || 'Large',
      MEDIUM: tEvents('scaleMedium') || 'Medium',
      EXECUTIVE: tEvents('scaleExecutive') || 'Executive',
    };
    return labels[value.toUpperCase()] || value.replace(/_/g, ' ');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tDisc('shortlistCompareTitle') || 'Compare Events'}
      description={tDisc('compareDesc') || 'Compare dates, halls, formats, and pass entry side by side.'}
      maxWidth="full"
      className="max-w-6xl"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-xs">
          <thead>
            <tr>
              <th scope="col" className="w-32 pb-3 pr-3 align-bottom text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {tDisc('compareAttribute') || 'Attribute'}
              </th>
              {events.map((event) => (
                <th key={event.id} scope="col" className="min-w-[170px] pb-3 pr-3 align-bottom">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/${locale}/events/${event.slug}`}
                      className="text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-3"
                    >
                      {event.title}
                    </Link>
                    <button
                      type="button"
                      onClick={() => onRemove(event.id)}
                      aria-label={`${tDisc('shortlistRemove') || 'Remove from comparison'}: ${event.title}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Link
                    href={`/${locale}/events/${event.slug}`}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    {tDisc('compareViewEvent') || 'View event'}
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            <tr>
              <th scope="row" className="py-3 pr-3 text-xs font-semibold text-muted-foreground">
                {tCom('date') || 'Dates'}
              </th>
              {events.map((event) => (
                <td key={event.id} className="py-3 pr-3 align-top text-foreground">
                  {formatDateRange(event.startDate, event.endDate, locale)}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="py-3 pr-3 text-xs font-semibold text-muted-foreground">
                {tCom('venue') || 'Venue'}
              </th>
              {events.map((event) => (
                <td key={event.id} className="py-3 pr-3 align-top text-foreground">
                  {event.venue?.name || '—'}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="py-3 pr-3 text-xs font-semibold text-muted-foreground">
                {tEvents('hallOrWing') || 'Hall / Wing'}
              </th>
              {events.map((event) => (
                <td key={event.id} className="py-3 pr-3 align-top text-foreground">
                  {event.venueHall?.name || tEvents('hallDefault') || 'Main Exhibition Halls'}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="py-3 pr-3 text-xs font-semibold text-muted-foreground">
                {tDisc('city') || 'City'}
              </th>
              {events.map((event) => (
                <td key={event.id} className="py-3 pr-3 align-top text-foreground">
                  {event.venue?.city || '—'}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="py-3 pr-3 text-xs font-semibold text-muted-foreground">
                {tDisc('format') || 'Format'}
              </th>
              {events.map((event) => (
                <td key={event.id} className="py-3 pr-3 align-top text-foreground">
                  {formatLabel(event.format)}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="py-3 pr-3 text-xs font-semibold text-muted-foreground">
                {tDisc('scale') || 'Scale'}
              </th>
              {events.map((event) => (
                <td key={event.id} className="py-3 pr-3 align-top text-foreground">
                  {scaleLabel(event.scale)}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="py-3 pr-3 text-xs font-semibold text-muted-foreground">
                {tEvents('priceFrom') || 'Pass Starting From'}
              </th>
              {events.map((event) => {
                const { price, currency } = lowestPrice(event);
                return (
                  <td key={event.id} className="py-3 pr-3 align-top font-semibold text-foreground">
                    {price > 0
                      ? formatCurrency(
                          price,
                          (currency as SupportedCurrency) || 'IDR',
                          locale
                        )
                      : tDisc('freeAdmission') || 'Free admission'}
                  </td>
                );
              })}
            </tr>
            <tr>
              <th scope="row" className="py-3 pr-3 text-xs font-semibold text-muted-foreground">
                {tEvents('tickets') || 'Ticket Passes'}
              </th>
              {events.map((event) => (
                <td key={event.id} className="py-3 pr-3 align-top text-foreground">
                  {event.ticketTiers && event.ticketTiers.length > 0 ? (
                    <ul className="space-y-1">
                      {event.ticketTiers.map((tier) => (
                        <li key={tier.id} className="flex items-baseline justify-between gap-2">
                          <span className="text-muted-foreground">{tier.name}</span>
                          <span className="font-mono text-xs font-semibold">
                            {tier.price > 0
                              ? formatCurrency(
                                  tier.price,
                                  (tier.currency as SupportedCurrency) || 'IDR',
                                  locale
                                )
                              : tDisc('freeAdmission') || 'Free'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground">
                      {tEvents('noPassesPublished') || 'Pass details in preparation'}
                    </span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className="py-3 pr-3 text-xs font-semibold text-muted-foreground">
                {tVen('transitGuide') || 'Transit'}
              </th>
              {events.map((event) => (
                <td key={event.id} className="py-3 pr-3 align-top text-muted-foreground">
                  {event.venue?.transitInfo ? (
                    <span className="line-clamp-4">{event.venue.transitInfo}</span>
                  ) : (
                    <span>—</span>
                  )}
                  {event.venue?.slug && (
                    <Link
                      href={`/${locale}/venues/${event.venue.slug}#venue-transit`}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      {tEvents('viewVenueTransit') || 'Venue & transit'}
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
