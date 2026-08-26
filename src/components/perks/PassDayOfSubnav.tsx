'use client';

import * as React from 'react';
import { QrCode, Gift, Calendar, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PassDayOfSubnavProps {
  hasPerks?: boolean;
  perksCount?: number;
  hasAgenda?: boolean;
  agendaCount?: number;
  hasMap?: boolean;
  className?: string;
}

export function PassDayOfSubnav({
  hasPerks = true,
  perksCount = 0,
  hasAgenda = true,
  agendaCount = 0,
  hasMap = true,
  className,
}: PassDayOfSubnavProps) {
  const [activeSection, setActiveSection] = React.useState<string>('digital-pass-section');

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = ['digital-pass-section', 'event-perks-section', 'event-agenda-section', 'hall-map-section'];
      const scrollPosition = window.scrollY + 120;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <nav
      aria-label="Day of Event Sub-Navigation"
      className={cn(
        'sticky top-14 z-30 -mx-4 px-4 py-2.5 bg-background/95 backdrop-blur-md border-b border-border/80 shadow-xs print:hidden',
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {/* Digital Pass Button */}
          <button
            type="button"
            onClick={() => scrollToSection('digital-pass-section')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
              activeSection === 'digital-pass-section'
                ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                : 'border-border/70 bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Digital Pass</span>
          </button>

          {/* VIP Treats & Perks Button */}
          {hasPerks && (
            <button
              type="button"
              onClick={() => scrollToSection('event-perks-section')}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                activeSection === 'event-perks-section'
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border/70 bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Gift className="h-3.5 w-3.5" />
              <span>VIP Treats</span>
              {perksCount > 0 && (
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-muted/80 text-foreground">
                  {perksCount}
                </span>
              )}
            </button>
          )}

          {/* Agenda Guidebook Button */}
          {hasAgenda && (
            <button
              type="button"
              onClick={() => scrollToSection('event-agenda-section')}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                activeSection === 'event-agenda-section'
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border/70 bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Timetable</span>
              {agendaCount > 0 && (
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-muted/80 text-foreground">
                  {agendaCount}
                </span>
              )}
            </button>
          )}

          {/* Hall & Floor Map Button */}
          {hasMap && (
            <button
              type="button"
              onClick={() => scrollToSection('hall-map-section')}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer',
                activeSection === 'hall-map-section'
                  ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                  : 'border-border/70 bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Floor Map</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
