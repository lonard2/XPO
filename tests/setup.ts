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

if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}


