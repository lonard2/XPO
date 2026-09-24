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
  Briefcase,
  QrCode,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  Sparkles,
  Minus,
  Plus,
  Copy,
  Check,
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
  const tTickets = useTranslations("tickets");
  const tCommon = useTranslations("common");

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
  const [copiedRef, setCopiedRef] = React.useState(false);

  // Sync initial tier ID when passed
  React.useEffect(() => {
    if (initialTierId) {
      setSelectedTierId(initialTierId);
    } else if (!selectedTierId && event.ticketTiers.length > 0) {
      setSelectedTierId(event.ticketTiers[0].id);
    }
  }, [initialTierId, event.ticketTiers, selectedTierId]);

  const selectedTier = event.ticketTiers.find((t) => t.id === selectedTierId) || event.ticketTiers[0];
  const remainingSlots = selectedTier ? Math.max(0, selectedTier.capacity - selectedTier.soldCount) : 0;
  const maxAllowedQuantity = Math.min(5, Math.max(1, remainingSlots));
  const totalPrice = selectedTier ? selectedTier.price * quantity : 0;
  const currency = (selectedTier?.currency as SupportedCurrency) || "IDR";

  const handleCopyBookingId = async () => {
    if (!confirmedBooking?.id) return;
    try {
      await navigator.clipboard.writeText(confirmedBooking.id);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) {
      setErrorMessage("Please select a ticket tier to proceed.");
      return;
    }
    if (remainingSlots <= 0) {
      setErrorMessage("The selected pass tier is sold out. Please select another tier.");
      return;
    }
    if (!attendeeName.trim()) {
      setErrorMessage("Please enter your full attendee name.");
      return;
    }
    if (!attendeeEmail.trim() || !attendeeEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address for digital pass delivery.");
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
          organization: organization.trim() || undefined,
          jobTitle: jobTitle.trim() || undefined,
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
      title={confirmedBooking ? "Reservation Confirmed" : (tTickets("checkoutTitle") || "Book Your Event Pass")}
      description={
        confirmedBooking
          ? "Your cryptographic event pass has been generated."
          : `Reserve credentials for ${event.title}`
      }
    >
      {confirmedBooking ? (
        /* ================== SUCCESS CONFIRMATION STATE ================== */
        <div className="space-y-5 py-1 animate-fade-in">
          {/* Header Banner */}
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Pass Issued & Cryptographically Signed
            </h3>
            <div className="flex items-center justify-center gap-2 pt-0.5">
              <span className="text-xs text-muted-foreground">Booking Ref:</span>
              <span className="font-mono text-xs font-bold text-foreground bg-background px-2 py-0.5 rounded-md border border-border">
                {confirmedBooking.id}
              </span>
              <button
                type="button"
                onClick={handleCopyBookingId}
                className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                title="Copy Booking ID"
                aria-label="Copy booking reference"
              >
                {copiedRef ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Pass Preview Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3.5 shadow-xs">
            <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <Badge variant="archetype" size="sm">
                  {confirmedBooking.ticketTier?.name || selectedTier?.name}
                </Badge>
                <h4 className="text-sm font-bold text-foreground mt-1.5 leading-snug">{event.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {event.venue.hallName ? `${event.venue.name} (${event.venue.hallName})` : event.venue.name}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="success" size="sm">
                  CONFIRMED
                </Badge>
              </div>
            </div>

            {/* Pass QR Thumbnail */}
            {confirmedBooking.svgQr && (
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-inner">
                <div
                  className="w-36 h-36"
                  dangerouslySetInnerHTML={{ __html: confirmedBooking.svgQr }}
                />
                <span className="text-[11px] font-mono text-slate-600 mt-2 text-center truncate max-w-full">
                  {confirmedBooking.qrCodeHash}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 text-center">
                  Scan at door turnstile reader for admission
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/60">
              <div>
                <span className="text-[11px] uppercase font-semibold text-muted-foreground">Attendee</span>
                <p className="font-semibold text-foreground truncate">{confirmedBooking.attendeeName}</p>
              </div>
              <div>
                <span className="text-[11px] uppercase font-semibold text-muted-foreground">Pass Delivery</span>
                <p className="font-semibold text-foreground truncate font-mono">{confirmedBooking.attendeeEmail}</p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <Link
              href={`/${locale}/my-tickets/${confirmedBooking.id}`}
              onClick={handleResetAndClose}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm min-h-[44px]"
            >
              <QrCode className="h-4 w-4" />
              <span>Open Digital Pass & Event Treats</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="flex items-center gap-2 pt-1">
              <Link
                href={`/${locale}/my-tickets`}
                onClick={handleResetAndClose}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-border/80 transition-colors min-h-[44px]"
              >
                View All My Passes
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetAndClose}
                className="min-h-[44px] px-4 text-xs cursor-pointer"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ================== CHECKOUT FORM STATE ================== */
        <form onSubmit={handleCheckout} className="space-y-5 py-1">
          {/* Spatial & Schedule Context Pill */}
          <div className="flex flex-col gap-1 p-3 bg-muted/40 rounded-xl border border-border/70 text-xs">
            <div className="font-semibold text-foreground truncate">{event.title}</div>
            <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{formatDateRange(event.startDate, event.endDate, locale)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">
                  {event.venue.hallName ? `${event.venue.name} (${event.venue.hallName})` : event.venue.name}
                </span>
              </span>
            </div>
          </div>

          {/* Step 1: Select Ticket Tier */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-primary" />
                1. Select Pass Tier
              </span>
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
          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  2. Pass Quantity
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Up to {maxAllowedQuantity} passes per reservation
                </span>
              </div>

              {/* Stepper with accessible controls */}
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/80">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="h-9 w-9 rounded-lg flex items-center justify-center text-foreground hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>

                <span className="w-8 text-center text-xs font-bold text-foreground font-mono">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxAllowedQuantity, q + 1))}
                  disabled={quantity >= maxAllowedQuantity}
                  className="h-9 w-9 rounded-lg flex items-center justify-center text-foreground hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Pills for instant tap */}
            <div className="flex items-center gap-2 pt-1">
              {[1, 2, 3, 5].map((q) => {
                const isOverLimit = q > maxAllowedQuantity;
                return (
                  <button
                    key={q}
                    type="button"
                    disabled={isOverLimit}
                    onClick={() => setQuantity(q)}
                    className={`flex-1 py-1.5 text-xs rounded-lg border font-semibold transition-colors min-h-[38px] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                      quantity === q
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : isOverLimit
                        ? "opacity-30 cursor-not-allowed border-border text-muted-foreground"
                        : "bg-card border-border/80 text-foreground hover:bg-muted/40"
                    }`}
                  >
                    {q} {q === 1 ? "Pass" : "Passes"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Attendee Information */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                3. Attendee Details
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Passes and verification barcodes will be dispatched to this email address.
              </p>
            </div>

            <div className="space-y-1">
              <label htmlFor="checkout-attendee-name" className="text-xs font-semibold text-foreground block">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                id="checkout-attendee-name"
                name="name"
                required
                type="text"
                autoComplete="name"
                value={attendeeName}
                onChange={(e) => setAttendeeName(e.target.value)}
                placeholder="e.g. Alex Pratama"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-background border border-border text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary min-h-[44px]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="checkout-attendee-email" className="text-xs font-semibold text-foreground block">
                Email Address (Pass Delivery) <span className="text-destructive">*</span>
              </label>
              <input
                id="checkout-attendee-email"
                name="email"
                required
                type="email"
                autoComplete="email"
                value={attendeeEmail}
                onChange={(e) => setAttendeeEmail(e.target.value)}
                placeholder="e.g. alex@company.com"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-background border border-border text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
              <div className="space-y-1">
                <label htmlFor="checkout-organization" className="text-xs font-semibold text-foreground block">
                  Organization / Company
                </label>
                <input
                  id="checkout-organization"
                  name="organization"
                  type="text"
                  autoComplete="organization"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Nusantara Technologies"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-background border border-border text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary min-h-[44px]"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="checkout-job-title" className="text-xs font-semibold text-foreground block">
                  Professional Role / Job Title
                </label>
                <input
                  id="checkout-job-title"
                  name="jobTitle"
                  type="text"
                  autoComplete="organization-title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. VP Engineering"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-background border border-border text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2.5 animate-fade-in"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Security & Summary Footer */}
          <div className="pt-3 border-t border-border/80 space-y-3">
            <div className="space-y-1.5 p-3 bg-muted/30 rounded-xl border border-border/60 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Pass Allocation</span>
                <span className="font-semibold text-foreground">
                  {selectedTier?.name} × {quantity}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Issuance & Platform Fee</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Waived (0%)</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/50 text-sm font-bold">
                <span className="text-foreground">Total Amount</span>
                <span className="text-base text-foreground font-bold">
                  {totalPrice > 0
                    ? formatCurrency(totalPrice, currency, locale)
                    : "Free Admission"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/60">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Instant Turnstile Pass: Cryptographically signed HMAC-SHA256 barcode generated upon reservation.</span>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !selectedTier || remainingSlots <= 0}
              className="w-full font-semibold gap-2 shadow-sm min-h-[44px] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Issuing Cryptographic Pass...</span>
                </>
              ) : remainingSlots <= 0 ? (
                <span>Sold Out</span>
              ) : (
                <>
                  <Ticket className="h-4 w-4" />
                  <span>
                    Confirm & Reserve {quantity > 1 ? `${quantity} Passes` : "Pass"} ({totalPrice > 0 ? formatCurrency(totalPrice, currency, locale) : "Free"})
                  </span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </Drawer>
  );
}
