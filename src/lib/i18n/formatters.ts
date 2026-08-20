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
 * - Same day: "Sep 14, 2026" or "14 Sep 2026, 09:00 – 18:00"
 * - Same month: "Sep 14 – 17, 2026"
 * - Different months: "Jun 10 – Jul 12, 2026"
 * - Different years: "Dec 28, 2026 – Jan 3, 2027"
 */
export function formatDateRange(
  startDate: Date | string,
  endDate: Date | string,
  locale: string = DEFAULT_LOCALE,
  timeZone: string = DEFAULT_TIMEZONE
): string {
  const safeLocale = normalizeLocale(locale);
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

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
      return formatter.formatRange(start, end);
    }

    // Fallback if formatRange is not supported in host environment
    const startFormatted = formatter.format(start);
    const endFormatted = formatter.format(end);
    if (startFormatted === endFormatted) {
      return startFormatted;
    }
    return `${startFormatted} – ${endFormatted}`;
  } catch {
    return `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`;
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
