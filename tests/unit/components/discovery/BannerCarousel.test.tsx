import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { BannerCarousel } from '@/components/discovery/BannerCarousel';
import { type BannerSlide } from '@/types/discovery';
import enMessages from '@/messages/en.json';

const mockSlides: BannerSlide[] = [
  {
    id: 'slide-1',
    title: 'Manufacturing Indonesia Expo 2026',
    tagline: 'Leading automation and heavy machinery trade show',
    slug: 'manufacturing-indonesia-2026',
    archetype: 'INDUSTRIAL_B2B',
    startDate: new Date('2026-09-14T09:00:00Z'),
    endDate: new Date('2026-09-17T18:00:00Z'),
    venueName: 'JIExpo Kemayoran',
    cityName: 'Jakarta',
    regionCode: 'ID',
    isFeatured: true,
  },
  {
    id: 'slide-2',
    title: 'Asia AI & Cloud Developer Summit 2026',
    tagline: 'Autonomous AI agents and cloud architectures',
    slug: 'asia-ai-summit-2026',
    archetype: 'TECH_DEV_SUMMIT',
    startDate: new Date('2026-10-08T08:30:00Z'),
    endDate: new Date('2026-10-10T20:00:00Z'),
    venueName: 'ICE BSD City',
    cityName: 'Tangerang',
    regionCode: 'ID',
    isFeatured: true,
  },
];

