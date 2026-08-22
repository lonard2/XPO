import * as React from "react";
import {
  ShieldCheck,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Database,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { AuditLogsViewerClient } from "@/components/admin/AuditLogsViewerClient";

interface AuditPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminAuditPage({ params }: AuditPageProps) {
  const { locale } = await params;

  const initialLogs = [
    {
      id: "LOG-9410",
      action: "HMAC_PASS_VALIDATION",
      category: "PASS_VALIDATION",
      actor: "Door Staff Scanner (Terminal #4 - JIExpo)",
      target: "Pass XPO-PASS-BKG-8812 (Java Jazz Festival)",
      severity: "SUCCESS" as const,
      timestamp: "2026-08-21 17:35:12",
      details: "Constant-time signature verification completed in 1.4ms. Attendee marked as CHECKED_IN.",
      metadataJson: JSON.stringify({
        bookingId: "BKG-8812",
        gate: "Hall A1 Turnstile 2",
        signatureMatch: true,
        checkedInAt: "2026-08-21T10:35:12Z",
      }, null, 2),
    },
    {
      id: "LOG-9409",
      action: "CRAWLER_BATCH_INGESTION",
      category: "CRAWLER",
      actor: "Automated Ingestion Pipeline",
      target: "All 7 Flagship Venues",
      severity: "SUCCESS" as const,
      timestamp: "2026-08-21 16:00:00",
      details: "Batch run CRAWL-175583-AB12 completed. 8 new events normalized, 4 duplicate fingerprints skipped.",
      metadataJson: JSON.stringify({
        runId: "CRAWL-175583-AB12",
        targetVenues: ["jiexpo-kemayoran", "ice-bsd-city", "tokyo-big-sight", "marina-bay-sands-expo"],
        insertedCount: 8,
        skippedCount: 4,
      }, null, 2),
    },
    {
      id: "LOG-9408",
      action: "VENUE_HALL_CREATION",
      category: "VENUE_GOVERNANCE",
      actor: "Platform Administrator (admin@xpo-mice.org)",
      target: "ICE BSD City (Hall 10)",
      severity: "INFO" as const,
      timestamp: "2026-08-21 14:22:45",
      details: "Indexed new Hall 10 with 4,000 capacity and 5,000 sqm floor plan for Pop Culture Expo.",
      metadataJson: JSON.stringify({
        venueSlug: "ice-bsd-city",
        hallName: "Hall 10",
        capacity: 4000,
        floorAreaSqm: 5000,
      }, null, 2),
    },
    {
      id: "LOG-9407",
      action: "ORGANIZER_ROLE_GRANT",
      category: "AUTH_SECURITY",
      actor: "Governance Committee",
      target: "PT Debindo ITE International",
      severity: "SUCCESS" as const,
      timestamp: "2026-08-21 11:15:30",
      details: "Verified corporate credentials and granted ORGANIZER role for IndoBuildTech Expo 2026.",
      metadataJson: JSON.stringify({
        organization: "Debindo Multi Adhiswasti",
        contactEmail: "director@debindo-ite.com",
        grantedRole: "ORGANIZER",
      }, null, 2),
    },
    {
      id: "LOG-9406",
      action: "TAMPER_DETECTION_PREVENTED",
      category: "SECURITY_ALERT",
      actor: "Door Staff Scanner (Terminal #1 - ICE BSD)",
      target: "Forged QR Payload (XPO-PASS-FAKE-999)",
      severity: "ALERT" as const,
      timestamp: "2026-08-21 09:44:18",
      details: "INVALID_SIGNATURE: Hash signature tampering detected. Access denied at VIP entrance.",
      metadataJson: JSON.stringify({
        suppliedHash: "XPO-PASS-FAKE-999",
        tamperReason: "SIGNATURE_MISMATCH_CONSTANT_TIME_FAIL",
        actionTaken: "GATE_LOCKED_ATTENDEE_FLAGGED",
      }, null, 2),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="destructive" size="sm" className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              Platform Security & Audit Trail
            </Badge>
            <span className="text-xs text-muted-foreground">Immutable Compliance Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Platform Security & Governance Audit Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Real-time cryptographic pass validation logs, tamper detection alerts, crawler sync history, and organizer credential attestations.
          </p>
        </div>
      </div>

      <AuditLogsViewerClient initialLogs={initialLogs} locale={locale} />
    </div>
  );
}
