# Sprint 1 — implementasi dan setup

## Menjalankan
`npm install`, kemudian `npm run dev -- --port 8766`. Buka http://127.0.0.1:8766/login.
Local development menyediakan tombol workspace demo. Data demo terpisah dari akun sungguhan; endpoint data pribadi selalu membutuhkan sesi Supabase terverifikasi. Demo mati pada production kecuali SAHD_ENABLE_DEMO=true disetel secara eksplisit; jangan aktifkan pada deployment operasional.

## Yang sudah dibangun
Navbar/search shortcut ⌘K dan Ctrl+K, filter notification All/Mentioned/Janji Temu, mark read, link objek, account/logout. Sidebar, responsive drawer/focus trap. Dashboard: greeting WIB, announcement published terbaru, line chart 6 periode, minor/major cards, date filter/sort/pagination appointment. General: nama/foto, preferensi notifikasi, role/division read-only, change password untuk akun Register. Members: nama/avatar/role/divisi/provider, search/sort. Admin: assignment role/division dengan validasi server dan audit SQL.

Auth integration: register/verifikasi email, email/password, Google/Discord OAuth PKCE callback, reset password dan logout local session. Kode tersedia; belum diuji dengan proyek/provider sebenarnya. Mode live tidak memakai fixture untuk mengganti query gagal; tampilkan error/empty data.

Menu report, consent, assistant, consultation, announcement, Trash adalah fondasi navigasi. Detail consultation/announcement read-only tersedia sebagai tujuan notification/dashboard. Authoring report/consent/consultation/announcement serta operasi Trash/30-day purge belum dibangun pada tahap ini; mengikuti sprint lanjut. Database migration awal hanya fondasi read operations; belum skema final semua modul.

## Menghubungkan Supabase
1. Buat/pilih proyek Supabase (belum dibuat oleh agent). Salin `.env.example` ke `.env.local`, isi URL dan publishable key. Jangan memakai service-role key di browser.
2. Jalankan `supabase/migrations/001_sprint1.sql` sekali pada database yang dipilih. Migration membuat profiles, direktori, tabel sumber dashboard/notifikasi, RLS dan private avatar bucket; tidak membuat pasien contoh. Review migration sebelum menjalankan pada database berisi data; script awal ini tidak idempotent.
3. Register dan verifikasi akun sendiri. Bootstrap admin pertama lewat SQL tepercaya menggunakan UUID akun terverifikasi. Tidak ada default admin/password atau assignment dari input register.
4. Aktifkan Email + confirm email; konfigurasi pengirim email/SMTP, kebijakan password, rate limits sesuai layanan. Template confirmation email gunakan link `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`. Recovery gunakan type=recovery. Ini mendukung verifikasi lintas browser dengan token_hash; callback PKCE juga tersedia untuk alur satu browser.
5. Aktifkan Google dan Discord di Supabase. Provider OAuth authorized callback adalah `https://<project-ref>.supabase.co/auth/v1/callback` (ambil URL persis dari dashboard Supabase), bukan callback Next langsung. Client ID/secret Google/Discord disimpan dalam provider settings Supabase.
6. Supabase URL Configuration: Site URL domain canonical; redirect allowlist untuk `/auth/callback`, `/auth/callback?recovery=1`, `/auth/confirm`, `/reset-password` pada host testing/production yang dipakai. Ikuti aturan exact URL/wildcard Supabase; gunakan preview stabil saat QA.
7. Supabase memiliki aturan identity linking sendiri. Review perilaku default linking verified email sebelum production karena dokumen ide awal meminta linking eksplisit; implementasi ini belum menambahkan flow manual linking atau menonaktifkan default provider linking.

