"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { MapPin, Check, ChevronDown, Building2, Globe, Coins, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { useTranslations } from "next-intl";
import { handleListboxKeyDown } from "@/lib/a11y/listboxKeyboard";
import { regionName, regionDescription, regionKeyVenues } from "@/lib/i18n/registry";
import { cn } from "@/lib/utils";
import { useActiveRegion } from "@/lib/i18n/useActiveRegion";
import { SupportedCurrency } from "@/lib/i18n/formatters";

export interface RegionOption {
  code: "id" | "jp" | "global";
  label: string;
  nativeName: string;
  editionTitle: string;
  currency: SupportedCurrency;
  timezone: string;
  timezoneName: string;
  flagCode: string;
  venueCount: number;
  highlightVenues: string;
  description: string;
}

export const REGION_OPTIONS: readonly RegionOption[] = [
  {
    code: "id",
    label: "Indonesia",
    nativeName: "Indonesia",
    editionTitle: "Indonesia",
    currency: "IDR",
    timezone: "Asia/Jakarta",
    timezoneName: "WIB (UTC+7)",
    flagCode: "ID",
    venueCount: 6,
    highlightVenues: "JIExpo, ICE BSD, JICC, NICE PIK 2, GBK, JIS",
    description: "Southeast Asia's industrial manufacturing & mega fair gateway.",
  },
  {
    code: "jp",
    label: "Japan",
    nativeName: "日本",
    editionTitle: "Japan",
    currency: "JPY",
    timezone: "Asia/Tokyo",
    timezoneName: "JST (UTC+9)",
    flagCode: "JP",
    venueCount: 3,
    highlightVenues: "Tokyo Big Sight, Makuhari Messe, Pacifico Yokohama",
    description: "Global epicenter for robotics, developer summits, and clean tech.",
  },
  {
    code: "global",
    label: "Global Hubs",
    nativeName: "Global",
    editionTitle: "Global Hubs",
    currency: "USD",
    timezone: "UTC",
    timezoneName: "UTC",
    flagCode: "GL",
    venueCount: 4,
    highlightVenues: "Marina Bay Sands, Messe Frankfurt, ExCeL London",
    description: "World-class convention complexes across international financial capitals.",
  },
] as const;

export interface RegionSwitcherProps {
  currentLocale?: string;
  activeRegionCode?: string;
  variant?: "dropdown" | "pills" | "cards";
  className?: string;
  onActiveRegionChange?: (code: "id" | "jp" | "global") => void;
}

