import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BannerCarousel } from '@/components/discovery/BannerCarousel';
import { type BannerSlide } from '@/types/discovery';

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
  it('T1.1: renders first slide with title, tagline, and countdown timer for upcoming event', () => {
    render(<BannerCarousel slides={mockSlides} locale="en" />);

    expect(screen.getByText('Manufacturing Indonesia Expo 2026')).toBeInTheDocument();
    expect(screen.getByText('Leading automation and heavy machinery trade show')).toBeInTheDocument();
    expect(screen.getByText(/Starts in:/i)).toBeInTheDocument();
  });

  it('T1.2: navigates to next slide on clicking next button', () => {
    render(<BannerCarousel slides={mockSlides} locale="en" />);

    const nextBtn = screen.getByLabelText('Next slide');
    fireEvent.click(nextBtn);

    expect(screen.getByText('Asia AI & Cloud Developer Summit 2026')).toBeInTheDocument();
  });

  it('T1.3: navigates to previous slide on clicking prev button with wrap-around', () => {
    render(<BannerCarousel slides={mockSlides} locale="en" />);

    const prevBtn = screen.getByLabelText('Previous slide');
    fireEvent.click(prevBtn);

    expect(screen.getByText('Asia AI & Cloud Developer Summit 2026')).toBeInTheDocument();
  });

  it('T1.4: responds to keyboard ArrowRight and ArrowLeft key navigation', () => {
    render(<BannerCarousel slides={mockSlides} locale="en" />);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('Asia AI & Cloud Developer Summit 2026')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText('Manufacturing Indonesia Expo 2026')).toBeInTheDocument();
  });

  it('T1.5: supports touch swipe gestures for mobile navigation', () => {
    const { container } = render(<BannerCarousel slides={mockSlides} locale="en" />);
    const carousel = container.firstChild as HTMLElement;

    // Simulate left swipe (swipe forward)
    fireEvent.touchStart(carousel, { targetTouches: [{ clientX: 200 }] });
    fireEvent.touchMove(carousel, { targetTouches: [{ clientX: 100 }] });
    fireEvent.touchEnd(carousel);

    expect(screen.getByText('Asia AI & Cloud Developer Summit 2026')).toBeInTheDocument();
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

    expect(screen.getByText('Pekan Raya Jakarta 2025 (Concluded)')).toBeInTheDocument();
    expect(screen.getByText('Event Concluded')).toBeInTheDocument();
    expect(screen.getByText('This event has concluded. Pass registration is closed.')).toBeInTheDocument();
    expect(screen.getByText('View Event Recap')).toBeInTheDocument();
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

    expect(screen.getByText('Tokyo Robotics Live Championship 2026')).toBeInTheDocument();
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
    expect(screen.getByText('Manufacturing Indonesia Expo 2026')).toBeInTheDocument();

    fireEvent.mouseLeave(carousel);
    expect(screen.getByText('Manufacturing Indonesia Expo 2026')).toBeInTheDocument();
  });
});
