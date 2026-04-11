# Rencana: PRD RuangTeduh — Aplikasi Kesehatan Mental

## File Output
Buat file baru di: `C:\Users\CANDRA DEWI\Desktop\.vscode\Business Idea\PRD-RuangTeduh.md`

## Gaya & Format
Mengikuti pola PRD Signature Laundry + PropVista:
- Header (nama, versi, tanggal, status)
- Warning/note box dengan blockquote
- Table of Contents dengan 12 bagian bernomor
- Setiap bagian menggunakan H2, subseksi H3/H4
- Tabel untuk perbandingan, roles, fitur, metrics
- ASCII/Unicode boxes untuk visual card komponen (Core Features)
- Code blocks untuk data model
- Emoji status: ✅ 🔄 ❌ ⚠️ 🌙 💬 🛡️ 🤖 dll

---

## Konten PRD yang Akan Ditulis

### Header
- **Nama**: RuangTeduh
- **Tagline**: *"Karena setiap jiwa berhak untuk merasa aman."*
- **Versi**: 2.0 | **Tanggal**: April 2026 | **Status**: In Development

---

### Bagian 1 — Overview
- Visi produk: platform dukungan kesehatan mental bilingual (ID/EN) yang menjembatani krisis depresi dan pencegahan bunuh diri dengan pendekatan empatik, non-klinis, dan ramah budaya
- Gabungan: AI companion (Gemini) + mood tracking kalender + komunitas anonim + akses profesional
- Tagline + Sub-tagline

### Bagian 2 — Problem Statement
Statistik real:
- WHO: 1 dari 4 orang dunia mengalami gangguan jiwa
- Indonesia: 19 juta orang mengalami gangguan jiwa ringan-berat (Riskesdas 2018)
- Angka bunuh diri: ~10.000/tahun di Indonesia (diperkirakan underreported)
- 90% kasus bunuh diri berkaitan dengan gangguan mental yang tidak tertangani
- Stigma budaya → 95% yang butuh bantuan tidak mencari pertolongan

**Analisis Kompetitor** (dimasukkan di sini sebagai sub-bagian):
| Kompetitor | Fokus | Kelemahan |
- Calm: meditation & sleep, tidak ada crisis support, tidak lokal
- Headspace: guided meditation, tidak ada pencegahan bunuh diri
- BetterHelp: terapi online, mahal untuk pasar Indonesia
- Wysa: AI chatbot, tidak ada komunitas, tidak bilingual ID
- Into The Light (ID): hotline NGO, tidak ada app experience
- Alodokter: general health, tidak ada fitur komunitas mental health khusus

**Gap / UVP RuangTeduh:**
6 celah yang diisi: krisis support, komunitas anonim, AI empatik berbahasa Indonesia (Gemini), safety plan builder, harga terjangkau, budaya-sensitif

### Bagian 3 — Goals
3 level goals:
- Product Goals (fitur)
- Business Goals (sustain)
- Social Impact Goals (zero suicide mission)

### Bagian 4 — User Roles
3 roles dengan tabel demografi + kebutuhan + akses:
- **User Umum** (masyarakat umum secara luas — remaja, dewasa, lansia, tanpa batasan usia ketat)
- **Psikolog/Konselor** (profesional terverifikasi, mengelola sesi)
- **Admin** (moderasi konten, verifikasi konselor, pantau platform)

### Bagian 5 — Core Features (MVP)
Visual card boxes (ASCII) untuk setiap fitur:
```
┌──────────────────────────────────────────────────────┐
│  🌙  MOOD JOURNAL & TRACKER                          │
│  [visual card style seperti Prompt Card]             │
└──────────────────────────────────────────────────────┘
```
10 feature cards (9 original + 1 baru):
1. Mood Journal & Tracker
   - Input mood harian (5 emosi: Kewalahan, Sedih, Biasa, Tenang, Damai)
   - Disimpan ke tabel `mood_entries` dengan timestamp lokal (WIB-safe via date-fns)
   - Data dikelompokkan per hari: `groupByLocalDate()` helper
