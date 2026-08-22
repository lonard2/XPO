import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterSidebar } from '@/components/discovery/FilterSidebar';
import { type FilterState } from '@/types/discovery';

const initialFilters: FilterState = {
  keyword: '',
  region: 'all',
  city: 'all',
  archetype: 'all',
  format: 'all',
  scale: 'all',
  dateRange: 'all',
};

describe('Discovery Component: FilterSidebar', () => {
  it('T1.1: renders regional hubs, 9 MICE archetypes, formats, scales, and timelines', () => {
    render(
      <FilterSidebar
        filters={initialFilters}
        onChange={vi.fn()}
        onReset={vi.fn()}
      />
    );

    expect(screen.getAllByText(/regional/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/category|domain|vertical/i)).toBeInTheDocument();
    expect(screen.getAllByText(/format/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/scale/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/timeline/i)).toBeInTheDocument();

    expect(screen.getByText(/indonesia/i)).toBeInTheDocument();
    expect(screen.getByText(/industrial/i)).toBeInTheDocument();
    expect(screen.getAllByText(/tech/i).length).toBeGreaterThan(0);
  });

  it('T1.2: calls onChange with updated region when a regional hub is selected', () => {
    const handleChange = vi.fn();
    render(
      <FilterSidebar
        filters={initialFilters}
        onChange={handleChange}
        onReset={vi.fn()}
      />
    );

    const jpButton = screen.getByText(/japan/i);
    fireEvent.click(jpButton);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ region: 'jp' })
    );
  });

  it('T1.3: calls onChange with updated archetype when an archetype is selected', () => {
    const handleChange = vi.fn();
    render(
      <FilterSidebar
        filters={initialFilters}
        onChange={handleChange}
        onReset={vi.fn()}
      />
    );

    const techSummit = screen.getAllByText(/tech/i)[0];
    fireEvent.click(techSummit);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ archetype: 'TECH_DEV_SUMMIT' })
    );
  });

  it('T1.4: calls onChange when format or scale options are clicked', () => {
    const handleChange = vi.fn();
    render(
      <FilterSidebar
        filters={initialFilters}
        onChange={handleChange}
        onReset={vi.fn()}
      />
    );

    const hybridBtn = screen.getByRole('button', { name: /hybrid/i });
    fireEvent.click(hybridBtn);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ format: 'HYBRID' })
    );
  });

  it('T2.1 (Boundary): shows reset button when filters are active and triggers onReset', () => {
    const handleReset = vi.fn();
    render(
      <FilterSidebar
        filters={{ ...initialFilters, region: 'id' }}
        onChange={vi.fn()}
        onReset={handleReset}
      />
    );

    const resetBtn = screen.getByRole('button', { name: /reset|clear/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
