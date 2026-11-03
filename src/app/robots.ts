import type { MetadataRoute } from "next";
import { siteBaseUrl } from "@/lib/seo/site";

/**
 * Crawlers may index the public discovery surfaces. Everything transactional
 * or portal-scoped stays out: API routes, pass wallets, the organizer portal,
 * scanner, event creation, and the admin shell.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/*/my-tickets",
          "/*/my-tickets/",
          "/*/dashboard",
          "/*/dashboard/",
          "/*/events/new",
          "/*/scanner",
          "/*/admin/",
          "/*/admin",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
