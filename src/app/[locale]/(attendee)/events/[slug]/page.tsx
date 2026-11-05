import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { type MiceArchetype, isValidArchetype } from "@/lib/theming";
import { EventPageShell } from "@/components/themed/EventPageShell";
import { parseShowcase } from "@/lib/showcase";
import { resolvePageSize } from "@/lib/discovery/presentation";
import { EventOrganizerSection } from "@/components/discovery/EventOrganizerSection";
import { generateEventJsonLd } from "@/lib/seo/jsonLd";
import { siteBaseUrl } from "@/lib/seo/site";


import {
  IndustrialB2BView,
  TechDevSummitView,
  MedicalSymposiumView,
  FinanceInvestorView,
  PopCultureGamingView,
  MusicFestivalView,
  MegaExpoPavilionView,
  GovernmentDiplomaticView,
  IncentiveRetreatView,
  AutomotiveMobilityView,
  EnergyInfrastructureView,
  AgritechFoodView,
  HospitalityTourismView,
  EducationEdTechView,
  FashionRetailView,
  BuildingPropTechView,
  AerospaceDefenseView,
  SupplyChainLogisticsView,
  FranchiseLicensingView,
  FaithPilgrimageCongressView,
  SportsOutdoorView,
  MediaBroadcastView,
} from "@/components/themed/archetypes";

interface EventPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// Map every archetype 1-to-1 to its dedicated specialized view
const ARCHETYPE_VIEW_MAP: Record<MiceArchetype, React.ComponentType<any>> = {
  INDUSTRIAL_B2B: IndustrialB2BView,
  TECH_DEV_SUMMIT: TechDevSummitView,
  MEDICAL_SYMPOSIUM: MedicalSymposiumView,
  FINANCE_INVESTOR: FinanceInvestorView,
  POP_CULTURE_GAMING: PopCultureGamingView,
  MUSIC_FESTIVAL: MusicFestivalView,
  MEGA_EXPO_PAVILION: MegaExpoPavilionView,
  GOVERNMENT_DIPLOMATIC: GovernmentDiplomaticView,
  INCENTIVE_RETREAT: IncentiveRetreatView,
  AUTOMOTIVE_MOBILITY: AutomotiveMobilityView,
  ENERGY_INFRASTRUCTURE: EnergyInfrastructureView,
  AGRITECH_FOOD: AgritechFoodView,
  HOSPITALITY_TOURISM: HospitalityTourismView,
  EDUCATION_EDTECH: EducationEdTechView,
  FASHION_RETAIL: FashionRetailView,
  BUILDING_PROPTECH: BuildingPropTechView,
  AEROSPACE_DEFENSE: AerospaceDefenseView,
  SUPPLY_CHAIN_LOGISTICS: SupplyChainLogisticsView,
  FRANCHISE_LICENSING: FranchiseLicensingView,
  FAITH_PILGRIMAGE_CONGRESS: FaithPilgrimageCongressView,
  SPORTS_OUTDOOR: SportsOutdoorView,
  MEDIA_BROADCAST: MediaBroadcastView,
};

export async function generateMetadata({ params }: EventPageProps) {
  const { locale, slug } = await params;
  const base = siteBaseUrl();
  try {
    const event = await db.event.findUnique({
      where: { slug },
      select: {
        title: true,
        tagline: true,
        description: true,
        heroImageUrl: true,
        venue: { select: { city: true } },
      },
    });
    if (event) {
      const description = event.tagline || event.description;
      const url = `/${locale}/events/${slug}`;
      return {
        title: `${event.title} | XPO MICE Ecosystem`,
        description,
        alternates: { canonical: `${base}${url}` },
        openGraph: {
          type: "website",
          url,
          title: event.title,
          description,
          ...(event.heroImageUrl ? { images: [{ url: event.heroImageUrl }] } : {}),
        },
        twitter: {
          card: "summary_large_image",
          title: event.title,
          description,
          ...(event.heroImageUrl ? { images: [event.heroImageUrl] } : {}),
        },
      };
    }
  } catch {
    // Fallback if DB unavailable
  }

  return {
    title: "Event Details | XPO MICE Ecosystem",
    description: "Discover upcoming conventions, trade exhibitions, and international summits.",
  };
}

