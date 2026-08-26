import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VenueCampusExplorer } from '@/components/discovery/VenueCampusExplorer';
import { type VenueHallSummary } from '@/types/discovery';

const mockHalls: VenueHallSummary[] = [
  {
    id: 'hall-a1',
    name: 'Hall A1-A3 Heavy Exhibition',
    capacity: 12000,
    floorAreaSqm: 15000,
    description: 'Heavy machinery exhibition hall with direct freight roll-up dock.',
    venueId: 'v1',
  },
  {
    id: 'hall-plenary',
    name: 'Nusantara Plenary Convention Hall',
    capacity: 5000,
    floorAreaSqm: 6000,
    description: 'Acoustically isolated plenary auditorium for diplomatic summits.',
    venueId: 'v1',
  },
  {
    id: 'hall-b1',
    name: 'West Hall B1-B2 Pavilion',
    capacity: 8000,
    floorAreaSqm: 9000,
    description: 'Modular exhibition hall for developer showcases.',
    venueId: 'v1',
  },
];

describe('VenueCampusExplorer Component', () => {
  it('renders hall directory with technical engineering specifications', () => {
    render(
      <VenueCampusExplorer
        venueName="JIExpo Kemayoran"
        halls={mockHalls}
      />
    );

    expect(screen.getByText(/Hall & Pavilion Directory/i)).toBeInTheDocument();
    expect(screen.getAllByText('Hall A1-A3 Heavy Exhibition').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Nusantara Plenary Convention Hall').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/15,000 m² Gross Area/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Selected Specification/i)).toBeInTheDocument();
  });

  it('filters halls when selecting wing filter tabs', () => {
    render(
      <VenueCampusExplorer
        venueName="JIExpo Kemayoran"
        halls={mockHalls}
      />
    );

    const eastWingBtn = screen.getByRole('button', { name: /East & Primary Wing/i });
    fireEvent.click(eastWingBtn);

    expect(screen.getAllByText('Hall A1-A3 Heavy Exhibition').length).toBeGreaterThan(0);
    expect(screen.queryByText('West Hall B1-B2 Pavilion')).not.toBeInTheDocument();
  });

  it('updates selected hall specification dossier when clicking a hall card', () => {
    render(
      <VenueCampusExplorer
        venueName="JIExpo Kemayoran"
        halls={mockHalls}
      />
    );

    const plenaryCards = screen.getAllByText('Nusantara Plenary Convention Hall');
    fireEvent.click(plenaryCards[0]);

    expect(screen.getAllByText('Nusantara Plenary Convention Hall').length).toBeGreaterThan(0);
    expect(screen.getByText(/Acoustic Divisible/i)).toBeInTheDocument();
  });
});
