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
const DEFAULT_LOCATIONS: Record<string, string> = {
  Coffee: 'Main Concourse • Specialty Barista Hub',
  Wifi: 'All Exhibition Halls • High-Density SSID',
  Gift: 'Hall A1 • VIP Delegate Welcome Counter',
  Download: 'Digital Cloud • Instant PDF Download',
  FileText: 'Plenary Foyer • Proceedings Desk',
  Award: 'Executive Lounge • Concierge Suite',
  ShieldCheck: 'Gate Turnstile • Priority Fast-Track',
  Sparkles: 'East Wing • Networking Zone',
};

export function TierPerksGating({
  perks,
  attendeeTierName,
  bookingId,
  locale = 'en',
}: TierPerksGatingProps) {
  const tPerks = useTranslations('perks');
  const tCommon = useTranslations('common');

  const [claimedPerkIds, setClaimedPerkIds] = React.useState<Set<string>>(new Set());
  const [activeVoucherId, setActiveVoucherId] = React.useState<string | null>(null);

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

  const handleClaim = (perkId: string) => {
    setClaimedPerkIds((prev) => new Set([...prev, perkId]));
    setActiveVoucherId(perkId);
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
        {perks.map((perk) => {
          const unlocked = isTierEligible(perk.tierRequired);
          const isClaimed = claimedPerkIds.has(perk.id);
          const IconComponent = PERK_ICONS[perk.iconName] || Gift;
          const isShowingVoucher = activeVoucherId === perk.id;
          const redemptionLocation = perk.location || DEFAULT_LOCATIONS[perk.iconName] || 'Exhibition Hall Concourse';

          const voucherCode = `XPO-${bookingId.substring(3, 8).toUpperCase()}-${perk.id.substring(0, 4).toUpperCase()}`;

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
                          <span>{tPerks('unlockedBadge') || 'Claimed'}</span>
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
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium pt-0.5">
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
                    <div className="p-3.5 bg-muted/60 rounded-xl border border-border/80 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold">{tPerks('voucherCode') || 'Voucher Code'}</span>
                        <Badge variant="outline" className="font-mono text-xs font-bold text-foreground">
                          {voucherCode}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        <span>Present to on-site staff at counter</span>
                      </p>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={scrollToMap}
                        className="w-full h-7 text-[11px] font-semibold gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Compass className="h-3 w-3" />
                        <span>Locate Redemption Hub on Map</span>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant={isClaimed ? 'outline' : 'default'}
                      onClick={() => handleClaim(perk.id)}
                      className="w-full text-xs font-semibold cursor-pointer"
                    >
                      <QrCode className="h-3.5 w-3.5 mr-1.5" />
                      <span>{isClaimed ? 'View Voucher Code' : (tPerks('claimPerk') || 'Claim Voucher')}</span>
                    </Button>
                  )
                ) : (
                  <Button size="sm" variant="ghost" disabled className="w-full text-xs opacity-60">
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
