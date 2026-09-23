import * as React from "react";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import {
  FileText,
  ShieldCheck,
  Ticket,
  Store,
  Scale,
  Compass,
  ArrowLeft,
} from "lucide-react";
import { routing } from "@/i18n/routing";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: TermsPageProps) {
  const { locale } = await params;
  return {
    title: "Terms of Service | XPO MICE Digital Ecosystem",
    description:
      "Institutional terms of service, delegate pass verification regulations, and organizer obligations for the XPO platform.",
  };
}

export default async function TermsPage({ params }: TermsPageProps) {
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
              <Scale className="h-3.5 w-3.5 text-primary" />
              <span>Legal Standards</span>
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Effective: 2026-09-01</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            These terms govern your access to the XPO MICE Digital Ecosystem, digital pass reservation,
            organizer management tools, and physical event turnstile admittance.
          </p>
        </div>
      </div>

      {/* Overview Card */}
      <Card className="border-border/80 bg-card p-6 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
            <FileText className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground font-semibold block">Binding Agreement</strong>
            By accessing XPO, purchasing or reserving an exhibition pass, or utilizing the Organizer Portal
            and door scanner console, you agree to these Terms of Service. If you are acting on behalf of an
            exhibitor or enterprise organization, you represent that you possess authority to bind that entity.
          </div>
        </div>
      </Card>

      {/* Main Terms Sections */}
      <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary shrink-0" />
            <span>1. Pass Reservation & Digital Verification</span>
          </h2>
          <p>
            All event passes issued through XPO are authenticated via unique cryptographic HMAC-SHA256 signatures.
            Passes are personal to the designated attendee unless explicitly reassigned through authorized organizer
            channels. Replicating, tampering with, or attempting double-scans of pass barcodes at physical turnstiles
            is strictly prohibited and may result in immediate revocation without refund.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Store className="h-4 w-4 text-primary shrink-0" />
            <span>2. Organizer & Exhibitor Obligations</span>
          </h2>
          <p>Organizers and exhibitors publishing events or allocating booth lots on XPO agree to:</p>
          <ul className="list-disc pl-5 space-y-1 pt-1">
            <li>
              Provide accurate exhibition metadata, hall indices, floor load limits, and ticketing tiers.
            </li>
            <li>
              Adhere to safety, security, and fire protocols specified by the host convention complex.
            </li>
            <li>
              Ensure exhibitor booth representations and imported CSV rosters do not infringe third-party
              intellectual property rights.
            </li>
            <li>
              Operate door check-in scanner consoles responsibly and promptly report counterfeit pass anomalies.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span>3. System Availability & Turnstile Redundancy</span>
          </h2>
          <p>
            XPO provides offline pass caching (`localStorage`) designed to maintain turnstile throughput during
            intermittent network dropouts. While XPO strives for 99.9% platform availability, we are not liable
            for local venue Wi-Fi outages, device hardware failures, or physical entrance delays beyond our direct
            software control.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary shrink-0" />
            <span>4. Limitation of Liability & Force Majeure</span>
          </h2>
          <p>
            To the maximum extent permitted by law, XPO shall not be liable for indirect, incidental, or consequential
            damages arising from event cancellations, schedule shifts, or convention hall access restrictions imposed
            by venue authorities or government protocol. In cases of force majeure (including natural events or emergency
            facility closures), organizer refund policies apply directly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary shrink-0" />
            <span>5. Regional Jurisdiction</span>
          </h2>
          <p>
            These terms are governed by the laws applicable to the host territory of the relevant event: the Republic
            of Indonesia for events hosted at Indonesian venues, Japanese law for events in Japan, and Singapore or
            relevant international gateway jurisdiction for global convention facilities.
          </p>
          <p className="pt-2">
            Legal inquiries regarding these terms should be addressed to:{" "}
            <span className="font-mono text-foreground font-semibold">legal@xpo-mice.org</span>.
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
          href={`/${locale}/privacy`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs font-semibold")}
        >
          <span>View Privacy Policy</span>
        </Link>
      </div>
    </div>
  );
}
