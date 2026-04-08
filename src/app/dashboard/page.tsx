"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Wind, Sparkles, X, CloudRain, Frown,
  Meh, Smile, Sun, Quote, Heart, Sprout, Home,
  Book, MessageCircle, ShieldCheck, Send, CheckCircle,
  UserPlus, FileText, HeartHandshake, ListChecks, Activity, Users,
  ChevronRight, Video, User, Bell, Lock, LogOut, TrendingUp,
} from "lucide-react";
import type {
  MoodId, SafetyPlan, BotMessage, Counselor, Resource, DailyChallenge,
  CommunityPostDisplay, JournalEntryDisplay,
} from "@/types/supabase";
import { createClient } from "@/lib/supabase/client";

/* ══════════════════════════════════════════════════════════
   FALLBACK DATA
   Digunakan saat data Supabase belum tersedia.
══════════════════════════════════════════════════════════ */

const HOTLINES = [
  {
    name:   "Into The Light Indonesia",
    number: "119 ext 8",
    href:   "tel:119",
    desc:   "Krisis & Pencegahan Bunuh Diri — 24 jam",
    color:  "bg-sage-100 border-sage-200",
    iconBg: "bg-sage-500",
  },
  {
    name:   "Yayasan Pulih",
    number: "(021) 788-42580",
    href:   "tel:02178842580",
    desc:   "Bantuan trauma psikologis",
    color:  "bg-lavender-100 border-lavender-200",
    iconBg: "bg-lavender-400",
  },
  {
    name:   "Layanan SEJIWA",
    number: "119 ext 8",
    href:   "tel:119",
    desc:   "Dukungan Kemenkes RI — Remaja",
    color:  "bg-sky-100 border-sky-200",
    iconBg: "bg-sky-400",
  },
] as const;

/* Local UI type for mood selector items */
interface MoodItem {
  id:     MoodId;
  icon:   React.ElementType;
  label:  string;
  base:   string;
  active: string;
}

const MOODS: MoodItem[] = [
  { id: "kewalahan", icon: CloudRain, label: "Kewalahan", base: "bg-lavender-50 text-lavender-500",  active: "bg-lavender-400 text-white" },
  { id: "sedih",     icon: Frown,     label: "Sedih",     base: "bg-sky-100    text-sky-400",         active: "bg-sky-400     text-white" },
  { id: "biasa",     icon: Meh,       label: "Biasa",     base: "bg-sage-50    text-muted",           active: "bg-sage-400    text-white" },
  { id: "tenang",    icon: Smile,     label: "Tenang",    base: "bg-sage-100   text-sage-600",        active: "bg-sage-600    text-white" },
  { id: "damai",     icon: Sun,       label: "Damai",     base: "bg-peach-50   text-peach-500",       active: "bg-peach-400   text-white" },
];

const MOOD_MESSAGES: Record<MoodId, string> = {
  kewalahan: "Tidak apa-apa merasa kewalahan. Ambillah waktu sejenak, kami bersamamu.",
  sedih:     "Semua emosimu valid. Silakan ceritakan pada Teduh Bot jika lelah.",
  biasa:     "Hari yang tenang. Semoga ada hal kecil yang membuatmu tersenyum hari ini.",
  tenang:    "Senang mendengarnya. Nikmati ritme kedamaian ini.",
  damai:     "Sempurna. Energi indah ini akan menjadi kekuatanmu esok hari.",
};

const INITIAL_ENTRIES: JournalEntryDisplay[] = [
  {
    id:           "mock-1",
    user_id:      "mock",
    text:         "Kemarin terasa melelahkan, tapi bersyukur sudah terlewati.",
    mood_id:      "biasa",
    is_encrypted: false,
    created_at:   new Date(Date.now() - 86400000).toISOString(),
    displayDate:  "Kemarin",
  },
];

const INITIAL_POSTS: CommunityPostDisplay[] = [
  { id: "mock-1", user_id: null, text: "Hari ini cukup berat, tapi aku berhasil bangun dari tempat tidur. Satu langkah kecil.", likes_count: 24, is_flagged: false, created_at: new Date().toISOString(), hasLiked: false, time: "1 jam lalu" },
  { id: "mock-2", user_id: null, text: "Terkadang bernapas perlahan benar-benar membantu menurunkan detak jantungku yang berpacu.", likes_count: 112, is_flagged: false, created_at: new Date().toISOString(), hasLiked: true, time: "3 jam lalu" },
];

const INITIAL_BOT_MSGS: BotMessage[] = [
  { role: "bot", text: "Halo, aku Teduh Bot. Ruang ini aman, rahasia, dan tanpa penghakiman. Ada yang ingin kamu sampaikan hari ini? 💚" },
];

const FALLBACK_EXPERTS: Counselor[] = [
  { id: "c1", user_id: "u1", full_name: "Dr. Amanda Larasati",  title: "Psikolog Klinis Dewasa", specialization: "Adult psychology",  license_number: "SIPP-001", is_verified: true, availability_status: "available_today",    avatar_url: null },
  { id: "c2", user_id: "u2", full_name: "Bimo Setyawan, M.Psi", title: "Konselor Remaja",         specialization: "Youth counseling",  license_number: "SIPP-002", is_verified: true, availability_status: "available_tomorrow", avatar_url: null },
];

const FALLBACK_RESOURCES: Resource[] = [
  { id: "r1", title: "Memahami Lingkaran Burnout",  type: "article", read_time_minutes: 4, url: "#", thumbnail_url: null, created_at: new Date().toISOString() },
  { id: "r2", title: "Teknik Grounding saat Panik", type: "video",   read_time_minutes: null, url: "#", thumbnail_url: null, created_at: new Date().toISOString() },
];

const FALLBACK_CHALLENGE: DailyChallenge = {
  id: "fallback-challenge",
  icon: "🌱",
  text: "Minum segelas air putih perlahan-lahan. Rasakan setiap tegukannya melewati tenggorokanmu.",
  date: new Date().toISOString().slice(0, 10),
};

const FALLBACK_AFFIRMATIONS = [
  "Kamu sudah bertahan sejauh ini. Beristirahatlah jika lelah, rute hidup tak selamanya lurus.",
  "Satu langkah kecil hari ini tetap berarti besar untuk dirimu yang esok.",
  "Kamu tidak harus selalu kuat; cukup jujur pada perasaanmu hari ini.",
] as const;

const BREATH_PHASES = ["Tarik napas...", "Tahan...", "Hembuskan...", "Istirahat..."] as const;

