# Executive RP — Sprint 4: Patient Consent
Tanggal: 8 Oktober 2026 • Status: spesifikasi implementasi.
Revisi ini menggantikan aturan field opsional pada consent sebelumnya. Format tetap mengikuti screenshot SAHD yang diberikan pengguna; isi Treatment and Services dan susunan dokumen dipertahankan.

## Field dan signature
| Bagian | Field | Aturan |
|---|---|---|
| Patient Information | Full name | Wajib; sumber Patient Signature |
| Patient Information | Date of birth | Wajib; date ISO dalam database, dd/mm/yyyy pada dokumen |
| Patient Information | Gender | Wajib; tidak memilih default tanpa input user |
| Patient Information | Contact person/number | Opsional; label dokumen mengikuti Contact Number pada format referensi |
| Emergency Contact | Full name | Wajib; sumber Witness Signature |
| Emergency Contact | Relationship to patient | Opsional |
| Emergency Contact | Contact person/number | Opsional |
| Patient Signature | Ambil nama pasien | Klik menggunakan Full name Patient Information |
| Medic Signature | Nama dokter | Suggestion nama lengkap user yang login, dapat dipilih atau user mengisi manual |
| Witness Signature | Ambil nama emergency contact | Klik menggunakan Full name Emergency Contact |

Nama dokter bukan selalu author akun: simpan author_user_id, suggested_user_id bila dipilih, dan medic_name_snapshot secara terpisah. Semua signature memiliki font/style sama. Edit nama sumber menghapus signature terkait dan meminta penerapan ulang. Tombol signature nonaktif jika nama kosong. Pembuatan signature tidak menggantikan konfirmasi persetujuan RP; finalisasi mengikuti SOP.

## UI dan alur
Form di kiri, live preview dokumen di kanan; mobile menggunakan susunan vertikal/tab Form–Preview. Metadata tanggal/nomor dibuat sistem; tidak meminta user mengisi bagian tetap. Suggestion Medic Signature berasal dari sesi user terautentikasi; jangan memakai identitas Google/Discord dari parameter browser yang tidak diverifikasi.

Isi field → pilih/isi medic → klik tiga signature → live preview → simpan → ekspor PDF/DOCX atau buat link. Field bertanda * wajib untuk dokumen lengkap. Draft boleh autosave belum lengkap dengan status draft dan daftar field kurang; final/export lengkap memeriksa field dan signature. Endpoint server harus mengulangi validasi, bukan mengandalkan atribut required browser.

## Penyimpanan dan output
| Output | Perilaku |
|---|---|
| Database | Data field, author, signature snapshots, status, template/version dan metadata tersimpan; dapat dibuka/edit kembali sesuai izin |
| Live preview | Perubahan field langsung terlihat; tanpa mengubah teks tetap template |
| Shareable link | Buat link ke snapshot versi tersimpan; pilihan akses internal atau link khusus, kedaluwarsa/revoke sesuai kebijakan; tidak otomatis publik |
| DOCX | File Word editable dengan format/tabel/signature sesuai dokumen; kompatibel Google Docs |
| PDF | Snapshot dokumen yang sama, layout A4 dan signature konsisten |

“Export as link” berarti URL detail consent yang dapat dibagikan, bukan file teks berisi URL. Link hanya dibuat setelah penyimpanan berhasil; jangan menggunakan localhost sebagai share link publik. Sebelum ekspor, simpan perubahan terbaru secara atomik ke versi yang diekspor. Konfirmasi status, versi final immutable dan revisi tetap mengikuti desain sebelumnya.

Logo resmi belum tersedia sebagai aset terpisah; preview teks logo sementara tidak dianggap logo final. Font produksi perlu dikunci agar PDF/DOCX/browser seragam. Penomoran unik SAHD menunggu aturan; jangan menyalin nomor/tanggal contoh screenshot sebagai default.

## Model data dan integrasi
consent_versions.patient_snapshot memiliki full_name/date_of_birth/gender wajib pada versi lengkap, contact optional. emergency_snapshot.full_name wajib pada versi lengkap, relationship/contact optional. consent_parties memiliki role patient/doctor/witness, name_snapshot, source_field, applied_by, applied_at, signature_style_version dan confirmed_at terpisah. consents.author_user_id berasal dari Sprint 1; hubungan encounter/patient_record tetap opsional agar tidak mewajibkan pemilihan record tambahan di luar form.

Backend menerapkan optimistic concurrency saat edit, unique document_number, job export idempotent dan storage privat. consent_share_links menyimpan token hash, consent_version_id, access_mode, expiration dan revoked_at. Revisi, trash, restore dan purge 30 hari mengikuti Sprint 1; trash/void/revoke membatasi akses share/download. Nilai opsional kosong disimpan null, bukan teks “—”; placeholder hanya di preview/output.

## Kriteria penerimaan
1. Full name pasien, DOB, gender dan full name emergency contact wajib; field lainnya yang disebut opsional tidak memblokir.
2. Medic suggestion sesuai user login; manual name tetap didukung tanpa mengubah author.
3. Signature patient/witness mengambil field tepat dan semua gaya identik.
4. Perubahan nama tidak meninggalkan signature lama.
5. Live preview mengikuti format dan teks tetap screenshot; tidak memasukkan fakta contoh.
6. Save/reopen mempertahankan data; error save tidak menampilkan link/export seolah versi terbaru tersimpan.
7. DOCX/PDF/link merujuk versi terbaru tersimpan dan mengikuti izin.
8. Link yang dicabut/kedaluwarsa/di-trash menolak akses; validasi dan otorisasi juga di server.
9. Field panjang, unit tanggal, layout A4, keyboard, mobile dan file ekspor diperiksa.

## Status saat ini
Spesifikasi Sprint 4 lengkap. Preview HTML lokal menambahkan required fields dan suggestion user demo; signature/live preview dan save-load lokal tersedia. Database produksi, ekspor DOCX, PDF server, shareable link publik, serta session-backed suggestion belum dibangun. Print browser tersedia sebagai preview PDF. Figma belum diperbarui untuk scope sprint baru.

## Referensi consent dan logo resmi — revisi terbaru
Format consent mengikuti screenshot yang diberikan ulang oleh pengguna. Logo resmi kini tersedia di assets/sahd-logo-warna.webp dan menggantikan placeholder logo pada preview consent serta branding preview Sprint 6. Logo berwarna yang diberikan menggantikan logo teal pada contoh kop; heading HEALTH DEPARTMENT / STATE OF SAN ANDREAS, tabel, isi lima klausul dan urutan signature dipertahankan. Gunakan rasio asli, object-fit contain, tanpa recolor/crop. Identitas/tanggal/nomor pada screenshot adalah contoh, bukan nilai default pasien baru. Ketiga signature tetap satu gaya sesuai Sprint 4 walaupun contoh screenshot memiliki gaya witness berbeda. Field wajib tetap Sprint 4. Preview lokal diperbarui; file Figma belum disinkronkan karena batas MCP yang telah dilaporkan.
