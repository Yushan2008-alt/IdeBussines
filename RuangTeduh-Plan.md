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
- **Versi**: 1.0 | **Tanggal**: April 2026 | **Status**: Pre-Development

---

### Bagian 1 — Overview
- Visi produk: platform dukungan kesehatan mental bilingual (ID/EN) yang menjembatani krisis depresi dan pencegahan bunuh diri dengan pendekatan empatik, non-klinis, dan ramah budaya
- Gabungan: AI companion + mood tracking + komunitas anonim + akses profesional
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
6 celah yang diisi: krisis support, komunitas anonim, AI empatik berbahasa Indonesia, safety plan builder, harga terjangkau, budaya-sensitif

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
9 feature cards:
1. Mood Journal & Tracker
2. AI Companion Chat (Teduh Bot)
3. Crisis SOS / Tombol Darurat — terintegrasi langsung ke nomor hotline nyata lokal Indonesia (Into The Light: 119 ext 8, Yayasan Pulih: 021-788-42580, dll.) dan internasional
4. Komunitas Anonim (Ruang Cerita)
5. Guided Breathing & Grounding Exercise
6. Safety Plan Builder
7. Konsultasi Profesional (Book a Session)
8. Daily Affirmations & Micro-Challenges
9. Resource Library (Artikel & Video Edukasi)

### Bagian 6 — Information Architecture
Diagram navigasi dengan ASCII tree:
- Halaman publik (Landing, Login, Register)
- Tab navigasi user: Home / Journal / Ruang Cerita / Bantuan / Profil
- Section Konselor: Dashboard / Jadwal / Klien / Catatan
- Section Admin: Dashboard / Moderasi / Verifikasi / Analytics

### Bagian 7 — Data Model (Simplified)
Simplified schema (bukan full Prisma/SQL, tapi representasi tabel-tabel utama):
- users, mood_entries, journal_entries, crisis_logs, community_posts, sessions, counselors, notifications, safety_plans, resources

### Bagian 8 — Tech Architecture
Stack modern + privacy-first:
| Layer | Teknologi | Alasan |
- Frontend: Next.js 15 + TypeScript
- Mobile: React Native (future) / PWA (MVP)
- Styling: Tailwind CSS + Framer Motion
- Backend: Supabase (PostgreSQL + Auth + Storage + Realtime)
- AI: Claude API (Anthropic) — empathetic chatbot
- Real-time: Supabase Realtime (community chat, crisis alert)
- Notifikasi: Firebase Cloud Messaging
- Keamanan Data: End-to-end encryption untuk journal, RLS Supabase
- Deployment: Vercel (frontend) + Supabase Cloud
- Analytics: PostHog (privacy-first analytics)

### Catatan Kunci Tambahan (dari user)
- **Target audiens**: masyarakat umum secara LUAS (semua usia, tidak terbatas demografi)
- **Crisis system**: langsung terintegrasi ke nomor hotline NYATA (bukan simulasi) — Into The Light 119 ext 8, Yayasan Pulih, SEJIWA, WHO Mental Health hotline, dll.
- **Model aksesibilitas**: 100% GRATIS — tidak ada paywall, tidak ada premium tier untuk fitur inti. Monetisasi hanya dari donasi/grant/partnership institusi (bukan dari user)

### Bagian 9 — MVP Scope vs Future
Phase 1 (MVP — 3 bulan): Core features, auth, mood journal, AI basic, crisis SOS, resource library
Phase 2 (4-6 bulan): Komunitas anonim, safety plan, guided exercises, notifikasi
Phase 3 (7-12 bulan): Konsultasi profesional, advanced AI, gamification, mobile app

### Bagian 10 — Success Metrics
- Engagement: DAU/MAU, session length, journal completion rate
- Health: mood trend improvement rate, crisis intervention success
- Safety: zero data breach, crisis response time < 30 detik
- Business: MoM growth, retention rate, counselor satisfaction

### Bagian 11 — Future
- AI Mood Prediction & early warning system
- Wearable integration (smartwatch mood tracking)
- Employer Wellness Program (B2B)
- Asuransi jiwa integration
- Government partnership (Kemenkes)
- Machine learning model lokal Bahasa Indonesia

### Bagian 12 — Open Questions
~8-10 pertanyaan yang masih harus didiskusikan (regulasi, monetisasi, partnership, dll)

---

## Verifikasi Setelah Dibuat
- Buka file PRD-RuangTeduh.md dan pastikan semua 12 bagian ada
- Pastikan visual card ASCII di Bagian 5 (Core Features) tampil rapi
- Pastikan tabel kompetitor di Bagian 2 lengkap
- Pastikan formatting markdown valid (heading, table, code block)
