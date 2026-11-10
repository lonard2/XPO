import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EventCalendarWidget } from '@/components/discovery/EventCalendarWidget';
import { EventSummary } from '@/types/discovery';
import { getArchetypeTokens, getContrastRatio } from '@/lib/theming';

const mockEvents: EventSummary[] = [
  {
    id: 'evt-1',
    title: 'Manufacturing Indonesia 2026',
    slug: 'manufacturing-indonesia-2026',
    archetype: 'INDUSTRIAL_B2B',
    startDate: new Date().toISOString(), // today
    endDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days later
    venueName: 'JIExpo Kemayoran',
    venueHallName: 'Hall A1',
    cityName: 'Jakarta',
    regionCode: 'id',
    lowestPrice: 0,
    currency: 'IDR',
  },
];

describe('EventCalendarWidget', () => {
  it('renders calendar header and month controller', () => {
    render(<EventCalendarWidget events={mockEvents} locale="en" regionCode="id" />);

    expect(screen.getByText('Event Calendar Guide')).toBeDefined();
    expect(screen.getByText(/Full Multi-Track Timetable/i)).toBeDefined();
  });

  it('opens on the next attendable event date, not an empty today', () => {
    const future: EventSummary = {
      ...mockEvents[0],
      id: 'evt-future',
      title: 'Future Expo 2027',
      startDate: '2027-03-15T09:00:00Z',
      endDate: '2027-03-16T18:00:00Z',
    };

    render(<EventCalendarWidget events={[future]} locale="en" regionCode="id" />);

    expect(screen.getByText(/March 2027/)).toBeDefined();
    expect(screen.getByText('Future Expo 2027')).toBeDefined();
  });

  it('opens on a live event today rather than a later one', () => {
    const live: EventSummary = {
      ...mockEvents[0],
      id: 'evt-live',
      title: 'Live Expo Today',
      startDate: new Date(Date.now() - 86400000).toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
    };
    const future: EventSummary = {
      ...mockEvents[0],
      id: 'evt-later',
      title: 'Later Expo',
      startDate: '2027-03-15T09:00:00Z',
      endDate: '2027-03-16T18:00:00Z',
    };

    render(
      <EventCalendarWidget events={[future, live]} locale="en" regionCode="id" />
    );

    expect(screen.getByText('Live Expo Today')).toBeDefined();
    expect(screen.queryByText('Later Expo')).toBeNull();
  });

  it('uses a top-level heading for the calendar', () => {
    render(<EventCalendarWidget events={mockEvents} locale="en" regionCode="id" />);

    expect(
      screen.getByRole('heading', { level: 2, name: /Event Calendar Guide/i })
    ).toBeDefined();
  });

  it('displays scheduled events on current active date', () => {
    render(<EventCalendarWidget events={mockEvents} locale="en" regionCode="id" />);

    expect(screen.getByText('Manufacturing Indonesia 2026')).toBeDefined();
    expect(screen.getByText('JIExpo Kemayoran')).toBeDefined();
    expect(screen.getByText('Hall A1')).toBeDefined();
  });

  it('uses localized weekday headers and toggle semantics for day buttons', () => {
    const { container } = render(<EventCalendarWidget events={mockEvents} locale="en" regionCode="id" />);

    expect(container.querySelectorAll('[role="columnheader"]').length).toBe(7);
    // No aria-selected mismatch under the group role; day selection uses aria-pressed.
    expect(container.querySelectorAll('[aria-selected]').length).toBe(0);
    expect(container.querySelectorAll('[aria-pressed]').length).toBeGreaterThan(20);
  });

  it('renders the archetype badge in a readable tone, not the raw primary', () => {
    const fashion: EventSummary = {
      ...mockEvents[0],
      id: 'evt-fashion',
      title: 'Fashion Week 2026',
      archetype: 'FASHION_RETAIL',
    };
    const { container } = render(
      <EventCalendarWidget events={[fashion]} locale="en" regionCode="id" />
    );
    const raw = getArchetypeTokens('FASHION_RETAIL').primary;
    // Sanity: the raw hue genuinely fails on the light surface.
    expect(getContrastRatio(raw, '#fafbfc')).toBeLessThan(4.5);

    const label = getArchetypeTokens('FASHION_RETAIL').displayName;
    const badge = [...container.querySelectorAll('.rounded-full.border')].find(
      (el) => el.textContent?.includes(label)
    ) as HTMLElement | undefined;
    expect(badge).toBeDefined();
    // Tones travel as CSS vars (light/dark themes); the raw primary must
    // not appear as inline text color.
    const rendered = badge!.style.getPropertyValue("--archetype-label").trim();
    expect(rendered).not.toBe("");
    expect(rendered).not.toBe(raw);
    expect(getContrastRatio(rendered, "#fafbfc")).toBeGreaterThanOrEqual(4.5);
  });
});

