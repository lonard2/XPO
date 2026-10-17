import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VenueMeetingRooms } from '@/components/discovery/VenueMeetingRooms';

const rooms = [
  { id: 'r1', name: 'Garuda 1', capacity: 48, floorAreaSqm: 120, description: 'Breakout.' },
  { id: 'r2', name: 'Garuda 2', capacity: 72, floorAreaSqm: 126, description: 'Breakout.' },
];

describe('VenueMeetingRooms', () => {
  it('renders nothing when there are no meeting rooms', () => {
    const { container } = render(<VenueMeetingRooms rooms={[]} title="Meeting Rooms" />);

    expect(container.firstChild).toBeNull();
  });

  it('starts collapsed behind the toggle and expands on click', () => {
    render(<VenueMeetingRooms rooms={rooms} title="Meeting Rooms" />);

    const toggle = screen.getByRole('button', { name: /Meeting Rooms \(2\)/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Garuda 1')).toBeNull();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Garuda 1')).toBeInTheDocument();
    expect(screen.getByText('Garuda 2')).toBeInTheDocument();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Garuda 1')).toBeNull();
  });

  it('shows capacity and area for each room once expanded', () => {
    render(<VenueMeetingRooms rooms={rooms} title="Meeting Rooms" />);
    fireEvent.click(screen.getByRole('button', { name: /Meeting Rooms \(2\)/ }));

    expect(screen.getByText('48 pax')).toBeInTheDocument();
    expect(screen.getByText('120 m²')).toBeInTheDocument();
  });
});