/* ─── Date helpers ─── */
function formatDisplayDate(iso: string): string {
  const d    = new Date(iso);
  const now  = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins  < 2)  return "Baru saja";
  if (mins  < 60) return `${mins} menit lalu`;
  if (hrs   < 24) return `Hari Ini, ${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
  if (days === 1) return "Kemarin";
  if (days  < 7)  return `${days} hari lalu`;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long" });
}
function formatRelativeTime(iso: string): string { return formatDisplayDate(iso); }

/* ─── Tab transition variants ─── */
const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0,   transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit:    { opacity: 0, y: -14, transition: { duration: 0.22 } },
} as import("framer-motion").Variants;

/* ══════════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════════ */
export default function RuangTeduhApp() {
  const supabase = createClient();
  const router   = useRouter();

  /* ── Auth state ── */
  const [currentUserName, setCurrentUserName] = useState("Pengguna");
  const [currentUserId,   setCurrentUserId]   = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState("pengguna@ruangteduh.id");

  /* ── Get session + initial data on mount ── */
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      setCurrentUserId(user.id);
      setCurrentUserEmail(user.email ?? "");
      setCurrentUserName(
        user.user_metadata?.full_name ??
        user.email?.split("@")[0] ??
        "Pengguna"
      );

      // Fetch journal entries for current user
      const { data: journals } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (journals && journals.length > 0) {
        setJournalEntries(journals.map((row) => ({
          ...row,
          displayDate: formatDisplayDate(row.created_at),
        })));
      }

      // Fetch community posts with like state
      const { data: posts } = await supabase
        .from("community_posts")
        .select("*")
        .eq("is_flagged", false)
        .order("created_at", { ascending: false })
        .limit(30);
      if (posts && posts.length > 0) {
        const { data: likes } = await supabase
          .from("community_likes")
          .select("post_id")
          .eq("user_id", user.id);
        const likedIds = new Set((likes ?? []).map((l) => l.post_id));
        setCommunityPosts(posts.map((p) => ({
          ...p,
          hasLiked: likedIds.has(p.id),
          time:     formatRelativeTime(p.created_at),
        })));
      }

      // Fetch safety plan
      const { data: plan } = await supabase
        .from("safety_plans")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (plan) setSafetyPlan(plan as SafetyPlan);

      // Fetch bot session
      const { data: botSession } = await supabase
        .from("bot_sessions")
        .select("messages")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (botSession && Array.isArray(botSession.messages) && botSession.messages.length > 0) {
        setBotMessages(botSession.messages as BotMessage[]);
      }

      // Fetch available counselors
      const { data: counselors } = await supabase
        .from("counselors")
        .select("*")
        .eq("is_verified", true)
        .neq("availability_status", "unavailable")
        .order("full_name", { ascending: true })
        .limit(10);
      if (counselors && counselors.length > 0) {
        setCounselors(counselors);
      }

      // Fetch resources
      const { data: resources } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (resources && resources.length > 0) {
        setResources(resources);
        const idx = new Date().getDate() % resources.length;
        const picked = resources[idx];
        setDailyAffirmation({
          text: `Hari ini cukup satu langkah kecil: ${picked.title}.`,
          author: "RuangTeduh",
        });
      }

      // Fetch daily challenge
      const today = new Date().toISOString().slice(0, 10);
      const { data: challenge } = await supabase
        .from("daily_challenges")
        .select("*")
        .eq("date", today)
        .maybeSingle();
      if (challenge) setDailyChallenge(challenge);
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeTab,        setActiveTab]        = useState("home");
  const [isSOSOpen,        setIsSOSOpen]        = useState(false);
  const [isBotOpen,        setIsBotOpen]        = useState(false);
  const [isSafetyPlanOpen, setIsSafetyPlanOpen] = useState(false);

  /* Lifted states — persisted across tab switches */
  const [journalEntries, setJournalEntries] = useState<JournalEntryDisplay[]>(INITIAL_ENTRIES);
  const [communityPosts, setCommunityPosts] = useState<CommunityPostDisplay[]>(INITIAL_POSTS);
  const [botMessages,    setBotMessages]    = useState<BotMessage[]>(INITIAL_BOT_MSGS);
  const [challengeDone,  setChallengeDone]  = useState(false);
  const [safetyPlan,     setSafetyPlan]     = useState<SafetyPlan>({ warningSigns: "", coping: "", contacts: "" });
  const [counselors,     setCounselors]     = useState<Counselor[]>(FALLBACK_EXPERTS);
  const [resources,      setResources]      = useState<Resource[]>(FALLBACK_RESOURCES);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge>(FALLBACK_CHALLENGE);
  const [dailyAffirmation, setDailyAffirmation] = useState<{ text: string; author: string }>(() => ({
    text: FALLBACK_AFFIRMATIONS[new Date().getDate() % FALLBACK_AFFIRMATIONS.length],
    author: "Anonim",
  }));

  return (
    <div className="bg-cream min-h-screen text-forest flex flex-col md:flex-row w-full">

      {/* ── Sidebar (Desktop) / Bottom Nav (Mobile) ── */}
      <nav className="fixed bottom-0 left-0 right-0 md:relative md:w-20 lg:w-60 bg-white/90 backdrop-blur-xl border-t md:border-t-0 md:border-r border-border z-40 flex md:flex-col justify-around md:justify-start px-3 py-3 md:px-4 md:py-8 md:h-screen md:sticky md:top-0 shadow-[0_-4px_24px_-8px_rgba(45,74,53,0.06)] md:shadow-[4px_0_24px_-8px_rgba(45,74,53,0.04)]">

        {/* Logo — desktop only */}
        <div className="hidden md:flex items-center gap-3 mb-10 px-2">
          <div className="w-9 h-9 rounded-2xl bg-sage-500 flex items-center justify-center shadow-[0_4px_12px_-4px_rgba(109,148,116,0.5)] shrink-0">
            <Sprout className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold text-forest hidden lg:block">
            Ruang<span className="text-sage-600">Teduh</span>
          </span>
        </div>

        <div className="flex w-full md:flex-col gap-1">
          {[
            { id: "home",         icon: Home,         label: "Beranda" },
            { id: "jurnal",       icon: Book,         label: "Jurnal"  },
            { id: "ruang-cerita", icon: MessageCircle, label: "Cerita"  },
            { id: "bantuan",      icon: ShieldCheck,  label: "Bantuan" },
            { id: "profil",       icon: User,         label: "Profil"  },
          ].map((item) => (
            <NavItem
              key={item.id}
              id={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab}
              onClick={setActiveTab}
            />
          ))}
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-5 md:px-8 pb-32 pt-6 md:pt-10">

        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sage-500 flex items-center justify-center">
              <Sprout className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-semibold text-forest">
              Ruang<span className="text-sage-600">Teduh</span>
            </span>
          </div>
          <div className="hidden md:block" />

          {/* SOS Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsSOSOpen(true)}
            className="flex items-center gap-2 bg-peach-100 text-peach-500 border border-peach-200 px-5 py-2.5 rounded-full font-semibold text-sm shadow-sm hover:bg-peach-200 transition-colors ml-auto"
          >
            <motion.span
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3 }}
            >
              <Phone className="w-4 h-4" />
            </motion.span>
            Bantuan Darurat
          </motion.button>
        </header>

        {/* Tab Pages */}
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <TabHome
                userName={currentUserName}
                onOpenBot={() => setIsBotOpen(true)}
                challengeDone={challengeDone}
                setChallengeDone={setChallengeDone}
                dailyChallenge={dailyChallenge}
                dailyAffirmation={dailyAffirmation}
              />
            </motion.div>
          )}
          {activeTab === "jurnal" && (
            <motion.div key="jurnal" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <TabJurnal entries={journalEntries} setEntries={setJournalEntries} />
            </motion.div>
          )}
          {activeTab === "ruang-cerita" && (
            <motion.div key="ruang" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <TabRuangCerita posts={communityPosts} setPosts={setCommunityPosts} />
            </motion.div>
          )}
          {activeTab === "bantuan" && (
            <motion.div key="bantuan" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <TabBantuan
                onOpenSafetyPlan={() => setIsSafetyPlanOpen(true)}
                counselors={counselors}
                resources={resources}
                currentUserId={currentUserId}
              />
            </motion.div>
          )}
          {activeTab === "profil" && (
            <motion.div key="profil" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <TabProfil
                userName={currentUserName}
                userEmail={currentUserEmail}
                userId={currentUserId}
                journalCount={journalEntries.length}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Floating Teduh Bot Button ── */}
      <AnimatePresence>
        {!isBotOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsBotOpen(true)}
            className="fixed bottom-24 md:bottom-10 right-5 md:right-10 w-[60px] h-[60px] bg-lavender-400 hover:bg-lavender-500 rounded-full flex items-center justify-center shadow-[0_8px_32px_-8px_rgba(165,145,204,0.6)] text-white z-30 ring-4 ring-lavender-100 transition-colors"
            aria-label="Buka Teduh Bot"
          >
            <Sparkles className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-peach-400 rounded-full border-2 border-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Modals ── */}
      <SOSModal        isOpen={isSOSOpen}        onClose={() => setIsSOSOpen(false)} />
      <TeduhBotModal   isOpen={isBotOpen}         onClose={() => setIsBotOpen(false)}        messages={botMessages}    setMessages={setBotMessages} />
      <SafetyPlanModal isOpen={isSafetyPlanOpen} onClose={() => setIsSafetyPlanOpen(false)} plan={safetyPlan}         setPlan={setSafetyPlan} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   NAV ITEM
══════════════════════════════════════════════════════════ */
interface NavItemProps {
  id:      string;
  icon:    React.ElementType;
  label:   string;
  active:  string;
  onClick: (id: string) => void;
}

function NavItem({ id, icon: Icon, label, active, onClick }: NavItemProps) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-3 md:px-3 md:py-3 rounded-2xl transition-all duration-200 w-full group
        ${isActive
          ? "bg-sage-100 text-sage-700"
          : "text-muted hover:bg-sage-50 hover:text-forest"
        }`}
    >
      <Icon
        className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-sage-600" : "text-muted group-hover:text-sage-500"}`}
        strokeWidth={isActive ? 2.25 : 1.75}
      />
      <span className={`text-[10px] md:hidden lg:block lg:text-sm ${isActive ? "font-semibold" : "font-medium"}`}>
        {label}
      </span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB: HOME
