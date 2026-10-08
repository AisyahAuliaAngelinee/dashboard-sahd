> Format Announcement terbaru: [ANNOUNCEMENT.md](ANNOUNCEMENT.md). Title mandatory, subtitle optional, body rich text dengan font toolbar dan insert table; menggantikan form judul/isi sederhana.

# Sprint 6 — Announcement dan Trash
Tanggal: 8 Oktober 2026. Revisi ini menggantikan batasan Trash pada sprint sebelumnya.

## Announcement
| Elemen | Perilaku |
|---|---|
| Halaman utama | Tabel judul, penulis, tanggal dibuat, status draft/published, aksi; terbaru terlebih dahulu |
| Filter | All time, day, week, month, year, date range; berdasarkan created_at, zona Asia/Jakarta; range inklusif hari akhir |
| Create new | Form judul dan isi; simpan draft atau publish |
| Seleksi | Checkbox per baris dan header untuk halaman aktif; jumlah terpilih terlihat |
| Aksi baris | Edit dan delete temporary sesuai izin |
| Notifikasi | Saat publish berhasil, buat notifikasi untuk seluruh user terdaftar, termasuk penulis; klik membuka detail announcement |
| Homepage | Announcement terbaru berdasarkan published_at yang published dan tidak terhapus |

Draft tidak melakukan broadcast. Edit announcement published tidak mengirim ulang; publish pertama menghasilkan event unik. Broadcast memakai outbox persisten, retry idempotent, serta unique(event_id, recipient_id). Pengguna offline menerima inbox saat login. Realtime memperbarui inbox pengguna online sesudah transaksi tersimpan; toggle notifikasi mengikuti pengaturan pengguna dan tidak menghilangkan histori inbox. Announcement masuk filter All, bukan Mentioned atau Janji Temu.

Usulan izin: seluruh anggota membaca announcement published; admin/publisher membuat dan mengubah. Hak publisher diberikan admin, bukan otomatis dari register. Penerima ditentukan sebagai snapshot seluruh user terdaftar saat publish; user baru dapat membaca arsip announcement tanpa notifikasi historis.

## Trash
| Elemen | Perilaku |
|---|---|
| Isi tabel | Seluruh jenis data yang dihapus sementara dan boleh diakses user: MS/FD report, consent, consultation, announcement |
| Kolom | Checkbox, nama/judul, jenis data, dihapus oleh, deleted_at, purge_after, aksi |
| Seleksi | Per baris atau select all halaman aktif; label jumlah terpilih |
| Bulk | Restore atau delete permanently; wajib popup konfirmasi |
| Aksi baris | Restore atau delete permanently; wajib popup konfirmasi yang sama |
| Popup restore | “Apakah kamu yakin ingin memulihkan N data?”; Cancel / Ya, pulihkan |
| Popup delete | “Apakah kamu yakin ingin menghapus N data secara permanen? Data tidak dapat dipulihkan.”; Cancel / Hapus permanen |
| Retensi | purge_after = deleted_at + 30 hari; scheduler server menjalankan purge pada/selepas tenggat, bukan timer browser |

Klik Cancel tidak memutasi data. Tombol konfirmasi disabled selama request; server memeriksa kembali izin, status dan versi setiap item. Bulk menampilkan hasil sukses/gagal per item, hanya item sukses dikeluarkan dari pilihan. Seleksi direset saat filter/halaman berubah. Select all berarti halaman aktif; penghapusan seluruh hasil filter tidak terjadi diam-diam.

Restore mengembalikan record ke modul asal tanpa broadcast ulang. Consent/report yang saling terkait mempertahankan ID dan versi saat soft delete; tautan dokumen terhapus menampilkan status unavailable. Purge dependency-aware: hubungan aktif diperiksa sebelum hard delete; histori audit minimal tidak memuat isi dokumen yang dipurge. Share token consent dinonaktifkan saat soft delete dan tidak otomatis aktif kembali saat restore. Announcement yang dihapus tidak tampil pada homepage; notifikasi lama tetap ada dengan target unavailable. Data terhapus tidak dihitung dalam analytics.

## Acceptance criteria
1. Publish satu announcement menghasilkan tepat satu notification per user penerima, termasuk ketika retry terjadi.
2. Semua enam filter benar pada batas hari WIB; range tidak valid ditolak.
3. Header checkbox memiliki keadaan unchecked/checked/indeterminate dan tidak memilih halaman lain.
4. Cancel pada popup row maupun bulk menjaga data; konfirmasi menjalankan aksi sesuai daftar dan izin.
5. Restore mempertahankan ID serta tidak membroadcast ulang; purge hanya memproses item eligible.
6. Pengguna tanpa izin tidak dapat membuka, restore atau purge melalui request langsung.

## Implementasi 9 Oktober 2026
Lihat [catatan implementasi dan setup](../sprint-6.md). Title wajib; subtitle dan body opsional sesuai format pengguna. Implementasi saat ini menggunakan publish langsung; seluruh anggota login dapat membuat, pemilik/Admin dapat mengubah dan menghapus. Broadcast tersimpan atomik melalui trigger database ketika insert published, tanpa broadcast ulang saat edit/restore. Draft dan role publisher terpisah masih merupakan usulan, bukan syarat yang ditetapkan pengguna. Bulk Trash berjalan atomik: jika satu item tidak valid, seluruh operasi dibatalkan agar tidak ada penghapusan parsial. Modul FD belum memiliki penyimpanan report sehingga belum memiliki data Trash; seluruh modul yang sudah menyimpan data dicakup. Migration 011–013 dan environment Vercel perlu diaktifkan untuk penggunaan live.
