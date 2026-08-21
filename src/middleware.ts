import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { resolveRegionFromRequest } from './lib/i18n/geo';

const intlMiddleware = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const response = intlMiddleware(req);
  const detectedRegion = resolveRegionFromRequest(req);

  // Attach detected/preferred region header
  response.headers.set('x-xpo-region', detectedRegion);

  // If user doesn't have region cookie, set default inferred from geo
  if (!req.cookies.has('xpo_region')) {
    response.cookies.set('xpo_region', detectedRegion, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/(en|ja|zh-CN|id|de|es)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
