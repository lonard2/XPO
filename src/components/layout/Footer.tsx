"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Compass, ShieldCheck, Cpu, Globe2 } from "lucide-react";

export function Footer({ locale = "en" }: { locale?: string }) {
  let tNav: any = null;
  let tReg: any = null;
  let tArch: any = null;
  let tFoot: any = null;

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tNav = useTranslations("nav");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tReg = useTranslations("regions");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tArch = useTranslations("archetypes");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tFoot = useTranslations("footer");
  } catch {
    // Fallback if rendered outside provider in tests
  }

  const getSafe = (tFn: any, key: string, fallback: string): string => {
    if (!tFn) return fallback;
    try {
      const val = tFn(key);
      if (!val || val === key || (typeof val === "string" && val.includes(".") && !val.includes(" "))) {
        return fallback;
      }
      return val;
    } catch {
      return fallback;
    }
  };

  return (
    <footer className="border-t border-border bg-card/50 text-foreground transition-colors pb-20 md:pb-8 pt-12">
      <div className="container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        {/* Col 1: Brand & Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Compass className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight">XPO Digital MICE</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {getSafe(
              tFoot,
              "brandDescription",
              "The next-generation digital ecosystem for Meetings, Incentives, Conferences, and Exhibitions worldwide."
            )}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>{getSafe(tFoot, "verifiedEcosystem", "Verified MICE Ecosystem")}</span>
          </div>
        </div>

        {/* Col 2: Country Editions */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {getSafe(tFoot, "countryEditions", "Country Editions")}
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link
                href={`/${locale}/region/id`}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <Globe2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{getSafe(tReg, "id.name", "Indonesia")} (JIExpo, ICE, JICC)</span>
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/region/jp`}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <Globe2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{getSafe(tReg, "jp.name", "Japan")} (Tokyo Big Sight, Makuhari)</span>
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/region/global`}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <Globe2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{getSafe(tReg, "global.name", "Global Gateways")} (MBS, Messe Frankfurt)</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Event Categories */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {getSafe(tFoot, "eventCategories", "Event Categories")}
          </h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>{getSafe(tArch, "INDUSTRIAL_B2B.title", "Industrial & Manufacturing B2B")}</li>
            <li>{getSafe(tArch, "TECH_DEV_SUMMIT.title", "Tech, AI & Developer Summits")}</li>
            <li>{getSafe(tArch, "MEDICAL_SYMPOSIUM.title", "Medical & Healthcare Congress")}</li>
            <li>{getSafe(tArch, "AUTOMOTIVE_MOBILITY.title", "Automotive, EV & Mobility Motor Show")}</li>
            <li>{getSafe(tArch, "POP_CULTURE_GAMING.title", "Pop Culture, Gaming & Comic Con")}</li>
          </ul>
        </div>

        {/* Col 4: Organizer & Tools */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {getSafe(tFoot, "organizerTools", "Organizer Portal & Tools")}
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href={`/${locale}/dashboard`} className="text-muted-foreground hover:text-foreground transition-colors">
                {getSafe(tFoot, "organizerHub", "Organizer Event Management Hub")}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/events/new`} className="text-muted-foreground hover:text-foreground transition-colors">
                {getSafe(tFoot, "createExhibition", "Create & Publish Exhibition")}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/settings`}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <Cpu className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{getSafe(tFoot, "settingsLink", "System & AI Concierge Preferences")}</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
        <p>© 2026 XPO MICE Digital Ecosystem. {getSafe(tFoot, "allRightsReserved", "All rights reserved.")}</p>
        <p className="flex items-center gap-2 flex-wrap">
          <span>{getSafe(tFoot, "infrastructureBadge", "Enterprise MICE Infrastructure")}</span>
          <span>•</span>
          <span>{getSafe(tFoot, "accessibleBadge", "Accessible Multi-Device Architecture")}</span>
        </p>
      </div>
    </footer>
  );
}
