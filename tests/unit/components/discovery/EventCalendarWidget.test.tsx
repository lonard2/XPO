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
});
