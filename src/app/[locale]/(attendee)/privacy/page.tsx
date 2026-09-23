import * as React from "react";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import {
  ShieldCheck,
  Lock,
  Database,
  Eye,
  Server,
  Compass,
  ArrowLeft,
} from "lucide-react";
import { routing } from "@/i18n/routing";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PrivacyPageProps) {
  const { locale } = await params;
  return {
    title: "Privacy Policy | XPO MICE Digital Ecosystem",
    description:
      "Institutional privacy policy, delegate data protection, and GDPR/CCPA compliance standards for the XPO platform.",
  };
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container max-w-4xl py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href={`/${locale}`}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground mb-4 -ml-2"
          )}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Discovery</span>
        </Link>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-semibold gap-1.5 py-0.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Institutional Governance</span>
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Effective: 2026-09-01</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This policy outlines how the XPO MICE Digital Ecosystem collects, processes, verifies,
            and protects personal information for attendees, organizers, and exhibitors.
          </p>
        </div>
      </div>

      {/* Overview Card */}
      <Card className="border-border/80 bg-card p-6 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground font-semibold block">Commitment to Data Minimization</strong>
            XPO operates strictly under data minimization principles. We process only delegate data
            essential for ticket booking, cryptographic pass verification at physical turnstiles,
            exhibitor booth allocations, and convention hall crowd management. We do not sell delegate
            or organizer records to third-party brokers.
          </div>
        </div>
      </Card>

      {/* Main Policy Sections */}
      <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Database className="h-4 w-4 text-primary shrink-0" />
            <span>1. Information We Collect</span>
          </h2>
          <p>We collect information provided directly during platform interaction, including:</p>
          <ul className="list-disc pl-5 space-y-1 pt-1">
            <li>
              <strong className="text-foreground font-medium">Delegate & Attendee Data:</strong> Full name,
              work email, job title, company affiliation, dietary preferences, and selected ticket tiers.
            </li>
            <li>
              <strong className="text-foreground font-medium">Cryptographic Pass Tokens:</strong> Salted
              HMAC-SHA256 signature hashes generated for offline gate turnstile verification.
            </li>
            <li>
              <strong className="text-foreground font-medium">Exhibitor & Organizer Data:</strong> Company
              tax identifiers, booth allocation rosters, floor staff names, and billing records.
            </li>
            <li>
              <strong className="text-foreground font-medium">Operational Device Telemetry:</strong> Anonymized
              browser language, country edition selection (`id`, `jp`, `global`), and accessibility settings.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Server className="h-4 w-4 text-primary shrink-0" />
            <span>2. Legal Basis and Purpose of Processing</span>
          </h2>
          <p>We process delegate records pursuant to GDPR Article 6(1) and applicable international laws:</p>
          <ul className="list-disc pl-5 space-y-1 pt-1">
            <li>
              <strong className="text-foreground font-medium">Contract Performance:</strong> To issue digital
              event passes, process registration reservations, and deliver access guidebooks.
            </li>
            <li>
              <strong className="text-foreground font-medium">Legitimate Security Interests:</strong> To detect
              counterfeit QR passes, prevent double-scanning at entry gates, and audit convention hall capacity.
            </li>
            <li>
              <strong className="text-foreground font-medium">Compliance with Venue Regulations:</strong> Meeting
              safety quotas and mandatory fire regulations set by partnered convention complexes.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary shrink-0" />
            <span>3. Offline Storage & Cryptographic Verification</span>
          </h2>
          <p>
            Digital passes utilize local client-side caching in `localStorage` to ensure attendees can present
            valid entry barcodes without active cellular or Wi-Fi connectivity inside convention halls. Pass
            payloads contain tamper-evident cryptographic HMAC signatures that can be verified instantly by door
            scanner consoles without transmitting personal profile data over public networks.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span>4. Third-Party Sharing and Physical Venues</span>
          </h2>
          <p>
            Personal data is disclosed only to verified convention venues (such as JIExpo Kemayoran, Tokyo Big
            Sight, ICE BSD City, or Marina Bay Sands) and accredited event organizers strictly for badge printing,
            physical admittance, and authorized security screening. We enforce strict contractual safeguards with
            all host venues.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary shrink-0" />
            <span>5. Delegate Rights and Data Retention</span>
          </h2>
          <p>
            Under GDPR, CCPA, and regional data protection regulations, delegates possess the right to access,
            rectify, export, or request erasure of personal data. Check-in audit logs are retained for 90 days
            post-event for security dispute resolution, after which registration metadata is irreversibly
            anonymized or purged.
          </p>
          <p className="pt-2">
            To submit a data access or deletion request, contact the XPO Platform Governance Office at:{" "}
            <span className="font-mono text-foreground font-semibold">governance@xpo-mice.org</span>.
          </p>
        </section>
      </div>

      {/* Footer Navigation Action */}
      <div className="pt-6 border-t border-border flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2 text-xs font-semibold")}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Return to Homepage</span>
        </Link>
        <Link
          href={`/${locale}/terms`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs font-semibold")}
        >
          <span>View Terms of Service</span>
        </Link>
      </div>
    </div>
  );
}