describe('EventCalendarWidget heat dots', () => {
  const overlapping = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      id: `evt-heat-${i}`,
      title: `Heat Event ${i}`,
      slug: `heat-event-${i}`,
      archetype: 'INDUSTRIAL_B2B',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
      venueName: 'JIExpo Kemayoran',
      venueHallName: 'Hall A1',
      cityName: 'Jakarta',
      regionCode: 'id',
      lowestPrice: 0,
      currency: 'IDR',
    })) as EventSummary[];

  it('renders three heat dots on days with five or more events', () => {
    const { container } = render(
      <EventCalendarWidget events={overlapping(5)} locale="en" regionCode="id" />
    );
    const dots = container.querySelectorAll('[data-testid="heat-dot"]');
    expect(dots.length).toBeGreaterThanOrEqual(3);
  });

  it('renders a single heat dot for a quiet day', () => {
    const { container } = render(
      <EventCalendarWidget events={overlapping(1)} locale="en" regionCode="id" />
    );
    const dots = container.querySelectorAll('[data-testid="heat-dot"]');
    expect(dots.length).toBeGreaterThanOrEqual(1);
  });
});

describe('EventCalendarWidget nearest upcoming', () => {
  const ended: EventSummary[] = [
    {
      id: 'evt-past',
      title: 'Pekan Raya Jakarta 2026',
      slug: 'pekan-raya-jakarta-2026',
      archetype: 'MEGA_EXPO',
      startDate: new Date(Date.now() - 86400000 * 40).toISOString(),
      endDate: new Date(Date.now() - 86400000 * 30).toISOString(),
      venueName: 'JIExpo Kemayoran',
      venueHallName: 'Hall A',
      cityName: 'Jakarta',
      regionCode: 'id',
      lowestPrice: 0,
      currency: 'IDR',
    },
  ];

  it('never offers a concluded event as the next exhibition', () => {
    render(<EventCalendarWidget events={ended} locale="en" regionCode="id" />);

    expect(screen.getByText(/No scheduled exhibitions on this date/i)).toBeDefined();
    expect(screen.queryByRole('button', { name: /Jump to/i })).toBeNull();
    expect(screen.queryByText(/Pekan Raya Jakarta 2026/i)).toBeNull();
  });

  it('counts events on the selected day without borrowing a page title', () => {
    render(<EventCalendarWidget events={mockEvents} locale="en" regionCode="id" />);

    expect(screen.getByText(/^1 event$/i)).toBeDefined();
    expect(screen.queryByText(/Event Directory/i)).toBeNull();
  });
});

describe('EventCalendarWidget grid semantics', () => {
  it('exposes dates as a grid with rows, headers and cells', () => {
    const { container } = render(
      <EventCalendarWidget events={mockEvents} locale="en" regionCode="id" />
    );

    const grid = container.querySelector('[role="grid"]');
    expect(grid).not.toBeNull();
    expect(grid!.querySelectorAll('[role="row"]').length).toBeGreaterThan(1);
    expect(grid!.querySelectorAll('[role="columnheader"]').length).toBe(7);

    const cells = [...grid!.querySelectorAll('[role="gridcell"]')];
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) {
      expect(cell.parentElement?.getAttribute('role')).toBe('row');
    }
  });
});
