# Consultation dan integrasi consent

## Aktivasi database
Jalankan `supabase/migrations/008_consultations_and_consent_links.sql` di SQL Editor proyek Supabase setelah migration 001–007. Migration menambahkan field consultation, daftar penerima mention, notifikasi transaksional, integrasi consent/report, dan publikasi Realtime. Jangan menjalankannya dua kali.

## Perilaku
- Report MS step 3 otomatis mencocokkan nama lengkap pasien dengan consent aktif, mengabaikan huruf besar/kecil dan spasi berlebih. Hanya link preview yang ditampilkan; tidak ada pilihan manual, Lepas, atau Create patient consent. Jika beberapa consent cocok, seluruh link ditampilkan dari yang terbaru. Simpan report untuk menyimpan perubahan tautan otomatis.
- Perubahan manual pada preview report dipertahankan saat menambah/melepas tautan consent.
- Consultation: Name, Date, Keluhan wajib; DOB, Contact Number, Job, Medical Notes opsional. Created by mengikuti akun login.
- Mention menerima beberapa member, role, dan divisi sekaligus. Penerima merupakan gabungan unik anggota yang cocok.
- Notifikasi appointment dikirim ke divisi pembuat; penerima mention lintas divisi mendapat notifikasi dan akses membaca consultation tersebut. Keduanya mendapat pembaruan Realtime. Pengaturan toggle notifikasi tidak menghapus inbox.
- Data consultation yang tersimpan masuk ke Dashboard dan pencarian navbar melalui bootstrap.
- Mode demo menyimpan consultation dan consent/report di browser saja; tidak mengirim ke akun nyata lain.

## Verifikasi setelah migration
1. Buat consultation dengan mention akun lain melalui member atau role/divisi.
2. Buka akun penerima: notifikasi masuk tanpa reload; klik mengarah ke detail consultation.
3. Periksa pengguna lain dalam divisi pembuat menerima notifikasi appointment biasa.
4. Isi Patient Name yang sesuai dengan consent aktif, buka step 3, dan pastikan link preview otomatis muncul. Ganti nama pasien dan pastikan consent pasien sebelumnya tidak ikut terbawa.
5. Hapus sementara consent: share link berhenti dapat dibaca; consent tidak muncul dalam pilihan baru.

## Hasil pemeriksaan lokal
28 pengujian otomatis lulus dan production build berhasil. Browser demo berhasil memverifikasi create consultation → notifikasi mention → detail, serta create consent dari draft report → daftar consent → kembali ke report → simpan report. Realtime antar akun dan transaksi SQL belum diuji di proyek live karena migration 008 belum dijalankan.

## Pembaruan tabel dan actions
Jalankan migration `009_consultation_actions.sql` setelah 008 untuk mengaktifkan Done, edit, dan hapus sementara pada akun live. Edit/hapus dibatasi ke pembuat; Done dapat dilakukan pengguna yang memiliki akses membaca consultation. Pilihan hapus massal dibatasi ke baris milik sendiri yang terlihat pada hasil filter. Hapus sementara menetapkan waktu retensi 30 hari; antarmuka restore/purge masuk pengembangan Trash.
Patient Consent menggunakan search dan date range tanpa pilihan periode. Consultation menggunakan search, rentang jadwal, dan status Pending/Done. Legacy Scheduled ditampilkan Pending, Completed ditampilkan Done. Filter memiliki tinggi yang sama. Pengujian browser demo memverifikasi search, Done, edit, select all, dan dialog konfirmasi; mutation live membutuhkan migration 009.

## Status final dan pembatalan
Jalankan migration `010_consultation_canceled.sql` setelah 009. Done tidak dapat diubah kembali ke Pending atau Canceled; trigger database melindungi status final ini. Pending dapat menjadi Canceled dengan keterangan wajib maksimal 2000 karakter. Keterangan tersimpan, dipertahankan saat edit, dan tampil di detail; badge Canceled merah dan filter status menyediakan Canceled. Legacy Cancelled dinormalisasi ke Canceled; keterangan lama yang kosong diberi penanda belum tersedia. Browser demo memverifikasi Done menonaktifkan Done/Canceled, validasi keterangan kosong, serta pembatalan dan tampilan alasan pada detail. 33 tes otomatis dan build berhasil; transaksi live memerlukan migration 010.
