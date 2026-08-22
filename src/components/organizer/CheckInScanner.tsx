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
  RotateCcw,
  ShieldCheck,
  Building2,
  Ticket,
  UserCheck,
  Coffee,
  Download,
  Clock,
  Zap,
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

export function CheckInScanner({ defaultEventId }: CheckInScannerProps) {
  let tOrg: any = (k: string) => k;
  let tTickets: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tOrg = useTranslations("organizer");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tTickets = useTranslations("tickets");
  } catch {
    // Fallback
  }

  const [inputMode, setInputMode] = React.useState<"camera" | "manual">("camera");
  const [manualHash, setManualHash] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [lastResult, setLastResult] = React.useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = React.useState<ScanResult[]>([]);

  // Simulated Camera Stream State
  const [isCameraActive, setIsCameraActive] = React.useState(true);

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
          // Pleasant high chord chime
          osc.type = "sine";
          osc.frequency.setValueAtTime(587.33, now); // D5
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
        } else if (type === "warning") {
          // Double buzz
          osc.type = "triangle";
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(330, now + 0.12);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
        } else {
          // Low error buzz
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(180, now);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
        }
      } catch {
        // Ignore audio playback errors on restricted autoplay
      }
    },
    [soundEnabled]
  );

  // Core verification call to /api/tickets/verify
  const verifyPassData = async (payload: {
    qrCodeHash?: string;
    payloadString?: string;
    signature?: string;
  }) => {
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
      const nowIso = new Date().toLocaleTimeString();

      if (res.ok && data.valid) {
        if (data.alreadyCheckedIn) {
          // Double scan
          const result: ScanResult = {
            valid: true,
            alreadyCheckedIn: true,
            status: "DOUBLE_SCAN",
            message: data.message || "DOUBLE_SCAN: Ticket has already been validated.",
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
          // First time entry success
          const result: ScanResult = {
            valid: true,
            alreadyCheckedIn: false,
            status: "CHECKED_IN",
            message: data.message || "DOOR_ENTRY_GRANTED: Pass validated successfully.",
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
        // Invalid or fraud
        const result: ScanResult = {
          valid: false,
          status: "INVALID",
          message: data.error || "INVALID_PASS: Signature verification failed.",
          rawHash: payload.qrCodeHash || "INVALID-HASH",
          timestamp: nowIso,
        };
        setLastResult(result);
        setScanHistory((prev) => [result, ...prev.slice(0, 19)]);
        playSound("error");
      }
    } catch (err) {
      const nowIso = new Date().toLocaleTimeString();
      const result: ScanResult = {
        valid: false,
        status: "INVALID",
        message: (err as Error).message || "NETWORK_ERROR: Verification failed.",
        rawHash: payload.qrCodeHash || "ERROR",
        timestamp: nowIso,
      };
      setLastResult(result);
      setScanHistory((prev) => [result, ...prev.slice(0, 19)]);
      playSound("error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualHash.trim()) return;
    verifyPassData({ qrCodeHash: manualHash.trim() });
    setManualHash("");
  };

  // Pre-configured Test Simulation Injectors
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
      signature: "0000000000000000000000000000000000000000000000000000000000000000", // invalid signature
      qrCodeHash: signed.qrCodeHash,
    });
  };

  // Aggregated Scan Stats
  const validScansCount = scanHistory.filter((s) => s.valid && !s.alreadyCheckedIn).length;
  const doubleScansCount = scanHistory.filter((s) => s.alreadyCheckedIn).length;
  const invalidScansCount = scanHistory.filter((s) => !s.valid).length;

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* SCANNER STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 border-border bg-card text-center">
          <div className="text-[10px] uppercase font-semibold text-muted-foreground">Scans Processed</div>
          <div className="text-xl font-bold text-foreground mt-0.5">{scanHistory.length}</div>
        </Card>
        <Card className="p-3 border-border bg-card text-center">
          <div className="text-[10px] uppercase font-semibold text-muted-foreground">Entries Granted</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{validScansCount}</div>
        </Card>
        <Card className="p-3 border-border bg-card text-center">
          <div className="text-[10px] uppercase font-semibold text-muted-foreground">Double Scans Blocked</div>
          <div className="text-xl font-bold text-amber-500 mt-0.5">{doubleScansCount}</div>
        </Card>
        <Card className="p-3 border-border bg-card text-center">
          <div className="text-[10px] uppercase font-semibold text-muted-foreground">Invalid / Fraud Blocked</div>
          <div className="text-xl font-bold text-rose-500 mt-0.5">{invalidScansCount}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SCANNER VIEWER & CONTROLS (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 border-border bg-card space-y-4">
            {/* Mode Switcher & Audio Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/60 gap-1">
                <button
                  type="button"
                  onClick={() => setInputMode("camera")}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
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
                  onClick={() => setInputMode("manual")}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
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
                className="h-8 px-2 text-xs gap-1.5"
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

            {/* CAMERA STREAM SIMULATOR HUD */}
            {inputMode === "camera" && (
              <div className="relative aspect-video sm:aspect-[16/10] bg-slate-950 rounded-xl border-2 border-slate-800 overflow-hidden flex flex-col items-center justify-center p-6 text-white shadow-inner">
                {/* Background Grid & Matrix Simulation */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

                {/* Animated Laser Scanning Line */}
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-[pulse_2s_infinite]" />

                {/* Reticle Target Frame */}
                <div className="relative z-10 w-56 h-56 sm:w-64 sm:h-64 border-2 border-dashed border-primary/60 rounded-2xl flex flex-col items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]">
                  {/* Corner Reticle Markers */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary" />

                  <QrCode className="h-16 w-16 text-primary/80 animate-pulse" />
                  <span className="text-[11px] font-mono text-slate-300 mt-2 text-center">
                    Align Delegate QR Pass in Target
                  </span>
                </div>

                {/* Live Scanner Telemetry Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Optical Engine Active • 60 FPS</span>
                  </div>
                  <span>HMAC-SHA256 Guard</span>
                </div>
              </div>
            )}

            {/* MANUAL HASH INPUT MODE */}
            {inputMode === "manual" && (
              <form onSubmit={handleManualSubmit} className="space-y-3 pt-2">
                <Input
                  label="Pass Hash or Booking Code"
                  placeholder="e.g. XPO-PASS-BK1234-A8F4E290..."
                  value={manualHash}
                  onChange={(e) => setManualHash(e.target.value)}
                  helperText="Paste canonical QR code hash or signed payload string."
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full gap-2 text-xs"
                  disabled={isVerifying || !manualHash.trim()}
                >
                  <Search className="h-4 w-4" />
                  <span>{isVerifying ? "Verifying..." : "Validate & Check-In Pass"}</span>
                </Button>
              </form>
            )}

            {/* QUICK TEST SIMULATOR BUTTONS */}
            <div className="pt-3 border-t border-border space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Quick Test Scenarios (Instant Simulation):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={simulateValidStandardPass}
                  disabled={isVerifying}
                  className="text-[11px] h-8 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                >
                  Valid Pass
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={simulateValidVipPass}
                  disabled={isVerifying}
                  className="text-[11px] h-8 border-primary/30 text-primary hover:bg-primary/10"
                >
                  VIP Delegate
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={simulateDoubleScan}
                  disabled={isVerifying}
                  className="text-[11px] h-8 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                >
                  Double Scan
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={simulateTamperedSignature}
                  disabled={isVerifying}
                  className="text-[11px] h-8 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                >
                  Fraud / Tamper
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
                  {lastResult.status === "INVALID" && (
                    <div className="h-10 w-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm">
                      <XCircle className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {lastResult.status === "CHECKED_IN"
                        ? "Gate Entry Granted"
                        : lastResult.status === "DOUBLE_SCAN"
                        ? "Double Scan Warning"
                        : "Pass Rejected / Invalid"}
                    </h3>
                    <p className="text-xs text-muted-foreground">{lastResult.message}</p>
                  </div>
                </div>

                <Badge
                  variant={
                    lastResult.status === "CHECKED_IN"
                      ? "success"
                      : lastResult.status === "DOUBLE_SCAN"
                      ? "warning"
                      : "destructive"
                  }
                  size="sm"
                >
                  {lastResult.status}
                </Badge>
              </div>

              {/* Attendee Details Card */}
              {lastResult.attendee && (
                <div className="p-3 bg-card rounded-xl border border-border/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Attendee:</span>
                    <span className="font-bold text-foreground">{lastResult.attendee.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-mono text-foreground">{lastResult.attendee.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ticket Tier:</span>
                    <span className="font-semibold text-primary">{lastResult.ticketTier?.name}</span>
                  </div>
                  {lastResult.checkedInAt && (
                    <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[11px]">
                      <span className="text-muted-foreground">Check-in Timestamp:</span>
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
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Perks & Treats Unlocked:
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
            <Card className="p-8 border-border bg-card text-center space-y-3">
              <QrCode className="h-10 w-10 text-muted-foreground mx-auto animate-pulse" />
              <h3 className="text-sm font-bold text-foreground">Ready to Scan Passes</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Scan attendee tickets using the camera stream simulator or click quick test scenarios.
              </p>
            </Card>
          )}

          {/* RECENT SCAN LOG STREAM */}
          <Card className="p-4 border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>Recent Scan Audit Stream</span>
              </h4>
              <span className="text-[10px] text-muted-foreground font-mono">
                {scanHistory.length} logs
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {scanHistory.map((scan, idx) => (
                <div
                  key={`${scan.timestamp}-${idx}`}
                  className="p-2.5 bg-muted/40 rounded-lg border border-border/60 text-xs flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate">
                      {scan.attendee?.name || scan.rawHash?.slice(0, 16) || "Scan Record"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {scan.timestamp} • {scan.ticketTier?.name || "General Pass"}
                    </div>
                  </div>
                  <Badge
                    variant={
                      scan.status === "CHECKED_IN"
                        ? "success"
                        : scan.status === "DOUBLE_SCAN"
                        ? "warning"
                        : "destructive"
                    }
                    size="sm"
                    className="text-[9px] px-1.5"
                  >
                    {scan.status}
                  </Badge>
                </div>
              ))}

              {scanHistory.length === 0 && (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  No scan events recorded in this session.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
