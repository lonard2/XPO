import Link from "next/link";
import { cookies } from "next/headers";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { resolveEventCallerFromCookies } from "@/lib/auth/eventOwnership";
import { db } from "@/lib/db";
import { Breadcrumbs, BreadcrumbJsonLd } from "@/components/layout/Breadcrumbs";
import { buttonVariants } from "@/components/ui/Button";
import {
  ExhibitorBoothExplorer,
  type ExhibitorBooth,
} from "@/components/exhibitor/ExhibitorBoothExplorer";
import { cn } from "@/lib/utils";

interface ExhibitorPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata() {
  return {
    title: "Exhibitor Hub | XPO MICE",
    description: "Claim your booth, keep your company profile current, and prepare for the show floor.",
  };
}

export default async function ExhibitorPage({ params }: ExhibitorPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "exhibitor" });
  const tCom = await getTranslations({ locale, namespace: "common" });
  const crumbs = [
    { label: tCom("home") || "Home", href: `/${locale}` },
    { label: t("title") || "Exhibitor Hub", href: `/${locale}/exhibitor` },
  ];

  const cookieStore = await cookies();
  const caller = await resolveEventCallerFromCookies(cookieStore);

  let booths: ExhibitorBooth[] = [];
  if (caller.userId) {
    const rows = await db.boothTenant.findMany({
      include: {
        event: { select: { id: true, title: true, slug: true } },
        claimedBy: { select: { name: true, email: true } },
      },
      orderBy: [{ eventId: "asc" }, { boothNumber: "asc" }],
    });
    booths = rows.map((row) => ({
      id: row.id,
      companyName: row.companyName,
      boothNumber: row.boothNumber,
      hallName: row.hallName,
      industry: row.industry,
      websiteUrl: row.websiteUrl,
      logoUrl: row.logoUrl,
      description: row.description,
      dimensions: row.dimensions,
      areaSqm: row.areaSqm,
      boothType: row.boothType,
      claimStatus: row.claimStatus,
      userId: row.userId,
      event: row.event,
      claimedBy: row.claimedBy
        ? { name: row.claimedBy.name, email: row.claimedBy.email }
        : null,
    }));
  }

  return (
    <div className="container py-8 space-y-8">
      <Breadcrumbs variant="strip" items={crumbs} />
      <BreadcrumbJsonLd items={crumbs} />

      <header className="max-w-3xl space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{t("subtitle")}</p>
      </header>

      {caller.userId ? (
        <ExhibitorBoothExplorer userId={caller.userId} booths={booths} />
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center space-y-3 max-w-xl">
          <h2 className="text-base font-semibold text-foreground">{t("signInTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("signInDesc")}</p>
          <Link
            href={`/${locale}`}
            className={cn(buttonVariants({ size: "sm" }), "min-h-[44px] inline-flex items-center")}
          >
            {t("signInCta")}
          </Link>
        </div>
      )}
    </div>
  );
}
