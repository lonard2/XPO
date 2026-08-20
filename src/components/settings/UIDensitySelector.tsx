"use client";

import * as React from "react";
import { LayoutGrid, Rows3, Check } from "lucide-react";
import { useSettings, type UIDensity } from "./SettingsProvider";
import { cn } from "@/lib/utils";

interface DensityOption {
  id: UIDensity;
  label: string;
  description: string;
  icon: React.ElementType;
  previewRows: number;
  rowPaddingClass: string;
}

const DENSITY_OPTIONS: DensityOption[] = [
  {
    id: "comfortable",
    label: "Comfortable",
    description: "Generous whitespace and touch-friendly padding for relaxed reading.",
    icon: LayoutGrid,
    previewRows: 2,
    rowPaddingClass: "py-2.5 px-3",
  },
  {
    id: "compact",
    label: "Compact",
    description: "High-density data presentation designed for fast agenda scanning.",
    icon: Rows3,
    previewRows: 3,
    rowPaddingClass: "py-1.5 px-2.5",
  },
];

export function UIDensitySelector({ className }: { className?: string }) {
  const { density, setDensity, isMounted } = useSettings();

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          UI Density
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
                "flex flex-col p-4 rounded-xl border text-left transition-all relative group",
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
                      {opt.id === "comfortable" ? "Default spacing" : "High data density"}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {opt.description}
              </p>

              {/* Visual preview box */}
              <div className="w-full rounded-lg bg-muted/60 border border-border/50 p-2 space-y-1.5 mt-auto pointer-events-none">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span>MICE Agenda Preview</span>
                  <span>Hall B3</span>
                </div>
                <div className="space-y-1">
                  {Array.from({ length: opt.previewRows }).map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "rounded bg-card border border-border/60 flex items-center justify-between text-xs transition-all",
                        opt.rowPaddingClass
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary/70" />
                        <span className="text-[11px] font-medium text-foreground">
                          {idx === 0 ? "Keynote Plenary" : idx === 1 ? "Technical Panel" : "Exhibitor Pitch"}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {idx === 0 ? "09:00" : idx === 1 ? "10:30" : "13:00"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
