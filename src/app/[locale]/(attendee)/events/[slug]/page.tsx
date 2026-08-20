import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { type MiceArchetype, isValidArchetype } from "@/lib/theming";
import { EventPageShell } from "@/components/themed/EventPageShell";
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
} from "@/components/themed/archetypes";

interface EventPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// Map archetypes to component views
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
};

export async function generateMetadata({ params }: EventPageProps) {
  const { slug } = await params;
  try {
    const event = await db.event.findUnique({
      where: { slug },
      select: { title: true, tagline: true, description: true },
    });
    if (event) {
      return {
        title: `${event.title} | XPO MICE Ecosystem`,
        description: event.tagline || event.description,
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

  return (
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
      ticketTiers={event.ticketTiers}
    >
      <ArchetypeView event={event} locale={locale} />
    </EventPageShell>
  );
}
