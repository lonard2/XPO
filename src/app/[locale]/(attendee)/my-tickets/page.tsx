import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import {
  Ticket,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { buttonVariants } from '@/components/ui/Button';
import { PassWalletExplorer, type BookingSummary } from '@/components/tickets/PassWalletExplorer';
import { cn } from '@/lib/utils';

interface MyTicketsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata() {
  return {
    title: 'My Pass Wallet | XPO MICE Ecosystem',
    description: 'Access your digital passes, cryptographic QR badges, and interactive event-day treat vouchers.',
  };
}

export default async function MyTicketsPage({ params }: MyTicketsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tMy = await getTranslations({ locale, namespace: 'myTickets' });
  const tCom = await getTranslations({ locale, namespace: 'common' });

  let bookings: BookingSummary[] = [];
  try {
    const rawBookings = await db.booking.findMany({
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
      orderBy: { createdAt: 'desc' },
    });
    if (rawBookings.length > 0) {
      bookings = rawBookings as unknown as BookingSummary[];
    }
  } catch {
    bookings = [];
  }

  // Fallback sample bookings if DB is fresh/empty
  if (bookings.length === 0) {
    try {
      const sampleEvent = await db.event.findFirst({
        include: { venue: { include: { region: true } }, venueHall: true, ticketTiers: true },
      });
      if (sampleEvent && sampleEvent.ticketTiers.length > 0) {
        const tier = sampleEvent.ticketTiers[0];
        bookings = [
          {
            id: 'bk-mfg-2026-001',
            status: 'CONFIRMED',
            qrCodeHash: 'XPO-PASS-BK-MFG-2026-001-A1B2C3D4E5F67890',
            attendeeName: 'Alex Pratama',
            attendeeEmail: 'alex@xpo.com',
            createdAt: new Date(),
            ticketTier: tier,
            event: sampleEvent as any,
          },
        ];
      }
    } catch {
      // Ignore
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-6 sm:py-10 space-y-8">
      {/* Semantic Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="border-b border-border bg-muted/30 py-3 -mt-6 sm:-mt-10 mb-6">
        <ol className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-muted-foreground px-4 sm:px-6 lg:px-8">
          <li>
            <Link href={`/${locale}`} className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{tCom('explore') || 'Home'}</span>
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-foreground">
            {tMy('title')?.split('&')?.[0]?.trim() || 'Pass Wallet'}
          </li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" size="sm" className="gap-1.5 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>{tMy('title') || 'Attendee Credential Wallet'}</span>
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {tMy('title') || 'My Passes & Event Treat Vouchers'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {tMy('subtitle') || 'Present your vector QR passes for fast-track venue admission and redeem on-site perks.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/events`}
              className={cn(
                buttonVariants({ variant: 'default', size: 'sm' }),
                'gap-2 text-xs font-semibold shadow-xs cursor-pointer'
              )}
            >
              <Ticket className="h-4 w-4" />
              <span>{tMy('browseEvents') || 'Explore More Events'}</span>
            </Link>
          </div>
        </div>

        {/* Interactive Pass Wallet Explorer */}
        <PassWalletExplorer bookings={bookings} locale={locale} />
      </div>
    </div>
  );
}
