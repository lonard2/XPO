/**
 * XPO Schema.org JSON-LD MICE Metadata Generator
 *
 * Produces structured data for search engine discovery, rich snippets,
 * event carousels, and local civic structure indexing adhering to Schema.org standards.
 */

export interface SeoEventInput {
  title: string;
  slug: string;
  description: string;
  archetype?: string;
  startDate: Date | string;
  endDate: Date | string;
  format?: "IN_PERSON" | "HYBRID" | "VIRTUAL" | string;
  heroImageUrl?: string | null;
  venue?: {
    name: string;
    city: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
    regionId?: string;
  } | null;
  organizer?: {
    name: string;
    organization?: string | null;
    email?: string;
    websiteUrl?: string | null;
  } | null;
  ticketTiers?: {
    name: string;
    price: number;
    currency: string;
    capacity?: number;
    benefitsJson?: string;
  }[];
}

export interface SeoVenueInput {
  name: string;
  slug: string;
  city: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  transitInfo?: string;
  imageUrl?: string | null;
  regionId?: string;
  halls?: {
    name: string;
    capacity?: number | null;
    floorAreaSqm?: number | null;
  }[];
}

export interface SeoBreadcrumbItem {
  name: string;
  url: string;
}

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://xpo.events";

/**
 * Maps MICE archetype to Schema.org Event Subtype.
 */
export function getEventTypeFromArchetype(archetype?: string): string {
  switch (archetype) {
    case "INDUSTRIAL_B2B":
    case "MEGA_EXPO_PAVILION":
      return "ExhibitionEvent";
    case "TECH_DEV_SUMMIT":
    case "FINANCE_INVESTOR":
    case "GOVERNMENT_DIPLOMATIC":
      return "BusinessEvent";
    case "MEDICAL_SYMPOSIUM":
      return "EducationEvent";
    case "MUSIC_FESTIVAL":
      return "MusicEvent";
    case "POP_CULTURE_GAMING":
    case "INCENTIVE_RETREAT":
    default:
      return "Event";
  }
}

/**
 * Maps Event Format to Schema.org EventAttendanceMode.
 */
export function getAttendanceMode(format?: string): string {
  switch (format) {
    case "VIRTUAL":
      return "https://schema.org/OnlineEventAttendanceMode";
    case "HYBRID":
      return "https://schema.org/MixedEventAttendanceMode";
    case "IN_PERSON":
    default:
      return "https://schema.org/OfflineEventAttendanceMode";
  }
}

/**
 * Generates Schema.org Event structured data JSON-LD.
 */
export function generateEventJsonLd(
  event: SeoEventInput,
  baseUrl: string = DEFAULT_BASE_URL
): Record<string, unknown> {
  const startIso = typeof event.startDate === "string" ? event.startDate : event.startDate.toISOString();
  const endIso = typeof event.endDate === "string" ? event.endDate : event.endDate.toISOString();
  const eventType = getEventTypeFromArchetype(event.archetype);
  const eventUrl = `${baseUrl}/events/${event.slug}`;

  // Location Schema
  let locationSchema: Record<string, unknown> = {
    "@type": "Place",
    name: event.venue?.name || "World-Class Convention Center",
    address: {
      "@type": "PostalAddress",
      streetAddress: event.venue?.address || "Convention Boulevard",
      addressLocality: event.venue?.city || "Jakarta",
      addressCountry: event.venue?.regionId?.toUpperCase() === "ID" ? "ID" : event.venue?.regionId?.toUpperCase() === "JP" ? "JP" : "GL",
    },
  };

  if (event.venue?.latitude && event.venue?.longitude) {
    locationSchema.geo = {
      "@type": "GeoCoordinates",
      latitude: event.venue.latitude,
      longitude: event.venue.longitude,
    };
  }

  // Organizer Schema
  const organizerSchema = {
    "@type": "Organization",
    name: event.organizer?.organization || event.organizer?.name || "XPO Event Federation",
    url: event.organizer?.websiteUrl || baseUrl,
  };

  // Offers (Ticket Tiers) Schema
  const offersSchema = (event.ticketTiers && event.ticketTiers.length > 0)
    ? event.ticketTiers.map((tier) => ({
        "@type": "Offer",
        name: tier.name,
        price: tier.price,
        priceCurrency: tier.currency || "IDR",
        availability: "https://schema.org/InStock",
        url: eventUrl,
        validFrom: new Date().toISOString().split("T")[0],
      }))
    : [
        {
          "@type": "Offer",
          name: "Standard Delegate Pass",
          price: 0,
          priceCurrency: "IDR",
          availability: "https://schema.org/InStock",
          url: eventUrl,
        },
      ];

  return {
    "@context": "https://schema.org",
    "@type": eventType,
    name: event.title,
    description: event.description,
    startDate: startIso,
    endDate: endIso,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: getAttendanceMode(event.format),
    location: locationSchema,
    organizer: organizerSchema,
    offers: offersSchema.length === 1 ? offersSchema[0] : offersSchema,
    image: event.heroImageUrl ? [event.heroImageUrl] : [`${baseUrl}/images/events/default-hero.jpg`],
    url: eventUrl,
  };
}

/**
 * Generates Schema.org CivicStructure / Place structured data JSON-LD.
 */
export function generatePlaceJsonLd(
  venue: SeoVenueInput,
  baseUrl: string = DEFAULT_BASE_URL
): Record<string, unknown> {
  const totalCapacity = (venue.halls || []).reduce((acc, h) => acc + (h.capacity || 0), 0);

  const placeJson: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CivicStructure",
    name: venue.name,
    description: venue.transitInfo || `Premier convention and exhibition complex in ${venue.city}.`,
    url: `${baseUrl}/venues/${venue.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.address,
      addressLocality: venue.city,
      addressCountry: venue.regionId?.toUpperCase() === "ID" ? "ID" : venue.regionId?.toUpperCase() === "JP" ? "JP" : "GL",
    },
  };

  if (venue.latitude && venue.longitude) {
    placeJson.geo = {
      "@type": "GeoCoordinates",
      latitude: venue.latitude,
      longitude: venue.longitude,
    };
    placeJson.hasMap = `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`;
  }

  if (totalCapacity > 0) {
    placeJson.maximumAttendeeCapacity = totalCapacity;
  }

  if (venue.imageUrl) {
    placeJson.image = venue.imageUrl;
  }

  if (venue.halls && venue.halls.length > 0) {
    placeJson.containsPlace = venue.halls.map((h) => ({
      "@type": "Room",
      name: h.name,
      maximumAttendeeCapacity: h.capacity || undefined,
    }));
  }

  return placeJson;
}

/**
 * Generates Schema.org BreadcrumbList structured data JSON-LD.
 */
export function generateBreadcrumbJsonLd(
  items: SeoBreadcrumbItem[],
  baseUrl: string = DEFAULT_BASE_URL
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url.startsWith("/") ? "" : "/"}${item.url}`,
    })),
  };
}

/**
 * Generates Schema.org WebSite structured data JSON-LD with Sitelinks Searchbox.
 */
export function generateMiceWebsiteJsonLd(
  baseUrl: string = DEFAULT_BASE_URL
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "XPO - MICE Digital Ecosystem",
    alternateName: "XPO Events",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/events?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
