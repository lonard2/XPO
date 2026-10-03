import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { EventCategoryPills } from '@/components/discovery/EventCategoryPills';

describe('EventCategoryPills', () => {
  it('renders all 22 MICE domain category options by default in cluster groups', () => {
    render(<EventCategoryPills locale="en" />);

    expect(screen.getByText('Explore by Event Category')).toBeDefined();
    expect(screen.getAllByText(/Industrial & Manufacturing/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Technology, AI & Consumer Electronics/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Medical & Healthcare/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Finance, FinTech & Investor/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pop Culture & Gaming/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Music, Stage & Performing Arts/i).length).toBeGreaterThan(0);
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

  it('renders interactive directional navigation affordances on category cards', () => {
    const { container } = render(<EventCategoryPills locale="en" />);

    // ArrowUpRight icons rendered across category cards
    const arrowIcons = container.querySelectorAll('svg.lucide-arrow-up-right');
    expect(arrowIcons.length).toBe(22);
  });

  it('renders descriptive subtitles below category titles', () => {
    render(<EventCategoryPills locale="en" />);

    expect(screen.getByText('Factory machinery, robotics, and industrial tools')).toBeInTheDocument();
    expect(screen.getByText('Software, cloud platforms, and consumer electronics')).toBeInTheDocument();
    expect(screen.getByText('Video games, comics, animation, and cosplay')).toBeInTheDocument();
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

    const techBtns = screen.getAllByText(/Technology, AI & Consumer Electronics/i);
    fireEvent.click(techBtns[0]);

    expect(handleSelect).toHaveBeenCalledWith('TECH_DEV_SUMMIT');
  });

  it('provides roving tabindex and ARIA tabpanel linkage', () => {
    render(<EventCategoryPills locale="en" />);

    const tabs = screen.getAllByRole('tab');
    const allTab = tabs[0];
    const heavyIndustryTab = tabs[1];

    // Default state: allTab is selected, has tabIndex 0, others have tabIndex -1
    expect(allTab).toHaveAttribute('tabindex', '0');
    expect(allTab).toHaveAttribute('id', 'cluster-tab-all');
    expect(allTab).toHaveAttribute('aria-controls', 'cluster-panel-all');
    expect(heavyIndustryTab).toHaveAttribute('tabindex', '-1');

    // Tabpanel is linked to active tab
    const defaultPanel = screen.getByRole('tabpanel');
    expect(defaultPanel).toHaveAttribute('id', 'cluster-panel-all');
    expect(defaultPanel).toHaveAttribute('aria-labelledby', 'cluster-tab-all');

    // Click another tab
    fireEvent.click(heavyIndustryTab);
    expect(allTab).toHaveAttribute('tabindex', '-1');
    expect(heavyIndustryTab).toHaveAttribute('tabindex', '0');

    const updatedPanel = screen.getByRole('tabpanel');
    expect(updatedPanel).toHaveAttribute('id', 'cluster-panel-heavy_industry_infrastructure');
    expect(updatedPanel).toHaveAttribute('aria-labelledby', 'cluster-tab-heavy_industry_infrastructure');
  });

  it('supports keyboard ArrowRight, ArrowLeft, Home, and End navigation across cluster tabs', () => {
    render(<EventCategoryPills locale="en" />);

    const tablist = screen.getByRole('tablist');
    const tabs = screen.getAllByRole('tab');

    // Initially 'all' is selected
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    // Press ArrowRight: navigates to index 1 (Heavy Industry)
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('tabindex', '0');
    expect(tabs[0]).toHaveAttribute('tabindex', '-1');

    // Press ArrowRight again: navigates to index 2 (Digital & Tech)
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(tabs[2]).toHaveAttribute('aria-selected', 'true');

    // Press ArrowLeft: navigates back to index 1 (Heavy Industry)
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');

    // Press End: jumps to last cluster (Culture & Sports, index 6)
    fireEvent.keyDown(tablist, { key: 'End' });
    expect(tabs[6]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[6]).toHaveAttribute('tabindex', '0');

    // Press ArrowRight on last tab: wraps around to index 0 (All Categories)
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    // Press Home: jumps to index 0
    fireEvent.keyDown(tablist, { key: 'End' });
    expect(tabs[6]).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  });
});
