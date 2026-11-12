import "@testing-library/jest-dom/vitest";
import { readFileSync } from "node:fs";
import { parse as parseEnv } from "dotenv";

// Tests need the database URL, but loading the whole .env would also inject
// provider keys and change code paths (the AI suite expects no live key).
if (!process.env.DATABASE_URL) {
  try {
    const parsed = parseEnv(readFileSync(".env"));
    if (parsed.DATABASE_URL) process.env.DATABASE_URL = parsed.DATABASE_URL;
  } catch {
    // No .env: CI supplies DATABASE_URL directly.
  }
}
import { vi, beforeEach } from "vitest";
import enMessages from "@/messages/en.json";
import { resetRateLimits } from "@/lib/api/rateLimit";

// Counters live on globalThis so they survive across route bundles in one
// process. Reset them per test so a suite that exercises a limit cannot leak
// its spend into an unrelated file in the same worker.
beforeEach(() => {
  resetRateLimits();
});

vi.mock("next-intl", () => {
  return {
    useTranslations: (namespace?: string) => {
      const getNested = (obj: any, path: string) => {
        if (!obj) return undefined;
        return path.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), obj);
      };
      const nsMessages = namespace
        ? namespace
            .split(".")
            .reduce((acc: any, part) => (acc ? acc[part] : undefined), enMessages as any) || {}
        : enMessages;

      const t = (key: string, values?: Record<string, any>) => {
        let val = getNested(nsMessages, key);
        if (val === undefined) return key;
        if (typeof val === "string" && values) {
          Object.entries(values).forEach(([k, v]) => {
            val = (val as string).replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
          });
        }
        return val;
      };
      t.raw = (key: string) => {
        const val = getNested(nsMessages, key);
        return val !== undefined ? val : null;
      };
      t.has = (key: string) => {
        return getNested(nsMessages, key) !== undefined;
      };
      return t;
    },
    useLocale: () => "en",
    useMessages: () => enMessages,
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ locale: "en" }),
}));

if (typeof window !== "undefined") {
  window.matchMedia =
    window.matchMedia ||
    function (query: string) {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      };
    };
}

// Robust localStorage mock for jsdom environment in Vitest
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
}
if (typeof global !== "undefined") {
  (global as any).localStorage = localStorageMock;
}



