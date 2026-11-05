import { Megaphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface NewsTimelineItem {
  id: string;
  title: string;
  body: string;
  approvedAt: string | Date | null;
}

interface EventNewsTimelineProps {
  items: NewsTimelineItem[];
  locale?: string;
  className?: string;
}

/**
 * Approved-only event timeline. Bodies are plain text by design — no
 * links, no markdown — so there is nothing to sanitize at render time.
 */
export function EventNewsTimeline({ items, className }: EventNewsTimelineProps) {
  const tNews = useTranslations("news");
  if (items.length === 0) return null;

  return (
    <section aria-label={tNews("timelineTitle")} className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
        <Megaphone className="h-4 w-4" />
        <h3 className="text-xl font-bold text-foreground normal-case tracking-tight">
          {tNews("timelineTitle")}
        </h3>
      </div>
      <ol className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            id={`update-${item.id}`}
            className="rounded-xl border border-border/80 bg-card p-4 space-y-1 scroll-mt-24"
          >
            <p className="text-sm font-bold text-foreground">{item.title}</p>
            <p className="news-body text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {item.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
