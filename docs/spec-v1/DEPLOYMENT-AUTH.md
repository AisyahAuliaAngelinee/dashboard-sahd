# Deployment dan login — Vercel / clarishna.my.id
Stack tetap Next.js, TypeScript, shadcn/ui, Tailwind CSS, Vercel. Domain personal tetap clarishna.my.id; root atau subdomain final belum dipilih. Login wajib mendukung Google, Discord, serta register email/password.

## Konfigurasi target
| Lingkungan | Host | Konfigurasi |
|---|---|---|
| Local | localhost port development | Callback development sesuai auth engine, database development |
| Production Vercel | <project>.vercel.app | HTTPS, callback terdaftar bila login langsung di host ini didukung |
| Production personal | clarishna.my.id atau subdomain pilihan | Domain dipasang pada project Vercel, DNS diverifikasi, HTTPS aktif; callback exact terdaftar |
| Preview | Host preview stabil untuk QA | Provider/callback testing terpisah; tidak menganggap semua URL preview otomatis diizinkan |

Rekomendasi: satu hostname personal menjadi canonical, URL Vercel mengarahkan ke sana sebelum memulai login. Jika kedua hostname harus melayani login secara mandiri, daftarkan callback keduanya dan pakai allowlist host; sesi cookie masing-masing host terpisah. Hostname callback tidak boleh dibentuk dari input host tanpa validasi. Jalur callback mengikuti engine yang dipilih; jangan menganggap path contoh sebagai konfigurasi final.

## Google dan Discord
Google: buat OAuth web application, consent screen dan authorized redirect URI exact untuk host yang benar; testing account policy diperiksa sebelum go-live. Discord: buat developer application, daftarkan redirect URI, authorization code flow dengan state; scope identify serta email bila email diperlukan. Secret provider hanya server-side.

Simpan database URL, session/auth secret, Google client ID/secret, Discord client ID/secret, storage/email credentials dan canonical app URL sebagai environment variables sesuai engine. Pisahkan Production/Preview/Development pada Vercel, jangan beri prefix NEXT_PUBLIC pada secret, lalu redeploy setelah perubahan environment. Nama environment final bergantung library auth; library/database belum dipilih.

Register bukan hanya form: persist user, hash password dengan library terpelihara, validasi, pembatasan percobaan, verifikasi email dan reset password membutuhkan pengirim email. Google/Discord tidak meminta password lokal; ubah password hanya tampil pada akun credential. Role/divisi berasal dari admin, bukan klaim form register. Akun baru belum memiliki izin dokumen internal sampai assigned. Jangan auto-merge akun hanya karena email sama; gunakan linking dengan autentikasi kedua identitas. Logout invalidasi sesi sesuai engine.

## Acceptance deployment
| Skenario | Bukti lulus yang diperlukan |
|---|---|
| Google / Discord pada canonical domain | Callback sukses, session terbaca saat reload, user tampil Members, logout benar |
| URL Vercel | Redirect canonical sukses, atau login kedua provider dites mandiri bila mode dua host dipilih |
| Register | Validasi, persistence, email verify, login, reset/change password, error duplicate |
| Provider cancel/error | Pesan jelas, tidak membuat account kosong atau sesi palsu |
| Permissions | User baru tidak bisa assign role/divisi sendiri atau mengakses dokumen internal |
| Cookie dan redirect | HTTPS, host allowlist, cookie secure, state valid, external return URL ditolak |
| Preview | Login diuji dengan callback testing terdaftar; credentials production tidak bocor |

Status: panduan siap; belum ada konfigurasi OAuth/DB/env/domain yang diterapkan dan belum ada bukti login produksi. Credential rahasia diisi langsung di provider/Vercel, tidak ditulis dalam dokumen atau chat.

Referensi resmi, diperiksa 8 Oktober 2026:
- Google OAuth web server: https://developers.google.com/identity/protocols/oauth2/web-server
- Discord OAuth2: https://docs.discord.com/developers/topics/oauth2
- Vercel environment variables: https://vercel.com/docs/environment-variables