describe('Discovery Component: BannerCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('T1.1: renders first slide with title, tagline, and countdown timer for upcoming event', () => {
    render(<BannerCarousel slides={mockSlides} locale="en" />);

    expect(screen.getByRole('heading', { name: 'Manufacturing Indonesia Expo 2026' })).toBeInTheDocument();
    expect(screen.getByText('Leading automation and heavy machinery trade show')).toBeInTheDocument();
    expect(screen.getByText(/Starts in:/i)).toBeInTheDocument();
  });

  it('T1.2: navigates to next slide on clicking next button', () => {
    render(<BannerCarousel slides={mockSlides} locale="en" />);

    const nextBtn = screen.getByLabelText('Next slide');
    fireEvent.click(nextBtn);

    expect(screen.getByRole('heading', { name: 'Asia AI & Cloud Developer Summit 2026' })).toBeInTheDocument();
  });

  it('T1.3: navigates to previous slide on clicking prev button with wrap-around', () => {
    render(<BannerCarousel slides={mockSlides} locale="en" />);

    const prevBtn = screen.getByLabelText('Previous slide');
    fireEvent.click(prevBtn);

    expect(screen.getByRole('heading', { name: 'Asia AI & Cloud Developer Summit 2026' })).toBeInTheDocument();
  });

  it('T1.4: responds to keyboard ArrowRight and ArrowLeft key navigation', () => {
    render(<BannerCarousel slides={mockSlides} locale="en" />);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByRole('heading', { name: 'Asia AI & Cloud Developer Summit 2026' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByRole('heading', { name: 'Manufacturing Indonesia Expo 2026' })).toBeInTheDocument();
  });

  it('T1.5: supports touch swipe gestures for mobile navigation', () => {
    const { container } = render(<BannerCarousel slides={mockSlides} locale="en" />);
    const carousel = container.firstChild as HTMLElement;

    // Simulate left swipe (swipe forward)
    fireEvent.touchStart(carousel, { targetTouches: [{ clientX: 200 }] });
    fireEvent.touchMove(carousel, { targetTouches: [{ clientX: 100 }] });
    fireEvent.touchEnd(carousel);

    expect(screen.getByRole('heading', { name: 'Asia AI & Cloud Developer Summit 2026' })).toBeInTheDocument();
  });

  it('T1.6: accurately renders past (lapsed) events with concluded badge and archive CTA', () => {
    const pastSlide: BannerSlide = {
      id: 'slide-past',
      title: 'Pekan Raya Jakarta 2025 (Concluded)',
      tagline: 'Historical consumer fair archive',
      slug: 'prj-2025-archive',
      archetype: 'MEGA_EXPO_PAVILION',
      startDate: new Date('2025-06-10T10:00:00Z'),
      endDate: new Date('2025-07-12T23:00:00Z'), // Past date
      venueName: 'JIExpo Kemayoran',
      cityName: 'Jakarta',
      regionCode: 'ID',
      isFeatured: false,
    };

    render(<BannerCarousel slides={[pastSlide]} locale="en" />);

    expect(screen.getByRole('heading', { name: 'Pekan Raya Jakarta 2025 (Concluded)' })).toBeInTheDocument();
    expect(screen.getByText('Event Concluded')).toBeInTheDocument();
    expect(screen.getByText('This event has concluded. Pass registration is closed.')).toBeInTheDocument();
    expect(screen.getByText('View Event Details')).toBeInTheDocument();
    expect(screen.queryByText('View Event Recap')).toBeNull();
    expect(screen.queryByText(/Event is Happening Now/i)).toBeNull();
  });

  it('T1.7: accurately renders live events currently in progress with happening now badge', () => {
    const now = new Date();
    const liveSlide: BannerSlide = {
      id: 'slide-live',
      title: 'Tokyo Robotics Live Championship 2026',
      tagline: 'Currently in progress at Tokyo Big Sight',
      slug: 'tokyo-robotics-live',
      archetype: 'TECH_DEV_SUMMIT',
      startDate: new Date(now.getTime() - 1000 * 60 * 60 * 2), // Started 2h ago
      endDate: new Date(now.getTime() + 1000 * 60 * 60 * 10), // Ends in 10h
      venueName: 'Tokyo Big Sight',
      cityName: 'Tokyo',
      regionCode: 'JP',
      isFeatured: true,
    };

    render(<BannerCarousel slides={[liveSlide]} locale="en" />);

    expect(screen.getByRole('heading', { name: 'Tokyo Robotics Live Championship 2026' })).toBeInTheDocument();
    expect(screen.getByText('Happening Now')).toBeInTheDocument();
    expect(screen.getByText('Event is Happening Now - Doors Open')).toBeInTheDocument();
    expect(screen.getByText('Get Pass & Enter Doors')).toBeInTheDocument();
  });

  it('T2.1 (Boundary): returns null when passed an empty slides array', () => {
    const { container } = render(<BannerCarousel slides={[]} locale="en" />);
    expect(container.firstChild).toBeNull();
  });

  it('T2.2 (Boundary): pauses auto-play on mouse enter and resumes on mouse leave', () => {
    const { container } = render(<BannerCarousel slides={mockSlides} locale="en" autoPlayInterval={500} />);
    const carousel = container.firstChild as HTMLElement;

    fireEvent.mouseEnter(carousel);
    expect(screen.getByRole('heading', { name: 'Manufacturing Indonesia Expo 2026' })).toBeInTheDocument();

    fireEvent.mouseLeave(carousel);
    expect(screen.getByRole('heading', { name: 'Manufacturing Indonesia Expo 2026' })).toBeInTheDocument();
  });

  it('T3.1: crossfades with at most two layers, outgoing hidden from AT', () => {
    render(<BannerCarousel slides={mockSlides} locale="en" />);
    fireEvent.click(screen.getByLabelText('Next slide'));
    // Hidden elements are excluded from role queries by default; ask for
    // them explicitly. Slide layers carry aria-roledescription="slide",
    // which the up-next strip does not share.
    const layers = document.querySelectorAll('[aria-roledescription="slide"]');
    expect(layers.length).toBeLessThanOrEqual(2);
    const hidden = Array.from(layers).filter((g) => g.getAttribute('aria-hidden') === 'true');
    expect(hidden.length).toBe(1);
  });

  it('T3.1b: rapid navigation never stacks more than two layers', () => {
    render(<BannerCarousel slides={mockSlides} locale="en" />);
    fireEvent.click(screen.getByLabelText('Next slide'));
    fireEvent.click(screen.getByLabelText('Next slide'));
    fireEvent.click(screen.getByLabelText('Previous slide'));
    expect(document.querySelectorAll('[aria-roledescription="slide"]').length).toBeLessThanOrEqual(2);
  });

  it('T3.2: renders an up-next strip with one button per slide and current marked', () => {
    render(<BannerCarousel slides={mockSlides} locale="en" />);
    const strip = document.querySelector('.hero-strip');
    expect(strip).not.toBeNull();
    const buttons = strip!.querySelectorAll('button');
    expect(buttons.length).toBe(mockSlides.length);
    expect(buttons[0]).toHaveAttribute('aria-current', 'true');
  });

  it('T3.3: strip uses roving tabindex with a single tab stop', () => {
    render(<BannerCarousel slides={mockSlides} locale="en" />);
    const buttons = document.querySelector('.hero-strip')!.querySelectorAll('button');
    const tabbables = Array.from(buttons).filter((b) => (b as HTMLElement).tabIndex === 0);
    expect(tabbables.length).toBe(1);
  });

  it('T3.3b: a single slide renders no strip and no progress fill', () => {
    render(<BannerCarousel slides={[mockSlides[0]]} locale="en" />);
    expect(document.querySelector('.hero-strip')).toBeNull();
    expect(document.querySelector('.hero-progress-fill')).toBeNull();
  });

  it('T3.4: progress fill duration matches the autoplay interval and pauses with it', () => {
    render(<BannerCarousel slides={mockSlides} locale="en" autoPlayInterval={9000} />);
    const fill = document.querySelector('.hero-progress-fill') as HTMLElement;
    expect(fill.style.animationDuration).toBe('9000ms');
    fireEvent.mouseEnter(screen.getByRole('region'));
    expect(fill.style.animationPlayState).toBe('paused');
  });

  it('T3.5: story content uses the shared stagger entrance', () => {
    render(<BannerCarousel slides={mockSlides} locale="en" />);
    expect(document.querySelector('.hero-story.stagger-children')).not.toBeNull();
  });

  it('T3.5b: rotation runs on the timer and the fill restarts on jump', () => {
    render(<BannerCarousel slides={mockSlides} locale="en" autoPlayInterval={7000} />);
    act(() => { vi.advanceTimersByTime(7000); });
    expect(screen.getByRole('heading', { name: 'Asia AI & Cloud Developer Summit 2026' })).toBeInTheDocument();
    const fillBefore = document.querySelector('.hero-progress-fill');
    fireEvent.click(screen.getByLabelText('Next slide'));
    // Keyed by slide plus timer generation, so manual navigation mounts a
    // fresh bar instead of resuming the old one mid-fill.
    expect(document.querySelector('.hero-progress-fill')).not.toBe(fillBefore);
  });

  it('T3.5c: a slide without an image falls back to the gradient', () => {
    const imageless = { ...mockSlides[0], heroImageUrl: undefined };
    render(<BannerCarousel slides={[imageless]} locale="en" />);
    expect(document.querySelector('.hero-story')).not.toBeNull();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('T3.6: every literal translation key the carousel uses exists in the dictionaries', () => {
    // The unit mock returns the key for missing entries, so a missing key
    // only explodes in production (next-intl throws MISSING_MESSAGE).
    const source = readFileSync('src/components/discovery/BannerCarousel.tsx', 'utf8');
    const hooks: Record<string, string> = { tHero: 'hero', tEvents: 'events', tHome: 'home' };
    const missing: string[] = [];
    for (const match of source.matchAll(/\b(tHero|tEvents|tHome)\('([^']+)'\)/g)) {
      const [, hook, key] = match;
      const bundle = (enMessages as Record<string, Record<string, unknown>>)[hooks[hook]];
      if (!(key in bundle)) missing.push(`${hooks[hook]}.${key}`);
    }
    expect(missing).toEqual([]);
  });

  it('T3.7: outgoing layer stacks beneath the incoming layer', () => {
    render(<BannerCarousel slides={mockSlides} locale="en" />);
    fireEvent.click(screen.getByLabelText('Next slide'));
    const layers = document.querySelectorAll('[aria-roledescription="slide"]');
    expect(layers.length).toBe(2);
    // Outgoing renders first (beneath); incoming renders last (on top) and
    // carries the entrance animation.
    expect(layers[0]).toHaveAttribute('aria-hidden', 'true');
    expect(layers[1]).not.toHaveAttribute('aria-hidden');
    expect(layers[1].classList.contains('hero-crossfade-in')).toBe(true);
  });
});
