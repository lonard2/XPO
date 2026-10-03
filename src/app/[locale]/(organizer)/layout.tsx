"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Palette,
  Store,
  QrCode,
  Compass,
  Briefcase,
  ShieldCheck,
  UserCheck,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth/session";
import { getRoleLabel, getRoleBadgeVariant } from "@/lib/auth/rbac";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface OrganizerLayoutProps {
  children: React.ReactNode;
}

export default function OrganizerLayout({ children }: OrganizerLayoutProps) {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const { user, role, switchRole } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  const tOrg = useTranslations("organizer");
  const tCom = useTranslations("common");

  // Handle Escape key to close mobile drawer
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileSidebarOpen]);

  const navItems = [
    {
      href: `/${locale}/dashboard`,
      label: tOrg("dashboardNav") || "Dashboard & Metrics",
      icon: LayoutDashboard,
      description: tOrg("dashboardNavDesc") || "Overview, revenue & check-in velocity",
    },
    {
      href: `/${locale}/events/new`,
      label: tOrg("createEventNav") || "Create Event Wizard",
      icon: PlusCircle,
      description: tOrg("createEventNavDesc") || "4-step MICE event launch pipeline",
    },
    {
      href: `/${locale}/booths`,
      label: tOrg("boothManagerNav") || "Booth & Tenant Manager",
      icon: Store,
      description: tOrg("boothManagerNavDesc") || "Floor allocations & exhibitor roster",
    },
    {
      href: `/${locale}/scanner`,
      label: tOrg("qrScannerNav") || "Door Staff QR Scanner",
      icon: QrCode,
      description: tOrg("qrScannerNavDesc") || "Cryptographic HMAC pass verification",
    },
  ];

  // Breadcrumbs derivation
  const getBreadcrumbs = () => {
    const crumbs = [{ label: tOrg("crumbOrganizerHub") || "Organizer Hub", href: `/${locale}/dashboard` }];

    if (pathname.includes("/events/new")) {
      crumbs.push({ label: tOrg("crumbNewEvent") || "New Event Wizard", href: `/${locale}/events/new` });
    } else if (pathname.includes("/customizer")) {
      crumbs.push({ label: tOrg("crumbCustomizer") || "Live Visual Customizer", href: pathname });
    } else if (pathname.includes("/ai-reports")) {
      crumbs.push({ label: tOrg("crumbAiReports") || "AI Multi-Model Reports", href: pathname });
    } else if (pathname.includes("/booths")) {
      crumbs.push({ label: tOrg("crumbBooths") || "Booth Roster", href: `/${locale}/booths` });
    } else if (pathname.includes("/scanner")) {
      crumbs.push({ label: tOrg("crumbScanner") || "QR Check-In Scanner", href: `/${locale}/scanner` });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Enforce RBAC Access Barrier for Attendee role across Organizer Portal
  if (role === "ATTENDEE") {
    return (
      <div
        role="alert"
        aria-labelledby="rbac-barrier-title"
        className="min-h-[calc(100dvh-4rem)] flex items-center justify-center p-6 bg-muted/20 animate-fade-in"
      >
        <div className="max-w-md w-full p-8 bg-card border border-border rounded-2xl shadow-sm space-y-5 text-center">
          <div className="h-16 w-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <Badge variant="warning" size="sm">{tOrg("rbacRequiredTitle") || "Organizer Access Restricted"}</Badge>
            <h2 id="rbac-barrier-title" className="text-xl font-bold text-foreground">
              {tOrg("managementHub") || "Organizer Management Portal"}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {tOrg("attendeeModeNotice") || "Confidential event operations, door staff QR validation, booth assignments, and analytics are restricted to verified event organizers and staff accounts."}
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-4 border-t border-border">
            <Button
              variant="primary"
              onClick={() => switchRole("ORGANIZER")}
              className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer min-h-[44px]"
            >
              <UserCheck className="h-4 w-4" />
              <span>{tOrg("switchToOrganizer") || "Switch to Organizer Persona"}</span>
            </Button>
            <Link
              href={`/${locale}`}
              className={cn(buttonVariants({ variant: "outline" }), "w-full cursor-pointer min-h-[44px]")}
            >
              {tCom("backToHome") || "Back to Discovery"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex flex-col bg-background">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/60 p-4 shrink-0">
          {/* User Profile Card */}
          <div className="p-3 mb-4 rounded-xl border border-border/80 bg-background/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                {user ? user.name.charAt(0).toUpperCase() : "O"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Badge variant={getRoleBadgeVariant(role)} size="sm">
                    {getRoleLabel(role)}
                  </Badge>
                </div>
                <h4 className="text-xs font-bold text-foreground truncate mt-1">
                  {user ? user.name : (tOrg("managementHub") || "Organizer Hub")}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.organization || "XPO Ecosystem"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Organizer Sidebar Navigation" className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 mb-2">
              {tOrg("suiteTitle") || "Organizer Suite"}
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href.includes("/events/new") && pathname.includes("/events/new"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-start gap-3 p-2.5 rounded-xl text-xs font-medium transition-all group min-h-[44px]",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  )}
                >
                  <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", isActive ? "text-primary-foreground" : "text-primary")} />
                  <div>
                    <div className="leading-tight">{item.label}</div>
                    <div className={cn("text-xs font-normal leading-tight mt-0.5", isActive ? "text-primary-foreground/90" : "text-muted-foreground")}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Quick Switch to Attendee Explorer */}
          <div className="pt-4 border-t border-border/70 space-y-2 mt-auto">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors min-h-[44px]"
            >
              <Compass className="h-4 w-4 text-emerald-500" />
              <span>{tOrg("switchToAttendee") || "Attendee Event Discovery"}</span>
            </Link>
          </div>
        </aside>

        {/* MOBILE SIDEBAR TOGGLE & TOPBAR */}
        <div className="lg:hidden bg-card border-b border-border p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileSidebarOpen}
              aria-controls="mobile-organizer-nav"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
              {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <span className="text-xs font-bold text-foreground">
              {tOrg("portalBadge") || "Organizer Portal"}
            </span>
          </div>
          <Badge variant={getRoleBadgeVariant(role)} size="sm">
            {role}
          </Badge>
        </div>

        {/* MOBILE SIDEBAR BACKDROP SCRIM */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* MOBILE SIDEBAR DRAWER */}
        {isMobileSidebarOpen && (
          <div
            id="mobile-organizer-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Organizer Navigation"
            className="fixed inset-x-0 top-[57px] bg-card border-b border-border p-4 space-y-3 z-50 lg:hidden shadow-xl animate-fade-in"
          >
            <nav aria-label="Mobile Navigation" className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-2.5 min-h-[44px] rounded-xl text-xs font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <Link
                href={`/${locale}`}
                onClick={() => setIsMobileSidebarOpen(false)}
                className="flex items-center gap-3 p-2.5 min-h-[44px] rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground pt-2 border-t border-border"
              >
                <Compass className="h-4 w-4 text-emerald-500" />
                <span>{tOrg("switchToAttendee") || "Return to Attendee Portal"}</span>
              </Link>
            </nav>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Breadcrumb Header Bar */}
          <div className="border-b border-border/70 bg-card/40 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
            <nav aria-label="Breadcrumb" className="flex items-center text-xs text-muted-foreground">
              <ol className="flex items-center gap-1.5 list-none p-0 m-0">
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <li key={crumb.label} className="inline-flex items-center gap-1.5">
                      {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" aria-hidden="true" />}
                      {isLast ? (
                        <span className="font-semibold text-foreground" aria-current="page">
                          {crumb.label}
                        </span>
                      ) : (
                        <Link href={crumb.href} className="hover:text-foreground transition-colors">
                          {crumb.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/events/new`}
                className={cn(
                  buttonVariants({ variant: "primary", size: "sm" }),
                  "min-h-[44px] sm:min-h-[36px] px-3 gap-1.5 text-xs shadow-xs cursor-pointer flex items-center"
                )}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tOrg("launchNewEvent") || "Launch Event"}</span>
              </Link>
            </div>
          </div>

          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1800px] w-full mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
