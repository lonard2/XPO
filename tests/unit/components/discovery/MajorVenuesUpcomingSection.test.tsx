import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MajorVenuesUpcomingSection } from '@/components/discovery/MajorVenuesUpcomingSection';
import { VenueWithEvents } from '@/types/discovery';

const mockVenues: VenueWithEvents[] = [
  {
    id: 'venue-jiexpo',
    name: 'JIExpo Kemayoran',
    slug: 'jiexpo-kemayoran',
    city: 'Jakarta Pusat',
    address: 'Gedung Pusat Niaga Lt. 1',
    transitInfo: 'TransJakarta Corridor 2C, KRL Kemayoran',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
    regionCode: 'id',
    halls: [
      { id: 'h1', name: 'Hall A1', capacity: 5000, floorAreaSqm: 4000 },
      { id: 'h2', name: 'Hall D2', capacity: 8000, floorAreaSqm: 6500 },
    ],
    events: [
      {
        id: 'evt-1',
        title: 'Manufacturing Indonesia 2026',
        slug: 'manufacturing-indonesia-2026',
        archetype: 'INDUSTRIAL_B2B',
        startDate: '2026-12-02T09:00:00Z',
        endDate: '2026-12-05T18:00:00Z',
        venueHallName: 'Hall A1-D2',
        minPrice: 0,
      },
      {
        id: 'evt-2',
        title: 'Jakarta Mega Fair 2026',
        slug: 'jakarta-mega-fair-2026',
        archetype: 'MEGA_EXPO_PAVILION',
        startDate: '2026-06-10T10:00:00Z',
        endDate: '2026-07-12T22:00:00Z',
        venueHallName: 'Open Space Arena',
        minPrice: 50000,
      },
    ],
  },
];

const concludedOnlyVenues: VenueWithEvents[] = [
  {
    id: 'venue-concluded',
    name: 'ICE BSD City',
    slug: 'ice-bsd-city',
    city: 'Tangerang',
    address: 'BSD City',
    transitInfo: 'KRL Rawa Buntu',
    imageUrl: null,
    regionCode: 'id',
    halls: [{ id: 'h3', name: 'Nusantara Hall 2', capacity: 9000, floorAreaSqm: 7000 }],
    events: [
      {
        id: 'evt-past',
        title: 'Concluded Automation Expo 2026',
        slug: 'concluded-automation-expo-2026',
        archetype: 'INDUSTRIAL_B2B',
        startDate: '2026-02-01T09:00:00Z',
        endDate: '2026-02-04T18:00:00Z',
        venueHallName: 'Nusantara Hall 2',
        minPrice: 0,
      },
    ],
  },
];

describe('MajorVenuesUpcomingSection', () => {
  beforeEach(() => {
    // Fixed clock so fixtures stay meaningful; the section filters on the current time.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-16T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders section title and country edition spotlight header', () => {
    render(
      <MajorVenuesUpcomingSection
        venues={mockVenues}
        locale="en"
        regionCode="id"
      />
    );

    expect(screen.getByText('Happening at Major Venues')).toBeDefined();
    expect(screen.getByText(/Indonesia Edition Spotlight/i)).toBeDefined();
  });

  it('renders venue details and up to 3 near-upcoming events with exact hall badges', () => {
    render(
      <MajorVenuesUpcomingSection
        venues={mockVenues}
        locale="en"
        regionCode="id"
      />
    );

    expect(screen.getByText('JIExpo Kemayoran')).toBeDefined();
    expect(screen.getByText('Jakarta Pusat')).toBeDefined();
    expect(screen.getByText('Manufacturing Indonesia 2026')).toBeDefined();
    expect(screen.getByText('Hall A1-D2')).toBeDefined();
  });

  it('does not list concluded events under the current and near-upcoming heading', () => {
    // Regression: the card sliced the raw event list, so ended events appeared under
    // "Current & Near-Upcoming Events".
    render(
      <MajorVenuesUpcomingSection
        venues={mockVenues}
        locale="en"
        regionCode="id"
      />
    );

    expect(screen.queryByText('Jakarta Mega Fair 2026')).toBeNull();
  });

  it('drops a venue that has nothing attendable instead of repeating the empty state', () => {
    // Regression: four of six venue cards printed the same "nothing this week" message.
    render(
      <MajorVenuesUpcomingSection
        venues={[...mockVenues, ...concludedOnlyVenues]}
        locale="en"
        regionCode="id"
      />
    );

    expect(screen.getByText('JIExpo Kemayoran')).toBeDefined();
    expect(screen.queryByText('ICE BSD City')).toBeNull();
  });

  it('explains itself once when no venue has anything attendable', () => {
    render(
      <MajorVenuesUpcomingSection
        venues={concludedOnlyVenues}
        locale="en"
        regionCode="id"
      />
    );

    expect(screen.queryByText('ICE BSD City')).toBeNull();
    expect(screen.getByText('No public events scheduled this week')).toBeDefined();
  });

  it('returns null gracefully when empty venues array is provided', () => {
    const { container } = render(
      <MajorVenuesUpcomingSection
        venues={[]}
        locale="en"
        regionCode="id"
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
