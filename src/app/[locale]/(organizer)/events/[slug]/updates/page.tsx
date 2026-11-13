"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EventUpdatesEditor } from "@/components/organizer/EventUpdatesEditor";

export default function OrganizerEventUpdatesPage() {
  const params = useParams();
  const t = useTranslations("organizer");
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-6 border-b border-border/80">
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="outline" size="sm" className="gap-1">
            <Megaphone className="h-3 w-3 text-primary" />
            {t("updatesPageBadge")}
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {t("updatesPageTitle")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          {t("updatesPageDesc")}
        </p>
      </div>

      <EventUpdatesEditor eventId={slug} />
    </div>
  );
}
