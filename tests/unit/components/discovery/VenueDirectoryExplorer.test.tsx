import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VenueDirectoryExplorer } from '@/components/discovery/VenueDirectoryExplorer';
import { type VenueSummary } from '@/types/discovery';

const mockVenues: VenueSummary[] = [
  {
    id: 'venue-1',
    name: 'JIExpo Kemayoran',
    slug: 'jiexpo-kemayoran',
    city: 'Central Jakarta',
    address: 'Arena JIExpo Kemayoran, Jakarta Pusat',
    transitInfo: 'TransJakarta Corridor 2C (Monas - JIExpo)',
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
    regionId: 'jp',
    region: { id: 'jp', code: 'JP', name: 'Japan', currency: 'JPY' },
    halls: [
      { id: 'h3', name: 'East Hall 1-8', capacity: 40000, floorAreaSqm: 38000 },
    ],
  },
];

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
  }),
  usePathname: () => '/en/venues',
  useSearchParams: () => new URLSearchParams(''),
}));

describe('VenueDirectoryExplorer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders directory with regional tabs, search input, and sort dropdown', () => {
    render(
      <VenueDirectoryExplorer
        venues={mockVenues}
        locale="en"
        initialRegion="all"
      />
    );

    expect(screen.getAllByText('All Regions').length).toBeGreaterThan(0);
    expect(screen.getByRole('textbox', { name: /search venues/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/sort venues by/i)).toBeInTheDocument();
    expect(screen.getAllByText('JIExpo Kemayoran').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tokyo Big Sight').length).toBeGreaterThan(0);
    expect(screen.getByText(/verified convention complexes/i)).toBeInTheDocument();
  });

  it('filters venues in real-time when searching by city or venue name', () => {
    render(
      <VenueDirectoryExplorer
        venues={mockVenues}
        locale="en"
        initialRegion="all"
      />
    );

    const searchInput = screen.getByRole('textbox', { name: /search venues/i });
    fireEvent.change(searchInput, { target: { value: 'Tokyo' } });

    expect(screen.getAllByText('Tokyo Big Sight').length).toBeGreaterThan(0);
    expect(screen.queryByText('JIExpo Kemayoran')).not.toBeInTheDocument();
    expect(screen.getByText(/verified convention complexes/i)).toBeInTheDocument();
  });

  it('provides cross-region search recovery suggestions when 0 matches in current region', () => {
    render(
      <VenueDirectoryExplorer
        venues={mockVenues}
        locale="en"
        initialRegion="id"
      />
    );

    const searchInput = screen.getByRole('textbox', { name: /search venues/i });
    fireEvent.change(searchInput, { target: { value: 'Tokyo' } });

    expect(screen.getByText(/No Venues Found/i)).toBeInTheDocument();
    expect(screen.getByText(/Found matching venues in other regional editions/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View in Japan \(1\)/i })).toBeInTheDocument();
  });

  it('sorts venues by capacity when sort dropdown is changed', () => {
    render(
      <VenueDirectoryExplorer
        venues={mockVenues}
        locale="en"
        initialRegion="all"
      />
    );

    const sortSelect = screen.getByLabelText(/sort venues by/i);
    fireEvent.change(sortSelect, { target: { value: 'capacity' } });

    const venueLinks = screen.getAllByRole('link', { name: /jiexpo kemayoran|tokyo big sight/i });
    // Tokyo Big Sight (40,000 Pax) should come before JIExpo (20,500 Pax)
    expect(venueLinks[0]).toHaveTextContent('Tokyo Big Sight');
  });
});
