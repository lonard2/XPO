"use client";

import * as React from "react";
import { CheckCircle2, Ticket, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
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
    <div className={cn("space-y-3", compact ? "space-y-2" : "space-y-4")}>
      {tiers.map((tier) => {
        const isSelected = selectedTierId === tier.id;
        const remaining = Math.max(0, tier.capacity - tier.soldCount);
        const isSoldOut = remaining <= 0;

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
            role="button"
            tabIndex={isSoldOut ? -1 : 0}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !isSoldOut) {
                e.preventDefault();
                onSelectTier(tier.id);
              }
            }}
            className={cn(
              "relative rounded-xl border p-4 transition-all duration-200 cursor-pointer select-none",
              isSoldOut
                ? "opacity-50 cursor-not-allowed bg-muted/20 border-border/60"
                : isSelected
                ? "bg-primary/5 border-primary ring-2 ring-primary/20 shadow-md"
                : "bg-card hover:bg-muted/30 border-border hover:border-primary/50"
            )}
          >
            {/* Header / Badges */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm sm:text-base text-foreground">
                    {tier.name}
                  </span>
                  {isVip && (
                    <Badge variant="archetype" size="sm" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      Priority
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {isSoldOut ? (
                    <span className="text-destructive font-medium flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Sold Out
                    </span>
                  ) : (
                    <span>
                      {remaining} of {tier.capacity} passes available
                    </span>
                  )}
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
              <ul className="mt-3 pt-3 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-muted-foreground">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="truncate">{benefit}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Selection Check Indicator */}
            {isSelected && (
              <div className="absolute top-3 right-3 sm:hidden">
                <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
