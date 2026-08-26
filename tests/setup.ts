import "@testing-library/jest-dom";
import { vi } from "vitest";
import enMessages from "@/messages/en.json";

vi.mock("next-intl", () => {
  return {
    useTranslations: (namespace?: string) => {
      const getNested = (obj: any, path: string) => {
        if (!obj) return undefined;
        return path.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), obj);
      };
      const nsMessages = namespace ? (enMessages as any)[namespace] || {} : enMessages;

      const t = (key: string) => {
        const val = getNested(nsMessages, key);
        return val !== undefined ? val : key;
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



