# Sprint 2 — Medical Service report

Implemented: case → structured form → editable rich-text preview, copy, DOCX/PDF export, local demo persistence, protected Supabase report list/create/update, author-only updates. Format includes all supplied sections and WIB timestamps; optional supportive medications are omitted when empty. No case findings or medication doses are invented.

## Activate live persistence
Run `supabase/migrations/002_medical_reports.sql` once in the project's Supabase SQL Editor. Existing Sprint 1 schema must already be installed. The migration adds report RLS, a private radiology bucket and an atomic quota of three image-generation attempts per user per hour. Users need the Medical Service division.

## Manual report workflow
The current implementation uses manual entry and optional uploaded radiology images. OpenAI and Gemini are disabled. See [manual report specification](sprint2-manual.md) for the current three-step flow, editor, upload limits, and export behavior.

Run `005_manual_radiology_uploads.sql` after the existing report migrations to allow PNG/JPEG/WebP uploads. No provider key is required.

## Validation
Production build and 15 tests passed. The manual steps, shared Anamnesis formatting, payment toggle, optional demo upload, and DOCX/PDF generation buttons were checked in the browser. Live Supabase uploads require the migration; exported document layout has not yet been visually inspected.

## Report list revision
Run `003_medical_report_list.sql` after migration 002. Adds title, paid/unpaid, creator name snapshot, deletion timestamp, deleted-by and 30-day retention metadata. Bulk soft delete is transactional, authenticated, and restricted to the report author. No permanent-delete scheduler or Trash restore UI is added here; those belong to Sprint 6.

List includes all six sortable data columns, actions dropdown, row/detail navigation, per-row/select-all selection, search, category/payment filters and inclusive WIB date range. Selection for bulk deletion uses visible author-owned rows. GET returns up to 1,000 active reports. Existing reports default to unpaid and get a title from patient name/case. All 13 tests and production build passed; final TypeScript check passed. Live writes still require migration 003.
