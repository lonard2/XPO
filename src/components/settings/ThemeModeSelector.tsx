"use client";

import * as React from "react";
import { Sun, Moon, Laptop, Eye, Check } from "lucide-react";
import { useSettings, type ThemeMode } from "./SettingsProvider";
import { cn } from "@/lib/utils";

interface ThemeOption {
  id: ThemeMode;
  label: string;
  description: string;
  icon: React.ElementType;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "light",
    label: "Light Mode",
    description: "Crisp daylight palette optimized for clear indoor reading.",
    icon: Sun,
  },
  {
    id: "dark",
    label: "Dark Mode",
    description: "Deep midnight palette engineered to reduce visual fatigue.",
    icon: Moon,
  },
  {
    id: "system",
    label: "System Default",
    description: "Automatically synchronizes with your device operating system theme.",
    icon: Laptop,
  },
  {
    id: "high-contrast",
    label: "High Contrast",
    description: "Maximized contrast boundaries for superior visual accessibility.",
    icon: Eye,
  },
];

export function ThemeModeSelector({ className }: { className?: string }) {
  const { theme, setTheme, isMounted } = useSettings();

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          Theme Mode
        </label>
        <span className="text-xs text-muted-foreground">
          {isMounted ? `Active: ${theme.toUpperCase()}` : "Loading..."}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Theme mode selection"
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = isMounted && theme === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(opt.id)}
              className={cn(
                "flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all relative group",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                  : "border-border bg-card hover:border-border/80 hover:bg-accent/40"
              )}
            >
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

              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {opt.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {opt.description}
                </p>
              </div>

              {isSelected && (
                <div className="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
