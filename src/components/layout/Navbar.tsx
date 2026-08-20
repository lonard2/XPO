"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Building2,
  Ticket,
  LayoutDashboard,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface NavbarProps {
  locale?: string;
}

export function Navbar({ locale = "en" }: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("xpo_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("xpo_theme", "light");
    }
  };

  const navLinks = [
    { href: `/${locale}`, label: "Explore", icon: Compass },
    { href: `/${locale}/events`, label: "Events", icon: Sparkles },
    { href: `/${locale}/venues`, label: "Venues", icon: Building2 },
    { href: `/${locale}/my-tickets`, label: "My Passes", icon: Ticket },
    { href: `/${locale}/dashboard`, label: "Organizer", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md transition-colors">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
              <Compass className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-foreground leading-tight">
                XPO
              </span>
              <span className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground">
                MICE Digital
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Region / Locale Indicator */}
          <Link
            href={`/${locale}/settings`}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Switch Language & Region"
          >
            <Globe className="h-4 w-4" />
            <span className="uppercase">{locale}</span>
          </Link>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="h-9 w-9"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Settings Link */}
          <Link href={`/${locale}/settings`}>
            <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-2 text-xs">
              <SettingsIcon className="h-3.5 w-3.5" />
              <span>Settings</span>
            </Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card p-4 space-y-2 animate-fade-in">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <Link
              href={`/${locale}/settings`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-2"
            >
              <SettingsIcon className="h-4 w-4" />
              <span>UI & Account Settings</span>
            </Link>
            <Badge variant="outline" className="uppercase text-[10px]">
              {locale}
            </Badge>
          </div>
        </div>
      )}
    </header>
  );
}
