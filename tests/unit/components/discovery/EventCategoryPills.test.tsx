import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EventCategoryPills, EVENT_CATEGORIES } from '@/components/discovery/EventCategoryPills';

describe('EventCategoryPills', () => {
  it('renders all 9 MICE domain category options', () => {
    render(<EventCategoryPills locale="en" />);

    expect(screen.getByText('Explore by Event Category')).toBeDefined();
    expect(screen.getByText('Industrial & B2B Trade')).toBeDefined();
    expect(screen.getByText('Tech, AI & Developer')).toBeDefined();
    expect(screen.getByText('Medical & Healthcare')).toBeDefined();
    expect(screen.getByText('Finance & FinTech')).toBeDefined();
    expect(screen.getByText('Gaming & Pop Culture')).toBeDefined();
    expect(screen.getByText('Concerts & Festivals')).toBeDefined();
    expect(screen.getByText('Mega Expos & Fairs')).toBeDefined();
    expect(screen.getByText('Government & Policy')).toBeDefined();
    expect(screen.getByText('Luxury & Retreats')).toBeDefined();
  });

  it('triggers onSelectCategory callback when category pill is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <EventCategoryPills
        locale="en"
        onSelectCategory={handleSelect}
        activeCategoryId="TECH_DEV_SUMMIT"
      />
    );

    const techBtn = screen.getByText('Tech, AI & Developer');
    fireEvent.click(techBtn);

    expect(handleSelect).toHaveBeenCalledWith('TECH_DEV_SUMMIT');
  });
});
