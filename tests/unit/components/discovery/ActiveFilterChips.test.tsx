import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActiveFilterChips } from '@/components/discovery/ActiveFilterChips';
import { type FilterState } from '@/types/discovery';

const defaultFilters: FilterState = {
  keyword: 'automation',
  region: 'id',
  city: 'all',
  archetype: 'INDUSTRIAL_B2B',
  format: 'IN_PERSON',
  scale: 'LARGE',
  dateRange: 'upcoming',
};

describe('Discovery Component: ActiveFilterChips', () => {
  it('T1.1: renders active chips for keyword, region, archetype, format, scale, and timeline', () => {
    const handleRemove = vi.fn();
    const handleClearAll = vi.fn();

    render(
      <ActiveFilterChips
        filters={defaultFilters}
        onRemoveFilter={handleRemove}
        onClearAll={handleClearAll}
      />
    );

    expect(screen.getByText(/automation/i)).toBeInTheDocument();
    expect(screen.getByText(/indonesia/i)).toBeInTheDocument();
    expect(screen.getByText(/industrial/i)).toBeInTheDocument();
    expect(screen.getByText(/person/i)).toBeInTheDocument();
    expect(screen.getByText(/large/i)).toBeInTheDocument();
    expect(screen.getByText(/upcoming/i)).toBeInTheDocument();
  });

  it('T1.2: triggers onRemoveFilter callback when removing a specific chip', () => {
    const handleRemove = vi.fn();
    const handleClearAll = vi.fn();

    render(
      <ActiveFilterChips
        filters={defaultFilters}
        onRemoveFilter={handleRemove}
        onClearAll={handleClearAll}
      />
    );

    const removeKeywordBtn = screen.getByLabelText(/automation/i);
    fireEvent.click(removeKeywordBtn);

    expect(handleRemove).toHaveBeenCalledWith('keyword');
  });

  it('T1.3: triggers onClearAll callback when clicking Clear All button', () => {
    const handleRemove = vi.fn();
    const handleClearAll = vi.fn();

    render(
      <ActiveFilterChips
        filters={defaultFilters}
        onRemoveFilter={handleRemove}
        onClearAll={handleClearAll}
      />
    );

    const clearAllBtn = screen.getByRole('button', { name: /clear all/i });
    fireEvent.click(clearAllBtn);

    expect(handleClearAll).toHaveBeenCalledTimes(1);
  });

  it('T2.1 (Boundary): renders nothing when all filters are inactive or default', () => {
    const emptyFilters: FilterState = {
      keyword: '',
      region: 'all',
      city: 'all',
      archetype: 'all',
      format: 'all',
      scale: 'all',
      dateRange: 'all',
    };

    const { container } = render(
      <ActiveFilterChips
        filters={emptyFilters}
        onRemoveFilter={vi.fn()}
        onClearAll={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
