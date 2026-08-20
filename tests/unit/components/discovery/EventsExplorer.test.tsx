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

    const techSummitBtn = screen.getByRole('button', { name: /tech & developer summit/i });
    fireEvent.click(techSummitBtn);

    expect(screen.getByText('Asia AI & Cloud Developer Summit 2026')).toBeInTheDocument();
    expect(screen.queryByText('Pekan Raya Jakarta (Jakarta Fair Kemayoran 2026)')).toBeNull();
  });

  it('T1.4: filters events by regional hub', () => {
    render(<EventsExplorer initialEvents={FALLBACK_EVENTS} locale="en" />);

    const japanHubBtn = screen.getByText('Japan Hub (Tokyo Big Sight)');
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

    expect(screen.getByText('No matching exhibitions found')).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /reset all filters/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText('Manufacturing Indonesia & Industrial Automation Expo 2026')).toBeInTheDocument();

    vi.useRealTimers();
  });
});
