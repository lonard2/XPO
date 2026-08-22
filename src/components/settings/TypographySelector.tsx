"use client";

import * as React from "react";
import { Type, BookOpen, Binary, Eye, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSettings, type TypographyMode } from "./SettingsProvider";
import { cn } from "@/lib/utils";

export function TypographySelector({ className }: { className?: string }) {
  const { typography, setTypography, isMounted } = useSettings();

  let tSet: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tSet = useTranslations("settings");
  } catch {
    // Fallback
  }

  const TYPOGRAPHY_OPTIONS = [
    {
      id: "modern-sans" as TypographyMode,
      label: tSet("modernSans") || "Modern Sans (Inter)",
      subtitle: "Inter / System Sans",
      description: tSet("modernSansDesc") || "Engineered for optimal screen legibility and neutral UI presentation.",
      glyphSample: "Aa Bb Gg 123",
      sampleText: "Connecting global attendees, organizers, and world-class convention venues.",
      fontClass: "font-sans",
      icon: Type,
    },
    {
      id: "editorial-serif" as TypographyMode,
      label: tSet("editorialSerif") || "Editorial Serif (Newsreader)",
      subtitle: "Newsreader / Charter",
      description: tSet("editorialSerifDesc") || "Refined typographic cadence suited for academic symposiums and diplomatic briefs.",
      glyphSample: "Aa Bb Gg 123",
      sampleText: "Peer-reviewed clinical abstracts, CME accreditations, and executive summit proceedings.",
      fontClass: "font-serif",
      icon: BookOpen,
    },
    {
      id: "technical-mono" as TypographyMode,
      label: tSet("technicalMono") || "Technical Mono (JetBrains Mono)",
      subtitle: "JetBrains Mono / Consolas",
      description: tSet("technicalMonoDesc") || "Fixed-width precision ideal for developer keynotes, timetables, and RFQ tooling specs.",
      glyphSample: "0x4F 1010 [i]",
      sampleText: "event.track({ stage: 'Main Plenary', capacity: 3500, liveStream: true });",
      fontClass: "font-mono",
      icon: Binary,
    },
    {
      id: "atkinson-hyperlegible" as TypographyMode,
      label: tSet("atkinsonHyperlegible") || "Atkinson Hyperlegible",
      subtitle: "High-Distinction Accessible",
      description: tSet("atkinsonHyperlegibleDesc") || "Maximized letterform distinction (0 vs O, 1 vs I vs l) for enhanced visual accessibility.",
      glyphSample: "0O 1Il 8B",
      sampleText: "Precision navigation guides and accessible hall wayfinding for all visitors.",
      fontClass: "font-sans",
      icon: Eye,
    },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          {tSet("typography") || "Typography Engine"}
        </label>
        <span className="text-xs text-muted-foreground">
          {isMounted ? `Active: ${typography}` : "Loading..."}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Typography engine selection"
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        {TYPOGRAPHY_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = isMounted && typography === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTypography(opt.id)}
              className={cn(
                "flex flex-col p-4 rounded-xl border text-left transition-all relative group cursor-pointer",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                  : "border-border bg-card hover:border-border/80 hover:bg-accent/40"
              )}
            >
              <div className="flex items-start justify-between w-full mb-2">
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
                    <span className="text-[11px] text-muted-foreground block font-mono">
                      {opt.subtitle}
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

              {/* Typography Preview */}
              <div className="w-full bg-muted/40 rounded-lg p-3 space-y-1.5 border border-border/40 mt-auto">
                <div className="flex items-center justify-between text-xs border-b border-border/40 pb-1">
                  <span className={cn("text-base font-bold text-foreground", opt.fontClass)}>
                    {opt.glyphSample}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-muted-foreground">
                    Preview
                  </span>
                </div>
                <p className={cn("text-xs text-foreground/90 line-clamp-2 leading-relaxed pt-1", opt.fontClass)}>
                  {opt.sampleText}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
