"use client";

import * as React from "react";
import Link from "next/link";
import {
  Ticket,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  User,
  Mail,
  Building2,
  QrCode,
  ExternalLink,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTranslations } from "next-intl";
import { TierSelector, type TicketTierItem } from "@/components/tickets/TierSelector";
import { formatCurrency, formatDateRange, type SupportedCurrency } from "@/lib/i18n/formatters";

export interface TicketCheckoutDrawerProps {
  event: {
    id: string;
    title: string;
    slug: string;
    startDate: Date | string;
    endDate: Date | string;
    venue: {
      name: string;
      city: string;
      hallName?: string | null;
    };
    ticketTiers: TicketTierItem[];
  };
  isOpen: boolean;
  onClose: () => void;
  initialTierId?: string | null;
  locale?: string;
  onSuccess?: (booking: any) => void;
}

export function TicketCheckoutDrawer({
  event,
  isOpen,
  onClose,
  initialTierId,
  locale = "en",
  onSuccess,
}: TicketCheckoutDrawerProps) {
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

  const [selectedTierId, setSelectedTierId] = React.useState<string | null>(
    initialTierId || event.ticketTiers[0]?.id || null
  );
  const [quantity, setQuantity] = React.useState<number>(1);
  const [attendeeName, setAttendeeName] = React.useState("");
  const [attendeeEmail, setAttendeeEmail] = React.useState("");
  const [organization, setOrganization] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = React.useState<any | null>(null);

  // Sync initial tier ID when passed
  React.useEffect(() => {
    if (initialTierId) {
      setSelectedTierId(initialTierId);
    } else if (!selectedTierId && event.ticketTiers.length > 0) {
      setSelectedTierId(event.ticketTiers[0].id);
    }
  }, [initialTierId, event.ticketTiers, selectedTierId]);

  const selectedTier = event.ticketTiers.find((t) => t.id === selectedTierId) || event.ticketTiers[0];
  const totalPrice = selectedTier ? selectedTier.price * quantity : 0;
  const currency = (selectedTier?.currency as SupportedCurrency) || "IDR";

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) {
      setErrorMessage("Please select a ticket tier.");
      return;
    }
    if (!attendeeName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!attendeeEmail.trim() || !attendeeEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/tickets/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          tierId: selectedTier.id,
          attendeeName: attendeeName.trim(),
          attendeeEmail: attendeeEmail.toLowerCase().trim(),
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to complete ticket reservation.");
      }

      setConfirmedBooking(data.booking);
      if (onSuccess) {
        onSuccess(data.booking);
      }
    } catch (err) {
      setErrorMessage((err as Error).message || "An unexpected error occurred during checkout.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setConfirmedBooking(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={confirmedBooking ? "Reservation Confirmed" : "Ticket Pass Reservation"}
      description={
        confirmedBooking
          ? "Your cryptographic event pass has been generated."
          : `Reserve credentials for ${event.title}`
      }
    >
      {confirmedBooking ? (
        /* ================== SUCCESS CONFIRMATION STATE ================== */
        <div className="space-y-6 py-2 animate-fade-in">
          {/* Header Banner */}
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-foreground">
              Pass Issued & Cryptographically Signed
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Booking Ref: <span className="font-mono font-semibold text-foreground">{confirmedBooking.id}</span>
            </p>
          </div>

          {/* Pass Preview Card */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <Badge variant="archetype" size="sm">
                  {confirmedBooking.ticketTier?.name || selectedTier?.name}
                </Badge>
                <h5 className="text-sm font-bold text-foreground mt-1.5">{event.title}</h5>
                <p className="text-xs text-muted-foreground">{event.venue.name}</p>
              </div>
              <div className="text-right">
                <Badge variant="success" size="sm">
                  CONFIRMED
                </Badge>
              </div>
            </div>

            {/* Pass QR Thumbnail */}
            {confirmedBooking.svgQr && (
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-border shadow-inner">
                <div
                  className="w-40 h-40"
                  dangerouslySetInnerHTML={{ __html: confirmedBooking.svgQr }}
                />
                <span className="text-[10px] font-mono text-slate-500 mt-2 text-center truncate max-w-full">
                  {confirmedBooking.qrCodeHash}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
              <div>
                <span className="text-[10px] uppercase font-medium text-slate-400">Attendee</span>
                <p className="font-semibold text-foreground truncate">{confirmedBooking.attendeeName}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-medium text-slate-400">Email</span>
                <p className="font-semibold text-foreground truncate">{confirmedBooking.attendeeEmail}</p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            <Link
              href={`/${locale}/my-tickets/${confirmedBooking.id}`}
              onClick={handleResetAndClose}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
            >
              <QrCode className="h-4 w-4" />
              Open Digital Pass & Event Treats
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href={`/${locale}/my-tickets`}
              onClick={handleResetAndClose}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              View All My Passes
            </Link>
          </div>
        </div>
      ) : (
        /* ================== CHECKOUT FORM STATE ================== */
        <form onSubmit={handleCheckout} className="space-y-6 py-2">
          {/* Step 1: Select Ticket Tier */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-primary" />
                1. Select Pass Tier
              </label>
            </div>
            <TierSelector
              tiers={event.ticketTiers}
              selectedTierId={selectedTierId}
              onSelectTier={(id) => setSelectedTierId(id)}
              locale={locale}
              compact={false}
            />
          </div>

          {/* Step 2: Quantity Selection */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                2. Pass Quantity
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 5].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantity(q)}
                    className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors ${
                      quantity === q
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Attendee Information */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" />
              3. Attendee Details
            </label>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Full Name *</label>
              <input
                required
                type="text"
                value={attendeeName}
                onChange={(e) => setAttendeeName(e.target.value)}
                placeholder="e.g. Alex Pratama"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Email Address (Pass Delivery) *</label>
              <input
                required
                type="email"
                value={attendeeEmail}
                onChange={(e) => setAttendeeEmail(e.target.value)}
                placeholder="e.g. alex@company.com"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Organization / Company</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Nusantara Tech"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. VP Engineering"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Security & Summary Footer */}
          <div className="pt-3 border-t border-border space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="text-lg font-bold text-foreground">
                {totalPrice > 0
                  ? formatCurrency(totalPrice, currency, locale)
                  : "Free Admission"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 p-2.5 rounded-lg">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Tamper-proof HMAC-SHA256 vector QR code will be generated instantly.</span>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !selectedTier}
              className="w-full font-semibold gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Cryptographic Pass...
                </>
              ) : (
                <>
                  <Ticket className="h-4 w-4" />
                  Confirm & Generate Pass ({formatCurrency(totalPrice, currency, locale)})
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </Drawer>
  );
}
