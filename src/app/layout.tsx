import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="id">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
