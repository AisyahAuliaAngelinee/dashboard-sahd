# Announcement — format v1
Format terbaru pengguna menggantikan form judul/isi sederhana pada Sprint 6.

| Field | Aturan |
|---|---|
| Title | Mandatory; whitespace-only tidak valid |
| Subtitle | Optional; jika kosong tidak menampilkan baris kosong pada detail |
| Body / textarea | Rich text editor dengan pengaturan font seperti Gmail dan menu tabel |

## Editor
Textarea adalah istilah UI pengguna; implementasi memakai rich text editor agar formatting dan tabel dapat disimpan. Toolbar: font family, font size, bold, italic, underline, warna teks, highlight, alignment, bullet/numbered list, indent, link, clear formatting, undo/redo dan Insert table. Font list terkurasi dengan fallback tersedia di preview, detail dan export bila tersedia; jangan menerima script/CSS arbitrary.

Insert table menampilkan pemilih jumlah baris/kolom lalu menyisipkan tabel pada posisi kursor. Menu konteks tabel menyediakan add/remove row, add/remove column, header row, serta delete table. User dapat melanjutkan menulis paragraf setelah tabel; susunan text → table → footer adalah isi berurutan dalam satu editor. Footer bukan field terpisah wajib dan bukan elemen fixed pada layar. Beberapa paragraf/tabel didukung, tanpa memaksa semua announcement memiliki tabel.

Toolbar/menu memiliki label aksesibel, navigasi keyboard dan focus management. Selection tetap dijaga saat membuka menu font/tabel; perintah diterapkan pada selection/cursor editor. Paste rich text dibersihkan; teks dari luar mempertahankan format yang diizinkan tanpa script, event handler, iframe atau URL berbahaya. Undo/redo mencakup edit teks maupun tabel. Format font dan tabel harus tetap sama setelah simpan, reload dan membuka detail notification.

## Save dan publish
Title wajib pada save maupun publish sesuai instruksi. Subtitle optional; body required belum diminta, sehingga tidak menetapkan mandatory baru. Empty body tetap dapat disimpan; app dapat memperlihatkan preview kelengkapan sebelum publish tanpa mengisi teks otomatis. Title dan subtitle berupa plain text. Body memakai canonical editor_document_json terstruktur yang mendukung paragraph, text mark, list, table, row, cell; rendering HTML disanitasi server-side. Plain text snapshot tersedia untuk search/notification ringkas.

Live preview menampilkan title, subtitle bila ada, kemudian rich body; source editor terbaru adalah sumber publish. Form memiliki Simpan draft dan Publish. Publish berhasil mengirim notification kepada seluruh user terdaftar mengikuti outbox/idempotency Sprint 6. Notification menampilkan title dan optional subtitle/snippet singkat, klik ke detail yang merender tabel/font; bukan seluruh HTML raw di toast. Edit published tidak broadcast ulang otomatis.

## Data dan UI
announcements: title NOT NULL, subtitle nullable, editor_document_json, sanitized_html_snapshot, plain_text_snapshot, editor_schema_version, status, created_by, created_at, published_at, row_version dan field soft delete. Body lama content perlu migrasi ke paragraph nodes ketika implementasi, tanpa kehilangan isi. Sanitized HTML adalah hasil render, bukan sumber yang menggantikan editor JSON saat reload.

List table menampilkan title dengan subtitle opsional di bawahnya; date filters, checkbox, create/edit/soft-delete tetap Sprint 6. Dialog/form create menggunakan editor lebar agar tabel dapat diedit dengan nyaman; preview detail responsif memakai table overflow horizontal bila diperlukan. Tampilan read-only tidak menampilkan toolbar. Figma handoff harus menunjukkan state title required error, subtitle kosong/terisi, toolbar font, insert table dan contoh paragraf → tabel → footer.

## Acceptance
- Title kosong/spasi ditolak; subtitle kosong diterima dan tidak menambah baris kosong.
- Font/size/styles diterapkan pada selection dan tetap ada sesudah save/reload.
- Insert table berada di cursor; add/remove rows/columns bekerja dan teks footer tetap dapat ditulis setelah tabel.
- Undo/redo bekerja lintas teks/tabel; copy/paste tidak menyimpan konten executable.
- Preview dan detail menampilkan urutan text/table/footer sesuai editor tanpa kehilangan cell.
- Draft tidak broadcast; publish/notification mengikuti Sprint 6 dan tidak menduplikasi penerima.

Status: spesifikasi dan schema diperbarui; rich text editor produksi belum diimplementasikan. Pilihan library editor ditentukan saat implementasi, tanpa mengganti Next.js/shadcn/Tailwind/Vercel/domain.
