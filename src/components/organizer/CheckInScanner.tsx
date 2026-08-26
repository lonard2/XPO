"use client";

import * as React from "react";
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  Search,
  Sparkles,
  Volume2,
  VolumeX,
  ShieldCheck,
  Building2,
  Ticket,
  UserCheck,
  Coffee,
  Download,
  Clock,
  Zap,
  RefreshCw,
  VideoOff,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useTranslations } from "next-intl";
import { generateTicketHash } from "@/lib/tickets/qrPass";
import { cn } from "@/lib/utils";

export interface ScanResult {
  valid: boolean;
  alreadyCheckedIn?: boolean;
  status: "CHECKED_IN" | "DOUBLE_SCAN" | "INVALID" | "CANCELLED";
  message: string;
  checkedInAt?: string | null;
  attendee?: {
    name: string;
    email: string;
  };
  ticketTier?: {
    id: string;
    name: string;
  };
  event?: {
    id: string;
    title: string;
    venue?: string;
    hall?: string;
  };
  perks?: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  rawHash?: string;
  timestamp: string;
}

interface CheckInScannerProps {
  defaultEventId?: string;
}

const SCAN_STATUS_MAP: Record<
  ScanResult["status"],
  {
    label: string;
    variant: "success" | "warning" | "destructive";
    badgeText: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  CHECKED_IN: {
    label: "Gate Entry Granted",
    variant: "success",
    badgeText: "Admitted",
    icon: CheckCircle2,
  },
  DOUBLE_SCAN: {
    label: "Double Scan Warning",
    variant: "warning",
    badgeText: "Already Scanned",
    icon: AlertTriangle,
  },
  INVALID: {
    label: "Pass Rejected / Invalid",
    variant: "destructive",
    badgeText: "Invalid Pass",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Ticket Cancelled / Void",
    variant: "destructive",
    badgeText: "Cancelled",
    icon: XCircle,
  },
};

