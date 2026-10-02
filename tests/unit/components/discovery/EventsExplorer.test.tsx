import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { EventsExplorer } from '@/components/discovery/EventsExplorer';
import { FALLBACK_EVENTS } from '@/lib/discovery/fallbackData';

const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => '/en/events',
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => null,
  }),
}));

describe('Discovery Component: EventsExplorer Integration', () => {
  it('T1.1: renders full event list and faceted filter sidebar', () => {
    render(<EventsExplorer initialEvents={FALLBACK_EVENTS} locale="en" />);

    expect(screen.getByText('Manufacturing Indonesia & Industrial Automation Expo 2026')).toBeInTheDocument();
    expect(screen.getByText('Asia AI & Cloud Developer Summit 2026')).toBeInTheDocument();
    expect(screen.getByText('Pekan Raya Jakarta (Jakarta Fair Kemayoran 2026)')).toBeInTheDocument();
  });

  it('T1.2: filters events in real-time when searching by keyword', async () => {
    vi.useFakeTimers();

    render(<EventsExplorer initialEvents={FALLBACK_EVENTS} locale="en" />);

    const searchInput = screen.getByPlaceholderText(/search exhibitions/i);
    fireEvent.change(searchInput, { target: { value: 'Robotics' } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByText('Tokyo International Robotics & Mechatronics Expo 2026')).toBeInTheDocument();
    expect(screen.queryByText('Pekan Raya Jakarta (Jakarta Fair Kemayoran 2026)')).toBeNull();

    vi.useRealTimers();
  });

  it('T1.3: filters events by MICE archetype', () => {
    render(<EventsExplorer initialEvents={FALLBACK_EVENTS} locale="en" />);

    const techSummitBtn = screen.getByRole('button', { name: /tech.*developer/i });
    fireEvent.click(techSummitBtn);

    expect(screen.getByText('Asia AI & Cloud Developer Summit 2026')).toBeInTheDocument();
    expect(screen.queryByText('Pekan Raya Jakarta (Jakarta Fair Kemayoran 2026)')).toBeNull();
  });

  it('T1.4: filters events by regional hub', () => {
    render(<EventsExplorer initialEvents={FALLBACK_EVENTS} locale="en" />);

    const japanHubBtn = screen.getByRole('button', { name: /japan/i });
    fireEvent.click(japanHubBtn);

    expect(screen.getByText('Tokyo International Robotics & Mechatronics Expo 2026')).toBeInTheDocument();
    expect(screen.queryByText('Manufacturing Indonesia & Industrial Automation Expo 2026')).toBeNull();
  });

  it('T2.1 (Boundary): displays empty search state with reset button when no events match', async () => {
    vi.useFakeTimers();

    render(<EventsExplorer initialEvents={FALLBACK_EVENTS} locale="en" />);

    const searchInput = screen.getByPlaceholderText(/search exhibitions/i);
    fireEvent.change(searchInput, { target: { value: 'NonexistentXYZKeyword' } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByText(/no matching|no events/i)).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText('Manufacturing Indonesia & Industrial Automation Expo 2026')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('T3.1: filters events by host city', () => {
    render(
      <EventsExplorer
        initialEvents={FALLBACK_EVENTS}
        locale="en"
        initialFilters={{ city: 'Tokyo' }}
      />
    );

    expect(screen.getByText('Tokyo International Robotics & Mechatronics Expo 2026')).toBeInTheDocument();
    expect(screen.queryByText('Manufacturing Indonesia & Industrial Automation Expo 2026')).toBeNull();
  });

  it('T3.2: filters events by this_month date range', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-02T10:00:00Z'));

    render(
      <EventsExplorer
        initialEvents={FALLBACK_EVENTS}
        locale="en"
        initialFilters={{ dateRange: 'this_month' }}
      />
    );

    // October 2026 event should be visible
    expect(screen.getByText('Asia AI & Cloud Developer Summit 2026')).toBeInTheDocument();
    // November 2026 event should be filtered out
    expect(screen.queryByText('Tokyo International Robotics & Mechatronics Expo 2026')).toBeNull();

    vi.useRealTimers();
  });

  it('T3.3: filters events by next_month date range', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-02T10:00:00Z'));

    render(
      <EventsExplorer
        initialEvents={FALLBACK_EVENTS}
        locale="en"
        initialFilters={{ dateRange: 'next_month' }}
      />
    );

    // November 2026 event should be visible
    expect(screen.getByText('Tokyo International Robotics & Mechatronics Expo 2026')).toBeInTheDocument();
    // October 2026 event should be filtered out
    expect(screen.queryByText('Asia AI & Cloud Developer Summit 2026')).toBeNull();

    vi.useRealTimers();
  });

  it('T4.1: switches between grid view and dense table view when toggle is clicked', () => {
    render(<EventsExplorer initialEvents={FALLBACK_EVENTS} locale="en" />);

    // Initially in grid view, table is not present
    expect(screen.queryByRole('table')).toBeNull();

    // Click dense table view button
    const tableBtn = screen.getByRole('button', { name: /dense table view/i });
    fireEvent.click(tableBtn);

    // Table should now be rendered with headers
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Exhibition & Vertical')).toBeInTheDocument();
    expect(screen.getByText('Spatial Hall & City')).toBeInTheDocument();
    expect(screen.getByText('Timeline & Dates')).toBeInTheDocument();

    // Click grid view button
    const gridBtn = screen.getByRole('button', { name: /grid view/i });
    fireEvent.click(gridBtn);

    // Table should no longer be rendered
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('T5.1: batches events and reveals Load More button when results exceed INITIAL_PAGE_SIZE', () => {
    const manyEvents = Array.from({ length: 15 }, (_, i) => ({
      ...FALLBACK_EVENTS[0],
      id: `mock-event-${i}`,
      title: `Numbered Exhibition ${i + 1}`,
      slug: `numbered-exhibition-${i + 1}`,
    }));

    render(<EventsExplorer initialEvents={manyEvents} locale="en" />);

    // First 12 should be visible
    expect(screen.getByText('Numbered Exhibition 1')).toBeInTheDocument();
    expect(screen.getByText('Numbered Exhibition 12')).toBeInTheDocument();
    // 13th should not be visible yet
    expect(screen.queryByText('Numbered Exhibition 13')).toBeNull();

    // Load More button should be present showing count
    const loadMoreBtn = screen.getByRole('button', { name: /load more exhibitions/i });
    expect(loadMoreBtn).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => element?.tagName.toLowerCase() === 'p' && (element.textContent || '').includes('12 of 15'))
    ).toBeInTheDocument();

    // Click Load More
    fireEvent.click(loadMoreBtn);

    // 13th, 14th, 15th should now be visible
    expect(screen.getByText('Numbered Exhibition 13')).toBeInTheDocument();
    expect(screen.getByText('Numbered Exhibition 15')).toBeInTheDocument();
    // Load More button should disappear since all 15 are visible
    expect(screen.queryByRole('button', { name: /load more exhibitions/i })).toBeNull();
  });
});

