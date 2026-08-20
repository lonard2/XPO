"use client";

import * as React from "react";
import {
  Store,
  Sparkles,
  MapPin,
  Tag,
  Clock,
  Car,
  CheckCircle2,
  Ticket,
  Flame,
  Percent,
  Search,
  Building2,
  Calendar,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import type { ArchetypeViewProps } from "./IndustrialB2BView";

export function MegaExpoPavilionView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [selectedPavilion, setSelectedPavilion] = React.useState("ALL");

  // Pavilions directory
  const pavilions = [
    { id: "A", name: "Hall A: Automotive & Smart EV Expo", icon: "Car", tenantsCount: 48, theme: "Electric Mobility & Auto Accessories" },
    { id: "B", name: "Hall B: Consumer Electronics & Smart Home", icon: "Store", tenantsCount: 82, theme: "Smartphones, TVs & Gaming PCs" },
    { id: "C", name: "Hall C: Nusantara Culinary Village & Food Hall", icon: "Flame", tenantsCount: 120, theme: "Regional Street Foods & Coffee Masters" },
    { id: "D", name: "Hall D: Home Living, Furniture & Garment Fair", icon: "Building2", tenantsCount: 65, theme: "Batik, Handcrafts & Interior Decor" },
  ];

  // Nightly Fireworks & Carnival Schedule
  const nightlyHighlights = [
    { title: "Spectacular Mega Fireworks Show", time: "21:00 Daily", venue: "Open Space Arena", icon: Sparkles },
    { title: "Indonesian Cultural Carnival Parade", time: "16:00 & 19:30", venue: "Grand Boulevard", icon: Flame },
    { title: "Midnight Flash Sale Blitz (Up to 70% Off)", time: "22:00 - 23:30 Sat/Sun", venue: "All Exhibition Halls", icon: Percent },
  ];

  // Tenant promo radar
  const promoCoupons = [
    { store: "Samsung Galaxy Arena", discount: "Cashback up to Rp 2.500.000 + Free Earbuds", hall: "Hall B - Booth 10" },
    { store: "Hyundai EV Hub", discount: "Special Fair Financing 0% + Free Wallbox Charger", hall: "Hall A - Booth 02" },
    { store: "Kerak Telor Batavia Legend", discount: "Buy 2 Get 1 Free Promo Voucher", hall: "Hall C - Food Stall 44" },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Mega Fair & Pavilion Hero Strip */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-wider">
            <Store className="h-4 w-4" aria-hidden="true" />
            <span>National Trade Fair, Multi-Hall Pavilions & Carnival</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Multi-Pavilion Mega Fair, Nightly Fireworks & Flash Promos
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {event.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="archetype"
              onClick={() => {
                const el = document.getElementById("pavilions-guide");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs font-semibold shadow-md"
            >
              <Store className="h-4 w-4" />
              Explore All Pavilions & Halls
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const el = document.getElementById("promo-radar");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs"
            >
              <Tag className="h-4 w-4 text-orange-500" />
              Promo Radar & Coupons
            </Button>
          </div>
        </div>

        {/* Nightly Fireworks & Shows Card */}
        <Card className="border-border bg-card shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="warning" size="sm" className="gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Nightly Spectacle
              </Badge>
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <CardTitle className="text-base">Grand Arena Fireworks</CardTitle>
            <CardDescription className="text-xs">
              Pyrotechnic displays lighting up the night sky throughout the fair duration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {nightlyHighlights.map((show, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-muted/40 border border-border/70 space-y-1">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span>{show.title}</span>
                  <span className="font-mono text-orange-400">{show.time}</span>
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {show.venue}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* 2. Multi-Pavilion Guide */}
      <section id="pavilions-guide" className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Layers className="h-5 w-5 text-orange-500" />
            Multi-Pavilion Hall Directory
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Spanning multiple connected exhibition wings, outdoor arenas, and gourmet dining promenades.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pavilions.map((pavilion) => (
            <Card key={pavilion.id} className="border-border hover:border-orange-500 transition-all flex flex-col justify-between">
              <CardHeader className="p-4 pb-2">
                <Badge variant="archetype" size="sm" className="w-fit mb-2 font-mono">
                  {pavilion.tenantsCount}+ Brands
                </Badge>
                <CardTitle className="text-sm font-bold">{pavilion.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  {pavilion.theme}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[11px] text-muted-foreground">
                  <span>Air-Conditioned Hall</span>
                  <span className="text-orange-500 font-semibold cursor-pointer hover:underline">
                    View Booth Map
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Promo Radar & Tenant Flash Discounts */}
      <section id="promo-radar" className="p-6 rounded-xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-bold text-foreground">Expo Promo Radar & Exclusive Deals</h3>
          </div>
          <Badge variant="success" size="sm">
            Live Verified Promos
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {promoCoupons.map((promo, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-muted/40 border border-border/70 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-foreground">{promo.store}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{promo.hall}</span>
              </div>
              <p className="text-xs font-bold text-orange-500">{promo.discount}</p>
              <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Present XPO pass at counter</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Ticket Tiers & Mega Fair Pass Selection */}
      <section id="tickets-section" className="space-y-6 pt-4 border-t border-border">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-5 w-5 text-[var(--archetype-primary)]" />
            Fair Admission Passes & Multi-Day Family Bundles
          </h3>
          <p className="text-xs text-muted-foreground">
            Children under 100cm enter free. Passes grant admission to all commercial pavilions and nightly concerts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {event.ticketTiers.map((tier) => {
            let benefits: string[] = [];
            try {
              benefits = JSON.parse(tier.benefitsJson);
            } catch {
              benefits = ["All exhibition halls entry", "Nightly concert arena access", "Carnival coupon booklet"];
            }

            return (
              <Card key={tier.id} className="flex flex-col border-border/80 hover:border-orange-500 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <Badge variant="secondary" size="sm">
                      {tier.capacity - tier.soldCount} Available
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-foreground">
                      {tier.price > 0
                        ? formatCurrency(tier.price, (tier.currency as SupportedCurrency) || "IDR", locale)
                        : "Free Entry"}
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
                      Get Admission Pass
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
