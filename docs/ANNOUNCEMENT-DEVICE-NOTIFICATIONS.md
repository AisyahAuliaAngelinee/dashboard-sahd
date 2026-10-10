# Announcement Device Notifications

Implemented 10 October 2026. Web Push is separate from the existing inbox and in-app notification preferences.

## Setup

1. Apply `supabase/migrations/032_announcement_device_push.sql` once. Applied to the configured Supabase project on 10 October 2026.
2. Configure server environment variables in `.env.local` and Vercel Production:
   - `SUPABASE_SERVICE_ROLE_KEY`: server-only Supabase privileged key.
   - `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`: matching Web Push application keys.
   - `VAPID_SUBJECT`: contact URL, currently `https://dashboard-sahd.vercel.app`.
3. Use the same VAPID pair across deployments. A pair was generated locally; never commit private keys or expose them using `NEXT_PUBLIC_`.
4. Keep `CRON_SECRET` configured in Vercel for the existing daily retry cron. Redeploy after adding production variables; restart the local development server after local environment changes.
5. Sign in with Discord → Account Settings → General → Device Notifications. Enable, then approve the browser notification prompt. This preference saves immediately for that browser/device, independently of Save Changes.
6. Publish a new Announcement from another signed-in browser/device. Verify delivery while the recipient tab is open and after closing it. Click the notification to open announcement detail. Disable the toggle and verify a subsequent announcement is not delivered to that device.

## Behavior and support

- Only newly published announcements enqueue device notifications. Edits, pin/unpin and votes do not send another notification.
- One delivery job per announcement/subscription. Sending is encrypted using Web Push. Device endpoints and keys are stored behind owner-only RLS; queue claiming is restricted to the server's service role.
- Publishing triggers a bounded background dispatcher with Next.js `after()`. Remaining work and failures stay queued. The existing authenticated daily storage-cleanup cron also retries due push jobs. Maximum five attempts; a lease prevents simultaneous dispatchers claiming the same job. Successful jobs are not resent. A crash after external delivery but before recording success may result in retry; a stable notification tag replaces the same announcement notification.
- Expired/revoked subscriptions (HTTP 404/410) are removed. Disabling removes the subscription and its pending jobs. Explicit logout removes the browser's subscription before signing out, so notifications must be enabled again after login. Closing the tab retains the subscription.
- HTTPS is required in production; localhost can be used for development. Browser/OS notification permission, background delivery, power settings, connectivity and Do Not Disturb affect delivery. Delivery is not guaranteed while a browser is force-quit or the device is offline.
- On iOS/iPadOS 16.4+, add the portal to the Home Screen and enable notifications from the installed web app. The manifest and service worker support installation; no offline cache of private portal pages is added.
- Announcement titles appear on the device notification/lock screen when the user opts in. Notification links require the usual portal sign-in and access checks.

## Validation

- Automated tests cover endpoint allowlisting/SSRF rejection, encryption-key shape and safe notification navigation.
- Production build and existing application tests must pass.
- Database transaction checks publish-once enqueueing, no duplicate jobs after edit/pin, disabled subscription exclusion, worker permissions and claim leasing; all test records are rolled back.
- Actual OS delivery requires an opted-in recipient device; it must be verified separately from build/database checks.
