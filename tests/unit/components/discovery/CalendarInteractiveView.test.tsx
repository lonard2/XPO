import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { CalendarInteractiveView } from '@/components/discovery/CalendarInteractiveView';
import { type EventSummary } from '@/types/discovery';
import * as icalModule from '@/lib/calendar/ical';

// Mock Next.js navigation
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/en/calendar',
  useSearchParams: () => new URLSearchParams(''),
}));

const mockMessages: Record<string, Record<string, string>> = {
  calendar: {
    title: 'Master Timetable',
    subtitle: 'Interactive multi-track timetable',
    guideTitle: 'Event Calendar Guide',
    guideSubtitle: 'Select a date to preview active exhibitions and keynotes.',
    fullTimetable: 'Full Multi-Track Timetable',
    monthView: 'Chronological Schedule Overview',
    exportICal: 'Export iCal (.ics)',
    eventsOnDate: 'Schedule for',
    noEventsOnDate: 'No events scheduled on this day.',
  },
  common: {
    back: 'Back',
    viewPass: 'View Pass',
  },
  tickets: {
    viewPass: 'View Event & Tickets',
    bookPass: 'Book Pass',
  },
  regions: {
    upcomingEvents: 'All confirmed events ordered by start date.',
  },
  archetypes: {},
  discovery: {
    allArchetypes: 'All (15)',
  },
};

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => {
    return (key: string) => {
      if (namespace && mockMessages[namespace]?.[key]) {
        return mockMessages[namespace][key];
      }
      return key;
    };
  },
}));

describe('CalendarInteractiveView Component', () => {
  const mockEvents: EventSummary[] = [
    {
      id: 'event-1',
      title: 'Manufacturing Indonesia 2026',
      slug: 'manufacturing-indonesia-2026',
      archetype: 'INDUSTRIAL_B2B',
      startDate: new Date('2026-08-20T09:00:00Z'),
      endDate: new Date('2026-08-23T18:00:00Z'),
      venueName: 'JIExpo Kemayoran',
      venueHallName: 'Hall A1',
      cityName: 'Jakarta',
      regionCode: 'id',
      isFeatured: true,
      lowestPrice: 150000,
      currency: 'IDR',
    },
    {
      id: 'event-2',
      title: 'Asia AI Summit 2026',
      slug: 'asia-ai-summit-2026',
      archetype: 'TECH_DEV_SUMMIT',
      startDate: new Date('2026-08-25T09:00:00Z'),
      endDate: new Date('2026-08-27T18:00:00Z'),
      venueName: 'ICE BSD City',
      venueHallName: 'Nusantara Hall',
      cityName: 'Tangerang',
      regionCode: 'id',
      isFeatured: false,
      lowestPrice: 250000,
      currency: 'IDR',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders events grouped by month milestones with venue tabs', () => {
    render(
      <CalendarInteractiveView
        initialEvents={mockEvents}
        locale="en"
        region="id"
      />
    );

    expect(screen.getAllByText('Manufacturing Indonesia 2026').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Asia AI Summit 2026').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/August 2026/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/All Venues/i)).toBeInTheDocument();
  });

  it('filters events when selecting venue filter tab', () => {
    render(
      <CalendarInteractiveView
        initialEvents={mockEvents}
        locale="en"
        region="id"
      />
    );

    const jiexpoBtn = screen.getByText('JIExpo Kemayoran');
    fireEvent.click(jiexpoBtn);

    expect(screen.getByText('Manufacturing Indonesia 2026')).toBeInTheDocument();
    expect(screen.queryByText('Asia AI Summit 2026')).not.toBeInTheDocument();
  });

  it('triggers iCal export when Export iCal button is clicked', () => {
    const downloadSpy = vi.spyOn(icalModule, 'downloadICalFile').mockReturnValue(true);

    render(
      <CalendarInteractiveView
        initialEvents={mockEvents}
        locale="en"
        region="id"
      />
    );

    const exportBtn = screen.getByRole('button', { name: /export ical/i });
    fireEvent.click(exportBtn);

    expect(downloadSpy).toHaveBeenCalledWith(
      mockEvents,
      'xpo-id-schedule.ics',
      'XPO MICE ID Master Timetable'
    );
  });
});
