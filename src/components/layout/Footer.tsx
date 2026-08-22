import Link from "next/link";
import { Compass, ShieldCheck, Cpu, Globe2 } from "lucide-react";

export function Footer({ locale = "en" }: { locale?: string }) {
  return (
    <footer className="border-t border-border bg-card/50 text-foreground transition-colors pb-20 md:pb-8 pt-12">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Col 1: Brand & Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Compass className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight">XPO Digital MICE</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The next-generation digital ecosystem for Meetings, Incentives, Conferences, and Exhibitions worldwide.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Verified MICE Ecosystem</span>
          </div>
        </div>

        {/* Col 2: Country Editions */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Country Editions
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href={`/${locale}/region/id`} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-primary" />
                <span>Indonesia (JIExpo, ICE, JICC)</span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/region/jp`} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-primary" />
                <span>Japan (Tokyo Big Sight, Makuhari)</span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/region/global`} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-primary" />
                <span>Global Conventions (MBS, Messe Frankfurt)</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Event Categories */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Event Categories
          </h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>Industrial & Manufacturing B2B</li>
            <li>Tech, AI & Developer Summits</li>
            <li>Medical & Healthcare Congress</li>
            <li>Automotive & Clean Energy Expos</li>
            <li>Pop Culture & Music Festivals</li>
          </ul>
        </div>

        {/* Col 4: Organizer & Tools */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Organizer Portal & Tools
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href={`/${locale}/dashboard`} className="text-muted-foreground hover:text-foreground transition-colors">
                Organizer Event Management Hub
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/events/new`} className="text-muted-foreground hover:text-foreground transition-colors">
                Create & Publish Exhibition
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/settings`} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                <span>System & AI Concierge Preferences</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
        <p>© 2026 XPO MICE Digital Ecosystem. All rights reserved.</p>
        <p className="flex items-center gap-2">
          <span>Enterprise MICE Infrastructure</span>
          <span>•</span>
          <span>Accessible Multi-Device Architecture</span>
        </p>
      </div>
    </footer>
  );
}
