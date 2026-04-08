import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

/* ── Google Fonts ── */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

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
    <html
      lang="id"
      className={`${inter.variable} ${lora.variable}`}
    >
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
