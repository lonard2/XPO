"use client";

import * as React from "react";
import {
  QrCode,
  ShieldCheck,
  Printer,
  Download,
  Copy,
  Check,
  Sparkles,
  Calendar,
  MapPin,
  User,
  Clock,
  ExternalLink,
  ShieldAlert,
  Info,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";
import { generateSvgQrCode } from "@/lib/tickets/qrPass";
import { formatDateRange, formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

export interface DigitalPassQRProps {
  booking: {
    id: string;
    status: string;
    qrCodeHash: string;
    attendeeName: string;
    attendeeEmail: string;
    checkedInAt?: Date | string | null;
    createdAt: Date | string;
    ticketTier: {
      id: string;
      name: string;
      price: number;
      currency: string;
      benefitsJson?: string;
    };
    event: {
      id: string;
      title: string;
      slug: string;
      startDate: Date | string;
      endDate: Date | string;
      venue: {
        name: string;
        city: string;
        address?: string;
        hallName?: string | null;
      };
      heroImageUrl?: string | null;
    };
  };
  locale?: string;
}

export function DigitalPassQR({ booking, locale = "en" }: DigitalPassQRProps) {
  let tTickets: any = (k: string) => k;
  let tCommon: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tTickets = useTranslations("tickets");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tCommon = useTranslations("common");
  } catch {
    // Fallback
  }

  const [copiedHash, setCopiedHash] = React.useState(false);
  const [showSecurityModal, setShowSecurityModal] = React.useState(false);

  // Generate SVG QR Code dynamically
  const svgQrString = React.useMemo(() => {
    return generateSvgQrCode(booking.qrCodeHash, {
      size: 320,
      primaryColor: "#1e3a8a",
      backgroundColor: "#ffffff",
      status: booking.status,
    });
  }, [booking.qrCodeHash, booking.status]);

  const handleCopyHash = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(booking.qrCodeHash);
        setCopiedHash(true);
        setTimeout(() => setCopiedHash(false), 2000);
      } catch {
        // Fallback
      }
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleDownloadSvg = () => {
    if (typeof window !== "undefined") {
      const blob = new Blob([svgQrString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `xpo-pass-${booking.id}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const formattedDate = formatDateRange(booking.event.startDate, booking.event.endDate, locale);
  const isCheckedIn = booking.status === "CHECKED_IN";
  const isCancelled = booking.status === "CANCELLED";

  return (
    <div className="space-y-6">
      {/* 1. Main Pass Container */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card via-card/90 to-muted/30 shadow-xl print:shadow-none print:border-black">
        {/* Animated Security Watermark Banner */}
        <div className="relative overflow-hidden bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {tTickets("antiTamperPass") || "Anti-Tamper Cryptographic Pass"}
              </span>
              <p className="text-[11px] text-slate-400 font-mono truncate">{booking.qrCodeHash}</p>
            </div>
          </div>

          <div>
            {isCheckedIn ? (
              <Badge variant="success" size="sm" className="gap-1 font-semibold">
                <CheckCircle2 className="h-3 w-3" />
                {tTickets("checkedInStatus") || "CHECKED IN"}
              </Badge>
            ) : isCancelled ? (
              <Badge variant="outline" size="sm" className="border-red-500/50 text-red-400">
                {tTickets("cancelledStatus") || "CANCELLED"}
              </Badge>
            ) : (
              <Badge variant="archetype" size="sm" className="gap-1 font-semibold">
                <Sparkles className="h-3 w-3" />
                {tTickets("confirmedStatus") || "CONFIRMED"}
              </Badge>
            )}
          </div>
        </div>

        {/* Pass Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Event & Tier Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-border/60">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" size="sm" className="font-semibold uppercase tracking-wider">
                  {booking.ticketTier.name}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  Ref: {booking.id}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {booking.event.title}
              </h3>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-xs uppercase text-muted-foreground font-medium">{tTickets("issuedValue") || "Issued Value"}</span>
              <p className="text-lg font-bold text-foreground">
                {booking.ticketTier.price > 0
                  ? formatCurrency(
                      booking.ticketTier.price,
                      (booking.ticketTier.currency as SupportedCurrency) || "IDR",
                      locale
                    )
                  : (tTickets("complimentary") || "Complimentary")}
              </p>
            </div>
          </div>

          {/* QR Code Presentation Box with Center Watermark */}
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-xl bg-white text-slate-900 border border-slate-200 shadow-inner max-w-sm mx-auto">
            <div className="relative group">
              {/* Render Vector SVG QR */}
              <div
                className="w-56 h-56 sm:w-64 sm:h-64 select-none"
                dangerouslySetInnerHTML={{ __html: svgQrString }}
              />

              {/* Watermark Overlay Stamp */}
              {isCheckedIn && (
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/20 backdrop-blur-2xs rounded-lg animate-fade-in pointer-events-none">
                  <div className="px-4 py-2 rounded-lg bg-emerald-600/90 text-white text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    {tTickets("admittedAtGate") || "Admitted at Gate"}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-800">
                {tTickets("scanTurnstile") || tTickets("scanPass") || "Scan at Door / Turnstile Reader"}
              </p>
              <p className="text-[11px] text-slate-500 font-mono truncate max-w-[260px]">
                {booking.qrCodeHash}
              </p>
            </div>
          </div>

          {/* Attendee & Venue Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <User className="h-3.5 w-3.5 text-primary" />
                <span>{tTickets("attendeeName") || tTickets("fullName") || "Attendee Name"}</span>
              </div>
              <p className="font-semibold text-foreground text-sm">{booking.attendeeName}</p>
              <p className="text-xs text-muted-foreground truncate">{booking.attendeeEmail}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>{tTickets("eventDates") || tCommon("date") || "Event Dates"}</span>
              </div>
              <p className="font-semibold text-foreground text-sm">{formattedDate}</p>
              <p className="text-xs text-muted-foreground">Standard Exhibition Hours</p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>{tTickets("venueAndHall") || tCommon("venue") || "Venue & Hall"}</span>
              </div>
              <p className="font-semibold text-foreground text-sm">{booking.event.venue.name}</p>
              <p className="text-xs text-muted-foreground">
                {booking.event.venue.hallName || "Main Exhibition Halls"} • {booking.event.venue.city}
              </p>
            </div>
          </div>

          {/* Check-in Timestamp notice if checked in */}
          {isCheckedIn && booking.checkedInAt && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                {tTickets("verifiedAdmittedOn") || "Verified & Admitted on"}{" "}
                <span className="font-semibold">
                  {new Date(booking.checkedInAt).toLocaleString()}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-4 bg-muted/40 border-t border-border flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyHash}
              className="h-8 text-xs gap-1.5"
            >
              {copiedHash ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Hash Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Pass Hash
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadSvg}
              className="h-8 text-xs gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Save SVG Pass
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSecurityModal(!showSecurityModal)}
              className="h-8 text-xs gap-1.5"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Security Specs
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs gap-1.5 font-semibold"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Security Specs Details Drawer/Accordion */}
        {showSecurityModal && (
          <div className="p-5 bg-slate-950 text-slate-200 border-t border-slate-800 text-xs space-y-3 animate-fade-in font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                HMAC-SHA256 Cryptographic Authentication Ledger
              </span>
              <button
                onClick={() => setShowSecurityModal(false)}
                className="text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div>
                <span className="text-slate-500">Algorithm:</span> HMAC-SHA256 (256-bit)
              </div>
              <div>
                <span className="text-slate-500">Verification:</span> Constant-Time (`crypto.timingSafeEqual`)
              </div>
              <div>
                <span className="text-slate-500">Booking ID:</span> {booking.id}
              </div>
              <div>
                <span className="text-slate-500">Issued Timestamp:</span>{" "}
                {new Date(booking.createdAt).toISOString()}
              </div>
              <div className="sm:col-span-2 truncate">
                <span className="text-slate-500">Public Hash:</span> {booking.qrCodeHash}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
