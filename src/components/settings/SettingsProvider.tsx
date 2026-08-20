"use client";

import * as React from "react";

export type ThemeMode = "light" | "dark" | "system" | "high-contrast";
export type UIDensity = "comfortable" | "compact";
export type TypographyMode =
  | "modern-sans"
  | "editorial-serif"
  | "technical-mono"
  | "atkinson-hyperlegible";
export type MotionMode = "off" | "subtle" | "expressive";

export interface UserProfile {
  fullName: string;
  organization: string;
  jobTitle: string;
  email: string;
  interests: string[];
}

export interface SettingsState {
  theme: ThemeMode;
  density: UIDensity;
  typography: TypographyMode;
  fontScale: number;
  motionMode: MotionMode;
  aiConciergeEnabled: boolean;
  profile: UserProfile;
}

export interface SettingsContextValue extends SettingsState {
  isMounted: boolean;
  setTheme: (theme: ThemeMode) => void;
  setDensity: (density: UIDensity) => void;
  setTypography: (typography: TypographyMode) => void;
  setFontScale: (scale: number) => void;
  setMotionMode: (mode: MotionMode) => void;
  setAiConciergeEnabled: (enabled: boolean) => void;
  setProfile: (
    profileOrUpdater: Partial<UserProfile> | ((prev: UserProfile) => UserProfile)
  ) => void;
  resetToDefaults: () => void;
}

export const DEFAULT_SETTINGS: SettingsState = {
  theme: "system",
  density: "comfortable",
  typography: "modern-sans",
  fontScale: 1.0,
  motionMode: "subtle",
  aiConciergeEnabled: true,
  profile: {
    fullName: "",
    organization: "",
    jobTitle: "",
    email: "",
    interests: [],
  },
};

const SETTINGS_STORAGE_KEY = "xpo_settings_preferences_v1";
const PROFILE_STORAGE_KEY = "xpo_attendee_profile_v1";
const LEGACY_THEME_KEY = "xpo_theme";

