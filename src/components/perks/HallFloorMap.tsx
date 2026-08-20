"use client";

import * as React from "react";
import {
  Map as MapIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Coffee,
  Layers,
  Search,
  ExternalLink,
  Navigation,
  Sparkles,
  Info,
  CheckCircle2,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface BoothItem {
  id: string;
  companyName: string;
  boothNumber: string;
  hallName: string;
  industry?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  description?: string | null;
}

export interface HallFloorMapProps {
  booths: BoothItem[];
  venueName: string;
  hallName?: string | null;
  locale?: string;
}

export function HallFloorMap({
  booths,
  venueName,
  hallName,
  locale = "en",
}: HallFloorMapProps) {
  const [zoomLevel, setZoomLevel] = React.useState<number>(1);
  const [selectedHall, setSelectedHall] = React.useState<string>("ALL");
  const [selectedBooth, setSelectedBooth] = React.useState<BoothItem | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Extract unique halls from booths
  const halls = React.useMemo(() => {
    const set = new Set<string>();
    booths.forEach((b) => {
      if (b.hallName) set.add(b.hallName);
    });
    return ["ALL", ...Array.from(set)];
  }, [booths]);

  // Filter booths
  const filteredBooths = React.useMemo(() => {
    return booths.filter((b) => {
      const matchesHall = selectedHall === "ALL" || b.hallName === selectedHall;
      const matchesSearch =
        b.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.boothNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.industry && b.industry.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesHall && matchesSearch;
    });
  }, [booths, selectedHall, searchQuery]);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.0, z + 0.25));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.75, z - 0.25));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MapIcon className="h-5 w-5 text-primary" />
            Interactive SVG Hall Floor Plan
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {venueName} {hallName ? `• ${hallName}` : ""} — Navigate exhibitor booths, VIP lounges, and amenities.
          </p>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="h-7 w-7 p-0"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="h-7 w-7 p-0"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetZoom}
            className="h-7 w-7 p-0"
            title="Reset Zoom"
            aria-label="Reset Zoom"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 2. Hall Selector & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Hall Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {halls.map((h) => (
            <button
              key={h}
              onClick={() => {
                setSelectedHall(h);
                setSelectedBooth(null);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border",
                selectedHall === h
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {h === "ALL" ? "All Exhibition Halls" : h}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search booth or exhibitor..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* 3. Interactive SVG Floor Canvas */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-slate-950 p-4 sm:p-8 min-h-[440px] flex items-center justify-center select-none shadow-xl">
        <div
          className="transition-transform duration-300 ease-out origin-center w-full max-w-4xl"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox="0 0 900 500"
            className="w-full h-auto drop-shadow-2xl"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Floor Background Grid */}
            <defs>
              <pattern id="floorGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="900" height="500" fill="url(#floorGrid)" rx="16" />

            {/* Hall Perimeter Outer Boundary */}
            <rect
              x="20"
              y="20"
              width="860"
              height="460"
              fill="none"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="6 6"
              rx="12"
            />

            {/* Main Entrance / Registration Lobby */}
            <rect x="360" y="440" width="180" height="35" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" rx="6" />
            <text x="450" y="462" fill="#60a5fa" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              MAIN REGISTRATION LOBBY
            </text>

            {/* VIP Lounge & Barista Station (Top Right) */}
            <rect x="670" y="40" width="190" height="90" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" rx="8" />
            <text x="765" y="75" fill="#a5b4fc" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              VIP BUYER LOUNGE
            </text>
            <text x="765" y="95" fill="#818cf8" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
              Barista Coffee & Meeting Suites
            </text>

            {/* Keynote Plenary Stage (Top Left) */}
            <rect x="40" y="40" width="220" height="110" fill="#022c22" stroke="#10b981" strokeWidth="1.5" rx="8" />
            <text x="150" y="85" fill="#6ee7b7" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              PLENARY KEYNOTE STAGE
            </text>
            <text x="150" y="105" fill="#34d399" fontSize="10" textAnchor="middle" fontFamily="sans-serif">
              Hall A1 • Multi-Track Audio
            </text>

            {/* Restrooms & Amenities (Bottom Left) */}
            <rect x="40" y="380" width="140" height="60" fill="#1e293b" stroke="#475569" strokeWidth="1" rx="6" />
            <text x="110" y="415" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              RESTROOMS / FIRST AID
            </text>

            {/* Food Court & Networking Deck (Top Center) */}
            <rect x="340" y="40" width="220" height="60" fill="#1e293b" stroke="#475569" strokeWidth="1" rx="6" />
            <text x="450" y="75" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              CAFETERIA & NETWORKING DECK
            </text>

            {/* Interactive Exhibitor Booth Grid (3 rows x 4 cols = 12 booths) */}
            {filteredBooths.slice(0, 12).map((booth, index) => {
              // 4 columns, 3 rows
              const col = index % 4;
              const row = Math.floor(index / 4);

              const startX = 140 + col * 170;
              const startY = 140 + row * 90;
              const width = 140;
              const height = 65;

              const isSelected = selectedBooth?.id === booth.id;

              return (
                <g
                  key={booth.id}
                  onClick={() => setSelectedBooth(booth)}
                  className="cursor-pointer group"
                >
                  {/* Booth Box */}
                  <rect
                    x={startX}
                    y={startY}
                    width={width}
                    height={height}
                    fill={isSelected ? "#1d4ed8" : "#0f172a"}
                    stroke={isSelected ? "#60a5fa" : "#334155"}
                    strokeWidth={isSelected ? "2.5" : "1.5"}
                    rx="8"
                    className="transition-all duration-200 group-hover:stroke-blue-400 group-hover:fill-slate-900"
                  />

                  {/* Booth Number Badge */}
                  <rect
                    x={startX + 8}
                    y={startY + 8}
                    width="55"
                    height="18"
                    fill={isSelected ? "#3b82f6" : "#1e293b"}
                    rx="4"
                  />
                  <text
                    x={startX + 35}
                    y={startY + 21}
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {booth.boothNumber.split(" - ")[1] || booth.boothNumber}
                  </text>

                  {/* Company Name */}
                  <text
                    x={startX + 10}
                    y={startY + 42}
                    fill={isSelected ? "#ffffff" : "#f1f5f9"}
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {booth.companyName.length > 15
                      ? booth.companyName.substring(0, 14) + "…"
                      : booth.companyName}
                  </text>

                  {/* Industry tag */}
                  <text
                    x={startX + 10}
                    y={startY + 56}
                    fill={isSelected ? "#bfdbfe" : "#94a3b8"}
                    fontSize="8.5"
                    fontFamily="sans-serif"
                  >
                    {booth.industry ? booth.industry.substring(0, 18) : booth.hallName}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend Overlay (Bottom Right) */}
        <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-xs border border-slate-800 rounded-lg p-2.5 text-[10px] text-slate-300 space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-xs bg-blue-600" />
            <span>Exhibitor Booth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-xs bg-indigo-600" />
            <span>VIP Lounge</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-xs bg-emerald-600" />
            <span>Keynote Stage</span>
          </div>
        </div>
      </div>

      {/* 4. Selected Booth Detail Card Drawer */}
      {selectedBooth && (
        <Card className="border-primary/50 bg-card shadow-lg animate-fade-in">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="archetype" size="sm" className="font-mono">
                  {selectedBooth.boothNumber}
                </Badge>
                <span className="text-xs text-muted-foreground">{selectedBooth.hallName}</span>
              </div>
              <button
                onClick={() => setSelectedBooth(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
            <CardTitle className="text-base sm:text-lg mt-1">
              {selectedBooth.companyName}
            </CardTitle>
            {selectedBooth.industry && (
              <p className="text-xs text-primary font-medium">{selectedBooth.industry}</p>
            )}
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3 text-xs">
            {selectedBooth.description && (
              <p className="text-muted-foreground">{selectedBooth.description}</p>
            )}
            <div className="flex items-center gap-3 pt-2 border-t border-border/50">
              <div className="flex items-center gap-1 text-emerald-500 font-medium">
                <Navigation className="h-3.5 w-3.5" />
                <span>Directions: 2 min walk from Main Entrance</span>
              </div>
              {selectedBooth.websiteUrl && (
                <a
                  href={selectedBooth.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-primary hover:underline flex items-center gap-1"
                >
                  <span>Exhibitor Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
