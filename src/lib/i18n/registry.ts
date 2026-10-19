/**
 * Localized resolvers for switcher registry data. Static English option
 * tables stay as fallbacks; dictionaries carry the translations.
 * A missing key degrades to the registry value, never to a raw key path.
 */

function pick(t: any, path: string, fallback: string): string {
  try {
    const v = t?.(path);
    if (typeof v === "string" && v !== path) return v;
  } catch {
    // Ignore translation lookup errors
  }
  return fallback;
}

/** Translated region edition name, e.g. regions.jp.name. */
export function regionName(tReg: any, code: string, fallback: string): string {
  return pick(tReg, `${code}.name`, fallback);
}

/** Translated region marketing description. */
export function regionDescription(tReg: any, code: string, fallback: string): string {
  return pick(tReg, `${code}.description`, fallback);
}

/** Translated key-venue rollup. Venue proper nouns stay untouched. */
export function regionKeyVenues(tReg: any, code: string, fallback: string): string {
  return pick(tReg, `${code}.keyVenues`, fallback);
}

/** Translated language name, e.g. nav.language_ja. */
export function languageLabel(tNav: any, code: string, fallback: string): string {
  return pick(tNav, `language_${code}`, fallback);
}

/** Translated language region hint. */
export function languageHint(tNav: any, code: string, fallback: string): string {
  return pick(tNav, `languageHint_${code}`, fallback);
}
