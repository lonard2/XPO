import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VenueTransitHub } from '@/components/discovery/VenueTransitHub';

describe('VenueTransitHub Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders multi-modal transit information and venue address', () => {
    render(
      <VenueTransitHub
        venueName="JIExpo Kemayoran"
        address="Gedung Pusat Niaga, Arena JIExpo, Kemayoran"
        city="Jakarta Pusat"
        regionCode="ID"
        transitInfo="Direct access via Kemayoran Toll Gate and TransJakarta Halte JIExpo."
      />
    );

    expect(screen.getByText(/Getting to JIExpo Kemayoran/i)).toBeInTheDocument();
    expect(screen.getByText(/Direct access via Kemayoran Toll Gate/i)).toBeInTheDocument();
    expect(screen.getByText(/Subway & Train/i)).toBeInTheDocument();
    expect(screen.getByText(/Express Shuttles/i)).toBeInTheDocument();
    expect(screen.getByText(/Vehicle & Gates/i)).toBeInTheDocument();
    expect(screen.getByText(/Airport Direct/i)).toBeInTheDocument();
  });

  it('handles 1-click address copy button interaction', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <VenueTransitHub
        venueName="Tokyo Big Sight"
        address="3-11-1 Ariake, Koto-ku"
        city="Tokyo"
        regionCode="JP"
      />
    );

    const copyBtn = screen.getByRole('button', { name: /copy venue address/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith('Tokyo Big Sight, 3-11-1 Ariake, Koto-ku, Tokyo');
    expect(screen.getByText(/Address Copied/i)).toBeInTheDocument();
  });

  it('renders navigation map launcher links', () => {
    render(
      <VenueTransitHub
        venueName="ICE BSD City"
        address="Jl. BSD Grand Boulevard No.1"
        city="Tangerang"
        regionCode="ID"
      />
    );

    const googleLink = screen.getByRole('link', { name: /google maps/i });
    const appleLink = screen.getByRole('link', { name: /apple maps/i });
    const wazeLink = screen.getByRole('link', { name: /waze/i });

    expect(googleLink).toHaveAttribute('href', expect.stringContaining('google.com/maps'));
    expect(appleLink).toHaveAttribute('href', expect.stringContaining('maps.apple.com'));
    expect(wazeLink).toHaveAttribute('href', expect.stringContaining('waze.com'));
  });
});
