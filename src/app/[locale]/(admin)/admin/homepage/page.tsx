import * as React from "react";
import { getTranslations } from "next-intl/server";
import { LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { HomepageRowsManager } from "@/components/admin/HomepageRowsManager";

interface AdminHomepagePageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminHomepagePage({ params }: AdminHomepagePageProps) {
  const { locale } = await params;
  const tAdmin = await getTranslations({ locale, namespace: "admin" });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" size="sm" className="gap-1">
              <LayoutGrid className="h-3 w-3 text-primary" />
              {tAdmin("homepageRowsTitle")}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {tAdmin("homepageRowsTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            {tAdmin("homepageRowsSubtitle")}
          </p>
        </div>
      </div>

      <HomepageRowsManager locale={locale} />
    </div>
  );
}
