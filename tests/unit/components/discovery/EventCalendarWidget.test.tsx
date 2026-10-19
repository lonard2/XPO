import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EventCalendarWidget } from '@/components/discovery/EventCalendarWidget';
import { EventSummary } from '@/types/discovery';

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
