"use client";

import * as React from "react";
import {
  Gift,
  Coffee,
  Wifi,
  Download,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  Award,
  FileText,
  ShieldCheck,
  QrCode,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface EventPerkItem {
  id: string;
  title: string;
  description: string;
  tierRequired?: string | null;
  iconName: string;
}

export interface TierPerksGatingProps {
  perks: EventPerkItem[];
  attendeeTierName: string;
  bookingId: string;
  locale?: string;
}

// Icon dictionary for perk types
const PERK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Coffee: Coffee,
  Wifi: Wifi,
  Gift: Gift,
  Download: Download,
  FileText: FileText,
  Award: Award,
  ShieldCheck: ShieldCheck,
  Sparkles: Sparkles,
};

export function TierPerksGating({
  perks,
  attendeeTierName,
  bookingId,
  locale = "en",
}: TierPerksGatingProps) {
  const [claimedPerkIds, setClaimedPerkIds] = React.useState<Set<string>>(new Set());
  const [activeVoucherId, setActiveVoucherId] = React.useState<string | null>(null);

  const isTierEligible = (tierRequired?: string | null): boolean => {
    if (!tierRequired) return true; // Available for all
    const req = tierRequired.toLowerCase().trim();
    const userTier = attendeeTierName.toLowerCase().trim();

    if (req === "vip" || req.includes("vip")) {
      return (
        userTier.includes("vip") ||
        userTier.includes("delegate") ||
        userTier.includes("executive") ||
        userTier.includes("exhibitor")
      );
    }
    return userTier.includes(req);
  };

  const handleClaim = (perkId: string) => {
    setClaimedPerkIds((prev) => new Set([...prev, perkId]));
    setActiveVoucherId(perkId);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Tier Treats & On-Site Digital Vouchers
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Exclusive perks unlocked by your <span className="font-semibold text-foreground">{attendeeTierName}</span>.
          </p>
        </div>

        <Badge variant="archetype" size="sm" className="self-start sm:self-center gap-1.5 font-semibold">
          <Sparkles className="h-3 w-3" />
          {attendeeTierName}
        </Badge>
      </div>

      {/* 2. Perks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {perks.map((perk) => {
          const unlocked = isTierEligible(perk.tierRequired);
          const isClaimed = claimedPerkIds.has(perk.id);
          const IconComponent = PERK_ICONS[perk.iconName] || Gift;
          const isShowingVoucher = activeVoucherId === perk.id;

          const voucherCode = `XPO-${bookingId.substring(3, 8).toUpperCase()}-${perk.id.substring(0, 4).toUpperCase()}`;

          return (
            <Card
              key={perk.id}
              className={cn(
                "relative flex flex-col border transition-all duration-200",
                unlocked
                  ? isClaimed
                    ? "bg-card border-emerald-500/40 shadow-sm"
                    : "bg-card border-border hover:border-primary/50 shadow-sm"
                  : "bg-muted/30 border-border/60 opacity-60"
              )}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center text-white shadow-xs",
                      unlocked
                        ? isClaimed
                          ? "bg-emerald-600"
                          : "bg-primary"
                        : "bg-slate-700 text-slate-400"
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>

                  <div>
                    {unlocked ? (
                      isClaimed ? (
                        <Badge variant="success" size="sm" className="gap-1">
                          <Check className="h-3 w-3" />
                          Claimed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" size="sm" className="gap-1 text-emerald-600 dark:text-emerald-400">
                          <Unlock className="h-3 w-3" />
                          Unlocked
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline" size="sm" className="gap-1 text-muted-foreground border-border">
                        <Lock className="h-3 w-3" />
                        Requires {perk.tierRequired || "VIP"}
                      </Badge>
                    )}
                  </div>
                </div>

                <CardTitle className="text-base font-bold mt-2 text-foreground">
                  {perk.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 pt-1 flex-1 flex flex-col justify-between space-y-4 text-xs">
                <p className="text-muted-foreground leading-relaxed">
                  {perk.description}
                </p>

                {/* Voucher Code Reveal Box */}
                {unlocked && (isClaimed || isShowingVoucher) && (
                  <div className="p-3 rounded-lg bg-muted/60 border border-border text-center space-y-1 animate-fade-in font-mono">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Digital Voucher Code
                    </span>
                    <p className="text-sm font-bold text-foreground tracking-wider">{voucherCode}</p>
                    <span className="text-[10px] text-emerald-500 flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Show to on-site staff for instant redemption
                    </span>
                  </div>
                )}

                <div className="pt-2 mt-auto">
                  {unlocked ? (
                    <Button
                      variant={isClaimed ? "outline" : "primary"}
                      size="sm"
                      onClick={() => handleClaim(perk.id)}
                      className="w-full text-xs font-semibold gap-1.5 h-8"
                    >
                      {isClaimed ? (
                        <>
                          <QrCode className="h-3.5 w-3.5" />
                          View Voucher Barcode
                        </>
                      ) : (
                        <>
                          <Gift className="h-3.5 w-3.5" />
                          Redeem Treat Voucher
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="text-center py-1 text-[11px] text-muted-foreground font-medium">
                      Locked for Standard Passes
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
