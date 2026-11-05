"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export interface EditorUpdateRow {
  id: string;
  eventId: string;
  title: string;
  body: string;
  status: "DRAFT" | "APPROVED" | string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  updatedAt?: string;
}

interface EventUpdatesEditorProps {
  eventId: string;
}

/**
 * Organizer-authored event news. Drafts are visible here only; approved
 * rows render read-only copy with a re-approval note, since any edit
 * reverts them to draft on the server.
 */
export function EventUpdatesEditor({ eventId }: EventUpdatesEditorProps) {
  const [updates, setUpdates] = React.useState<EditorUpdateRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/organizer/events/${eventId}/updates`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) setUpdates(data.updates ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const resetForm = () => {
    setTitle("");
    setBody("");
    setEditingId(null);
  };

  const save = async () => {
    if (!title.trim() || !body.trim()) {
      setFeedback({ type: "error", text: "Title and body are required." });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const url = editingId
        ? `/api/organizer/events/${eventId}/updates/${editingId}`
        : `/api/organizer/events/${eventId}/updates`;
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Save failed");
      setUpdates((prev) =>
        editingId
          ? prev.map((u) => (u.id === editingId ? data.update : u))
          : [data.update, ...prev]
      );
      resetForm();
      setFeedback({ type: "success", text: editingId ? "Update saved as draft." : "Draft posted." });
    } catch (err) {
      setFeedback({ type: "error", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this update? It will leave the homepage rail if slotted.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/organizer/events/${eventId}/updates/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Delete failed");
      setUpdates((prev) => prev.filter((u) => u.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setFeedback({ type: "error", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/80 bg-card shadow-xs rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              {editingId ? "Edit update" : "Post an update"}
            </h2>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="update-title" className="block text-xs font-medium text-foreground">
              Title <span className="text-muted-foreground font-mono">{title.length}/120</span>
            </label>
            <Input
              id="update-title"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lineup drop, doors change, tier sold out…"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="update-body" className="block text-xs font-medium text-foreground">
              Body <span className="text-muted-foreground font-mono">{body.length}/500</span>
            </label>
            <textarea
              id="update-body"
              rows={3}
              maxLength={500}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What changed, in one or two sentences."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={busy}
              onClick={save}
              className="h-9 text-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{editingId ? "Save draft" : "Post update"}</span>
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm} className="h-9 text-xs cursor-pointer">
                <span>Cancel</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {feedback && (
        <p role={feedback.type === "error" ? "alert" : "status"} className="text-xs font-medium text-muted-foreground">
          {feedback.text}
        </p>
      )}

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading updates…</p>
      ) : updates.length === 0 ? (
        <p className="text-xs text-muted-foreground rounded-xl border border-dashed border-border/80 p-4 text-center">
          No updates yet. Post the first one above.
        </p>
      ) : (
        <div className="space-y-2">
          {updates.map((u) => (
            <Card key={u.id} className="border-border/80 bg-card shadow-xs rounded-2xl">
              <CardContent className="p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-foreground">{u.title}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[11px] font-bold uppercase tracking-wider",
                      u.status === "APPROVED"
                        ? "text-emerald-700 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
                        : "text-muted-foreground border-border"
                    )}
                  >
                    {u.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground whitespace-pre-line">{u.body}</p>
                {u.status === "APPROVED" && (
                  <p className="text-[11px] text-muted-foreground">Approved copy is read-only here — edits need re-approval.</p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => {
                      setEditingId(u.id);
                      setTitle(u.title);
                      setBody(u.body);
                      setFeedback(null);
                    }}
                    className="h-9 gap-1.5 text-xs cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => remove(u.id)}
                    className="h-9 gap-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
