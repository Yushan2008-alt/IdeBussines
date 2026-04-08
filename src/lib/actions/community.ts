"use server";

/**
 * RuangTeduh — Community Post Server Actions
 * Tables: public.community_posts · public.community_likes
 * Posts are anonymous by default (user_id = null in public view).
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CommunityPostDisplay } from "@/types/supabase";

/* ─── Helpers ──────────────────────────────────────────── */
function formatTime(isoString: string): string {
  const diff  = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins < 2)   return "Baru saja";
  if (mins < 60)  return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days === 1) return "Kemarin";
  return `${days} hari lalu`;
}

/* ─── Get community posts (with like state for current user) */
export async function getCommunityPosts(limit = 30): Promise<{
  data: CommunityPostDisplay[];
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch posts (anyone can read, RLS allows public access)
  const { data: posts, error: postsError } = await supabase
    .from("community_posts")
    .select("*")
    .eq("is_flagged", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (postsError) return { data: [], error: postsError.message };

  // Fetch the current user's likes so we can set hasLiked
  let likedPostIds: Set<string> = new Set();
  if (user) {
    const { data: likes } = await supabase
      .from("community_likes")
      .select("post_id")
      .eq("user_id", user.id);
    likedPostIds = new Set((likes ?? []).map((l) => l.post_id));
  }

  const enriched: CommunityPostDisplay[] = (posts ?? []).map((post) => ({
    ...post,
    hasLiked: likedPostIds.has(post.id),
    time:     formatTime(post.created_at),
  }));

  return { data: enriched, error: null };
}

/* ─── Insert anonymous community post ─────────────────── */
export async function insertCommunityPost(text: string) {
  const supabase = await createClient();

  if (!text.trim()) return { error: "Cerita tidak boleh kosong." };

  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id:     null,          // fully anonymous in Ruang Cerita
      text:        text.trim(),
      likes_count: 0,
      is_flagged:  false,
      created_at:  new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");

  const post: CommunityPostDisplay = {
    ...data,
    hasLiked: false,
    time:     "Baru saja",
  };
  return { data: post, error: null };
}

/* ─── Toggle like (upsert / delete) ───────────────────── */
export async function toggleCommunityLike(postId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Kamu harus login untuk memberi suka." };

  // Check if already liked
  const { data: existing } = await supabase
    .from("community_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    // Unlike: delete the like row + decrement counter
    await supabase
      .from("community_likes")
      .delete()
      .eq("id", existing.id);

    await supabase.rpc("decrement_likes", { post_id: postId });
    return { liked: false };
  } else {
    // Like: insert row + increment counter
    await supabase.from("community_likes").insert({
      post_id:    postId,
      user_id:    user.id,
      created_at: new Date().toISOString(),
    });

    await supabase.rpc("increment_likes", { post_id: postId });
    return { liked: true };
  }
}
