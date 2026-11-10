"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { normalizeRegion, regionForLocale, type RegionCode } from "./regions";

/**
 * Single client-side source of truth for the active country edition.
 * One precedence chain shared by the navbar and every RegionSwitcher:
 * `/region/` path segment -> explicit parent code -> `?region=` ->
 * `xpo_region` cookie -> URL locale -> 'id'.
 *
 * The browser-only steps are deferred to an effect. The server cannot read
 * `window.location` or `document.cookie` in a client component, so reading
 * them during the first render produced a hydration mismatch: the server
 * rendered the locale edition while the client rendered the cookie or query
 * edition. The first render now uses the same server-safe inputs on both
 * sides, and the browser state lands one paint later.
 */
export function useActiveRegion(options?: {
  locale?: string;
  activeRegionCode?: string | null;
}): RegionCode {
  const pathname: string | null = usePathname();

  const compute = React.useCallback(
    (readBrowser: boolean): RegionCode => {
      const pathMatch =
        typeof pathname === "string"
          ? pathname.match(/\/region\/(id|jp|global)/i)
          : null;
      if (pathMatch) return pathMatch[1].toLowerCase() as RegionCode;
      const explicit = normalizeRegion(options?.activeRegionCode);
      if (explicit) return explicit;
      if (readBrowser && typeof window !== "undefined") {
        const queryRegion = normalizeRegion(
          new URLSearchParams(window.location.search).get("region")
        );
        if (queryRegion) return queryRegion;
        const cookieRegion = normalizeRegion(
          document.cookie.match(/xpo_region=([^;]+)/)?.[1]
        );
        if (cookieRegion) return cookieRegion;
      }
      return regionForLocale(options?.locale) ?? "id";
    },
    [pathname, options?.locale, options?.activeRegionCode]
  );

  const [region, setRegion] = React.useState<RegionCode>(() => compute(false));

  React.useEffect(() => {
    setRegion(compute(true));
  }, [compute]);

  return region;
}
