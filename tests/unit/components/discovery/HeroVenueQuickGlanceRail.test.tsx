import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { HeroVenueQuickGlanceRail } from '@/components/discovery/HeroVenueQuickGlanceRail';
import { HeroSection } from '@/components/discovery/HeroSection';
import { VenueWithEvents, BannerSlide } from '@/types/discovery';

const mockVenues: VenueWithEvents[] = [
  {
    id: 'v1',
    name: 'JIExpo Kemayoran',
    slug: 'jiexpo-kemayoran',
    city: 'Jakarta Pusat',
    address: 'Gedung Pusat Niaga Lt. 1',
    transitInfo: 'TransJakarta Corridor 2C',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
    regionCode: 'id',
    halls: [{ id: 'h1', name: 'Hall A1', capacity: 5000, floorAreaSqm: 4000 }],
    events: [
      {
        id: 'e1',
        title: 'Manufacturing Indonesia 2026',
        slug: 'manufacturing-indonesia-2026',
        archetype: 'INDUSTRIAL_B2B',
        startDate: '2026-12-02T09:00:00Z',
        endDate: '2026-12-05T18:00:00Z',
        venueHallName: 'Hall A1',
        minPrice: 0,
      },
    ],
  },
];

const mockSlides: BannerSlide[] = [
  {
    id: 's1',
    title: 'Manufacturing Indonesia Expo 2026',
    slug: 'manufacturing-indonesia-2026',
    archetype: 'INDUSTRIAL_B2B',
    startDate: new Date('2026-12-02T09:00:00Z'),
    endDate: new Date('2026-12-05T18:00:00Z'),
    venueName: 'JIExpo Kemayoran',
    cityName: 'Jakarta',
    regionCode: 'ID',
    isFeatured: true,
  },
];

describe('HeroVenueQuickGlanceRail & HeroSection', () => {
  it('renders quick glance rail with venue name and event pills', () => {
    render(
      <HeroVenueQuickGlanceRail
        venues={mockVenues}
        locale="en"
        regionCode="id"
      />
    );

    expect(screen.getByText(/Major Venues in Indonesia/i)).toBeDefined();
    expect(screen.getByText('JIExpo Kemayoran')).toBeDefined();
    expect(screen.getByText('Manufacturing Indonesia 2026')).toBeDefined();
    expect(screen.getByText('Hall A1')).toBeDefined();
  });

  it('renders unified HeroSection combining carousel and attached rail', () => {
    render(
      <HeroSection
        slides={mockSlides}
        venues={mockVenues}
        locale="en"
        regionCode="id"
      />
    );

    expect(screen.getByText('Manufacturing Indonesia Expo 2026')).toBeDefined();
    expect(screen.getByText(/Major Venues in Indonesia/i)).toBeDefined();
  });
});
