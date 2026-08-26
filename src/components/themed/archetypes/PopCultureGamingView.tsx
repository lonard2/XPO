"use client";

import * as React from "react";
import {
  Gamepad2,
  Sparkles,
  ShieldAlert,
  Camera,
  ShoppingBag,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  Ticket,
  Star,
  Swords,
  Heart,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import type { ArchetypeViewProps } from "./IndustrialB2BView";

export function PopCultureGamingView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [autographDrawerOpen, setAutographDrawerOpen] = React.useState(false);
  const [selectedGuest, setSelectedGuest] = React.useState<string | null>(null);
  const [bookingDone, setBookingDone] = React.useState(false);

  // Creator alley & guests
  const creatorAlley = [
    {
      name: "Sakura Artworks",
      table: "Alley Table C-12",
      genre: "Original Anime Prints & Acrylic Charms",
      specialDrop: "Limited Holographic Art Book (100 copies)",
    },
    {
      name: "CyberForge Studio",
      table: "Alley Table D-04",
      genre: "3D Printed Cosplay Props & LED Armors",
      specialDrop: "Custom Mecha Helmets & Sound Kits",
    },
    {
      name: "PixelNeko Games",
      table: "Indie Hub B-08",
      genre: "Retro JRPG & Deckbuilder Demo",
      specialDrop: "Exclusive Alpha Playtest Steam Keys",
    },
  ];

  // Celebrity guests
  const celebrityGuests = [
    {
      name: "Kenji Takahashi",
      role: "Lead Anime Voice Actor",
      notableWork: "Voice of Shinji in Neon Cyber 2099",
      session: "Main Stage Q&A @ 13:00 | Autographs @ 15:00",
    },
    {
      name: "Aria Thorne (ValkyrieCos)",
      role: "International Cosplay Champion & Judge",
      notableWork: "World Cosplay Summit Winner",
      session: "Cosplay Masterclass @ 11:00 | Photo-Op @ 14:00",
    },
  ];

  const handleBookAutograph = (guestName: string) => {
    setSelectedGuest(guestName);
    setBookingDone(false);
    setAutographDrawerOpen(true);
  };

  return (
    <div className="space-y-12">
      {/* 1. Pop Culture & Gaming Hero Strip */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-fuchsia-400 uppercase tracking-wider">
            <Gamepad2 className="h-4 w-4" aria-hidden="true" />
            <span>Gaming Championship, Cosplay Arena & Creator Alley</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Esports Arena, Celebrity Meet & Greets & Merch Drops
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {event.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="archetype"
              onClick={() => {
                const el = document.getElementById("creator-alley");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs font-semibold shadow-md"
            >
              <Palette className="h-4 w-4" />
              Explore Creator Alley ({creatorAlley.length})
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const el = document.getElementById("cosplay-rules");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs"
            >
              <ShieldAlert className="h-4 w-4 text-pink-400" />
              Cosplay Prop Safety Rules
            </Button>
          </div>
        </div>

        {/* Cosplay Safety Guidelines Card */}
        <Card id="cosplay-rules" className="border-border bg-card shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="warning" size="sm" className="gap-1">
                <ShieldAlert className="h-3.5 w-3.5" />
                Prop Check Desk
              </Badge>
              <Swords className="h-4 w-4 text-purple-400" />
            </div>
            <CardTitle className="text-base">Cosplay Security Guidelines</CardTitle>
            <CardDescription className="text-xs">
              All weapon props must pass safety inspection at Hall A Entrance Inspection Desk.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Foam, EVA, plastic, and lightweight 3D prints permitted.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Zero metal blades, live steel, airsoft, or explosive effects.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Dedicated cosplay repair lounge & changing rooms at Hall C.</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 2. Celebrity Guests & Autograph Booking */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-400" />
          Featured Celebrity Guests & Voice Actors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {celebrityGuests.map((guest, idx) => (
            <Card key={idx} className="border-border hover:border-fuchsia-500/60 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <Badge variant="archetype" size="sm">
                    {guest.role}
                  </Badge>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[var(--archetype-accent)]" />
                    Limited Slots
                  </span>
                </div>
                <CardTitle className="text-lg font-bold">{guest.name}</CardTitle>
                <CardDescription className="text-xs font-medium text-[var(--archetype-accent)]">
                  {guest.notableWork}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="p-2.5 rounded bg-muted/40 text-muted-foreground">{guest.session}</p>
                <div className="pt-2 flex items-center gap-3">
                  <Button
                    variant="archetype"
                    size="sm"
                    onClick={() => handleBookAutograph(guest.name)}
                    className="w-full gap-1.5 text-xs font-semibold"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Book Autograph / Photo-Op Pass
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Creator Alley & Artists */}
      <section id="creator-alley" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Palette className="h-5 w-5 text-pink-400" />
              Creator Alley Showcase & Exclusive Merch
            </h3>
            <p className="text-xs text-muted-foreground">
              Support independent artists, comic illustrators, and indie game developers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creatorAlley.map((creator, i) => (
            <Card key={i} className="border-border/80 hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" size="sm" className="font-mono text-xs font-semibold">
                    {creator.table}
                  </Badge>
                  <Heart className="h-4 w-4 text-pink-500 cursor-pointer" />
                </div>
                <CardTitle className="text-base mt-2">{creator.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{creator.genre}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="p-2 rounded bg-muted/30 border border-border/50 text-xs text-foreground">
                  <span className="font-semibold text-amber-400">Exclusive Drop:</span> {creator.specialDrop}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Stage Agendas & Esports Tournaments */}
      {event.agendaItems.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--archetype-primary)]" />
            Main Stage & Esports Tournament Schedule
          </h3>
          <div className="space-y-3">
            {event.agendaItems.map((agenda) => (
              <div
                key={agenda.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-card border border-border gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning" size="sm">
                      {agenda.track || "Esports Stage"}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {agenda.location}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-foreground">{agenda.title}</h4>
                  {agenda.speakerName && (
                    <p className="text-xs text-muted-foreground">
                      Host/Caster: <span className="font-semibold text-foreground">{agenda.speakerName}</span>
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

      {/* 5. Ticket Tiers & Cosplay Passes */}
      <section id="tickets-section" className="space-y-6 pt-4 border-t border-border">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-5 w-5 text-[var(--archetype-primary)]" />
            Convention Badges & VIP Express Passes
          </h3>
          <p className="text-xs text-muted-foreground">
            VIP passes include 30-minute early exhibition floor entry, fast-lane merch queues, and reserved main stage
            seating.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {event.ticketTiers.map((tier) => {
            let benefits: string[] = [];
            try {
              benefits = JSON.parse(tier.benefitsJson);
            } catch {
              benefits = ["Full convention floor access", "Cosplay locker access", "Collectible lanyard"];
            }

            return (
              <Card key={tier.id} className="flex flex-col border-border/80 hover:border-purple-500 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <Badge variant="secondary" size="sm">
                      {tier.capacity - tier.soldCount} Badges Left
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-foreground">
                      {tier.price > 0
                        ? formatCurrency(tier.price, (tier.currency as SupportedCurrency) || "IDR", locale)
                        : "Free Ticket"}
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
                      Get Convention Pass
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Autograph / Photo-Op Drawer */}
      <Drawer
        isOpen={autographDrawerOpen}
        onClose={() => setAutographDrawerOpen(false)}
        title="Reserve Meet & Greet / Autograph Slot"
        description={`Secure your VIP signature and professional photo-op with ${selectedGuest}`}
      >
        {bookingDone ? (
          <div className="py-12 text-center space-y-3 animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold text-foreground">Slot Reserved!</h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Please present your digital pass QR code at the Guest Signing Lounge 15 minutes before your scheduled
              time slot.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setBookingDone(true);
              setTimeout(() => {
                setAutographDrawerOpen(false);
                setBookingDone(false);
              }, 2500);
            }}
            className="space-y-4 text-xs"
          >
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Featured Guest</label>
              <input
                type="text"
                readOnly
                value={selectedGuest || "Guest"}
                className="w-full px-3 py-2 rounded bg-muted/50 border border-border text-muted-foreground"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Session Type *</label>
              <select className="w-full px-3 py-2 rounded bg-background border border-border focus:ring-1 focus:ring-primary">
                <option>Official Poster Signature + Short Chat</option>
                <option>Professional Duo Photo-Op (Printed 8x10)</option>
                <option>VIP Bundle (Signature + Photo-Op + Fast Lane)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Select Time Window *</label>
              <select className="w-full px-3 py-2 rounded bg-background border border-border focus:ring-1 focus:ring-primary">
                <option>Session 1: 14:00 - 15:00</option>
                <option>Session 2: 16:30 - 17:30</option>
              </select>
            </div>
            <div className="pt-2">
              <Button type="submit" variant="archetype" className="w-full gap-2 font-semibold">
                <Camera className="h-4 w-4" />
                Confirm Reservation
              </Button>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
}
