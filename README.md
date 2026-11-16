# Executive RP Medical Center — SAHD

Website profil medical service dan fire department untuk komunitas GTA Roleplay Executive RP di Los Santos dan Sandy Shores. Konten website menggunakan bahasa Inggris, dengan halaman khusus kolaborasi Pendulus X SAHD.

## Tech stack

| Teknologi | Penggunaan |
| --- | --- |
| Next.js 16 (App Router) | Routing, rendering, dan production build |
| React 19 | Komponen dan interaksi antarmuka |
| TypeScript 5 | Pemeriksaan tipe |
| Tailwind CSS 4 dan shadcn UI | Antarmuka portal, form, dialog, serta menu |
| CSS | Styling website publik |
| Supabase | Integrasi auth, database PostgreSQL, dan avatar storage |
| Recharts | Analytics surgery |
| Framer Motion 12 | Animasi antarmuka |
| Lucide React | Ikon |
| Google Fonts — DM Sans | Tipografi |
| Node.js dan npm | Runtime pengembangan dan pengelolaan dependensi |

Versi dependensi yang terpasang dikunci dalam `package-lock.json`.

## Menjalankan secara lokal

Gunakan Node.js >= 22.13.0 (disarankan versi LTS yang masih didukung) dan npm.

```sh
npm ci
cp .env.example .env.local  # jika .env.local belum ada
npm run dev -- --port 8766
```

