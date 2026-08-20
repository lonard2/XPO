"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe, Check, ChevronDown, Languages } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { SupportedLocale, SUPPORTED_LOCALES } from "@/lib/i18n/formatters";

export interface LanguageOption {
  code: SupportedLocale;
  label: string;
  nativeLabel: string;
  regionHint: string;
}

export const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English", regionHint: "Global / International" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", regionHint: "Japan (JST)" },
  { code: "zh-CN", label: "Chinese (Simplified)", nativeLabel: "简体中文", regionHint: "Greater China / Asia" },
  { code: "id", label: "Indonesian", nativeLabel: "Bahasa Indonesia", regionHint: "Indonesia (WIB)" },
  { code: "de", label: "German", nativeLabel: "Deutsch", regionHint: "Central Europe (CET)" },
  { code: "es", label: "Spanish", nativeLabel: "Español", regionHint: "Spain / Latin America" },
] as const;

export interface LanguageSwitcherProps {
  currentLocale?: string;
  variant?: "dropdown" | "pills" | "minimal";
  className?: string;
}

export function LanguageSwitcher({
  currentLocale = "en",
  variant = "dropdown",
  className,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Derive target path when switching locale while preserving the route path
  const handleLocaleChange = (newLocale: SupportedLocale) => {
    setIsOpen(false);
    if (!pathname) {
      router.push(`/${newLocale}`);
      return;
    }

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      router.push(`/${newLocale}`);
      return;
    }

    // If first segment is one of the supported locales, replace it
    if (SUPPORTED_LOCALES.includes(segments[0] as SupportedLocale)) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }

    const nextPath = `/${segments.join("/")}`;
    router.push(nextPath);
  };

  // Close dropdown on outside click or Escape key
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const activeLanguage =
    LANGUAGE_OPTIONS.find((lang) => lang.code === currentLocale) || LANGUAGE_OPTIONS[0];

  if (variant === "pills") {
    return (
      <div
        className={cn("flex flex-wrap items-center gap-1.5", className)}
        role="radiogroup"
        aria-label="Language selection"
      >
        {LANGUAGE_OPTIONS.map((lang) => {
          const isSelected = lang.code === currentLocale;
          return (
            <button
              key={lang.code}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleLocaleChange(lang.code)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/40",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span>{lang.nativeLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Select language, current: ${activeLanguage.label}`}
        className="h-9 px-2.5 gap-1.5 text-xs font-medium border border-border/60 hover:bg-accent hover:text-accent-foreground"
      >
        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-semibold uppercase tracking-wider">{activeLanguage.code.toUpperCase()}</span>
        <ChevronDown
          className={cn("h-3 w-3 text-muted-foreground transition-transform duration-200", {
            "rotate-180": isOpen,
          })}
        />
      </Button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Supported languages"
          className="absolute right-0 mt-1.5 w-56 origin-top-right rounded-xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-100"
        >
          <div className="px-2.5 py-1.5 border-b border-border/50 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Languages className="h-3 w-3 text-primary" />
            <span>Select Language</span>
          </div>

          <div className="py-1 space-y-0.5 max-h-64 overflow-y-auto">
            {LANGUAGE_OPTIONS.map((lang) => {
              const isSelected = lang.code === currentLocale;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleLocaleChange(lang.code)}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors text-left",
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-muted/70"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{lang.nativeLabel}</span>
                    <span className="text-[10px] text-muted-foreground">{lang.label}</span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
