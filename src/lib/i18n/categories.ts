/**
 * Localized lookups for the 22 MICE event categories and 6 industry clusters.
 *
 * Dictionaries carry the translated `archetypes.<KEY>.{title,tag,description}`
 * entries; theming tokens carry the English originals. Every helper prefers
 * the dictionary and falls back to the English original, so a missing key
 * degrades to English instead of rendering a raw `KEY.title` lookup path.
 */

export const CLUSTER_LABEL_KEYS: Record<string, string> = {
  ALL: "clusterAll",
  heavy_industry_infrastructure: "clusterHeavy",
  digital_tech_media: "clusterDigital",
  enterprise_supply_finance: "clusterEnterprise",
  sovereign_defense_aviation: "clusterSovereign",
  health_travel_faith: "clusterHealth",
  culture_lifestyle_sports: "clusterCulture",
};

function lookup(t: any, path: string): string | undefined {
  try {
    const v = t?.(path);
    if (typeof v === "string" && v !== path) return v;
  } catch {
    // Ignore translation lookup errors
  }
  return undefined;
}

function lookupRaw(t: any, key: string, field: "title" | "tag" | "description"): string | undefined {
  try {
    const raw = t?.raw?.(key);
    const v = raw?.[field];
    if (typeof v === "string" && v.length > 0) return v;
  } catch {
    // Ignore translation lookup errors
  }
  return undefined;
}

/** Localized category title, e.g. "22 Event Categories" matrix card name. */
export function archTitle(t: any, key: string, fallback: string): string {
  return lookup(t, `${key}.title`) ?? lookupRaw(t, key, "title") ?? fallback;
}

/** Localized short badge label. */
export function archTag(t: any, key: string, fallback: string): string {
  return lookup(t, `${key}.tag`) ?? lookupRaw(t, key, "tag") ?? fallback;
}

/** Localized one-line category description for card subtitles. */
export function archDescription(t: any, key: string, fallback: string): string {
  return lookup(t, `${key}.description`) ?? lookupRaw(t, key, "description") ?? fallback;
}

/** Localized industry cluster short label. Unknown ids render the fallback. */
export function clusterLabel(tOrg: any, clusterId: string, fallback: string): string {
  const key = CLUSTER_LABEL_KEYS[clusterId];
  if (!key) return fallback;
  try {
    const v = tOrg?.(key);
    if (typeof v === "string" && v !== key) return v;
  } catch {
    // Ignore translation lookup errors
  }
  return fallback;
}
