"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { normalizeRegion, regionForLocale, type RegionCode } from "./regions";

/**
 * Single client-side source of truth for the active country edition.
 * One precedence chain shared by the navbar and every RegionSwitcher:
 * `/region/` path segment -> explicit parent code -> `?region=` ->
 * `xpo_region` cookie -> URL locale -> 'id'.
 */
export function useActiveRegion(options?: {
  locale?: string;
  activeRegionCode?: string | null;
}): RegionCode {
  const pathname: string | null = usePathname();

  const compute = React.useCallback((): RegionCode => {
    const pathMatch =
      typeof pathname === "string" ? pathname.match(/\/region\/(id|jp|global)/i) : null;
    if (pathMatch) return pathMatch[1].toLowerCase() as RegionCode;
    const explicit = normalizeRegion(options?.activeRegionCode);
    if (explicit) return explicit;
    if (typeof window !== "undefined") {
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
  }, [pathname, options?.locale, options?.activeRegionCode]);

  const [region, setRegion] = React.useState<RegionCode>(compute);

  React.useEffect(() => {
    setRegion(compute());
  }, [compute]);

  return region;
}
