import Link from "next/link";
import {
  Compass,
  Building2,
  Ticket,
  Sparkles,
  Layers,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Tablet,
  Laptop,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 via-background to-background py-16 sm:py-24">
        <div className="container relative z-10 flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold animate-fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            <span>XPO Digital MICE Ecosystem • Phase 1 Active</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Global Events, Conventions & Expos, <span className="text-primary">Reimagined</span>.
          </h1>

          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            The multi-sided digital platform connecting attendees, organizers, and world-class venues across Indonesia, Japan, and the globe.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full sm:w-auto">
            <Link href={`/${locale}/events`} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 font-semibold shadow-md">
                <Compass className="h-4 w-4" />
                <span>Explore Events</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link href={`/${locale}/venues`} className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                <Building2 className="h-4 w-4" />
                <span>Venue Directory</span>
              </Button>
            </Link>
          </div>

          {/* Fast Region Selector Chips */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">Spotlight Hubs:</span>
            <Link href={`/${locale}/region/id`}>
              <Badge variant="outline" className="hover:border-primary cursor-pointer transition-colors py-1 px-2.5">
                Indonesia (JIExpo, ICE BSD, JICC, NICE)
              </Badge>
            </Link>
            <Link href={`/${locale}/region/jp`}>
              <Badge variant="outline" className="hover:border-primary cursor-pointer transition-colors py-1 px-2.5">
                Japan (Tokyo Big Sight, Makuhari)
              </Badge>
            </Link>
            <Link href={`/${locale}/region/global`}>
              <Badge variant="outline" className="hover:border-primary cursor-pointer transition-colors py-1 px-2.5">
                Global (MBS, Messe Frankfurt)
              </Badge>
            </Link>
          </div>
        </div>
      </section>

      {/* 3-Sided Multi-Portal Architecture Showcase */}
      <section className="container px-4">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Multi-Sided Platform Architecture
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Engineered with dedicated portals tailored for every participant in the MICE lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Attendee Portal */}
          <Card interactive className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-2">
                <Compass className="h-6 w-6" />
              </div>
              <CardTitle>Attendee Experience</CardTitle>
              <CardDescription>
                Discover regional expos, reserve tiered tickets, access interactive digital guidebooks, and consult the AI concierge.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground pt-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>9 Domain MICE Archetype Layouts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Instant SVG QR Digital Passes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Hall Floor Maps & Day-of Treats</span>
              </div>
            </CardContent>
          </Card>

          {/* Organizer Command Center */}
          <Card interactive className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-2">
                <Layers className="h-6 w-6" />
              </div>
              <CardTitle>Organizer Command</CardTitle>
              <CardDescription>
                Event creation wizard, real-time live visual customizer, booth/tenant roster, and QR check-in scanner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground pt-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Live Split-Screen Customizer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Multi-Model AI Intelligence Suite</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Door Staff QR Check-in Simulation</span>
              </div>
            </CardContent>
          </Card>

          {/* Admin & Ingestion */}
          <Card interactive className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle>Admin Governance</CardTitle>
              <CardDescription>
                Global venue directory with exact hall indexing, automated venue event scrapers, and platform audit logs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground pt-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Exact Venue & Hall Seeding</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Simulated Ingestion Pipeline</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Role-Based Access Control (RBAC)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Adaptive Responsive Multi-Device Standard */}
      <section className="container px-4">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-1 space-y-4">
              <Badge variant="outline" className="text-primary border-primary/30">
                Responsive Design Engine
              </Badge>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                Device-Tailored Ergonomics
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Every screen is engineered with viewport-specific UX: single-handed thumb zones for phones, dual-pane layouts for tablets, and high-density command consoles for desktop monitors.
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border/80 bg-background p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Smartphone className="h-4 w-4" />
                  <span>Mobile Viewport</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Bottom navigation bar, sticky booking drawer, swipeable cards, 44px touch targets.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-background p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Tablet className="h-4 w-4" />
                  <span>Tablet Viewport</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Hybrid 2-column event discovery grids, collapsible sidebars, and split-view timetables.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-background p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Laptop className="h-4 w-4" />
                  <span>Desktop Viewport</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Persistent command sidebars, side-by-side live customizer frame, high-density data tables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Model OpenRouter AI Showcase Banner */}
      <section className="container px-4">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-primary font-bold text-sm">
              <Cpu className="h-5 w-5" />
              <span>Multi-Model OpenRouter AI Intelligence</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              Equipped with 6 cutting-edge LLMs for real-time concierge, executive analytics, and foot-traffic optimization:
              <span className="block mt-1 font-mono text-[11px] text-foreground/80">
                Gemini 3.5 Flash-Lite • Gemini 3.7 Flash • DeepSeek v4 Pro • Qwen 3.7 Plus • GPT-5.6 Luna • Gemma 4 26B
              </span>
            </p>
          </div>
          <Link href={`/${locale}/settings`}>
            <Button variant="outline" className="whitespace-nowrap gap-2 text-xs">
              <span>Configure AI Settings</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
