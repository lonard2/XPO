import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";

export interface NewsRailItem {
  updateId: string;
  title: string;
  body: string;
  eventSlug: string;
  eventTitle: string;
}

interface HomepageNewsRailProps {
  items: NewsRailItem[];
  locale: string;
  className?: string;
}

/**
 * Hand-ordered editorial rail. Renders nothing without slots — an empty
 * rail would be a placeholder, and placeholders are not published.
 */
export function HomepageNewsRail({ items, locale, className }: HomepageNewsRailProps) {
  const tNews = useTranslations("news");
  if (items.length === 0) return null;

  return (
    <section className={cn("container space-y-6", className)} aria-label={tNews("railTitle")}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
            <Megaphone className="h-4 w-4" />
            <span>{tNews("railTitle")}</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {tNews("railSubtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 stagger-children">
        {items.map((item) => (
          <article
            key={item.updateId}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-300 hover:border-primary/60 hover:shadow-md"
          >
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary truncate">
                {item.eventTitle}
              </p>
              <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 text-balance">
                {item.title}
              </h3>
              <p className="news-body text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3 whitespace-pre-line">
                {item.body}
              </p>
            </div>
            <Link
              href={`/${locale}/events/${item.eventSlug}#update-${item.updateId}`}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-3 self-start gap-1.5 text-xs font-semibold")}
            >
              <span>{tNews("viewEvent")}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
