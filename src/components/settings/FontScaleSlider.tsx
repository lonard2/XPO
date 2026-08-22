"use client";

import * as React from "react";
import { ZoomIn, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSettings } from "./SettingsProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function FontScaleSlider({ className }: { className?: string }) {
  const { fontScale, setFontScale, isMounted } = useSettings();

  let tSet: any = (k: string) => k;
  let tCom: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tSet = useTranslations("settings");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tCom = useTranslations("common");
  } catch {
    // Fallback
  }

  const PRESETS = [
    { label: `${tSet("compact")?.split("(")?.[0]?.trim() || "Compact"} (90%)`, value: 0.9 },
    { label: `${tCom("all") === "Semua" ? "Standar" : "Default"} (100%)`, value: 1.0 },
    { label: `${tSet("comfortable")?.split("(")?.[0]?.trim() || "Enlarged"} (110%)`, value: 1.1 },
    { label: `${tSet("atkinsonHyperlegible")?.split("(")?.[0]?.trim() || "Accessible"} (125%)`, value: 1.25 },
  ];

  const currentPercent = Math.round((fontScale || 1.0) * 100);

  return (
    <div className={cn("space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ZoomIn className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">{tSet("fontScaling") || "Font Scaling"}</h4>
            <p className="text-xs text-muted-foreground">
              {tSet("subtitle") || "Adjust global typography scale across all MICE pages and timetables"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary">
            {isMounted ? `${currentPercent}%` : "100%"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFontScale(1.0)}
            disabled={!isMounted || fontScale === 1.0}
            className="h-8 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            title="Reset font scale to 100%"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">{tSet("resetDefaults")?.split(" ")?.[0] || "Reset"}</span>
          </Button>
        </div>
      </div>

      {/* Slider Control */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground w-8">90%</span>
          <input
            type="range"
            min="0.9"
            max="1.25"
            step="0.05"
            value={isMounted ? fontScale : 1.0}
            onChange={(e) => setFontScale(parseFloat(e.target.value))}
            aria-label="Font scale adjustment"
            aria-valuemin={90}
            aria-valuemax={125}
            aria-valuenow={currentPercent}
            aria-valuetext={`${currentPercent} percent`}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="text-xs font-mono text-muted-foreground w-8 text-right">125%</span>
        </div>

        {/* Preset quick buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {PRESETS.map((preset) => {
            const isSelected = isMounted && Math.abs(fontScale - preset.value) < 0.01;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => setFontScale(preset.value)}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all text-center",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="rounded-lg bg-muted/40 border border-border/60 p-3.5 space-y-1">
        <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block mb-1">
          Live Scale Preview
        </span>
        <div style={{ fontSize: `${fontScale}rem` }} className="transition-all duration-150">
          <p className="font-semibold text-foreground leading-snug">
            Exhibition Hall A1: International Manufacturing Keynote
          </p>
          <p className="text-muted-foreground leading-relaxed mt-1 text-[0.875em]">
            Present your cryptographic QR pass at Gate 3 for fast-track delegate admission.
          </p>
        </div>
      </div>
    </div>
  );
}
