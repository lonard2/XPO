import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EventCategoryPills } from '@/components/discovery/EventCategoryPills';

describe('EventCategoryPills', () => {
  it('renders all 15 MICE domain category options', () => {
    render(<EventCategoryPills locale="en" />);

    expect(screen.getByText('Explore by Event Category')).toBeDefined();
    expect(screen.getAllByText(/Industrial & Manufacturing/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tech, AI & Developer/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Medical & Healthcare/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Finance, FinTech & Investor/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pop Culture & Gaming/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Music Festival/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mega Expo & Multi-Pavilion/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Automotive, EV & Mobility/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Energy, Mining & Green/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Agriculture, Agritech & Food/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Hospitality, Tourism & Travel/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Education, EdTech & Academic/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Fashion, Beauty & Luxury/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Government & Diplomatic/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Corporate Incentive/i).length).toBeGreaterThan(0);
  });

  it('triggers onSelectCategory callback when category card is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <EventCategoryPills
        locale="en"
        onSelectCategory={handleSelect}
        activeCategoryId="TECH_DEV_SUMMIT"
      />
    );

    const techBtns = screen.getAllByText(/Tech, AI & Developer/i);
    fireEvent.click(techBtns[0]);

    expect(handleSelect).toHaveBeenCalledWith('TECH_DEV_SUMMIT');
  });
});
