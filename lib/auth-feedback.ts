/** Stable user-facing messages; never render provider error descriptions from URLs. */
export function authFeedback(code: string | undefined, fallback = 'Permintaan belum berhasil. Silakan coba lagi.') {
  switch (code) {
    case 'invalid_credentials': return 'Email atau password tidak sesuai.';
    case 'email_not_confirmed': return 'Email belum diverifikasi. Kirim ulang tautan verifikasi untuk melanjutkan.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit': return 'Terlalu banyak percobaan. Tunggu beberapa saat sebelum mencoba kembali.';
    case 'weak_password': return 'Password belum memenuhi kebijakan keamanan akun. Gunakan password yang lebih kuat.';
    case 'same_password': return 'Password baru harus berbeda dari password sebelumnya.';
    case 'signup_disabled': return 'Pendaftaran sedang dinonaktifkan. Hubungi admin SAHD.';
    case 'provider_disabled': return 'Metode login ini belum diaktifkan oleh admin.';
    case 'provider_exchange': return 'Supabase gagal menyelesaikan login dengan provider. Admin perlu memeriksa Client ID, Client Secret, dan Auth Logs di Supabase.';
    case 'callback': return 'Login tidak selesai atau tautan sudah kedaluwarsa. Silakan mulai login kembali.';
    case 'confirmation': return 'Tautan verifikasi tidak valid atau sudah digunakan. Anda dapat login atau meminta tautan baru.';
    case 'access_denied': return 'Login dibatalkan. Silakan pilih metode login untuk mencoba kembali.';
    case 'session': return 'Sesi berakhir. Silakan masuk kembali.';
    case 'recovery': return 'Buka tautan reset dari email terlebih dahulu. Anda dapat meminta tautan baru melalui Forgot password.';
    default: return fallback;
  }
}
export function passwordValidation(password: string, confirmation: string) {
  if (password.length < 8) return 'Password minimal 8 karakter.';
  if (password !== confirmation) return 'Konfirmasi password belum sama.';
  return null;
}
