/**
 * XPO MICE Ecosystem: Multilingual & Regional Localization Formatters
 *
 * Provides deterministic, timezone-aware date/time and currency formatting
 * for Indonesia (IDR, WIB), Japan (JPY, JST), and Global hubs (USD/EUR/SGD, UTC).
 */

export type SupportedLocale = 'en' | 'ja' | 'zh-CN' | 'id' | 'de' | 'es';
export type SupportedCurrency = 'IDR' | 'JPY' | 'USD' | 'EUR' | 'SGD';
export type SupportedRegionCode = 'id' | 'jp' | 'global' | 'ID' | 'JP' | 'GLOBAL' | 'GL';

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = [
  'en',
  'ja',
  'zh-CN',
  'id',
  'de',
  'es',
] as const;

export const SUPPORTED_CURRENCIES: readonly SupportedCurrency[] = [
  'IDR',
  'JPY',
  'USD',
  'EUR',
  'SGD',
] as const;

export const DEFAULT_LOCALE: SupportedLocale = 'en';
export const DEFAULT_CURRENCY: SupportedCurrency = 'USD';
export const DEFAULT_TIMEZONE = 'UTC';

/**
 * Validates if a string is a recognized supported locale.
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

/**
 * Validates if a string is a recognized supported currency.
 */
export function isValidCurrency(currency: string): currency is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency);
}

/**
 * Sanitizes and normalizes a locale identifier, falling back to DEFAULT_LOCALE.
 */
export function normalizeLocale(locale: string): SupportedLocale {
  if (isValidLocale(locale)) return locale;
  const lower = locale.toLowerCase();
  if (lower.startsWith('ja')) return 'ja';
  if (lower.startsWith('zh')) return 'zh-CN';
  if (lower.startsWith('id')) return 'id';
  if (lower.startsWith('de')) return 'de';
  if (lower.startsWith('es')) return 'es';
  return DEFAULT_LOCALE;
}

/**
 * Maps a regional hub identifier to its canonical primary timezone.
 */
export function getTimeZoneForRegion(regionCode: string): string {
  const code = (regionCode || '').toLowerCase().trim();
  switch (code) {
    case 'id':
    case 'indonesia':
      return 'Asia/Jakarta';
    case 'jp':
    case 'japan':
      return 'Asia/Tokyo';
    case 'global':
    case 'gl':
    default:
      return 'UTC';
  }
}

/**
 * Short, delegate-recognisable label for a hub timezone.
 *
 * Intl renders Asia/Jakarta as "GMT+7", which is correct but not what a Jakarta
 * delegate reads on a ticket. The abbreviations below match local usage; an
 * unknown zone falls back to UTC rather than guessing.
 */
export function getTimeZoneAbbreviation(timeZone: string): string {
  switch (timeZone) {
    case 'Asia/Jakarta':
      return 'WIB';
    case 'Asia/Tokyo':
      return 'JST';
    case 'Asia/Singapore':
      return 'SGT';
    case 'Europe/Berlin':
      return 'CET';
    default:
      return 'UTC';
  }
}

/**
 * Maps a regional hub identifier to its default display currency.
 */
export function getCurrencyForRegion(regionCode: string): SupportedCurrency {
  const code = (regionCode || '').toLowerCase().trim();
  switch (code) {
    case 'id':
    case 'indonesia':
      return 'IDR';
    case 'jp':
    case 'japan':
      return 'JPY';
    case 'global':
    case 'gl':
    default:
      return 'USD';
  }
}

/**
 * Determines text reading direction for the given locale.
 */
export function getLocaleDirection(locale: string): 'ltr' | 'rtl' {
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  const base = (locale || '').split('-')[0].toLowerCase();
  return rtlLocales.includes(base) ? 'rtl' : 'ltr';
}

