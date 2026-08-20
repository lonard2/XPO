import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FacetedFilterBar } from '@/components/discovery/FacetedFilterBar';
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

describe('Discovery Component: FacetedFilterBar', () => {
  it('T1.1: renders search input, quick select dropdowns, and results count', () => {
    render(
      <FacetedFilterBar
        filters={initialFilters}
        onChange={vi.fn()}
        onReset={vi.fn()}
        totalResults={12}
        sortBy="date_asc"
        onSortChange={vi.fn()}
        onOpenMobileFilters={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText(/search exhibitions/i)).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText(/exhibitions/i)).toBeInTheDocument();
  });

  it('T1.2: triggers onChange with debounced keyword query', async () => {
    vi.useFakeTimers();
    const handleChange = vi.fn();

    render(
      <FacetedFilterBar
        filters={initialFilters}
        onChange={handleChange}
        onReset={vi.fn()}
        totalResults={5}
        sortBy="date_asc"
        onSortChange={vi.fn()}
        onOpenMobileFilters={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search exhibitions/i);
    fireEvent.change(searchInput, { target: { value: 'Robotics' } });

    expect(handleChange).not.toHaveBeenCalled();

    // Fast-forward debounce timer (300ms)
    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ keyword: 'Robotics' })
    );

    vi.useRealTimers();
  });

  it('T1.3: triggers onSortChange when selecting a new sort option', () => {
    const handleSortChange = vi.fn();

    render(
      <FacetedFilterBar
        filters={initialFilters}
        onChange={vi.fn()}
        onReset={vi.fn()}
        totalResults={5}
        sortBy="date_asc"
        onSortChange={handleSortChange}
        onOpenMobileFilters={vi.fn()}
      />
    );

    const sortSelect = screen.getByLabelText('Sort events');
    fireEvent.change(sortSelect, { target: { value: 'featured' } });

    expect(handleSortChange).toHaveBeenCalledWith('featured');
  });

  it('T1.4: triggers onOpenMobileFilters when clicking mobile filter button', () => {
    const handleOpenMobile = vi.fn();

    render(
      <FacetedFilterBar
        filters={initialFilters}
        onChange={vi.fn()}
        onReset={vi.fn()}
        totalResults={5}
        sortBy="date_asc"
        onSortChange={vi.fn()}
        onOpenMobileFilters={handleOpenMobile}
      />
    );

    const mobileBtn = screen.getByRole('button', { name: /open filter sidebar/i });
    fireEvent.click(mobileBtn);

    expect(handleOpenMobile).toHaveBeenCalledTimes(1);
  });

  it('T2.1 (Boundary): clears search immediately when clear X button is clicked', () => {
    const handleChange = vi.fn();

    render(
      <FacetedFilterBar
        filters={{ ...initialFilters, keyword: 'Machinery' }}
        onChange={handleChange}
        onReset={vi.fn()}
        totalResults={1}
        sortBy="date_asc"
        onSortChange={vi.fn()}
        onOpenMobileFilters={vi.fn()}
      />
    );

    const clearBtn = screen.getByLabelText('Clear search query');
    fireEvent.click(clearBtn);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ keyword: '' })
    );
  });
});