export async function generateStaticParams() {
  try {
    const events = await db.event.findMany({
      select: { slug: true },
    });
    if (events.length > 0) {
      return events.map((e) => ({ slug: e.slug }));
    }
  } catch {
    // Fallback static slugs
  }

  return [
    { slug: "manufacturing-indonesia-2026" },
    { slug: "asia-ai-summit-2026" },
    { slug: "pekan-raya-jakarta-2026" },
  ];
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let event = null;
  try {
    event = await db.event.findUnique({
      where: { slug },
      include: {
        venue: {
          include: {
            region: true,
          },
        },
        venueHall: true,
        ticketTiers: {
          orderBy: { price: "asc" },
        },
        agendaItems: {
          orderBy: { startTime: "asc" },
        },
        booths: {
          orderBy: { companyName: "asc" },
        },
        perks: true,
        organizer: true,
      },
    });
  } catch {
    event = null;
  }

  if (!event) {
    notFound();
  }

  let newsUpdates: Array<{ id: string; title: string; body: string; approvedAt: string | null }> = [];
  try {
    const rows = await db.eventUpdate.findMany({
      where: { eventId: event.id, status: "APPROVED" },
      orderBy: { approvedAt: "desc" },
      select: { id: true, title: true, body: true, approvedAt: true },
    });
    newsUpdates = rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      approvedAt: r.approvedAt ? r.approvedAt.toISOString() : null,
    }));
  } catch {
    newsUpdates = [];
  }

  const safeArchetype: MiceArchetype = isValidArchetype(event.archetype)
    ? event.archetype
    : "INDUSTRIAL_B2B";

  const ArchetypeView = ARCHETYPE_VIEW_MAP[safeArchetype] || IndustrialB2BView;

  // Find lowest price tier
  const minTicketPrice =
    event.ticketTiers.length > 0
      ? Math.min(...event.ticketTiers.map((t) => t.price))
      : 0;

  const defaultCurrency = event.ticketTiers[0]?.currency || event.venue?.region?.currency || "IDR";

  // Organizer-authored showcase: absent data keeps showcase sections hidden.
  const showcase = parseShowcase((event as any).showcaseJson);

  const eventJsonLd = generateEventJsonLd(
    {
      title: event.title,
      slug: event.slug,
      description: event.description,
      archetype: event.archetype,
      startDate: event.startDate,
      endDate: event.endDate,
      format: event.format,
      heroImageUrl: event.heroImageUrl,
      venue: event.venue
        ? {
            name: event.venue.name,
            city: event.venue.city,
            address: event.venue.address,
            regionId: event.venue.region?.code ?? event.venue.regionId,
          }
        : null,
      organizer: event.organizer
        ? {
            name: event.organizer.name,
            organization: event.organizer.organization,
          }
        : event.organizerName
          ? { name: event.organizerName }
          : null,
      ticketTiers: (event.ticketTiers || []).map((tier) => ({
        name: tier.name,
        price: tier.price,
        currency: tier.currency,
        capacity: tier.capacity,
      })),
    },
    siteBaseUrl()
  );

  // Presentation tier: explicit human choice, else venue suggestion, else LARGE.
  // Nothing auto-shrinks: without a recorded choice the full page renders.
  const resolvedPageSize = resolvePageSize({
    eventTier: (event as { pageSize?: string | null }).pageSize ?? null,
    venueSize: (event.venue as { size?: string | null } | null)?.size ?? null,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <EventPageShell
      id={event.id}
      title={event.title}
      slug={event.slug}
      tagline={event.tagline}
      description={event.description}
      archetype={safeArchetype}
      startDate={event.startDate}
      endDate={event.endDate}
      venue={{
        id: event.venue.id,
        name: event.venue.name,
        slug: event.venue.slug,
        city: event.venue.city,
        address: event.venue.address,
        hallName: event.venueHall?.name,
      }}
      heroImageUrl={event.heroImageUrl}
      brandingConfigJson={event.brandingConfigJson}
      scale={event.scale}
      format={event.format}
      isFeatured={event.isFeatured}
      minTicketPrice={minTicketPrice}
      currency={defaultCurrency}
      locale={locale}
      ticketTiers={event.ticketTiers || []}
      agendaItems={event.agendaItems || []}
      booths={event.booths || []}
      showcaseAlerts={showcase.alerts}
      isListingOnly={event.isListingOnly}
      externalUrl={event.externalUrl}
      newsUpdates={newsUpdates}
      pageSize={resolvedPageSize}
    >
      <ArchetypeView event={event} locale={locale} pageSize={resolvedPageSize} />
      <EventOrganizerSection event={event} locale={locale} />
      </EventPageShell>
    </>
  );
}


