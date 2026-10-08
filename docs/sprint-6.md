# Announcement & Trash

## Delivered
- Announcement list, search, All time/Day/Week/Month/Year/Date range filters, multi-select and temporary delete.
- Title required, subtitle and content optional. Free open-source Tiptap editor: font, size, color, bold, italic, underline, lists, alignment, table insertion and row/column insertion, divider, undo/redo. Content after a table can be used as the footer.
- Published announcements notify all registered profiles exactly once. Editing and restoring do not resend. Clicking the notification opens the detail; dashboard shows the latest active announcement.
- Any signed-in member can publish. Only the creator or Admin can edit/delete an announcement.
- Trash combines medical reports, patient consents, consultations and announcements. Members see their own items; Admin sees all. Single/bulk restore and permanent delete require a confirmation dialog.
- Restore retains the original record ID, date, consultation status and consent share token. Done consultations remain Done. Records are no longer restorable after exactly 30 days.

## Enable in Supabase
Run these files in SQL Editor **in order**, after migrations 001–010:
1. `supabase/migrations/011_announcements_and_trash.sql`
2. `supabase/migrations/012_trash_retention_schedule.sql`
3. `supabase/migrations/013_trash_storage_cleanup.sql`

If 012 reports pg_cron unavailable, enable **Cron / pg_cron** in Supabase Integrations/Database Extensions and run 012 again. The named job can be rescheduled without creating a duplicate.

Check the job:
```sql
select jobid,jobname,schedule,active
from cron.job where jobname='sahd-purge-expired-trash';
```
The purge runs every 15 minutes; records become non-restorable immediately at the deadline. Existing soft-deleted consents receive a deadline based on their original deletion timestamp.

## Storage cleanup on Vercel
Migration 013 queues attachments when a medical report is permanently deleted. A daily Vercel Cron removes unreferenced queued files through Supabase Storage API. It retains files referenced by another report, including reports still in Trash. Failures keep the queue for retry.

Set these server-only Vercel environment variables, then redeploy:
- `SUPABASE_SERVICE_ROLE_KEY`: the Supabase service_role API key. Never expose it in a NEXT_PUBLIC variable or chat.
- `CRON_SECRET`: a strong random secret (at least 32 characters). Vercel sends this as the Authorization bearer token.

The production cron runs at 00:00 UTC / 07:00 WIB. Rows disappear when deleted/purged; queued storage files are cleaned in the next daily run. Without these variables, database retention still works but files remain queued. Do not manually delete storage.objects metadata.

## Validation
38 unit tests and production build passed. UI demo checked: publish, table content, notification navigation, temporary delete and restore. Migration 011 was exercised against local PostgreSQL (PGlite): fan-out, ownership denial, restore, expiry and purge. Remote Supabase migrations and deployed realtime/Cron must still be applied and checked; no remote database migration was executed by the agent.

## Demo
Local demo data remains separate from Supabase. Its notifications are simulated through local state events; automated retention is a database production feature. Test announcements use the prefix `RP Test`.

Provider setup references: [Supabase Cron](https://supabase.com/docs/guides/cron), [Vercel Cron authorization](https://vercel.com/docs/cron-jobs/manage-cron-jobs).
