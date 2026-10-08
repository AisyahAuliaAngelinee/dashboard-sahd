# Sprint 2 — Manual medical reports
All report creation is manual. No OpenAI or Gemini calls are made. The old suggestion endpoint returns 410; the radiology endpoint accepts authenticated manual image uploads only. Provider libraries are unused.

Step 1: Case, required title, report category, required Anamnesis. Step 2: patient information, teams, shared Anamnesis, debrief, anesthesia, treatment, monitoring, follow-up. Step 3: editable preview, Paid/Unpaid, optional radiology upload, save/copy/export. Completed steps remain navigable.

Tiptap OSS (MIT) provides bold, italic, underline, strike, lists, heading, quote, undo/redo; no paid extensions or cloud service. Rich content is retained in draft fields and preview. DOCX and PDF export supported text marks and lists. Clipboard is plain text. Radiology attachments are stored separately and not embedded in exports.

Run migration 005_manual_radiology_uploads.sql after the existing report migrations to permit PNG/JPEG/WebP in the private bucket. Upload maximum 4 MB, verified MIME and file signature; files saved in the authenticated user's folder. Demo attachments are browser-local, subject to browser storage capacity. Removing an attachment only detaches it from the draft; it does not purge the stored file.

Form field revision: rich editors are limited to medical narrative sections; patient DOB uses shadcn Calendar/Popover, age is numeric, gender defaults to Men (Woman available), weight is numeric with KG/Gram. Operation team selectors use the existing Members directory and support multiple assistants. Section date/time pickers edit literal GMT+7 wall time without converting through the browser timezone.
