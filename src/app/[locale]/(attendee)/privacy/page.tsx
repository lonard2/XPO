import * as React from "react";
import { Breadcrumbs, BreadcrumbJsonLd } from "@/components/layout/Breadcrumbs";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { ShieldCheck, Lock, Database, Eye, Server, Compass } from "lucide-react";
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
  const tLegal = await getTranslations({ locale, namespace: "legal" });
  return {
    title: tLegal("privacyMetaTitle"),
    description: tLegal("privacyMetaDescription"),
  };
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tCom = await getTranslations({ locale, namespace: "common" });
  const tFoot = await getTranslations({ locale, namespace: "footer" });
  const tLegal = await getTranslations({ locale, namespace: "legal" });
  const crumbs = [
    { label: tCom("home") || "Home", href: `/${locale}` },
    { label: tFoot("privacyPolicy") || "Privacy Policy", href: `/${locale}/privacy` },
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
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>{tLegal("privacyBadge")}</span>
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">{tLegal("privacyEffective")}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {tLegal("privacyTitle")}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {tLegal("privacyIntro")}
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
            <strong className="text-foreground font-semibold block">{tLegal("privacyMinTitle")}</strong>
            {tLegal("privacyMinBody")}
          </div>
        </div>
      </Card>

      {/* Main Policy Sections */}
      <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Database className="h-4 w-4 text-primary shrink-0" />
            <span>{tLegal("privacyS1Title")}</span>
          </h2>
          <p>{tLegal("privacyS1Intro")}</p>
          <ul className="list-disc pl-5 space-y-1 pt-1">
            <li>
              <strong className="text-foreground font-medium">{tLegal("privacyS1Li1Title")}</strong> {tLegal("privacyS1Li1Body")}
            </li>
            <li>
              <strong className="text-foreground font-medium">{tLegal("privacyS1Li2Title")}</strong> {tLegal("privacyS1Li2Body")}
            </li>
            <li>
              <strong className="text-foreground font-medium">{tLegal("privacyS1Li3Title")}</strong> {tLegal("privacyS1Li3Body")}
            </li>
            <li>
              <strong className="text-foreground font-medium">{tLegal("privacyS1Li4Title")}</strong> {tLegal("privacyS1Li4Body")}
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Server className="h-4 w-4 text-primary shrink-0" />
            <span>{tLegal("privacyS2Title")}</span>
          </h2>
          <p>{tLegal("privacyS2Intro")}</p>
          <ul className="list-disc pl-5 space-y-1 pt-1">
            <li>
              <strong className="text-foreground font-medium">{tLegal("privacyS2Li1Title")}</strong> {tLegal("privacyS2Li1Body")}
            </li>
            <li>
              <strong className="text-foreground font-medium">{tLegal("privacyS2Li2Title")}</strong> {tLegal("privacyS2Li2Body")}
            </li>
            <li>
              <strong className="text-foreground font-medium">{tLegal("privacyS2Li3Title")}</strong> {tLegal("privacyS2Li3Body")}
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary shrink-0" />
            <span>{tLegal("privacyS3Title")}</span>
          </h2>
          <p>
            {tLegal("privacyS3Body")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span>{tLegal("privacyS4Title")}</span>
          </h2>
          <p>
            {tLegal("privacyS4Body")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary shrink-0" />
            <span>{tLegal("privacyS5Title")}</span>
          </h2>
          <p>
            {tLegal("privacyS5Body")}
          </p>
          <p className="pt-2">
            {tLegal("privacyContact", { email: "governance@xpo-mice.org" })}
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
          <span>{tLegal("privacyReturn")}</span>
        </Link>
        <Link
          href={`/${locale}/terms`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs font-semibold")}
        >
          <span>{tLegal("privacyTermsLink")}</span>
        </Link>
      </div>
    </div>
  );
}
