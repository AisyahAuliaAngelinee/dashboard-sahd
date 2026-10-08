# Medical Service — format operasi v1
Format diberikan pengguna pada 8 Oktober 2026. Sumber persis tersimpan pada [medical-report-template.txt](medical-report-template.txt), model field pada [medical-report-schema.json](medical-report-schema.json). Format ini menjadi template report operasi MS Sprint 2 dan mapping Sprint 3. Format FD, consultation dan psychiatry belum diberikan; jangan memakai template operasi seolah template ketiganya.

## Struktur dan form
| Urutan | Bagian | Form |
|---|---|---|
| 1 | Report Created by | Suggestion nama user login, editable; author_user_id audit tetap user yang menyimpan |
| 2 | Patient information | Patien Name, Date of Birth, Contact Person, Age, Gender, Blood Type, Weight, Job / Occupation |
| 3 | Medical Teams & Operation | Head Operation (Surgeron), Assistant Operation list dinamis add/remove |
| 4 | ANAMNESIS | Waktu/tanggal bagian dan narasi anamnesis |
| 5 | DEBRIEF | Waktu/tanggal; Physical Examination dan Radiology Examination terpisah |
| 6 | ANESTHESIA & MEDICATION | Waktu/tanggal; general/local; daftar anesthetic medications; supportive medications optional; narasi Anesthesia |
| 7 | TREATMENT | Waktu/tanggal; Preoperative Preparation, Operative Procedure, Postoperative Management |
| 8 | MONITORING | Waktu/tanggal; Before dan After: BP, HR, RR, Temperature, SpO₂, GCS; Preoperative/Postoperative Status |
| 9 | FOLLOW UP CARE | Waktu/tanggal; isi paragraf atau poin sebanyak yang dibutuhkan; Status |

Label “Patien Name” dan “Surgeron” dipertahankan dalam dokumen sesuai sumber; label UI boleh membantu pemahaman tanpa diam-diam mengganti template ekspor. Komentar //, /** Optional **/ dan add more adalah instruksi form, bukan kalimat yang dimasukkan ke report pasien. Divider dipresentasikan sebagai garis pada preview rich text dan export, dengan urutan bagian sama.

Field wajib finalisasi belum ditandai pada format ini. Draft boleh tidak lengkap; kelengkapan finalisasi perlu kebijakan admin/template yang eksplisit, tidak menerapkan tanda wajib consent ke report. Supportive Medications satu-satunya grup dinyatakan optional oleh sumber; bila kosong omit grup itu. Grup lain tetap ditampilkan; nilai tidak diketahui ditandai “Belum diisi”, tidak dibuat otomatis. List assistant dan medication tidak dibatasi jumlah tetap.

## Aturan nilai dan waktu
- Contact Person disimpan sebagai teks sesuai sumber; makna nomor kontak atau nama kontak belum ditentukan, jangan memaksa format nomor telepon.
- DOB date-only. Age dapat disarankan dari DOB pada tanggal tindakan, user konfirmasi; perubahan DOB/tanggal memunculkan saran baru tanpa menimpa age manual. Kalender RP mengikuti kebijakan server bila berbeda dari tanggal nyata.
- Weight adalah angka; unit tidak disebut pada sumber sehingga unit UI dapat dipilih/dikonfirmasi, bukan disisipkan diam-diam dalam format asli. Blood type/gender tidak diberi pilihan wajib yang tidak diminta.
- BP dua nilai sistolik/diastolik dalam mmHg; HR/RR x/menit; temperature °C; SpO₂ %. Kosong berbeda dari nol. Validasi numerik tidak menganggap nilai simulasi sebagai observasi.
- GCS memakai E 1–4, V 1–5, M 1–6; total dihitung hanya saat seluruh komponen terisi. Aturan ini validasi bentuk template, bukan interpretasi klinis. Nilai template tidak dihasilkan dari asumsi kondisi pasien.
- Enam section timestamp terpisah, bukan satu waktu universal. “Gunakan waktu sekarang” harus aksi user; timestamp UI tampil HH:mm GMT+7 DD/MM/YYYY, disimpan UTC. Section Monitoring memiliki waktu bagian; observed_at Before/After tetap terpisah sebagai metadata bila tersedia.

## Alur report dan Case Assistant
Step 1: deskripsi kasus, kategori minor/major/plastic untuk metadata analytics, pilih/tautkan encounter. Step 2: form dikelompokkan mengikuti sembilan bagian, navigasi anchor, list dinamis, timestamp per bagian, provenance prefill. Step 3: preview editable mengikuti format persis; save, copy, DOCX/PDF menggunakan edit terbaru.

| Data assistant | Target template | Aturan |
|---|---|---|
| Judul kasus | metadata.case_title | Template tidak memiliki judul kasus; jangan tambah heading |
| TTV Before / After | monitoring.before / monitoring.after | Nilai, unit, source, observed_at dan konfirmasi |
| Jenis anestesi | anesthesia.type | general/local setelah user review |
| Rekomendasi anestesi/obat | anesthesia.anesthetic_medications dan explanation | Usulan SOP terpisah dari obat yang telah diberikan |
| Follow-up care | follow_up.content | Paragraf/poin editable; status diisi user |
| Discharge medicine | Belum ada dedicated field | Tampilkan saran terpisah; user dapat memasukkan ke Follow Up Care atau Postoperative Management dengan pilihan eksplisit |
| Persiapan/tindakan/pasca operasi | treatment.* | Hanya usulan sampai tindakan RP dikonfirmasi; jangan menulis seolah telah dilakukan |
| Hasil pemeriksaan | debrief.* | Dari user/temuan RP dikonfirmasi; ilustrasi tidak membuktikan hasil |
| Instrumen dan /me /do | Assistant terpisah | Tidak menambah section pada template |

Consent tersimpan ditautkan ke report sebagai relasi/link UI. Karena format asli tidak memuat Patient Consent, jangan menambahkan baris consent ke isi export tanpa revisi format; tombol “Buka consent” tetap tersedia pada report. Ilustrasi CT/MRI/X-Ray adalah attachment terkait dengan label simulasi; user dapat memilih menyisipkan dalam Radiology Examination jika diizinkan versi template, bukan otomatis menyisipkan gambar ke seluruh report.

## Penyimpanan dan pengujian penerimaan
Report menyimpan template_version, form_data, editor_document_json, plain_text_snapshot dan provenance. Metadata author_id, category, consent link dan imaging asset tidak mengubah teks template. Editor terbaru adalah sumber export; regeneration meminta review perubahan dan menjaga manual edits.

Acceptance: urutan/label sesuai sumber; daftar >3 item tidak terpotong; supportive kosong tidak menghasilkan fake medication; follow-up paragraphs/points keduanya dipertahankan; GCS partial tidak ditotal; timestamp section dapat berbeda; prefill tidak menimpa manual edit; copy tidak menyertakan instruksi template; DOCX/PDF mempertahankan seluruh bagian serta unit dan SpO₂. Export produksi belum diimplementasikan.
