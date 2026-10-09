# Production login sessions

Production domain selected by the user: https://dashboard-sahd.vercel.app

## Application behavior
- Google/Discord start OAuth on the current login origin and return to `/auth/callback`.
- `SAHD_APP_URL` sets the canonical production origin. Alternate deployment URLs redirect there before login, keeping the PKCE verifier cookie on the same host.
- Local development keeps its local origin. Vercel Preview ignores the production canonical setting and needs its own approved callback for testing.
- Browser/server/proxy cookies use `/`, SameSite=Lax and Secure on HTTPS/production. No cross-domain cookie sharing.
- Browser sessions persist and refresh automatically. Proxy refreshes cookies on requests and preserves all cookie changes and Supabase cache headers.
- Login and portal are dynamic. Authentication responses prohibit browser and CDN caching.
- Session lifetime is enforced by Supabase, not by an arbitrary browser timer. Logout invalidates the local login; revoked/expired sessions cannot access the portal.

## Vercel Production environment
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` must match the configured Supabase project. These are public configuration, not the service_role secret.
Set `SAHD_APP_URL=https://dashboard-sahd.vercel.app`.
Redeploy after environment changes. Keep production demo disabled.

## Supabase Authentication → URL Configuration
Site URL:
```
https://dashboard-sahd.vercel.app
```
Add exact Redirect URLs, retaining local callbacks:
```
https://dashboard-sahd.vercel.app/auth/callback
https://dashboard-sahd.vercel.app/auth/confirm
https://dashboard-sahd.vercel.app/auth/callback?recovery=1
```
Optional Vercel alias callbacks can be retained, but canonical login starts on the Vercel production domain. Do not use a deployment-specific hash URL as the Site URL.
Google/Discord provider redirect URI remains the Supabase callback:
```
https://hfcpsevrffbzqskfwnno.supabase.co/auth/v1/callback
```

Keep automatic token refresh enabled. Supabase default JWT expiry is suitable; configuring a shorter access-token lifetime does not independently impose a total session timeout. If a fixed total or inactivity limit is desired, configure Auth session controls separately where supported by your Supabase plan.

## Validation
41 automated tests and production build passed. Validate provider login on production, reload, reopen the browser, expiry refresh, logout and callback error. Full live OAuth validation requires access to the Supabase dashboard and completing the provider login with the user's account.

References: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [session refresh/cache headers](https://supabase.com/docs/guides/auth/server-side/advanced-guide).

## Applied configuration — 9 October 2026
Supabase Site URL and Vercel Production SAHD_APP_URL were changed to https://dashboard-sahd.vercel.app. The exact /auth/callback URL was already registered. Existing localhost callbacks were retained. Full provider login must still be tested using the user’s Google/Discord account.
