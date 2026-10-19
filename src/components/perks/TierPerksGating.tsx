'use client';

import * as React from 'react';
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
  RotateCcw,
  Check,
  MapPin,
  Compass,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export interface EventPerkItem {
  id: string;
  title: string;
  description: string;
  tierRequired?: string | null;
  iconName: string;
  location?: string;
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

// Default fallback redemption counters for standard MICE perks
// Neutral fallback counters: never invent venue-specific locations.
const DEFAULT_LOCATIONS: Record<string, string> = {
  Coffee: 'Location TBC (see event map)',
  Wifi: 'Location TBC (see event map)',
  Gift: 'Location TBC (see event map)',
  Download: 'Location TBC (see event map)',
  FileText: 'Location TBC (see event map)',
  Award: 'Location TBC (see event map)',
  ShieldCheck: 'Location TBC (see event map)',
  Sparkles: 'Location TBC (see event map)',
};

export function TierPerksGating({
  perks,
  attendeeTierName,
  bookingId,
  locale = 'en',
}: TierPerksGatingProps) {
  const tPerks = useTranslations('perks');
  const tCommon = useTranslations('common');

  const [claimed, setClaimed] = React.useState<Record<string, { code: string }>>({});
  const [activeVoucherId, setActiveVoucherId] = React.useState<string | null>(null);
  const [claimBusy, setClaimBusy] = React.useState(false);
  const [claimError, setClaimError] = React.useState<string | null>(null);
  // A claim/undo mutation is newer than any in-flight mount hydration:
  // hydration must never clobber it, whichever response lands last.
  const mutatedRef = React.useRef(false);

  // Server is the source of truth for claims; hydrate on mount.
  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/perks/claim?bookingId=${encodeURIComponent(bookingId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || mutatedRef.current || !data.success) return;
        const map: Record<string, { code: string }> = {};
        for (const c of data.claims || []) map[c.perkId] = { code: c.code };
        setClaimed(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const isTierEligible = (tierRequired?: string | null): boolean => {
    if (!tierRequired) return true; // Available for all
    const req = tierRequired.toLowerCase().trim();
    const userTier = attendeeTierName.toLowerCase().trim();

    if (req === 'vip' || req.includes('vip')) {
      return (
        userTier.includes('vip') ||
        userTier.includes('delegate') ||
        userTier.includes('executive') ||
        userTier.includes('exhibitor')
      );
    }
    return userTier.includes(req);
  };

  const handleClaim = async (perkId: string) => {
    setClaimBusy(true);
    setClaimError(null);
    try {
      const res = await fetch("/api/perks/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, perkId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Claim failed.");
      mutatedRef.current = true;
      setClaimed((prev) => ({ ...prev, [perkId]: { code: data.claim.code } }));
      setActiveVoucherId(perkId);
    } catch (err) {
      setClaimError((err as Error).message);
    } finally {
      setClaimBusy(false);
    }
  };

  const handleUndoClaim = async (perkId: string) => {
    setClaimBusy(true);
    setClaimError(null);
    try {
      const res = await fetch("/api/perks/claim", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, perkId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Release failed.");
      mutatedRef.current = true;
      setClaimed((prev) => {
        const next = { ...prev };
        delete next[perkId];
        return next;
      });
      setActiveVoucherId((cur) => (cur === perkId ? null : cur));
    } catch (err) {
      setClaimError((err as Error).message);
    } finally {
      setClaimBusy(false);
    }
  };

  const scrollToMap = () => {
    const el = document.getElementById('hall-map-section');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <span>{tPerks('tierTreatsTitle') || 'Tier Treats & On-Site Digital Vouchers'}</span>
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {tPerks('tierTreatsSubtitle') || 'Exclusive perks unlocked by your'}{' '}
            <span className="font-semibold text-foreground">{attendeeTierName}</span>.
          </p>
        </div>

        <Badge variant="archetype" size="sm" className="self-start sm:self-center gap-1.5 font-semibold">
          <Sparkles className="h-3 w-3" />
          <span>{attendeeTierName}</span>
        </Badge>
      </div>

      {/* 2. Perks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {claimError && (
          <p role="alert" className="md:col-span-2 lg:col-span-3 text-xs font-medium text-destructive rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2">
            {claimError}
          </p>
        )}
        {perks.map((perk) => {
          const unlocked = isTierEligible(perk.tierRequired);
          const claim = claimed[perk.id];
          const isClaimed = Boolean(claim);
          const IconComponent = PERK_ICONS[perk.iconName] || Gift;
          const isShowingVoucher = activeVoucherId === perk.id;
          const redemptionLocation = perk.location || DEFAULT_LOCATIONS[perk.iconName] || 'Location TBC (see event map)';

          const voucherCode = claim?.code || "";

          return (
            <Card
              key={perk.id}
              className={cn(
                'relative flex flex-col border transition-all duration-200 rounded-2xl',
                unlocked
                  ? isClaimed
                    ? 'bg-card border-emerald-500/40 shadow-xs'
                    : 'bg-card border-border/80 hover:border-primary/50 shadow-xs'
                  : 'bg-muted/30 border-border/60 opacity-60'
              )}
            >
              <CardHeader className="p-5 pb-2">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      'h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-xs',
                      unlocked
                        ? isClaimed
                          ? 'bg-emerald-600'
                          : 'bg-primary'
                        : 'bg-slate-700 text-slate-400'
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>

                  <div>
                    {unlocked ? (
                      isClaimed ? (
                        <Badge variant="success" size="sm" className="gap-1 font-semibold">
                          <Check className="h-3 w-3" />
                          <span>{tPerks('claimedBadge') || 'Claimed'}</span>
                        </Badge>
                      ) : (
                        <Badge variant="secondary" size="sm" className="gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <Unlock className="h-3 w-3" />
                          <span>{tPerks('unlockedBadge') || 'Unlocked'}</span>
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline" size="sm" className="gap-1 text-muted-foreground border-border">
                        <Lock className="h-3 w-3" />
                        <span>{tPerks('tierRequired') || 'Requires'} {perk.tierRequired || 'VIP'}</span>
                      </Badge>
                    )}
                  </div>
                </div>

                <CardTitle className="text-base font-bold mt-2 text-foreground">
                  {perk.title}
                </CardTitle>

                {/* Physical Location Badge */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium pt-0.5">
                  <MapPin className="h-3 w-3 text-primary shrink-0" />
                  <span className="truncate">{redemptionLocation}</span>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-2 flex-1 flex flex-col justify-between space-y-4 text-xs">
                <p className="text-muted-foreground leading-relaxed">
                  {perk.description}
                </p>

                {unlocked ? (
                  isShowingVoucher ? (
                    <div
                      className="p-3.5 bg-muted/60 rounded-xl border border-border/80 space-y-2 animate-fade-in"
                      aria-live="polite"
                    >
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold">{tPerks('voucherCode') || 'Voucher Code'}</span>
                        <Badge variant="outline" className="font-mono text-xs font-bold text-foreground">
                          {voucherCode}
                        </Badge>
                      </div>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        {tPerks("presentCounter") || <span>Present to on-site staff at counter</span>}
                      </p>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={scrollToMap}
                        className="w-full min-h-[44px] sm:min-h-[36px] text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Compass className="h-3 w-3" />
                        {tPerks("locateMap") || <span>Locate Redemption Hub on Map</span>}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={claimBusy}
                        onClick={() => handleUndoClaim(perk.id)}
                        className="w-full min-h-[44px] sm:min-h-[36px] text-xs font-semibold gap-1 text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>{tPerks("undoClaim") || "Release voucher"}</span>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant={isClaimed ? 'outline' : 'default'}
                      disabled={claimBusy}
                      onClick={() => handleClaim(perk.id)}
                      className="w-full min-h-[44px] sm:min-h-[36px] text-xs font-semibold cursor-pointer"
                    >
                      <QrCode className="h-3.5 w-3.5 mr-1.5" />
                      <span>{isClaimed ? (tPerks('viewVoucher') || 'View Voucher Code') : (tPerks('claimPerk') || 'Claim Voucher')}</span>
                    </Button>
                  )
                ) : (
                  <Button size="sm" variant="ghost" disabled className="w-full min-h-[44px] sm:min-h-[36px] text-xs opacity-60">
                    <Lock className="h-3 w-3 mr-1.5" />
                    <span>{tPerks('lockedBadge') || 'Locked for your Pass Tier'}</span>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
