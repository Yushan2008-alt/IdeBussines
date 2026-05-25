import type { Metadata } from "next";
import "./globals.css";
import { CrisisFAB } from "@/components/crisis/CrisisFAB";
import { LanguageProvider } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

/* ── SEO Metadata ── */
export const metadata: Metadata = {
  title: "RuangTeduh — Teman Perjalanan Kesehatan Mentalmu",
  description:
    "Platform kesehatan mental 100% gratis, empatik, dan selalu ada. " +
    "AI companion, mood journal, komunitas anonim, dan crisis support 24/7.",
  keywords: [
    "kesehatan mental", "mental health", "depresi", "kecemasan",
    "bunuh diri", "hotline", "aplikasi gratis", "Indonesia",
    "RuangTeduh", "ruangteduh",
  ],
  openGraph: {
    title: "RuangTeduh — Teman Perjalanan Kesehatan Mentalmu",
    description: "Platform kesehatan mental gratis, empatik, dan aman. Karena setiap jiwa berhak untuk merasa aman.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <LanguageProvider>
          {children}
          <CrisisFAB />
          <LanguageSwitcher />
        </LanguageProvider>
      </body>
    </html>
  );
}
