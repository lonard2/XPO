import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Breadcrumbs, BreadcrumbJsonLd } from '@/components/layout/Breadcrumbs';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { resolveEventCallerFromCookies } from '@/lib/auth/eventOwnership';
import { allowDemoAuth } from '@/lib/auth/sessionStore';
import {
  Ticket,
  ArrowLeft,
  CalendarDays,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PassWalletExplorer, type BookingSummary } from '@/components/tickets/PassWalletExplorer';
import { MeetingRatingControl } from '@/components/tickets/MeetingRatingControl';
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
  const tOrg = await getTranslations({ locale, namespace: 'organizer' });
  const crumbs = [
    { label: tCom('home') || 'Home', href: `/${locale}` },
    { label: tMy('breadcrumbWallet') || 'Pass Wallet', href: `/${locale}/my-tickets` },
  ];

  const cookieStore = await cookies();
  const caller = await resolveEventCallerFromCookies(cookieStore);
  const isAdminView = caller.role === 'ADMIN';
  const showDemoPreview = !caller.userId && allowDemoAuth();

  let bookings: BookingSummary[] = [];
  let myRequests: Array<{
    id: string;
    type: string;
    status: string;
    target: string;
    scheduledAt: Date | null;
    location: string;
    outcome: string;
    rating: number | null;
    createdAt: Date;
    event: { title: string; slug: string };
  }> = [];
  try {
    const rawBookings = await db.booking.findMany({
      // Holders see only their own passes; admins see the platform.
      where: caller.userId && !isAdminView ? { userId: caller.userId } : {},
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

  // The delegate's own meeting lifecycle, matched by account or by the email
  // they submitted with. Anonymous visitors see none of this.
  if (caller.userId) {
    try {
      const identity: Array<Record<string, unknown>> = [{ requesterId: caller.userId }];
      if (caller.email) identity.push({ requesterEmail: caller.email });
      myRequests = await db.meetingRequest.findMany({
        where: { OR: identity },
        include: { event: { select: { title: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        take: 25,
      });
    } catch {
      myRequests = [];
    }
  }

  // A labelled preview only for an anonymous visitor in demo mode. A signed-in
  // delegate with no passes sees the real empty state.
  if (bookings.length === 0 && showDemoPreview) {
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
            isDemoPreview: true,
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
      <Breadcrumbs
        variant="strip"
        className="-mt-6 sm:-mt-10 mb-6"
        listClassName="container"
        items={crumbs}
      />
      <BreadcrumbJsonLd items={crumbs} />

      <div className="container space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div className="space-y-1.5">
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
                'min-h-[44px] sm:min-h-[36px] gap-2 text-xs font-semibold shadow-xs cursor-pointer'
              )}
            >
              <Ticket className="h-4 w-4" />
              <span>{tMy('browseEvents') || 'Explore More Events'}</span>
            </Link>
          </div>
        </div>

        {/* Interactive Pass Wallet Explorer */}
        <PassWalletExplorer bookings={bookings} locale={locale} />

        {/* The delegate's own meeting requests, with the organizer's decision. */}
        {caller.userId && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              {tMy('myRequestsTitle') || 'My meeting requests'}
            </h2>
            {myRequests.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {tMy('myRequestsEmpty') || 'No meeting requests yet.'}
              </p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myRequests.map((request) => (
                  <li
                    key={request.id}
                    className="rounded-xl border border-border/80 bg-card p-4 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" size="sm" className="font-mono">
                        {request.type.replace(/_/g, ' ')}
                      </Badge>
                      <Badge
                        variant={
                          request.status === 'CONFIRMED'
                            ? 'success'
                            : request.status === 'DECLINED'
                              ? 'destructive'
                              : 'warning'
                        }
                        size="sm"
                      >
                        {request.status === 'CONFIRMED'
                          ? tOrg('meetingRequestStatusConfirmed')
                          : request.status === 'DECLINED'
                            ? tOrg('meetingRequestStatusDeclined')
                            : tOrg('meetingRequestStatusPending')}
                      </Badge>
                    </div>
                    <Link
                      href={`/${locale}/events/${request.event.slug}`}
                      className="block text-sm font-semibold text-foreground hover:text-primary hover:underline underline-offset-2"
                    >
                      {request.event.title}
                    </Link>
                    {request.target && (
                      <p className="text-xs text-muted-foreground">{request.target}</p>
                    )}
                    {(request.scheduledAt || request.location) && (
                      <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {[
                          request.scheduledAt
                            ? new Intl.DateTimeFormat(locale, {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              }).format(new Date(request.scheduledAt))
                            : null,
                          request.location || null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                    {request.status === 'CONFIRMED' && request.outcome === 'HELD' && (
                      <MeetingRatingControl requestId={request.id} initialRating={request.rating} />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
