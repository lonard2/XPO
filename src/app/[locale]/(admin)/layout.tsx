"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  RefreshCw,
  ShieldCheck,
  Compass,
  Briefcase,
  AlertCircle,
  Menu,
  X,
  ChevronRight,
  Database,
  Cpu,
  Lock,
  Activity,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { useAuth } from "@/lib/auth/session";
import { getRoleBadgeVariant } from "@/lib/auth/rbac";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const { user, role, switchRole } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  const navItems = [
    {
      href: `/${locale}/admin/dashboard`,
      label: "Governance Dashboard",
      icon: LayoutDashboard,
      description: "Platform KPIs, organizer queue & audit feed",
    },
    {
      href: `/${locale}/admin/venues`,
      label: "Global Venue Directory",
      icon: Building2,
      description: "Relational venues, exact halls & GPS visualizer",
    },
    {
      href: `/${locale}/admin/crawler`,
      label: "Ingestion Crawler Engine",
      icon: RefreshCw,
      description: "Multi-venue schedule scraper & deduplication",
    },
    {
      href: `/${locale}/admin/audit`,
      label: "Platform Security Logs",
      icon: ShieldCheck,
      description: "Cryptographic check-in & permission audit trail",
    },
  ];

  // Breadcrumbs derivation
  const getBreadcrumbs = () => {
    const crumbs = [{ label: "Governance Hub", href: `/${locale}/admin/dashboard` }];

    if (pathname.includes("/admin/dashboard") || pathname.endsWith("/admin")) {
      crumbs.push({ label: "Dashboard", href: `/${locale}/admin/dashboard` });
    } else if (pathname.includes("/admin/venues")) {
      crumbs.push({ label: "Venue Directory", href: `/${locale}/admin/venues` });
    } else if (pathname.includes("/admin/crawler")) {
      crumbs.push({ label: "Crawler Ingestion", href: `/${locale}/admin/crawler` });
    } else if (pathname.includes("/admin/audit")) {
      crumbs.push({ label: "Audit & Security", href: `/${locale}/admin/audit` });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-muted/20">
      {/* Role Permission Gate Banner (if not ADMIN) */}
      {role !== "ADMIN" && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              You are currently viewing in <strong>{role}</strong> mode. Venue modifications and ingestion crawlers require <strong>Platform Admin</strong> privileges.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20"
            onClick={() => switchRole("ADMIN")}
          >
            Switch to Admin Persona
          </Button>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex w-72 flex-col border-r border-border/80 bg-card/60 backdrop-blur-sm shrink-0 p-5 space-y-6">
          {/* Active Admin Persona Card */}
          <div className="p-3.5 rounded-xl border border-border bg-background/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Governance Portal
              </span>
              <Badge variant={getRoleBadgeVariant("ADMIN")} size="sm">
                ADMIN
              </Badge>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center font-bold text-xs shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-foreground truncate">
                  {user?.role === "ADMIN" ? user.name : "Platform Administrator"}
                </h4>
                <p className="text-[10px] text-muted-foreground truncate">
                  XPO System Governance & Audit
                </p>
              </div>
            </div>
          </div>

          {/* System Health Indicators */}
          <div className="p-3 rounded-xl border border-border/60 bg-muted/30 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Activity className="h-3 w-3 text-emerald-500" />
                System Health
              </span>
              <span className="text-emerald-500 font-bold">100% Operational</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Database className="h-3 w-3 text-primary" />
                  Prisma DB Engine
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Online
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="h-3 w-3 text-amber-500" />
                  Ingestion Scraper
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Standby
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Cpu className="h-3 w-3 text-indigo-500" />
                  OpenRouter Multi-AI
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Active (6 Models)
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-rose-500" />
                  HMAC Pass Verifier
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium">
                  <CheckCircle2 className="h-2.5 w-2.5" /> SHA-256
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-2">
              Platform Administration
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href.includes("dashboard") && pathname === `/${locale}/admin`);
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

          {/* Portal Switchers */}
          <div className="pt-4 border-t border-border/70 space-y-1 mt-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
              Switch Portals
            </div>
            <Link
              href={`/${locale}/dashboard`}
              className="flex items-center gap-2.5 p-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              <Briefcase className="h-4 w-4 text-primary" />
              <span>Organizer Portal</span>
            </Link>
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2.5 p-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              <Compass className="h-4 w-4 text-emerald-500" />
              <span>Attendee Event Discovery</span>
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
            <span className="text-xs font-bold text-foreground">Platform Governance</span>
          </div>
          <Badge variant={getRoleBadgeVariant("ADMIN")} size="sm">
            ADMIN
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
              <div className="pt-2 border-t border-border space-y-1">
                <Link
                  href={`/${locale}/dashboard`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span>Organizer Portal</span>
                </Link>
                <Link
                  href={`/${locale}`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <Compass className="h-4 w-4 text-emerald-500" />
                  <span>Attendee Event Discovery</span>
                </Link>
              </div>
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
              <Link href={`/${locale}/admin/crawler`}>
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                  <RefreshCw className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">Crawler Engine</span>
                </Button>
              </Link>
              <Link href={`/${locale}/admin/venues`}>
                <Button size="sm" variant="primary" className="h-8 gap-1.5 text-xs">
                  <Building2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Manage Venues</span>
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
