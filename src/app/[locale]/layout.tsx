import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Plus_Jakarta_Sans, Newsreader, JetBrains_Mono, Atkinson_Hyperlegible } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing, Locale } from "@/i18n/routing";
import { getLocaleDirection } from "@/lib/i18n/formatters";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SettingsProvider } from "@/components/settings/SettingsProvider";
import { AuthProvider } from "@/lib/auth/session";
import { AttendeeAIConcierge } from "@/components/ai/AttendeeAIConcierge";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const atkinsonHyperlegible = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-legible",
  display: "swap",
});

export const metadata: Metadata = {
  title: "XPO | MICE Digital Ecosystem",
  description: "Global digital ecosystem for Meetings, Incentives, Conferences, and Exhibitions.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = getLocaleDirection(locale);

  const skipLabel = (messages as any)?.common?.skipToContent || "Skip to main content";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`scroll-smooth ${plusJakartaSans.variable} ${newsreader.variable} ${jetbrainsMono.variable} ${atkinsonHyperlegible.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs font-semibold transition-all"
        >
          {skipLabel}
        </a>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <SettingsProvider>
              <Navbar locale={locale} />
              <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
                {children}
              </main>
              <Footer locale={locale} />
              <MobileBottomNav locale={locale} />
              <AttendeeAIConcierge locale={locale} />
            </SettingsProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
