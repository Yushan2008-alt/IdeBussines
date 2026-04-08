"use server";

/**
 * RuangTeduh — Journal Entry Server Actions
 * Table: public.journal_entries
 * RLS: rows visible only to owner (user_id = auth.uid())
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MoodId, JournalEntryDisplay } from "@/types/supabase";

/* ─── Helpers ──────────────────────────────────────────── */
function formatDisplayDate(isoString: string): string {
  const date  = new Date(isoString);
  const now   = new Date();
  const diff  = now.getTime() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins < 2)       return "Baru saja";
  if (mins < 60)      return `${mins} menit lalu`;
  if (hours < 24)     return `Hari Ini, ${date.getHours().toString().padStart(2,"0")}:${date.getMinutes().toString().padStart(2,"0")}`;
  if (days === 1)     return "Kemarin";
  if (days < 7)       return `${days} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long" });
}

/* ─── Insert new journal entry ─────────────────────────── */
export async function insertJournalEntry(
  text: string,
  moodId?: MoodId | null
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Kamu harus login untuk menyimpan jurnal." };
  if (!text.trim()) return { error: "Jurnal tidak boleh kosong." };

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id:      user.id,
      text:         text.trim(),
      mood_id:      moodId ?? null,
      is_encrypted: false,        // set true when Supabase Vault is configured
      created_at:   new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");

  const entry: JournalEntryDisplay = {
    ...data,
    displayDate: formatDisplayDate(data.created_at),
  };
  return { data: entry, error: null };
}

/* ─── Get journal entries for the current user ─────────── */
export async function getJournalEntries(limit = 50): Promise<{
  data: JournalEntryDisplay[];
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: [], error: "Tidak terautentikasi." };

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { data: [], error: error.message };

  const enriched: JournalEntryDisplay[] = (data ?? []).map((row) => ({
    ...row,
    displayDate: formatDisplayDate(row.created_at),
  }));

  return { data: enriched, error: null };
}

/* ─── Delete a journal entry ───────────────────────────── */
export async function deleteJournalEntry(entryId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Tidak terautentikasi." };

  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);   // RLS double-check

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}
