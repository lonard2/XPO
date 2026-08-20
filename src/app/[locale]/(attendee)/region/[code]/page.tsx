import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  MapPin,
  Building2,
  Calendar,
  Ticket,
  Train,
  Compass,
  Coins,
  Clock,
  ArrowRight,
  Sparkles,
  Globe,
  Layers,
  ArrowLeft,
  Navigation,
  CheckCircle2,
} from "lucide-react";
import { db } from "@/lib/db";
import {
  formatCurrency,
  formatDateRange,
  getTimeZoneForRegion,
  getCurrencyForRegion,
  SupportedCurrency,
} from "@/lib/i18n/formatters";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { RegionSwitcher } from "@/components/layout/RegionSwitcher";

interface VenueHallModel {
  id: string;
  name: string;
  capacity: number | null;
  floorAreaSqm: number | null;
  description: string | null;
}

interface VenueModel {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string;
  transitInfo: string;
  imageUrl: string | null;
  halls?: VenueHallModel[];
}

interface TicketTierModel {
  id: string;
  name: string;
  price: number;
  currency: string;
}

interface EventModel {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string;
  archetype: string;
  startDate: Date;
  endDate: Date;
  scale: string;
  format: string;
  venue?: VenueModel | null;
  ticketTiers?: TicketTierModel[];
}

interface RegionPageProps {
  params: Promise<{
    locale: string;
    code: string;
  }>;
}

const VALID_REGIONS = ["id", "jp", "global"] as const;

export function generateStaticParams() {
  return VALID_REGIONS.map((code) => ({ code }));
}

export async function generateMetadata({ params }: RegionPageProps) {
  const { code } = await params;
  const normalizedCode = (code || "").toLowerCase();
  const regionNames: Record<string, string> = {
    id: "Indonesia Hub (JIExpo, ICE BSD, JICC)",
    jp: "Japan Hub (Tokyo Big Sight, Makuhari)",
    global: "Global Hubs (Marina Bay Sands, Frankfurt)",
  };
  const name = regionNames[normalizedCode] || "Regional Hub";
  return {
    title: `${name} | XPO MICE Ecosystem`,
    description: `Explore top MICE venues, transit guides, and upcoming international trade exhibitions in ${name}.`,
  };
}

