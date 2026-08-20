/**
 * XPO MICE Digital Ecosystem: Discovery & Faceted Search Type Definitions
 */

import { type MiceArchetype } from '@/lib/theming';

export type EventFormat = 'IN_PERSON' | 'HYBRID' | 'VIRTUAL';
export type EventScale = 'GLOBAL_MEGA' | 'LARGE' | 'MEDIUM' | 'EXECUTIVE';

export interface TicketTierSummary {
  id: string;
  name: string;
  price: number;
  currency: string;
  capacity?: number;
  soldCount?: number;
}

export interface VenueHallSummary {
  id: string;
  name: string;
  capacity?: number | null;
  floorAreaSqm?: number | null;
  description?: string | null;
}

export interface VenueSummary {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string;
  transitInfo: string;
  imageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  regionId?: string;
  region?: {
    id: string;
    code: string;
    name: string;
    currency: string;
  } | null;
  halls?: VenueHallSummary[];
  events?: DiscoveryEvent[];
  _count?: {
    halls?: number;
    events?: number;
  };
}

export interface DiscoveryEvent {
  id: string;
  title: string;
  slug: string;
  tagline?: string | null;
  description: string;
  archetype: MiceArchetype | string;
  startDate: Date | string;
  endDate: Date | string;
  isFeatured?: boolean;
  heroImageUrl?: string | null;
  brandingConfigJson?: string | null;
  scale: EventScale | string;
  format: EventFormat | string;
  regionId?: string;
  region?: {
    id: string;
    code: string;
    name: string;
    currency: string;
  } | null;
  venueId?: string;
  venue?: VenueSummary | null;
  venueHallId?: string | null;
  venueHall?: VenueHallSummary | null;
  ticketTiers?: TicketTierSummary[];
}

export interface BannerSlide {
  id: string;
  title: string;
  tagline?: string | null;
  slug: string;
  heroImageUrl?: string | null;
  archetype: MiceArchetype | string;
  startDate: Date | string;
  endDate: Date | string;
  venueName?: string;
  cityName?: string;
  regionCode?: string; // 'ID', 'JP', 'GL'
  format?: EventFormat | string;
  scale?: EventScale | string;
  minPrice?: number;
  currency?: string;
  isFeatured?: boolean;
}

export interface FilterState {
  keyword: string;
  region: string; // 'all' | 'id' | 'jp' | 'global'
  city: string; // 'all' | specific city
  archetype: string; // 'all' | specific archetype
  format: string; // 'all' | 'IN_PERSON' | 'HYBRID' | 'VIRTUAL'
  scale: string; // 'all' | 'GLOBAL_MEGA' | 'LARGE' | 'MEDIUM' | 'EXECUTIVE'
  dateRange: string; // 'all' | 'upcoming' | 'this_month' | 'next_month'
}
