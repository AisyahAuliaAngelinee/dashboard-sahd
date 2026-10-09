# Discord membership and deployment isolation

## Discord OAuth login gate

The login request asks for `guilds.members.read`. The server exchanges the Supabase OAuth code, then calls Discord's `GET /users/@me/guilds/{guild.id}/member` with the provider access token. The returned member ID must match the authenticated Discord identity. A matching Visitor role denies access even if other roles are present. Unknown members are denied. Timeouts, expired tokens, missing scopes, incomplete configuration, or invalid responses deny verification rather than grant access.

Set server-only environment variables in both local development and Vercel:

- `DISCORD_MEMBERSHIP_REQUIRED=true` only after configuration and a real login test are ready.
- `DISCORD_GUILD_ID=1329133647852343356`
- `DISCORD_VISITOR_ROLE_ID=1338835105841676322`: Visitor/Patient in SAHD EXE.
- `DISCORD_VERIFICATION_SECRET`: at least 32 random characters; use the same value across instances of this deployment. Do not expose it using NEXT_PUBLIC.

No bot is required. A 24-hour HttpOnly, signed cookie records successful login verification, bound to the Supabase user, guild ID, and Visitor role ID. Every portal server client checks that proof. The proof contains no Discord token and cannot be reused by another account. Role changes are checked on the next OAuth login; this is not continuous Discord membership monitoring. After 24 hours the user must sign in again. Changing the signing secret or role configuration invalidates existing proofs.

This application gate does not replace Supabase Auth or database RLS. Direct Supabase API clients must remain subject to database authorization; do not treat a callback check alone as a guild-based database policy. The Visitor/Patient ID is now configured. Enable the production gate only after the signing secret has been set in Vercel; changing an environment variable requires a new deployment. No Discord roles are automatically mapped to portal administrator privileges.

## Landing page versus portal deployments

Current state: one Next.js application and one Vercel project. A deployment builds a new version before promotion; updating public landing content does not require stopping the active production deployment. An active form can still encounter client/server version changes during promotion. Browser drafts help recover text, and Vercel Skew Protection can keep clients on their original deployment where supported by the account plan.

Two levels of separation are possible:

1. Gallery content without code deployments: store image files and an approved gallery manifest in a public storage bucket or CMS; fetch the manifest with caching and keep the bundled gallery as fallback. Uploading new gallery content then does not deploy either application. The current gallery is still bundled; this is a proposed next change.
2. Fully independent applications: create a public-site Vercel project and a portal Vercel project, with separate build roots/deployment triggers. Keep `dashboard-sahd.vercel.app` as the portal origin and give the public site its own Vercel URL. Use full navigation between origins, keep all authentication callbacks and cookies on the portal, and explicitly update Supabase redirect URLs. One repository is possible, but shared-code changes must trigger both affected builds. Two separately deployed apps are not created merely by adding route groups.

Do not change the current production domain or OAuth callback during the presentation cleanup. Project separation remains a proposal until separate project URLs and routing are chosen.

References: https://docs.discord.com/developers/resources/user#get-current-user-guild-member ; https://vercel.com/docs/skew-protection ; Next.js local guide `node_modules/next/dist/docs/01-app/02-guides/multi-zones.md`.
