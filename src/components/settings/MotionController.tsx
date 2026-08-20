"use client";

import * as React from "react";
import { Sparkles, Layers, EyeOff, Check, Activity } from "lucide-react";
import { useSettings, type MotionMode } from "./SettingsProvider";
import { cn } from "@/lib/utils";

interface MotionOption {
  id: MotionMode;
  label: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
}

const MOTION_OPTIONS: MotionOption[] = [
  {
    id: "off",
    label: "Reduced Motion",
    subtitle: "Zero Animation",
    description: "Eliminates all CSS transitions, transforms, and card tilts for vestibular safety.",
    icon: EyeOff,
  },
  {
    id: "subtle",
    label: "Subtle Dynamics",
    subtitle: "Standard Smooth UI",
    description: "Balanced, lightweight fade transitions and subtle hover elevations.",
    icon: Layers,
  },
  {
    id: "expressive",
    label: "Expressive / Cinematic",
    subtitle: "3D Tilt & Ambient Glows",
    description: "Multi-axis perspective card tilts, ambient lighting halos, and staggered reveals.",
    icon: Sparkles,
  },
];

export function MotionController({ className }: { className?: string }) {
  const { motionMode, setMotionMode, isMounted } = useSettings();

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Motion & Animation Dynamics
          </h4>
          <p className="text-xs text-muted-foreground">
            Control spatial depth, transitions, and micro-interactions
          </p>
        </div>
        <span className="text-xs font-mono font-medium text-muted-foreground capitalize">
          {isMounted ? `Mode: ${motionMode}` : "Loading..."}
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Motion dynamics selection"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {MOTION_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = isMounted && motionMode === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setMotionMode(opt.id)}
              className={cn(
                "flex flex-col p-4 rounded-xl border text-left transition-all relative group",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                  : "border-border bg-card hover:border-border/80 hover:bg-accent/40"
              )}
            >
              <div className="flex items-start justify-between w-full mb-3">
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

                {isSelected && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                )}
              </div>

              <div className="mb-2">
                <span className="text-sm font-semibold text-foreground block">
                  {opt.label}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono block">
                  {opt.subtitle}
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Interactive motion preview card */}
      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
              Live Motion Test Card
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">Hover or tap card below</span>
        </div>

        <div
          className={cn(
            "p-4 rounded-lg border border-border bg-gradient-to-br from-card to-muted/40 cursor-pointer select-none",
            motionMode === "expressive" && "card-interactive-3d ambient-glow",
            motionMode === "subtle" && "transition-transform hover:-translate-y-1 hover:shadow-sm",
            motionMode === "off" && "hover:none"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-foreground">Interactive MICE Booth Card</span>
              <p className="text-[11px] text-muted-foreground">
                Testing {motionMode.toUpperCase()} physics curve & hover dynamics
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/20">
              HALL 4 - B12
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
