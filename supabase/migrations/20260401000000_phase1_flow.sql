-- ============================================================
-- RuangTeduh — Phase 1 Flow Migration
-- Migration: 20260401000000_phase1_flow.sql
-- ============================================================

-- ============================================================
-- T0.1: user_preferences (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT CHECK (char_length(nickname) BETWEEN 1 AND 32),
  stress_triggers TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  preferred_checkin_time TIME,
  has_crisis_history BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  age_confirmed_13_plus BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_preferences_select_own"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_insert_own"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_update_own"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- T0.2: mood_streaks (NEW)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mood_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_checkin_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mood_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mood_streaks_select_own"
  ON public.mood_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "mood_streaks_upsert_own"
  ON public.mood_streaks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- T0.3: crisis_logs (EXTEND if exists, else CREATE)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crisis_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  trigger_source TEXT NOT NULL CHECK (trigger_source IN (
    'manual_button',
    'bot_keyword',
    'mood_pattern_3day',
    'onboarding_disclosure'
  )),
  matched_keywords TEXT[],
  hotline_clicked TEXT,
  followup_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.crisis_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crisis_logs_insert_own"
  ON public.crisis_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "crisis_logs_select_own"
  ON public.crisis_logs FOR SELECT
  USING (auth.uid() = user_id);

-- No UPDATE/DELETE policy — crisis logs are append-only for safety audit

-- Index for pattern detection queries
CREATE INDEX IF NOT EXISTS idx_crisis_logs_user_created
  ON public.crisis_logs(user_id, created_at DESC);

-- ============================================================
-- T0.4: mood_entries — ADD INDEX for pattern queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_created
  ON public.mood_entries(user_id, created_at DESC);

-- ============================================================
-- T0.5: updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_mood_streaks_updated_at
  BEFORE UPDATE ON public.mood_streaks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
