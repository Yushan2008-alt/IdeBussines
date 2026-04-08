export function mapGoogleOAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("provider is not enabled") ||
    normalized.includes("unsupported provider")
  ) {
    return "Masuk dengan Google belum aktif di konfigurasi Supabase. Aktifkan provider Google terlebih dulu, lalu coba lagi.";
  }

  if (
    normalized.includes("invalid redirect") ||
    normalized.includes("redirect_uri") ||
    normalized.includes("redirect url")
  ) {
    return "Konfigurasi URL callback Google belum sesuai. Periksa Site URL dan Additional Redirect URLs di Supabase.";
  }

  return message;
}