Buka [portal lokal](http://127.0.0.1:8766/login).

```sh
# Memeriksa production build dan tipe TypeScript
npm run build

# Menjalankan hasil production build
npm start
```

Website publik dapat berjalan tanpa konfigurasi database. Portal staf memakai login Discord dan menyediakan mode demo khusus development lokal. Jalankan `npm test` untuk memeriksa aplikasi.

## Environment variables

Gunakan `.env.local` untuk development dan **Vercel → Project Settings → Environment Variables → Production** untuk produksi. URL dan ID di bawah ini khusus proyek SAHD. Nilai dalam `<...>` harus diisi dari layanan terkait. Jangan commit file yang berisi secret.

| Variabel | Development lokal | Vercel Production |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ghillblstwkbkxuoqqkw.supabase.co` | `https://hfcpsevrffbzqskfwnno.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `<publishable key Supabase development>` | `<publishable key Supabase production>` |
| `SAHD_APP_URL` | `http://127.0.0.1:8766` | `https://dashboard-sahd.vercel.app` |
| `GEMINI_API_KEY` | `<Gemini API key untuk development>` | `<Gemini API key untuk production>` |
| `GEMINI_TEXT_MODEL` | `gemini-3.5-flash-lite` | `gemini-3.5-flash-lite` |
| `SUPABASE_SERVICE_ROLE_KEY` | `<service_role key Supabase development>` | `<service_role key Supabase production>` |
| `CRON_SECRET` | Opsional; kosong jika cron tidak diuji | `<secret acak khusus cron>` |
| `DISCORD_MEMBERSHIP_REQUIRED` | `false` untuk demo atau tes tanpa verifikasi server | `false` secara default; `true` untuk mewajibkan verifikasi server |
| `DISCORD_GUILD_ID` | `1329133647852343356` | `1329133647852343356` |
| `DISCORD_VISITOR_ROLE_ID` | `1338835105841676322` | `1338835105841676322` |
| `DISCORD_VERIFICATION_SECRET` | `<secret acak minimal 32 karakter>` jika verifikasi diaktifkan | `<secret acak minimal 32 karakter>` jika verifikasi diaktifkan |
| `VAPID_PUBLIC_KEY` | `<public key dari pasangan VAPID development>` | `<public key dari pasangan VAPID production>` |
| `VAPID_PRIVATE_KEY` | `<private key pasangannya>` | `<private key pasangannya>` |
| `VAPID_SUBJECT` | `https://dashboard-sahd.vercel.app` | `https://dashboard-sahd.vercel.app` |

- **Supabase:** Salin publishable key dan legacy `service_role` dari **Project Settings → API Keys**, dari proyek yang sesuai. `service_role` hanya untuk server dan digunakan antara lain untuk push serta pembersihan lampiran.
- **Gemini:** Ambil key dari Google AI Studio. Tanpa key, Case Assistant tidak dapat menghasilkan atau menerjemahkan hasil.
- **Cron dan verifikasi Discord:** Buat masing-masing secret terpisah dengan `openssl rand -hex 32`. Cron menggunakan `CRON_SECRET` untuk endpoint pembersihan lampiran.
- **Push Announcement:** Buat pasangan VAPID sekali dengan `npx web-push generate-vapid-keys` jika belum ada. Untuk production yang sudah berjalan, gunakan pasangan yang sudah disimpan agar langganan push lama tetap berlaku.
- **Discord OAuth:** Client ID dan Client Secret diisi pada provider **Discord di Supabase**, bukan di `.env.local` atau Vercel. Tambahkan callback frontend yang sesuai di Redirect URLs Supabase: `http://127.0.0.1:8766/auth/callback`, `https://dashboard-sahd.vercel.app/auth/callback`, dan `https://dashboard-sahd.clarishna.my.id/auth/callback` pada proyek masing-masing.
- `NODE_ENV`, `VERCEL`, dan `VERCEL_ENV` ditetapkan oleh Next.js atau Vercel. Setelah mengubah konfigurasi, restart server lokal atau redeploy di Vercel.

## Halaman dan fitur

- `/` — Beranda, fasilitas, layanan, spesialisasi medis, dan peta lokasi.
- `/medical-service` — Struktur organisasi medis dan manajemen, layanan, serta seragam.
- `/fire-department` — Struktur organisasi, layanan penyelamatan, seragam, dan armada.
- `/pendulus-x-sahd` — Profil kolaborasi balap, anggota tim, driver, dan team principal.
- Gallery di footer setiap halaman — 35 foto, thumbnail ringan, navigasi sebelumnya/berikutnya, tombol panah keyboard, serta Escape untuk menutup.
- Navigasi responsif, tema setiap divisi, dan peta yang dapat diperbesar.

## Upload template report

Gunakan file PDF berbasis teks, DOCX, atau TXT pada dialog **Upload Template**. PDF dan DOCX maksimal 4 MB; TXT maksimal 64 KB. PDF dibatasi 50 halaman, dan hasil ekstraksi dibatasi 64.000 karakter. Isi file dibaca di browser sebagai teks: placeholder seperti `{{Title}}` tetap bisa dipakai, tetapi gambar, gaya dokumen, dan PDF hasil scan tidak diimpor.

## 3D Anatomy

Menu **3D Anatomy** di `/anatomy` tersedia untuk semua anggota portal. Viewer [Human Atlas](https://github.com/ashemag/human-atlas) disertakan sebagai build statis di `public/human-atlas/`, bersumber dari commit `1c38bf35c254a891200d3cedecfd57abebe83d8d`. Model dimuat saat halaman atlas dibuka. Pilihan Female menggunakan model pembelajaran eksperimental dari [Anatolume](https://github.com/isunky/Anatolume), commit c4a9b04a40b0a77f56b534631f25931d98e15823, dengan atribusi BodyParts3D dan HRA di viewer.

Panel **Browse** memakai wilayah tubuh dan area belajar dari [Human Atlas Enhanced](https://github.com/PrejudiceNeutrino/human-atlas-enhanced), commit `fb3ca0f3950dafce4d262c3a0404959753796791`. Hanya ID struktur yang tersedia di masing-masing model yang ditampilkan. Viewer juga mengadaptasi pemutaran Explode bertahap dari repositori yang sama, serta menyediakan Random Anatomy, pengaturan tampilan, dan pemulihan struktur tersembunyi satu per satu. Untuk membangun ulang metadata, jalankan `python3 scripts/build-anatomy-discovery.py /path/to/human-atlas-enhanced/public public/human-atlas/models`.

Tab **Learn** dan **Study Tools** mengadaptasi materi berbahasa Inggris dari commit Enhanced yang sama, untuk sistem pencernaan, pernapasan, dan limfoid. Bangun ulang data dengan `python3 scripts/build-anatomy-learning.py /path/to/human-atlas-enhanced public/human-atlas/learn`.

Untuk memperbarui build, terapkan `scripts/patches/human-atlas-portal.patch` pada source Human Atlas dan jalankan `npm run build -- --base=/human-atlas/`. Salin HTML dan aset hasil build; pertahankan manifest, model, dan atribusi yang sudah tersedia di `public/human-atlas/`. URL chunk di kedua manifest menggunakan awalan `/human-atlas/models/`. Lisensi kode MIT dan atribusi BodyParts3D 4.0 (CC BY 4.0) tersedia di viewer. Atlas ditujukan untuk pembelajaran.

## Struktur proyek

```text
app/
  layout.tsx                 Metadata, favicon, dan layout utama
  page.tsx                   Beranda
  globals.css                Styling dan layout responsif
  site-chrome.tsx             Navigasi dan footer bersama
  division-page.tsx           Tampilan divisi
  medical-data.ts            Data fasilitas dan spesialisasi
  medical-organization.tsx    Organisasi medis
  fire-organization.tsx       Organisasi pemadam
  location-map.tsx            Peta lokasi
  gallery.tsx                 Viewer galeri
  gallery-photos.json         Daftar foto galeri yang ditambahkan
  medical-service/            Halaman Medical Service
  fire-department/            Halaman Fire Department
  pendulus-x-sahd/             Halaman tim balap
public/
  gallery/                    Foto asli dan thumbnail galeri
  facilities/                 Foto referensi fasilitas
  outfits/                    Gambar seragam
  vehicles/                   Gambar armada
  racing/                     Foto dan portrait tim balap
```

Untuk menambah foto, simpan foto dan thumbnail di `public/gallery/`, kemudian tambahkan `src` dan deskripsi `alt` pada `app/gallery-photos.json`. Thumbnail memakai nama file foto dengan akhiran `-thumb.webp`. Logo navbar dan favicon sama-sama memakai `public/sahd-logo.webp`.

## Aset dan atribusi

Logo, screenshot permainan, serta foto tim disediakan untuk proyek ini. Beberapa portrait dan ilustrasi dibuat atau ditingkatkan dengan bantuan AI; catatan prompt tersedia pada folder aset terkait.

- Sumber foto fasilitas: [public/facilities/SOURCES.md](public/facilities/SOURCES.md).
- Referensi peta GTA V: [GTA Base](https://www.gtabase.com/grand-theft-auto-v/map-locations/).
- Tipografi: [Google Fonts](https://fonts.google.com/specimen/DM+Sans).

Lokasi peta merupakan referensi area jalan; pintu masuk spesifik server tidak ditandai. Situs ini merupakan proyek fiksi untuk GTA Roleplay, bukan penyedia layanan medis nyata.

## Lisensi

Kode sumber dilisensikan dengan [MIT License](LICENSE), copyright © 2026 Anton Epson, MD. Lisensi kode tidak memberikan hak tambahan atas merek, logo, screenshot permainan, foto pihak ketiga, atau aset lain yang dimiliki pihak lain. Hak aset tersebut tetap mengikuti pemilik dan lisensi masing-masing.

Announcement dan Trash tersedia di `/announcements` dan `/trash`. Untuk mengaktifkan database, realtime announcement, retensi 30 hari, dan cleanup lampiran, ikuti [panduan konfigurasi](docs/sprint-6.md) serta migration 011–013. Migration belum otomatis dijalankan oleh aplikasi.
