import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  getArchetypeTokens,
  getArchetypeCssVariables,
  parseBrandingConfig,
  isValidArchetype,
  ALL_MICE_ARCHETYPES,
  ARCHETYPE_DEFAULTS,
  type MiceArchetype,
  type BrandingConfig,
} from '@/lib/theming';
import { EventPageShell } from '@/components/themed/EventPageShell';
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
} from '@/components/themed/archetypes';

describe('Empirical Challenge: Theming Engine & CSS Variable Injection Stress Suite', () => {
  describe('1. Theming Token Engine Resilience & Edge Cases', () => {
    it('falls back safely to INDUSTRIAL_B2B when given unknown, invalid, or corrupted archetypes', () => {
      const invalidArchetypes = [
        'UNKNOWN_ARCHETYPE',
        'tech_dev_summit', // lowercase
        'RANDOM_STRING_123',
        '',
        'null',
        'undefined',
        'INEXISTENT_MICE_CATEGORY',
      ];

      for (const invalid of invalidArchetypes) {
        expect(isValidArchetype(invalid)).toBe(false);
        const tokens = getArchetypeTokens(invalid as any);
        expect(tokens.displayName).toBe(ARCHETYPE_DEFAULTS.INDUSTRIAL_B2B.displayName);
        expect(tokens.primary).toBe(ARCHETYPE_DEFAULTS.INDUSTRIAL_B2B.primary);

        const cssVars = getArchetypeCssVariables(invalid as any);
        expect(cssVars['--archetype-primary']).toBe(ARCHETYPE_DEFAULTS.INDUSTRIAL_B2B.primary);
        expect(cssVars['--archetype-bg']).toBe(ARCHETYPE_DEFAULTS.INDUSTRIAL_B2B.background);
      }
    });

    it('handles all 9 recognized MICE archetypes with valid distinct color variables', () => {
      expect(ALL_MICE_ARCHETYPES).toHaveLength(9);

      for (const arch of ALL_MICE_ARCHETYPES) {
        expect(isValidArchetype(arch)).toBe(true);
        const tokens = getArchetypeTokens(arch);
        expect(tokens.primary).toBeTruthy();
        expect(tokens.accent).toBeTruthy();
        expect(tokens.background).toBeTruthy();
        expect(tokens.surface).toBeTruthy();
        expect(tokens.border).toBeTruthy();
        expect(tokens.fontFamily).toBeTruthy();

        const cssVars = getArchetypeCssVariables(arch);
        expect(cssVars['--archetype-primary']).toBe(tokens.primary);
        expect(cssVars['--archetype-accent']).toBe(tokens.accent);
        expect(cssVars['--archetype-bg']).toBe(tokens.background);
        expect(cssVars['--archetype-surface']).toBe(tokens.surface);
        expect(cssVars['--archetype-border']).toBe(tokens.border);
      }
    });

    it('safely merges branding overrides with custom colors and font overrides', () => {
      const overrides: BrandingConfig = {
        primaryColor: '#ff0055',
        accentColor: '#00ffaa',
        fontFamilyOverride: 'font-mono',
        heroBadge: 'Custom Gold Sponsor',
        bannerOverlayOpacity: 0.85,
      };

      const tokens = getArchetypeTokens('TECH_DEV_SUMMIT', overrides);
      expect(tokens.primary).toBe('#ff0055');
      expect(tokens.accent).toBe('#00ffaa');
      expect(tokens.fontFamily).toBe('font-mono');

      const cssVars = getArchetypeCssVariables('TECH_DEV_SUMMIT', overrides);
      expect(cssVars['--archetype-primary']).toBe('#ff0055');
      expect(cssVars['--archetype-accent']).toBe('#00ffaa');
    });

    it('ignores empty or whitespace-only color overrides', () => {
      const overrides: BrandingConfig = {
        primaryColor: '   ',
        accentColor: '',
        fontFamilyOverride: '  ',
      };

      const tokens = getArchetypeTokens('POP_CULTURE_GAMING', overrides);
      expect(tokens.primary).toBe(ARCHETYPE_DEFAULTS.POP_CULTURE_GAMING.primary);
      expect(tokens.accent).toBe(ARCHETYPE_DEFAULTS.POP_CULTURE_GAMING.accent);
      expect(tokens.fontFamily).toBe(ARCHETYPE_DEFAULTS.POP_CULTURE_GAMING.fontFamily);
    });
  });

  describe('2. Branding JSON Parser Stress', () => {
    it('safely parses valid and malformed JSON strings without throwing', () => {
      expect(parseBrandingConfig(null)).toEqual({});
      expect(parseBrandingConfig(undefined)).toEqual({});
      expect(parseBrandingConfig('')).toEqual({});
      expect(parseBrandingConfig('{ invalid json }')).toEqual({});
      expect(parseBrandingConfig('12345')).toEqual({});
      expect(parseBrandingConfig('"just a string"')).toEqual({});
      expect(parseBrandingConfig('true')).toEqual({});

      const validJson = JSON.stringify({
        primaryColor: '#123456',
        heroBadge: 'Official Partner',
        bannerOverlayOpacity: 0.5,
      });
      const parsed = parseBrandingConfig(validJson);
      expect(parsed.primaryColor).toBe('#123456');
      expect(parsed.heroBadge).toBe('Official Partner');
      expect(parsed.bannerOverlayOpacity).toBe(0.5);
    });
  });

  describe('3. EventPageShell Dynamic CSS Injection & Structure', () => {
    const defaultProps = {
      id: 'event-shell-test',
      title: 'Global Semiconductor & AI Summit 2026',
      slug: 'global-semiconductor-ai-summit-2026',
      tagline: 'The future of silicon architecture and neuromorphic chips',
      description: 'Comprehensive industry gathering of chip designers and foundries.',
      archetype: 'TECH_DEV_SUMMIT' as MiceArchetype,
      startDate: '2026-11-10T09:00:00Z',
      endDate: '2026-11-12T18:00:00Z',
      venue: {
        id: 'v-1',
        name: 'Tokyo Big Sight',
        slug: 'tokyo-big-sight',
        city: 'Tokyo',
        address: '3-11-1 Ariake, Koto City',
        hallName: 'East Exhibition Hall 1-3',
      },
      heroImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
      brandingConfigJson: JSON.stringify({
        primaryColor: '#7c3aed',
        accentColor: '#38bdf8',
        heroBadge: 'Diamond Host',
      }),
      scale: 'LARGE',
      format: 'IN_PERSON',
      isFeatured: true,
      minTicketPrice: 1500000,
      currency: 'IDR',
      locale: 'en',
    };

    it('injects dynamic CSS variables into style attribute of event root container', () => {
      const { container } = render(
        <EventPageShell {...defaultProps}>
          <div data-testid="child-content">Summit Agenda & Keynotes</div>
        </EventPageShell>
      );

      const root = container.querySelector('#event-page-root') as HTMLElement;
      expect(root).toBeInTheDocument();
      expect(root.style.getPropertyValue('--archetype-primary')).toBe('#7c3aed');
      expect(root.style.getPropertyValue('--archetype-accent')).toBe('#38bdf8');
      expect(root.style.getPropertyValue('--archetype-bg')).toBe(ARCHETYPE_DEFAULTS.TECH_DEV_SUMMIT.background);

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getAllByText('Global Semiconductor & AI Summit 2026').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Diamond Host')).toBeInTheDocument();
      expect(screen.getByText('Featured Event')).toBeInTheDocument();
    });

    it('renders free admission badge and handles missing tagline/heroImageUrl smoothly', () => {
      render(
        <EventPageShell
          {...defaultProps}
          tagline={null}
          heroImageUrl={null}
          brandingConfigJson={null}
          minTicketPrice={0}
          isFeatured={false}
        >
          <div>Free Event Content</div>
        </EventPageShell>
      );

      expect(screen.getAllByText('Free Admission')).toHaveLength(2); // One in hero strip, one in mobile drawer
    });
  });

  describe('4. Archetype Specialized Views Resilience Suite with Empty Arrays', () => {
    const mockEmptyEvent = {
      id: 'evt-arch-empty-test',
      title: 'Archetype Showcase Event',
      description: 'Testing specialized archetype view component rendering with empty lists.',
      scale: 'MEDIUM',
      format: 'IN_PERSON',
      startDate: new Date('2026-10-01T09:00:00Z'),
      endDate: new Date('2026-10-03T18:00:00Z'),
      venue: {
        name: 'ICE BSD City',
        city: 'Tangerang',
        address: 'Jl. BSD Grand Boulevard',
      },
      venueHall: null,
      ticketTiers: [],
      agendaItems: [],
      booths: [],
      perks: [],
    };

    it('renders IndustrialB2BView with empty tenders and booths', () => {
      render(<IndustrialB2BView event={mockEmptyEvent} locale="en" />);
      expect(screen.getByText(/Procurement, Heavy Machinery & B2B Matchmaking/i)).toBeInTheDocument();
      expect(screen.getByText(/Submit RFQ \/ Procurement Tender/i)).toBeInTheDocument();
    });

    it('renders TechDevSummitView with empty agenda schedule', () => {
      render(<TechDevSummitView event={mockEmptyEvent} locale="en" />);
      expect(screen.getByText(/Building Next-Generation Distributed Systems/i)).toBeInTheDocument();
      expect(screen.getByText(/48-Hour Autonomous Systems Hackathon/i)).toBeInTheDocument();
    });

    it('renders MedicalSymposiumView with empty abstracts', () => {
      render(<MedicalSymposiumView event={mockEmptyEvent} locale="en" />);
      expect(screen.getByText(/Advancing Evidence-Based Medicine/i)).toBeInTheDocument();
      expect(screen.getByText(/CME Credit Eligibility/i)).toBeInTheDocument();
    });

    it('renders FinanceInvestorView with empty pitch decks', () => {
      render(<FinanceInvestorView event={mockEmptyEvent} locale="en" />);
      expect(screen.getByText(/Capital Allocation, Deal Structuring & Liquidity Horizons/i)).toBeInTheDocument();
      expect(screen.getByText(/Chatham House Rule/i)).toBeInTheDocument();
    });

    it('renders PopCultureGamingView with empty schedules', () => {
      render(<PopCultureGamingView event={mockEmptyEvent} locale="en" />);
      expect(screen.getByText(/Esports Arena, Celebrity Meet & Greets & Merch Drops/i)).toBeInTheDocument();
      expect(screen.getByText(/Cosplay Security Guidelines/i)).toBeInTheDocument();
    });

    it('renders MusicFestivalView with empty live stage lineups', () => {
      render(<MusicFestivalView event={mockEmptyEvent} locale="en" />);
      expect(screen.getByText(/Immersive Audio-Visual Stages & Headliner Lineups/i)).toBeInTheDocument();
      expect(screen.getByText(/Stage Crowd Density/i)).toBeInTheDocument();
    });

    it('renders MegaExpoPavilionView with empty ticket tiers', () => {
      render(<MegaExpoPavilionView event={mockEmptyEvent} locale="en" />);
      expect(screen.getByText(/Multi-Pavilion Mega Fair, Nightly Fireworks & Flash Promos/i)).toBeInTheDocument();
      expect(screen.getByText(/Grand Arena Fireworks/i)).toBeInTheDocument();
    });

    it('renders GovernmentDiplomaticView with empty assembly schedules', () => {
      render(<GovernmentDiplomaticView event={mockEmptyEvent} locale="en" />);
      expect(screen.getByText(/Bilateral Accords, Climate Compacts & Sovereign Dialogue/i)).toBeInTheDocument();
      expect(screen.getByText(/Diplomatic Protocol & Security Briefing/i)).toBeInTheDocument();
    });

    it('renders IncentiveRetreatView with empty ticket packages', () => {
      render(<IncentiveRetreatView event={mockEmptyEvent} locale="en" />);
      expect(screen.getByText(/Curated Horizon Retreat, Private Excursions & Gala Banquets/i)).toBeInTheDocument();
      expect(screen.getByText(/Private Airport Transfers/i)).toBeInTheDocument();
    });
  });
});
