import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EventCard } from '@/components/discovery/EventCard';
import { getReadableArchetypeLabel } from '@/lib/theming';
import { type DiscoveryEvent } from '@/types/discovery';

const mockEvent: DiscoveryEvent = {
  id: 'test-event-1',
  title: 'Indonesia Industrial Machinery Expo 2026',
  slug: 'indonesia-machinery-expo-2026',
  tagline: 'Premier heavy robotics and CNC exhibition',
  description: 'Full description of the industrial event with high-speed milling showcases.',
  archetype: 'INDUSTRIAL_B2B',
  startDate: new Date('2026-09-14T09:00:00Z'),
  endDate: new Date('2026-09-17T18:00:00Z'),
  isFeatured: true,
  heroImageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
  scale: 'LARGE',
  format: 'IN_PERSON',
  regionId: 'id',
  region: { id: 'id', code: 'ID', name: 'Indonesia', currency: 'IDR' },
  venueId: 'venue-jiexpo',
  venue: {
    id: 'venue-jiexpo',
    name: 'JIExpo Kemayoran',
    slug: 'jiexpo-kemayoran',
    city: 'Central Jakarta',
    address: 'Arena JIExpo, Jakarta Pusat',
    transitInfo: 'TransJakarta Corridor 2C',
  },
  venueHall: {
    id: 'hall-a1',
    name: 'Hall A1',
  },
  ticketTiers: [
    { id: 'tier-1', name: 'Trade Visitor Pass', price: 0, currency: 'IDR' },
    { id: 'tier-2', name: 'VIP Buyer Pass', price: 450000, currency: 'IDR' },
  ],
};

describe('Discovery Component: EventCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('T1.1: renders event title, tagline, venue details, and archetype badge', () => {
    render(<EventCard event={mockEvent} locale="en" />);

    expect(screen.getByText('Indonesia Industrial Machinery Expo 2026')).toBeInTheDocument();
    expect(screen.getByText('Premier heavy robotics and CNC exhibition')).toBeInTheDocument();
    expect(screen.getByText('JIExpo Kemayoran')).toBeInTheDocument();
    expect(screen.getByText(/Central Jakarta/)).toBeInTheDocument();
    expect(screen.getByText('Industrial & Manufacturing')).toBeInTheDocument();
  });

  it('T1.2: displays featured badge when event is marked as isFeatured', () => {
    render(<EventCard event={mockEvent} locale="en" />);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('T1.3: formats free admission properly when lowest ticket price is 0', () => {
    render(<EventCard event={mockEvent} locale="en" />);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('T1.4: formats monetary currency price when lowest ticket price is greater than 0', () => {
    const paidEvent: DiscoveryEvent = {
      ...mockEvent,
      ticketTiers: [
        { id: 'tier-paid', name: 'Standard Pass', price: 250000, currency: 'IDR' },
      ],
    };

    render(<EventCard event={paidEvent} locale="en" />);
    expect(screen.getByText(/IDR|Rp/)).toBeInTheDocument();
    expect(screen.getByText(/250/)).toBeInTheDocument();
  });

  it('T1.5: contains deep-link button pointing to event detail slug', () => {
    render(<EventCard event={mockEvent} locale="en" />);
    const link = screen.getByRole('link', { name: /view pass/i });
    expect(link).toHaveAttribute('href', '/en/events/indonesia-machinery-expo-2026');
  });

  it('T2.1 (Boundary): renders fallback visual gradient when heroImageUrl is null', () => {
    const noImageEvent: DiscoveryEvent = {
      ...mockEvent,
      heroImageUrl: null,
    };

    const { container } = render(<EventCard event={noImageEvent} locale="en" />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('Indonesia Industrial Machinery Expo 2026')).toBeInTheDocument();
  });

  it('T2.2 (Boundary): handles empty ticket tiers gracefully by displaying Admission Free', () => {
    const noTiersEvent: DiscoveryEvent = {
      ...mockEvent,
      ticketTiers: [],
    };

    render(<EventCard event={noTiersEvent} locale="en" />);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('T3.1: renders the archetype label in body metadata with a readable category tone', () => {
    const energyEvent: DiscoveryEvent = {
      ...mockEvent,
      archetype: 'ENERGY_INFRASTRUCTURE',
    };

    render(<EventCard event={energyEvent} locale="en" />);
    const energyLabel = screen.getByText(/energy/i);
    // Derived tone, not the raw token: #d97706 only reaches ~3.9:1 on a
    // light card, so the label carries the darkened theme tone per mode.
    const expected = getReadableArchetypeLabel('#d97706');
    expect(energyLabel.style.getPropertyValue('--archetype-label')).toBe(expected.light);
    expect(energyLabel.style.getPropertyValue('--archetype-label-dark')).toBe(expected.dark);
  });
});


describe("EventCard price disclosure", () => {
  const withTiers = (tiers: Array<{ price: number }>) =>
    ({
      ...mockEvent,
      startDate: new Date(Date.now() + 86400000 * 20),
      endDate: new Date(Date.now() + 86400000 * 22),
      ticketTiers: tiers.map((t, i) => ({
        id: `t${i}`,
        name: i === 0 ? "Trade Visitor" : "VIP",
        price: t.price,
        currency: "IDR",
        capacity: 100,
        benefitsJson: "[]",
      })),
    } as unknown as DiscoveryEvent);

  it("names the paid floor beside a free trade pass", () => {
    render(<EventCard event={withTiers([{ price: 0 }, { price: 450000 }])} locale="en" />);

    expect(screen.getByText(/Free/i)).toBeDefined();
    expect(screen.getByText(/VIP from/i)).toBeDefined();
    expect(screen.getByText(/450/)).toBeDefined();
  });

  it("stays quiet when every tier is free", () => {
    render(<EventCard event={withTiers([{ price: 0 }, { price: 0 }])} locale="en" />);

    expect(screen.queryByText(/VIP from/i)).toBeNull();
  });
});

describe('Discovery Component: EventCard listing-only', () => {
  it('badges an external listing and sends the CTA off platform', () => {
    render(
      <EventCard
        event={{
          ...mockEvent,
          isListingOnly: true,
          externalUrl: 'https://organizer.example/event',
        }}
        locale="en"
      />
    );

    expect(screen.getByText('External listing')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Visit official listing/i });
    expect(link).toHaveAttribute('href', 'https://organizer.example/event');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('labels the listing and drops the pass CTA when no URL is set', () => {
    render(<EventCard event={{ ...mockEvent, isListingOnly: true }} locale="en" />);

    expect(screen.getAllByText('External listing').length).toBeGreaterThan(0);
    expect(screen.queryByText('View Pass')).toBeNull();
  });
});
