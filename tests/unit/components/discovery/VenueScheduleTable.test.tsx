import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VenueScheduleTable } from '@/components/discovery/VenueScheduleTable';
import { type DiscoveryEvent } from '@/types/discovery';

const mockEvents: DiscoveryEvent[] = [
  {
    id: 'evt-1',
    title: 'Manufacturing Indonesia 2026',
    slug: 'manufacturing-indonesia-2026',
    description: 'International machinery and manufacturing technology exhibition.',
    startDate: new Date('2026-08-20T09:00:00Z'),
    endDate: new Date('2026-08-24T18:00:00Z'),
    archetype: 'INDUSTRIAL_B2B',
    venueId: 'v1',
    venue: {
      id: 'v1',
      name: 'JIExpo Kemayoran',
      slug: 'jiexpo-kemayoran',
      city: 'Jakarta',
      country: 'Indonesia',
      address: 'Arena JIExpo',
      regionId: 'id',
    },
    venueHall: {
      id: 'hall-1',
      name: 'Hall A1-A3',
      capacity: 10000,
      floorAreaSqm: 12000,
      venueId: 'v1',
    },
    regionId: 'id',
    minPrice: 150000,
    currency: 'IDR',
  },
];

describe('VenueScheduleTable Component', () => {
  it('renders in-venue scheduled events with hall badges', () => {
    render(
      <VenueScheduleTable
        venueName="JIExpo Kemayoran"
        events={mockEvents}
        locale="en"
        regionCode="id"
      />
    );

    expect(screen.getByText(/Scheduled Exhibitions at JIExpo Kemayoran/i)).toBeInTheDocument();
    expect(screen.getByText('Manufacturing Indonesia 2026')).toBeInTheDocument();
    expect(screen.getByText('Hall A1-A3')).toBeInTheDocument();
    expect(screen.getByText('View Event & Passes')).toBeInTheDocument();
  });

  it('renders empty state when no events are scheduled', () => {
    render(
      <VenueScheduleTable
        venueName="JIExpo Kemayoran"
        events={[]}
        locale="en"
        regionCode="id"
      />
    );

    expect(screen.getByText(/No upcoming exhibitions currently scheduled/i)).toBeInTheDocument();
  });
});
