"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  Store,
  Plus,
  Search,
  Filter,
  Layers,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit2,
  PlusCircle,
  AlertCircle,
  Briefcase,
  Globe,
  Tag,
  BarChart2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface BoothItem {
  id: string;
  eventId: string;
  companyName: string;
  boothNumber: string;
  hallName: string;
  industry?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  event?: {
    title: string;
    venue?: { name: string };
  };
}

export default function BoothManagerPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  let tOrg: any = (k: string) => k;
  let tCom: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tOrg = useTranslations("organizer");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tCom = useTranslations("common");
  } catch {
    // Fallback
  }

  const [booths, setBooths] = React.useState<BoothItem[]>([]);
  const [events, setEvents] = React.useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = React.useState<string>("ALL");
  const [selectedHall, setSelectedHall] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingBooth, setEditingBooth] = React.useState<BoothItem | null>(null);
  const [formEventId, setFormEventId] = React.useState("");
  const [formCompanyName, setFormCompanyName] = React.useState("");
  const [formBoothNumber, setFormBoothNumber] = React.useState("");
  const [formHallName, setFormHallName] = React.useState("");
  const [formIndustry, setFormIndustry] = React.useState("");
  const [formWebsiteUrl, setFormWebsiteUrl] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");
  const [formError, setFormError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");

  const fetchBoothsAndEvents = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch events
      const evRes = await fetch("/api/organizer/events");
      let loadedEvents: any[] = [];
      if (evRes.ok) {
        const evData = await evRes.json();
        loadedEvents = evData.events || [];
        setEvents(loadedEvents);
        if (loadedEvents.length > 0 && !formEventId) {
          setFormEventId(loadedEvents[0].id);
        }
      }

      // Fetch booths
      const bRes = await fetch("/api/organizer/booths");
      if (bRes.ok) {
        const bData = await bRes.json();
        if (bData.booths && bData.booths.length > 0) {
          setBooths(bData.booths);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Default Seeded Booths for instant interaction
    const defaultBooths: BoothItem[] = [
      {
        id: "b-1",
        eventId: "ev-1",
        companyName: "PT Nusantara Robotics",
        boothNumber: "Hall A1 - B01",
        hallName: "Hall A1",
        industry: "Automation & Industrial AI",
        websiteUrl: "https://nusantara-robotics.co.id",
        description: "Heavy robotic arms and computer vision inspection systems.",
      },
      {
        id: "b-2",
        eventId: "ev-1",
        companyName: "Tokyo Precision Machining Ltd",
        boothNumber: "Hall A1 - B04",
        hallName: "Hall A1",
        industry: "Precision Machining & Tooling",
        websiteUrl: "https://tokyo-precision.jp",
        description: "5-axis CNC high-speed milling and EDM machining centers.",
      },
      {
        id: "b-3",
        eventId: "ev-1",
        companyName: "Global Battery Solutions",
        boothNumber: "Hall A2 - C12",
        hallName: "Hall A2",
        industry: "Clean Energy & Storage",
        websiteUrl: "https://globalbattery.com",
        description: "Commercial lithium iron phosphate storage grids.",
      },
      {
        id: "b-4",
        eventId: "ev-1",
        companyName: "",
        boothNumber: "Hall A2 - C15",
        hallName: "Hall A2",
        industry: "Available",
        description: "Corner booth near VIP entrance.",
      },
      {
        id: "b-5",
        eventId: "ev-1",
        companyName: "Pacific Industrial Automation",
        boothNumber: "Hall B1 - D08",
        hallName: "Hall B1",
        industry: "Smart Factory Logistics",
        websiteUrl: "https://pacific-ia.com",
        description: "Automated guided vehicles (AGV) and warehouse conveyors.",
      },
      {
        id: "b-6",
        eventId: "ev-1",
        companyName: "",
        boothNumber: "Hall B1 - D10",
        hallName: "Hall B1",
        industry: "Available",
        description: "Standard 3x3m shell scheme lot.",
      },
    ];

    setBooths(defaultBooths);
    setIsLoading(false);
  }, [formEventId]);

  React.useEffect(() => {
    fetchBoothsAndEvents();
  }, [fetchBoothsAndEvents]);

  // Extract unique halls
  const hallsList = React.useMemo(() => {
    const set = new Set<string>();
    booths.forEach((b) => {
      if (b.hallName) set.add(b.hallName);
    });
    return Array.from(set);
  }, [booths]);

  // Filtered Booths
  const filteredBooths = React.useMemo(() => {
    return booths.filter((b) => {
      // Event filter
      if (selectedEventId !== "ALL" && b.eventId !== selectedEventId) {
        return false;
      }
      // Hall filter
      if (selectedHall !== "ALL" && b.hallName !== selectedHall) {
        return false;
      }
      // Status filter
      const isOccupied = b.companyName && b.companyName.trim() !== "";
      if (statusFilter === "OCCUPIED" && !isOccupied) return false;
      if (statusFilter === "AVAILABLE" && isOccupied) return false;

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = b.companyName?.toLowerCase().includes(q);
        const matchesNum = b.boothNumber?.toLowerCase().includes(q);
        const matchesInd = b.industry?.toLowerCase().includes(q);
        return matchesName || matchesNum || matchesInd;
      }

      return true;
    });
  }, [booths, selectedEventId, selectedHall, statusFilter, searchQuery]);

  // Statistics
  const totalCount = booths.length;
  const occupiedCount = booths.filter((b) => b.companyName && b.companyName.trim() !== "").length;
  const availableCount = totalCount - occupiedCount;
  const occupancyPct = totalCount > 0 ? Math.round((occupiedCount / totalCount) * 100) : 0;

  const handleOpenCreateModal = () => {
    setEditingBooth(null);
    setFormCompanyName("");
    setFormBoothNumber("Hall A1 - B" + (booths.length + 1).toString().padStart(2, "0"));
    setFormHallName("Hall A1");
    setFormIndustry("Manufacturing & Robotics");
    setFormWebsiteUrl("");
    setFormDescription("");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (booth: BoothItem) => {
    setEditingBooth(booth);
    setFormEventId(booth.eventId);
    setFormCompanyName(booth.companyName || "");
    setFormBoothNumber(booth.boothNumber);
    setFormHallName(booth.hallName);
    setFormIndustry(booth.industry || "");
    setFormWebsiteUrl(booth.websiteUrl || "");
    setFormDescription(booth.description || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveBooth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formBoothNumber || !formHallName) {
      setFormError("Booth number and hall name are mandatory.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingBooth) {
        // Update existing
        const res = await fetch("/api/organizer/booths", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingBooth.id,
            companyName: formCompanyName,
            boothNumber: formBoothNumber,
            hallName: formHallName,
            industry: formIndustry,
            websiteUrl: formWebsiteUrl,
            description: formDescription,
          }),
        });

        if (res.ok) {
          setBooths(
            booths.map((b) =>
              b.id === editingBooth.id
                ? {
                    ...b,
                    companyName: formCompanyName,
                    boothNumber: formBoothNumber,
                    hallName: formHallName,
                    industry: formIndustry,
                    websiteUrl: formWebsiteUrl,
                    description: formDescription,
                  }
                : b
            )
          );
        }
      } else {
        // Create new
        const targetEventId = formEventId || (events[0]?.id || "ev-1");
        const res = await fetch("/api/organizer/booths", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: targetEventId,
            companyName: formCompanyName,
            boothNumber: formBoothNumber,
            hallName: formHallName,
            industry: formIndustry,
            websiteUrl: formWebsiteUrl,
            description: formDescription,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setBooths([...booths, data.booth]);
        } else {
          // Local fallback creation
          const newB: BoothItem = {
            id: `b-${Date.now()}`,
            eventId: targetEventId,
            companyName: formCompanyName,
            boothNumber: formBoothNumber,
            hallName: formHallName,
            industry: formIndustry,
            websiteUrl: formWebsiteUrl,
            description: formDescription,
          };
          setBooths([...booths, newB]);
        }
      }

      setToastMessage("Booth allocation updated successfully!");
      setIsModalOpen(false);
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1800px] mx-auto animate-fade-in">
      {/* Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              {tOrg("managementHub") || "Exhibitor Operations"}
            </span>
            <Badge variant="archetype" size="sm">Hall Floor Roster</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
            {tOrg("boothsTitle") || "Booth & Tenant Management Roster"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tOrg("boothsSubtitle") || "Assign exhibitors to specific hall grids, track booth occupancy, and manage floor contracts."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            className="text-xs gap-1.5 h-9 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{tOrg("addBooth") || "Add Booth Lot"}</span>
          </Button>
        </div>
      </div>

      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border bg-card">
          <div className="text-xs text-muted-foreground font-medium">Total Booths Indexed</div>
          <div className="text-2xl font-bold text-foreground mt-1">{totalCount}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Across {hallsList.length} exhibition halls</div>
        </Card>

        <Card className="p-4 border-border bg-card">
          <div className="text-xs text-muted-foreground font-medium">Occupied Lots</div>
          <div className="text-2xl font-bold text-primary mt-1">{occupiedCount}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Active commercial tenants</div>
        </Card>

        <Card className="p-4 border-border bg-card">
          <div className="text-xs text-muted-foreground font-medium">Available Units</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{availableCount}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Ready for immediate allocation</div>
        </Card>

        <Card className="p-4 border-border bg-card">
          <div className="text-xs text-muted-foreground font-medium">Floor Occupancy Rate</div>
          <div className="text-2xl font-bold text-foreground mt-1">{occupancyPct}%</div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${occupancyPct}%` }}
            />
          </div>
        </Card>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-card p-4 rounded-xl border border-border space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search exhibitor or booth #..."
              className="w-full pl-9 pr-3 py-1.5 bg-background border border-input rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Hall Filter */}
          <div>
            <select
              className="w-full py-1.5 px-3 bg-background border border-input rounded-md text-xs"
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
            >
              <option value="ALL">All Exhibition Halls</option>
              {hallsList.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="w-full py-1.5 px-3 bg-background border border-input rounded-md text-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses (Available & Occupied)</option>
              <option value="OCCUPIED">Occupied / Assigned Only</option>
              <option value="AVAILABLE">Available / Unassigned Only</option>
            </select>
          </div>

          {/* Event Filter */}
          <div>
            <select
              className="w-full py-1.5 px-3 bg-background border border-input rounded-md text-xs"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              <option value="ALL">All Registered Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* BOOTHS ROSTER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooths.map((booth) => {
          const isOccupied = booth.companyName && booth.companyName.trim() !== "";
          return (
            <Card
              key={booth.id}
              className={cn(
                "p-5 border flex flex-col justify-between transition-all hover:shadow-md",
                isOccupied
                  ? "border-border bg-card"
                  : "border-emerald-500/40 bg-emerald-500/5"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground">
                        {booth.boothNumber}
                      </span>
                      <Badge variant="outline" size="sm">{booth.hallName}</Badge>
                    </div>
                    <h3 className="text-base font-bold text-foreground mt-1 truncate">
                      {isOccupied ? booth.companyName : "Available Lot"}
                    </h3>
                  </div>

                  <Badge variant={isOccupied ? "archetype" : "success"} size="sm">
                    {isOccupied ? "Occupied" : "Available"}
                  </Badge>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground pt-2 border-t border-border/60">
                  {booth.industry && (
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{booth.industry}</span>
                    </div>
                  )}

                  {booth.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                      {booth.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-2 mt-4">
                {booth.websiteUrl ? (
                  <a
                    href={booth.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 truncate"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span className="truncate">{booth.websiteUrl.replace(/^https?:\/\//, "")}</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-muted-foreground">Unassigned tenant</span>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 gap-1"
                  onClick={() => handleOpenEditModal(booth)}
                >
                  <Edit2 className="h-3 w-3" />
                  <span>{isOccupied ? "Edit" : "Assign"}</span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredBooths.length === 0 && (
        <div className="p-12 text-center bg-card rounded-xl border border-border space-y-3">
          <Store className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Booths Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No exhibitor booths match your active search keyword or hall filters.
          </p>
        </div>
      )}

      {/* EXHIBITOR ALLOCATION MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBooth ? "Assign Exhibitor Tenant" : "Create Exhibition Booth Lot"}
        description="Configure floor hall number, company tenant, industry classification, and public web metadata."
        size="md"
      >
        <form onSubmit={handleSaveBooth} className="space-y-4 pt-2">
          {formError && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Booth Number / ID"
              placeholder="e.g. Hall A1 - B04"
              value={formBoothNumber}
              onChange={(e) => setFormBoothNumber(e.target.value)}
              required
            />
            <Input
              label="Hall Name"
              placeholder="e.g. Hall A1"
              value={formHallName}
              onChange={(e) => setFormHallName(e.target.value)}
              required
            />
          </div>

          <Input
            label="Exhibitor Company Name"
            placeholder="e.g. PT Nusantara Robotics (Leave blank if unassigned)"
            value={formCompanyName}
            onChange={(e) => setFormCompanyName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Industry Classification"
              placeholder="e.g. Industrial Automation"
              value={formIndustry}
              onChange={(e) => setFormIndustry(e.target.value)}
            />
            <Input
              label="Website URL"
              placeholder="https://company.com"
              value={formWebsiteUrl}
              onChange={(e) => setFormWebsiteUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Booth & Product Description
            </label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              placeholder="Exhibitor product lineup, live demos, or booth location notes..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Booth"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