/**
 * Formats a monetary amount into a localized currency string.
 *
 * Rules:
 * - IDR & JPY format with 0 decimal places by default.
 * - USD, EUR, SGD format with standard fractional precision.
 * - Supports negative amounts, 0, and large integers.
 * - Graceful fallback on invalid input or unsupported locales.
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE
): string {
  const safeLocale = normalizeLocale(locale);
  const safeCurrency = isValidCurrency(currency) ? currency : DEFAULT_CURRENCY;
  const numValue = typeof amount === 'number' && !isNaN(amount) ? amount : 0;

  try {
    const isZeroDecimal = safeCurrency === 'IDR' || safeCurrency === 'JPY';

    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: isZeroDecimal ? 0 : (numValue % 1 === 0 ? 0 : 2),
      maximumFractionDigits: isZeroDecimal ? 0 : 2,
    };

    return new Intl.NumberFormat(safeLocale, options).format(numValue);
  } catch {
    // Basic resilient fallback
    return `${safeCurrency} ${numValue.toLocaleString()}`;
  }
}

/**
 * Formats a date range into a localized, timezone-aware human readable string.
 *
 * Examples:
 * - Same day: "Sep 14, 2026" or "14 Sep 2026, 09:00 - 18:00"
 * - Same month: "Sep 14 - 17, 2026"
 * - Different months: "Jun 10 - Jul 12, 2026"
 * - Different years: "Dec 28, 2026 - Jan 3, 2027"
 */
/**
 * Node's ICU and a browser's ICU disagree on the whitespace around a date-range dash:
 * Node emits U+2009 thin spaces, Chrome emits U+0020. The strings look identical and
 * hydrate differently, so ranges are normalised to plain spaces.
 */
function normalizeRangeSpacing(value: string): string {
  return value.replace(/[\u2009\u202F\u00A0]/g, ' ');
}

/**
 * Event end times are stored as instants. Seed and organizer forms often use a
 * late-afternoon UTC time for "end of day"; in positive-offset regions that
 * instant rolls past midnight and the range renders one day too long. Treat an
 * end time at or after 12:00Z as the UTC calendar day and pin it to midday, so
 * every supported MICE timezone renders the intended end date.
 */
export function normalizeEventEndDate(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date.getTime());
  if (isNaN(d.getTime())) return d;
  if (d.getUTCHours() >= 12) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0));
  }
  return d;
}

export function formatDateRange(
  startDate: Date | string,
  endDate: Date | string,
  locale: string = DEFAULT_LOCALE,
  timeZone: string = DEFAULT_TIMEZONE
): string {
  const safeLocale = normalizeLocale(locale);
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = normalizeEventEndDate(endDate);

  if (!start || isNaN(start.getTime())) {
    return 'Invalid Date';
  }

  if (!end || isNaN(end.getTime())) {
    return formatDate(start, safeLocale, timeZone);
  }

  try {
    const formatter = new Intl.DateTimeFormat(safeLocale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: timeZone || DEFAULT_TIMEZONE,
    });

    if (typeof formatter.formatRange === 'function') {
      return normalizeRangeSpacing(formatter.formatRange(start, end));
    }

    // Fallback if formatRange is not supported in host environment
    const startFormatted = normalizeRangeSpacing(formatter.format(start));
    const endFormatted = normalizeRangeSpacing(formatter.format(end));
    if (startFormatted === endFormatted) {
      return startFormatted;
    }
    return `${startFormatted} - ${endFormatted}`;
  } catch {
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }
}

/**
 * Formats a single date with optional timezone and custom formatting options.
 */
