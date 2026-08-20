"use client";

import * as React from "react";
import {
  Clock,
  Star,
  MapPin,
  User,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Calendar,
  Layers,
  Sparkles,
  Info,
  BookmarkCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface AgendaSessionItem {
  id: string;
  title: string;
  speakerName?: string | null;
  speakerRole?: string | null;
  location: string;
  startTime: Date | string;
  endTime: Date | string;
  track?: string | null;
}

export interface InteractiveGuidebookProps {
  agendaItems: AgendaSessionItem[];
  eventTitle: string;
  locale?: string;
}

export function InteractiveGuidebook({
  agendaItems,
  eventTitle,
  locale = "en",
}: InteractiveGuidebookProps) {
  const [bookmarkedIds, setBookmarkedIds] = React.useState<Set<string>>(new Set());
  const [selectedTrack, setSelectedTrack] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [filterBookmarkedOnly, setFilterBookmarkedOnly] = React.useState<boolean>(false);
  const [selectedSessionId, setSelectedSessionId] = React.useState<string | null>(null);
  const [showAlertBanner, setShowAlertBanner] = React.useState<boolean>(true);

  // Load bookmarks from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(`xpo_agenda_${eventTitle}`);
      if (saved) {
        setBookmarkedIds(new Set(JSON.parse(saved)));
      }
    } catch {
      // Ignore
    }
  }, [eventTitle]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(`xpo_agenda_${eventTitle}`, JSON.stringify(Array.from(next)));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  // Distinct tracks
  const tracks = React.useMemo(() => {
    const set = new Set<string>();
    agendaItems.forEach((item) => {
      if (item.track) set.add(item.track);
    });
    return ["ALL", ...Array.from(set)];
  }, [agendaItems]);

  // Filtered Sessions
  const filteredSessions = React.useMemo(() => {
    return agendaItems.filter((item) => {
      const matchesTrack = selectedTrack === "ALL" || item.track === selectedTrack;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.speakerName && item.speakerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBookmark = !filterBookmarkedOnly || bookmarkedIds.has(item.id);
      return matchesTrack && matchesSearch && matchesBookmark;
    });
  }, [agendaItems, selectedTrack, searchQuery, filterBookmarkedOnly, bookmarkedIds]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Alert Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Interactive Event Day Guidebook
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Personalize your session itinerary, track keynote speakers, and receive real-time hall updates.
          </p>
        </div>

        {/* Bookmark Filter Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={filterBookmarkedOnly ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterBookmarkedOnly(!filterBookmarkedOnly)}
            className="text-xs gap-1.5 h-9"
          >
            <Star
              className={cn("h-3.5 w-3.5", filterBookmarkedOnly ? "fill-current" : "")}
            />
            My Agenda ({bookmarkedIds.size})
          </Button>
        </div>
      </div>

      {/* 2. Room Change / Live Alert Banner */}
      {showAlertBanner && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3.5 flex items-start justify-between gap-3 text-xs text-amber-500 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <Bell className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
            <div>
              <span className="font-semibold text-amber-400">Live Stage Alert:</span>
              <p className="text-amber-200/90 mt-0.5">
                Plenary Keynotes and Opening Ceremonies commence in Main Exhibition Hall A1. VIP delegate seating opens 30 minutes prior.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAlertBanner(false)}
            className="text-amber-400/80 hover:text-amber-300 text-xs shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. Search & Track Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions, speakers, or topics..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Track Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {tracks.map((track) => (
            <button
              key={track}
              onClick={() => setSelectedTrack(track)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border",
                selectedTrack === track
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {track === "ALL" ? "All Tracks" : track}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Session Timeline List */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border text-muted-foreground space-y-2">
            <Calendar className="h-8 w-8 mx-auto text-muted-foreground/50" />
            <p className="text-sm font-medium">No sessions match your filter criteria.</p>
            {filterBookmarkedOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterBookmarkedOnly(false)}
                className="text-xs text-primary"
              >
                View all scheduled sessions
              </Button>
            )}
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isBookmarked = bookmarkedIds.has(session.id);
            const isExpanded = selectedSessionId === session.id;

            const startTime = new Date(session.startTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            const endTime = new Date(session.endTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={session.id}
                onClick={() => setSelectedSessionId(isExpanded ? null : session.id)}
                className={cn(
                  "rounded-xl border p-4 transition-all duration-200 cursor-pointer bg-card hover:border-primary/50",
                  isBookmarked ? "border-primary/40 bg-primary/2" : "border-border"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Time & Track */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" size="sm" className="font-mono text-xs">
                        <Clock className="h-3 w-3 mr-1 text-primary" />
                        {startTime} - {endTime}
                      </Badge>

                      {session.track && (
                        <Badge variant="secondary" size="sm">
                          {session.track}
                        </Badge>
                      )}

                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {session.location}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors">
                      {session.title}
                    </h4>

                    {session.speakerName && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3.5 w-3.5 text-primary/80" />
                        <span>Speaker: </span>
                        <span className="font-medium text-foreground">{session.speakerName}</span>
                        {session.speakerRole && <span>({session.speakerRole})</span>}
                      </div>
                    )}
                  </div>

                  {/* Bookmark Star Action */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Button
                      variant={isBookmarked ? "secondary" : "ghost"}
                      size="sm"
                      onClick={(e) => toggleBookmark(session.id, e)}
                      className={cn(
                        "h-8 px-2.5 text-xs gap-1.5",
                        isBookmarked ? "text-amber-500 bg-amber-500/10 border border-amber-500/20" : ""
                      )}
                    >
                      <Star
                        className={cn(
                          "h-3.5 w-3.5",
                          isBookmarked ? "fill-amber-500 text-amber-500" : "text-muted-foreground"
                        )}
                      />
                      {isBookmarked ? "Saved" : "Star"}
                    </Button>
                  </div>
                </div>

                {/* Expanded Session Details */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border/60 text-xs text-muted-foreground space-y-2 animate-fade-in">
                    <p>
                      Join industry leaders and peer delegates for an interactive session at {session.location}.
                      Q&A discussion and networking will follow the presentation.
                    </p>
                    <div className="flex items-center gap-4 text-[11px] pt-1">
                      <span className="flex items-center gap-1 text-emerald-500">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Seating Available
                      </span>
                      <span>•</span>
                      <span>Simultaneous translation available in Audio Channel 2</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
