import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateICalCalendar, downloadICalFile } from '@/lib/calendar/ical';
import { type EventSummary } from '@/types/discovery';

describe('RFC 5545 iCal Calendar Generator', () => {
  const sampleEvents: EventSummary[] = [
    {
      id: 'event-1',
      title: 'Manufacturing Indonesia 2026',
      slug: 'manufacturing-indonesia-2026',
      archetype: 'INDUSTRIAL_B2B',
      startDate: new Date('2026-08-20T09:00:00Z'),
      endDate: new Date('2026-08-23T18:00:00Z'),
      venueName: 'JIExpo Kemayoran',
      venueHallName: 'Hall A1-A3',
      cityName: 'Jakarta',
      regionCode: 'id',
      isFeatured: true,
      lowestPrice: 150000,
      currency: 'IDR',
    },
    {
      id: 'event-2',
      title: 'Tokyo AI & Robotics Summit 2026',
      slug: 'tokyo-ai-robotics-summit-2026',
      archetype: 'TECH_DEV_SUMMIT',
      startDate: new Date('2026-09-10T10:00:00Z'),
      endDate: new Date('2026-09-12T17:00:00Z'),
      venueName: 'Tokyo Big Sight',
      venueHallName: 'East Hall 1',
      cityName: 'Tokyo',
      regionCode: 'jp',
      isFeatured: false,
      lowestPrice: 25000,
      currency: 'JPY',
    },
  ];

  it('generates valid RFC 5545 VCALENDAR string with all required fields', () => {
    const ical = generateICalCalendar(sampleEvents, 'XPO Indonesia & Japan MICE');

    expect(ical).toContain('BEGIN:VCALENDAR');
    expect(ical).toContain('VERSION:2.0');
    expect(ical).toContain('PRODID:-//XPO MICE Digital Ecosystem//EN');
    expect(ical).toContain('X-WR-CALNAME:XPO Indonesia & Japan MICE');
    expect(ical).toContain('BEGIN:VEVENT');
    expect(ical).toContain('UID:xpo-event-1@xpo-mice.com');
    expect(ical).toContain('SUMMARY:Manufacturing Indonesia 2026');
    expect(ical).toContain('LOCATION:Hall A1-A3\\, JIExpo Kemayoran\\, Jakarta');
    expect(ical).toContain('UID:xpo-event-2@xpo-mice.com');
    expect(ical).toContain('SUMMARY:Tokyo AI & Robotics Summit 2026');
    expect(ical).toContain('END:VEVENT');
    expect(ical).toContain('END:VCALENDAR');
  });

  it('escapes special characters correctly in iCal summary and description', () => {
    const specialEvents: EventSummary[] = [
      {
        id: 'event-special',
        title: 'MICE & Trade, Summit; 2026\nNext Gen',
        slug: 'special-summit',
        archetype: 'FINANCE_INVESTOR',
        startDate: new Date('2026-10-01T08:00:00Z'),
        endDate: new Date('2026-10-02T18:00:00Z'),
        venueName: 'ICE BSD City',
        venueHallName: 'Nusantara Hall',
        cityName: 'Tangerang',
        regionCode: 'id',
        isFeatured: false,
        lowestPrice: 0,
        currency: 'IDR',
      },
    ];

    const ical = generateICalCalendar(specialEvents);
    expect(ical).toContain('SUMMARY:MICE & Trade\\, Summit\\; 2026\\nNext Gen');
  });

  it('handles empty event list gracefully', () => {
    const ical = generateICalCalendar([]);
    expect(ical).toContain('BEGIN:VCALENDAR');
    expect(ical).toContain('END:VCALENDAR');
    expect(ical).not.toContain('BEGIN:VEVENT');
  });
});
