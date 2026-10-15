import { NextRequest } from 'next/server';
import { normalizeRegion, type RegionCode } from './regions';

export {
  SUPPORTED_REGIONS,
  regionForLocale,
  normalizeRegion,
  resolveActiveRegion,
  type RegionCode,
  type ResolveActiveRegionInput,
} from './regions';

/**
 * Resolves the user's regional destination based on cookies, query, GeoIP headers or accept-language.
 * Country editions are inferred from the network here; the URL locale takes over in
 * `resolveActiveRegion`, which is what server components should use.
 */
export function resolveRegionFromRequest(req: NextRequest): RegionCode {
  // 1. Explicit user cookie preference
  const cookieRegion = normalizeRegion(req.cookies.get('xpo_region')?.value);
  if (cookieRegion) {
    return cookieRegion;
  }

  // 2. Query param ?region=...
  const queryRegion = normalizeRegion(req.nextUrl.searchParams.get('region'));
  if (queryRegion) {
    return queryRegion;
  }

  // 3. GeoIP headers (Vercel, Cloudflare, AWS CloudFront, standard headers)
  const countryHeader =
    req.headers.get('x-vercel-ip-country') ||
    req.headers.get('cf-ipcountry') ||
    req.headers.get('x-country') ||
    req.headers.get('cloudfront-viewer-country');

  if (countryHeader) {
    const country = countryHeader.toUpperCase().trim();
    if (country === 'ID') return 'id';
    if (country === 'JP') return 'jp';
    return 'global';
  }

  // 4. Accept-Language parsing
  const acceptLanguage = req.headers.get('accept-language')?.toLowerCase() || '';
  if (acceptLanguage.includes('id') || acceptLanguage.includes('id-id') || acceptLanguage.includes('indonesia')) {
    return 'id';
  }
  if (acceptLanguage.includes('ja') || acceptLanguage.includes('ja-jp') || acceptLanguage.includes('japan')) {
    return 'jp';
  }

  // 5. Default is 'id' (Indonesia) for localized Indonesian focus and local dev
  return 'id';
}