export function CheckInScanner({ defaultEventId }: CheckInScannerProps) {
  const tOrg = useTranslations("organizer");
  const tTickets = useTranslations("tickets");

  const [inputMode, setInputMode] = React.useState<"camera" | "manual">("camera");
  const [manualHash, setManualHash] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [lastResult, setLastResult] = React.useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = React.useState<ScanResult[]>([]);

  // Camera Hardware State & Stream Ref
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // In-flight verification mutex
  const isVerifyingRef = React.useRef(false);

  // Start Camera Stream
  const startCamera = React.useCallback(async () => {
    setCameraError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera capture API is not supported on this device.");
      return;
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      setCameraActive(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera access denied. Please grant camera permission or use manual code entry.");
      } else {
        setCameraError("Unable to initialize optical sensor on this device.");
      }
    }
  }, []);

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  React.useEffect(() => {
    if (inputMode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [inputMode, startCamera, stopCamera]);

  // Audio chime synthesis using Web Audio API
  const playSound = React.useCallback(
    (type: "success" | "warning" | "error") => {
      if (!soundEnabled || typeof window === "undefined") return;
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === "success") {
          osc.type = "sine";
          osc.frequency.setValueAtTime(587.33, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
        } else if (type === "warning") {
          osc.type = "triangle";
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(330, now + 0.12);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
        } else {
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(180, now);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
        }
      } catch {
        // Ignore audio playback errors
      }
    },
    [soundEnabled]
  );

  const verifyPassData = async (payload: {
    qrCodeHash?: string;
    payloadString?: string;
    signature?: string;
  }) => {
    if (isVerifyingRef.current) return;
    isVerifyingRef.current = true;
    setIsVerifying(true);

    try {
      const res = await fetch("/api/tickets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          autoCheckIn: true,
        }),
      });

      const data = await res.json();
      const nowIso = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

      if (res.ok && data.valid) {
        if (data.alreadyCheckedIn) {
          const result: ScanResult = {
            valid: true,
            alreadyCheckedIn: true,
            status: "DOUBLE_SCAN",
            message: data.message || "Pass has already been validated and admitted previously.",
            checkedInAt: data.checkedInAt,
            attendee: data.attendee,
            ticketTier: data.ticketTier,
            event: data.event,
            perks: data.perks,
            rawHash: payload.qrCodeHash || "HMAC-SIGNED-PASS",
            timestamp: nowIso,
          };
          setLastResult(result);
          setScanHistory((prev) => [result, ...prev.slice(0, 19)]);
          playSound("warning");
        } else {
          const result: ScanResult = {
            valid: true,
            alreadyCheckedIn: false,
            status: "CHECKED_IN",
            message: data.message || "Pass verified successfully. Delegate admission granted.",
            checkedInAt: data.checkedInAt || new Date().toISOString(),
            attendee: data.attendee,
            ticketTier: data.ticketTier,
            event: data.event,
            perks: data.perks,
            rawHash: payload.qrCodeHash || "HMAC-SIGNED-PASS",
            timestamp: nowIso,
          };
          setLastResult(result);
          setScanHistory((prev) => [result, ...prev.slice(0, 19)]);
          playSound("success");
        }
      } else {
        const result: ScanResult = {
          valid: false,
          status: "INVALID",
          message: data.error || "Cryptographic HMAC signature mismatch. Pass is invalid or forged.",
          rawHash: payload.qrCodeHash || "INVALID-HASH",
          timestamp: nowIso,
        };
        setLastResult(result);
        setScanHistory((prev) => [result, ...prev.slice(0, 19)]);
        playSound("error");
      }
    } catch (err) {
      const nowIso = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const result: ScanResult = {
        valid: false,
        status: "INVALID",
        message: (err as Error).message || "Verification network request timed out or failed.",
        rawHash: payload.qrCodeHash || "ERROR",
        timestamp: nowIso,
      };
      setLastResult(result);
      setScanHistory((prev) => [result, ...prev.slice(0, 19)]);
      playSound("error");
    } finally {
      isVerifyingRef.current = false;
      setIsVerifying(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualHash.trim()) return;
    verifyPassData({ qrCodeHash: manualHash.trim() });
    setManualHash("");
  };

  const simulateValidStandardPass = () => {
    const payload = {
      bookingId: `BK-TEST-${Date.now().toString().slice(-4)}`,
      eventId: defaultEventId || "ev-1",
      tierId: "tier-std",
      attendeeEmail: "alex@xpo.com",
      issuedAt: Date.now(),
      nonce: "valid-nonce-01",
    };
    const signed = generateTicketHash(payload);
    verifyPassData({
      payloadString: signed.payloadString,
      signature: signed.signature,
      qrCodeHash: signed.qrCodeHash,
    });
  };

  const simulateValidVipPass = () => {
    const payload = {
      bookingId: `BK-VIP-${Date.now().toString().slice(-4)}`,
      eventId: defaultEventId || "ev-1",
      tierId: "tier-vip",
      attendeeEmail: "sari.dewi@nusantara.co.id",
      issuedAt: Date.now(),
      nonce: "vip-nonce-02",
    };
    const signed = generateTicketHash(payload);
    verifyPassData({
      payloadString: signed.payloadString,
      signature: signed.signature,
      qrCodeHash: signed.qrCodeHash,
    });
  };

  const simulateDoubleScan = () => {
    if (lastResult?.rawHash) {
      verifyPassData({ qrCodeHash: lastResult.rawHash });
    } else {
      simulateValidStandardPass();
      setTimeout(() => {
        simulateValidStandardPass();
      }, 500);
    }
  };

  const simulateTamperedSignature = () => {
    const payload = {
      bookingId: "BK-TAMPERED-FRAUD",
      eventId: "ev-1",
      tierId: "tier-vip",
      attendeeEmail: "fraudster@fake.com",
      issuedAt: Date.now(),
      nonce: "tampered-nonce",
    };
    const signed = generateTicketHash(payload);
    verifyPassData({
      payloadString: signed.payloadString,
      signature: "0000000000000000000000000000000000000000000000000000000000000000",
      qrCodeHash: signed.qrCodeHash,
    });
  };

  const validScansCount = scanHistory.filter((s) => s.valid && !s.alreadyCheckedIn).length;
  const doubleScansCount = scanHistory.filter((s) => s.alreadyCheckedIn).length;
  const invalidScansCount = scanHistory.filter((s) => !s.valid).length;

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* SCANNER STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card text-center shadow-xs">
          <div className="text-xs uppercase font-semibold text-muted-foreground">{tOrg("scannerScansProcessed") || "Scans Processed"}</div>
          <div className="text-xl font-bold text-foreground mt-0.5">{scanHistory.length}</div>
        </Card>
        <Card className="p-3.5 border-border bg-card text-center shadow-xs">
          <div className="text-xs uppercase font-semibold text-muted-foreground">{tOrg("scannerEntriesGranted") || "Entries Granted"}</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{validScansCount}</div>
        </Card>
        <Card className="p-3.5 border-border bg-card text-center shadow-xs">
          <div className="text-xs uppercase font-semibold text-muted-foreground">{tOrg("scannerDoubleBlocked") || "Double Scans Blocked"}</div>
          <div className="text-xl font-bold text-amber-500 mt-0.5">{doubleScansCount}</div>
        </Card>
        <Card className="p-3.5 border-border bg-card text-center shadow-xs">
          <div className="text-xs uppercase font-semibold text-muted-foreground">{tOrg("scannerFraudBlocked") || "Invalid / Fraud Blocked"}</div>
          <div className="text-xl font-bold text-rose-500 mt-0.5">{invalidScansCount}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SCANNER VIEWER & CONTROLS (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 border-border bg-card space-y-4 shadow-sm">
            {/* Mode Switcher & Audio Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/60 gap-1">
                <button
                  type="button"
                  aria-pressed={inputMode === "camera"}
                  onClick={() => setInputMode("camera")}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                    inputMode === "camera"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>{tOrg("cameraMode") || "Camera Stream"}</span>
                </button>

                <button
                  type="button"
                  aria-pressed={inputMode === "manual"}
                  onClick={() => setInputMode("manual")}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                    inputMode === "manual"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>{tOrg("manualMode") || "Manual Hash Input"}</span>
                </button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-xs gap-1.5 cursor-pointer"
                onClick={() => setSoundEnabled(!soundEnabled)}
                aria-label="Toggle audio feedback"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="h-4 w-4 text-emerald-500" />
                    <span className="hidden sm:inline">Audio On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                    <span className="hidden sm:inline">Audio Off</span>
                  </>
                )}
              </Button>
            </div>

            {/* CAMERA STREAM VIEWER & RETICLE HUD */}
            {inputMode === "camera" && (
              <div className="space-y-3">
                <div className="relative aspect-video sm:aspect-[16/10] bg-slate-950 rounded-xl border-2 border-slate-800 overflow-hidden flex flex-col items-center justify-center p-6 text-white shadow-inner">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className={cn(
                      "absolute inset-0 w-full h-full object-cover",
                      !cameraActive && "hidden"
                    )}
                  />

                  {cameraError && (
                    <div className="relative z-20 max-w-sm text-center p-4 bg-slate-900/90 backdrop-blur-md rounded-xl border border-rose-500/40 space-y-2.5">
                      <VideoOff className="h-8 w-8 text-rose-400 mx-auto" />
                      <p className="text-xs text-rose-200 leading-relaxed font-medium">
                        {cameraError}
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={startCamera}
                          className="h-8 text-xs border-white/20 text-white hover:bg-white/10 gap-1.5"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Retry Sensor</span>
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setInputMode("manual")}
                          className="h-8 text-xs"
                        >
                          Type Code by Keyboard
                        </Button>
                      </div>
                    </div>
                  )}

                  {!cameraError && (
                    <>
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none"
                      />

                      <div
                        aria-hidden="true"
                        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-[pulse_2s_infinite] pointer-events-none"
                      />

                      <div
                        aria-hidden="true"
                        className="relative z-10 w-56 h-56 sm:w-64 sm:h-64 border-2 border-dashed border-primary/60 rounded-2xl flex flex-col items-center justify-center p-4 bg-slate-900/30 backdrop-blur-[1px] pointer-events-none"
                      >
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary" />

                        <QrCode className="h-16 w-16 text-primary/80 animate-pulse" />
                        <span className="text-xs font-mono text-slate-300 mt-2 text-center">
                          {tOrg("scannerAlignTarget") || "Align Delegate QR Pass in Target"}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                          <span>{cameraActive ? "Optical Feed Active" : "Optical Sensor Ready"}</span>
                        </div>
                        <span>{tOrg("scannerHmacGuard") || "HMAC-SHA256 Guard"}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* MANUAL HASH INPUT MODE */}
            {inputMode === "manual" && (
              <form onSubmit={handleManualSubmit} className="space-y-3 pt-2">
                <Input
                  id="scanner-manual-input"
                  label={tOrg("scannerManualLabel") || "Pass Hash or Booking Code"}
                  placeholder={tOrg("scannerManualPlaceholder") || "e.g. XPO-PASS-BK1234-A8F4E290..."}
                  value={manualHash}
                  onChange={(e) => setManualHash(e.target.value)}
                  helperText={tOrg("scannerManualHelper") || "Paste canonical QR code hash or signed payload string."}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full gap-2 text-xs cursor-pointer"
                  disabled={isVerifying || !manualHash.trim()}
                >
                  <Search className="h-4 w-4" />
                  <span>{isVerifying ? (tOrg("scannerVerifyingBtn") || "Verifying...") : (tOrg("scannerValidateBtn") || "Validate & Check-In Pass")}</span>
                </Button>
              </form>
            )}

            {/* QUICK TEST SIMULATOR SANDBOX */}
            <div className="pt-3 border-t border-border space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                {tOrg("scannerQuickTest") || "Quick Test Scenarios (Staff Sandbox):"}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={simulateValidStandardPass}
                  disabled={isVerifying}
                  className="text-xs h-8 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                >
                  {tOrg("scannerValidPass") || "Valid Pass"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={simulateValidVipPass}
                  disabled={isVerifying}
                  className="text-xs h-8 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                >
                  {tOrg("scannerVipPass") || "VIP Delegate"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={simulateDoubleScan}
                  disabled={isVerifying}
                  className="text-xs h-8 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                >
                  {tOrg("scannerDoubleScan") || "Double Scan"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={simulateTamperedSignature}
                  disabled={isVerifying}
                  className="text-xs h-8 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                >
                  {tOrg("scannerFraudTamper") || "Fraud / Tamper"}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: REAL-TIME VERIFICATION FEEDBACK (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Result Card */}
          {lastResult ? (
            <Card
              className={cn(
                "p-5 border-2 transition-all shadow-md animate-fade-in space-y-4",
                lastResult.status === "CHECKED_IN"
                  ? "border-emerald-500 bg-emerald-500/5"
                  : lastResult.status === "DOUBLE_SCAN"
                  ? "border-amber-500 bg-amber-500/5"
                  : "border-rose-500 bg-rose-500/5"
              )}
            >
              {/* Header Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {lastResult.status === "CHECKED_IN" && (
                    <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  )}
                  {lastResult.status === "DOUBLE_SCAN" && (
                    <div className="h-10 w-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                  )}
                  {(lastResult.status === "INVALID" || lastResult.status === "CANCELLED") && (
                    <div className="h-10 w-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm">
                      <XCircle className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {SCAN_STATUS_MAP[lastResult.status]?.label || lastResult.status}
                    </h3>
                    <p className="text-xs text-muted-foreground">{lastResult.message}</p>
                  </div>
                </div>

                <Badge
                  variant={SCAN_STATUS_MAP[lastResult.status]?.variant || "outline"}
                  size="sm"
                  className="font-semibold text-xs px-2.5 py-0.5"
                >
                  {SCAN_STATUS_MAP[lastResult.status]?.badgeText || lastResult.status}
                </Badge>
              </div>

              {/* Attendee Details Card */}
              {lastResult.attendee && (
                <div className="p-3 bg-card rounded-xl border border-border/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{tOrg("scannerAttendee") || "Attendee:"}</span>
                    <span className="font-bold text-foreground">{lastResult.attendee.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{tOrg("scannerEmail") || "Email:"}</span>
                    <span className="font-mono text-foreground">{lastResult.attendee.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{tOrg("scannerTicketTier") || "Ticket Tier:"}</span>
                    <span className="font-semibold text-primary">{lastResult.ticketTier?.name}</span>
                  </div>
                  {lastResult.checkedInAt && (
                    <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs">
                      <span className="text-muted-foreground">{tOrg("scannerCheckInTime") || "Check-in Timestamp:"}</span>
                      <span className="font-mono text-foreground">
                        {new Date(lastResult.checkedInAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Eligible Unlocked Perks */}
              {lastResult.perks && lastResult.perks.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    {tOrg("scannerPerksUnlocked") || "Perks & Treats Unlocked:"}
                  </span>
                  <div className="space-y-1">
                    {lastResult.perks.map((p) => (
                      <div
                        key={p.id || p.title}
                        className="p-2 bg-card rounded-lg border border-border flex items-center gap-2 text-xs"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="font-medium text-foreground">{p.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-8 border-border bg-card text-center space-y-3 shadow-xs">
              <QrCode className="h-10 w-10 text-muted-foreground mx-auto animate-pulse" />
              <h3 className="text-sm font-bold text-foreground">{tOrg("scannerReadyTitle") || "Ready to Scan Passes"}</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {tOrg("scannerReadyDesc") || "Align attendee ticket QR codes within the camera target or type codes in manual mode."}
              </p>
            </Card>
          )}

          {/* RECENT SCAN LOG STREAM */}
          <Card className="p-4 border-border bg-card space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>{tOrg("scannerRecentLogs") || "Recent Scan Audit Stream"}</span>
              </h4>
              <span className="text-xs text-muted-foreground font-mono">
                {scanHistory.length} logs
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {scanHistory.map((scan, idx) => (
                <div
                  key={`${scan.timestamp}-${scan.rawHash || idx}-${idx}`}
                  className="p-2.5 bg-muted/40 rounded-lg border border-border/60 text-xs flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate">
                      {scan.attendee?.name || scan.rawHash?.slice(0, 16) || "Scan Record"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {scan.timestamp} • {scan.ticketTier?.name || "General Pass"}
                    </div>
                  </div>
                  <Badge
                    variant={SCAN_STATUS_MAP[scan.status]?.variant || "outline"}
                    size="sm"
                    className="text-xs font-semibold px-2 py-0.5 shrink-0"
                  >
                    {SCAN_STATUS_MAP[scan.status]?.badgeText || scan.status}
                  </Badge>
                </div>
              ))}

              {scanHistory.length === 0 && (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  {tOrg("scannerNoLogs") || "No scan events recorded in this session."}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
