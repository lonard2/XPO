"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Compass,
  Calendar,
  Building2,
  ArrowRight,
  Globe2,
  Search,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export default function LocalizedNotFound() {
  const pathname = usePathname();
  const tCom = useTranslations("common");
  // Extract locale prefix from pathname, fallback to 'en'
  const matchedLocale = pathname?.split("/")[1];
  const locale = ["en", "ja", "zh-CN", "id", "de", "es"].includes(matchedLocale)
    ? matchedLocale
    : "en";

  return (
    <div className="container max-w-2xl py-16 sm:py-24 text-center space-y-8 animate-fade-in">
      {/* Icon & Status Pill */}
      <div className="space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-xs">
          <Compass className="h-8 w-8" />
        </div>
        <div>
          <Badge variant="outline" className="text-xs font-mono font-semibold text-muted-foreground px-3 py-1">
            {tCom("notFoundHttp")}
          </Badge>
        </div>
      </div>

      {/* Main Title & Descriptive Guidance */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {tCom("notFoundTitle")}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          {tCom("notFoundDesc")}
        </p>
      </div>

      {/* Core Action Pathways */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href={`/${locale}`}
          className={cn(buttonVariants({ variant: "default", size: "default" }), "gap-2 font-semibold text-xs min-h-[40px] px-5 shadow-sm")}
        >
          <Compass className="h-4 w-4" />
          <span>{tCom("notFoundReturn")}</span>
        </Link>
        <Link
          href={`/${locale}/events`}
          className={cn(buttonVariants({ variant: "outline", size: "default" }), "gap-2 font-semibold text-xs min-h-[40px] px-5")}
        >
          <Calendar className="h-4 w-4" />
          <span>{tCom("notFoundBrowse")}</span>
        </Link>
        <Link
          href={`/${locale}/venues`}
          className={cn(buttonVariants({ variant: "ghost", size: "default" }), "gap-2 font-semibold text-xs min-h-[40px] px-4")}
        >
          <Building2 className="h-4 w-4" />
          <span>{tCom("notFoundVenues")}</span>
        </Link>
      </div>

      {/* Quick Regional Navigation Card */}
      <Card className="border-border/80 bg-card/60 p-5 max-w-lg mx-auto text-left space-y-3">
        <div className="text-xs font-semibold text-foreground flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary" />
          <span>{tCom("notFoundBrowseByEdition")}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <Link
            href={`/${locale}/region/id`}
            className="p-2.5 rounded-lg border border-border/60 bg-background/50 hover:bg-muted/80 transition-colors block text-center"
          >
            <div className="font-semibold text-foreground">{tCom("notFoundIndonesia")}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{tCom("notFoundIndonesiaVenues")}</div>
          </Link>
          <Link
            href={`/${locale}/region/jp`}
            className="p-2.5 rounded-lg border border-border/60 bg-background/50 hover:bg-muted/80 transition-colors block text-center"
          >
            <div className="font-semibold text-foreground">{tCom("notFoundJapan")}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{tCom("notFoundJapanVenues")}</div>
          </Link>
          <Link
            href={`/${locale}/region/global`}
            className="p-2.5 rounded-lg border border-border/60 bg-background/50 hover:bg-muted/80 transition-colors block text-center"
          >
            <div className="font-semibold text-foreground">{tCom("notFoundGlobal")}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{tCom("notFoundGlobalVenues")}</div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
