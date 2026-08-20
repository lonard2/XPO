"use client";

import * as React from "react";
import { Bot, Sparkles, Navigation, Clock, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { useSettings } from "./SettingsProvider";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function AIConciergeToggle({ className }: { className?: string }) {
  const { aiConciergeEnabled, setAiConciergeEnabled, isMounted } = useSettings();

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 sm:p-6 space-y-5", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-semibold text-foreground">
                Attendee AI Concierge
              </h4>
              {isMounted && (
                <Badge
                  variant={aiConciergeEnabled ? "success" : "neutral"}
                  className="text-[10px] uppercase font-mono tracking-wider"
                >
                  {aiConciergeEnabled ? "Active" : "Disabled"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed max-w-xl">
              Enable the floating AI copilot to provide instant schedule lookups, hall wayfinding,
              and public transit instructions grounded in real MICE database records.
            </p>
          </div>
        </div>

        {/* Switch Control */}
        <button
          type="button"
          role="switch"
          aria-checked={aiConciergeEnabled}
          aria-label="Toggle Attendee AI Concierge"
          onClick={() => setAiConciergeEnabled(!aiConciergeEnabled)}
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 self-start sm:self-auto",
            aiConciergeEnabled ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out",
              aiConciergeEnabled ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>

      {/* Feature Capabilities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/40">
          <Navigation className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-foreground block">
              Venue Wayfinding
            </span>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Locate specific exhibitor booths, plenary halls, and registration counters.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/40">
          <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-foreground block">
              Live Timetable Synthesis
            </span>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Summarize keynote tracks, speaker panels, and room schedule conflicts.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/40">
          <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-foreground block">
              Multi-Model Gateway
            </span>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Powered by OpenRouter streaming models with intelligent offline fallbacks.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/40">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-foreground block">
              Privacy Preserving
            </span>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Chat history is kept strictly in local browser state and can be cleared anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
