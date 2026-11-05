import Link from "next/link";
import { Globe2, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";
import { ResponsiveRow } from "@/components/discovery/ResponsiveRow";
import { EventCard } from "@/components/discovery/EventCard";
import { type DiscoveryEvent } from "@/types/discovery";

interface CrossRegionRailProps {
  items: DiscoveryEvent[];
  locale: string;
  regionCode: string;
  regionName: string;
  className?: string;
}

/**
 * One other region per day, labeled by name. Renders nothing when the
 * target region has no attendable public events, because absence is more
 * honest than a placeholder.
 */
export function CrossRegionRail({
  items,
  locale,
  regionCode,
  regionName,
  className,
}: CrossRegionRailProps) {
  const tHome = useTranslations("home");
  if (items.length === 0) return null;

  return (
    <section className={cn("container space-y-6", className)} aria-label={tHome("alsoHappeningIn", { region: regionName })}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
            <Globe2 className="h-4 w-4" />
            <span>{tHome("alsoHappeningIn", { region: regionName })}</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {tHome("alsoHappeningSubtitle")}
          </p>
        </div>
        <Link
          href={`/${locale}/region/${regionCode}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 text-xs font-semibold min-h-[44px] sm:min-h-[36px]")}
        >
          <span>{tHome("exploreRegion")}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <ResponsiveRow className="stagger-children" label={regionName}>
        {items.map((item, index) => (
          <EventCard
            key={item.id}
            event={item}
            locale={locale}
            priority={index === 0}
            variant={items.length === 1 ? 'horizontal' : 'grid'}
          />
        ))}
      </ResponsiveRow>
    </section>
  );
}
