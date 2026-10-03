import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EventCategoryPills } from '@/components/discovery/EventCategoryPills';

describe('EventCategoryPills', () => {
  it('renders all 22 MICE domain category options by default in cluster groups', () => {
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
    expect(screen.getAllByText(/Building, Architecture & PropTech/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Aerospace, Aviation & Defense/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Supply Chain, Logistics & Packaging/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Franchise, Retail & SME Business/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Faith, Pilgrimage & Community/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Sports, Fitness & Outdoor Adventure/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Media, Broadcast & Pro-AV/i).length).toBeGreaterThan(0);
  });

  it('renders the 6 industry cluster tabs with accessible tablist attributes', () => {
    render(<EventCategoryPills locale="en" />);

    const tablist = screen.getByRole('tablist', { name: /Filter MICE categories by industry cluster/i });
    expect(tablist).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(7); // "All Categories" + 6 industry clusters

    const allTab = tabs[0];
    expect(allTab).toHaveAttribute('aria-selected', 'true');
    expect(allTab).toHaveTextContent(/All Categories/i);
    expect(allTab).toHaveTextContent('22');

    expect(screen.getByRole('tab', { name: /Heavy Industry/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Digital & Tech/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Enterprise & Trade/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Sovereign & Defense/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Health & Faith/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Culture & Sports/i })).toBeInTheDocument();
  });

  it('displays the cluster short label in the top-right tag of category cards', () => {
    render(<EventCategoryPills locale="en" />);

    const heavyIndustryTags = screen.getAllByText('Heavy Industry');
    expect(heavyIndustryTags.length).toBeGreaterThan(0);

    const digitalTechTags = screen.getAllByText('Digital & Tech');
    expect(digitalTechTags.length).toBeGreaterThan(0);
  });

  it('filters displayed categories when a specific cluster tab is clicked', () => {
    render(<EventCategoryPills locale="en" />);

    const sovereignTab = screen.getByRole('tab', { name: /Sovereign & Defense/i });
    fireEvent.click(sovereignTab);

    expect(sovereignTab).toHaveAttribute('aria-selected', 'true');

    // Should display Sovereign & Defense categories
    expect(screen.getByText(/Government & Diplomatic Summits/i)).toBeInTheDocument();
    expect(screen.getByText(/Aerospace, Aviation & Defense/i)).toBeInTheDocument();

    // Should NOT display unrelated categories like Medical or Gaming
    expect(screen.queryByText(/Medical, Healthcare & Scientific/i)).toBeNull();
    expect(screen.queryByText(/Pop Culture, Comic Con & Gaming/i)).toBeNull();
  });

  it('restores all 22 categories when Show All button is clicked', () => {
    render(<EventCategoryPills locale="en" />);

    // Filter to Digital & Tech
    const techTab = screen.getByRole('tab', { name: /Digital & Tech/i });
    fireEvent.click(techTab);

    expect(screen.queryByText(/Medical, Healthcare & Scientific/i)).toBeNull();

    // Reset via "Show All (22)" button
    const showAllBtns = screen.getAllByRole('button', { name: /Show All \(22\)/i });
    fireEvent.click(showAllBtns[0]);

    // All categories should be back in the DOM
    expect(screen.getAllByText(/Medical & Healthcare/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pop Culture & Gaming/i).length).toBeGreaterThan(0);
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