2. Grafik Mood Kalender (ComposedChart)
   - Hybrid chart: Bar (frekuensi harian) + Line (tren intensitas emosi 1–5)
   - Sumbu X: Senin–Minggu (ISO calendar week, bukan rolling 7 hari)
   - Warna bar = mood dominan hari itu
   - Label "Dominan: [Mood]" di bawah hari yang sudah lewat
   - Dibangun dengan Recharts ComposedChart + date-fns timezone-safe
3. AI Companion Chat — Teduh Bot (Gemini 1.5 Flash)
   - Chat empati real-time powered by Google Gemini API
   - Multi-turn conversation dengan history (max 20 pesan terakhir)
   - Protokol krisis: deteksi pikiran bunuh diri → langsung sebut hotline 119 ext 8
   - Respons singkat, hangat, dalam Bahasa Indonesia
   - Session disimpan ke tabel `bot_sessions` (Supabase)
   - Fallback respons jika API tidak tersedia
4. AI Advisor — Curhat dengan Gemini
   - Fitur "curhat" berbeda dari TeduhBot: fokus pada analitik mood & solusi
   - Kirim konteks tren mood 7 hari ke Gemini sebagai background
   - "Overall Mood Minggu Ini" — di-generate otomatis on-demand
   - Multi-turn chat dengan mood context pills
   - Typewriter reveal + typing indicator
5. Crisis SOS / Tombol Darurat
   - Terintegrasi langsung ke nomor hotline nyata lokal Indonesia
   - Into The Light: 119 ext 8, Yayasan Pulih: 021-788-42580, SEJIWA, dll.
   - Event log ke tabel `crisis_logs` (non-blocking, fire-and-forget)
6. Komunitas Anonim (Ruang Cerita)
   - Post anonim, like dengan toggle optimistic UI
   - RPC Supabase untuk increment/decrement likes
7. Guided Breathing & Grounding Exercise
   - 4-fase breathing cycle (Tarik → Tahan → Hembuskan → Istirahat)
   - Animasi Framer Motion real-time
8. Safety Plan Builder
   - Upsert ke tabel `safety_plans` (satu plan per user)
   - Field: warningSigns, coping, contacts
9. Konsultasi Profesional (Book a Session)
   - Tampilkan daftar counselor dari tabel `counselors`
   - Booking via `bookCounselorSession()` server action
10. Daily Affirmations & Micro-Challenges
    - Rotasi harian dari tabel `daily_challenges`
    - Fallback affirmation static jika DB kosong

### Bagian 6 — Information Architecture
Diagram navigasi dengan ASCII tree:
- Halaman publik (Landing, Login, Register, Magic Link callback)
- Tab navigasi user: Home / Jurnal / Ruang Cerita / Bantuan / Profil
- Section Konselor: Dashboard / Jadwal / Klien / Catatan
- Section Admin: Dashboard / Moderasi / Verifikasi / Analytics

### Bagian 7 — Data Model (Simplified)
Simplified schema (bukan full Prisma/SQL, tapi representasi tabel-tabel utama):
- users, mood_entries, journal_entries, crisis_logs, community_posts,
  community_likes, bot_sessions, sessions, counselors, notifications,
  safety_plans, resources, daily_challenges

Catatan penting:
- `mood_entries.created_at`: disimpan UTC, dipetakan ke hari lokal via `date-fns parseISO + format`
- `bot_sessions.messages`: JSONB array berisi { role: "user"|"bot", text, created_at }
- `safety_plans`: upsert dengan onConflict: "user_id" (satu plan per user)

