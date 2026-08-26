import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PassWalletExplorer, type BookingSummary } from '@/components/tickets/PassWalletExplorer';

const mockBookings: BookingSummary[] = [
  {
    id: 'bk-mfg-001',
    status: 'CONFIRMED',
    qrCodeHash: 'XPO-PASS-BK-MFG-001-A1B2C3D4E5F67890',
    attendeeName: 'Alex Pratama',
    attendeeEmail: 'alex@xpo.com',
    createdAt: new Date('2026-08-01T10:00:00Z'),
    ticketTier: {
      id: 'tier-vip',
      name: 'VIP Delegate Pass',
      price: 750000,
      currency: 'IDR',
    },
    event: {
      id: 'ev-mfg-2026',
      title: 'Manufacturing Indonesia 2026',
      slug: 'manufacturing-indonesia-2026',
      startDate: new Date(Date.now() + 86400000 * 3), // 3 days in future
      endDate: new Date(Date.now() + 86400000 * 5),
      venue: {
        name: 'JIExpo Kemayoran',
        city: 'Central Jakarta',
        region: { code: 'ID', name: 'Indonesia' },
      },
      venueHall: {
        name: 'Hall A3',
      },
    },
  },
  {
    id: 'bk-ai-002',
    status: 'CHECKED_IN',
    qrCodeHash: 'XPO-PASS-BK-AI-002-9876543210FEDCBA',
    attendeeName: 'Yuki Tanaka',
    attendeeEmail: 'yuki@xpo.com',
    createdAt: new Date('2026-07-15T08:00:00Z'),
    ticketTier: {
      id: 'tier-std',
      name: 'Standard Visitor Pass',
      price: 5000,
      currency: 'JPY',
    },
    event: {
      id: 'ev-ai-2025',
      title: 'Tokyo AI Summit 2025',
      slug: 'tokyo-ai-summit-2025',
      startDate: new Date('2025-11-10T09:00:00Z'), // Past
      endDate: new Date('2025-11-12T18:00:00Z'),
      venue: {
        name: 'Tokyo Big Sight',
        city: 'Tokyo',
        region: { code: 'JP', name: 'Japan' },
      },
      venueHall: {
        name: 'East Hall 2',
      },
    },
  },
];

describe('PassWalletExplorer Component', () => {
  it('renders upcoming passes by default and displays temporal and spatial hall info', () => {
    render(<PassWalletExplorer bookings={mockBookings} locale="en" />);

    expect(screen.getByText('Upcoming Passes')).toBeInTheDocument();
    expect(screen.getByText('Past Expos')).toBeInTheDocument();

    // Upcoming pass should be visible
    expect(screen.getByText('Manufacturing Indonesia 2026')).toBeInTheDocument();
    expect(screen.getByText('JIExpo Kemayoran')).toBeInTheDocument();
    expect(screen.getByText('Hall A3')).toBeInTheDocument();

    // Past pass should NOT be visible on upcoming tab
    expect(screen.queryByText('Tokyo AI Summit 2025')).not.toBeInTheDocument();
  });

  it('switches to Past Expos tab and shows past concluded passes', () => {
    render(<PassWalletExplorer bookings={mockBookings} locale="en" />);

    const pastTab = screen.getByRole('button', { name: /past expos/i });
    fireEvent.click(pastTab);

    expect(screen.getByText('Tokyo AI Summit 2025')).toBeInTheDocument();
    expect(screen.getByText('Tokyo Big Sight')).toBeInTheDocument();
    expect(screen.getByText('East Hall 2')).toBeInTheDocument();
    expect(screen.queryByText('Manufacturing Indonesia 2026')).not.toBeInTheDocument();
  });

  it('filters passes by region pill', () => {
    render(<PassWalletExplorer bookings={mockBookings} locale="en" />);

    // Switch to All tab first
    const allTab = screen.getByRole('button', { name: /all \(\d+\)/i });
    fireEvent.click(allTab);

    expect(screen.getByText('Manufacturing Indonesia 2026')).toBeInTheDocument();
    expect(screen.getByText('Tokyo AI Summit 2025')).toBeInTheDocument();

    // Filter by Japan (JP)
    const jpBtn = screen.getByRole('button', { name: /japan \(jp\)/i });
    fireEvent.click(jpBtn);

    expect(screen.getByText('Tokyo AI Summit 2025')).toBeInTheDocument();
    expect(screen.queryByText('Manufacturing Indonesia 2026')).not.toBeInTheDocument();
  });

  it('filters passes by keyword search query', () => {
    render(<PassWalletExplorer bookings={mockBookings} locale="en" />);

    // Switch to All tab
    const allTab = screen.getByRole('button', { name: /all \(\d+\)/i });
    fireEvent.click(allTab);

    const searchInput = screen.getByRole('textbox', { name: /search passes/i });
    fireEvent.change(searchInput, { target: { value: 'Hall A3' } });

    expect(screen.getByText('Manufacturing Indonesia 2026')).toBeInTheDocument();
    expect(screen.queryByText('Tokyo AI Summit 2025')).not.toBeInTheDocument();
  });
});