export default async function RegionalHubPage({ params }: RegionPageProps) {
  const { locale, code } = await params;
  const normalizedCode = (code || "").toLowerCase();

  if (!VALID_REGIONS.includes(normalizedCode as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations("regions");
  const tCommon = await getTranslations("common");

  const timezone = getTimeZoneForRegion(normalizedCode);
  const defaultCurrency = getCurrencyForRegion(normalizedCode);

  // Fetch Region, Venues and Events from Prisma
  let regionData = null;
  try {
    regionData = await db.region.findUnique({
      where: { id: normalizedCode },
      include: {
        venues: {
          include: {
            halls: true,
          },
          orderBy: { name: "asc" },
        },
        events: {
          include: {
            venue: true,
            ticketTiers: true,
          },
          orderBy: { startDate: "asc" },
        },
      },
    });
  } catch {
    // Graceful fallback for non-database runtime contexts
    regionData = null;
  }

  // Fallback metadata if region is not yet in database
  const fallbackRegions: Record<string, {
    name: string;
    code: string;
    description: string;
    currency: SupportedCurrency;
    transitSummary: string;
    transitSteps: { title: string; desc: string }[];
  }> = {
    id: {
      name: "Indonesia",
      code: "ID",
      description: "Southeast Asia's powerhouse for industrial manufacturing expos, B2B procurement summits, mega consumer fairs, and premier convention complexes.",
      currency: "IDR",
      transitSummary: "Direct connectivity via MRT Jakarta, KRL Commuter Line, TransJakarta bus rapid transit corridors, and exhibition express shuttles.",
      transitSteps: [
        { title: "MRT Jakarta & KRL Commuter", desc: "Istora Mandiri & Senayan stations for JICC/GBK; Rajawali & Kemayoran stations for JIExpo; Rawa Buntu & Cisauk for ICE BSD." },
        { title: "TransJakarta BRT Corridors", desc: "Dedicated express bus lanes directly servicing JIExpo (Corridor 2C, 12M) and Senayan (Corridor 1, 9)." },
        { title: "Airport & Dedicated Shuttles", desc: "Soekarno-Hatta International Airport (CGK) direct tollway links (30-45 mins) and free BSD Link shuttles." },
      ],
    },
    jp: {
      name: "Japan",
      code: "JP",
      description: "Global epicenter for robotics, developer summits, anime & gaming expos, clean tech congresses, and precision engineering trade fairs.",
      currency: "JPY",
      transitSummary: "World-class rail access via Yurikamome Line, Rinkai Line, JR Keiyo Line, and Tokyo Bay water bus terminals.",
      transitSteps: [
        { title: "Yurikamome & Rinkai Lines", desc: "Direct 3-minute walkway from Tokyo Big Sight Station (Yurikamome) and 7-minute walk from Kokusai-Tenjijo Station (Rinkai Line)." },
        { title: "JR Keiyo Line & Shinkansen Links", desc: "Direct access from Tokyo Station to Kaihimmakuhari Station (Makuhari Messe) in 30 minutes." },
        { title: "Tokyo Bay Water Bus", desc: "Scenic water shuttle connection between Hinode Pier and Tokyo Big Sight Ariake Terminal." },
      ],
    },
    global: {
      name: "Global Hubs",
      code: "GL",
      description: "Flagship international convention complexes hosting premier global congresses, financial assemblies, and international trade summits.",
      currency: "USD",
      transitSummary: "International airport express networks, downtown metro linkages, and high-speed rail direct terminals.",
      transitSteps: [
        { title: "Direct Airport Rail Links", desc: "Express rail connections linking international terminals directly to exhibition basements." },
        { title: "Urban Metro & MRT Systems", desc: "Bayfront MRT station basement exit at Marina Bay Sands; S-Bahn Messe station at Messe Frankfurt." },
        { title: "Integrated Hospitality & Docks", desc: "On-site 5-star delegate hotels, direct taxi lanes, and integrated logistics freight docks." },
      ],
    },
  };

  const activeMeta = fallbackRegions[normalizedCode] || fallbackRegions.id;
  const venues: VenueModel[] = (regionData?.venues as VenueModel[]) || [];
  const events: EventModel[] = (regionData?.events as EventModel[]) || [];

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* Breadcrumb Bar */}
      <div className="border-b border-border bg-muted/30 py-3">
        <div className="container flex items-center gap-2 text-xs text-muted-foreground px-4">
          <Link href={`/${locale}`} className="hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{tCommon("back")}</span>
          </Link>
          <span>/</span>
          <span>{t("title")}</span>
          <span>/</span>
          <span className="font-semibold text-foreground">{activeMeta.name}</span>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="container px-4">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="archetype" className="px-3 py-1 text-xs uppercase font-bold tracking-wider">
                  <Globe className="h-3 w-3 mr-1 inline" />
                  {activeMeta.code} Hub
                </Badge>
                <Badge variant="outline" className="text-xs bg-background/80">
                  <Coins className="h-3 w-3 mr-1 inline text-primary" />
                  {activeMeta.currency}
                </Badge>
                <Badge variant="outline" className="text-xs bg-background/80">
                  <Clock className="h-3 w-3 mr-1 inline text-primary" />
                  {timezone}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                {activeMeta.name} <span className="text-primary">MICE Ecosystem</span>
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {activeMeta.description}
              </p>

              {/* Quick Metrics */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>
                    <strong className="text-foreground font-semibold">
                      {venues.length > 0 ? venues.length : "6+"}
                    </strong>{" "}
                    {t("venueCount")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>
                    <strong className="text-foreground font-semibold">
                      {events.length > 0 ? events.length : "3+"}
                    </strong>{" "}
                    {t("eventCount")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Train className="h-4 w-4 text-primary" />
                  <span>Verified Rapid Transit</span>
                </div>
              </div>
            </div>

            {/* Quick Switcher Widget */}
            <div className="w-full lg:w-auto flex flex-col gap-2 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-primary" />
                <span>Switch Regional Hub</span>
              </span>
              <RegionSwitcher
                currentLocale={locale}
                activeRegionCode={normalizedCode}
                variant="pills"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Regional Venue Spotlights */}
      <section className="container px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
              <Building2 className="h-4 w-4" />
              <span>{t("venueSpotlights")}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Convention Complexes & Mega Exhibition Halls
            </h2>
          </div>
          <Link href={`/${locale}/venues`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <span>{tCommon("viewAll")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue: VenueModel) => {
            const totalCapacity = venue.halls?.reduce(
              (acc: number, h: VenueHallModel) => acc + (h.capacity || 0),
              0
            ) || 15000;

            return (
              <Card key={venue.id} interactive className="flex flex-col justify-between overflow-hidden group">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {venue.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                      {venue.city}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs pt-1 flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                    <span className="line-clamp-1">{venue.address}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3 text-xs text-muted-foreground">
                  {/* Halls Tag Preview */}
                  {venue.halls && venue.halls.length > 0 && (
                    <div className="space-y-1.5 rounded-lg bg-muted/40 p-2.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
                        <span className="flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5 text-primary" />
                          <span>Halls & Pavilions ({venue.halls.length})</span>
                        </span>
                        <span className="text-muted-foreground font-mono">
                          Cap: {totalCapacity.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {venue.halls.slice(0, 4).map((hall: VenueHallModel) => (
                          <span
                            key={hall.id}
                            className="inline-block rounded border border-border/60 bg-background px-1.5 py-0.5 text-[10px] text-foreground font-medium"
                          >
                            {hall.name}
                          </span>
                        ))}
                        {venue.halls.length > 4 && (
                          <span className="text-[10px] text-muted-foreground self-center">
                            +{venue.halls.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Transit Instructions */}
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-1 text-[11px]">
                      <Train className="h-3.5 w-3.5 text-primary" />
                      <span>{tCommon("transit")}</span>
                    </span>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {venue.transitInfo}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-0 border-t border-border/50 flex items-center justify-between bg-muted/10">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Verified Infrastructure
                  </span>
                  <Link href={`/${locale}/venues/${venue.slug}`}>
                    <Button size="sm" variant="ghost" className="gap-1 text-xs text-primary font-semibold hover:bg-primary/10">
                      <span>{t("viewVenue")}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Upcoming Regional Events */}
      <section className="container px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4" />
              <span>{t("upcomingEvents")}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Scheduled Conventions & Trade Assemblies
            </h2>
          </div>
          <Link href={`/${locale}/events`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <span>{tCommon("viewAll")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No events currently scheduled</h3>
            <p className="text-xs text-muted-foreground">Check back soon for new trade exhibitions in this region.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: EventModel) => {
              const lowestTier = event.ticketTiers?.sort((a: TicketTierModel, b: TicketTierModel) => a.price - b.price)[0];
              const priceText =
                lowestTier && lowestTier.price > 0
                  ? formatCurrency(lowestTier.price, lowestTier.currency as SupportedCurrency, locale)
                  : tCommon("free");

              const dateRangeText = formatDateRange(
                event.startDate,
                event.endDate,
                locale,
                timezone
              );

              return (
                <Card key={event.id} interactive className="flex flex-col justify-between overflow-hidden group">
                  <CardHeader className="p-5 pb-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="archetype" className="text-[10px] uppercase font-bold tracking-wide">
                        {event.archetype.replace(/_/g, " ")}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {event.format}
                      </Badge>
                    </div>

                    <CardTitle className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                      {event.title}
                    </CardTitle>

                    {event.tagline && (
                      <CardDescription className="text-xs line-clamp-2">
                        {event.tagline}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-2.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{dateRangeText}</span>
                    </div>

                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                        <span className="line-clamp-1">{event.venue.name}</span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="p-5 pt-3 border-t border-border/50 flex items-center justify-between bg-muted/10">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase">{tCommon("price")}</span>
                      <span className="text-sm font-bold text-foreground">{priceText}</span>
                    </div>

                    <Link href={`/${locale}/events/${event.slug}`}>
                      <Button size="sm" className="gap-1.5 text-xs font-semibold shadow-sm">
                        <Ticket className="h-3.5 w-3.5" />
                        <span>{t("bookNow")}</span>
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Transit & Logistics Guide */}
      <section className="container px-4">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 space-y-6 shadow-sm">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
              <Navigation className="h-3.5 w-3.5" />
              <span>{t("transitGuide")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Getting to {activeMeta.name} Convention Venues
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {activeMeta.transitSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {activeMeta.transitSteps.map((step, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border/70 bg-background p-5 space-y-2.5 shadow-sm"
              >
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{step.title}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
