"use client";

import * as React from "react";
import {
  Palmtree,
  Compass,
  Utensils,
  Sparkles,
  Car,
  HeartHandshake,
  CheckCircle2,
  Clock,
  MapPin,
  Ticket,
  Calendar,
  Waves,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import type { ArchetypeViewProps } from "./IndustrialB2BView";

export function IncentiveRetreatView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [wellnessDrawerOpen, setWellnessDrawerOpen] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<string | null>(null);
  const [booked, setBooked] = React.useState(false);

  // Curated daily excursions
  const excursions = [
    {
      day: "Day 1 Afternoon",
      title: "Private Sunset Yacht & Coral Reef Snorkeling",
      location: "Jimbaran Bay Coastal Marine Reserve",
      duration: "4 Hours",
      perks: "Champagne service & marine biologist guide",
    },
    {
      day: "Day 2 Morning",
      title: "Sacred Water Temple Meditation & Organic Farm Lunch",
      location: "Ubud Highland Sanctuary",
      duration: "5 Hours",
      perks: "Private blessing ceremony & farm-to-table dining",
    },
    {
      day: "Day 3 Evening",
      title: "Presidential Gala Dinner & Cliffside Symphony",
      location: "Uluwatu Ocean Amphitheatre",
      duration: "3.5 Hours",
      perks: "7-Course Michelin-starred tasting menu",
    },
  ];

  // Wellness menu
  const wellnessTreatments = [
    { name: "Traditional Balinese Herbal Deep-Tissue Massage", duration: "90 min", therapist: "Master Holistic Healer" },
    { name: "Ocean Hydrotherapy & Infrared Sauna Sanctuary", duration: "60 min", therapist: "Thermal Spa Suite" },
    { name: "Sound Bath Healing & Sunset Breathwork", duration: "75 min", therapist: "Mindfulness Resident" },
  ];

  const handleBookWellness = (serviceName: string) => {
    setSelectedService(serviceName);
    setBooked(false);
    setWellnessDrawerOpen(true);
  };

  return (
    <div className="space-y-12">
      {/* 1. Luxury Corporate Incentive Hero Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Palmtree className="h-4 w-4" aria-hidden="true" />
            <span>Executive Reward Retreat, Wellness & Luxury Excursions</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Curated Horizon Retreat, Private Excursions & Gala Banquets
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {event.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="archetype"
              onClick={() => {
                const el = document.getElementById("excursions-itinerary");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs font-semibold shadow-md"
            >
              <Compass className="h-4 w-4" />
              View Excursion Itinerary ({excursions.length})
            </Button>

            <Button
              variant="outline"
              onClick={() => handleBookWellness("Balinese Herbal Massage")}
              className="gap-2 text-xs"
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Reserve Wellness & Spa Slot
            </Button>
          </div>
        </div>

        {/* Chauffeur & Concierge Hospitality Card */}
        <Card className="border-border bg-card shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" size="sm" className="gap-1 text-emerald-400 border-emerald-400/30">
                <Car className="h-3.5 w-3.5" />
                VIP Chauffeur Included
              </Badge>
              <HeartHandshake className="h-4 w-4 text-emerald-400" />
            </div>
            <CardTitle className="text-base">Private Airport Transfers</CardTitle>
            <CardDescription className="text-xs">
              Dedicated luxury fleet with personal chauffeur tracking your flight arrival.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Mercedes-Benz V-Class tarmac escort & luggage handling.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Complimentary in-vehicle Wi-Fi and chilled refreshments.</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 2. Curated Excursion Itinerary */}
      <section id="excursions-itinerary" className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Compass className="h-5 w-5 text-emerald-400" />
            Curated Executive Excursion Itinerary
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            All-inclusive private expeditions guided by local cultural custodians and private yachts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {excursions.map((item, idx) => (
            <Card key={idx} className="border-border hover:border-emerald-500/50 transition-all flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <Badge variant="archetype" size="sm">
                    {item.day}
                  </Badge>
                  <span className="font-mono text-muted-foreground text-xs font-medium">{item.duration}</span>
                </div>
                <CardTitle className="text-base font-bold">{item.title}</CardTitle>
                <CardDescription className="text-xs flex items-center gap-1 mt-1 text-muted-foreground">
                  <MapPin className="h-3 w-3 text-emerald-400" />
                  {item.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-2.5 rounded bg-muted/40 text-muted-foreground text-xs">
                  <span className="font-semibold text-emerald-400">Included Perk:</span> {item.perks}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Wellness & Spa Appointments */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          Retreat Wellness & Holistic Spa Suites
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {wellnessTreatments.map((w, i) => (
            <Card key={i} className="border-border hover:border-emerald-500 transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="outline" size="sm">
                    {w.duration}
                  </Badge>
                  <span className="text-emerald-400 text-xs font-semibold">Complimentary</span>
                </div>
                <CardTitle className="text-base mt-2">{w.name}</CardTitle>
                <CardDescription className="text-xs">{w.therapist}</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBookWellness(w.name)}
                  className="w-full text-xs gap-1.5 min-h-[38px] cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Schedule Appointment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Ticket Tiers & Villa Suite Packages */}
      <section id="tickets-section" className="space-y-6 pt-4 border-t border-border">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-5 w-5 text-[var(--archetype-primary)]" />
            Executive Retreat Packages & Villa Suites
          </h3>
          <p className="text-xs text-muted-foreground">
            Packages include private ocean-view villa accommodation, all-day dining, private excursions, and chauffeur
            services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {event.ticketTiers.map((tier) => {
            let benefits: string[] = [];
            try {
              benefits = JSON.parse(tier.benefitsJson);
            } catch {
              benefits = ["Private Villa suite accommodation", "All excursions & culinary feasts", "Private airport chauffeur"];
            }

            return (
              <Card key={tier.id} className="flex flex-col border-border/80 hover:border-emerald-500 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <Badge variant="success" size="sm">
                      {tier.capacity - tier.soldCount} Suites Remaining
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-foreground">
                      {tier.price > 0
                        ? formatCurrency(tier.price, (tier.currency as SupportedCurrency) || "IDR", locale)
                        : "Corporate Invitation"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
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
                      Reserve Retreat Suite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Wellness Scheduler Drawer */}
      <Drawer
        isOpen={wellnessDrawerOpen}
        onClose={() => setWellnessDrawerOpen(false)}
        title="Schedule Spa & Wellness Appointment"
        description={`Personal holistic treatment booking for ${selectedService}`}
      >
        {booked ? (
          <div className="py-12 text-center space-y-3 animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold text-foreground">Wellness Slot Reserved</h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Your retreat wellness therapist will prepare your private sanctuary suite at the requested time.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setBooked(true);
              setTimeout(() => {
                setWellnessDrawerOpen(false);
                setBooked(false);
              }, 2500);
            }}
            className="space-y-4 text-xs"
          >
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Selected Treatment</label>
              <input
                type="text"
                readOnly
                value={selectedService || "Treatment"}
                className="w-full px-3 py-2 rounded bg-muted/50 border border-border text-muted-foreground"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Guest Villa Number *</label>
              <input
                required
                type="text"
                autoComplete="address-line1"
                placeholder="e.g. Oceanfront Villa 14"
                className="w-full px-3 py-2 rounded bg-background border border-border focus:ring-1 focus:ring-primary min-h-[40px]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Preferred Appointment Window *</label>
              <select className="w-full px-3 py-2 rounded bg-background border border-border focus:ring-1 focus:ring-primary min-h-[40px]">
                <option>Morning Sanctuary (09:00 - 10:30)</option>
                <option>Afternoon Hydrotherapy (14:30 - 16:00)</option>
                <option>Sunset Holistic (17:30 - 19:00)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Special Pressure & Essential Oil Preferences</label>
              <textarea
                rows={3}
                placeholder="Indicate your preferred pressure, lavender/eucalyptus aromatherapy oils, or target focus areas..."
                className="w-full px-3 py-2 rounded bg-background border border-border focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="pt-2">
              <Button type="submit" variant="archetype" className="w-full gap-2 font-semibold min-h-[44px] cursor-pointer">
                <Sparkles className="h-4 w-4" />
                Confirm Appointment
              </Button>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
}
