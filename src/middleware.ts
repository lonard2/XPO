import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all request paths except for:
  // - API routes (/api/*)
  // - _next and _vercel internal assets
  // - Static files with extensions (e.g. .svg, .png, .jpg, .ico, .txt, etc.)
  matcher: [
    "/",
    "/(en|ja|zh-CN|id|de|es)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
