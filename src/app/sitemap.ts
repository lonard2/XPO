import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteBaseUrl } from "@/lib/seo/site";
import { db } from "@/lib/db";
import { listingWhere } from "@/lib/discovery/presentation";

/**
 * Sitemap for the public discovery surfaces only: locale homes, event and
 * venue indexes, calendar, legal pages, the three region editions, and every
 * event and venue slug. Pass wallets, organizer and admin routes are private
 * and intentionally absent. A database failure still yields the static routes
 * so crawlers never get an empty sitemap.
 */

const REGION_CODES = ["id", "jp", "global"] as const;

const STATIC_PATHS: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/events", changeFrequency: "daily", priority: 0.9 },
  { path: "/venues", changeFrequency: "weekly", priority: 0.9 },
  { path: "/calendar", changeFrequency: "daily", priority: 0.7 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteBaseUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const route of STATIC_PATHS) {
      entries.push({
        url: `${base}/${locale}${route.path}`,
        lastModified: now,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    }
    for (const code of REGION_CODES) {
      entries.push({
        url: `${base}/${locale}/region/${code}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  try {
    const [events, venues] = await db.$transaction([
      db.event.findMany({
        where: listingWhere(),
        select: { slug: true, updatedAt: true },
      }),
      db.venue.findMany({
        select: { slug: true, createdAt: true },
      }),
    ]);

    for (const locale of routing.locales) {
      for (const event of events) {
        entries.push({
          url: `${base}/${locale}/events/${event.slug}`,
          lastModified: event.updatedAt ?? now,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
      for (const venue of venues) {
        entries.push({
          url: `${base}/${locale}/venues/${venue.slug}`,
          lastModified: venue.createdAt ?? now,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  } catch {
    // Static routes above still give crawlers a valid sitemap.
  }

  return entries;
}
