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
  },
  {
    id: 'hall-plenary',
    name: 'Nusantara Plenary Convention Hall',
    capacity: 5000,
    floorAreaSqm: 6000,
    description: 'Acoustically isolated plenary auditorium for diplomatic summits.',
  },
  {
    id: 'hall-b1',
    name: 'West Hall B1-B2 Pavilion',
    capacity: 8000,
    floorAreaSqm: 9000,
    description: 'Modular exhibition hall for developer showcases.',
  },
  {
    id: 'hall-verified',
    name: 'Verified Test Hall',
    capacity: 1000,
    floorAreaSqm: 2000,
    ceilingHeightM: 9,
    floorLoadKnM2: 15,
    description: 'Hall with surveyed figures.',
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

  it('marks synthesized specs as typical and never asserts universal freight access', () => {
    render(
      <VenueCampusExplorer
        venueName="JIExpo Kemayoran"
        halls={mockHalls}
      />
    );

    expect(screen.getAllByText(/Typical/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/5\.5m shutter gate/i)).toBeNull();
    expect(screen.getByText(/varies by hall/i)).toBeInTheDocument();
  });

  it('renders verified figures with a Verified tag instead of the heuristic', () => {
    render(
      <VenueCampusExplorer
        venueName="JIExpo Kemayoran"
        halls={mockHalls}
      />
    );

    fireEvent.click(screen.getAllByText('Verified Test Hall')[0]);

    expect(screen.getByText(/9m from floor to lighting trusses/i)).toBeInTheDocument();
    expect(screen.getByText(/15 kN\/m² for heavy machinery/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Verified/i).length).toBeGreaterThan(0);
  });

  it('announces dossier changes to screen readers', () => {
    const { container } = render(
      <VenueCampusExplorer
        venueName="JIExpo Kemayoran"
        halls={mockHalls}
      />
    );

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion?.getAttribute('aria-atomic')).toBe('true');
  });

  it('filters halls when selecting wing filter tabs', () => {
    render(
      <VenueCampusExplorer
        venueName="JIExpo Kemayoran"
        halls={mockHalls}
      />
    );

    const eastWingBtn = screen.getByRole('button', { name: /East Halls/i });
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
