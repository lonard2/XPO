"use client";

import * as React from "react";
import { UserRole, Permission, hasPermission as checkPermission, isValidRole } from "./rbac";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization?: string;
  jobTitle?: string;
  avatarUrl?: string;
}

export const DEMO_ACCOUNTS: Record<UserRole, AuthUser> = {
  ATTENDEE: {
    id: "cmt2sfr7o0001laeaj5pso0yu",
    email: "alex@xpo.com",
    name: "Alex Pratama",
    role: "ATTENDEE",
    organization: "Pacific Tech Labs",
    jobTitle: "Lead Systems Architect",
  },
  ORGANIZER: {
    id: "cmt2sfr7n0000laeaurwdwe44",
    email: "organizer@xpo.com",
    name: "Sari Dewi",
    role: "ORGANIZER",
    organization: "Nusantara Event Management",
    jobTitle: "Lead Event Director",
  },
  ADMIN: {
    id: "cmt2sfr7p0002laeapyzzhv6w",
    email: "admin@xpo.com",
    name: "Admin Governance Council",
    role: "ADMIN",
    organization: "XPO Global Governance",
    jobTitle: "Platform SuperAdmin",
  },
};

export const STORAGE_KEY_USER = "xpo_session_user";
export const COOKIE_NAME_ROLE = "xpo_role";
export const COOKIE_NAME_USER = "xpo_auth_user";

/**
 * Helper to get list of all demo accounts for quick role switcher.
 */
export function getDemoAccounts(): AuthUser[] {
  return Object.values(DEMO_ACCOUNTS);
}

/**
 * Reads the current session user from localStorage or document.cookie.
 */
export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      const parsed = JSON.parse(raw) as AuthUser;
      if (parsed && isValidRole(parsed.role)) {
        return parsed;
      }
    }

    // Fallback to role cookie
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME_ROLE}=([^;]*)`));
    if (match) {
      const role = decodeURIComponent(match[1]) as UserRole;
      if (isValidRole(role)) {
        return DEMO_ACCOUNTS[role];
      }
    }
  } catch {
    // Ignore storage parsing errors
  }

  // Default fallback is Organizer or Attendee
  return DEMO_ACCOUNTS.ORGANIZER;
}

/**
 * Persists session user into both localStorage and document.cookie.
 */
export function setStoredUser(user: AuthUser | null): void {
  if (typeof window === "undefined") return;

  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      document.cookie = `${COOKIE_NAME_ROLE}=${user.role}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      document.cookie = `${COOKIE_NAME_USER}=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
      document.cookie = `${COOKIE_NAME_ROLE}=; path=/; max-age=0; SameSite=Lax`;
      document.cookie = `${COOKIE_NAME_USER}=; path=/; max-age=0; SameSite=Lax`;
    }

    // Dispatch global event for cross-component sync
    window.dispatchEvent(new CustomEvent("xpo-auth-change", { detail: user }));
  } catch {
    // Ignore cookie/storage write errors
  }
}

/**
 * Switches current session to one of the demo role personas.
 */
export function switchUserRole(role: UserRole): AuthUser {
  const targetUser = DEMO_ACCOUNTS[role] || DEMO_ACCOUNTS.ATTENDEE;
  setStoredUser(targetUser);
  return targetUser;
}

export interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  switchRole: (role: UserRole) => void;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = React.createContext<AuthContextType>({
  user: DEMO_ACCOUNTS.ORGANIZER,
  role: "ORGANIZER",
  isAuthenticated: true,
  isLoading: false,
  switchRole: () => {},
  login: async () => true,
  logout: () => {},
  hasPermission: () => true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(DEMO_ACCOUNTS.ORGANIZER);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const existing = getStoredUser();
    if (existing) {
      setUser(existing);
      setStoredUser(existing); // Ensure cookies sync
    } else {
      // Default to Organizer in development for seamless portal exploration
      setUser(DEMO_ACCOUNTS.ORGANIZER);
      setStoredUser(DEMO_ACCOUNTS.ORGANIZER);
    }
    setIsLoading(false);

    const handleAuthChange = (e: Event) => {
      const customEvent = e as CustomEvent<AuthUser | null>;
      setUser(customEvent.detail);
    };

    window.addEventListener("xpo-auth-change", handleAuthChange);
    return () => window.removeEventListener("xpo-auth-change", handleAuthChange);
  }, []);

  const switchRole = React.useCallback((newRole: UserRole) => {
    const updated = switchUserRole(newRole);
    setUser(updated);
  }, []);

  const login = React.useCallback(async (email: string): Promise<boolean> => {
    const normalized = email.toLowerCase().trim();
    // Check demo accounts matching email
    const match = Object.values(DEMO_ACCOUNTS).find((acc) => acc.email.toLowerCase() === normalized);
    if (match) {
      setStoredUser(match);
      setUser(match);
      return true;
    }

    // Otherwise create custom attendee session
    const customUser: AuthUser = {
      id: `user-${Date.now()}`,
      email: normalized,
      name: normalized.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      role: "ATTENDEE",
      organization: "Independent Participant",
      jobTitle: "Event Delegate",
    };
    setStoredUser(customUser);
    setUser(customUser);
    return true;
  }, []);

  const logout = React.useCallback(() => {
    setStoredUser(null);
    setUser(null);
  }, []);

  const checkUserPermission = React.useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      return checkPermission(user.role, permission);
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    role: user?.role || "ATTENDEE",
    isAuthenticated: !!user,
    isLoading,
    switchRole,
    login,
    logout,
    hasPermission: checkUserPermission,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    // Safe fallback if rendered without provider in isolated tests
    return {
      user: DEMO_ACCOUNTS.ORGANIZER,
      role: "ORGANIZER",
      isAuthenticated: true,
      isLoading: false,
      switchRole: () => {},
      login: async () => true,
      logout: () => {},
      hasPermission: (perm) => checkPermission("ORGANIZER", perm),
    };
  }
  return context;
}
