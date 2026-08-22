import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { resolveRegionFromRequest } from './lib/i18n/geo';
import { canAccessRoute, UserRole, isValidRole } from './lib/auth/rbac';

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

  // RBAC Access Control Evaluation
  const roleCookie = req.cookies.get('xpo_role')?.value;
  const activeRole: UserRole = (roleCookie && isValidRole(roleCookie)) ? roleCookie : 'ORGANIZER';
  
  const pathname = req.nextUrl.pathname;
  const isAuthorized = canAccessRoute(activeRole, pathname);

  response.headers.set('x-xpo-user-role', activeRole);
  response.headers.set('x-xpo-authorized', isAuthorized ? 'true' : 'false');

  return response;
}

export const config = {
  matcher: [
    '/',
    '/(en|ja|zh-CN|id|de|es)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
