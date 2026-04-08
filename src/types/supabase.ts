/**
 * RuangTeduh — Supabase TypeScript Types
 * PRD Bagian 7 — Data Model (Simplified)
 *
 * Generated manually — replace with auto-generated types when ready:
 *   npx supabase gen types typescript --linked > src/types/supabase.ts
 *
 * Tables: users · mood_entries · journal_entries · crisis_logs ·
 *         community_posts · community_likes · bot_sessions ·
 *         safety_plans · counselors · sessions · resources ·
 *         daily_challenges · notifications
 */

/* ═══════════════════════════════════════
   AUTH (Supabase auth.users)
═══════════════════════════════════════ */

export interface AuthUser {
  id:         string;   // uuid — PK
  email:      string;
  created_at: string;   // ISO 8601
}

/* ═══════════════════════════════════════
   USERS (public.users)
═══════════════════════════════════════ */

export type UserRole = "user" | "counselor" | "admin";

export interface UserProfile {
  id:            string;       // uuid — FK → auth.users.id
  full_name:     string;
  avatar_url:    string | null;
  role:          UserRole;
  is_anonymous:  boolean;      // controls Ruang Cerita identity
  joined_at:     string;
  last_active:   string | null;
}

/* ═══════════════════════════════════════
   MOOD ENTRIES (public.mood_entries)
═══════════════════════════════════════ */

export type MoodId = "kewalahan" | "sedih" | "biasa" | "tenang" | "damai";

export interface MoodEntry {
  id:         string;       // uuid
  user_id:    string;       // FK → users.id
  mood_id:    MoodId;
  note:       string | null;
  created_at: string;
}

/* ═══════════════════════════════════════
   JOURNAL ENTRIES (public.journal_entries)
   RLS: row visible only to owner (user_id = auth.uid())
   Encrypted: text column encrypted via Supabase Vault
═══════════════════════════════════════ */

export interface JournalEntry {
  id:           string;       // uuid
  user_id:      string;       // FK → users.id
  text:         string;       // encrypted in production
  mood_id:      MoodId | null;
  is_encrypted: boolean;
  created_at:   string;
}

/* ═══════════════════════════════════════
   COMMUNITY POSTS (public.community_posts)
   author identity hidden — user_id nullable for full anon
═══════════════════════════════════════ */

export interface CommunityPost {
  id:          string;        // uuid
  user_id:     string | null; // null = truly anonymous
  text:        string;
  likes_count: number;
  is_flagged:  boolean;
  created_at:  string;
}

/* ═══════════════════════════════════════
   COMMUNITY LIKES (public.community_likes)
   Unique constraint: (post_id, user_id)
═══════════════════════════════════════ */

export interface CommunityLike {
  id:         string;
  post_id:    string;   // FK → community_posts.id
  user_id:    string;   // FK → users.id
  created_at: string;
}

/* ═══════════════════════════════════════
   BOT SESSIONS (public.bot_sessions)
   Messages stored as JSONB array
═══════════════════════════════════════ */

export type MessageRole = "user" | "bot";

export interface BotMessage {
  role:        MessageRole;
  text:        string;
  created_at?: string;
}

export interface BotSession {
  id:         string;
  user_id:    string;
  messages:   BotMessage[];   // JSONB column
  created_at: string;
  updated_at: string;
}

/* ═══════════════════════════════════════
   SAFETY PLANS (public.safety_plans)
   One plan per user — upsert on save
═══════════════════════════════════════ */

export interface SafetyPlan {
  id?:           string;   // uuid (optional: created on first save)
  user_id?:      string;
  warningSigns:  string;
  coping:        string;
  contacts:      string;
  updated_at?:   string;
}

/* ═══════════════════════════════════════
   CRISIS LOGS (public.crisis_logs)
   Immutable audit log — no updates/deletes
═══════════════════════════════════════ */

export interface CrisisLog {
  id:              string;
  user_id:         string | null;
  hotline_called:  string;
  triggered_at:    string;
}

/* ═══════════════════════════════════════
   COUNSELORS (public.counselors)
   Verified by admin before activation
═══════════════════════════════════════ */

export type AvailabilityStatus =
  | "available_today"
  | "available_tomorrow"
  | "unavailable";

export interface Counselor {
  id:                   string;
  user_id:              string;       // FK → users.id (counselor's auth)
  full_name:            string;
  title:                string;       // e.g. "Psikolog Klinis", "Konselor Remaja"
  specialization:       string;
  license_number:       string;       // SIP/SIPP number
  is_verified:          boolean;
  availability_status:  AvailabilityStatus;
  avatar_url:           string | null;
}

/* ═══════════════════════════════════════
   CONSULT SESSIONS (public.sessions)
═══════════════════════════════════════ */

export type SessionStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface ConsultSession {
  id:            string;
  user_id:       string;       // FK → users.id
  counselor_id:  string;       // FK → counselors.id
  scheduled_at:  string;
  status:        SessionStatus;
  notes:         string | null;
  created_at:    string;
}

/* ═══════════════════════════════════════
   RESOURCES (public.resources)
═══════════════════════════════════════ */

export type ResourceType = "article" | "video" | "guide";

export interface Resource {
  id:                   string;
  title:                string;
  type:                 ResourceType;
  read_time_minutes:    number | null;
  url:                  string;
  thumbnail_url:        string | null;
  created_at:           string;
}

/* ═══════════════════════════════════════
   DAILY CHALLENGES (public.daily_challenges)
   Rotated daily — keyed by date (YYYY-MM-DD)
═══════════════════════════════════════ */

export interface DailyChallenge {
  id:    string;
  text:  string;
  icon:  string;   // emoji
  date:  string;   // YYYY-MM-DD
}

/* ═══════════════════════════════════════
   NOTIFICATIONS (public.notifications)
═══════════════════════════════════════ */

export type NotifType =
  | "mood_reminder"
  | "journal_prompt"
  | "community_like"
  | "session_reminder"
  | "crisis_alert";

export interface Notification {
  id:         string;
  user_id:    string;
  type:       NotifType;
  message:    string;
  is_read:    boolean;
  created_at: string;
}

/* ═══════════════════════════════════════
   UI DISPLAY TYPES
   Local types used in dashboard UI.
   These are derived/transformed from the
   raw Supabase row types above.
═══════════════════════════════════════ */

/** JournalEntry enriched with formatted display date */
export interface JournalEntryDisplay extends JournalEntry {
  /** Formatted for UI: "Kemarin", "Hari Ini, 10:30", etc.
   *  Derived from created_at on the client. */
  displayDate: string;
}

/** CommunityPost enriched with client-side like state */
export interface CommunityPostDisplay extends CommunityPost {
  /** Whether the current user has liked this post.
   *  Derived from community_likes join. */
  hasLiked: boolean;
  /** Relative time string: "1 jam lalu", "Baru saja", etc.
   *  Derived from created_at on the client. */
  time: string;
}
