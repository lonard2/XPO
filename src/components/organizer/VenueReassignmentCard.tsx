"use client";

import * as React from "react";
import Link from "next/link";
import { Layers, MapPin, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { normalizeSpaceKind, normalizeVenueType } from "@/lib/discovery/venueTypes";

interface VenueHallOption {
  id: string;
  name: string;
  kind?: string | null;
  capacity?: number | null;
}

interface VenueOption {
  id: string;
  name: string;
  city: string;
  regionId: string;
  type?: string | null;
  size?: string | null;
  halls?: VenueHallOption[];
}

interface Baseline {
  venueId: string;
  hallIds: string[];
  regionId: string;
}

export interface VenueReassignmentCardProps {
  eventId: string;
  locale: string;
  eventSlug: string;
  currentVenue: { id: string; name: string; regionId: string; type?: string | null };
  currentHallIds: string[];
  booths?: Array<{ hallName?: string | null }>;
  agendaItems?: Array<{ location?: string | null }>;
  currentPageSize?: string | null;
  onSaved?: (saved: {
    venue: { id: string; name: string };
    venueHall: { id: string; name: string } | null;
    regionId: string;
    venueHallIds: string | null;
  }) => void;
}

const sortIds = (ids: string[]) => [...ids].sort();

export function VenueReassignmentCard({
  eventId,
  locale,
  eventSlug,
  currentVenue,
  currentHallIds,
  booths,
  agendaItems,
  currentPageSize,
  onSaved,
}: VenueReassignmentCardProps) {
  const t = useTranslations("venueReassignment");
  const tRegions = useTranslations("regions");
  const tSpaceKind = useTranslations("spaceKinds");
  const tVenueType = useTranslations("venueTypes");

  const [venues, setVenues] = React.useState<VenueOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadFailed, setLoadFailed] = React.useState(false);
  const [selectedVenueId, setSelectedVenueId] = React.useState(currentVenue.id);
  const [selectedHallIds, setSelectedHallIds] = React.useState<string[]>(currentHallIds);
  const [baseline, setBaseline] = React.useState<Baseline>({
    venueId: currentVenue.id,
    hallIds: currentHallIds,
    regionId: currentVenue.regionId,
  });
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [saveError, setSaveError] = React.useState("");
  // Space names from the venue just left, kept after saving so the warning
  // and its links survive the save that the copy tells the organizer to make.
  const [staleHallNames, setStaleHallNames] = React.useState<string[]>([]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadVenues() {
      try {
        const res = await fetch("/api/organizer/venues?take=500");
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error("venue list unavailable");
        if (!cancelled) setVenues(Array.isArray(data.venues) ? data.venues : []);
      } catch {
        if (!cancelled) setLoadFailed(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadVenues();
    return () => {
      cancelled = true;
    };
  }, []);

  const regionLabel = React.useCallback(
    (regionId?: string | null) => {
      const raw = (regionId || "global").trim().toLowerCase();
      const code = raw === "gl" ? "global" : raw;
      try {
        const label = tRegions(`${code}.name`);
        if (label && label !== `${code}.name`) return label;
      } catch {
        // Unknown region code: fall through to the global edition label.
      }
      return tRegions("global.name");
    },
    [tRegions]
  );

  const activeVenue = React.useMemo(
    () => venues.find((venue) => venue.id === selectedVenueId) || null,
    [venues, selectedVenueId]
  );

  const venueGroups = React.useMemo(() => {
    const groups = new Map<string, VenueOption[]>();
    for (const venue of venues) {
      const raw = (venue.regionId || "global").trim().toLowerCase();
      const code = raw === "gl" ? "global" : raw;
      if (!groups.has(code)) groups.set(code, []);
      groups.get(code)!.push(venue);
    }
    return [...groups.entries()];
  }, [venues]);

  const baselineVenue = React.useMemo(
    () => venues.find((venue) => venue.id === baseline.venueId) || null,
    [venues, baseline.venueId]
  );

  const regionChanged = Boolean(
    activeVenue && activeVenue.regionId !== baseline.regionId
  );

  const changed =
    selectedVenueId !== baseline.venueId ||
    JSON.stringify(sortIds(selectedHallIds)) !== JSON.stringify(sortIds(baseline.hallIds));

  const staleCount = React.useMemo(() => {
    if (!activeVenue) return 0;
    const oldNames =
      staleHallNames.length > 0
        ? staleHallNames
        : selectedVenueId === baseline.venueId
          ? []
          : (baselineVenue?.halls || []).map((hall) => hall.name);
    const newNames = (activeVenue.halls || []).map((hall) => hall.name);
    if (oldNames.length === 0) return 0;

    const namesOld = (text?: string | null) =>
      Boolean(text) && oldNames.some((name) => text!.includes(name));
    const namesNew = (text?: string | null) =>
      Boolean(text) && newNames.some((name) => text!.includes(name));

    const boothHits = (booths || []).filter(
      (booth) => namesOld(booth.hallName) && !namesNew(booth.hallName)
    ).length;
    const agendaHits = (agendaItems || []).filter(
      (item) => namesOld(item.location) && !namesNew(item.location)
    ).length;

    return boothHits + agendaHits;
  }, [
    activeVenue,
    baseline.venueId,
    baselineVenue,
    booths,
    agendaItems,
    selectedVenueId,
    staleHallNames,
  ]);

  const handleVenueChange = (venueId: string) => {
    const next = venues.find((venue) => venue.id === venueId);
    setSelectedVenueId(venueId);
    setSelectedHallIds(next?.halls?.[0]?.id ? [next.halls[0].id] : []);
    setStaleHallNames([]);
    setSaved(false);
    setSaveError("");
  };

  const handleHallToggle = (hallId: string) => {
    setSelectedHallIds((current) =>
      current.includes(hallId)
        ? current.filter((id) => id !== hallId)
        : [...current, hallId]
    );
    setSaved(false);
    setSaveError("");
  };

  const handleSave = async () => {
    if (!activeVenue) return;
    setIsSaving(true);
    setSaved(false);
    setSaveError("");

    try {
      const res = await fetch(`/api/organizer/events/${eventId}/venue`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: activeVenue.id,
          venueHallIds: selectedHallIds,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || t("error"));
      }

      const savedEvent = data.event || {};
      const savedVenueId = savedEvent.venue?.id || activeVenue.id;
      const savedRegionId = savedEvent.regionId || activeVenue.regionId;

      // Keep the names of the venue just left so the stale-space warning
      // remains actionable after the save the copy asks for.
      setStaleHallNames((baselineVenue?.halls || []).map((hall) => hall.name));
      setBaseline({
        venueId: savedVenueId,
        hallIds: selectedHallIds,
        regionId: savedRegionId,
      });
      setSelectedVenueId(savedVenueId);
      setSaved(true);
      setShowConfirm(false);
      onSaved?.({
        venue: {
          id: savedVenueId,
          name: savedEvent.venue?.name || activeVenue.name,
        },
        venueHall: savedEvent.venueHall || null,
        regionId: savedRegionId,
        venueHallIds: savedEvent.venueHallIds || JSON.stringify(selectedHallIds),
      });
    } catch (error) {
      setSaveError((error as Error).message || t("error"));
      setShowConfirm(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-5 border-border bg-card space-y-4 shadow-xs">
      <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        <span>{t("title")}</span>
      </h2>
      <p className="text-[11px] text-muted-foreground">{t("subtitle")}</p>

      <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs space-y-1">
        <div className="font-semibold text-foreground">{t("currentVenue")}</div>
        <div className="text-muted-foreground">
          <span className="font-medium text-foreground">
            {baselineVenue?.name || currentVenue.name}
          </span>
          <span className="mx-1.5">·</span>
          <span>{regionLabel(baseline.regionId)}</span>
          <span className="mx-1.5">·</span>
          <span>
            {t("spacesLabel")}: {baseline.hallIds.length}
          </span>
        </div>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground" role="status">
          {t("loading")}
        </p>
      ) : loadFailed ? (
        <p className="text-xs text-destructive" role="alert">
          {t("error")}
        </p>
      ) : (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="customizer-venue-select"
              className="block text-xs font-semibold text-foreground mb-1.5"
            >
              {t("venueLabel")}
            </label>
            <select
              id="customizer-venue-select"
              value={selectedVenueId}
              onChange={(event) => handleVenueChange(event.target.value)}
              disabled={isSaving}
              className="w-full h-11 rounded-md border border-input bg-background px-3 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {!venues.some((venue) => venue.id === selectedVenueId) && (
                <option value={currentVenue.id}>{currentVenue.name}</option>
              )}
              {venueGroups.map(([code, groupVenues]) => (
                <optgroup key={code} label={regionLabel(code)}>
                  {groupVenues.map((venue) => (
                    <option key={venue.id} value={venue.id} data-region={venue.regionId}>
                      {venue.name} · {venue.city} ·{" "}
                      {tVenueType(normalizeVenueType(venue.type))}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {regionChanged && activeVenue && (
            <p className="text-[11px] rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-700 dark:text-amber-400">
              {t("regionNotice", {
                from: regionLabel(baseline.regionId),
                to: regionLabel(activeVenue.regionId),
              })}
            </p>
          )}

          {activeVenue?.size && currentPageSize && activeVenue.size !== currentPageSize && (
            <p className="text-[11px] text-muted-foreground">
              {t("suggestedSize", { size: activeVenue.size })}
            </p>
          )}

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>{t("spacesLabel")}</span>
            </legend>
            <p className="text-[11px] text-muted-foreground">{t("spacesHint")}</p>
            <div className="space-y-2">
              {(activeVenue?.halls || []).map((hall) => (
                <label
                  key={hall.id}
                  className="flex items-center justify-between gap-3 p-3 min-h-[44px] rounded-lg bg-muted/30 hover:bg-muted/50 border border-border/60 cursor-pointer transition-colors"
                >
                  <span className="text-xs font-medium text-foreground">
                    {hall.name}
                    <span className="text-muted-foreground font-normal">
                      {" · "}
                      {tSpaceKind(normalizeSpaceKind(hall.kind))}
                      {typeof hall.capacity === "number"
                        ? ` · ${hall.capacity.toLocaleString()}`
                        : ""}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedHallIds.includes(hall.id)}
                    onChange={() => handleHallToggle(hall.id)}
                    disabled={isSaving}
                    className="h-4 w-4 rounded accent-primary cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </fieldset>

          {staleCount > 0 && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 space-y-1.5">
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                {t("staleTitle")}
                <span className="ml-2 tabular-nums" data-testid="stale-hall-count">
                  {staleCount}
                </span>
              </div>
              <p className="text-[11px] text-amber-700/90 dark:text-amber-400/90">
                {t("staleBody")}
              </p>
              <div className="flex flex-wrap gap-3 text-[11px] font-medium">
                <Link
                  href={`/${locale}/booths`}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {t("staleBoothsLink")}
                </Link>
                <Link
                  href={`/${locale}/events/${eventSlug}/updates`}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {t("staleAgendaLink")}
                </Link>
              </div>
            </div>
          )}

          {saveError && (
            <p className="text-xs text-destructive" role="alert">
              {saveError}
            </p>
          )}

          {saved && (
            <p className="text-xs text-emerald-700 dark:text-emerald-400" role="status">
              {t("saved")}
            </p>
          )}

          <Button
            type="button"
            size="sm"
            onClick={() => setShowConfirm(true)}
            disabled={!changed || selectedHallIds.length === 0 || isSaving}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px] gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? t("saving") : t("save")}</span>
          </Button>
        </div>
      )}

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={t("confirmTitle")}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("confirmBody", { venue: activeVenue?.name || currentVenue.name })}
          </p>
          {regionChanged && activeVenue && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("confirmRegion", {
                from: regionLabel(baseline.regionId),
                to: regionLabel(activeVenue.regionId),
              })}
            </p>
          )}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)}>
              {t("cancel")}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? t("saving") : t("confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
