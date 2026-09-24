"use client";

import * as React from "react";
import { CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

export interface TicketTierItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  capacity: number;
  soldCount: number;
  benefitsJson: string;
}

export interface TierSelectorProps {
  tiers: TicketTierItem[];
  selectedTierId: string | null;
  onSelectTier: (tierId: string) => void;
  locale?: string;
  compact?: boolean;
}

export function TierSelector({
  tiers,
  selectedTierId,
  onSelectTier,
  locale = "en",
  compact = false,
}: TierSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Ticket tier options"
      className={cn("space-y-3", compact ? "space-y-2" : "space-y-3.5")}
    >
      {tiers.map((tier) => {
        const isSelected = selectedTierId === tier.id;
        const remaining = Math.max(0, tier.capacity - tier.soldCount);
        const isSoldOut = remaining <= 0;
        const isLowCapacity = !isSoldOut && remaining <= 20;

        let benefits: string[] = [];
        try {
          benefits = JSON.parse(tier.benefitsJson);
        } catch {
          benefits = ["Exhibition hall access", "Official event credentials"];
        }

        const isVip =
          tier.name.toLowerCase().includes("vip") ||
          tier.name.toLowerCase().includes("executive") ||
          tier.name.toLowerCase().includes("delegate");

        return (
          <div
            key={tier.id}
            onClick={() => !isSoldOut && onSelectTier(tier.id)}
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSoldOut ? -1 : 0}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !isSoldOut) {
                e.preventDefault();
                onSelectTier(tier.id);
              }
            }}
            className={cn(
              "relative rounded-xl border p-4 transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]",
              isSoldOut
                ? "opacity-55 cursor-not-allowed bg-muted/20 border-border/60"
                : isSelected
                ? "bg-primary/5 border-primary ring-2 ring-primary/25 shadow-xs"
                : "bg-card hover:bg-muted/30 border-border/80 hover:border-primary/50"
            )}
          >
            {/* Header / Badges / Radio indicator */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {/* Radio Circle Indicator */}
                <div
                  className={cn(
                    "h-4 w-4 rounded-full border mt-1 flex items-center justify-center shrink-0 transition-colors",
                    isSoldOut
                      ? "border-muted-foreground/30 bg-muted/30"
                      : isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40 bg-card"
                  )}
                  aria-hidden="true"
                >
                  {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm sm:text-base text-foreground leading-snug">
                      {tier.name}
                    </span>
                    {isVip && (
                      <Badge variant="archetype" size="sm" className="gap-1 font-semibold">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        Priority
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {isSoldOut ? (
                      <span className="text-destructive font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Sold Out
                      </span>
                    ) : isLowCapacity ? (
                      <span className="text-amber-700 dark:text-amber-400 font-medium">
                        Only {remaining} passes remaining
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {remaining} of {tier.capacity} passes available
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="text-right shrink-0">
                <span className="text-base sm:text-lg font-bold text-foreground">
                  {tier.price > 0
                    ? formatCurrency(tier.price, (tier.currency as SupportedCurrency) || "IDR", locale)
                    : "Free"}
                </span>
              </div>
            </div>

            {/* Benefits List */}
            {!compact && benefits.length > 0 && (
              <ul className="mt-3 pt-3 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-muted-foreground pl-7">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="truncate">{benefit}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
