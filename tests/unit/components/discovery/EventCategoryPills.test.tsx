import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EventCategoryPills } from '@/components/discovery/EventCategoryPills';

describe('EventCategoryPills', () => {
  it('renders all 15 MICE domain category options', () => {
    render(<EventCategoryPills locale="en" />);

    expect(screen.getByText('Explore by Event Category')).toBeDefined();
    expect(screen.getByText(/Industrial & Manufacturing B2B/i)).toBeDefined();
    expect(screen.getByText(/Tech, AI & Developer/i)).toBeDefined();
    expect(screen.getByText(/Medical & Healthcare/i)).toBeDefined();
    expect(screen.getByText(/Finance, FinTech & VC/i)).toBeDefined();
    expect(screen.getByText(/Pop Culture, Gaming/i)).toBeDefined();
    expect(screen.getByText(/Music Festivals/i)).toBeDefined();
    expect(screen.getByText(/Mega Expos & Multi-Pavilion/i)).toBeDefined();
    expect(screen.getByText(/Automotive, EV & Mobility/i)).toBeDefined();
    expect(screen.getByText(/Energy, Mining & Green/i)).toBeDefined();
    expect(screen.getByText(/Agriculture, Agritech & Food/i)).toBeDefined();
    expect(screen.getByText(/Hospitality, Tourism & Travel/i)).toBeDefined();
    expect(screen.getByText(/Education, EdTech & Academic/i)).toBeDefined();
    expect(screen.getByText(/Fashion, Beauty & Luxury/i)).toBeDefined();
    expect(screen.getByText(/Government & Diplomatic/i)).toBeDefined();
    expect(screen.getByText(/Incentives & Luxury/i)).toBeDefined();
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

    const techBtn = screen.getByText(/Tech, AI & Developer/i);
    fireEvent.click(techBtn);

    expect(handleSelect).toHaveBeenCalledWith('TECH_DEV_SUMMIT');
  });
});
