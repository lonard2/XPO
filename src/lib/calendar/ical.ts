import { type EventSummary } from '@/types/discovery';

/**
 * Format a JavaScript Date to iCal UTC timestamp string (YYYYMMDDTHHMMSSZ).
 */
function formatICalDate(dateInput: Date | string): string {
  const d = new Date(dateInput);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Escape text for iCal format (RFC 5545 Section 3.3.11).
 */
function escapeICalText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate standard RFC 5545 VCALENDAR text for an array of MICE events.
 */
export function generateICalCalendar(
  events: EventSummary[],
  calendarName = 'XPO MICE Master Schedule'
): string {
  const now = formatICalDate(new Date());

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//XPO MICE Digital Ecosystem//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICalText(calendarName)}`,
    'X-WR-TIMEZONE:UTC',
  ];

  for (const evt of events) {
    const dtStart = formatICalDate(evt.startDate);
    const dtEnd = formatICalDate(evt.endDate);
    const location = [evt.venueHallName, evt.venueName, evt.cityName]
      .filter(Boolean)
      .join(', ');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:xpo-${evt.id}@xpo-mice.com`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:${escapeICalText(evt.title)}`);
    lines.push(
      `DESCRIPTION:${escapeICalText(
        `MICE Trade Exhibition & Conference. Archetype: ${evt.archetype}. Location: ${location}`
      )}`
    );
    lines.push(`LOCATION:${escapeICalText(location)}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Trigger client-side download of the .ics calendar file.
 */
export function downloadICalFile(
  events: EventSummary[],
  filename = 'xpo-events-schedule.ics',
  calendarName = 'XPO MICE Master Schedule'
): boolean {
  if (typeof window === 'undefined') return false;
  if (!events || events.length === 0) return false;

  try {
    const icalContent = generateICalCalendar(events, calendarName);
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (error) {
    console.error('Failed to export iCal calendar file:', error);
    return false;
  }
}

/**
 * Format a Date to Google Calendar template date string (YYYYMMDDTHHMMSSZ).
 */
export function formatGoogleCalendarDate(dateInput: Date | string): string {
  return formatICalDate(dateInput);
}

/**
 * Generate a direct Google Calendar web URL for an event.
 */
export function generateGoogleCalendarUrl(event: EventSummary, origin = 'https://xpo-mice.com'): string {
  const start = formatGoogleCalendarDate(event.startDate);
  const end = formatGoogleCalendarDate(event.endDate);
  const location = [event.venueHallName, event.venueName, event.cityName].filter(Boolean).join(', ');
  const details = `MICE Trade Exhibition: ${event.title}\nCategory: ${event.archetype}\nVenue: ${location}\nEvent Details: ${origin}/events/${event.slug}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate a direct Outlook 365 Web URL for an event.
 */
export function generateOutlookWebUrl(event: EventSummary, origin = 'https://xpo-mice.com'): string {
  const location = [event.venueHallName, event.venueName, event.cityName].filter(Boolean).join(', ');
  const details = `MICE Trade Exhibition: ${event.title}\nCategory: ${event.archetype}\nVenue: ${location}\nEvent Details: ${origin}/events/${event.slug}`;
  const startIso = new Date(event.startDate).toISOString();
  const endIso = new Date(event.endDate).toISOString();

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: startIso,
    enddt: endIso,
    body: details,
    location,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate RFC 4180 CSV text for events schedule.
 */
export function generateCsvSchedule(events: EventSummary[]): string {
  const headers = ['Title', 'Archetype', 'Venue', 'Hall', 'City', 'Start Date', 'End Date', 'Currency', 'Lowest Price'];

  const escapeCsvField = (field: any) => {
    const str = String(field ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = events.map((evt) =>
    [
      evt.title,
      evt.archetype,
      evt.venueName,
      evt.venueHallName || '',
      evt.cityName,
      new Date(evt.startDate).toISOString(),
      new Date(evt.endDate).toISOString(),
      evt.currency,
      evt.lowestPrice,
    ]
      .map(escapeCsvField)
      .join(',')
  );

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Trigger client-side download of CSV schedule file.
 */
export function downloadCsvSchedule(
  events: EventSummary[],
  filename = 'xpo-events-schedule.csv'
): boolean {
  if (typeof window === 'undefined') return false;
  if (!events || events.length === 0) return false;

  try {
    const csvContent = generateCsvSchedule(events);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (error) {
    console.error('Failed to export CSV schedule file:', error);
    return false;
  }
}

/**
 * Generate plain text itinerary summary suitable for clipboard copy.
 */
export function generatePlainTextSchedule(events: EventSummary[], locale = 'en'): string {
  if (!events || events.length === 0) return 'No scheduled events.';

  const lines = [
    `XPO MICE Master Schedule (${events.length} confirmed exhibitions)`,
    '==================================================',
    '',
  ];

  events.forEach((evt, idx) => {
    const start = new Date(evt.startDate).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const end = new Date(evt.endDate).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const dateStr = start === end ? start : `${start} - ${end}`;
    const location = [evt.venueHallName, evt.venueName, evt.cityName].filter(Boolean).join(', ');

    lines.push(`${idx + 1}. ${evt.title}`);
    lines.push(`   Date: ${dateStr}`);
    lines.push(`   Venue: ${location}`);
    lines.push(`   Category: ${evt.archetype}`);
    lines.push('');
  });

  return lines.join('\n');
}
