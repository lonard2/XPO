"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  QrCode,
  Building2,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CheckInScanner } from "@/components/organizer/CheckInScanner";
import { useTranslations } from "next-intl";

function DoorScannerContent() {
  const searchParams = useSearchParams();
  const queryEventId = searchParams?.get("eventId") || undefined;

  return <CheckInScanner defaultEventId={queryEventId} />;
}

export default function DoorScannerPage() {
  let tOrg: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tOrg = useTranslations("organizer");
  } catch {
    // Fallback
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              {tOrg("scannerDoorOps") || "Door Entry & Gate Operations"}
            </span>
            <Badge variant="success" size="sm">{tOrg("scannerReadyBadge") || "Gate Scanner Ready"}</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
            {tOrg("scannerTitle") || "Door Staff QR Check-In Console"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tOrg("scannerSubtitle") || "Validate attendee digital passes using HMAC-SHA256 signature verification, double-scan detection, and live perk unlocks."}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card p-2 px-3 rounded-lg border border-border">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>{tOrg("scannerTamperGuard") || "Cryptographic Pass Tamper Protection Active"}</span>
        </div>
      </div>

      {/* Main Scanner Controller wrapped in Suspense for Next.js App Router static prerendering */}
      <React.Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Initializing Gate Scanner...</div>}>
        <DoorScannerContent />
      </React.Suspense>
    </div>
  );
}
