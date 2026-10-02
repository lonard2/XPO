import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EventTableView } from '@/components/discovery/EventTableView';
import { FALLBACK_EVENTS } from '@/lib/discovery/fallbackData';

describe('Discovery Component: EventTableView', () => {
  it('T1.1: renders semantic table with all major MICE column headers', () => {
    render(<EventTableView events={FALLBACK_EVENTS} locale="en" />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Exhibition & Vertical')).toBeInTheDocument();
    expect(screen.getByText('Spatial Hall & City')).toBeInTheDocument();
    expect(screen.getByText('Timeline & Dates')).toBeInTheDocument();
    expect(screen.getByText('Format & Scale')).toBeInTheDocument();
    expect(screen.getByText('Pass Entry')).toBeInTheDocument();
  });

  it('T1.2: renders event rows with venue hall, archetype badge, and link', () => {
    render(<EventTableView events={FALLBACK_EVENTS} locale="en" />);

    // Check specific event title
    expect(
      screen.getByText('Manufacturing Indonesia & Industrial Automation Expo 2026')
    ).toBeInTheDocument();

    // Check venue presence
    expect(
      screen.getAllByText(/JIExpo Kemayoran/i).length
    ).toBeGreaterThan(0);

    // Check Pass Entry pricing
    expect(
      screen.getAllByText(/Free Trade Pass|From IDR|From JPY|From USD/i).length
    ).toBeGreaterThan(0);

    // Check action links
    const actionLinks = screen.getAllByRole('link', { name: /view pass/i });
    expect(actionLinks.length).toBe(FALLBACK_EVENTS.length);
  });

  it('T1.3 (Boundary): returns null when events array is empty', () => {
    const { container } = render(<EventTableView events={[]} locale="en" />);
    expect(container.firstChild).toBeNull();
  });
});
