# Sprint 3 — Gemini text Case Assistant
Case Assistant requires a signed-in Medical Service member. Input a fictional case, explicitly generate a structured English RP draft, review simulated observations, and transfer it to a new Medical Report draft. Title, category, narrative fields, before/after vitals, anesthesia and follow-up transfer; user completes patient and team fields. Results also contain instruments, chronological /me /do, discharge suggestions and assumptions. No image generation. No automatic request on typing, no model fallback.

Activation:
1. Create a Gemini API key in Google AI Studio (https://aistudio.google.com/apikey) using a project on Free Tier. Free tier has rate limits; a billing-enabled project may charge even for this model.
2. Set GEMINI_API_KEY server-side in .env.local and Vercel. Never NEXT_PUBLIC; do not send the key in chat. GEMINI_TEXT_MODEL defaults to gemini-3.5-flash-lite.
3. Run existing migration 004_report_suggestions.sql once if not installed. It enforces 20 requests per member/hour atomically. Errors never bypass the quota. Failed generations may consume quota.
4. Restart local server or redeploy.

The endpoint enforces same origin, authentication, division, input/output bounds and structured JSON parsing. Fictional vitals must be labeled simulated. No numeric real anesthetic/prescribing doses: placeholders for RP staff review. The assistant does not claim missing radiology findings are known. Do not submit real patient records. Free-tier content may be used by Google to improve products (https://ai.google.dev/gemini-api/docs/pricing).

API key was absent during implementation; live Gemini generation is not verified. Unit tests exercise malformed output and transfer behavior. Text output remains manually editable in Report MS. Manual report creation and image uploads continue unchanged.
