# Figma — Executive RP

File: https://www.figma.com/design/l6Qrgr8qF2dpHssY7MDM0n

Akun: Vincentius Clarishna (personal).

Rancangan v1: Login, Dashboard Medis, Dashboard FD, Duty Employee, Kunjungan Pasien.
Data contoh untuk review; format dokumen dan SOP final masih menunggu masukan.

Validasi: lima frame 1440 × 960 diperiksa melalui render Figma; font Inter terverifikasi dan tidak ada gambar UI yang diratakan. Metric memakai komponen reusable, tombol memakai instance library. Ini mockup editable, belum prototype interaktif atau aplikasi produksi.

## Revisi v2 — Navbar dan tampilan lebih ringan

Empat layar authenticated kini memakai navbar bersama: logo monogram ER sementara, pencarian, shortcut ⌘K/Ctrl+K, notifikasi unread, avatar, dan dropdown account settings/logout. Sidebar terang, menu aktif pill, kartu rounded dengan shadow lembut, tabel memakai kolom native yang sejajar.

Panel pencarian, notifikasi, menu akun dan pengaturan tersedia sebagai frame editable. Klik navbar dan keyboard shortcuts dipetakan dalam prototype Figma; logout mengarah ke mockup login, bukan autentikasi aplikasi nyata. Escape dipetakan untuk menutup panel. Interaksi baru diperiksa konfigurasinya; belum diuji end-to-end di mode Present.

Pencarian dan notifikasi memakai data contoh. UI v2 Figma menjadi referensi terbaru; HTML/SVG lokal sebelumnya tetap snapshot v1.

## Revisi notifikasi — pending Figma
Filter All / Mentioned / Janji Temu, layout mengikuti screenshot, klik detail report/mention/appointment. Preview tersedia di notifications-preview.html. Kuota Figma MCP Starter habis sebelum mutasi dilakukan; Figma masih panel v2.

## Sprint 1–6 — status 8 Oktober 2026
Akun personal masih terhubung. Pembacaan file kembali ditolak karena Starter MCP tool-call limit; tidak ada pembaruan Figma pada revisi ini. File Figma masih versi v2 di atas.

Handoff terbaru mengikuti SPEC-LATEST.md. Frame yang perlu direvisi: login register/Google/Discord; dashboard line chart enam filter dan kasus consultation; General/Members; MS wizard tiga langkah; Case Assistant; consent editor/list; consultation; announcement list/editor; Trash row/bulk confirmations. Navbar bersama tetap logo/search/notification/avatar. Notification panel menambah All/Mentioned/Janji Temu dan announcement global.

UI memakai sidebar terang, sudut 16–20px, ruang putih, aksen teal, tabel ringan dan badge; tombol destructive merah hanya untuk purge. Table toolbar: enam preset tanggal, range, create; selected toolbar dengan jumlah. Dialog confirm menyebut jenis aksi/jumlah; focus trap, Escape dan cancel, label aksesibel wajib pada implementasi.

Preview lokal interaktif Announcement/Trash: sprint-6-preview.html. Preview ini data demo di browser; bukan layer Figma atau backend. Tidak mengklaim frame pada Figma telah disinkronkan.

## Template MS terbaru
Format operasi sudah tersedia pada MEDICAL-REPORT.md. Frame MS wizard Step 2 perlu 9 kelompok mengikuti template; preview Step 3 mengikuti heading dan divider sumber. Assistant Operation, anesthetic/supportive medications berupa repeater, Follow Up Care mendukung paragraf/poin. Timestamp per section dan panel TTV Before/After terpisah. Consent link berada pada toolbar/relasi report, tidak menyisipkan heading tambahan pada template asli. Figma belum diubah karena batas MCP sebelumnya.

## Referensi consent dan logo resmi — revisi terbaru
Format consent mengikuti screenshot yang diberikan ulang oleh pengguna. Logo resmi kini tersedia di assets/sahd-logo-warna.webp dan menggantikan placeholder logo pada preview consent serta branding preview Sprint 6. Logo berwarna yang diberikan menggantikan logo teal pada contoh kop; heading HEALTH DEPARTMENT / STATE OF SAN ANDREAS, tabel, isi lima klausul dan urutan signature dipertahankan. Gunakan rasio asli, object-fit contain, tanpa recolor/crop. Identitas/tanggal/nomor pada screenshot adalah contoh, bukan nilai default pasien baru. Ketiga signature tetap satu gaya sesuai Sprint 4 walaupun contoh screenshot memiliki gaya witness berbeda. Field wajib tetap Sprint 4. Preview lokal diperbarui; file Figma belum disinkronkan karena batas MCP yang telah dilaporkan.

## Consultation format v1
Frame consultation form/detail mengikuti CONSULTATION.md: Name, Date of Birth, Date, Contact Number, Job, keluhan, Medical Notes, Created by read-only akun aktif, mention picker chips. Date tanpa jam wajib. Draft dan Simpan & kirim terpisah. File Figma belum disinkronkan karena batas penggunaan MCP sebelumnya.

## Announcement format v1
Form create/edit: Title required, Subtitle optional, rich editor dengan font toolbar dan Insert table. Body contoh text → table → footer. Detail readonly merender font/tabel tanpa toolbar; list subtitle opsional di bawah title. Preview HTML Sprint 6 saat ini masih form sederhana dan belum memperagakan rich editor. Figma belum disinkronkan karena batas MCP sebelumnya.
