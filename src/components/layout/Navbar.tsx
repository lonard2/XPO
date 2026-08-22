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
  Menu,
  X,
  Sparkles,
  Calendar,
  UserCheck,
  ShieldCheck,
  Briefcase,
  LogIn,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { RegionSwitcher } from "@/components/layout/RegionSwitcher";
import { useSettings } from "@/components/settings/SettingsProvider";
import { useAuth } from "@/lib/auth/session";
import { getRoleLabel, getRoleBadgeVariant } from "@/lib/auth/rbac";
import { AuthModal } from "@/components/auth/AuthModal";

interface NavbarProps {
  locale?: string;
}

export function Navbar({ locale = "en" }: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  const { user, role, isAuthenticated } = useAuth();
  
  let tNav: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tNav = useTranslations("nav");
  } catch {
    // Fallback if rendered outside provider in tests
  }

  let settings: ReturnType<typeof useSettings> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    settings = useSettings();
  } catch {
    // Fallback if rendered outside provider in isolated tests
  }

  const [localDarkMode, setLocalDarkMode] = React.useState(false);

  // Extract active region from path, searchParams, or cookie (default 'id')
  const regionMatch = pathname?.match(/\/region\/(id|jp|global)/i);
  const [activeRegion, setActiveRegion] = React.useState<string>(
    regionMatch ? regionMatch[1].toLowerCase() : 'id'
  );

  React.useEffect(() => {
    if (regionMatch) {
      setActiveRegion(regionMatch[1].toLowerCase());
      return;
    }
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramRegion = urlParams.get('region');
      if (paramRegion && ['id', 'jp', 'global'].includes(paramRegion.toLowerCase())) {
        setActiveRegion(paramRegion.toLowerCase());
        return;
      }
      const match = document.cookie.match(/xpo_region=([^;]+)/);
      if (match && ['id', 'jp', 'global'].includes(match[1].toLowerCase())) {
        setActiveRegion(match[1].toLowerCase());
        return;
      }
      setActiveRegion('id');
    }
  }, [pathname, regionMatch]);

  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setLocalDarkMode(isDark);
  }, [settings?.theme]);

  const isDarkMode = settings?.isMounted
    ? settings.theme === "dark" || (settings.theme === "system" && localDarkMode)
    : localDarkMode;

  const toggleDarkMode = () => {
    if (settings) {
      settings.setTheme(isDarkMode ? "light" : "dark");
    } else {
      const newMode = !localDarkMode;
      setLocalDarkMode(newMode);
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("xpo_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("xpo_theme", "light");
      }
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case "ADMIN":
        return ShieldCheck;
      case "ORGANIZER":
        return Briefcase;
      case "ATTENDEE":
      default:
        return UserCheck;
    }
  };

  const RoleIcon = getRoleIcon();

  const navLinks = [
    { href: `/${locale}`, label: tNav("explore") || "Explore", icon: Compass },
    { href: `/${locale}/events`, label: tNav("events") || "Events", icon: Sparkles },
    { href: `/${locale}/calendar`, label: tNav("calendar") || "Calendar", icon: Calendar },
    { href: `/${locale}/venues`, label: tNav("venues") || "Venues", icon: Building2 },
    { href: `/${locale}/my-tickets`, label: tNav("myTickets") || "My Passes", icon: Ticket },
    { href: `/${locale}/dashboard`, label: tNav("dashboard") || "Organizer", icon: LayoutDashboard },
  ];

  return (
    <>
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
                      "flex items-center gap-2 px-3 py-2 rounded-md text-xs lg:text-sm font-medium transition-colors",
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
            {/* Regional Hub Switcher */}
            <div className="hidden xl:block">
              <RegionSwitcher currentLocale={locale} activeRegionCode={activeRegion} />
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher currentLocale={locale} />

            {/* Auth / Role Switcher Trigger Button */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/80 hover:border-primary/40 bg-card hover:bg-accent/50 transition-all text-xs text-left cursor-pointer"
              aria-label="Manage user authentication and role persona"
            >
              <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <RoleIcon className="h-3.5 w-3.5" />
              </div>
              <div className="hidden sm:flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-foreground max-w-[90px] truncate text-[11px]">
                    {user ? user.name.split(" ")[0] : "Sign In"}
                  </span>
                  <Badge variant={getRoleBadgeVariant(role)} size="sm" className="text-[9px] py-0 px-1">
                    {role}
                  </Badge>
                </div>
              </div>
            </button>

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
              <Button variant="outline" size="sm" className="hidden lg:inline-flex gap-2 text-xs">
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
          <div className="md:hidden border-b border-border bg-card p-4 space-y-3 animate-fade-in">
            {/* Active User Persona Banner */}
            <div
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="p-3 bg-muted/40 rounded-lg border border-border flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <RoleIcon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    {user ? user.name : "Guest User"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Active Persona: {getRoleLabel(role)}
                  </div>
                </div>
              </div>
              <Badge variant={getRoleBadgeVariant(role)} size="sm">
                Switch Role
              </Badge>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Regional Hub Selector in Mobile */}
            <div className="pt-2 border-t border-border space-y-2">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider block px-1">
                Select Regional Hub
              </span>
              <RegionSwitcher
                currentLocale={locale}
                activeRegionCode={activeRegion}
                variant="pills"
              />
            </div>

            {/* Footer Settings & Language Info */}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <Link
                href={`/${locale}/settings`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground py-1.5"
              >
                <SettingsIcon className="h-4 w-4" />
                <span>UI & Account Settings</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Auth & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

export default Navbar;
