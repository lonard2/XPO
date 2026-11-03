/**
 * Canonical site URL. Three env names exist for historical reasons; prefer the
 * app URL, accept the site URL, and fall back to the production domain so
 * sitemaps and structured data never emit localhost.
 */
export function siteBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://xpo.events";
  return raw.replace(/\/+$/, "");
}