export function formatDate(
  date: Date | string,
  locale: string = DEFAULT_LOCALE,
  timeZone: string = DEFAULT_TIMEZONE,
  options?: Intl.DateTimeFormatOptions
): string {
  const safeLocale = normalizeLocale(locale);
  const d = typeof date === 'string' ? new Date(date) : date;

  if (!d || isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: timeZone || DEFAULT_TIMEZONE,
      ...options,
    };
    return new Intl.DateTimeFormat(safeLocale, defaultOptions).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

/**
 * Formats a timestamp into a localized 24h / 12h time string.
 */
export function formatTime(
  date: Date | string,
  locale: string = DEFAULT_LOCALE,
  timeZone: string = DEFAULT_TIMEZONE
): string {
  const safeLocale = normalizeLocale(locale);
  const d = typeof date === 'string' ? new Date(date) : date;

  if (!d || isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  try {
    return new Intl.DateTimeFormat(safeLocale, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timeZone || DEFAULT_TIMEZONE,
    }).format(d);
  } catch {
    return d.toLocaleTimeString();
  }
}

/**
 * Formats standard numbers with localized grouping separators.
 */
export function formatNumber(
  value: number,
  locale: string = DEFAULT_LOCALE,
  options?: Intl.NumberFormatOptions
): string {
  const safeLocale = normalizeLocale(locale);
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;

  try {
    return new Intl.NumberFormat(safeLocale, options).format(num);
  } catch {
    return num.toString();
  }
}

export type EventTemporalStatus = 'UPCOMING' | 'LIVE' | 'PAST';

export interface EventTemporalDetails {
  status: EventTemporalStatus;
  isUpcoming: boolean;
  isLive: boolean;
  isPast: boolean;
  label: string;
  badgeVariant: 'default' | 'outline' | 'secondary' | 'warning' | 'destructive' | 'archetype';
  daysRemaining?: number;
  timeRemaining?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

/**
 * Accurately determines whether an event is UPCOMING, LIVE (happening now), or PAST (concluded).
 */
export function getEventTemporalStatus(
  startDate: Date | string,
  endDate: Date | string,
  now: Date = new Date()
): EventTemporalDetails {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const currentTime = now.getTime();
  const startTime = start.getTime();
  const endTime = end.getTime();

  if (currentTime < startTime) {
    const diff = startTime - currentTime;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return {
      status: 'UPCOMING',
      isUpcoming: true,
      isLive: false,
      isPast: false,
      label: 'Upcoming',
      badgeVariant: 'default',
      daysRemaining: days,
      timeRemaining: { days, hours, minutes, seconds },
    };
  }

  if (currentTime >= startTime && currentTime <= endTime) {
    return {
      status: 'LIVE',
      isUpcoming: false,
      isLive: true,
      isPast: false,
      label: 'Happening Now',
      badgeVariant: 'archetype',
    };
  }

  return {
    status: 'PAST',
    isUpcoming: false,
    isLive: false,
    isPast: true,
    label: 'Concluded',
    badgeVariant: 'secondary',
  };
}

export interface EventDayProgress {
  /** 1-based calendar day of the event in its hub timezone. */
  dayNumber: number;
  /** Inclusive calendar-day span between start and end. */
  totalDays: number;
  isFinalDay: boolean;
}

/**
 * Calendar-day position of `now` inside an event run, measured in the event's
 * hub timezone rather than UTC.
 *
 * A Jakarta expo that opens at 09:00 WIB starts at 02:00 UTC, so a UTC day
 * boundary would report the wrong day for the first and last hours of each
 * session. Comparing `en-CA` calendar keys (YYYY-MM-DD) keeps the answer tied
 * to the wall clock a delegate is standing in.
 */
export function getEventDayProgress(
  startDate: Date | string,
  endDate: Date | string,
  timeZone: string = DEFAULT_TIMEZONE,
  now: Date = new Date()
): EventDayProgress | null {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

  const dayKey = (date: Date): string => {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(date);
      const value = (type: string) => parts.find((part) => part.type === type)?.value;
      const year = value('year');
      const month = value('month');
      const day = value('day');
      if (year && month && day) return `${year}-${month}-${day}`;
      return date.toISOString().slice(0, 10);
    } catch {
      return date.toISOString().slice(0, 10);
    }
  };

  const keyToUtc = (key: string): number => {
    const [year, month, day] = key.split('-').map(Number);
    return Date.UTC(year, (month || 1) - 1, day || 1);
  };

  const startUtc = keyToUtc(dayKey(start));
  const endUtc = keyToUtc(dayKey(end));
  const nowUtc = keyToUtc(dayKey(now));

  const dayMs = 24 * 60 * 60 * 1000;
  const totalDays = Math.max(1, Math.round((endUtc - startUtc) / dayMs) + 1);
  const rawDay = Math.round((nowUtc - startUtc) / dayMs) + 1;
  const dayNumber = Math.min(Math.max(rawDay, 1), totalDays);

  return { dayNumber, totalDays, isFinalDay: dayNumber === totalDays };
}