### Bagian 8 — Tech Architecture
Stack modern + privacy-first:
| Layer | Teknologi | Alasan |
- Frontend: Next.js 16.2.2 + TypeScript (App Router)
- Mobile: PWA (MVP) / React Native (future)
- Styling: Tailwind CSS + Framer Motion v12
- State Management: Zustand (calendarStats, curhatMessages, overallSummary)
- Backend: Supabase (PostgreSQL + Auth + Storage + Realtime)
- AI Companion: **Google Gemini 1.5 Flash** (TeduhBot + Curhat Advisor)
  - API: `@google/generative-ai` package
  - Akses: Server Actions Next.js (`"use server"`) — API key tidak pernah ke browser
  - `GEMINI_API_KEY` di `.env.local` (server-only, tanpa prefix NEXT_PUBLIC_)
- Grafik: Recharts (ComposedChart + AreaChart)
- Kalender/Waktu: date-fns (timezone-safe, WIB support)
- Auth: Supabase Auth (Email/Password + Magic Link + Google OAuth)
  - Magic Link callback: `/auth/callback/route.ts` — `exchangeCodeForSession`
- Real-time: Supabase Realtime (community chat, crisis alert) [future]
- Notifikasi: Firebase Cloud Messaging [future]
- Keamanan Data: RLS Supabase, journal entries encryption-ready
- Deployment: Vercel (frontend) + Supabase Cloud
- Analytics: PostHog (privacy-first analytics) [future]

### Catatan Kunci Tambahan (dari user)
- **Target audiens**: masyarakat umum secara LUAS (semua usia, tidak terbatas demografi)
- **Crisis system**: langsung terintegrasi ke nomor hotline NYATA — Into The Light 119 ext 8, Yayasan Pulih, SEJIWA, WHO Mental Health hotline, dll.
- **Model aksesibilitas**: 100% GRATIS — tidak ada paywall, tidak ada premium tier untuk fitur inti. Monetisasi hanya dari donasi/grant/partnership institusi (bukan dari user)
- **AI Stack**: Google Gemini 1.5 Flash untuk semua AI features (TeduhBot + Curhat Advisor)
- **Baseline Tier**: Semua fitur inti gratis (mood tracker, jurnal, bot, komunitas, safety plan)
- **Magic Link**: Passwordless auth via Supabase Magic Link sudah aktif di `/auth/callback`

### Bagian 9 — MVP Scope vs Future
Phase 1 (MVP — selesai):
  ✅ Auth (Email/Password + Magic Link + Google OAuth)
  ✅ Mood Tracker (input 5 emosi + simpan ke Supabase)
  ✅ Grafik Mood (Rolling 7 hari - AreaChart + Kalender - ComposedChart)
  ✅ Teduh Bot (Gemini 1.5 Flash, multi-turn, crisis-aware)
  ✅ Curhat AI Advisor (Gemini + mood context 7 hari)
  ✅ Jurnal Pribadi (enkripsi-ready)
  ✅ Crisis SOS (hotline nyata)
  ✅ Safety Plan Builder
  ✅ Daily Challenge & Affirmation
  ✅ Guided Breathing
Phase 2 (4–6 bulan):
  🔄 Komunitas Anonim (Ruang Cerita) — UI ready, RLS siap
  🔄 Konsultasi Profesional (Booking) — UI ready, booking action siap
  🔄 Notifikasi (Firebase FCM)
  🔄 Supabase Realtime untuk community
Phase 3 (7–12 bulan):
  ❌ AI Mood Prediction & early warning
  ❌ Wearable integration (smartwatch)
  ❌ Mobile app (React Native)
  ❌ Employer Wellness Program (B2B)
  ❌ Government partnership (Kemenkes)

### Bagian 10 — Success Metrics
- Engagement: DAU/MAU, session length, journal completion rate, mood streak
- Health: mood trend improvement rate, crisis intervention success rate
- AI Quality: Gemini response rating, conversation depth (turns per session)
- Safety: zero data breach, crisis response latency < 2 detik, hotline referral rate
- Business: MoM growth, retention 30/60/90 hari, counselor satisfaction