export function RegionSwitcher({
  currentLocale = "en",
  activeRegionCode,
  variant = "dropdown",
  className,
  onActiveRegionChange,
}: RegionSwitcherProps) {
  let tReg: any = (k: string) => k;
  let tNav: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tReg = useTranslations("regions");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tNav = useTranslations("nav");
  } catch {
    // Fallback
  }

  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // One precedence chain with the navbar: prop > ?region= > cookie > locale.
  const hookRegion = useActiveRegion({ locale: currentLocale, activeRegionCode });
  const [currentRegion, setCurrentRegion] = React.useState<string>(hookRegion);
  const prevHookRef = React.useRef(hookRegion);

  // Adopt shared resolution only when it moves under us (navigation,
  // back-button, parent override) — never revert an in-flight local pick.
  React.useEffect(() => {
    if (prevHookRef.current !== hookRegion) {
      prevHookRef.current = hookRegion;
      setCurrentRegion(hookRegion);
      onActiveRegionChange?.(hookRegion);
    }
  }, [hookRegion, onActiveRegionChange]);

  const selectedRegion =
    REGION_OPTIONS.find((r) => r.code === currentRegion) || REGION_OPTIONS[0];

  const handleRegionChange = (regionCode: "id" | "jp" | "global") => {
    setIsOpen(false);
    setCurrentRegion(regionCode);
    onActiveRegionChange?.(regionCode);
    if (typeof document !== "undefined") {
      document.cookie = `xpo_region=${regionCode}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }
    
    // Preserve current route path (e.g. /events, /venues, /calendar) while updating ?region=.
    // On /region/ edition paths, swap the code segment and keep the subpath.
    const targetPath = pathname || `/${currentLocale}`;
    const regionPathMatch = targetPath.match(/^(\/[^/]+\/region\/)(id|jp|global)(\/.*)?$/i);
    if (regionPathMatch) {
      const rest = regionPathMatch[3] || "";
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
      params.delete('region');
      const query = params.toString();
      router.push(`${regionPathMatch[1]}${regionCode}${rest}${query ? `?${query}` : ""}`);
    } else {
      const currentParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
      currentParams.set('region', regionCode);
      router.push(`${targetPath}?${currentParams.toString()}`);
    }
  };

  // Close dropdown on outside click or Escape key
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (variant === "cards") {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
        {REGION_OPTIONS.map((region) => {
          const isSelected = region.code === currentRegion;
          return (
            <Card
              key={region.code}
              interactive
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onClick={() => handleRegionChange(region.code)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleRegionChange(region.code);
                }
              }}
              className={cn(
                "cursor-pointer transition-all border text-left",
                isSelected
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">
                        {regionName(tReg, region.code, region.editionTitle)}
                      </CardTitle>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {region.flagCode} • {region.nativeName}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <Badge variant="archetype" className="text-xs uppercase">
                      {tNav("activeBadge")}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs pt-1 line-clamp-2">
                  {regionDescription(tReg, region.code, region.description)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5 pt-0 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 text-[11px]">
                  <Coins className="h-3 w-3 text-primary/70" />
                  <span>Currency: {region.currency}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <Clock className="h-3 w-3 text-primary/70" />
                  <span>Timezone: {region.timezoneName}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <Building2 className="h-3 w-3 text-primary/70" />
                  <span>{regionKeyVenues(tReg, region.code, region.highlightVenues)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  if (variant === "pills") {
    return (
      <div
        className={cn("flex flex-wrap items-center gap-2", className)}
        role="radiogroup"
        aria-label={tNav("countryGroupAria")}
      >
        {REGION_OPTIONS.map((region) => {
          const isSelected = region.code === currentRegion;
          return (
            <button
              key={region.code}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleRegionChange(region.code)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/40",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Globe className="h-3 w-3" />
              <span>{regionName(tReg, region.code, region.editionTitle)}</span>
              <span className="text-xs opacity-75 uppercase">({region.currency})</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={tNav("regionTriggerAria", { label: regionName(tReg, selectedRegion.code, selectedRegion.editionTitle) })}
        className="h-9 px-2.5 gap-1.5 text-xs font-medium border border-border/60 hover:bg-accent hover:text-accent-foreground min-h-[44px]"
      >
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span className="font-semibold">{regionName(tReg, selectedRegion.code, selectedRegion.editionTitle)}</span>
        <ChevronDown
          className={cn("h-3 w-3 text-muted-foreground transition-transform duration-200", {
            "rotate-180": isOpen,
          })}
        />
      </Button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={tNav("regionListAria")}
          onKeyDown={handleListboxKeyDown}
          className="absolute right-0 mt-1.5 w-64 origin-top-right rounded-xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-100"
        >
          <div className="px-2.5 py-1.5 border-b border-border/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="h-3 w-3 text-primary" />
            <span>{tNav("regionHeading")}</span>
          </div>

          <div className="py-1 space-y-1 max-h-72 overflow-y-auto">
            {REGION_OPTIONS.map((region) => {
              const isSelected = region.code === currentRegion;
              return (
                <button
                  key={region.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleRegionChange(region.code)}
                  className={cn(
                    "w-full flex items-start justify-between px-2.5 py-2 rounded-lg text-xs transition-colors text-left",
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-muted/70"
                  )}
                >
                  <div className="flex flex-col space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground">{regionName(tReg, region.code, region.editionTitle)}</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        ({region.currency})
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {region.timezoneName} • {tReg("venueCountN", { count: region.venueCount })}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-primary stroke-[2.5] mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
