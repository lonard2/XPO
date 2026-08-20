"use client";

import * as React from "react";
import { Type, BookOpen, Binary, Eye, Check } from "lucide-react";
import { useSettings, type TypographyMode } from "./SettingsProvider";
import { cn } from "@/lib/utils";

interface TypographyOption {
  id: TypographyMode;
  label: string;
  subtitle: string;
  description: string;
  sampleText: string;
  glyphSample: string;
  fontClass: string;
  icon: React.ElementType;
}

const TYPOGRAPHY_OPTIONS: TypographyOption[] = [
  {
    id: "modern-sans",
    label: "Modern Sans",
    subtitle: "Inter / System Sans",
    description: "Engineered for optimal screen legibility and neutral UI presentation.",
    glyphSample: "Aa Bb Gg 123",
    sampleText: "Connecting global attendees, organizers, and world-class convention venues.",
    fontClass: "font-sans",
    icon: Type,
  },
  {
    id: "editorial-serif",
    label: "Editorial Serif",
    subtitle: "Newsreader / Charter",
    description: "Refined typographic cadence suited for academic symposiums and diplomatic briefs.",
    glyphSample: "Aa Bb Gg 123",
    sampleText: "Peer-reviewed clinical abstracts, CME accreditations, and executive summit proceedings.",
    fontClass: "font-serif",
    icon: BookOpen,
  },
  {
    id: "technical-mono",
    label: "Technical Mono",
    subtitle: "JetBrains Mono / Consolas",
    description: "Fixed-width precision ideal for developer keynotes, timetables, and RFQ tooling specs.",
    glyphSample: "0x4F 1010 [i]",
    sampleText: "event.track({ stage: 'Main Plenary', capacity: 3500, liveStream: true });",
    fontClass: "font-mono",
    icon: Binary,
  },
  {
    id: "atkinson-hyperlegible",
    label: "Atkinson Hyperlegible",
    subtitle: "High-Distinction Accessible",
    description: "Maximized letterform distinction (0 vs O, 1 vs I vs l) for enhanced visual accessibility.",
    glyphSample: "0O 1Il 8B",
    sampleText: "Precision navigation guides and accessible hall wayfinding for all visitors.",
    fontClass: "font-sans",
    icon: Eye,
  },
];

export function TypographySelector({ className }: { className?: string }) {
  const { typography, setTypography, isMounted } = useSettings();

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          Typography Engine
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
                "flex flex-col p-4 rounded-xl border text-left transition-all relative group",
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

              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {opt.description}
              </p>

              {/* Typeface Preview specimen */}
              <div className="w-full rounded-lg bg-muted/50 border border-border/50 p-3 mt-auto pointer-events-none">
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-base font-bold text-foreground tracking-wide", opt.fontClass)}>
                    {opt.glyphSample}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                    Sample
                  </span>
                </div>
                <p className={cn("text-xs text-muted-foreground leading-relaxed line-clamp-2", opt.fontClass)}>
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
