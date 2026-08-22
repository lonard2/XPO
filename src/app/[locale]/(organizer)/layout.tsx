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
import { Button } from "@/components/ui/Button";
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

  let tOrg: any = (k: string) => k;
  let tCom: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tOrg = useTranslations("organizer");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tCom = useTranslations("common");
  } catch {
    // Fallback if rendered outside provider
  }

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

    if (pathname.includes("/dashboard")) {
      crumbs.push({ label: tOrg("dashboardNav") || "Dashboard", href: `/${locale}/dashboard` });
    } else if (pathname.includes("/events/new")) {
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

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-muted/20">
      {/* Role Permission Warning Gate Banner (if Attendee) */}
      {role === "ATTENDEE" && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              {tOrg("attendeeModeNotice") || "You are currently viewing in Attendee mode. Organizer creation and customizer mutations require Organizer or Admin privileges."}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20"
            onClick={() => switchRole("ORGANIZER")}
          >
            {tOrg("switchToOrganizer") || "Switch to Organizer Persona"}
          </Button>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex w-72 flex-col border-r border-border/80 bg-card/60 backdrop-blur-sm shrink-0 p-5 space-y-6">
          {/* Active Organizer Persona Card */}
          <div className="p-3.5 rounded-xl border border-border bg-background/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {tOrg("portalBadge") || "Management Portal"}
              </span>
              <Badge variant={getRoleBadgeVariant(role)} size="sm">
                {role}
              </Badge>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                <Briefcase className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-foreground truncate">
                  {user ? user.name : (tOrg("managementHub") || "Organizer Hub")}
                </h4>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.organization || "XPO Ecosystem"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-2">
              {tOrg("suiteTitle") || "Organizer Suite"}
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href.includes("/events/new") && pathname.includes("/events/new"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-start gap-3 p-2.5 rounded-lg text-xs font-medium transition-all group",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  )}
                >
                  <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", isActive ? "text-primary-foreground" : "text-primary")} />
                  <div>
                    <div className="leading-tight">{item.label}</div>
                    <div className={cn("text-[10px] font-normal leading-tight mt-0.5", isActive ? "text-primary-foreground/80" : "text-muted-foreground")}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick Switch to Attendee Explorer */}
          <div className="pt-4 border-t border-border/70 space-y-2 mt-auto">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2.5 p-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
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
              className="h-8 w-8"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            >
              {isMobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <span className="text-xs font-bold text-foreground">
              {tOrg("portalBadge") || "Organizer Portal"}
            </span>
          </div>
          <Badge variant={getRoleBadgeVariant(role)} size="sm">
            {role}
          </Badge>
        </div>

        {/* MOBILE SIDEBAR DRAWER */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden border-b border-border bg-card p-4 space-y-3 animate-fade-in">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium transition-colors",
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
                className="flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground pt-2 border-t border-border"
              >
                <Compass className="h-4 w-4 text-emerald-500" />
                <span>{tOrg("switchToAttendee") || "Return to Attendee Portal"}</span>
              </Link>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Breadcrumb Header Bar */}
          <div className="border-b border-border/70 bg-card/40 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.label}>
                  {idx > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60" />}
                  <span className={cn(idx === breadcrumbs.length - 1 ? "font-semibold text-foreground" : "hover:text-foreground")}>
                    {crumb.label}
                  </span>
                </React.Fragment>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link href={`/${locale}/events/new`}>
                <Button size="sm" variant="primary" className="h-8 gap-1.5 text-xs">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tOrg("launchNewEvent") || "Launch Event"}</span>
                </Button>
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
