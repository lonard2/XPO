"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  Store,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Edit2,
  AlertCircle,
  Globe,
  Tag,
  Upload,
  Check,
  Trash2,
  UserMinus,
  X,
  LayoutGrid,
  Table,
  Download,
  Maximize2,
  Layers,
  CheckSquare,
  Square,
  MinusSquare,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
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
  dimensions?: string | null;
  areaSqm?: number | null;
  boothType?: string | null;
  event?: {
    title: string;
    venue?: { name: string };
  };
}

interface CsvParsedRow {
  boothNumber: string;
  hallName: string;
  companyName: string;
  industry: string;
  dimensions?: string;
  areaSqm?: number | null;
  boothType?: string;
  websiteUrl: string;
  description: string;
  valid: boolean;
  error?: string;
}

const BOOTH_TYPES: Record<string, { label: string; badgeVariant: "secondary" | "outline" | "success" }> = {
  SHELL_SCHEME: { label: "Shell Scheme", badgeVariant: "secondary" },
  RAW_SPACE: { label: "Raw Space", badgeVariant: "outline" },
  ISLAND: { label: "Island Pavilion", badgeVariant: "success" },
  CORNER: { label: "Corner Lot", badgeVariant: "outline" },
};

// RFC 4180 quote-aware CSV line parser
function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// URL sanitizer to reject javascript: or data: and ensure valid web URL
function sanitizeUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (/^javascript:/i.test(trimmed) || /^data:/i.test(trimmed)) {
    return null;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return null;
}