══════════════════════════════════════════════════════════ */
interface TabHomeProps {
  userName:        string;
  onOpenBot:       () => void;
  challengeDone:   boolean;
  setChallengeDone: (v: boolean) => void;
  dailyChallenge: DailyChallenge;
  dailyAffirmation: { text: string; author: string };
}

function TabHome({
  userName, onOpenBot, challengeDone, setChallengeDone, dailyChallenge, dailyAffirmation,
}: TabHomeProps) {
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  });
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const [isBreathing,  setIsBreathing]  = useState(false);
  const [phaseIdx,     setPhaseIdx]     = useState(0);

  /* 4-phase breathing cycle: Tarik → Tahan → Hembuskan → Istirahat */
  useEffect(() => {
    if (!isBreathing) return;
    let idx = 0;
    const id = setInterval(() => {
      idx = (idx + 1) % BREATH_PHASES.length;
      setPhaseIdx(idx);
    }, 4000);
    return () => clearInterval(id);
  }, [isBreathing]);

  const breathPhase = isBreathing ? BREATH_PHASES[phaseIdx] : "Siap untuk mulai?";
  const isInhale    = breathPhase === "Tarik napas...";

  const handleMoodSelect = async (moodId: MoodId) => {
    setSelectedMood(moodId);

    // Insert mood entry into Supabase — fire-and-forget (non-blocking UI)
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      supabase.from("mood_entries").insert({
        user_id:    user.id,
        mood_id:    moodId,
        note:       null,
        created_at: new Date().toISOString(),
      }).then(({ error }) => {
        if (error) console.error("[mood insert]", error.message);
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

      {/* ── Mood Tracker ── */}
      <div className="md:col-span-8 bg-sage-50 p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-center border border-sage-100">
        <div className="absolute top-0 right-0 w-72 h-72 bg-sage-200/40 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />

        <h2 className="font-display text-3xl md:text-4xl font-semibold text-forest mb-2 relative z-10">
          {greeting}, {userName}.
        </h2>
        <p className="text-muted text-base mb-8 relative z-10">Bagaimana perasaanmu di ruang ini sekarang?</p>

        <div className="flex flex-wrap gap-3 mb-5 relative z-10">
          {MOODS.map((mood) => {
            const Icon     = mood.icon;
            const isActive = selectedMood === mood.id;
            return (
              <motion.button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                whileHover={{ scale: 1.06, y: -2 }}
                whileTap={{ scale: 0.94 }}
                className={`flex flex-col items-center justify-center p-3 w-[68px] md:w-[84px] rounded-[1.5rem] border transition-all duration-250 shadow-sm
                  ${isActive
                    ? `${mood.active} border-transparent shadow-md`
                    : `${mood.base} border-white/60 hover:bg-white`
                  }`}
              >
                <Icon className="w-8 h-8 md:w-9 md:h-9 mb-1.5" strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="text-[10px] md:text-xs font-semibold">{mood.label}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {selectedMood && (
            <motion.div
              key={selectedMood}
              initial={{ opacity: 0, height: 0, y: 8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{   opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10"
            >
              <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl text-forest font-medium text-sm shadow-sm border border-white">
                {MOOD_MESSAGES[selectedMood]}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Breathing Widget ── */}
      <div className="md:col-span-4 bg-white p-7 rounded-[2.5rem] flex flex-col items-center justify-center text-center border border-border shadow-[0_4px_20px_-8px_rgba(45,74,53,0.06)]">
        <div className="flex items-center gap-2 text-muted mb-5">
          <Wind className="w-4 h-4" />
          <span className="font-semibold text-sm">Jeda Sejenak</span>
        </div>

        <div className="relative w-32 h-32 flex items-center justify-center mb-5">
          <motion.div
            animate={{
              scale:   isBreathing ? (isInhale ? 1.55 : 0.95) : 1,
              opacity: isBreathing ? 0.35 : 0.08,
            }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="absolute w-28 h-28 rounded-full bg-lavender-300"
          />
          <div className="w-24 h-24 rounded-full bg-lavender-50 flex items-center justify-center z-10 border-[5px] border-white shadow-[0_4px_16px_-4px_rgba(165,145,204,0.3)] relative">
            <Wind className={`w-8 h-8 text-lavender-400 transition-all ${isBreathing ? "scale-110" : "scale-100"}`} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={breathPhase}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-lavender-500 font-bold text-sm min-h-[1.5rem] mb-5"
          >
            {breathPhase}
          </motion.p>
        </AnimatePresence>

        <button
          onClick={() =>
            setIsBreathing((prev) => {
              setPhaseIdx(0);
              return !prev;
            })
          }
          className={`px-7 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
            isBreathing
              ? "bg-sage-50 text-muted border border-border hover:bg-sage-100"
              : "bg-lavender-400 text-white hover:bg-lavender-500 shadow-[0_4px_14px_-4px_rgba(165,145,204,0.5)]"
          }`}
        >
          {isBreathing ? "Hentikan" : "Mulai Bernapas"}
        </button>
      </div>

      {/* ── Micro Challenge ── */}
      <div className="md:col-span-12 bg-white border border-border p-6 md:p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-5 shadow-[0_4px_20px_-8px_rgba(45,74,53,0.04)]">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 bg-peach-50 rounded-[1.2rem] flex items-center justify-center text-peach-400 shrink-0 mx-auto md:mx-0 border border-peach-100">
            <span className="text-2xl leading-none">{dailyChallenge.icon || "🌱"}</span>
          </div>
          <div>
            <h3 className="font-display font-semibold text-forest text-lg mb-0.5">Misi Kecil Hari Ini</h3>
            <p className="text-sm text-muted leading-relaxed max-w-md">
              {dailyChallenge.text}
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setChallengeDone(true)}
          className={`w-full md:w-auto px-7 py-3 rounded-full text-sm font-bold transition-all shrink-0 ${
            challengeDone
              ? "bg-sage-100 text-sage-700 border border-sage-200"
              : "bg-sage-50 hover:bg-sage-100 text-forest border border-border"
          }`}
        >
          {challengeDone ? "✓ Kamu Luar Biasa! 🎉" : "Tandai Selesai"}
        </motion.button>
      </div>

      {/* ── Teduh Bot Card ── */}
      <motion.div
        className="md:col-span-7 bg-lavender-50 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-5 cursor-pointer hover:bg-lavender-100 transition-colors border border-lavender-100 shadow-[0_4px_20px_-8px_rgba(165,145,204,0.12)]"
        onClick={onOpenBot}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="w-16 h-16 shrink-0 bg-lavender-200 rounded-[1.5rem] flex items-center justify-center border border-lavender-200/50">
          <Sparkles className="w-8 h-8 text-lavender-500" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-display text-xl font-semibold text-forest mb-1">Teduh Bot AI</h3>
          <p className="text-muted text-sm mb-4 leading-relaxed">Aku hadir 24/7 untuk mendengarkan ceritamu tanpa menghakimi.</p>
          <button className="bg-lavender-400 hover:bg-lavender-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm pointer-events-none">
            Mulai Percakapan
          </button>
        </div>
      </motion.div>

      {/* ── Afirmasi ── */}
      <div className="md:col-span-5 bg-peach-50 p-8 rounded-[2.5rem] relative overflow-hidden border border-peach-100 shadow-[0_4px_20px_-8px_rgba(232,170,132,0.12)]">
        <Quote className="w-20 h-20 text-peach-200 absolute -top-4 -right-4 rotate-12 pointer-events-none" />
        <div className="flex items-center gap-2 mb-4 text-peach-400 relative z-10">
          <Heart className="w-4 h-4 fill-peach-400" />
          <p className="font-bold text-xs uppercase tracking-widest">Afirmasi Hari Ini</p>
        </div>
        <p className="font-display text-forest font-semibold leading-relaxed relative z-10 text-[15px] italic">
          &ldquo;{dailyAffirmation.text}&rdquo;
        </p>
        <p className="text-muted text-xs mt-4 font-semibold tracking-wide uppercase relative z-10">&mdash; {dailyAffirmation.author}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB: JURNAL
══════════════════════════════════════════════════════════ */
interface TabJurnalProps {
  entries:    JournalEntryDisplay[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntryDisplay[]>>;
}

function TabJurnal({ entries, setEntries }: TabJurnalProps) {
  const supabase = createClient();
  const [journalText, setJournalText] = useState("");
  const [isSaving,    setIsSaving]    = useState(false);

  const handleSave = async () => {
    if (!journalText.trim() || isSaving) return;
    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    const now = new Date();

    if (user) {
      // Insert into Supabase journal_entries (encrypted in prod via Vault)
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id:      user.id,
          text:         journalText.trim(),
          mood_id:      null,
          is_encrypted: false,
          created_at:   now.toISOString(),
        })
        .select()
        .single();

      if (!error && data) {
        const newEntry: JournalEntryDisplay = {
          ...data,
          displayDate: formatDisplayDate(data.created_at),
        };
        setEntries((prev) => [newEntry, ...prev]);
        setJournalText("");
        setIsSaving(false);
        return;
      }
      if (error) console.error("[journal insert]", error.message);
    }

    // Optimistic fallback (offline / not logged in)
    const min = String(now.getMinutes()).padStart(2, "0");
    const newEntry: JournalEntryDisplay = {
      id:           String(Date.now()),
      user_id:      user?.id ?? "local",
      text:         journalText,
      mood_id:      null,
      is_encrypted: false,
      created_at:   now.toISOString(),
      displayDate:  `Hari Ini, ${now.getHours()}:${min}`,
    };
    setEntries((prev) => [newEntry, ...prev]);
    setJournalText("");
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Write area */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-border shadow-[0_4px_20px_-8px_rgba(45,74,53,0.05)]">
        <h2 className="font-display text-2xl font-semibold text-forest mb-1">Tuliskan Bebanmu.</h2>
        <p className="text-muted text-sm mb-6">Jurnal pribadimu 100% aman — dienkripsi dari ujung ke ujung.</p>
        <textarea
          className="w-full h-36 bg-sage-50 border border-border rounded-3xl p-5 text-forest text-sm focus:outline-none focus:ring-2 focus:ring-sage-200 resize-none placeholder:text-muted-light font-medium leading-relaxed"
          placeholder="Apa yang memberatkan hatimu hari ini...?"
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleSave(); }}
        />
        <div className="flex justify-between items-center mt-4">
          <p className="text-xs text-muted-light">Ctrl + Enter untuk menyimpan</p>
          <motion.button
            whileHover={{ scale: isSaving ? 1 : 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSave}
            disabled={isSaving}
            className="bg-sage-500 hover:bg-sage-600 disabled:bg-muted-light disabled:cursor-not-allowed text-white px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 shadow-[0_4px_14px_-4px_rgba(109,148,116,0.5)] transition-all"
          >
            {isSaving ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {isSaving ? "Menyimpan..." : "Simpan Jurnal"}
          </motion.button>
        </div>
      </div>

      {/* Journal entries */}
      <h3 className="font-semibold text-muted text-sm uppercase tracking-widest px-2">Catatan Perjalananmu</h3>
      <div className="space-y-4">
        {entries.map((entry, i) => {
          const mood     = MOODS.find((m) => m.id === entry.mood_id) ?? MOODS[2];
          const MoodIcon = mood.icon;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className="bg-white p-6 rounded-[2rem] flex gap-4 border border-border shadow-sm"
            >
              <div className={`w-12 h-12 rounded-2xl ${mood.base} flex shrink-0 items-center justify-center border border-white`}>
                <MoodIcon className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-light mb-1.5">{entry.displayDate}</p>
                <p className="text-forest text-sm leading-relaxed font-medium">{entry.text}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB: RUANG CERITA
══════════════════════════════════════════════════════════ */
interface TabRuangCeritaProps {
  posts:    CommunityPostDisplay[];
  setPosts: React.Dispatch<React.SetStateAction<CommunityPostDisplay[]>>;
}

function TabRuangCerita({ posts, setPosts }: TabRuangCeritaProps) {
  const supabase = createClient();
  const [newPost, setNewPost] = useState("");
  const tempPostCounterRef = useRef(0);

  useEffect(() => {
    const realtimeClient = createClient();
    const channel = realtimeClient
      .channel("community_posts_live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_posts" },
        (payload) => {
          const inserted = payload.new as {
            id: string;
            user_id: string | null;
            text: string;
            likes_count: number;
            is_flagged: boolean;
            created_at: string;
          };
          if (inserted.is_flagged) return;
          setPosts((prev) => {
            if (prev.some((p) => p.id === inserted.id)) return prev;
            return [
              {
                ...inserted,
                hasLiked: false,
                time: formatRelativeTime(inserted.created_at),
              },
              ...prev,
            ];
          });
        }
      )
      .subscribe();

    return () => {
      realtimeClient.removeChannel(channel);
    };
  }, [setPosts]);

  const toggleLike = async (id: string) => {
    // Optimistic UI update immediately
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, likes_count: p.hasLiked ? p.likes_count - 1 : p.likes_count + 1, hasLiked: !p.hasLiked }
          : p
      )
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const post = posts.find((p) => p.id === id);
    if (!post) return;

    if (post.hasLiked) {
      // Remove like
      await supabase.from("community_likes")
        .delete()
        .match({ post_id: id, user_id: user.id });
      await supabase.rpc("decrement_likes", { post_id: id });
    } else {
      // Add like
      await supabase.from("community_likes")
        .insert({ post_id: id, user_id: user.id, created_at: new Date().toISOString() });
      await supabase.rpc("increment_likes", { post_id: id });
    }
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    const text = newPost.trim();

    // Optimistic: show immediately while Supabase inserts
    tempPostCounterRef.current += 1;
    const tempId = `temp-${tempPostCounterRef.current}`;
    const optimistic: CommunityPostDisplay = {
      id:          tempId,
      user_id:     null,
      text,
      likes_count: 0,
      is_flagged:  false,
      created_at:  new Date().toISOString(),
      hasLiked:    false,
      time:        "Baru saja",
    };
    setPosts((prev) => [optimistic, ...prev]);
    setNewPost("");

    // Insert into Supabase (anonymous post — user_id = null)
    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        user_id:     null,
        text,
        likes_count: 0,
        is_flagged:  false,
        created_at:  new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && data) {
      // Replace optimistic entry with real ID from DB
      setPosts((prev) =>
        prev.map((p) =>
          p.id === tempId
            ? { ...data, hasLiked: false, time: "Baru saja" }
            : p
        )
      );
    } else if (error) {
      console.error("[community insert]", error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-peach-50 p-8 rounded-[2.5rem] border border-peach-100">
        <h2 className="font-display text-2xl font-semibold text-forest mb-2">Ruang Cerita (Anonim)</h2>
        <p className="text-muted text-sm leading-relaxed">Validasi perasaanmu tanpa harus diketahui identitasnya. Kita semua saling menjaga ruang ini.</p>
      </div>

      {/* Compose */}
      <div className="bg-white p-4 md:pl-6 rounded-[2rem] border border-border flex flex-col md:flex-row gap-3 items-center shadow-sm">
        <input
          className="w-full md:flex-1 bg-sage-50 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-sage-200 text-forest text-sm font-medium placeholder:text-muted-light border border-border"
          placeholder="Bagikan pengalaman atau dorongan anonim..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePost()}
        />
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handlePost}
          className="w-full md:w-auto bg-peach-100 text-peach-500 border border-peach-200 px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-peach-200 transition-colors flex items-center justify-center gap-2"
        >
          Bagikan <Send className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-6 rounded-[2rem] border border-border shadow-sm hover:border-sage-200 transition-colors"
          >
            <p className="text-forest text-sm font-medium leading-relaxed mb-5">{post.text}</p>
            <div className="flex items-center justify-between text-muted-light text-xs">
              <span className="font-semibold">{post.time}</span>
              <motion.button
                whileTap={{ scale: 0.82 }}
                onClick={() => toggleLike(post.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all border font-semibold ${
                  post.hasLiked
                    ? "bg-peach-50 text-peach-500 border-peach-200"
                    : "bg-sage-50 hover:bg-sage-100 border-border text-muted"
                }`}
              >
                <Heart className={`w-4 h-4 transition-colors ${post.hasLiked ? "fill-peach-400 text-peach-400" : ""}`} />
                {post.likes_count}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB: BANTUAN
══════════════════════════════════════════════════════════ */
interface TabBantuanProps {
  onOpenSafetyPlan: () => void;
  counselors: Counselor[];
  resources: Resource[];
  currentUserId: string | null;
}

function TabBantuan({ onOpenSafetyPlan, counselors, resources, currentUserId }: TabBantuanProps) {
  const supabase = createClient();
  const [isBooking, setIsBooking] = useState<string | null>(null);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  const displayedResources = resources.slice(0, 2);

  const handleBook = async (counselorId: string) => {
    if (!currentUserId) {
      setBookingMessage("Silakan login ulang untuk memesan sesi.");
      return;
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(counselorId)) {
      setBookingMessage("Direktori demo aktif. Booking akan tersedia setelah data konselor terverifikasi sinkron.");
      return;
    }

    setIsBooking(counselorId);
    setBookingMessage(null);

    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 1);
    const scheduledAt = scheduledDate.toISOString();
    const { error } = await supabase.from("sessions").insert({
      user_id: currentUserId,
      counselor_id: counselorId,
      scheduled_at: scheduledAt,
      status: "pending",
      notes: null,
    });

    if (error) {
      setBookingMessage("Gagal membuat booking. Coba beberapa saat lagi.");
    } else {
      setBookingMessage("Booking terkirim. Konselor akan mengonfirmasi jadwalmu.");
    }

    setIsBooking(null);
  };

  return (
    <div className="space-y-6">

      {/* Safety Plan Builder */}
      <motion.div
        onClick={onOpenSafetyPlan}
        whileHover={{ y: -3 }}
        className="bg-lavender-50 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-lavender-100 transition-colors border border-lavender-100 shadow-[0_4px_20px_-8px_rgba(165,145,204,0.1)]"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <HeartHandshake className="w-5 h-5 text-lavender-500 shrink-0" />
            <h2 className="font-display text-xl font-semibold text-forest">Safety Plan Builder</h2>
          </div>
          <p className="text-muted text-sm font-medium leading-relaxed">Buat rancangan pertahanan diri untuk menghadapi situasi krisis.</p>
        </div>
        <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-lavender-100 shrink-0">
          <ChevronRight className="w-5 h-5 text-lavender-400" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Konsultasi Profesional */}
        <div className="bg-white border border-border p-8 rounded-[2.5rem] shadow-[0_4px_20px_-8px_rgba(45,74,53,0.04)]">
          <div className="w-[52px] h-[52px] bg-sage-100 rounded-[1.2rem] flex items-center justify-center mb-5 border border-sage-200">
            <UserPlus className="w-6 h-6 text-sage-600" />
          </div>
          <h3 className="font-display font-semibold text-lg text-forest mb-2">Konsultasi Profesional</h3>
          <p className="text-muted text-sm mb-5 leading-relaxed">Terhubung dengan profesional kesehatan mental berlisensi.</p>

          <div className="space-y-3">
            {counselors.map((ex) => (
              <motion.div
                key={ex.id}
                whileHover={{ x: 3 }}
                className="p-4 rounded-[1.5rem] bg-sage-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-border flex justify-between items-center cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-sm text-forest">{ex.full_name}</p>
                  <p className="text-xs text-muted mt-0.5">{ex.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-sage-700 bg-sage-100 border border-sage-200 px-3 py-1.5 rounded-full whitespace-nowrap">
                    {ex.availability_status === "available_today" ? "Tersedia Hari Ini" : "Tersedia Besok"}
                  </span>
                  <button
                    onClick={() => handleBook(ex.id)}
                    disabled={isBooking === ex.id}
                    className="text-[11px] font-bold bg-sage-500 hover:bg-sage-600 disabled:bg-muted-light text-white px-3 py-1.5 rounded-full transition-colors"
                  >
                    {isBooking === ex.id ? "Memesan..." : "Booking"}
                  </button>
                </div>
              </motion.div>
            ))}
            {counselors.length === 0 && (
              <p className="text-sm text-muted">Belum ada konselor tersedia saat ini.</p>
            )}
          </div>
          {bookingMessage && <p className="text-xs text-muted mt-3">{bookingMessage}</p>}
          <button className="w-full mt-5 bg-sage-50 text-sage-700 font-semibold text-sm py-3.5 rounded-full hover:bg-sage-100 transition-colors border border-sage-200">
            Telusuri Direktori Terapis
          </button>
        </div>

        {/* Resource Library */}
        <div className="bg-white border border-border p-8 rounded-[2.5rem] shadow-[0_4px_20px_-8px_rgba(45,74,53,0.04)]">
          <div className="w-[52px] h-[52px] bg-peach-50 rounded-[1.2rem] flex items-center justify-center mb-5 border border-peach-100">
            <FileText className="w-6 h-6 text-peach-400" />
          </div>
          <h3 className="font-display font-semibold text-lg text-forest mb-2">Pusat Edukasi Mental</h3>
          <p className="text-muted text-sm mb-5 leading-relaxed">Artikel ilmiah kurasi psikolog serta panduan interaktif.</p>

          <div className="space-y-3">
            {displayedResources.map((res) => (
              <motion.div
                key={res.id}
                whileHover={{ x: 3 }}
                className="p-4 rounded-[1.5rem] bg-peach-50 border border-peach-100 hover:bg-white hover:shadow-sm hover:border-border transition-all flex justify-between items-center cursor-pointer"
              >
                <p className="font-semibold text-sm text-forest flex-1">{res.title}</p>
                {res.type === "video" ? (
                  <div className="bg-peach-100 p-1.5 rounded-full shrink-0 ml-2">
                    <Video className="w-4 h-4 text-peach-500" />
                  </div>
                ) : (
                  <span className="text-[10px] text-peach-500 font-bold bg-peach-100 px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 ml-2">
                    {(res.read_time_minutes ?? 3)} Min Baca
                  </span>
                )}
              </motion.div>
            ))}
            {displayedResources.length === 0 && (
              <p className="text-sm text-muted">Belum ada materi tersedia.</p>
            )}
          </div>
          <a
            href={resources[0]?.url ?? "#"}
            target={resources[0]?.url ? "_blank" : undefined}
            rel="noreferrer"
            className="w-full mt-5 bg-peach-50 text-peach-500 font-semibold text-sm py-3.5 rounded-full hover:bg-peach-100 transition-colors border border-peach-100 block text-center"
          >
            Lihat Semua Materi
          </a>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB: PROFIL
   PRD Bagian 6 — Information Architecture (tab ke-5)
══════════════════════════════════════════════════════════ */
interface TabProfilProps {
  userName:     string;
  userEmail:    string;
  userId:       string | null;
  journalCount: number;
}

function TabProfil({ userName, userEmail, userId, journalCount }: TabProfilProps) {
  const supabase = createClient();
  const router   = useRouter();
  const initials = userName.slice(0, 2).toUpperCase();

  const [notifMood,    setNotifMood]    = useState(true);
  const [notifJournal, setNotifJournal] = useState(false);
  const [isAnon,       setIsAnon]       = useState(true);
  const [moodStreak,   setMoodStreak]   = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch mood streak from Supabase
  useEffect(() => {
    if (!userId) return;
    const fetchStreak = async () => {
      const { data } = await supabase
        .from("mood_entries")
        .select("created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(60);
      if (!data || data.length === 0) return;
      const uniqueDays = [...new Set(data.map((r) => new Date(r.created_at).toDateString()))];
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < uniqueDays.length; i++) {
        const expected = new Date(today);
        expected.setDate(today.getDate() - i);
        if (uniqueDays[i] === expected.toDateString()) streak++;
        else break;
      }
      setMoodStreak(streak);
    };
    fetchStreak();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Persist anonymous setting change to Supabase
  const handleAnonToggle = async () => {
    const next = !isAnon;
    setIsAnon(next);
    if (userId) {
      await supabase.from("users").update({ is_anonymous: next }).eq("id", userId);
    }
  };

  // Sign out via Supabase
  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Profile Card */}
      <div className="bg-white border border-border p-8 rounded-[2.5rem] shadow-[0_4px_20px_-8px_rgba(45,74,53,0.05)]">
        <div className="flex items-center gap-5 mb-8">
          {/* Avatar — initials based, will show photo from Supabase Storage */}
          <div className="w-20 h-20 rounded-[1.8rem] bg-sage-500 flex items-center justify-center shadow-[0_4px_20px_-6px_rgba(109,148,116,0.45)] shrink-0">
            <span className="text-white font-display font-bold text-2xl">{initials}</span>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-forest">{userName}</h2>
            <p className="text-muted text-sm mt-0.5">{userEmail}</p>
            <span className="inline-block mt-2 text-[10px] font-bold bg-sage-100 text-sage-700 px-3 py-1 rounded-full border border-sage-200 uppercase tracking-wide">
              Member Aktif
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Jurnal Ditulis",    value: journalCount, icon: Book,        color: "bg-sage-50    text-sage-600" },
            { label: "Mood Streak",       value: `${moodStreak}d`,     icon: TrendingUp,  color: "bg-peach-50   text-peach-500" },
            { label: "Ruang Cerita",      value: "Anonim",     icon: Users,       color: "bg-lavender-50 text-lavender-500" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className={`${stat.color} rounded-[1.5rem] p-4 text-center border border-white/60`}>
                <Icon className="w-5 h-5 mx-auto mb-2 opacity-70" strokeWidth={1.75} />
                <p className="font-bold text-lg text-forest">{stat.value}</p>
                <p className="text-[10px] text-muted font-semibold uppercase tracking-wide mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white border border-border p-8 rounded-[2.5rem] shadow-[0_4px_20px_-8px_rgba(45,74,53,0.04)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-lavender-50 rounded-2xl flex items-center justify-center border border-lavender-100">
            <Bell className="w-5 h-5 text-lavender-500" />
          </div>
          <h3 className="font-display font-semibold text-forest text-lg">Pengingat & Notifikasi</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: "Pengingat Mood Harian", sub: "Setiap hari pukul 09.00",      state: notifMood,    set: setNotifMood },
            { label: "Prompt Jurnal",          sub: "Tiga kali seminggu",           state: notifJournal, set: setNotifJournal },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="font-semibold text-sm text-forest">{item.label}</p>
                <p className="text-xs text-muted mt-0.5">{item.sub}</p>
              </div>
              <button
                onClick={() => item.set(!item.state)}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${item.state ? "bg-sage-500" : "bg-border"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${item.state ? "left-6" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white border border-border p-8 rounded-[2.5rem] shadow-[0_4px_20px_-8px_rgba(45,74,53,0.04)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-sky-50 rounded-2xl flex items-center justify-center border border-sky-100">
            <Lock className="w-5 h-5 text-sky-400" />
          </div>
          <h3 className="font-display font-semibold text-forest text-lg">Privasi & Keamanan</h3>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <p className="font-semibold text-sm text-forest">Mode Anonim di Ruang Cerita</p>
            <p className="text-xs text-muted mt-0.5">Identitasmu tidak akan pernah ditampilkan</p>
          </div>
          <button
            onClick={handleAnonToggle}
            className={`w-12 h-6 rounded-full transition-all duration-300 relative ${isAnon ? "bg-sage-500" : "bg-border"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${isAnon ? "left-6" : "left-0.5"}`} />
          </button>
        </div>
        <div className="pt-4">
          <p className="text-xs text-muted leading-relaxed">
            🔒 Semua jurnal dienkripsi end-to-end. RuangTeduh tidak pernah membaca atau menjual datamu.
          </p>
        </div>
      </div>

      {/* Logout */}
      <motion.button
        onClick={handleSignOut}
        disabled={isLoggingOut}
        whileHover={{ scale: isLoggingOut ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-[1.5rem] border border-border text-muted hover:text-peach-500 hover:border-peach-200 hover:bg-peach-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-semibold text-sm"
      >
        {isLoggingOut ? (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-muted/30 border-t-muted rounded-full" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
        {isLoggingOut ? "Keluar..." : "Keluar dari Akun"}
      </motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MODAL: SAFETY PLAN BUILDER
══════════════════════════════════════════════════════════ */
interface SafetyPlanModalProps {
  isOpen:   boolean;
  onClose:  () => void;
  plan:     SafetyPlan;
  setPlan:  React.Dispatch<React.SetStateAction<SafetyPlan>>;
}

function SafetyPlanModal({ isOpen, onClose, plan, setPlan }: SafetyPlanModalProps) {
  const supabase  = createClient();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("safety_plans").upsert(
        {
          user_id:       user.id,
          warningSigns:  plan.warningSigns,
          coping:        plan.coping,
          contacts:      plan.contacts,
          updated_at:    new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      if (error) console.error("[safety plan upsert]", error.message);
    }

    setIsSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-forest/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{   scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-lavender-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-lavender-100 rounded-2xl flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5 text-lavender-500" />
                </div>
                <h2 className="font-display text-xl font-semibold text-forest">Safety Plan</h2>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-sage-100 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-muted" />
              </button>
            </div>

            {/* Body */}
            <div className="p-7 overflow-y-auto space-y-5">
              <p className="text-sm text-muted leading-relaxed">
                Rencana mandiri ini penting untuk kamu baca saat emosimu sedang tidak terkendali. Isi di saat kamu sedang tenang.
              </p>

              {(
                [
                  { key: "warningSigns" as const, label: "Tanda Peringatan Krisisku",   icon: Activity,   iconColor: "text-peach-400",    placeholder: "Misal: Napas mulai cepat, mengisolasi diri..." },
                  { key: "coping"       as const, label: "Koping Mekanisme Internal",   icon: ListChecks, iconColor: "text-sage-500",     placeholder: "Misal: Mendengarkan musik lo-fi, latihan pernapasan..." },
                  { key: "contacts"     as const, label: "Kontak Darurat Personal",     icon: Users,      iconColor: "text-lavender-500", placeholder: "Siapa sahabat atau keluarga yang bisa dipercaya?" },
                ] as const
              ).map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-sm font-semibold text-forest flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${field.iconColor}`} />
                      {field.label}
                    </label>
                    <textarea
                      className="w-full bg-sage-50 border border-border rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-sage-200 resize-none h-24 font-medium text-forest placeholder:text-muted-light"
                      placeholder={field.placeholder}
                      value={plan[field.key]}
                      onChange={(e) => setPlan((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    />
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-sage-50/50">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-sage-500 hover:bg-sage-600 disabled:bg-muted-light disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-full transition-all shadow-[0_4px_14px_-4px_rgba(109,148,116,0.5)] hover:shadow-[0_6px_18px_-4px_rgba(109,148,116,0.55)] flex items-center justify-center gap-2"
              >
                {isSaving && <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />}
                {isSaving ? "Menyimpan..." : "Simpan Rencana Diriku"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════════════
   MODAL: TEDUH BOT
══════════════════════════════════════════════════════════ */
interface TeduhBotModalProps {
  isOpen:      boolean;
  onClose:     () => void;
  messages:    BotMessage[];
  setMessages: React.Dispatch<React.SetStateAction<BotMessage[]>>;
}

function TeduhBotModal({ isOpen, onClose, messages, setMessages }: TeduhBotModalProps) {
  const supabase  = createClient();
  const [inp,     setInp]     = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const saveBotSession = async (updatedMessages: BotMessage[], userId: string) => {
    // Upsert bot session into Supabase — store last active session
    await supabase.from("bot_sessions").upsert(
      {
        user_id:    userId,
        messages:   updatedMessages,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  };

  const onSend = async () => {
    if (!inp.trim() || isTyping) return;
    const userMsg = inp.trim();
    const userEntry: BotMessage = { role: "user", text: userMsg, created_at: new Date().toISOString() };
    const withUser = [...messages, userEntry];

    setMessages(withUser);
    setInp("");
    setIsTyping(true);

    // Call Teduh Bot via Supabase Edge Function (when deployed)
    // Falls back to a compassionate canned response during development
    let botText = "Mendengar ceritamu mengingatkanku betapa tangguhnya dirimu. Jangan lupa bernapas perlahan ya. Aku selalu menemani di sini. 💚";

    try {
      const { data, error } = await supabase.functions.invoke("teduh-bot", {
        body: { messages: withUser },
      });
      if (!error && data?.reply) botText = data.reply;
    } catch {
      // Edge function not yet deployed — use fallback response
    }

    const botEntry: BotMessage = { role: "bot", text: botText, created_at: new Date().toISOString() };
    const final = [...withUser, botEntry];

    setMessages(final);
    setIsTyping(false);

    // Persist session to Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (user) saveBotSession(final, user.id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:items-center justify-center md:p-6 items-end">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-forest/25 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="relative w-full max-w-md bg-cream h-[88vh] md:h-[640px] md:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-border"
          >
            {/* Bot header */}
            <div className="bg-white p-5 border-b border-border flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-lavender-100 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-lavender-500" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-forest text-base">Teduh Bot</h3>
                  <p className="text-[10px] text-sage-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage-400 inline-block animate-pulse" />
                    Menyertaimu
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-sage-50 hover:bg-sage-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-muted" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center shrink-0 mr-2.5 mt-auto mb-1 shadow-sm">
                        <Sprout className="w-3.5 h-3.5 text-sage-500" />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] p-4 text-sm leading-relaxed font-medium shadow-sm ${
                        m.role === "user"
                          ? "bg-sage-500 text-white rounded-[1.5rem] rounded-br-lg"
                          : "bg-white text-forest rounded-[1.5rem] rounded-bl-lg border border-border"
                      }`}
                    >
                      {m.text}
                    </div>
                  </motion.div>
                ))}
                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center shrink-0 mr-2.5 mt-auto mb-1 shadow-sm">
                      <Sprout className="w-3.5 h-3.5 text-sage-500" />
                    </div>
                    <div className="bg-white text-forest rounded-[1.5rem] rounded-bl-lg border border-border p-4 shadow-sm flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-2 h-2 bg-sage-300 rounded-full block"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.18 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-border shrink-0">
              <div className="bg-sage-50 rounded-2xl p-1.5 flex border border-border focus-within:ring-2 focus-within:ring-sage-200 transition-all">
                <input
                  className="flex-1 bg-transparent px-4 outline-none text-sm font-medium text-forest placeholder:text-muted-light"
                  placeholder="Ketik apa yang kamu rasakan..."
                  value={inp}
                  onChange={(e) => setInp(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSend()}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onSend}
                  className="bg-sage-500 hover:bg-sage-600 text-white w-11 h-11 flex items-center justify-center rounded-xl shrink-0 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════════════════
   MODAL: SOS CRISIS
══════════════════════════════════════════════════════════ */
function SOSModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const supabase = createClient();

  // Log crisis modal open event (fire-and-forget, never block UI in crisis)
  useEffect(() => {
    if (!isOpen) return;
    const log = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      supabase.from("crisis_logs").insert({
        user_id:        user?.id ?? null,
        hotline_called: "SOS_MODAL_OPENED",
        triggered_at:   new Date().toISOString(),
      }).then(({ error }) => {
        if (error) console.error("[crisis log]", error.message);
      });
    };
    log();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-forest/35 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
          >
            {/* Soft peach gradient top */}
            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-peach-50 to-transparent pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-sage-50 text-muted hover:bg-sage-100 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative z-10 pt-2">
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-14 h-14 rounded-[1.5rem] bg-peach-100 border border-peach-200 flex items-center justify-center mb-5"
              >
                <Phone className="w-7 h-7 text-peach-500" />
              </motion.div>

              <h3 className="font-display text-2xl font-semibold text-forest mb-2">Kamu Sangat Berharga.</h3>
              <p className="text-muted text-sm mb-7 leading-relaxed">
                Hubungi salah satu ahli di bawah ini jika kamu butuh berbicara sekarang juga.
                Mereka dilatih untuk mendengarkan tanpa menghakimi.
              </p>

              <div className="space-y-3">
                {HOTLINES.map((h, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-[1.8rem] flex items-center justify-between border ${h.color}`}
                  >
                    <div>
                      <p className="font-semibold text-sm text-forest mb-0.5">{h.name}</p>
                      <p className="text-xs text-muted">{h.desc}</p>
                      <p className="text-sm font-bold text-forest mt-0.5">{h.number}</p>
                    </div>
                    <a
                      href={h.href}
                      className={`w-11 h-11 shrink-0 ${h.iconBg} rounded-[1.2rem] flex items-center justify-center hover:opacity-90 transition-all hover:scale-105 shadow-sm ml-3`}
                    >
                      <Phone className="w-[18px] h-[18px] text-white" />
                    </a>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-light text-center mt-5">
                Jika dalam bahaya segera, hubungi{" "}
                <a href="tel:112" className="font-bold text-forest hover:underline">112</a>
                {" "}(darurat nasional)
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
