import Link from 'next/link';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import {
  Compass,
  Building2,
  Ticket,
  Sparkles,
  Layers,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Tablet,
  Laptop,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { BannerCarousel } from '@/components/discovery/BannerCarousel';
import { VenueSpotlightSection } from '@/components/discovery/VenueSpotlightSection';
import { EventCard } from '@/components/discovery/EventCard';
import { ALL_MICE_ARCHETYPES, ARCHETYPE_DEFAULTS } from '@/lib/theming';
import { FALLBACK_BANNER_SLIDES, FALLBACK_EVENTS, FALLBACK_VENUES } from '@/lib/discovery/fallbackData';
import { type BannerSlide, type DiscoveryEvent, type VenueSummary } from '@/types/discovery';

export interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetch live data from Prisma with graceful fallback
  let bannerSlides: BannerSlide[] = FALLBACK_BANNER_SLIDES;
  let spotlightVenues: VenueSummary[] = FALLBACK_VENUES;
  let featuredEvents: DiscoveryEvent[] = FALLBACK_EVENTS;

  try {
    const dbEvents = await db.event.findMany({
      where: { isFeatured: true },
      include: {
        venue: {
          include: {
            halls: true,
            region: true,
          },
        },
        venueHall: true,
        region: true,
        ticketTiers: true,
      },
      orderBy: { startDate: 'asc' },
      take: 6,
    });

    if (dbEvents.length > 0) {
      featuredEvents = dbEvents as unknown as DiscoveryEvent[];
      bannerSlides = dbEvents.map((evt) => {
        const lowestTier = evt.ticketTiers?.sort((a, b) => a.price - b.price)[0];
        return {
          id: evt.id,
          title: evt.title,
          tagline: evt.tagline,
          slug: evt.slug,
          heroImageUrl: evt.heroImageUrl,
          archetype: evt.archetype,
          startDate: evt.startDate,
          endDate: evt.endDate,
          venueName: evt.venue?.name,
          cityName: evt.venue?.city,
          regionCode: evt.region?.code || 'ID',
          format: evt.format,
          scale: evt.scale,
          minPrice: lowestTier?.price ?? 0,
          currency: lowestTier?.currency || 'IDR',
          isFeatured: evt.isFeatured,
        };
      });
    }

    const dbVenues = await db.venue.findMany({
      include: {
        halls: true,
        region: true,
      },
      orderBy: { name: 'asc' },
      take: 6,
    });

    if (dbVenues.length > 0) {
      spotlightVenues = dbVenues as unknown as VenueSummary[];
    }
  } catch {
    // Rely on pre-populated realistic fallback datasets
  }

  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-16">
      {/* 1. Hero Banner Carousel */}
      <section className="container px-4 pt-4 sm:pt-6">
        <BannerCarousel slides={bannerSlides} locale={locale} />
      </section>

      {/* 2. Fast Regional Portal Jump & Category Chips */}
      <section className="container px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Globe className="h-4 w-4 text-primary shrink-0" />
            <span>Regional Localization Hubs:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/${locale}/region/id`}>
              <Badge variant="outline" className="hover:border-primary cursor-pointer transition-colors py-1.5 px-3 text-xs">
                Indonesia (JIExpo, ICE BSD, JICC, NICE)
              </Badge>
            </Link>
            <Link href={`/${locale}/region/jp`}>
              <Badge variant="outline" className="hover:border-primary cursor-pointer transition-colors py-1.5 px-3 text-xs">
                Japan (Tokyo Big Sight, Makuhari)
              </Badge>
            </Link>
            <Link href={`/${locale}/region/global`}>
              <Badge variant="outline" className="hover:border-primary cursor-pointer transition-colors py-1.5 px-3 text-xs">
                Global (MBS Singapore, Frankfurt)
              </Badge>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Featured MICE Exhibitions Grid */}
      <section className="container px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Featured & High-Priority Exhibitions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Scheduled International Trade Expos & Summits
            </h2>
          </div>

          <Link href={`/${locale}/events`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <span>View All Events</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} locale={locale} />
          ))}
        </div>
      </section>

      {/* 4. 9-Archetype Domain Taxonomy Navigation */}
      <section className="container px-4 space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
            <Layers className="h-3.5 w-3.5" />
            <span>9 Specialized MICE Domains</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Explore Events by Industry Archetype
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Tailored layout view engines, dedicated deal-rooms, and specialized agendas for every MICE vertical.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_MICE_ARCHETYPES.map((archKey) => {
            const archetype = ARCHETYPE_DEFAULTS[archKey];
            return (
              <Link
                key={archKey}
                href={`/${locale}/events?archetype=${archKey}`}
                className="group flex items-start gap-3.5 rounded-2xl border border-border/80 bg-card p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `${archetype.primary}18`, color: archetype.primary }}
                >
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {archetype.displayName}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {archetype.tagline}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. World-Class Venue Spotlights */}
      <section className="container px-4">
        <VenueSpotlightSection venues={spotlightVenues} locale={locale} />
      </section>

      {/* 6. Multi-Sided Multi-Portal Architecture Showcase */}
      <section className="container px-4 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Multi-Sided Platform Architecture
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Engineered with dedicated portals tailored for every participant in the MICE lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Attendee Portal */}
          <Card interactive className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-2">
                <Compass className="h-6 w-6" />
              </div>
              <CardTitle>Attendee Experience</CardTitle>
              <CardDescription>
                Discover regional expos, reserve tiered tickets, access interactive digital guidebooks, and consult the AI concierge.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground pt-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>9 Domain MICE Archetype Layouts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Instant SVG QR Digital Passes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Hall Floor Maps & Day-of Treats</span>
              </div>
            </CardContent>
          </Card>

          {/* Organizer Command Center */}
          <Card interactive className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-2">
                <Layers className="h-6 w-6" />
              </div>
              <CardTitle>Organizer Command</CardTitle>
              <CardDescription>
                Event creation wizard, real-time live visual customizer, booth/tenant roster, and QR check-in scanner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground pt-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Live Split-Screen Customizer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Multi-Model AI Intelligence Suite</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Door Staff QR Check-in Simulation</span>
              </div>
            </CardContent>
          </Card>

          {/* Admin & Governance */}
          <Card interactive className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle>Admin Governance</CardTitle>
              <CardDescription>
                Global venue directory with exact hall indexing, automated venue event scrapers, and platform audit logs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground pt-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Exact Venue & Hall Seeding</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Simulated Ingestion Pipeline</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Role-Based Access Control (RBAC)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 7. Multi-Model OpenRouter AI Intelligence Banner */}
      <section className="container px-4">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-primary font-bold text-sm">
              <Cpu className="h-5 w-5" />
              <span>Multi-Model OpenRouter AI Intelligence</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              Equipped with 6 cutting-edge LLMs for real-time concierge, executive analytics, and foot-traffic optimization:
              <span className="block mt-1 font-mono text-[11px] text-foreground/80">
                Gemini 3.5 Flash-Lite • Gemini 3.7 Flash • DeepSeek v4 Pro • Qwen 3.7 Plus • GPT-5.6 Luna • Gemma 4 26B
              </span>
            </p>
          </div>
          <Link href={`/${locale}/settings`}>
            <Button variant="outline" className="whitespace-nowrap gap-2 text-xs">
              <span>Configure AI Settings</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
