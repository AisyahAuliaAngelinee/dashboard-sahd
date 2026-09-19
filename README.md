# Executive RP Medical Center — SAHD

Website profil medical service dan fire department untuk komunitas GTA Roleplay Executive RP di Los Santos dan Sandy Shores. Konten website menggunakan bahasa Inggris, dengan halaman khusus kolaborasi Pendulus X SAHD.

## Tech stack

| Teknologi | Penggunaan |
| --- | --- |
| Next.js 16 (App Router) | Routing, rendering, dan production build |
| React 19 | Komponen dan interaksi antarmuka |
| TypeScript 5 | Pemeriksaan tipe |
| CSS | Layout responsif, tema divisi, dan styling |
| Framer Motion 12 | Animasi antarmuka |
| Lucide React | Ikon |
| Google Fonts — DM Sans | Tipografi |
| Node.js dan npm | Runtime pengembangan dan pengelolaan dependensi |

Versi dependensi yang terpasang dikunci dalam `package-lock.json`.

## Menjalankan secara lokal

Gunakan Node.js >= 20.9.0 (disarankan versi LTS yang masih didukung) dan npm.

```sh
npm ci
npm run dev
```

Buka [localhost:3000](http://localhost:3000).

```sh
# Memeriksa production build dan tipe TypeScript
npm run build

# Menjalankan hasil production build
npm start
```

Website ini frontend-only: tidak membutuhkan database, API key, atau file `.env`. Tidak ada sistem login maupun penyimpanan data pengguna. Font Google membutuhkan koneksi internet.

## Halaman dan fitur

- `/` — Beranda, fasilitas, layanan, spesialisasi medis, dan peta lokasi.
- `/medical-service` — Struktur organisasi medis dan manajemen, layanan, serta seragam.
- `/fire-department` — Struktur organisasi, layanan penyelamatan, seragam, dan armada.
- `/pendulus-x-sahd` — Profil kolaborasi balap, anggota tim, driver, dan team principal.
- Gallery di footer setiap halaman — 35 foto, thumbnail ringan, navigasi sebelumnya/berikutnya, tombol panah keyboard, serta Escape untuk menutup.
- Navigasi responsif, tema setiap divisi, dan peta yang dapat diperbesar.

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
