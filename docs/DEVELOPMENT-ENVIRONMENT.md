# Development environment

Created 10 October 2026.

- Development Supabase project: `dashboard-sahd-development` (`ghillblstwkbkxuoqqkw`).
- Production Supabase project: `hfcpsevrffbzqskfwnno`.
- Migrations 001–032 applied together transactionally through SQL Editor. Supabase CLI migration history has not been initialized; baseline/repair history before using CLI db push. Do not rerun 001 against this project.
- No production accounts, operational rows or storage objects copied.
- Local `.env.local` now uses development URL, anon key and service role key.
- Previous local configuration preserved in ignored `.env.production.backup.local`. Both files contain secrets; do not commit them.
- Vercel Production and Preview variables have not been changed. Preview remains production-connected until explicitly configured separately.
- Development Site URL: `http://127.0.0.1:8766`.
- Allowed auth redirect: `http://127.0.0.1:8766/auth/callback`.

## Discord login status

Discord provider enabled and verified through Auth settings on 10 October 2026. Authorization endpoint returns a Discord redirect with the development Supabase callback. User confirmed OAuth credentials and redirect configuration. Full interactive login still requires the user to authorize Discord. Enter credentials directly in the dashboard, never chat.

Add this callback to the Discord application's OAuth2 Redirects, preserving the production callback:

`https://ghillblstwkbkxuoqqkw.supabase.co/auth/v1/callback`

Development accounts are separate and start as members/trainees. After first login, grant intended testing access only in the development project.

Restart local development server after environment changes. Verify Discord login before testing protected pages. Gemini and VAPID configuration remain from the prior local environment; they are not copied from the production database.
