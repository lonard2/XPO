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
  Clock,
  RefreshCw,
  VideoOff,
  RotateCcw,
  WifiOff,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useTranslations } from "next-intl";
import { generateTicketHash } from "@/lib/tickets/qrPass";
import { cn } from "@/lib/utils";

export interface ScanResult {
  valid: boolean;
  alreadyCheckedIn?: boolean;
  status: "CHECKED_IN" | "DOUBLE_SCAN" | "INVALID" | "CANCELLED" | "NETWORK_ERROR";
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
  payloadToRetry?: {
    qrCodeHash?: string;
    payloadString?: string;
    signature?: string;
  };
  timestamp: string;
  errorCode?: "TICKET_NOT_FOUND" | "TICKET_CANCELLED" | "INVALID_SIGNATURE" | "NETWORK_TIMEOUT" | string;
  reEntryOverridden?: boolean;
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
    label: "Double Scan Alert: Already Admitted",
    variant: "warning",
    badgeText: "Already Scanned",
    icon: AlertTriangle,
  },
  INVALID: {
    label: "Pass Unverified: Invalid Ticket",
    variant: "destructive",
    badgeText: "Invalid Pass",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Ticket Voided / Cancelled",
    variant: "destructive",
    badgeText: "Cancelled",
    icon: XCircle,
  },
  NETWORK_ERROR: {
    label: "Connection Timeout / Network Offline",
    variant: "warning",
    badgeText: "Network Error",
    icon: WifiOff,
  },
};

