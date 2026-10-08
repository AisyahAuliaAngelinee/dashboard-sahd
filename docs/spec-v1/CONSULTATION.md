# Consultation — format v1
Sumber format diberikan pengguna. [Template asli](consultation-template.txt) dan [model field](consultation-schema.json) menjadi referensi Sprint 5.

| Urutan | Label sumber | Input / perilaku |
|---|---|---|
| 1 | Name | Nama pasien, teks |
| 2 | Date of Birth | Tanggal lahir, date-only |
| 3 | Date | Tanggal consultation/janji temu; date-only mengikuti format |
| 4 | Contact Number | Nomor kontak berupa teks, menjaga leading zero |
| 5 | Job | Pekerjaan pasien |
| 6 | keluhan | Teks multiline, editable |
| 7 | Medical Notes | Catatan multiline, editable |
| 8 | craeated by | Nama akun yang sedang login, read-only, ditentukan sesi server |
| 9 | tag mention | Pilihan target mention; komentar pada sumber bukan isi catatan pasien |

Label “craeated by” dipertahankan pada template asli. UI menampilkan “Created by” agar jelas, tanpa mengubah sumber arsip. Author disimpan sebagai created_by_user_id beserta snapshot display_name; edit oleh user lain tidak mengganti pembuat awal, melainkan mencatat updated_by terpisah. Logout/pergantian sesi tidak mengubah author dokumen tersimpan. User tidak dapat menyamar sebagai pembuat melalui payload browser.

## Date dan kelengkapan
Date diinterpretasikan sebagai tanggal consultation/janji temu, bukan created_at sistem. Format tidak menyebut jam sehingga tidak menambahkan field waktu wajib; reminder berdasar jam menunggu penambahan format. DOB/date ditampilkan DD/MM/YYYY, disimpan date-only; created_at/updated_at disimpan UTC dengan tampilan WIB. Filter tabel tetap berdasarkan created_at sebagaimana Sprint 5; tanggal appointment ditampilkan terpisah. Tidak mengarang tanggal, keluhan atau catatan medis dari identitas pasien.

Pengguna belum memberi tanda field wajib. Draft boleh belum lengkap; kebijakan submit final diatur eksplisit kemudian. Created by selalu wajib dari sesi server. Mention boleh kosong karena janji temu tanpa mention tetap didukung. Save draft tidak mengirim notifikasi; “Simpan & kirim” menyimpan consultation dan event notifikasi dalam transaksi sebelum mengirim realtime.

## Mention dan notifikasi
Picker mendukung divisi Medical Service/Fire Department, jabatan, functional role (dokter umum/spesialis/farmasi), serta user terdaftar. Target divisi/jabatan/role di-resolve terhadap user berizin saat kirim dan disimpan sebagai recipient snapshot. Gabungan target dideduplikasi; satu user tidak mendapat inbox ganda karena ditag melalui user dan role sekaligus.

Consultation masuk filter Janji Temu dan All untuk penerima sesuai izin/berlangganan modul; penerima mention juga mendapat is_mentioned=true sehingga muncul di Mentioned. Janji temu tanpa tag tetap menghasilkan event consultation.created untuk penerima modul yang berhak, bukan broadcast ke semua akun tanpa izin. Aturan audience modul belum ditetapkan; implementasi wajib memakai subscription/izin eksplisit, bukan menebak recipient dari role UI. Announcement tetap memiliki aturan broadcast sendiri.

Klik notifikasi membuka detail consultation terkait, dengan highlight mention jika relevan. Retry tidak membuat notifikasi ganda. Edit draft tidak broadcast; edit dokumen terkirim hanya mengirim mention baru pada user yang baru ditambahkan, mengikuti Sprint 5. Target terhapus atau user nonaktif ditampilkan tidak tersedia dan perlu direview sebelum kirim. Isi Medical Notes tidak dimasukkan seluruhnya ke toast; akses detail diperiksa server.

## UI dan penyimpanan
Form mengikuti urutan sumber. Created by tampil di footer sebagai nama/avatar akun dengan label read-only; mention picker berbentuk chip target dengan search/filter dan remove. Preview detail menampilkan isi form serta nama mention yang diterapkan. Tombol Simpan draft dan Simpan & kirim berbeda, dengan indikator status.

consultations: id, template_version, name, date_of_birth, appointment_date, contact_number, job, complaint, medical_notes, created_by_user_id, author_name_snapshot, updated_by_user_id, status draft/sent, created_at, updated_at, deleted_at, deleted_by, purge_after, row_version. Relasi encounter_id nullable, mention_targets dan mention_recipients mengikuti spesifikasi konsolidasi. Client tidak boleh menulis created_by_user_id, recipients atau role tanpa validasi server. Soft delete/restore/purge mengikuti Sprint 6.

## Acceptance criteria
1. Form/detail memakai seluruh field sumber dengan urutan yang benar; komentar instruksi tidak menjadi isi pasien.
2. Created by berasal dari sesi server, read-only; pembuat awal tidak berubah saat dokumen diedit.
3. Contact Number menjaga leading zero; DOB/date tidak bergeser akibat timezone.
4. Mention kosong didukung; target gabungan menghasilkan penerima unik dengan izin yang benar.
5. Save draft tanpa broadcast; kirim sukses mencatat inbox dan retry idempotent.
6. Notifikasi All/Janji Temu/Mentioned mengikuti kategori dan link membuka consultation yang tepat.
7. Date tidak disamakan dengan created_at; tidak ada field jam wajib yang tidak diminta.

Status: spesifikasi/schema tersedia; form consultation, backend dan realtime belum diimplementasikan.
