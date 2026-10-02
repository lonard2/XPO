"use client";

import * as React from "react";
import {
  Plane,
  Building2,
  CalendarCheck,
  Compass,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Globe2,
  Users,
  Award,
  ArrowRight,
  Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { type ArchetypeViewProps } from "./IndustrialB2BView";

export function HospitalityTourismView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [buyerDrawerOpen, setBuyerDrawerOpen] = React.useState(false);
  const [selectedPavilion, setSelectedPavilion] = React.useState<string | null>(null);
  const [appointmentBooked, setAppointmentBooked] = React.useState(false);

  // Tourism Pavilions & Hospitality Procurement Hub
  const destinationPavilions = [
    {
      id: "dest-01",
      name: "Wonderful Indonesia Luxury Archipelago Pavilion",
      region: "Southeast Asia",
      highlights: "Komodo & Raja Ampat Luxury Charters | Bali Wellness Resorts",
      buyers: "45 Hosted Buyers Active",
      booth: "Hall 1 - Central Pavilion",
      sessions: "1-on-1 Buyer Sessions Every 20 Mins",
    },
    {
      id: "dest-02",
      name: "Japan National Tourism Organization (JNTO) Hub",
      region: "East Asia",
      highlights: "Kanto High-Speed Rail Corridors | Hokkaido Ski Chalets",
      buyers: "38 Hosted Buyers Active",
      booth: "Hall 2 - Pavilion 201",
      sessions: "Incentive Travel Planning Lounge",
    },
    {
      id: "dest-03",
      name: "Global Airline Alliances & MICE Booking Corridor",
      region: "International",
      highlights: "Direct Group Fare Contracts | Convention Air Credits",
      buyers: "50+ Airline Key Accounts",
      booth: "Hall 3 - Aviation Concourse",
      sessions: "Fleet Contract Consultations",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Category Mission Statement */}
      <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 via-card to-background p-6 sm:p-8 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                <Plane className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-500">
                Hospitality, Tourism & Travel Mart
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Destination Pavilions, Hosted Buyers & Hotelier Procurement
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Connect international travel wholesalers, luxury resort operators, convention bureaus, and airline alliances through pre-scheduled bilateral matchmaking meetings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Button
              onClick={() => {
                setSelectedPavilion("Wonderful Indonesia Luxury Archipelago Pavilion");
                setBuyerDrawerOpen(true);
              }}
              size="lg"
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold shadow-md min-h-[44px]"
            >
              <CalendarCheck className="h-4 w-4 mr-2" />
              Schedule Hosted Buyer Session
            </Button>
            <div className="text-xs text-muted-foreground text-center lg:text-right">
              Pre-qualified outbound travel agents & corporate buyers
            </div>
          </div>
        </div>
      </section>

      {/* 2. Destination Pavilions & Matchmaking Hub */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-500 uppercase tracking-wider mb-1">
            <Globe2 className="h-4 w-4" />
            <span>Destination Showcases</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Flagship Pavilions & Procurement Corridors
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {destinationPavilions.map((dest) => (
            <Card key={dest.id} className="border-border/80 bg-card hover:border-cyan-500/40 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-cyan-500/30 text-cyan-500 bg-cyan-500/10 text-xs font-semibold">
                    {dest.region}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-muted-foreground">{dest.buyers}</span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground leading-snug">{dest.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{dest.highlights}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span>{dest.booth}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Clock className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                    <span>{dest.sessions}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSelectedPavilion(dest.name);
                    setBuyerDrawerOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full border-cyan-500/30 hover:bg-cyan-500/10 text-foreground font-semibold min-h-[40px]"
                >
                  <Handshake className="h-3.5 w-3.5 mr-1.5 text-cyan-500" />
                  Request Buyer Appointment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Hosted Buyer Matchmaking Drawer */}
      <Drawer
        open={buyerDrawerOpen}
        onClose={() => {
          setBuyerDrawerOpen(false);
          setAppointmentBooked(false);
        }}
        title="B2B Hosted Buyer Speed-Matchmaking"
        description="Book a dedicated 20-minute procurement session with official destination delegates and hotelier executives."
      >
        <div className="p-6 space-y-6">
          {appointmentBooked ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-foreground">Buyer Appointment Confirmed</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Your procurement meeting with <span className="font-semibold text-foreground">{selectedPavilion}</span> has been confirmed. Please check in at Hosted Buyer Lounge Table B-12.
                </p>
              </div>
              <Button
                onClick={() => {
                  setBuyerDrawerOpen(false);
                  setAppointmentBooked(false);
                }}
                className="mt-4"
              >
                Done
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAppointmentBooked(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Destination / Hospitality Pavilion
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedPavilion || ""}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-muted/50 text-foreground font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Buyer Procurement Category
                </label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium">
                  <option>MICE Corporate Retreats & Incentive Trips</option>
                  <option>Luxury Hotel & Resort Amenities Wholesale</option>
                  <option>Airline Group Ticketing & Charter Services</option>
                  <option>Inbound DMC & Tour Operator Contracting</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Hosted Buyer Credential Check
                </label>
                <div className="p-3 rounded-lg border border-border/80 bg-muted/20 text-xs text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Verified Travel Industry Professional</span>
                  </div>
                  <p>Hosted buyer meetings are strictly reserved for commercial travel agencies, corporate procurement heads, and event organizers.</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBuyerDrawerOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
                >
                  Confirm Appointment
                </Button>
              </div>
            </form>
          )}
        </div>
      </Drawer>
    </div>
  );
}