### Bagian 11 — Future
- AI Mood Prediction & early warning system (Gemini fine-tuning)
- Wearable integration (smartwatch mood tracking via health API)
- Employer Wellness Program (B2B dashboard)
- Asuransi jiwa integration
- Government partnership (Kemenkes RI)
- Machine learning model lokal Bahasa Indonesia
- Supabase Realtime: live community reactions, crisis alert to counselor

### Bagian 12 — Open Questions
~8–10 pertanyaan yang masih harus didiskusikan:
- Regulasi: apakah platform ini termasuk layanan kesehatan yang perlu izin Kemenkes?
- Gemini rate limit: perlu caching atau queue untuk high-traffic?
- Data privasi: GDPR/UU PDP Indonesia — retensi data mood berapa lama?
- Monetisasi: donasi, grant Kemenkes, atau iklan non-intrusif?
- Konselor verifikasi: proses SIP/SIPP — siapa yang memverifikasi?
- Moderasi konten: auto-moderation Ruang Cerita — pakai Gemini juga?
- Offline mode: service worker untuk akses jurnal tanpa internet?
- Multilingual: kapan fitur Bahasa Inggris diaktifkan?

---

## Environment Variables yang Dibutuhkan
```env
# Supabase (sudah dikonfigurasi)
NEXT_PUBLIC_SUPABASE_URL=https://sfomxgbphaexyjyppwtp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Google Gemini AI (wajib untuk TeduhBot + Curhat Advisor)
# Server-only — JANGAN tambahkan prefix NEXT_PUBLIC_
GEMINI_API_KEY=your_gemini_api_key_here

# Konfigurasi mood scoring (opsional — ada default)
NEXT_PUBLIC_MOOD_SCORE_MAP={"kewalahan":1,"sedih":2.2,"biasa":3.4,"tenang":4.3,"damai":5}
NEXT_PUBLIC_MOOD_WEEKLY_RECENCY_WEIGHTS=[1.6,1.5,1.4,1.3,1.2,1.1,1]
NEXT_PUBLIC_MOOD_TREND_DELTA=0.6
```

---

## File Struktur Kode (src/)
```
src/
├── app/
│   ├── auth/callback/route.ts      ← Magic Link handler
│   ├── dashboard/page.tsx          ← Main dashboard (1800+ baris)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── globals.css
├── components/
│   ├── dashboard/
│   │   └── MoodWeeklyInsights.tsx  ← Weighted mood chart (client-side fetch)
│   ├── mood/
│   │   ├── WeeklyMoodChart.tsx     ← AreaChart rolling 7 hari
│   │   ├── MoodCalendarChart.tsx   ← ComposedChart Mon–Sun (NEW)
│   │   └── CurhatModal.tsx         ← Gemini Advisor chat (NEW)
│   └── landing/
├── lib/
│   ├── actions/
│   │   ├── auth.ts
│   │   ├── booking.ts
│   │   ├── community.ts
│   │   ├── crisis.ts
│   │   ├── curhat.ts               ← Gemini Advisor (NEW)
│   │   ├── journal.ts
│   │   ├── mood.ts                 ← + getCalendarWeekStats()
│   │   ├── safety-plan.ts
│   │   └── teduhbot.ts             ← Gemini TeduhBot (NEW)
│   ├── mood/
│   │   └── scoring.ts              ← Configurable scoring (env-driven)
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils/
│       └── mood-insights.ts        ← date-fns + CalendarWeekStats (UPDATED)
├── store/
│   └── mood.ts                     ← Zustand store (NEW)
└── types/
    └── supabase.ts
```

---

## Verifikasi Setelah Dibuat
- Buka file PRD-RuangTeduh.md dan pastikan semua 12 bagian ada
- Pastikan visual card ASCII di Bagian 5 (Core Features) tampil rapi
- Pastikan tabel kompetitor di Bagian 2 lengkap
- Pastikan formatting markdown valid (heading, table, code block)
- Pastikan AI stack sudah updated ke Gemini (bukan Claude)
- Pastikan Baseline Tier & Magic Link tercantum di Bagian 8 & 9
