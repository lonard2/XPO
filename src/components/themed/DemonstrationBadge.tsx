"use client";

import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

/**
 * Marks a section that demonstrates a capability the platform does not yet
 * back with data. Kept visible per the showcase decision, never presented as
 * a live service.
 */
export function DemonstrationBadge({ className }: { className?: string }) {
  const t = useTranslations("common");
  return (
    <Badge variant="outline" size="sm" className={cn("gap-1 font-semibold", className)}>
      <Info className="h-3 w-3" aria-hidden="true" />
      {t("demonstration")}
    </Badge>
  );
}
