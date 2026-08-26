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
