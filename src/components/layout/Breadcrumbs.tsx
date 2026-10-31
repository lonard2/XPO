import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateBreadcrumbJsonLd } from "@/lib/seo/jsonLd";

export interface BreadcrumbItem {
  label: string;
  /** Every crumb carries a destination so the structured data stays complete. */
  href: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /**
   * `strip` renders the full-width bar used by attendee pages.
   * `plain` renders a bare row for panes and settings pages.
   */
  variant?: "strip" | "plain";
  /** Extra classes on the nav element. */
  className?: string;
  /** Extra classes on the list, for pages that do not use `.container`. */
  listClassName?: string;
}

/**
 * The single breadcrumb trail for the whole app.
 *
 * Before this existed there were four patterns in use: nav + ol, nav without ol,
 * a plain div, and a back link standing in for a trail. The root label varied between
 * Home, Explore and Back, and the separator was either a slash or a chevron. One
 * component keeps the semantics, the wording and the arrow consistent, and gives the
 * structured-data builder a single source to read from.
 */
export function Breadcrumbs({
  items,
  variant = "plain",
  className,
  listClassName,
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(variant === "strip" && "border-b border-border bg-muted/30 py-3", className)}
    >
      <ol
        className={cn(
          "flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground",
          variant === "strip" && "container",
          listClassName
        )}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="inline-flex min-w-0 items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  className="h-3 w-3 shrink-0 text-muted-foreground/60"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span aria-current="page" className="truncate font-semibold text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="truncate transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * BreadcrumbList structured data for a trail that is also visible on the page.
 * Emit it from the same items the component renders so the two cannot drift.
 */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const json = generateBreadcrumbJsonLd(items.map((item) => ({ name: item.label, url: item.href })));
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
