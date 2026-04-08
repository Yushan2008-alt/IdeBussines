-- ══════════════════════════════════════════════════════════════
-- RuangTeduh — Initial Database Schema
-- Migration: 001_initial_schema.sql
--
-- Run via:  supabase db push
-- OR paste into: Supabase Dashboard → SQL Editor
--
-- Tables (13):
--   users · mood_entries · journal_entries · crisis_logs
--   community_posts · community_likes · bot_sessions
--   safety_plans · counselors · sessions · resources
--   daily_challenges · notifications
-- ══════════════════════════════════════════════════════════════

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- USERS  (public.users)
-- Mirrors auth.users with additional profile fields.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.users (
  id               uuid primary key references auth.users(id) on delete cascade,
  full_name        text         not null,
  avatar_url       text,
  role             text         not null default 'user'
                   check (role in ('user','counselor','admin')),
  is_anonymous     boolean      not null default true,
  joined_at        timestamptz  not null default now(),
  last_active      timestamptz,
  onboarding_goals jsonb        default '[]'::jsonb
);

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────
-- MOOD ENTRIES  (public.mood_entries)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.mood_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  mood_id    text not null
             check (mood_id in ('kewalahan','sedih','biasa','tenang','damai')),
  note       text,
  created_at timestamptz not null default now()
);

create index mood_entries_user_id_idx on public.mood_entries(user_id);
create index mood_entries_created_at_idx on public.mood_entries(created_at desc);

alter table public.mood_entries enable row level security;

create policy "Users can manage own mood entries"
  on public.mood_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- JOURNAL ENTRIES  (public.journal_entries)
-- RLS: row visible only to owner.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.journal_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  text         text not null,
  mood_id      text check (mood_id in ('kewalahan','sedih','biasa','tenang','damai')),
  is_encrypted boolean not null default false,
  created_at   timestamptz not null default now()
);

create index journal_entries_user_id_idx on public.journal_entries(user_id);
create index journal_entries_created_at_idx on public.journal_entries(created_at desc);

alter table public.journal_entries enable row level security;

create policy "Users can manage own journal entries"
  on public.journal_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- COMMUNITY POSTS  (public.community_posts)
-- Author identity is hidden — user_id nullable for full anon.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.community_posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete set null,
  text        text not null,
  likes_count integer not null default 0,
  is_flagged  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index community_posts_created_at_idx on public.community_posts(created_at desc);

alter table public.community_posts enable row level security;

-- Anyone can read non-flagged posts
create policy "Public can view posts"
  on public.community_posts for select
  using (is_flagged = false);

-- Any authenticated user can insert (anonymously)
create policy "Authenticated users can post"
  on public.community_posts for insert
  with check (auth.uid() is not null);

