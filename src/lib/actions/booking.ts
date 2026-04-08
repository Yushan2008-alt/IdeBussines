"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DEFAULT_BOOKING_OFFSET_DAYS = 1;

export type BookingActionStatus = "success" | "error" | "info";

export interface BookingActionResult {
  kind: BookingActionStatus;
  message: string;
}

function formatBookingDate(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function bookCounselorSession(counselorId: string): Promise<BookingActionResult> {
  if (!UUID_PATTERN.test(counselorId)) {
    return {
      kind: "info",
      message: "Fitur booking belum tersedia untuk data demo.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      kind: "error",
      message: "Sesi akunmu berakhir. Muat ulang halaman lalu coba lagi.",
    };
  }

  const { data: counselor, error: counselorError } = await supabase
    .from("counselors")
    .select("id, full_name, is_verified, availability_status")
    .eq("id", counselorId)
    .maybeSingle();

  if (counselorError || !counselor) {
    return {
      kind: "error",
      message: "Data konselor tidak ditemukan. Coba pilih konselor lain.",
    };
  }

  if (!counselor.is_verified || counselor.availability_status === "unavailable") {
    return {
      kind: "info",
      message: "Konselor sedang tidak tersedia. Silakan pilih jadwal/konselor lain.",
    };
  }

  const { data: activeBookings, error: activeBookingError } = await supabase
    .from("sessions")
    .select("id, scheduled_at, status")
    .eq("user_id", user.id)
    .eq("counselor_id", counselorId)
    .in("status", ["pending", "confirmed"])
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(1);

  if (activeBookingError) {
    return {
      kind: "error",
      message: "Gagal memeriksa booking aktif. Coba lagi beberapa saat.",
    };
  }

  if ((activeBookings ?? []).length > 0) {
    const nextSession = activeBookings?.[0];
    const nextDate = nextSession ? formatBookingDate(nextSession.scheduled_at) : "";
    return {
      kind: "info",
      message: nextDate
        ? `Kamu sudah punya booking aktif pada ${nextDate}.`
        : "Kamu sudah punya booking aktif untuk konselor ini.",
    };
  }

  const scheduledDate = new Date();
  if (counselor.availability_status === "available_today") {
    scheduledDate.setHours(scheduledDate.getHours() + 2);
  } else {
    scheduledDate.setDate(scheduledDate.getDate() + DEFAULT_BOOKING_OFFSET_DAYS);
  }

  const scheduledAt = scheduledDate.toISOString();
  const { data: insertedSession, error: insertError } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      counselor_id: counselorId,
      scheduled_at: scheduledAt,
      status: "pending",
      notes: null,
    })
    .select("scheduled_at")
    .single();

  if (insertError) {
    return {
      kind: "error",
      message: "Booking gagal dibuat. Coba lagi beberapa saat.",
    };
  }

  const { error: notifError } = await supabase.from("notifications").insert({
    user_id: user.id,
    type: "session_reminder",
    message: `Booking konsultasi dengan ${counselor.full_name} berhasil dibuat.`,
    is_read: false,
    created_at: new Date().toISOString(),
  });
  if (notifError) {
    console.error("[session notification insert]", notifError.message);
  }

  revalidatePath("/dashboard");

  return {
    kind: "success",
    message: `Booking terkirim. Estimasi sesi: ${formatBookingDate(insertedSession.scheduled_at)}.`,
  };
}
