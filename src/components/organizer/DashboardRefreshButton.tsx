"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { RotateCw } from "lucide-react";

export function DashboardRefreshButton() {
  const router = useRouter();
  const tOrg = useTranslations("organizer");

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      aria-label={tOrg("refreshMetrics")}
      title={tOrg("refreshMetrics")}
      className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] sm:min-h-[28px] sm:min-w-[28px] p-1 rounded-md transition-colors cursor-pointer"
    >
      <RotateCw className="h-3 w-3" />
    </button>
  );
}
