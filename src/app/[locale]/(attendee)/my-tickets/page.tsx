import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import {
  Ticket,
  QrCode,
  Calendar,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Layers,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateRange, formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import { generateSvgQrCode } from "@/lib/tickets/qrPass";

interface MyTicketsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata() {
  return {
    title: "My Pass Wallet | XPO MICE Ecosystem",
    description: "Access your digital passes, cryptographic QR badges, and interactive event-day treat vouchers.",
  };
}

export default async function MyTicketsPage({ params }: MyTicketsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tMy = await getTranslations({ locale, namespace: "myTickets" });
  const tTix = await getTranslations({ locale, namespace: "tickets" });
  const tCom = await getTranslations({ locale, namespace: "common" });

  let bookings: any[] = [];
  try {
    bookings = await db.booking.findMany({
      include: {
        event: {
          include: {
            venue: {
              include: {
                region: true,
              },
            },
            venueHall: true,
          },
        },
        ticketTier: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    bookings = [];
  }

  // Fallback sample bookings if DB is fresh/empty
  if (bookings.length === 0) {
    try {
      const sampleEvent = await db.event.findFirst({
        include: { venue: true, venueHall: true, ticketTiers: true },
      });
      if (sampleEvent && sampleEvent.ticketTiers.length > 0) {
        const tier = sampleEvent.ticketTiers[0];
        bookings = [
          {
            id: "bk-mfg-2026-001",
            status: "CONFIRMED",
            qrCodeHash: "XPO-PASS-BK-MFG-2026-001-A1B2C3D4E5F67890",
            attendeeName: "Alex Pratama",
            attendeeEmail: "alex@xpo.com",
            createdAt: new Date(),
            ticketTier: tier,
            event: sampleEvent,
          },
        ];
      }
    } catch {
      // Ignore
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="archetype" size="sm" className="gap-1.5 font-semibold">
                <ShieldCheck className="h-3 w-3" />
                {tMy("title") || "Attendee Credential Wallet"}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {tMy("title") || "My Passes & Event Treat Vouchers"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {tMy("subtitle") || "Present your vector QR passes for fast-track venue admission and redeem on-site perks."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/events`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
            >
              <Ticket className="h-4 w-4" />
              {tMy("browseEvents") || "Explore More Events"}
            </Link>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border bg-card/40 space-y-4 max-w-lg mx-auto">
            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Ticket className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                {tMy("noPassesTitle") || "No Active Passes Found"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {tMy("noPassesDesc") || "You haven't reserved any convention passes yet. Browse upcoming industrial expos, developer summits, and medical symposiums."}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href={`/${locale}/events`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
              >
                {tMy("browseEvents") || "Discover Upcoming Events"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => {
              const formattedDate = formatDateRange(
                booking.event.startDate,
                booking.event.endDate,
                locale
              );
              const isCheckedIn = booking.status === "CHECKED_IN";
              const isCancelled = booking.status === "CANCELLED";

              // Generate Mini SVG QR Code
              const miniSvgQr = generateSvgQrCode(booking.qrCodeHash, {
                size: 140,
                primaryColor: "#1e3a8a",
              });

              return (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-200 overflow-hidden shadow-md flex flex-col justify-between"
                >
                  {/* Card Header Strip */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="archetype" size="sm" className="font-semibold uppercase">
                        {booking.ticketTier.name}
                      </Badge>

                      {isCheckedIn ? (
                        <Badge variant="success" size="sm" className="gap-1 font-semibold">
                          <CheckCircle2 className="h-3 w-3" />
                          {tTix("verifiedStatus") || "Checked In"}
                        </Badge>
                      ) : isCancelled ? (
                        <Badge variant="outline" size="sm" className="border-red-500 text-red-500">
                          {tCom("cancel") || "Cancelled"}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" size="sm" className="font-semibold">
                          {tTix("reservationConfirmed") || "Confirmed Pass"}
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-bold text-foreground line-clamp-2">
                        {booking.event.title}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{booking.event.venue.name}</span>
                      </p>
                    </div>

                    {/* QR Thumbnail & Metadata Row */}
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/40 border border-border/50">
                      <div
                        className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-200 shrink-0 select-none shadow-xs"
                        dangerouslySetInnerHTML={{ __html: miniSvgQr }}
                      />
                      <div className="min-w-0 flex-1 space-y-1 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground font-mono text-[11px]">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span className="truncate">{formattedDate}</span>
                        </div>
                        <p className="font-semibold text-foreground truncate">
                          {booking.attendeeName}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground truncate">
                          ID: {booking.id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 bg-muted/30 border-t border-border mt-auto">
                    <Link
                      href={`/${locale}/my-tickets/${booking.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      {tMy("showPass") || "Open Digital Pass & Treats"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
