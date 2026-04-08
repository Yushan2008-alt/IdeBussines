const GOOGLE_PROVIDER_DISABLED_MESSAGE =
  "Autentikasi Google belum aktif di konfigurasi Supabase. Aktifkan provider Google terlebih dahulu, lalu coba lagi.";
const GOOGLE_REDIRECT_MISCONFIGURED_MESSAGE =
  "Konfigurasi URL callback Google belum sesuai. Periksa Site URL dan Additional Redirect URLs di Supabase.";

/**
 * Mengubah pesan error mentah dari Supabase OAuth Google menjadi pesan yang lebih jelas untuk pengguna.
 */
export function mapOAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("provider is not enabled") ||
    normalized.includes("unsupported provider")
  ) {
    return GOOGLE_PROVIDER_DISABLED_MESSAGE;
  }

  if (
    normalized.includes("invalid redirect") ||
    normalized.includes("redirect_uri") ||
    normalized.includes("redirect url")
  ) {
    return GOOGLE_REDIRECT_MISCONFIGURED_MESSAGE;
  }

  return message;
}