const SettingsContext = React.createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<SettingsState>(DEFAULT_SETTINGS);
  const [isMounted, setIsMounted] = React.useState<boolean>(false);

  // Initial client hydration from localStorage
  React.useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      const legacyTheme = localStorage.getItem(LEGACY_THEME_KEY);

      let parsedSettings: Partial<SettingsState> = {};
      if (storedSettings) {
        parsedSettings = JSON.parse(storedSettings);
      } else if (legacyTheme) {
        if (
          legacyTheme === "dark" ||
          legacyTheme === "light" ||
          legacyTheme === "high-contrast" ||
          legacyTheme === "system"
        ) {
          parsedSettings.theme = legacyTheme as ThemeMode;
        }
      }

      let parsedProfile: Partial<UserProfile> = {};
      if (storedProfile) {
        parsedProfile = JSON.parse(storedProfile);
      }

      setState({
        theme: parsedSettings.theme || DEFAULT_SETTINGS.theme,
        density: parsedSettings.density || DEFAULT_SETTINGS.density,
        typography: parsedSettings.typography || DEFAULT_SETTINGS.typography,
        fontScale:
          typeof parsedSettings.fontScale === "number"
            ? Math.min(Math.max(parsedSettings.fontScale, 0.9), 1.25)
            : DEFAULT_SETTINGS.fontScale,
        motionMode: parsedSettings.motionMode || DEFAULT_SETTINGS.motionMode,
        aiConciergeEnabled:
          typeof parsedSettings.aiConciergeEnabled === "boolean"
            ? parsedSettings.aiConciergeEnabled
            : DEFAULT_SETTINGS.aiConciergeEnabled,
        profile: {
          ...DEFAULT_SETTINGS.profile,
          ...parsedProfile,
        },
      });
    } catch {
      // Fallback to default in case of corrupted localStorage
    } finally {
      setIsMounted(true);
    }
  }, []);

  // DOM Synchronization for CSS custom properties, theme classes, density, motion, and typography
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;

    // 1. Theme application
    root.classList.remove("dark", "high-contrast");
    let activeThemeIsDark = false;

    if (state.theme === "dark") {
      root.classList.add("dark");
      activeThemeIsDark = true;
    } else if (state.theme === "high-contrast") {
      root.classList.add("high-contrast");
    } else if (state.theme === "system") {
      const hasMatchMedia = typeof window.matchMedia === "function";
      const systemDark = hasMatchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemDark) {
        root.classList.add("dark");
        activeThemeIsDark = true;
      }
    }

    // Sync legacy theme key
    try {
      localStorage.setItem(LEGACY_THEME_KEY, activeThemeIsDark ? "dark" : state.theme);
    } catch {
      // Ignore storage write errors
    }

    // System theme listener when in "system" mode
    if (state.theme === "system" && typeof window.matchMedia === "function") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      };
      if (mediaQuery && typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
      }
    }
  }, [state.theme]);

  // Density application
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("density-comfortable", "density-compact");
    root.classList.add(`density-${state.density}`);
  }, [state.density]);

  // Typography application
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.classList.remove(
      "typography-modern-sans",
      "typography-editorial-serif",
      "typography-technical-mono",
      "typography-atkinson-hyperlegible",
      "typography-sans",
      "typography-serif",
      "typography-mono",
      "typography-legible"
    );
    root.classList.add(`typography-${state.typography}`);
  }, [state.typography]);

  // Font scale application
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--font-scale", state.fontScale.toString());
  }, [state.fontScale]);

  // Motion mode application
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("motion-off", "motion-subtle", "motion-expressive");
    root.classList.add(`motion-${state.motionMode}`);
  }, [state.motionMode]);

  // Persist state to localStorage on modification
  const persistSettings = React.useCallback((nextState: Partial<SettingsState>) => {
    try {
      const current = localStorage.getItem(SETTINGS_STORAGE_KEY);
      const parsed = current ? JSON.parse(current) : {};
      const updated = { ...parsed, ...nextState };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage write errors
    }
  }, []);

  const setTheme = React.useCallback(
    (theme: ThemeMode) => {
      setState((prev) => {
        const next = { ...prev, theme };
        persistSettings({ theme });
        return next;
      });
    },
    [persistSettings]
  );

  const setDensity = React.useCallback(
    (density: UIDensity) => {
      setState((prev) => {
        const next = { ...prev, density };
        persistSettings({ density });
        return next;
      });
    },
    [persistSettings]
  );

  const setTypography = React.useCallback(
    (typography: TypographyMode) => {
      setState((prev) => {
        const next = { ...prev, typography };
        persistSettings({ typography });
        return next;
      });
    },
    [persistSettings]
  );

  const setFontScale = React.useCallback(
    (rawScale: number) => {
      const fontScale = Math.min(Math.max(Number(rawScale.toFixed(2)), 0.9), 1.25);
      setState((prev) => {
        const next = { ...prev, fontScale };
        persistSettings({ fontScale });
        return next;
      });
    },
    [persistSettings]
  );

  const setMotionMode = React.useCallback(
    (motionMode: MotionMode) => {
      setState((prev) => {
        const next = { ...prev, motionMode };
        persistSettings({ motionMode });
        return next;
      });
    },
    [persistSettings]
  );

  const setAiConciergeEnabled = React.useCallback(
    (aiConciergeEnabled: boolean) => {
      setState((prev) => {
        const next = { ...prev, aiConciergeEnabled };
        persistSettings({ aiConciergeEnabled });
        return next;
      });
    },
    [persistSettings]
  );

  const setProfile = React.useCallback(
    (profileOrUpdater: Partial<UserProfile> | ((prev: UserProfile) => UserProfile)) => {
      setState((prev) => {
        const newProfile =
          typeof profileOrUpdater === "function"
            ? profileOrUpdater(prev.profile)
            : { ...prev.profile, ...profileOrUpdater };
        try {
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
        } catch {
          // Ignore
        }
        return { ...prev, profile: newProfile };
      });
    },
    []
  );

  const resetToDefaults = React.useCallback(() => {
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      localStorage.removeItem(LEGACY_THEME_KEY);
    } catch {
      // Ignore
    }
    setState(DEFAULT_SETTINGS);
  }, []);

  const value: SettingsContextValue = React.useMemo(
    () => ({
      ...state,
      isMounted,
      setTheme,
      setDensity,
      setTypography,
      setFontScale,
      setMotionMode,
      setAiConciergeEnabled,
      setProfile,
      resetToDefaults,
    }),
    [
      state,
      isMounted,
      setTheme,
      setDensity,
      setTypography,
      setFontScale,
      setMotionMode,
      setAiConciergeEnabled,
      setProfile,
      resetToDefaults,
    ]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = React.useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
