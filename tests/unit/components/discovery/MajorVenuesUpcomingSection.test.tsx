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

    expect(screen.getAllByText('JIExpo Kemayoran').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Jakarta Pusat').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Manufacturing Indonesia 2026').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Hall A1-D2').length).toBeGreaterThan(0);
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

  it('keeps a venue in the spotlight even when it has nothing scheduled', () => {
    // Regression: filtering out venues with no near-term event left only JIExpo
    // Kemayoran in the Indonesia edition, hiding five of six venues entirely.
    render(
      <MajorVenuesUpcomingSection
        venues={[...mockVenues, ...concludedOnlyVenues]}
        locale="en"
        regionCode="id"
      />
    );

    expect(screen.getAllByText('JIExpo Kemayoran').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ICE BSD City').length).toBeGreaterThan(0);
  });

  it('lists every venue in the directory, including quiet ones', () => {
    const { container } = render(
      <MajorVenuesUpcomingSection
        venues={[...concludedOnlyVenues, ...mockVenues]}
        locale="en"
        regionCode="id"
      />
    );

    // The spotlight only carries venues with events; the directory carries all.
    const names = [...container.querySelectorAll('h3')].map((node) => node.textContent?.trim());
    expect(names).toEqual(['JIExpo Kemayoran']);

    const directory = container.querySelector('[data-venue-directory]');
    expect(directory).not.toBeNull();
    expect(directory?.textContent).toContain('JIExpo Kemayoran');
    expect(directory?.textContent).toContain('ICE BSD City');
    expect(directory?.textContent).toContain('No events announced yet');
  });

  it('localizes the hall count on a quiet card', () => {
    render(
      <MajorVenuesUpcomingSection
        venues={concludedOnlyVenues}
        locale="id"
        regionCode="id"
      />
    );

    expect(screen.getByText('1 Hall')).toBeDefined();
  });

  it('stretches every spotlight card to the row height', () => {
    const { container } = render(
      <MajorVenuesUpcomingSection
        venues={[...mockVenues, ...concludedOnlyVenues]}
        locale="en"
        regionCode="id"
      />
    );

    const cards = container.querySelectorAll('[data-venue-card]');
    expect(cards.length).toBe(1);
    for (const card of cards) {
      expect(card.className).toContain('h-full');
    }
  });

  it('does not hide a quiet venue behind a photo card', () => {
    const { container } = render(
      <MajorVenuesUpcomingSection
        venues={[...mockVenues, ...concludedOnlyVenues]}
        locale="en"
        regionCode="id"
      />
    );

    const directory = container.querySelector('[data-venue-directory]');
    expect(directory?.querySelector('img')).toBeNull();
    expect(directory?.textContent).toContain('Tangerang');
    expect(directory?.textContent).toContain('ICE BSD City');
  });

  it('says nothing is scheduled once, without a zero counter', () => {
    render(
      <MajorVenuesUpcomingSection
        venues={concludedOnlyVenues}
        locale="en"
        regionCode="id"
      />
    );

    // The venue keeps its card; only the event area is quiet.
    expect(screen.getAllByText('ICE BSD City').length).toBeGreaterThan(0);
    expect(screen.getByText('No events announced yet')).toBeDefined();
    expect(screen.queryByText(/0 LISTED/i)).toBeNull();
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
