"use client";

import * as React from "react";
import { LayoutGrid, Rows3, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSettings, type UIDensity } from "./SettingsProvider";
import { cn } from "@/lib/utils";

export function UIDensitySelector({ className }: { className?: string }) {
  const { density, setDensity, isMounted } = useSettings();

  let tSet: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tSet = useTranslations("settings");
  } catch {
    // Fallback
  }

  const DENSITY_OPTIONS = [
    {
      id: "comfortable" as UIDensity,
      label: tSet("comfortable")?.split("(")?.[0]?.trim() || "Comfortable",
      description: tSet("comfortableDesc") || "Generous whitespace and touch-friendly padding for relaxed reading.",
      icon: LayoutGrid,
      previewRows: 2,
      rowPaddingClass: "py-2.5 px-3",
    },
    {
      id: "compact" as UIDensity,
      label: tSet("compact")?.split("(")?.[0]?.trim() || "Compact",
      description: tSet("compactDesc") || "High-density data presentation designed for fast agenda scanning.",
      icon: Rows3,
      previewRows: 3,
      rowPaddingClass: "py-1.5 px-2.5",
    },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          {tSet("density") || "UI Density"}
        </label>
        <span className="text-xs text-muted-foreground capitalize">
          {isMounted ? `Active: ${density}` : "Loading..."}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="UI density selection"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {DENSITY_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = isMounted && density === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setDensity(opt.id)}
              className={cn(
                "flex flex-col p-4 rounded-xl border text-left transition-all relative group cursor-pointer",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                  : "border-border bg-card hover:border-border/80 hover:bg-accent/40"
              )}
            >
              <div className="flex items-start justify-between w-full mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground block">
                      {opt.label}
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      {opt.id === "comfortable" ? (tSet("comfortable") || "Default spacing") : (tSet("compact") || "High data density")}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                {opt.description}
              </p>

              {/* Visual preview representation */}
              <div className="w-full bg-muted/40 rounded-lg p-2 space-y-1.5 border border-border/40 mt-auto">
                {Array.from({ length: opt.previewRows }).map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center justify-between rounded bg-background border border-border/50 text-[10px] text-muted-foreground",
                      opt.rowPaddingClass
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{opt.id === "comfortable" ? "10:00 AM • Main Keynote" : "10:00 • Tech Track"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
