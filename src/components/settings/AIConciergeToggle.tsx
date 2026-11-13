"use client";

import * as React from "react";
import { Bot, Sparkles, Navigation, Clock, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSettings } from "./SettingsProvider";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function AIConciergeToggle({ className }: { className?: string }) {
  const { aiConciergeEnabled, setAiConciergeEnabled, isMounted } = useSettings();

  let tSet: any = (k: string) => k;
  let tAi: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tSet = useTranslations("settings");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tAi = useTranslations("ai");
  } catch {
    // Fallback
  }

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
                {tSet("aiConciergeToggle") || tAi("conciergeTitle") || "Attendee AI Concierge"}
              </h4>
              {isMounted && (
                <Badge
                  variant={aiConciergeEnabled ? "success" : "neutral"}
                  className="text-xs uppercase font-mono tracking-wider"
                >
                  {aiConciergeEnabled ? "Active" : "Disabled"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed max-w-xl">
              {tSet("aiConciergeDescription") || "Enable the floating AI copilot to provide instant schedule lookups, hall wayfinding, and public transit instructions grounded in real MICE database records."}
            </p>
          </div>
        </div>

        {/* Switch Control */}
        <button
          type="button"
          role="switch"
          aria-checked={aiConciergeEnabled}
          aria-label={tSet("aiConciergeToggleAria")}
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
              {tSet("aiFeatureWayfinding")}
            </span>
            <p className="text-xs text-muted-foreground leading-normal">
              {tSet("aiFeatureWayfindingDesc")}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/40">
          <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-foreground block">
              {tSet("aiFeatureTimetable")}
            </span>
            <p className="text-xs text-muted-foreground leading-normal">
              {tSet("aiFeatureTimetableDesc")}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/40">
          <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-foreground block">
              {tSet("aiFeatureGateway")}
            </span>
            <p className="text-xs text-muted-foreground leading-normal">
              {tSet("aiFeatureGatewayDesc")}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/40">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-foreground block">
              {tSet("aiFeaturePrivacy")}
            </span>
            <p className="text-xs text-muted-foreground leading-normal">
              {tSet("aiFeaturePrivacyDesc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
