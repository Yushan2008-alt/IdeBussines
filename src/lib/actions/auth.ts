"use server";

/**
 * RuangTeduh — Auth Server Actions
 *
 * All mutations go through Server Actions so credentials never
 * pass through client-side JS bundle.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/* ─── Sign In with Email/Password ─────────────────────── */
export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/* ─── Sign Up ─────────────────────────────────────────── */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  goals: string[]
) {
  const supabase = await createClient();

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback?next=/dashboard`,
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return { error: "Gagal membuat akun. Silakan coba lagi." };
  }

  // 2. Insert user profile row into public.users
  const { error: profileError } = await supabase.from("users").insert({
    id:               userId,
    full_name:        fullName,
    avatar_url:       null,
    role:             "user",
    is_anonymous:     true,
    joined_at:        new Date().toISOString(),
    onboarding_goals: goals,   // jsonb column
  });

  if (profileError) {
    // Auth user was created but profile insert failed — log and continue
    // (profile can be created again on next login via trigger or UI)
    console.error("[signUp] profile insert error:", profileError.message);
  }

  return { success: true };
}

/* ─── Sign Out ────────────────────────────────────────── */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/* ─── Get Current User (safe for Server Components) ───── */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

/* ─── Get User Profile from public.users ──────────────── */
export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

/* ─── Update Anonymity Setting ────────────────────────── */
export async function updateAnonymousSetting(userId: string, isAnonymous: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ is_anonymous: isAnonymous })
    .eq("id", userId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard");
  return { success: true };
}
