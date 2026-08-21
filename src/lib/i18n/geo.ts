import { NextRequest } from 'next/server';

export type RegionCode = 'id' | 'jp' | 'global';

export const SUPPORTED_REGIONS: readonly RegionCode[] = ['id', 'jp', 'global'] as const;

/**
 * Resolves the user's regional destination based on GeoIP headers, accept-language, cookies, or default.
 * Indonesia (ID) -> 'id'
 * Japan (JP) -> 'jp'
 * Rest of World -> 'global'
 * Local/Default -> 'id'
 */
export function resolveRegionFromRequest(req: NextRequest): RegionCode {
  // 1. Explicit user cookie preference
  const cookieRegion = req.cookies.get('xpo_region')?.value?.toLowerCase();
  if (cookieRegion && (cookieRegion === 'id' || cookieRegion === 'jp' || cookieRegion === 'global')) {
    return cookieRegion as RegionCode;
  }

  // 2. Query param ?region=...
  const url = req.nextUrl;
  const queryRegion = url.searchParams.get('region')?.toLowerCase();
  if (queryRegion && (queryRegion === 'id' || queryRegion === 'jp' || queryRegion === 'global')) {
    return queryRegion as RegionCode;
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
