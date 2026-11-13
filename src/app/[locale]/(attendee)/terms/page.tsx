import * as React from "react";
import { Breadcrumbs, BreadcrumbJsonLd } from "@/components/layout/Breadcrumbs";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { FileText, ShieldCheck, Ticket, Store, Scale, Compass } from "lucide-react";
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
  const tLegal = await getTranslations({ locale, namespace: "legal" });
  return {
    title: tLegal("termsMetaTitle"),
    description: tLegal("termsMetaDescription"),
  };
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tCom = await getTranslations({ locale, namespace: "common" });
  const tFoot = await getTranslations({ locale, namespace: "footer" });
  const tLegal = await getTranslations({ locale, namespace: "legal" });
  const crumbs = [
    { label: tCom("home") || "Home", href: `/${locale}` },
    { label: tFoot("termsOfService") || "Terms of Service", href: `/${locale}/terms` },
  ];

  return (
    <div className="container max-w-4xl py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Navigation Breadcrumb */}
      <div>
        <Breadcrumbs items={crumbs} className="mb-4" />
        <BreadcrumbJsonLd items={crumbs} />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-semibold gap-1.5 py-0.5">
              <Scale className="h-3.5 w-3.5 text-primary" />
              <span>{tLegal("termsBadge")}</span>
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">{tLegal("termsEffective")}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {tLegal("termsTitle")}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {tLegal("termsIntro")}
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
            <strong className="text-foreground font-semibold block">{tLegal("termsBindingTitle")}</strong>
            {tLegal("termsBindingBody")}
          </div>
        </div>
      </Card>

      {/* Main Terms Sections */}
      <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary shrink-0" />
            <span>{tLegal("termsS1Title")}</span>
          </h2>
          <p>
            {tLegal("termsS1Body")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Store className="h-4 w-4 text-primary shrink-0" />
            <span>{tLegal("termsS2Title")}</span>
          </h2>
          <p>{tLegal("termsS2Intro")}</p>
          <ul className="list-disc pl-5 space-y-1 pt-1">
            <li>
              {tLegal("termsS2Li1")}
            </li>
            <li>
              {tLegal("termsS2Li2")}
            </li>
            <li>
              {tLegal("termsS2Li3")}
            </li>
            <li>
              {tLegal("termsS2Li4")}
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span>{tLegal("termsS3Title")}</span>
          </h2>
          <p>
            {tLegal("termsS3Body")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary shrink-0" />
            <span>{tLegal("termsS4Title")}</span>
          </h2>
          <p>
            {tLegal("termsS4Body")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary shrink-0" />
            <span>{tLegal("termsS5Title")}</span>
          </h2>
          <p>
            {tLegal("termsS5Body")}
          </p>
          <p className="pt-2">
            {tLegal("termsContact", { email: "legal@xpo-mice.org" })}
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
          <span>{tLegal("termsReturn")}</span>
        </Link>
        <Link
          href={`/${locale}/privacy`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs font-semibold")}
        >
          <span>{tLegal("termsPrivacyLink")}</span>
        </Link>
      </div>
    </div>
  );
}
