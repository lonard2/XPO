"use client";

import * as React from "react";
import {
  Factory,
  FileText,
  Clock,
  MapPin,
  Send,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  Wrench,
  Search,
  DollarSign,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Award,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";

export interface ArchetypeViewProps {
  event: {
    id: string;
    title: string;
    description: string;
    scale: string;
    format: string;
    startDate: Date | string;
    endDate: Date | string;
    venue: {
      name: string;
      city: string;
      address: string;
      transitInfo?: string;
    };
    venueHall?: {
      name: string;
      capacity?: number | null;
      floorAreaSqm?: number | null;
    } | null;
    ticketTiers: Array<{
      id: string;
      name: string;
      price: number;
      currency: string;
      capacity: number;
      soldCount: number;
      benefitsJson: string;
    }>;
    agendaItems: Array<{
      id: string;
      title: string;
      speakerName?: string | null;
      speakerRole?: string | null;
      location: string;
      startTime: Date | string;
      endTime: Date | string;
      track?: string | null;
    }>;
    booths: Array<{
      id: string;
      companyName: string;
      boothNumber: string;
      hallName: string;
      industry?: string | null;
      websiteUrl?: string | null;
      logoUrl?: string | null;
      description?: string | null;
    }>;
    perks: Array<{
      id: string;
      title: string;
      description: string;
      tierRequired?: string | null;
      iconName: string;
    }>;
  };
  locale?: string;
  onSelectTier?: (tierId: string) => void;
}

export function IndustrialB2BView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [rfqDrawerOpen, setRfqDrawerOpen] = React.useState(false);
  const [selectedBooth, setSelectedBooth] = React.useState<string | null>(null);
  const [rfqSubmitted, setRfqSubmitted] = React.useState(false);
  const [boothSearch, setBoothSearch] = React.useState("");
  const [selectedIndustry, setSelectedIndustry] = React.useState("ALL");
  const [b2bMeetingSuccess, setB2bMeetingSuccess] = React.useState(false);

  // Machine specs demonstration catalog
  const machineryCatalog = [
    {
      name: "CNC 5-Axis Milling Center X-9000",
      manufacturer: "PT Heavy Engineering Nusantara",
      specs: "Spindle: 24,000 RPM | Table: 1,200 x 800mm | Accuracy: ±0.002mm",
      booth: "Hall A1 - Booth 104",
      certification: "ISO 9001:2015 & CE Certified",
      status: "Live Demo Daily @ 11:00 & 15:00",
    },
    {
      name: "Autonomous High-Payload AGV Transporter",
      manufacturer: "Apex Robotics Systems",
      specs: "Payload: 2,500 kg | LiDAR SLAM Navigation | Battery: 12h Continuous",
      booth: "Hall A2 - Booth 218",
      certification: "TUV Rheinland Industrial Safety",
      status: "Interactive Fleet Testing Zone",
    },
    {
      name: "Fiber Laser Cutting System Ultra 30kW",
      manufacturer: "Global MetalTech Solutions",
      specs: "Max Sheet: 6,000 x 2,500mm | Cutting Speed: 120 m/min | Carbon Steel: up to 50mm",
      booth: "Hall B1 - Booth 305",
      certification: "IEC 60825-1 Laser Safety Class 1",
      status: "Precision Cutting Showcase",
    },
  ];

  // Unique industries
  const industries = ["ALL", ...Array.from(new Set(event.booths.map((b) => b.industry || "General Industry")))];

  const filteredBooths = event.booths.filter((booth) => {
    const matchesSearch =
      booth.companyName.toLowerCase().includes(boothSearch.toLowerCase()) ||
      booth.boothNumber.toLowerCase().includes(boothSearch.toLowerCase()) ||
      (booth.description && booth.description.toLowerCase().includes(boothSearch.toLowerCase()));
    const matchesIndustry = selectedIndustry === "ALL" || booth.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const handleOpenRfq = (companyName?: string) => {
    setSelectedBooth(companyName || null);
    setRfqSubmitted(false);
    setRfqDrawerOpen(true);
  };

  const handleRfqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRfqSubmitted(true);
    setTimeout(() => {
      setRfqDrawerOpen(false);
      setRfqSubmitted(false);
    }, 2500);
  };

  return (
    <div className="space-y-12">
      {/* 1. Industrial Domain Header Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--archetype-primary)]">
            <Factory className="h-5 w-5" aria-hidden="true" />
            <span>Industrial & Manufacturing Trade Floor</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Procurement, Heavy Machinery & B2B Matchmaking
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            {event.description}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="archetype"
              onClick={() => handleOpenRfq()}
              className="gap-2 font-semibold shadow-md"
            >
              <FileText className="h-4 w-4" />
              Submit RFQ / Procurement Tender
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const el = document.getElementById("exhibitor-directory");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Browse {event.booths.length} Exhibitor Booths
            </Button>
          </div>
        </div>

        {/* Industrial Highlights Card */}
        <Card className="bg-card border-border/80 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--archetype-primary)]" />
              B2B Deal-Room Facilitation
            </CardTitle>
            <CardDescription className="text-xs">
              Verified buyers and procurement executives receive VIP trade lounge access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Direct factory-floor quote negotiations with certified manufacturers</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Escrow contract support & customs tariff consulting desks</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>ISO standard validation and CE conformity certificates</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 2. Heavy Machinery & Live Demonstrations Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[var(--archetype-accent)]" />
              High-Precision Machinery Showcase
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Live automated demonstrations and machine specifications on display.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {machineryCatalog.map((item, idx) => (
            <Card key={idx} className="border-border hover:border-[var(--archetype-primary)] transition-all bg-card/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span className="font-mono text-[var(--archetype-accent)]">{item.booth}</span>
                  <Badge variant="outline" size="sm">
                    {item.certification}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-foreground">{item.name}</CardTitle>
                <CardDescription className="text-xs font-medium text-[var(--archetype-primary)]">
                  {item.manufacturer}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-2.5 rounded-md bg-muted/40 font-mono text-[11px] text-muted-foreground">
                  {item.specs}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    {item.status}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenRfq(item.manufacturer)}
                    className="text-xs text-[var(--archetype-primary)] hover:underline h-7 px-2"
                  >
                    Request Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Exhibitor & Booth Directory with RFQ triggers */}
      <section id="exhibitor-directory" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Building className="h-5 w-5 text-[var(--archetype-primary)]" />
              Exhibitor Booth Directory ({filteredBooths.length})
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Search by equipment manufacturer, supply chain category, or hall allocation.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search exhibitors or booth..."
                value={boothSearch}
                onChange={(e) => setBoothSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-md bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label="Filter by industry"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooths.map((booth) => (
            <Card key={booth.id} className="border-border/80 hover:shadow-md transition-shadow">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="archetype" size="sm" className="font-mono">
                    {booth.boothNumber}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">{booth.hallName}</span>
                </div>
                <CardTitle className="text-base mt-2">{booth.companyName}</CardTitle>
                {booth.industry && (
                  <p className="text-xs text-[var(--archetype-primary)] font-medium">{booth.industry}</p>
                )}
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-3 text-xs">
                {booth.description && (
                  <p className="text-muted-foreground line-clamp-2">{booth.description}</p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenRfq(booth.companyName)}
                    className="h-8 text-xs gap-1.5"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Request RFQ
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setB2bMeetingSuccess(true);
                      setTimeout(() => setB2bMeetingSuccess(false), 3000);
                    }}
                    className="h-8 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Book Slot
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {b2bMeetingSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="h-4 w-4" />
            Meeting slot inquiry submitted. The exhibitor sales team will confirm your B2B deal-room invitation.
          </div>
        )}
      </section>

      {/* 4. Technical Demos & Workshop Schedule */}
      {event.agendaItems.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--archetype-primary)]" />
            Machinery Demonstrations & Technical Seminars
          </h3>
          <div className="space-y-3">
            {event.agendaItems.map((agenda) => (
              <div
                key={agenda.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-card border border-border/70 hover:border-border transition-colors gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" size="sm">
                      {agenda.track || "Technical Demo"}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                      <MapPin className="h-3 w-3" />
                      {agenda.location}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-foreground">{agenda.title}</h4>
                  {agenda.speakerName && (
                    <p className="text-xs text-muted-foreground">
                      Demonstrator: <span className="font-medium text-foreground">{agenda.speakerName}</span>{" "}
                      {agenda.speakerRole && `(${agenda.speakerRole})`}
                    </p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground sm:text-right shrink-0">
                  <p className="font-mono font-medium text-foreground">
                    {new Date(agenda.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                    {new Date(agenda.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Ticket Tiers & B2B Trade Pass Selection */}
      <section id="tickets-section" className="space-y-6 pt-4 border-t border-border">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-5 w-5 text-[var(--archetype-primary)]" />
            Trade Passes & VIP Procurement Badges
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Select your credential tier for verified access to exhibition halls and B2B lounges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {event.ticketTiers.map((tier) => {
            let benefits: string[] = [];
            try {
              benefits = JSON.parse(tier.benefitsJson);
            } catch {
              benefits = ["Full exhibition floor access", "Official event guide & badge"];
            }

            return (
              <Card key={tier.id} className="flex flex-col border-border/80 hover:border-primary transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <Badge variant="secondary" size="sm">
                      {tier.capacity - tier.soldCount} Passes Left
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-foreground">
                      {tier.price > 0
                        ? formatCurrency(tier.price, (tier.currency as SupportedCurrency) || "IDR", locale)
                        : "Complimentary"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 mt-auto">
                    <Button
                      variant="archetype"
                      className="w-full gap-2 font-semibold"
                      onClick={() => onSelectTier?.(tier.id)}
                    >
                      <Ticket className="h-4 w-4" />
                      Select {tier.name}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* RFQ Tender Drawer */}
      <Drawer
        isOpen={rfqDrawerOpen}
        onClose={() => setRfqDrawerOpen(false)}
        title="Submit Request for Quotation (RFQ)"
        description={
          selectedBooth
            ? `Direct tender inquiry for ${selectedBooth}`
            : "Broadcast RFQ to verified industrial exhibitors"
        }
      >
        {rfqSubmitted ? (
          <div className="py-12 text-center space-y-3 animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold text-foreground">RFQ Submitted Successfully</h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Your technical specification inquiry has been routed to the manufacturer. A sales engineer will respond
              within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleRfqSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Target Exhibitor / Machine</label>
              <input
                type="text"
                readOnly
                value={selectedBooth || "All Matching Heavy Equipment Exhibitors"}
                className="w-full px-3 py-2 text-xs rounded-md bg-muted/50 border border-border text-muted-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Company Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. PT Industri Prima"
                  className="w-full px-3 py-2 text-xs rounded-md bg-background border border-border focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Estimated Quantity / Units *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 5 Units / Annual"
                  className="w-full px-3 py-2 text-xs rounded-md bg-background border border-border focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Contact Email *</label>
              <input
                required
                type="email"
                placeholder="procurement@company.com"
                className="w-full px-3 py-2 text-xs rounded-md bg-background border border-border focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Technical Specifications / RFQ Scope *</label>
              <textarea
                required
                rows={4}
                placeholder="Detail your machinery requirements, precision tolerance, voltage standards, and expected delivery timeline..."
                className="w-full px-3 py-2 text-xs rounded-md bg-background border border-border focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="pt-2">
              <Button type="submit" variant="archetype" className="w-full gap-2">
                <Send className="h-4 w-4" />
                Transmit RFQ to Exhibitor
              </Button>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
}