export function CheckInScanner({ defaultEventId }: CheckInScannerProps) {
  const tOrg = useTranslations("organizer");

  const [inputMode, setInputMode] = React.useState<"camera" | "manual">("camera");
  const [manualHash, setManualHash] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [lastResult, setLastResult] = React.useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = React.useState<ScanResult[]>([]);
  const [showSimulator, setShowSimulator] = React.useState(true);

  // Camera Hardware State & Stream Ref
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const isMountedRef = React.useRef(true);
  const audioCtxRef = React.useRef<AudioContext | null>(null);

  // In-flight verification mutex & throttle ref
  const isVerifyingRef = React.useRef(false);
  const lastScannedHashRef = React.useRef<{ hash: string; time: number }>({ hash: "", time: 0 });

  // Start Camera Stream with unmount race-condition protection
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

      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setCameraActive(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError(
          "Camera access denied in browser settings. To enable: tap the lock or camera icon in your address bar, set Camera to Allow, and tap Retry Sensor."
        );
      } else {
        setCameraError("Unable to initialize optical camera sensor on this device. Please check hardware permissions or type code by keyboard.");
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
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
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

  // Audio chime synthesis using Web Audio API singleton
  const playSound = React.useCallback(
    (type: "success" | "warning" | "error") => {
      if (!soundEnabled || typeof window === "undefined") return;
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }

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

  const verifyPassData = React.useCallback(
    async (payload: {
      qrCodeHash?: string;
      payloadString?: string;
      signature?: string;
    }) => {
      if (isVerifyingRef.current) return;
      isVerifyingRef.current = true;
      setIsVerifying(true);

      const targetIdentifier = payload.qrCodeHash || payload.payloadString || "PASS";

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
            const prevTime = data.checkedInAt
              ? new Date(data.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "earlier today";
            const result: ScanResult = {
              valid: true,
              alreadyCheckedIn: true,
              status: "DOUBLE_SCAN",
              message: `Ticket was already admitted at ${prevTime}. Confirm attendee ID before authorizing re-entry.`,
              checkedInAt: data.checkedInAt,
              attendee: data.attendee,
              ticketTier: data.ticketTier,
              event: data.event,
              perks: data.perks,
              rawHash: targetIdentifier,
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
              message: "Pass verified successfully. Delegate admission granted.",
              checkedInAt: data.checkedInAt || new Date().toISOString(),
              attendee: data.attendee,
              ticketTier: data.ticketTier,
              event: data.event,
              perks: data.perks,
              rawHash: targetIdentifier,
              timestamp: nowIso,
            };
            setLastResult(result);
            setScanHistory((prev) => [result, ...prev.slice(0, 19)]);
            playSound("success");
          }
        } else {
          const rawErr = data.error || "";
          let status: ScanResult["status"] = "INVALID";
          let errorCode = "INVALID_SIGNATURE";
          let humanMessage = "Pass signature unverified. Ticket does not match event database.";

          if (
            data.status === "CANCELLED" ||
            rawErr.includes("TICKET_CANCELLED") ||
            rawErr.toLowerCase().includes("cancelled") ||
            rawErr.toLowerCase().includes("void")
          ) {
            status = "CANCELLED";
            errorCode = "TICKET_CANCELLED";
            humanMessage = "This ticket was cancelled or voided by the organizer and is not valid for entry.";
          } else if (rawErr.includes("TICKET_NOT_FOUND") || rawErr.toLowerCase().includes("does not match")) {
            errorCode = "TICKET_NOT_FOUND";
            humanMessage = "Pass code not found in event database. Verify booking reference or check attendee registration email.";
          } else if (rawErr.includes("INVALID_SIGNATURE") || rawErr.toLowerCase().includes("verification failed")) {
            errorCode = "INVALID_SIGNATURE";
            humanMessage = "Cryptographic signature unverified. Pass may belong to a different event, hall, or date.";
          } else if (rawErr) {
            humanMessage = rawErr.replace(/^[A-Z_]+:\s*/, "");
          }

          const result: ScanResult = {
            valid: false,
            status,
            errorCode,
            message: humanMessage,
            rawHash: targetIdentifier,
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
          status: "NETWORK_ERROR",
          errorCode: "NETWORK_TIMEOUT",
          message: "Connection timeout. Venue Wi-Fi or mobile data may be offline. Check connection and tap Retry Verification.",
          rawHash: targetIdentifier,
          payloadToRetry: payload,
          timestamp: nowIso,
        };
        setLastResult(result);
        setScanHistory((prev) => [result, ...prev.slice(0, 19)]);
        playSound("warning");
      } finally {
        isVerifyingRef.current = false;
        setIsVerifying(false);
      }
    },
    [playSound]
  );

  // Optical continuous QR barcode scanning loop (native BarcodeDetector)
  React.useEffect(() => {
    if (inputMode !== "camera" || !cameraActive || !videoRef.current) return;

    let animFrameId: number;
    let detector: any = null;

    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      try {
        detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
      } catch {
        detector = null;
      }
    }

    if (!detector) return;

    let lastCheckTime = 0;
    const processFrame = async () => {
      if (!videoRef.current || !isMountedRef.current) return;
      const now = Date.now();

      // Run detection at ~4 fps (every 250ms) to conserve mobile battery
      if (now - lastCheckTime > 250 && !isVerifyingRef.current && videoRef.current.readyState >= 2) {
        lastCheckTime = now;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes && codes.length > 0 && codes[0].rawValue) {
            const rawVal = codes[0].rawValue.trim();
            // Debounce identical scans within 3 seconds
            const isRecentDuplicate =
              lastScannedHashRef.current.hash === rawVal && now - lastScannedHashRef.current.time < 3000;

            if (rawVal && !isRecentDuplicate) {
              lastScannedHashRef.current = { hash: rawVal, time: now };
              if (rawVal.startsWith("{") && rawVal.includes("bookingId")) {
                try {
                  const parsed = JSON.parse(rawVal);
                  verifyPassData({ payloadString: rawVal, signature: parsed.signature });
                } catch {
                  verifyPassData({ qrCodeHash: rawVal });
                }
              } else {
                verifyPassData({ qrCodeHash: rawVal });
              }
            }
          }
        } catch {
          // Ignore optical frame processing errors
        }
      }

      if (isMountedRef.current) {
        animFrameId = requestAnimationFrame(processFrame);
      }
    };

    animFrameId = requestAnimationFrame(processFrame);
    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [inputMode, cameraActive, verifyPassData]);

  // Fast keyboard shortcut listener for rapid turnstile queue operations
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "Escape" || e.key === " ") {
        if (lastResult) {
          e.preventDefault();
          setLastResult(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lastResult]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualHash.trim()) return;
    verifyPassData({ qrCodeHash: manualHash.trim() });
    setManualHash("");
  };

  const handleOverrideReEntry = () => {
    if (!lastResult) return;
    const nowIso = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const updated: ScanResult = {
      ...lastResult,
      status: "CHECKED_IN",
      reEntryOverridden: true,
      message: "Supervisor override authorized. Delegate re-entry permitted.",
      timestamp: nowIso,
    };
    setLastResult(updated);
    setScanHistory((prev) => [updated, ...prev.slice(0, 19)]);
    playSound("success");
  };

  const handleSendResolutionDesk = () => {
    if (!lastResult) return;
    const nowIso = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const updated: ScanResult = {
      ...lastResult,
      message: "Attendee escorted to On-Site Resolution Desk for ticket investigation.",
      timestamp: nowIso,
    };
    setScanHistory((prev) => [updated, ...prev.slice(0, 19)]);
    setLastResult(null);
  };

  const handleRetryVerification = () => {
    if (lastResult?.payloadToRetry) {
      verifyPassData(lastResult.payloadToRetry);
    }
  };

  const handleResetShift = () => {
    setScanHistory([]);
    setLastResult(null);
  };

  // Staff simulation scenarios for pre-opening training
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
  const invalidScansCount = scanHistory.filter((s) => !s.valid && s.status !== "NETWORK_ERROR").length;
  const networkErrorsCount = scanHistory.filter((s) => s.status === "NETWORK_ERROR").length;

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* SHIFT TELEMETRY BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card text-center shadow-xs">
          <div className="text-xs uppercase font-semibold text-muted-foreground">
            {tOrg("scannerScansProcessed") || "Scans Processed"}
          </div>
          <div className="text-xl font-bold text-foreground mt-0.5">{scanHistory.length}</div>
        </Card>
        <Card className="p-3.5 border-border bg-card text-center shadow-xs">
          <div className="text-xs uppercase font-semibold text-muted-foreground">
            {tOrg("scannerEntriesGranted") || "Entries Granted"}
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{validScansCount}</div>
        </Card>
        <Card className="p-3.5 border-border bg-card text-center shadow-xs">
          <div className="text-xs uppercase font-semibold text-muted-foreground">
            {tOrg("scannerDoubleBlocked") || "Double Scans Blocked"}
          </div>
          <div className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">{doubleScansCount}</div>
        </Card>
        <Card className="p-3.5 border-border bg-card text-center shadow-xs">
          <div className="text-xs uppercase font-semibold text-muted-foreground">
            {tOrg("scannerFraudBlocked") || "Invalid Passes Blocked"}
          </div>
          <div className="text-xl font-bold text-rose-500 mt-0.5">
            {invalidScansCount}
            {networkErrorsCount > 0 && (
              <span className="text-xs font-normal text-amber-600 dark:text-amber-400 ml-1.5">
                ({networkErrorsCount} net)
              </span>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: CAMERA VIEWER, MANUAL SEARCH & SIMULATOR */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 border-border bg-card space-y-4 shadow-sm">
            {/* Mode Switcher & Audio Toggle */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/60 gap-1">
                <button
                  type="button"
                  aria-pressed={inputMode === "camera"}
                  onClick={() => setInputMode("camera")}
                  className={cn(
                    "min-h-[44px] px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                    inputMode === "camera"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Camera className="h-4 w-4" />
                  <span>{tOrg("cameraMode") || "Camera Stream"}</span>
                </button>

                <button
                  type="button"
                  aria-pressed={inputMode === "manual"}
                  onClick={() => setInputMode("manual")}
                  className={cn(
                    "min-h-[44px] px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                    inputMode === "manual"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Search className="h-4 w-4" />
                  <span>{tOrg("manualMode") || "Manual Code Entry"}</span>
                </button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="min-h-[44px] min-w-[44px] px-3 text-xs gap-1.5 cursor-pointer"
                onClick={() => setSoundEnabled(!soundEnabled)}
                aria-label="Toggle audio feedback"
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="h-4 w-4 text-emerald-500" />
                    <span className="hidden sm:inline">{tOrg("scannerAudioOn") || "Audio On"}</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                    <span className="hidden sm:inline">{tOrg("scannerAudioOff") || "Audio Off"}</span>
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
                          className="min-h-[44px] text-xs px-3.5 border-white/20 text-white hover:bg-white/10 gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          <span>Retry Sensor</span>
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setInputMode("manual")}
                          className="min-h-[44px] text-xs px-4 cursor-pointer"
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
                          <span>{cameraActive ? (tOrg("scannerOpticalActive") || "Optical Camera Feed Active") : "Optical Sensor Ready"}</span>
                        </div>
                        <span>{tOrg("scannerHmacGuard") || "Tamper Guard Active"}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* MANUAL CODE INPUT MODE */}
            {inputMode === "manual" && (
              <form onSubmit={handleManualSubmit} className="space-y-3 pt-2">
                <Input
                  id="scanner-manual-input"
                  label={tOrg("scannerManualLabel") || "Booking Code, Pass Hash, or Email"}
                  placeholder={tOrg("scannerManualPlaceholder") || "e.g. XPO-PASS-BK1234-A8F4E290..."}
                  value={manualHash}
                  onChange={(e) => setManualHash(e.target.value)}
                  helperText={tOrg("scannerManualHelper") || "Enter the booking reference, pass hash, or attendee registration email."}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full gap-2 text-xs min-h-[44px] cursor-pointer"
                  disabled={isVerifying || !manualHash.trim()}
                >
                  <Search className="h-4 w-4" />
                  <span>
                    {isVerifying
                      ? (tOrg("scannerVerifyingBtn") || "Verifying Pass...")
                      : (tOrg("scannerValidateBtn") || "Validate & Check-In Pass")}
                  </span>
                </Button>
              </form>
            )}

            {/* STAFF TRAINING & SIMULATION SANDBOX */}
            <div className="pt-3 border-t border-border space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  {tOrg("scannerQuickTest") || "Staff Training & Simulation Scenarios:"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowSimulator(!showSimulator)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:underline"
                >
                  <span>{showSimulator ? "Hide Scenarios" : "Show Scenarios"}</span>
                  {showSimulator ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              {showSimulator && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Practice with test scenarios before gates open. Verifies green, double-scan, and counterfeit handling.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={simulateValidStandardPass}
                      disabled={isVerifying}
                      className="text-xs min-h-[44px] py-2 px-2.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                    >
                      {tOrg("scannerValidPass") || "Valid Pass"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={simulateValidVipPass}
                      disabled={isVerifying}
                      className="text-xs min-h-[44px] py-2 px-2.5 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                    >
                      {tOrg("scannerVipPass") || "VIP Delegate"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={simulateDoubleScan}
                      disabled={isVerifying}
                      className="text-xs min-h-[44px] py-2 px-2.5 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                    >
                      {tOrg("scannerDoubleScan") || "Double Scan"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={simulateTamperedSignature}
                      disabled={isVerifying}
                      className="text-xs min-h-[44px] py-2 px-2.5 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    >
                      {tOrg("scannerFraudTamper") || "Fraud / Tamper"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: REAL-TIME OPERATIONAL TRIAGE & AUDIT STREAM */}
        <div className="lg:col-span-5 space-y-4" aria-live="assertive" role="status" aria-atomic="true">
          {/* Active Result Triage Card */}
          {lastResult ? (
            <Card
              className={cn(
                "p-5 border-2 transition-all shadow-md animate-fade-in space-y-4",
                lastResult.status === "CHECKED_IN"
                  ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20"
                  : lastResult.status === "DOUBLE_SCAN"
                  ? "border-amber-500 bg-amber-500/5 dark:bg-amber-950/20"
                  : lastResult.status === "NETWORK_ERROR"
                  ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
                  : "border-rose-500 bg-rose-500/5 dark:bg-rose-950/20"
              )}
            >
              {/* Header Status Bar */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {lastResult.status === "CHECKED_IN" && (
                    <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  )}
                  {lastResult.status === "DOUBLE_SCAN" && (
                    <div className="h-10 w-10 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-sm shrink-0">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                  )}
                  {lastResult.status === "NETWORK_ERROR" && (
                    <div className="h-10 w-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                      <WifiOff className="h-5 w-5" />
                    </div>
                  )}
                  {(lastResult.status === "INVALID" || lastResult.status === "CANCELLED") && (
                    <div className="h-10 w-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm shrink-0">
                      <XCircle className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      {SCAN_STATUS_MAP[lastResult.status]?.label || lastResult.status}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{lastResult.message}</p>
                  </div>
                </div>

                <Badge
                  variant={SCAN_STATUS_MAP[lastResult.status]?.variant || "outline"}
                  size="sm"
                  className="font-semibold text-xs px-2.5 py-0.5 shrink-0"
                >
                  {SCAN_STATUS_MAP[lastResult.status]?.badgeText || lastResult.status}
                </Badge>
              </div>

              {/* Attendee Profile Details */}
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

              {/* Unlocked Perks Accordion */}
              {lastResult.perks && lastResult.perks.length > 0 && (
                <div className="space-y-1.5 p-3 bg-card rounded-xl border border-border/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      {tOrg("scannerPerksUnlocked") || "Perks & Treats Unlocked:"}
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Issue items before attendee departs gate
                    </span>
                  </div>
                  <div className="space-y-1 pt-1">
                    {lastResult.perks.map((p) => (
                      <div
                        key={p.id || p.title}
                        className="p-2 bg-muted/30 rounded-lg border border-border/60 flex items-center gap-2 text-xs"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="font-medium text-foreground">{p.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OPERATOR TRIAGE RECOVERY ACTIONS */}
              <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
                {lastResult.status === "DOUBLE_SCAN" && (
                  <>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      Attendee already holds an admission timestamp. If badge was reprinted or attendee is returning from lunch, verify photo ID and grant override.
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleOverrideReEntry}
                        className="flex-1 min-h-[44px] text-xs gap-1.5 cursor-pointer"
                      >
                        <Check className="h-4 w-4" />
                        <span>{tOrg("scannerSupervisorOverride") || "Supervisor Override (Allow Re-Entry)"}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSendResolutionDesk}
                        className="min-h-[44px] text-xs px-3 cursor-pointer"
                      >
                        {tOrg("scannerSendResolutionDesk") || "Escort to Resolution Desk"}
                      </Button>
                    </div>
                  </>
                )}

                {lastResult.status === "NETWORK_ERROR" && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Pass data was preserved. Check connection and retry verification:
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleRetryVerification}
                        className="flex-1 min-h-[44px] text-xs gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>{tOrg("scannerRetryVerification") || "Retry Verification"}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setLastResult(null)}
                        className="min-h-[44px] text-xs px-3 cursor-pointer"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )}

                {(lastResult.status === "INVALID" || lastResult.status === "CANCELLED") && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      Operator Instructions: Check booking code on attendee confirmation email. If issue persists, escort attendee to the On-Site Help Desk.
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInputMode("manual");
                          setLastResult(null);
                        }}
                        className="flex-1 min-h-[44px] text-xs gap-1.5 cursor-pointer"
                      >
                        <Search className="h-4 w-4" />
                        <span>Search by Email or Code</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setLastResult(null)}
                        className="min-h-[44px] text-xs px-3 cursor-pointer"
                      >
                        Dismiss Alert
                      </Button>
                    </div>
                  </div>
                )}

                {lastResult.status === "CHECKED_IN" && (
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-muted-foreground">
                      Tip: Press Space or Esc to clear for next attendee
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setLastResult(null)}
                      className="min-h-[44px] text-xs px-4 cursor-pointer"
                    >
                      {tOrg("scannerNextAttendee") || "Clear for Next Attendee"}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-8 border-border bg-card text-center space-y-3 shadow-xs">
              <QrCode className="h-10 w-10 text-muted-foreground mx-auto animate-pulse" />
              <h2 className="text-sm font-bold text-foreground">
                {tOrg("scannerReadyTitle") || "Ready to Scan Passes"}
              </h2>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {tOrg("scannerReadyDesc") || "Scan attendee tickets using the camera target or enter booking codes to check in."}
              </p>
            </Card>
          )}

          {/* RECENT SCAN AUDIT STREAM */}
          <Card className="p-4 border-border bg-card space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>{tOrg("scannerRecentLogs") || "Gate Scan Activity Audit"}</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">
                  {scanHistory.length} logs
                </span>
                {scanHistory.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetShift}
                    className="min-h-[36px] px-2 text-xs text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
                    title="Reset shift audit logs"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{tOrg("scannerResetShift") || "Reset Shift"}</span>
                  </Button>
                )}
              </div>
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
