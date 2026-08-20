import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VenueSpotlightCard } from '@/components/discovery/VenueSpotlightCard';
import { VenueSpotlightSection } from '@/components/discovery/VenueSpotlightSection';
import { type VenueSummary } from '@/types/discovery';

const mockVenues: VenueSummary[] = [
  {
    id: 'venue-1',
    name: 'JIExpo Kemayoran',
    slug: 'jiexpo-kemayoran',
    city: 'Central Jakarta',
    address: 'Arena JIExpo Kemayoran, Jakarta Pusat',
    transitInfo: 'TransJakarta Corridor 2C (Monas - JIExpo)',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    regionId: 'id',
    region: { id: 'id', code: 'ID', name: 'Indonesia', currency: 'IDR' },
    halls: [
      { id: 'h1', name: 'Hall A1', capacity: 12000, floorAreaSqm: 10500 },
      { id: 'h2', name: 'Hall B1', capacity: 8500, floorAreaSqm: 8000 },
    ],
  },
  {
    id: 'venue-2',
    name: 'Tokyo Big Sight',
    slug: 'tokyo-big-sight',
    city: 'Tokyo',
    address: '3-11-1 Ariake, Koto City, Tokyo',
    transitInfo: 'Yurikamome Line (Tokyo Big Sight Station)',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800',
    regionId: 'jp',
    region: { id: 'jp', code: 'JP', name: 'Japan', currency: 'JPY' },
    halls: [
      { id: 'h3', name: 'East Hall 1-8', capacity: 40000, floorAreaSqm: 38000 },
    ],
  },
];

describe('Discovery Component: VenueSpotlight', () => {
  it('T1.1: VenueSpotlightCard renders venue name, city, hall count, capacity, and transit summary', () => {
    render(<VenueSpotlightCard venue={mockVenues[0]} locale="en" />);

    expect(screen.getByText('JIExpo Kemayoran')).toBeInTheDocument();
    expect(screen.getByText('Central Jakarta')).toBeInTheDocument();
    expect(screen.getByText('2 Halls')).toBeInTheDocument();
    expect(screen.getByText(/20,500 Pax/i)).toBeInTheDocument();
    expect(screen.getByText(/TransJakarta Corridor 2C/i)).toBeInTheDocument();
  });

  it('T1.2: VenueSpotlightCard contains link pointing to venue detail slug', () => {
    render(<VenueSpotlightCard venue={mockVenues[0]} locale="en" />);
    const links = screen.getAllByRole('link', { name: /jiexpo kemayoran|view venue/i });
    expect(links[0]).toHaveAttribute('href', '/en/venues/jiexpo-kemayoran');
  });

  it('T1.3: VenueSpotlightSection renders section heading and all venues by default', () => {
    render(<VenueSpotlightSection venues={mockVenues} locale="en" />);

    expect(screen.getByText('World-Class MICE Venues & Mega Halls')).toBeInTheDocument();
    expect(screen.getByText('JIExpo Kemayoran')).toBeInTheDocument();
    expect(screen.getByText('Tokyo Big Sight')).toBeInTheDocument();
  });

  it('T1.4: filters venues when clicking regional hub filter tabs', () => {
    render(<VenueSpotlightSection venues={mockVenues} locale="en" />);

    const japanTab = screen.getByRole('tab', { name: /japan hub/i });
    fireEvent.click(japanTab);

    expect(screen.getByText('Tokyo Big Sight')).toBeInTheDocument();
    expect(screen.queryByText('JIExpo Kemayoran')).toBeNull();
  });

  it('T2.1 (Boundary): displays empty message when no venues match the selected filter', () => {
    render(<VenueSpotlightSection venues={mockVenues} locale="en" />);

    const globalTab = screen.getByRole('tab', { name: /global gateways/i });
    fireEvent.click(globalTab);

    expect(screen.getByText('No venues found in this region')).toBeInTheDocument();
  });
});