-- ─────────────────────────────────────────────────────────────
-- COMMUNITY LIKES  (public.community_likes)
-- Unique constraint: (post_id, user_id)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.community_likes (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.community_posts(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

create index community_likes_user_id_idx on public.community_likes(user_id);

alter table public.community_likes enable row level security;

create policy "Users can manage own likes"
  on public.community_likes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Helper RPC: increment / decrement likes_count atomically
create or replace function increment_likes(post_id uuid)
returns void language sql as $$
  update public.community_posts
  set likes_count = likes_count + 1
  where id = post_id;
$$;

create or replace function decrement_likes(post_id uuid)
returns void language sql as $$
  update public.community_posts
  set likes_count = greatest(0, likes_count - 1)
  where id = post_id;
$$;

-- ─────────────────────────────────────────────────────────────
-- BOT SESSIONS  (public.bot_sessions)
-- Messages stored as a JSONB array: [{role, text, created_at}]
-- ─────────────────────────────────────────────────────────────
create table if not exists public.bot_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  messages   jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bot_sessions_user_id_idx on public.bot_sessions(user_id);

alter table public.bot_sessions enable row level security;

create policy "Users can manage own bot sessions"
  on public.bot_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- SAFETY PLANS  (public.safety_plans)
-- One row per user — enforced by unique(user_id).
-- ─────────────────────────────────────────────────────────────
create table if not exists public.safety_plans (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  "warningSigns" text not null default '',
  coping       text not null default '',
  contacts     text not null default '',
  updated_at   timestamptz not null default now(),
  unique(user_id)
);

alter table public.safety_plans enable row level security;

create policy "Users can manage own safety plan"
  on public.safety_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- CRISIS LOGS  (public.crisis_logs)
-- Immutable audit log — no UPDATE or DELETE policies.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.crisis_logs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.users(id) on delete set null,
  hotline_called text not null,
  triggered_at   timestamptz not null default now()
);

alter table public.crisis_logs enable row level security;

-- Anyone (even unauthenticated) can insert a crisis log
create policy "Anyone can log crisis events"
  on public.crisis_logs for insert
  with check (true);

-- Only admins can read logs (set up service_role key for backend reads)
create policy "Only owner can view own crisis logs"
  on public.crisis_logs for select
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- COUNSELORS  (public.counselors)
-- Verified by admin before they appear in the UI.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.counselors (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  full_name           text not null,
  title               text not null,
  specialization      text not null default '',
  license_number      text not null,
  is_verified         boolean not null default false,
  availability_status text not null default 'unavailable'
                      check (availability_status in ('available_today','available_tomorrow','unavailable')),
  avatar_url          text
);

alter table public.counselors enable row level security;

-- Any authenticated user can read verified counselors
create policy "Authenticated users can view verified counselors"
  on public.counselors for select
  using (is_verified = true and auth.uid() is not null);

-- ─────────────────────────────────────────────────────────────
-- CONSULT SESSIONS  (public.sessions)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  counselor_id uuid not null references public.counselors(id) on delete cascade,
  scheduled_at timestamptz not null,
  status       text not null default 'pending'
               check (status in ('pending','confirmed','completed','cancelled')),
  notes        text,
  created_at   timestamptz not null default now()
);

alter table public.sessions enable row level security;

create policy "Users can view own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "Users can book sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- RESOURCES  (public.resources)
-- Publicly readable — managed by admins.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.resources (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  type               text not null check (type in ('article','video','guide')),
  read_time_minutes  integer,
  url                text not null,
  thumbnail_url      text,
  created_at         timestamptz not null default now()
);

alter table public.resources enable row level security;

create policy "Anyone can read resources"
  on public.resources for select
  using (true);

-- ─────────────────────────────────────────────────────────────
-- DAILY CHALLENGES  (public.daily_challenges)
-- Rotated daily — keyed by date string.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.daily_challenges (
  id   uuid primary key default gen_random_uuid(),
  text text not null,
  icon text not null default '🌱',
  date date  not null unique   -- YYYY-MM-DD
);

alter table public.daily_challenges enable row level security;

create policy "Anyone can read daily challenges"
  on public.daily_challenges for select
  using (true);

-- Seed with a few days of challenges
insert into public.daily_challenges (text, icon, date) values
  ('Tulis 3 hal yang kamu syukuri hari ini.', '✨', current_date),
  ('Lakukan pernapasan 4-7-8 selama 3 menit.', '🌬️', current_date + 1),
  ('Kirim pesan dukungan ke seseorang yang kamu sayangi.', '💌', current_date + 2)
on conflict (date) do nothing;

-- ─────────────────────────────────────────────────────────────
-- NOTIFICATIONS  (public.notifications)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  type       text not null
             check (type in ('mood_reminder','journal_prompt','community_like','session_reminder','crisis_alert')),
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications(user_id);

alter table public.notifications enable row level security;

create policy "Users can manage own notifications"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
-- TRIGGERS
-- ══════════════════════════════════════════════════════════════

-- Auto-create a public.users row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, full_name, joined_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at on bot_sessions
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_bot_sessions_updated_at on public.bot_sessions;
create trigger set_bot_sessions_updated_at
  before update on public.bot_sessions
  for each row execute procedure public.set_updated_at();