Referensi: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs), [Google](https://supabase.com/docs/guides/auth/social-login/auth-google), [Discord](https://supabase.com/docs/guides/auth/social-login/auth-discord).

## Vercel dan domain
Stack tetap Next.js + TypeScript + shadcn/ui + Tailwind, Vercel, domain clarishna.my.id. Belum deploy atau mengubah DNS.
Set NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY pada Vercel Production/Preview sesuai proyek. Set SAHD_APP_URL ke origin HTTPS personal yang dipilih, misalnya https://clarishna.my.id (contoh, bukan keputusan hostname). Tambahkan domain pada Vercel dan validasi DNS/HTTPS.
SAHD_APP_URL membuat login/portal pada hostname Vercel mengarah ke canonical host sebelum OAuth. Ini menghindari session cookie lintas vercel.app dan clarishna.my.id. API mutation hanya menerima Origin canonical. Untuk QA dua host independen, jangan set canonical redirect, sesuaikan URL/provider allowlist dan uji sesi terpisah; konfigurasi dual-host production belum tervalidasi.

## Bukti validasi dan batasnya
TypeScript dan production build Next.js 16.4.0 diverifikasi lokal; seluruh 5 tests analytics lulus. Akses dashboard tanpa sesi mengarah ke login, mutation dengan Origin asing ditolak, dan demo cookie/endpoint ditolak pada konfigurasi production default; tests analytics memeriksa WIB day, Monday–Sunday week lintas bulan, range inclusive, unique/finalized procedure, empty zero buckets dan missing month. Browser demo diperiksa: chart Day mengubah angka, Mentioned filter/deep link consultation, ⌘K/search/settings, General save, Members, responsive drawer.
RLS SQL, storage upload asli, register/verifikasi/reset, Google/Discord OAuth dan admin live belum diuji pada database sebenarnya karena environment/project belum tersedia. Realtime transport, toast/bunyi dan scheduler Trash belum aktif; preference tersimpan, bukan bukti realtime delivery.

## Integrasi login — pembaruan
Halaman login sekarang menyediakan login email, register dengan konfirmasi password, show/hide password, forgot password, kirim ulang verifikasi dengan jeda 60 detik, dan pesan callback yang aman. Pengguna yang sudah memiliki sesi diarahkan ke dashboard. Halaman reset memerlukan sesi terverifikasi; setelah berhasil, pengguna keluar dan login dengan password baru. Logout pada tab lain juga mengeluarkan portal. Tombol demo disembunyikan pada production default.

User mengonfirmasi belum memiliki proyek Supabase. Karena itu integrasi eksternal belum aktif. Urutan aktivasi:
1. Buat proyek di https://supabase.com/dashboard pada akun Anda. Simpan password database melalui dashboard/password manager Anda.
2. Ambil Project URL dan publishable key, isi `.env.local` mengikuti `.env.example`. Jangan kirim password database, service-role key, atau OAuth client secret melalui chat.
3. Jalankan migration dan konfigurasi Email sesuai bagian di atas.
4. Google Cloud Console: buat OAuth client Web application, atur consent screen dan test users jika aplikasi masih testing. Authorized redirect URI menggunakan callback Supabase. Masukkan client ID dan secret pada Google provider Supabase.
5. Discord Developer Portal: buat application, tambahkan callback Supabase di OAuth2 Redirects. Masukkan client ID dan secret pada Discord provider Supabase. Tidak membutuhkan bot token.
6. Set URL login testing `http://127.0.0.1:8766`; daftarkan URL callback aplikasi pada Supabase redirect allowlist. Untuk produksi, set Site URL dan SAHD_APP_URL ke `https://clarishna.my.id` bila root domain ini yang dipakai untuk aplikasi.
7. Jalankan `npm run auth:check`, lalu restart development server. Pemeriksaan hanya menampilkan status aktif layanan dan provider, tanpa mencetak key.
8. Uji register/verifikasi, password salah, resend, forgot/reset, Google, Discord, logout, dan refresh dashboard memakai akun pengujian milik Anda. Pastikan user baru berstatus Member tanpa divisi sampai ditetapkan admin. Jalankan pengujian yang sama pada URL Vercel/domain canonical setelah deployment.

Referensi konfigurasi provider: https://supabase.com/docs/guides/auth/social-login/auth-google dan https://supabase.com/docs/guides/auth/social-login/auth-discord.
