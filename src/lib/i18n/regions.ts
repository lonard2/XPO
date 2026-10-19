import * as React from "react";
import { usePathname } from "next/navigation";

export type RegionCode = 'id' | 'jp' | 'global';

export const SUPPORTED_REGIONS: readonly RegionCode[] = ['id', 'jp', 'global'] as const;

/**
 * Locales whose language implies exactly one country edition.
 * `en`, `de`, `es` and `zh-CN` span several regions, so they map to none.
 */
const REGION_BY_LOCALE: Record<string, RegionCode> = {
  id: 'id',
  ja: 'jp',
};

/** Region implied by the URL locale, when there is exactly one right answer. */
export function regionForLocale(locale: string | undefined | null): RegionCode | undefined {
  return locale ? REGION_BY_LOCALE[locale.toLowerCase()] : undefined;
}

export function normalizeRegion(value: string | undefined | null): RegionCode | undefined {
  const candidate = value?.toLowerCase();
  return candidate === 'id' || candidate === 'jp' || candidate === 'global'
    ? candidate
    : undefined;
}

export interface ResolveActiveRegionInput {
  locale?: string;
  /** `?region=` from the URL: the delegate's most recent explicit choice. */
  explicitRegion?: string | undefined | null;
  /** `xpo_region` cookie, written only when a region was chosen explicitly. */
  cookieRegion?: string | undefined | null;
  /** `x-xpo-region` header, resolved from GeoIP or accept-language. */
  geoRegion?: string | undefined | null;
}

/**
 * Precedence: explicit `?region=` -> explicit cookie -> locale -> geo -> 'id'.
 *
 * Locale outranks geo on purpose: a delegate who chose Japanese must land on the Japan
 * edition even when their network geolocates elsewhere. Only an explicit choice may
 * override the locale, which is why the cookie is never written from an inferred region.
 */
export function resolveActiveRegion(input: ResolveActiveRegionInput): RegionCode {
  return (
    normalizeRegion(input.explicitRegion) ??
    normalizeRegion(input.cookieRegion) ??
    regionForLocale(input.locale) ??
    normalizeRegion(input.geoRegion) ??
    'id'
  );
}
