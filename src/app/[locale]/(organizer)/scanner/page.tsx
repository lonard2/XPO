"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CheckInScanner } from "@/components/organizer/CheckInScanner";
import { useTranslations } from "next-intl";

function DoorScannerContent() {
  const searchParams = useSearchParams();
  const queryEventId = searchParams?.get("eventId") || undefined;

  return <CheckInScanner defaultEventId={queryEventId} />;
}

export default function DoorScannerPage() {
  const tOrg = useTranslations("organizer");

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {tOrg("scannerTitle") || "Door Staff QR Check-In Console"}
            </h1>
            <Badge variant="success" size="sm">{tOrg("scannerReadyBadge") || "Gate Scanner Ready"}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {tOrg("scannerSubtitle") || "Scan attendee ticket QR codes for turnstile admission, double-scan alerts, and instant perk verification."}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card p-2 px-3 rounded-lg border border-border shadow-xs">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>{tOrg("scannerTamperGuard") || "Tamper-Proof Pass Verification Active"}</span>
        </div>
      </div>

      {/* Main Scanner Controller wrapped in Suspense for Next.js App Router static prerendering */}
      <React.Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Initializing Gate Scanner...</div>}>
        <DoorScannerContent />
      </React.Suspense>
    </div>
  );
}