export default function BoothManagerPage() {
  const tOrg = useTranslations("organizer");

  const [booths, setBooths] = React.useState<BoothItem[]>([]);
  const [events, setEvents] = React.useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = React.useState<string>("ALL");
  const [selectedHall, setSelectedHall] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(true);

  // Dual View Mode
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");

  // Single Booth Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingBooth, setEditingBooth] = React.useState<BoothItem | null>(null);
  const [formEventId, setFormEventId] = React.useState("");
  const [formCompanyName, setFormCompanyName] = React.useState("");
  const [formBoothNumber, setFormBoothNumber] = React.useState("");
  const [formHallName, setFormHallName] = React.useState("");
  const [formIndustry, setFormIndustry] = React.useState("");
  const [formWebsiteUrl, setFormWebsiteUrl] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");
  const [formDimensions, setFormDimensions] = React.useState("3m x 3m");
  const [formAreaSqm, setFormAreaSqm] = React.useState("9");
  const [formBoothType, setFormBoothType] = React.useState("SHELL_SCHEME");
  const [formError, setFormError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");

  // CSV Bulk Import Modal State
  const [isCsvModalOpen, setIsCsvModalOpen] = React.useState(false);
  const [csvRawText, setCsvRawText] = React.useState("");
  const [parsedCsvRows, setParsedCsvRows] = React.useState<CsvParsedRow[]>([]);
  const [isImporting, setIsImporting] = React.useState(false);
  const [csvImportError, setCsvImportError] = React.useState("");

  // Decommission / Delete Booth State
  const [deletingBooth, setDeletingBooth] = React.useState<BoothItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Batch Multi-Select & Bulk Operations State
  const [selectedBoothIds, setSelectedBoothIds] = React.useState<Set<string>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = React.useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = React.useState(false);
  const [isBulkVacating, setIsBulkVacating] = React.useState(false);

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
        dimensions: "6m x 3m",
        areaSqm: 18,
        boothType: "RAW_SPACE",
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
        dimensions: "6m x 6m",
        areaSqm: 36,
        boothType: "ISLAND",
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
        dimensions: "3m x 3m",
        areaSqm: 9,
        boothType: "SHELL_SCHEME",
      },
      {
        id: "b-4",
        eventId: "ev-1",
        companyName: "",
        boothNumber: "Hall A2 - C15",
        hallName: "Hall A2",
        industry: "Available",
        description: "Corner booth near VIP entrance.",
        dimensions: "3m x 3m",
        areaSqm: 9,
        boothType: "CORNER",
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
        dimensions: "6m x 3m",
        areaSqm: 18,
        boothType: "RAW_SPACE",
      },
      {
        id: "b-6",
        eventId: "ev-1",
        companyName: "",
        boothNumber: "Hall B1 - D10",
        hallName: "Hall B1",
        industry: "Available",
        description: "Standard 3x3m shell scheme lot.",
        dimensions: "3m x 3m",
        areaSqm: 9,
        boothType: "SHELL_SCHEME",
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

  // Per-Hall Saturation Telemetry
  const hallStats = React.useMemo(() => {
    return hallsList.map((hall) => {
      const hallBooths = booths.filter((b) => {
        if (selectedEventId !== "ALL" && b.eventId !== selectedEventId) return false;
        return b.hallName === hall;
      });
      const total = hallBooths.length;
      const occupied = hallBooths.filter((b) => b.companyName && b.companyName.trim() !== "").length;
      const available = total - occupied;
      const saturation = total > 0 ? Math.round((occupied / total) * 100) : 0;
      return { hall, total, occupied, available, saturation };
    });
  }, [booths, hallsList, selectedEventId]);

  // Batch Selection Helpers
  const toggleSelectBooth = (id: string) => {
    setSelectedBoothIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allDisplayedSelected =
    filteredBooths.length > 0 && filteredBooths.every((b) => selectedBoothIds.has(b.id));

  const someDisplayedSelected =
    filteredBooths.some((b) => selectedBoothIds.has(b.id)) && !allDisplayedSelected;

  const toggleSelectAll = () => {
    if (allDisplayedSelected) {
      setSelectedBoothIds((prev) => {
        const next = new Set(prev);
        filteredBooths.forEach((b) => next.delete(b.id));
        return next;
      });
    } else {
      setSelectedBoothIds((prev) => {
        const next = new Set(prev);
        filteredBooths.forEach((b) => next.add(b.id));
        return next;
      });
    }
  };

  const clearSelection = () => {
    setSelectedBoothIds(new Set());
  };

  const handleOpenCreateModal = () => {
    setEditingBooth(null);
    setFormCompanyName("");
    setFormBoothNumber("Hall A1 - B" + (booths.length + 1).toString().padStart(2, "0"));
    setFormHallName("Hall A1");
    setFormIndustry("Manufacturing & Robotics");
    setFormDimensions("3m x 3m");
    setFormAreaSqm("9");
    setFormBoothType("SHELL_SCHEME");
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
    setFormDimensions(booth.dimensions || "3m x 3m");
    setFormAreaSqm(booth.areaSqm ? String(booth.areaSqm) : "9");
    setFormBoothType(booth.boothType || "SHELL_SCHEME");
    setFormWebsiteUrl(booth.websiteUrl || "");
    setFormDescription(booth.description || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveBooth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formBoothNumber.trim() || !formHallName.trim()) {
      setFormError("Booth number and hall name are mandatory.");
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanWebsiteUrl = sanitizeUrl(formWebsiteUrl);
      const parsedArea = formAreaSqm.trim() !== "" ? parseFloat(formAreaSqm) : null;

      if (editingBooth) {
        // Update existing
        const res = await fetch("/api/organizer/booths", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingBooth.id,
            companyName: formCompanyName,
            boothNumber: formBoothNumber,
            hallName: formHallName,
            industry: formIndustry,
            dimensions: formDimensions,
            areaSqm: parsedArea,
            boothType: formBoothType,
            websiteUrl: cleanWebsiteUrl,
            description: formDescription,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update booth lot.");
        }
        setBooths(booths.map((b) => (b.id === editingBooth.id ? data.booth : b)));
        setToastMessage(`Booth lot ${formBoothNumber} updated successfully.`);
      } else {
        // Create new
        const targetEventId = formEventId || (selectedEventId !== "ALL" ? selectedEventId : (events[0]?.id || "ev-1"));
        const res = await fetch("/api/organizer/booths", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: targetEventId,
            companyName: formCompanyName,
            boothNumber: formBoothNumber,
            hallName: formHallName,
            industry: formIndustry,
            dimensions: formDimensions,
            areaSqm: parsedArea,
            boothType: formBoothType,
            websiteUrl: cleanWebsiteUrl,
            description: formDescription,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to allocate booth lot.");
        }
        setBooths([...booths, data.booth]);
        setToastMessage(`New booth lot ${formBoothNumber} allocated successfully.`);
      }

      setIsModalOpen(false);
      setTimeout(() => setToastMessage(""), 3500);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete / Decommission Booth Handler
  const handleDeleteBooth = async () => {
    if (!deletingBooth) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/organizer/booths?id=${deletingBooth.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to decommission booth.");
      }
      setBooths(booths.filter((b) => b.id !== deletingBooth.id));
      setToastMessage(`Booth lot "${deletingBooth.boothNumber}" decommissioned successfully.`);
      setDeletingBooth(null);
      setTimeout(() => setToastMessage(""), 3500);
    } catch (err) {
      setToastMessage(`Decommission failed: ${(err as Error).message}`);
      setTimeout(() => setToastMessage(""), 3500);
    } finally {
      setIsDeleting(false);
    }
  };

  // One-Click Vacate / Release Tenant Handler
  const handleVacateBooth = async (booth: BoothItem) => {
    try {
      const res = await fetch("/api/organizer/booths", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: booth.id,
          companyName: "",
          industry: null,
          websiteUrl: null,
          description: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to release tenant.");
      }
      setBooths(booths.map((b) => (b.id === booth.id ? data.booth : b)));
      setToastMessage(`Tenant released from lot "${booth.boothNumber}". Space is now available.`);
      setTimeout(() => setToastMessage(""), 3500);
    } catch (err) {
      setToastMessage(`Failed to release tenant: ${(err as Error).message}`);
      setTimeout(() => setToastMessage(""), 3500);
    }
  };

  // Batch Vacate Tenants Handler
  const handleBulkVacate = async () => {
    if (selectedBoothIds.size === 0) return;
    const ids = Array.from(selectedBoothIds);
    setIsBulkVacating(true);
    try {
      const res = await fetch("/api/organizer/booths", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulk: true,
          ids,
          companyName: "",
          industry: null,
          websiteUrl: null,
          description: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to vacate selected booth tenants.");
      }
      setBooths((prev) =>
        prev.map((b) =>
          selectedBoothIds.has(b.id)
            ? {
                ...b,
                companyName: "",
                industry: null,
                websiteUrl: null,
                description: null,
              }
            : b
        )
      );
      setToastMessage(`Released tenants from ${ids.length} selected booth lots.`);
      clearSelection();
      setTimeout(() => setToastMessage(""), 3500);
    } catch (err) {
      setToastMessage(`Batch vacate failed: ${(err as Error).message}`);
      setTimeout(() => setToastMessage(""), 3500);
    } finally {
      setIsBulkVacating(false);
    }
  };

  // Batch Decommission Booth Lots Handler
  const handleBulkDecommission = async () => {
    if (selectedBoothIds.size === 0) return;
    const ids = Array.from(selectedBoothIds);
    setIsBulkDeleting(true);
    try {
      const res = await fetch("/api/organizer/booths", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to decommission selected booth lots.");
      }
      setBooths((prev) => prev.filter((b) => !selectedBoothIds.has(b.id)));
      setToastMessage(`Decommissioned ${ids.length} booth lots permanently.`);
      clearSelection();
      setIsBulkDeleteModalOpen(false);
      setTimeout(() => setToastMessage(""), 3500);
    } catch (err) {
      setToastMessage(`Batch decommission failed: ${(err as Error).message}`);
      setTimeout(() => setToastMessage(""), 3500);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // One-Click Export Roster to CSV
  const handleExportCsv = () => {
    if (filteredBooths.length === 0) return;

    const headers = [
      "BoothNumber",
      "HallName",
      "CompanyName",
      "Status",
      "Industry",
      "Dimensions",
      "AreaSqm",
      "BoothType",
      "WebsiteUrl",
      "Description",
    ];

    const escapeCsv = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = filteredBooths.map((b) => {
      const isOccupied = b.companyName && b.companyName.trim() !== "";
      return [
        escapeCsv(b.boothNumber),
        escapeCsv(b.hallName),
        escapeCsv(b.companyName || "Unassigned"),
        escapeCsv(isOccupied ? "OCCUPIED" : "AVAILABLE"),
        escapeCsv(b.industry || ""),
        escapeCsv(b.dimensions || ""),
        escapeCsv(b.areaSqm ?? ""),
        escapeCsv(b.boothType || ""),
        escapeCsv(b.websiteUrl || ""),
        escapeCsv(b.description || ""),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const eventSlug = selectedEventId !== "ALL" ? selectedEventId : "all-events";
    link.setAttribute("download", `booth-roster-${eventSlug}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMessage(`Exported ${filteredBooths.length} booth records to CSV.`);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Parse CSV text into preview rows with quote-aware parsing and bounded line count
  const handleParseCsv = (text: string) => {
    setCsvRawText(text);
    setCsvImportError("");
    if (!text.trim()) {
      setParsedCsvRows([]);
      return;
    }

    // Bound maximum parsed lines to 500 to prevent main-thread freeze
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "").slice(0, 500);
    const results: CsvParsedRow[] = [];

    // Check if first row is header
    const startIndex = lines[0]?.toLowerCase().includes("booth") ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const parts = splitCsvLine(lines[i]);
      let boothNumber = "";
      let hallName = "";
      let companyName = "";
      let industry = "";
      let dimensions = "3m x 3m";
      let areaSqm: number | null = 9;
      let boothType = "SHELL_SCHEME";
      let websiteUrl = "";
      let description = "";

      if (parts.length >= 8) {
        boothNumber = parts[0] || "";
        hallName = parts[1] || "";
        companyName = parts[2] || "";
        industry = parts[3] || "";
        dimensions = parts[4] || "3m x 3m";
        areaSqm = parts[5] ? parseFloat(parts[5]) : 9;
        boothType = parts[6] || "SHELL_SCHEME";
        websiteUrl = sanitizeUrl(parts[7]) || "";
        description = parts[8] || "";
      } else {
        boothNumber = parts[0] || "";
        hallName = parts[1] || "";
        companyName = parts[2] || "";
        industry = parts[3] || "";
        websiteUrl = sanitizeUrl(parts[4]) || "";
        description = parts[5] || "";
      }

      const isValid = Boolean(boothNumber && hallName);
      results.push({
        boothNumber,
        hallName,
        companyName,
        industry,
        dimensions,
        areaSqm,
        boothType,
        websiteUrl,
        description,
        valid: isValid,
        error: !isValid ? "Missing booth # or hall name" : undefined,
      });
    }

    setParsedCsvRows(results);
  };

  // Commit CSV batch with real Database Persistence
  const handleCommitCsvImport = async () => {
    const validRows = parsedCsvRows.filter((r) => r.valid);
    if (validRows.length === 0) return;

    setIsImporting(true);
    setCsvImportError("");
    const targetEventId = formEventId || (selectedEventId !== "ALL" ? selectedEventId : (events[0]?.id || "ev-1"));

    try {
      const res = await fetch("/api/organizer/booths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulk: true,
          eventId: targetEventId,
          booths: validRows.map((r) => ({
            boothNumber: r.boothNumber,
            hallName: r.hallName,
            companyName: r.companyName,
            industry: r.industry || "General Industry",
            dimensions: r.dimensions,
            areaSqm: r.areaSqm,
            boothType: r.boothType,
            websiteUrl: r.websiteUrl,
            description: r.description,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to commit bulk CSV import to database.");
      }

      if (data.booths) {
        setBooths(data.booths);
      } else {
        const newItems: BoothItem[] = validRows.map((r, idx) => ({
          id: `b-csv-${Date.now()}-${idx}`,
          eventId: targetEventId,
          boothNumber: r.boothNumber,
          hallName: r.hallName,
          companyName: r.companyName,
          industry: r.industry || "General Industry",
          dimensions: r.dimensions,
          areaSqm: r.areaSqm,
          boothType: r.boothType,
          websiteUrl: r.websiteUrl,
          description: r.description,
        }));
        setBooths((prev) => [...prev, ...newItems]);
      }

      setIsCsvModalOpen(false);
      setCsvRawText("");
      setParsedCsvRows([]);
      setToastMessage(`Successfully persisted ${validRows.length} booth lots to database.`);
      setTimeout(() => setToastMessage(""), 3500);
    } catch (err) {
      setCsvImportError((err as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1800px] mx-auto animate-fade-in">
      {/* Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {tOrg("boothsTitle") || "Booth & Tenant Management Roster"}
            </h1>
            <Badge variant="secondary" size="sm" className="font-semibold">
              {tOrg("managementHub") || "Exhibitor Operations"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {tOrg("boothsSubtitle") || "Assign exhibitors to specific hall grids, track booth occupancy, and manage floor contracts."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredBooths.length === 0}
            className="text-xs gap-1.5 min-h-[44px] px-4 cursor-pointer"
            aria-label="Export booth roster to CSV"
          >
            <Download className="h-4 w-4 text-primary" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCsvModalOpen(true)}
            className="text-xs gap-1.5 min-h-[44px] px-4 cursor-pointer"
          >
            <Upload className="h-4 w-4 text-primary" />
            <span>Import CSV</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            className="text-xs gap-1.5 min-h-[44px] px-4 cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>{tOrg("addBooth") || "Add Booth Lot"}</span>
          </Button>
        </div>
      </div>

      {/* TOAST MESSAGE */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-2.5 text-xs text-emerald-600 dark:text-emerald-400 animate-fade-in shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage("")}
            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 p-1 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border bg-card shadow-xs">
          <div className="text-xs text-muted-foreground font-medium">{tOrg("boothsIndexed") || "Total Booths Indexed"}</div>
          <div className="text-2xl font-bold text-foreground mt-1">{totalCount}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{tOrg("acrossExhibitions", { count: hallsList.length }) || `Across ${hallsList.length} exhibition halls`}</div>
        </Card>

        <Card className="p-4 border-border bg-card shadow-xs">
          <div className="text-xs text-muted-foreground font-medium">{tOrg("occupiedLots") || "Occupied Lots"}</div>
          <div className="text-2xl font-bold text-primary mt-1">{occupiedCount}</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">{tOrg("occupiedOnly") || "Active commercial tenants"}</div>
        </Card>

        <Card className="p-4 border-border bg-card shadow-xs">
          <div className="text-xs text-muted-foreground font-medium">{tOrg("availableUnits") || "Available Units"}</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{availableCount}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{tOrg("availableOnly") || "Ready for immediate allocation"}</div>
        </Card>

        <Card className="p-4 border-border bg-card shadow-xs">
          <div className="text-xs text-muted-foreground font-medium">{tOrg("occupancyRate") || "Floor Occupancy Rate"}</div>
          <div className="text-2xl font-bold text-foreground mt-1">{occupancyPct}%</div>
          <div
            className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden"
            role="progressbar"
            aria-valuenow={occupancyPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={tOrg("occupancyRate") || "Floor Occupancy Rate"}
          >
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${occupancyPct}%` }}
            />
          </div>
        </Card>
      </div>

      {/* INTERACTIVE HALL SATURATION & 1-CLICK FILTER STRIP */}
      {hallsList.length > 0 && (
        <Card className="p-4 border-border bg-card shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Exhibition Hall Saturation & Capacity
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Select any hall to isolate inventory and inspect real-time allocation telemetry
            </span>
          </div>

          <div
            role="group"
            aria-label="Hall saturation filters"
            className="flex flex-wrap items-center gap-2"
          >
            {/* All Halls Pill */}
            <button
              type="button"
              onClick={() => setSelectedHall("ALL")}
              aria-pressed={selectedHall === "ALL"}
              aria-label={`All Halls: ${occupiedCount} of ${totalCount} lots occupied (${occupancyPct}%)`}
              className={cn(
                "min-h-[44px] px-3.5 py-2 rounded-xl border text-xs flex items-center gap-2.5 transition-all cursor-pointer",
                selectedHall === "ALL"
                  ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                  : "bg-muted/40 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/70"
              )}
            >
              <span>All Halls</span>
              <div
                className="w-12 h-1.5 bg-black/20 dark:bg-white/20 rounded-full overflow-hidden inline-block"
                role="progressbar"
                aria-valuenow={occupancyPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="All halls occupancy rate"
              >
                <div
                  className="bg-current h-full rounded-full transition-all"
                  style={{ width: `${occupancyPct}%` }}
                />
              </div>
              <span className="font-mono text-[11px] opacity-90">
                {occupiedCount}/{totalCount} ({occupancyPct}%)
              </span>
            </button>

            {/* Per-Hall Pills */}
            {hallStats.map((item) => {
              const isSelected = selectedHall === item.hall;
              return (
                <button
                  key={item.hall}
                  type="button"
                  onClick={() => setSelectedHall(isSelected ? "ALL" : item.hall)}
                  aria-pressed={isSelected}
                  aria-label={`${item.hall}: ${item.occupied} of ${item.total} lots occupied (${item.saturation}%)`}
                  className={cn(
                    "min-h-[44px] px-3.5 py-2 rounded-xl border text-xs flex items-center gap-2.5 transition-all cursor-pointer",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                      : "bg-muted/40 border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  )}
                >
                  <span>{item.hall}</span>
                  <div
                    className="w-12 h-1.5 bg-black/20 dark:bg-white/20 rounded-full overflow-hidden inline-block"
                    role="progressbar"
                    aria-valuenow={item.saturation}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${item.hall} occupancy rate`}
                  >
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        isSelected
                          ? "bg-current"
                          : item.saturation >= 90
                          ? "bg-rose-500"
                          : item.saturation >= 70
                          ? "bg-amber-500"
                          : "bg-primary"
                      )}
                      style={{ width: `${item.saturation}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] opacity-90">
                    {item.occupied}/{item.total} ({item.saturation}%)
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3.5 text-muted-foreground pointer-events-none" />
            <input
              id="booth-search-input"
              aria-label={tOrg("searchBooths") || "Search exhibitor or booth #"}
              type="text"
              placeholder={tOrg("searchBooths") || "Search exhibitor or booth #..."}
              className="w-full pl-9 pr-3 h-11 min-h-[44px] bg-background border border-input rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Hall Filter */}
          <div>
            <select
              id="booth-hall-filter"
              aria-label={tOrg("allHalls") || "Filter by Exhibition Hall"}
              className="w-full h-11 min-h-[44px] px-3 bg-background border border-input rounded-md text-xs"
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
            >
              <option value="ALL">{tOrg("allHalls") || "All Exhibition Halls"}</option>
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
              id="booth-status-filter"
              aria-label={tOrg("allStatuses") || "Filter by Occupancy Status"}
              className="w-full h-11 min-h-[44px] px-3 bg-background border border-input rounded-md text-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">{tOrg("allStatuses") || "All Statuses (Available & Occupied)"}</option>
              <option value="OCCUPIED">{tOrg("occupiedOnly") || "Occupied / Assigned Only"}</option>
              <option value="AVAILABLE">{tOrg("availableOnly") || "Available / Unassigned Only"}</option>
            </select>
          </div>

          {/* Event Filter */}
          <div>
            <select
              id="booth-event-filter"
              aria-label={tOrg("allEvents") || "Filter by Registered Event"}
              className="w-full h-11 min-h-[44px] px-3 bg-background border border-input rounded-md text-xs"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              <option value="ALL">{tOrg("allEvents") || "All Registered Events"}</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtered Tally Summary Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs text-muted-foreground">
          <div>
            Showing <span className="font-semibold text-foreground">{filteredBooths.length}</span> of{" "}
            <span className="font-semibold text-foreground">{totalCount}</span> floor lots{" "}
            <span className="text-muted-foreground">
              ({filteredBooths.filter((b) => !b.companyName || b.companyName.trim() === "").length} vacant)
            </span>
          </div>
          {(searchQuery || selectedHall !== "ALL" || statusFilter !== "ALL" || selectedEventId !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedHall("ALL");
                setStatusFilter("ALL");
                setSelectedEventId("ALL");
              }}
              className="text-xs text-primary hover:underline font-medium cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* BOOTHS ROSTER SECTION */}
      <section aria-labelledby="booths-roster-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 id="booths-roster-heading" className="text-base font-bold text-foreground">
              Exhibitor Floor Lot Roster
            </h2>
            <span className="text-xs text-muted-foreground">
              {filteredBooths.length} {filteredBooths.length === 1 ? "lot displayed" : "lots displayed"}
            </span>
          </div>

          {/* Dual View Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border shrink-0" role="group" aria-label="Roster view layout">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium min-h-[36px] cursor-pointer transition-colors",
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={viewMode === "grid"}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium min-h-[36px] cursor-pointer transition-colors",
                viewMode === "table"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={viewMode === "table"}
              aria-label="Table view"
            >
              <Table className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Responsive Grid View */}
        {filteredBooths.length > 0 && viewMode === "grid" && (
          <ul role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0 m-0">
            {filteredBooths.map((booth) => {
              const isOccupied = booth.companyName && booth.companyName.trim() !== "";
              return (
                <li key={booth.id} className="list-none">
                  <Card
                    className={cn(
                      "p-5 border flex flex-col justify-between h-full transition-all hover:shadow-md",
                      selectedBoothIds.has(booth.id)
                        ? "border-primary ring-2 ring-primary/40 bg-primary/5"
                        : isOccupied
                        ? "border-border bg-card"
                        : "border-emerald-500/40 bg-emerald-500/5"
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSelectBooth(booth.id)}
                            className="mt-0.5 inline-flex items-center justify-center p-1 rounded hover:bg-muted text-foreground cursor-pointer shrink-0"
                            aria-label={selectedBoothIds.has(booth.id) ? `Deselect booth ${booth.boothNumber}` : `Select booth ${booth.boothNumber}`}
                          >
                            {selectedBoothIds.has(booth.id) ? (
                              <CheckSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Square className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
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
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={isOccupied ? "secondary" : "success"} size="sm">
                            {isOccupied ? "Occupied" : "Available"}
                          </Badge>
                          {booth.boothType && (
                            <Badge variant="outline" size="sm" className="text-[11px] py-0 px-1.5 font-normal">
                              {BOOTH_TYPES[booth.boothType]?.label || booth.boothType}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Physical Dimensions & Space */}
                      {(booth.dimensions || booth.areaSqm) && (
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/40 px-2 py-1 rounded border border-border/40">
                          <Maximize2 className="h-3 w-3 text-primary shrink-0" />
                          <span className="font-medium text-foreground">
                            {booth.dimensions || "Standard Lot"}
                          </span>
                          {booth.areaSqm ? <span>({booth.areaSqm} m²)</span> : null}
                        </div>
                      )}

                      <div className="space-y-1 text-xs text-muted-foreground pt-2 border-t border-border/60">
                        {booth.industry && (
                          <div className="flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span>{booth.industry}</span>
                          </div>
                        )}

                        {booth.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {booth.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-2 mt-4">
                      <div className="truncate min-w-0">
                        {booth.websiteUrl && sanitizeUrl(booth.websiteUrl) ? (
                          <a
                            href={sanitizeUrl(booth.websiteUrl)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 truncate"
                          >
                            <Globe className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{booth.websiteUrl.replace(/^https?:\/\//, "")}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground truncate block">
                            {isOccupied ? "No website linked" : "Available lot"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isOccupied && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs min-h-[36px] px-2.5 gap-1 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
                            onClick={() => handleVacateBooth(booth)}
                            title="Vacate / Release Tenant"
                            aria-label={`Vacate tenant from booth ${booth.boothNumber}`}
                          >
                            <UserMinus className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Vacate</span>
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs min-h-[36px] px-2.5 gap-1 cursor-pointer"
                          onClick={() => handleOpenEditModal(booth)}
                          aria-label={isOccupied ? `Edit booth ${booth.boothNumber}` : `Assign booth ${booth.boothNumber}`}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>{isOccupied ? "Edit" : "Assign"}</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs min-h-[36px] px-2 text-destructive/80 hover:text-destructive hover:border-destructive/40 cursor-pointer"
                          onClick={() => setDeletingBooth(booth)}
                          title="Decommission Lot"
                          aria-label={`Decommission booth ${booth.boothNumber}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}

        {/* High-Density Table View */}
        {filteredBooths.length > 0 && viewMode === "table" && (
          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-muted/70 text-muted-foreground font-semibold border-b border-border sticky top-0 z-10 backdrop-blur-xs">
                  <tr>
                    <th className="p-3 w-10 text-center font-medium">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="inline-flex items-center justify-center p-1 rounded hover:bg-muted text-foreground cursor-pointer"
                        aria-label={allDisplayedSelected ? "Deselect all displayed lots" : "Select all displayed lots"}
                      >
                        {allDisplayedSelected ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : someDisplayedSelected ? (
                          <MinusSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </th>
                    <th className="p-3 font-medium">Booth Lot #</th>
                    <th className="p-3 font-medium">Hall</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Tenant / Exhibitor</th>
                    <th className="p-3 font-medium">Industry</th>
                    <th className="p-3 font-medium">Dimensions & Space</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBooths.map((booth) => {
                    const isOccupied = booth.companyName && booth.companyName.trim() !== "";
                    const isSelected = selectedBoothIds.has(booth.id);
                    return (
                      <tr
                        key={booth.id}
                        className={cn(
                          "transition-colors",
                          isSelected
                            ? "bg-primary/5 hover:bg-primary/10"
                            : "hover:bg-muted/30"
                        )}
                      >
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleSelectBooth(booth.id)}
                            className="inline-flex items-center justify-center p-1 rounded hover:bg-muted text-foreground cursor-pointer"
                            aria-label={isSelected ? `Deselect booth ${booth.boothNumber}` : `Select booth ${booth.boothNumber}`}
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Square className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </td>
                        <td className="p-3 font-mono font-bold text-foreground">
                          {booth.boothNumber}
                        </td>
                        <td className="p-3 font-medium text-foreground">
                          <Badge variant="outline" size="sm">{booth.hallName}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={isOccupied ? "secondary" : "success"} size="sm">
                            {isOccupied ? "Occupied" : "Available"}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-foreground truncate max-w-[200px]">
                            {isOccupied ? booth.companyName : <span className="text-muted-foreground italic font-normal">Unassigned Lot</span>}
                          </div>
                          {booth.websiteUrl && sanitizeUrl(booth.websiteUrl) && (
                            <a
                              href={sanitizeUrl(booth.websiteUrl)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-primary hover:underline flex items-center gap-1 mt-0.5 truncate max-w-[180px]"
                            >
                              <Globe className="h-3 w-3 shrink-0" />
                              <span className="truncate">{booth.websiteUrl.replace(/^https?:\/\//, "")}</span>
                            </a>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {booth.industry || "-"}
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-xs text-foreground">
                            {booth.dimensions || "-"}
                          </div>
                          {booth.areaSqm ? (
                            <div className="text-[11px] text-muted-foreground">{booth.areaSqm} m²</div>
                          ) : null}
                        </td>
                        <td className="p-3">
                          {booth.boothType ? (
                            <Badge variant="outline" size="sm">
                              {BOOTH_TYPES[booth.boothType]?.label || booth.boothType}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isOccupied && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-8 px-2 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
                                onClick={() => handleVacateBooth(booth)}
                                title="Vacate Tenant"
                                aria-label={`Vacate tenant from booth ${booth.boothNumber}`}
                              >
                                <UserMinus className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 px-2.5 gap-1 cursor-pointer"
                              onClick={() => handleOpenEditModal(booth)}
                              aria-label={isOccupied ? `Edit booth ${booth.boothNumber}` : `Assign booth ${booth.boothNumber}`}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span>{isOccupied ? "Edit" : "Assign"}</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 px-2 text-destructive/80 hover:text-destructive hover:border-destructive/40 cursor-pointer"
                              onClick={() => setDeletingBooth(booth)}
                              title="Decommission Lot"
                              aria-label={`Decommission booth ${booth.boothNumber}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {booths.length === 0 ? (
          <Card className="p-8 text-center bg-card rounded-xl border border-border space-y-4 shadow-xs">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
              <Store className="h-6 w-6" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-bold text-foreground">
                No Exhibitor Booths Allocated Yet
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Exhibition booths map commercial exhibitors and sponsors to specific venue hall lots. You can create lots individually or bulk-import an entire floor roster via CSV.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <Button
                size="sm"
                variant="primary"
                onClick={handleOpenCreateModal}
                className="text-xs gap-1.5 min-h-[44px] px-4 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create First Booth Lot</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsCsvModalOpen(true)}
                className="text-xs gap-1.5 min-h-[44px] px-4 cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Bulk Import via CSV</span>
              </Button>
            </div>
          </Card>
        ) : filteredBooths.length === 0 ? (
          <div className="p-12 text-center bg-card rounded-xl border border-border space-y-3">
            <Store className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No Booths Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No exhibitor booths match your active search keyword or hall filters.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedHall("ALL");
                setStatusFilter("ALL");
                setSelectedEventId("ALL");
              }}
              className="text-xs min-h-[44px] px-4 cursor-pointer"
            >
              Clear Filters
            </Button>
          </div>
        ) : null}
      </section>

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
            <div
              role="alert"
              aria-live="assertive"
              className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2 text-xs text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id="modal-booth-number"
              label="Booth Number / ID"
              placeholder="e.g. Hall A1 - B04"
              value={formBoothNumber}
              onChange={(e) => setFormBoothNumber(e.target.value)}
              required
            />
            <Input
              id="modal-hall-name"
              label="Hall Name"
              placeholder="e.g. Hall A1"
              value={formHallName}
              onChange={(e) => setFormHallName(e.target.value)}
              required
            />
          </div>

          <Input
            id="modal-company-name"
            label="Exhibitor Company Name"
            placeholder="e.g. PT Nusantara Robotics (Leave blank if unassigned)"
            value={formCompanyName}
            onChange={(e) => setFormCompanyName(e.target.value)}
          />

          {/* MICE Physical Space & Structure */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              id="modal-dimensions"
              label="Dimensions"
              placeholder="e.g. 3m x 3m, 6m x 3m"
              value={formDimensions}
              onChange={(e) => setFormDimensions(e.target.value)}
            />
            <Input
              id="modal-area"
              label="Floor Area (m²)"
              type="number"
              placeholder="e.g. 9"
              value={formAreaSqm}
              onChange={(e) => setFormAreaSqm(e.target.value)}
            />
            <div>
              <label htmlFor="modal-booth-type" className="block text-xs font-semibold text-foreground mb-1.5">
                Structure Type
              </label>
              <select
                id="modal-booth-type"
                className="w-full h-10 px-3 bg-background border border-input rounded-md text-xs"
                value={formBoothType}
                onChange={(e) => setFormBoothType(e.target.value)}
              >
                <option value="SHELL_SCHEME">Shell Scheme (Standard)</option>
                <option value="RAW_SPACE">Raw Space (Custom Build)</option>
                <option value="ISLAND">Island Pavilion (4-Side Open)</option>
                <option value="CORNER">Corner Lot (2-Side Open)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id="modal-industry"
              label="Industry Classification"
              placeholder="e.g. Industrial Automation"
              value={formIndustry}
              onChange={(e) => setFormIndustry(e.target.value)}
            />
            <Input
              id="modal-website-url"
              label="Website URL"
              placeholder="https://company.com"
              value={formWebsiteUrl}
              onChange={(e) => setFormWebsiteUrl(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="modal-description" className="block text-xs font-semibold text-foreground mb-1.5">
              Booth & Product Description
            </label>
            <textarea
              id="modal-description"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              className="min-h-[44px] px-4 cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="min-h-[44px] px-4 cursor-pointer text-xs"
            >
              {isSubmitting ? "Saving..." : "Save Booth"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CSV BATCH IMPORT MODAL */}
      <Modal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        title="Batch Import Exhibitor Booths (CSV)"
        description="Upload or paste comma-separated booth allocations to bulk populate your exhibition hall roster."
        size="lg"
      >
        <div className="space-y-4 pt-2">
          {csvImportError && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2 text-xs text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{csvImportError}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="csv-input-textarea" className="text-xs font-semibold text-foreground">
                Paste CSV Data (Columns: BoothNumber, HallName, CompanyName, Industry, Dimensions, AreaSqm, BoothType, Website, Description)
              </label>
              <button
                type="button"
                className="text-xs text-primary hover:underline cursor-pointer"
                onClick={() =>
                  handleParseCsv(
                    "BoothNumber, HallName, CompanyName, Industry, Dimensions, AreaSqm, BoothType, Website, Description\nHall A1 - B12, Hall A1, Apex Robotics, Automation, 6m x 3m, 18, RAW_SPACE, https://apex.io, Industrial vision systems\nHall A1 - B14, Hall A1, Synapse AI Labs, Software, 3m x 3m, 9, SHELL_SCHEME, https://synapse.ai, Machine learning pipelines\nHall A2 - C01, Hall A2, EcoBattery Grid, Clean Energy, 6m x 6m, 36, ISLAND, https://ecobattery.org, Commercial ESS solutions"
                  )
                }
              >
                Insert Sample Data
              </button>
            </div>
            <textarea
              id="csv-input-textarea"
              rows={4}
              value={csvRawText}
              onChange={(e) => handleParseCsv(e.target.value)}
              placeholder="Hall A1 - B01, Hall A1, PT Nusantara Robotics, Industrial Automation, 6m x 3m, 18, RAW_SPACE, https://nusantara.com, Heavy arms..."
              className="w-full font-mono rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Validation Table */}
          {parsedCsvRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span>Validation Preview ({parsedCsvRows.filter((r) => r.valid).length} valid of {parsedCsvRows.length} rows)</span>
              </div>
              <div className="max-h-48 overflow-y-auto border border-border rounded-lg text-xs">
                <table className="w-full text-left">
                  <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
                    <tr>
                      <th className="p-2">Status</th>
                      <th className="p-2">Booth #</th>
                      <th className="p-2">Hall</th>
                      <th className="p-2">Company</th>
                      <th className="p-2">Industry</th>
                      <th className="p-2">Space / Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parsedCsvRows.map((row, idx) => (
                      <tr key={idx} className={row.valid ? "hover:bg-muted/30" : "bg-destructive/5 text-destructive"}>
                        <td className="p-2">
                          {row.valid ? (
                            <Badge variant="success" size="sm">Valid</Badge>
                          ) : (
                            <Badge variant="destructive" size="sm">Invalid</Badge>
                          )}
                        </td>
                        <td className="p-2 font-mono">{row.boothNumber}</td>
                        <td className="p-2">{row.hallName}</td>
                        <td className="p-2 font-medium">{row.companyName || "Unassigned"}</td>
                        <td className="p-2">{row.industry || "General Industry"}</td>
                        <td className="p-2 font-mono text-[11px]">
                          {row.dimensions || "3m x 3m"} ({row.areaSqm || 9} m²)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCsvModalOpen(false)}
              className="min-h-[44px] px-4 cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isImporting || parsedCsvRows.filter((r) => r.valid).length === 0}
              onClick={handleCommitCsvImport}
              className="gap-1.5 min-h-[44px] px-4 cursor-pointer text-xs"
            >
              <Check className="h-4 w-4" />
              <span>Import {parsedCsvRows.filter((r) => r.valid).length} Lots</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* DECOMMISSION BOOTH LOT CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deletingBooth}
        onClose={() => !isDeleting && setDeletingBooth(null)}
        title="Decommission Booth Lot"
        description="Are you sure you want to permanently decommission this floor lot from the exhibition hall grid?"
        size="sm"
      >
        <div className="space-y-4 pt-2">
          {deletingBooth && (
            <div className="p-3.5 bg-muted/50 rounded-lg border border-border text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Booth Number:</span>
                <span className="font-mono font-bold text-foreground">{deletingBooth.boothNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Hall:</span>
                <span className="font-semibold text-foreground">{deletingBooth.hallName}</span>
              </div>
              {deletingBooth.companyName && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Assigned Tenant:</span>
                  <span className="font-semibold text-foreground">{deletingBooth.companyName}</span>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-destructive font-medium">
            This action cannot be undone. Commercial assignments and telemetry records associated with this booth lot will be deleted.
          </p>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setDeletingBooth(null)}
              className="min-h-[44px] px-4 cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleDeleteBooth}
              className="min-h-[44px] px-4 cursor-pointer text-xs gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              <span>{isDeleting ? "Decommissioning..." : "Confirm Decommission"}</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* FLOATING STICKY BULK ACTIONS TOOLBAR */}
      {selectedBoothIds.size > 0 && (
        <div
          role="toolbar"
          aria-label="Bulk actions for selected booths"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card/95 backdrop-blur-md border border-primary/40 rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 flex-wrap animate-fade-in"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground pr-2 border-r border-border">
            <Badge variant="secondary" size="sm" className="font-mono font-bold">
              {selectedBoothIds.size}
            </Badge>
            <span>{selectedBoothIds.size === 1 ? "Lot Selected" : "Lots Selected"}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={isBulkVacating}
            onClick={handleBulkVacate}
            className="text-xs min-h-[36px] sm:min-h-[44px] px-3 gap-1.5 cursor-pointer text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400"
            aria-label="Vacate tenants on selected booths"
          >
            <UserMinus className="h-4 w-4" />
            <span>{isBulkVacating ? "Releasing..." : "Vacate Tenants"}</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            disabled={isBulkDeleting}
            onClick={() => setIsBulkDeleteModalOpen(true)}
            className="text-xs min-h-[36px] sm:min-h-[44px] px-3 gap-1.5 cursor-pointer"
            aria-label="Decommission selected booths"
          >
            <Trash2 className="h-4 w-4" />
            <span>Decommission Lots</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="text-xs min-h-[36px] sm:min-h-[44px] px-2.5 gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Clear all selections"
          >
            <X className="h-4 w-4" />
            <span>Clear</span>
          </Button>
        </div>
      )}

      {/* BULK DECOMMISSION BOOTH LOTS CONFIRMATION MODAL */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => !isBulkDeleting && setIsBulkDeleteModalOpen(false)}
        title="Bulk Decommission Booth Lots"
        description={`Are you sure you want to permanently decommission ${selectedBoothIds.size} selected floor lots from the exhibition hall grid?`}
        size="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 bg-muted/50 rounded-lg border border-border text-xs space-y-1.5 max-h-48 overflow-y-auto">
            <div className="font-semibold text-foreground mb-1">
              Selected Lots for Decommission ({selectedBoothIds.size}):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {booths
                .filter((b) => selectedBoothIds.has(b.id))
                .map((b) => (
                  <Badge key={b.id} variant="outline" size="sm" className="font-mono text-[11px]">
                    {b.boothNumber}
                  </Badge>
                ))}
            </div>
          </div>

          <p className="text-xs text-destructive font-medium">
            This action cannot be undone. Commercial assignments and telemetry records associated with all {selectedBoothIds.size} booth lots will be deleted.
          </p>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBulkDeleting}
              onClick={() => setIsBulkDeleteModalOpen(false)}
              className="min-h-[44px] px-4 cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isBulkDeleting}
              onClick={handleBulkDecommission}
              className="min-h-[44px] px-4 cursor-pointer text-xs gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              <span>{isBulkDeleting ? "Decommissioning..." : `Confirm Decommission (${selectedBoothIds.size})`}</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
