"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  selectedTab: string;
  onSelectTab: (id: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (val: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const currentTab = value !== undefined ? value : internalValue;

  const handleSelect = React.useCallback(
    (id: string) => {
      if (value === undefined) setInternalValue(id);
      onValueChange?.(id);
    },
    [value, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ selectedTab: currentTab, onSelectTab: handleSelect }}>
      <div className={cn("w-full space-y-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const tabs = Array.from(
      (e.currentTarget as HTMLElement).querySelectorAll('[role="tab"]:not([disabled])')
    ) as HTMLElement[];
    if (tabs.length === 0) return;
    const active = document.activeElement as HTMLElement | null;
    let idx = active ? tabs.indexOf(active) : -1;
    if (e.key === "ArrowRight") idx = (idx + 1) % tabs.length;
    else if (e.key === "ArrowLeft") idx = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") idx = 0;
    else idx = tabs.length - 1;
    tabs[idx]?.focus();
    tabs[idx]?.click();
  };

  return (
    <div
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
  disabled,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be inside Tabs");
  const isSelected = ctx.selectedTab === value;

  return (
    <button
      role="tab"
      id={`tab-${value}`}
      aria-controls={`panel-${value}`}
      type="button"
      disabled={disabled}
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      onClick={() => ctx.onSelectTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 min-h-[44px] sm:min-h-[36px] text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "bg-background text-foreground shadow-sm font-semibold"
          : "hover:bg-background/50 hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be inside Tabs");
  if (ctx.selectedTab !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
      className={cn("ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-in", className)}
    >
      {children}
    </div>
  );
}
