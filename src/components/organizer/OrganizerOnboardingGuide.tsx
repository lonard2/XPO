"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Building2,
  Ticket,
  Store,
  QrCode,
  ArrowRight,
  X,
  Compass,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface OrganizerOnboardingGuideProps {
  locale: string;
  hasEvents: boolean;
  hasTickets: boolean;
  hasBooths: boolean;
  totalEvents: number;
}

const STORAGE_KEY = "xpo_organizer_onboarding_collapsed_v1";
const DISMISS_KEY = "xpo_organizer_onboarding_dismissed_v1";

export function OrganizerOnboardingGuide({
  locale,
  hasEvents,
  hasTickets,
  hasBooths,
  totalEvents,
}: OrganizerOnboardingGuideProps) {
  const [isDismissed, setIsDismissed] = React.useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);
  const [isMounted, setIsMounted] = React.useState<boolean>(false);

  React.useEffect(() => {
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY) === "true";
      const collapsed = localStorage.getItem(STORAGE_KEY) === "true";
      setIsDismissed(dismissed);
      setIsCollapsed(collapsed);
    } catch {
      // Ignore storage errors in restricted environments
    }
    setIsMounted(true);
  }, []);

  const handleToggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Ignore
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // Ignore
    }
  };

  if (!isMounted || isDismissed) {
    return null;
  }

  // 4 Core Milestones of the Organizer Journey
  const milestones = [
    {
      id: "step-1",
      title: "1. Create Exhibition & Select Archetype",
      desc: "Configure venue hall indexing and choose from 15 specialized MICE category engines.",
      completed: hasEvents,
      href: `/${locale}/events/new`,
      actionLabel: hasEvents ? "View Events" : "Launch Event",
      icon: Building2,
    },
    {
      id: "step-2",
      title: "2. Define Ticket Passes & Tiers",
      desc: "Set pass capacities, pricing, and cryptographic HMAC-SHA256 digital entry badges.",
      completed: hasTickets,
      href: `/${locale}/events/new?step=3`,
      actionLabel: hasTickets ? "Configured" : "Add Tiers",
      icon: Ticket,
    },
    {
      id: "step-3",
      title: "3. Assign Floor Booths & Tenants",
      desc: "Map commercial exhibitors to exact hall lots with CSV bulk import and occupancy tracking.",
      completed: hasBooths,
      href: `/${locale}/booths`,
      actionLabel: hasBooths ? "Manage Booths" : "Allocate Lots",
      icon: Store,
    },
    {
      id: "step-4",
      title: "4. Deploy QR Check-In Scanner",
      desc: "Turn gate tablets into high-speed turnstiles with double-scan alerts and perk unlocks.",
      completed: false, // Day-of operation
      href: `/${locale}/scanner`,
      actionLabel: "Open Scanner",
      icon: QrCode,
    },
  ];

  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  return (
    <Card className="border-border/80 bg-card overflow-hidden shadow-xs animate-fade-in">
      <div className="p-5 bg-primary/5 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                Organizer Onboarding & Operational Roadmap
              </h2>
              <Badge variant="outline" size="sm" className="font-semibold text-primary">
                {completedCount} of 4 Complete
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Follow this 4-step pipeline to take your exhibition from initial concept to live turnstile operations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleCollapse}
            aria-label={isCollapsed ? "Expand onboarding guide" : "Collapse onboarding guide"}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1"
          >
            {isCollapsed ? (
              <>
                <span>Expand</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                <span>Minimize</span>
                <ChevronUp className="h-3.5 w-3.5" />
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            aria-label="Dismiss onboarding guide"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-5 space-y-5">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Roadmap Readiness</span>
              <span className="font-semibold text-foreground tabular-nums">{progressPercent}%</span>
            </div>
            <div
              className="w-full bg-muted rounded-full h-1.5 overflow-hidden"
              role="progressbar"
              aria-label="Onboarding Progress"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 4 Milestones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {milestones.map((milestone) => {
              const Icon = milestone.icon;
              return (
                <div
                  key={milestone.id}
                  className={cn(
                    "p-3.5 rounded-xl border flex flex-col justify-between space-y-3 transition-colors",
                    milestone.completed
                      ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                      : "border-border/70 bg-background/50 hover:border-border"
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          "h-7 w-7 rounded-lg flex items-center justify-center text-xs",
                          milestone.completed
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      {milestone.completed ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Done</span>
                        </span>
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-muted-foreground/60" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-foreground leading-tight">
                        {milestone.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                        {milestone.desc}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={milestone.href}
                    className={cn(
                      buttonVariants({
                        variant: milestone.completed ? "outline" : "primary",
                        size: "sm",
                      }),
                      "w-full text-xs h-8 gap-1.5 cursor-pointer justify-center"
                    )}
                  >
                    <span>{milestone.actionLabel}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Quick-Start 1-Click Templates Banner */}
          <div className="p-3.5 bg-muted/40 border border-border/70 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">Explore 1-Click Templates:</strong> Test the wizard with pre-configured specs for Industrial B2B, Tech Summit, or Pop Culture Expo.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                href={`/${locale}/events/new?template=industrial`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "text-xs h-7 px-2.5 cursor-pointer"
                )}
              >
                Industrial B2B
              </Link>
              <Link
                href={`/${locale}/events/new?template=tech`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "text-xs h-7 px-2.5 cursor-pointer"
                )}
              >
                Tech Summit
              </Link>
              <Link
                href={`/${locale}/events/new?template=gaming`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "text-xs h-7 px-2.5 cursor-pointer"
                )}
              >
                Pop Culture
              </Link>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
