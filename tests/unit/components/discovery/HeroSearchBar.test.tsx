import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroSearchBar } from '@/components/discovery/HeroSearchBar';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Discovery Component: HeroSearchBar (Homepage Search Cockpit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('T1.1: renders search input with placeholder, submit button, and quick tag suggestions', () => {
    render(<HeroSearchBar locale="en" regionCode="id" />);

    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Search exhibitions, summits, venues/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByText('Popular Searches:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Industrial B2B' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'JIExpo Kemayoran' })).toBeInTheDocument();
  });

  it('T1.2: navigates to /events with encoded query on form submit', () => {
    render(<HeroSearchBar locale="en" regionCode="id" />);

    const input = screen.getByPlaceholderText(/Search exhibitions, summits, venues/i);
    fireEvent.change(input, { target: { value: 'Robotics Summit' } });

    const submitBtn = screen.getByRole('button', { name: /search/i });
    fireEvent.click(submitBtn);

    expect(mockPush).toHaveBeenCalledWith('/en/events?keyword=Robotics%20Summit');
  });

  it('T1.3: clicking a quick suggestion tag navigates directly to filtered events', () => {
    render(<HeroSearchBar locale="en" regionCode="id" />);

    const tag = screen.getByRole('button', { name: 'Industrial B2B' });
    fireEvent.click(tag);

    expect(mockPush).toHaveBeenCalledWith('/en/events?archetype=INDUSTRIAL_B2B');
  });

  it('T1.4: displays clear button when input is non-empty and clears value when clicked', () => {
    render(<HeroSearchBar locale="en" regionCode="id" />);

    const input = screen.getByPlaceholderText(/Search exhibitions, summits, venues/i);
    expect(screen.queryByLabelText(/clear/i)).toBeNull();

    fireEvent.change(input, { target: { value: 'Medical' } });
    const clearBtn = screen.getByLabelText(/clear/i);
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(input).toHaveValue('');
  });

  it('T1.5: switches regional suggestions based on regionCode prop', () => {
    const { rerender } = render(<HeroSearchBar locale="ja" regionCode="jp" />);

    expect(screen.getByRole('button', { name: 'Tokyo Big Sight' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gaming & Anime' })).toBeInTheDocument();

    rerender(<HeroSearchBar locale="en" regionCode="global" />);
    expect(screen.getByRole('button', { name: 'Marina Bay Sands' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Financial Forum' })).toBeInTheDocument();
  });

  it('T1.6: focuses search input on pressing "/" key when not active in input', () => {
    render(<HeroSearchBar locale="en" regionCode="id" />);

    const input = screen.getByPlaceholderText(/Search exhibitions, summits, venues/i);
    expect(document.activeElement).not.toBe(input);

    fireEvent.keyDown(window, { key: '/' });
    expect(document.activeElement).toBe(input);
  });
});
