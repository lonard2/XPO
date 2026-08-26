import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import {
  QrCode,
  Calendar,
  MapPin,
  Gift,
  ChevronLeft,
  ShieldCheck,
  Building2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { DigitalPassQR } from '@/components/perks/DigitalPassQR';
import { PassDayOfSubnav } from '@/components/perks/PassDayOfSubnav';
import { InteractiveGuidebook } from '@/components/perks/InteractiveGuidebook';
import { HallFloorMap } from '@/components/perks/HallFloorMap';
import { TierPerksGating } from '@/components/perks/TierPerksGating';

interface DigitalPassPageProps {
  params: Promise<{
    locale: string;
    bookingId: string;
  }>;
}

export async function generateMetadata({ params }: DigitalPassPageProps) {
  const { bookingId } = await params;
  return {
    title: `Digital Pass & Event Treats (${bookingId}) | XPO MICE Ecosystem`,
    description: 'Access your cryptographic vector QR pass, interactive schedule guidebook, hall map, and tier treat vouchers.',
  };
}

export async function generateStaticParams() {
  try {
    const bookings = await db.booking.findMany({
      select: { id: true },
      take: 10,
    });
    if (bookings.length > 0) {
      return bookings.map((b) => ({ bookingId: b.id }));
    }
  } catch {
    // Fallback static params
  }

  return [
    { bookingId: 'bk-mfg-2026-001' },
    { bookingId: 'bk-ai-2026-002' },
  ];
}

export default async function DigitalPassDetailPage({ params }: DigitalPassPageProps) {
  const { locale, bookingId } = await params;
  setRequestLocale(locale);

  const tMy = await getTranslations({ locale, namespace: 'myTickets' });
  const tTix = await getTranslations({ locale, namespace: 'tickets' });
  const tCom = await getTranslations({ locale, namespace: 'common' });

  let booking: any = null;
  try {
    booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        ticketTier: true,
        user: true,
        event: {
          include: {
            venue: {
              include: {
                region: true,
              },
            },
            venueHall: true,
            agendaItems: {
              orderBy: { startTime: 'asc' },
            },
            booths: {
              orderBy: { companyName: 'asc' },
            },
            perks: true,
          },
        },
      },
    });
  } catch {
    booking = null;
  }

  // Fallback realistic mock data if bookingId is a demo or not found
  if (!booking) {
    let fallbackEvent = null;
    try {
      fallbackEvent = await db.event.findFirst({
        include: {
          venue: { include: { region: true } },
          venueHall: true,
          ticketTiers: true,
          agendaItems: true,
          booths: true,
          perks: true,
        },
      });
    } catch {
      fallbackEvent = null;
    }

    if (fallbackEvent && fallbackEvent.ticketTiers.length > 0) {
      const tier = fallbackEvent.ticketTiers[0];
      booking = {
        id: bookingId || 'bk-demo-001',
        status: 'CONFIRMED',
        qrCodeHash: `XPO-PASS-${bookingId || 'DEMO'}-A1B2C3D4E5F67890`,
        attendeeName: 'Alex Pratama',
        attendeeEmail: 'alex@xpo.com',
        checkedInAt: null,
        createdAt: new Date(),
        ticketTier: tier,
        event: fallbackEvent,
      };
    } else {
      notFound();
    }
  }

  const perksCount = booking.event.perks?.length || 0;
  const agendaCount = booking.event.agendaItems?.length || 0;
  const hasMap = Boolean(booking.event.booths && booking.event.booths.length > 0);

  return (
    <div className="min-h-screen bg-background text-foreground py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 1. Breadcrumb & Back Nav */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <Link
            href={`/${locale}/my-tickets`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>{tMy('title') || 'Back to My Pass Wallet'}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
              Pass Ref: {booking.id}
            </span>
            <Badge variant="archetype" size="sm">
              {booking.ticketTier.name}
            </Badge>
          </div>
        </div>

        {/* 2. Sticky Day-Of Segmented Jump Navigation */}
        <PassDayOfSubnav
          hasPerks={perksCount > 0}
          perksCount={perksCount}
          hasAgenda={agendaCount > 0}
          agendaCount={agendaCount}
          hasMap={hasMap}
        />

        {/* 3. Cryptographic Digital Pass QR Section */}
        <section id="digital-pass-section" className="space-y-4">
          <DigitalPassQR booking={booking} locale={locale} />
        </section>

        {/* 4. Tier-Gated Event Day Treats & Vouchers */}
        {booking.event.perks && booking.event.perks.length > 0 && (
          <section id="event-perks-section" className="pt-6 border-t border-border/80">
            <TierPerksGating
              perks={booking.event.perks}
              attendeeTierName={booking.ticketTier.name}
              bookingId={booking.id}
              locale={locale}
            />
          </section>
        )}

        {/* 5. Interactive Schedule Guidebook with Personal Agenda */}
        {booking.event.agendaItems && booking.event.agendaItems.length > 0 && (
          <section id="event-agenda-section" className="pt-6 border-t border-border/80">
            <InteractiveGuidebook
              agendaItems={booking.event.agendaItems}
              eventTitle={booking.event.title}
              locale={locale}
            />
          </section>
        )}

        {/* 6. Interactive SVG Hall Floor Map & Booth Locator */}
        {hasMap && (
          <section id="hall-map-section" className="pt-6 border-t border-border/80">
            <HallFloorMap
              booths={booking.event.booths}
              venueName={booking.event.venue?.name || 'Convention Center'}
              hallName={booking.event.venueHall?.name}
              locale={locale}
            />
          </section>
        )}
      </div>
    </div>
  );
}
