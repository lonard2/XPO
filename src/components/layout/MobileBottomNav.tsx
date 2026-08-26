"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Compass, Layers, Building2, Ticket, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav({ locale = "en" }: { locale?: string }) {
  const pathname = usePathname();

  let tNav: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tNav = useTranslations("nav");
  } catch {
    // Fallback if rendered outside provider in tests
  }

  const items = [
    { href: `/${locale}`, label: tNav("explore") || "Explore", icon: Compass },
    { href: `/${locale}/events`, label: tNav("events") || "Events", icon: Layers },
    { href: `/${locale}/venues`, label: tNav("venues") || "Venues", icon: Building2 },
    { href: `/${locale}/my-tickets`, label: tNav("myTickets") || "Passes", icon: Ticket },
    { href: `/${locale}/settings`, label: tNav("settings") || "Settings", icon: SettingsIcon },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-lg pb-safe"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === `/${locale}`
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors touch-manipulation",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-0.5", isActive ? "stroke-[2.5]" : "stroke-[1.8]")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
