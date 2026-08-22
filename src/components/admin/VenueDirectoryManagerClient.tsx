"use client";

import * as React from "react";
import {
  Building2,
  PlusCircle,
  MapPin,
  Layers,
  Train,
  Globe,
  Search,
  Filter,
  CheckCircle2,
  Edit,
  Trash2,
  ExternalLink,
  X,
  Navigation,
  Sparkles,
  Users,
  Compass,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useTranslations } from "next-intl";

export interface VenueHallItem {
  id?: string;
  name: string;
  capacity?: number;
  floorAreaSqm?: number;
  description?: string;
}

export interface VenueItem {
  id: string;
  name: string;
  slug: string;
  regionId: string;
  city: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  transitInfo: string;
  imageUrl?: string | null;
  region?: {
    id: string;
    name: string;
    code: string;
  };
  halls?: VenueHallItem[];
  events?: any[];
}

interface VenueDirectoryManagerClientProps {
  initialVenues: VenueItem[];
  locale: string;
}

export function VenueDirectoryManagerClient({
  initialVenues,
  locale,
}: VenueDirectoryManagerClientProps) {
  let tAdmin: any = (k: string) => k;
  let tVen: any = (k: string) => k;
  let tCom: any = (k: string) => k;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tAdmin = useTranslations("admin");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tVen = useTranslations("venues");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tCom = useTranslations("common");
  } catch {
    // Fallback
  }

  const [venues, setVenues] = React.useState<VenueItem[]>(initialVenues);
  const [regionFilter, setRegionFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingVenue, setEditingVenue] = React.useState<VenueItem | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Map Visualizer Modal State
  const [mapVenue, setMapVenue] = React.useState<VenueItem | null>(null);

  // Form State
  const [formData, setFormData] = React.useState<{
    name: string;
    regionId: string;
    city: string;
    address: string;
    latitude: string;
    longitude: string;
    transitInfo: string;
    imageUrl: string;
    halls: { name: string; capacity: string; floorAreaSqm: string; description: string }[];
  }>({
    name: "",
    regionId: "id",
    city: "",
    address: "",
    latitude: "",
    longitude: "",
    transitInfo: "",
    imageUrl: "",
    halls: [{ name: "Hall A1", capacity: "3000", floorAreaSqm: "5000", description: "Column-free exhibition hall" }],
  });

  const openCreateModal = () => {
    setEditingVenue(null);
    setFormData({
      name: "",
      regionId: regionFilter === "all" ? "id" : regionFilter,
      city: "",
      address: "",
      latitude: "",
      longitude: "",
      transitInfo: "",
      imageUrl: "",
      halls: [{ name: "Hall A1", capacity: "3000", floorAreaSqm: "5000", description: "Column-free exhibition hall" }],
    });
    setFeedbackMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (venue: VenueItem) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      regionId: venue.regionId,
      city: venue.city,
      address: venue.address,
      latitude: venue.latitude ? String(venue.latitude) : "",
      longitude: venue.longitude ? String(venue.longitude) : "",
      transitInfo: venue.transitInfo || "",
      imageUrl: venue.imageUrl || "",
      halls: venue.halls && venue.halls.length > 0
        ? venue.halls.map((h) => ({
            name: h.name,
            capacity: h.capacity ? String(h.capacity) : "",
            floorAreaSqm: h.floorAreaSqm ? String(h.floorAreaSqm) : "",
            description: h.description || "",
          }))
        : [{ name: "Main Hall", capacity: "2500", floorAreaSqm: "4000", description: "" }],
    });
    setFeedbackMessage(null);
    setIsModalOpen(true);
  };

  const handleAddHallRow = () => {
    setFormData((prev) => ({
      ...prev,
      halls: [
        ...prev.halls,
        {
          name: `Hall ${prev.halls.length + 1}`,
          capacity: "2500",
          floorAreaSqm: "4000",
          description: "Flexible multi-purpose convention hall",
        },
      ],
    }));
  };

  const handleRemoveHallRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      halls: prev.halls.filter((_, idx) => idx !== index),
    }));
  };

  const handleHallChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.halls];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, halls: updated };
    });
  };

  const handleSaveVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.city.trim() || !formData.address.trim()) {
      setFeedbackMessage({ type: "error", text: "Name, City, and Address are required fields." });
      return;
    }

    setIsSaving(true);
    setFeedbackMessage(null);

    const payload = {
      name: formData.name.trim(),
      regionId: formData.regionId.toLowerCase(),
      city: formData.city.trim(),
      address: formData.address.trim(),
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      transitInfo: formData.transitInfo.trim() || "Rapid rail transit and bus connection.",
      imageUrl: formData.imageUrl.trim() || "/images/venues/convention-center.jpg",
      halls: formData.halls.map((h) => ({
        name: h.name.trim(),
        capacity: h.capacity ? parseInt(h.capacity, 10) : 2500,
        floorAreaSqm: h.floorAreaSqm ? parseFloat(h.floorAreaSqm) : 4000,
        description: h.description.trim() || null,
      })),
    };

    try {
      if (editingVenue) {
        // PUT /api/admin/venues/[id]
        const res = await fetch(`/api/admin/venues/${editingVenue.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.venue) {
          setVenues((prev) =>
            prev.map((v) => (v.id === editingVenue.id ? data.venue : v))
          );
          setFeedbackMessage({ type: "success", text: `Venue '${data.venue.name}' updated successfully.` });
          setTimeout(() => setIsModalOpen(false), 800);
        } else {
          setFeedbackMessage({ type: "error", text: data.error || "Failed to update venue." });
        }
      } else {
        // POST /api/admin/venues
        const res = await fetch("/api/admin/venues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success && data.venue) {
          setVenues((prev) => [data.venue, ...prev]);
          setFeedbackMessage({ type: "success", text: `Venue '${data.venue.name}' created successfully.` });
          setTimeout(() => setIsModalOpen(false), 800);
        } else {
          setFeedbackMessage({ type: "error", text: data.error || "Failed to create venue." });
        }
      }
    } catch (err) {
      setFeedbackMessage({ type: "error", text: `Network error: ${(err as Error).message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVenue = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete venue '${name}'? This will cascade remove indexed halls.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/venues/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setVenues((prev) => prev.filter((v) => v.id !== id));
      } else {
        alert(`Error deleting venue: ${data.error}`);
      }
    } catch (err) {
      alert(`Network error deleting venue: ${(err as Error).message}`);
    }
  };

  // Filter venues
  const filteredVenues = venues.filter((v) => {
    const vRegion = (v.region?.code || v.regionId || "").toLowerCase();
    const matchesRegion =
      regionFilter === "all" ||
      (regionFilter === "id" && vRegion === "id") ||
      (regionFilter === "jp" && vRegion === "jp") ||
      (regionFilter === "global" && (vRegion === "global" || vRegion === "gl"));

    const matchesSearch =
      searchQuery === "" ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRegion && matchesSearch;
  });

  const getRegionBadge = (regCode?: string) => {
    const code = (regCode || "id").toUpperCase();
    if (code === "ID") {
      return <Badge variant="success" size="sm">Indonesia (ID)</Badge>;
    } else if (code === "JP") {
      return <Badge variant="destructive" size="sm">Japan (JP)</Badge>;
    }
    return <Badge variant="archetype" size="sm">Global Hub (GL)</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar: Filters, Search & Add Venue Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card/70 backdrop-blur-sm">
        {/* Country Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border/60 text-xs overflow-x-auto">
          {[
            { id: "all", label: "All Regions", icon: Globe },
            { id: "id", label: "Indonesia (ID)", icon: MapPin },
            { id: "jp", label: "Japan (JP)", icon: MapPin },
            { id: "global", label: "Global Hubs (GL)", icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = regionFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRegionFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Create Actions */}
        <div className="flex items-center gap-2.5">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search by venue name, city, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              iconPrefix={<Search className="h-4 w-4" />}
              className="h-9 text-xs bg-background/80"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="h-9 gap-1.5 text-xs shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Venue</span>
          </Button>
        </div>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVenues.length === 0 ? (
          <div className="col-span-full text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground text-sm">
            No convention complexes found matching your search and filter criteria.
          </div>
        ) : (
          filteredVenues.map((venue) => {
            const totalCapacity = (venue.halls || []).reduce((acc, h) => acc + (h.capacity || 0), 0);
            const totalFloorArea = (venue.halls || []).reduce((acc, h) => acc + (h.floorAreaSqm || 0), 0);

            return (
              <Card
                key={venue.id}
                className="overflow-hidden border-border/80 bg-card/80 hover:border-primary/50 transition-all flex flex-col group"
              >
                <CardHeader className="p-4 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        {getRegionBadge(venue.region?.code || venue.regionId)}
                        <span className="text-xs font-semibold text-muted-foreground">
                          {venue.city}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {venue.name}
                      </CardTitle>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditModal(venue)}
                        title="Edit Venue"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteVenue(venue.id, venue.name)}
                        title="Delete Venue"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {venue.address}
                  </p>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-3 flex-1">
                  {/* Hall & Capacity Summary Specs */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-2.5 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Indexed Halls</span>
                        <span className="font-bold text-foreground">
                          {venue.halls?.length || 0} Halls
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-emerald-500 shrink-0" />
                      <div>
                        <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Max Capacity</span>
                        <span className="font-bold text-foreground">
                          {totalCapacity > 0 ? `${totalCapacity.toLocaleString()} seats` : "Flexible"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Exact Hall Badges Preview */}
                  {venue.halls && venue.halls.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                        Exact Stage & Hall Directory:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {venue.halls.slice(0, 5).map((hall, idx) => (
                          <Badge key={idx} variant="outline" size="sm" className="text-[10px] bg-background/60">
                            {hall.name} ({hall.capacity ? `${hall.capacity.toLocaleString()}p` : "Hall"})
                          </Badge>
                        ))}
                        {venue.halls.length > 5 && (
                          <Badge variant="neutral" size="sm" className="text-[10px]">
                            +{venue.halls.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Transit Instructions */}
                  {venue.transitInfo && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground pt-1 border-t border-border/40">
                      <Train className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                      <span className="line-clamp-2 leading-relaxed">
                        {venue.transitInfo}
                      </span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-4 pt-2 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setMapVenue(venue)}
                    className="flex items-center gap-1 text-primary hover:underline font-medium cursor-pointer"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    <span>View GPS Pin</span>
                  </button>

                  <span className="text-[10px] text-muted-foreground font-mono">
                    {venue.slug}
                  </span>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>

      {/* VENUE CREATION & EDITING MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVenue ? `Edit Venue: ${editingVenue.name}` : "Create New Exhibition Complex"}
        size="lg"
      >
        <form onSubmit={handleSaveVenue} className="space-y-4 text-xs">
          {feedbackMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-medium border ${
                feedbackMessage.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}
            >
              {feedbackMessage.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">
                Venue Name *
              </label>
              <Input
                placeholder="e.g. JIExpo Kemayoran"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1">
                Country / Regional Hub *
              </label>
              <select
                value={formData.regionId}
                onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
              >
                <option value="id">Indonesia (ID - IDR Currency)</option>
                <option value="jp">Japan (JP - JPY Currency)</option>
                <option value="global">Global Hubs (GL - USD Currency)</option>
              </select>
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1">
                City *
              </label>
              <Input
                placeholder="e.g. Jakarta, Tokyo, Singapore"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1">
                Full Street Address *
              </label>
              <Input
                placeholder="e.g. Gedung Pusat Niaga Lt. 1, Arena PRJ Kemayoran"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1">
                GPS Latitude (Decimal)
              </label>
              <Input
                type="number"
                step="any"
                placeholder="e.g. -6.1466"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1">
                GPS Longitude (Decimal)
              </label>
              <Input
                type="number"
                step="any"
                placeholder="e.g. 106.8488"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-muted-foreground font-semibold mb-1">
                Public Transit & Access Instructions
              </label>
              <Input
                placeholder="e.g. KRL Commuter Line to Rajawali Station; TransJakarta Corridor 12 shuttle."
                value={formData.transitInfo}
                onChange={(e) => setFormData({ ...formData, transitInfo: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-muted-foreground font-semibold mb-1">
                Cover Photo URL
              </label>
              <Input
                placeholder="e.g. https://images.unsplash.com/... or /images/venues/jiexpo.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* EXACT HALL MANAGEMENT SECTION */}
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-foreground text-sm">Exact Exhibition Hall Management</h4>
                <p className="text-muted-foreground text-[11px]">
                  Add individual stages, auditoriums, and convention halls with exact delegate capacity and floor area.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddHallRow}
                className="h-7 text-xs gap-1"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Hall
              </Button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {formData.halls.map((hall, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-border/80 bg-muted/30 grid grid-cols-12 gap-2 items-center text-xs"
                >
                  <div className="col-span-4">
                    <label className="block text-[10px] text-muted-foreground font-semibold">Hall Name</label>
                    <Input
                      placeholder="e.g. Nusantara Hall 2"
                      value={hall.name}
                      onChange={(e) => handleHallChange(idx, "name", e.target.value)}
                      className="h-7 text-xs bg-background"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[10px] text-muted-foreground font-semibold">Capacity (Seats)</label>
                    <Input
                      type="number"
                      placeholder="3500"
                      value={hall.capacity}
                      onChange={(e) => handleHallChange(idx, "capacity", e.target.value)}
                      className="h-7 text-xs bg-background"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[10px] text-muted-foreground font-semibold">Area (Sqm)</label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={hall.floorAreaSqm}
                      onChange={(e) => handleHallChange(idx, "floorAreaSqm", e.target.value)}
                      className="h-7 text-xs bg-background"
                    />
                  </div>
                  <div className="col-span-2 flex justify-end pt-3">
                    {formData.halls.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveHallRow(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
              disabled={isSaving}
            >
              {isSaving ? "Saving Venue..." : editingVenue ? "Update Venue Details" : "Create Venue Complex"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* GPS MAP / COORDINATE PIN VISUALIZER MODAL */}
      {mapVenue && (
        <Modal
          isOpen={true}
          onClose={() => setMapVenue(null)}
          title={`GPS Coordinates & Transit Guide: ${mapVenue.name}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">{mapVenue.name}</h4>
                  <p className="text-muted-foreground text-xs">{mapVenue.city}, {mapVenue.regionId.toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-background rounded-lg border border-border">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Latitude</span>
                  <span className="font-mono text-xs font-bold text-foreground">
                    {mapVenue.latitude ? mapVenue.latitude.toFixed(6) : "N/A (Geo-indexed)"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Longitude</span>
                  <span className="font-mono text-xs font-bold text-foreground">
                    {mapVenue.longitude ? mapVenue.longitude.toFixed(6) : "N/A (Geo-indexed)"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Full Address</span>
                <p className="text-foreground">{mapVenue.address}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Transit Routing</span>
                <p className="text-muted-foreground leading-relaxed">{mapVenue.transitInfo}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {mapVenue.latitude && mapVenue.longitude && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapVenue.latitude},${mapVenue.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" size="sm" className="gap-1 text-xs">
                    <Navigation className="h-3.5 w-3.5" />
                    Open in External Maps
                  </Button>
                </a>
              )}
              <Button variant="outline" size="sm" onClick={() => setMapVenue(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
