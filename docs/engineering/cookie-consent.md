# Cookie consent storage

The shared `js/cookie-notice.js` records explicit accept/reject clicks through the existing `portfolio-submit` Edge Function using `type: cookie-consent`. The public endpoint accepts the portfolio domains and local preview origins. Origin validation is a browser restriction, not proof of visitor identity.

Records in `public.cookie_consents` contain a unique event ID, random browser ID, choice, policy version, client decision time, and server recording time. No email, name, IP address, or user-agent is added to this table. Records describe browser submissions, not verified identities. The database table has RLS enabled and no public grants; only the backend service role can insert or read records.

The browser saves the choice immediately. Its latest unsaved record is retried on the next page load or when the browser returns online. Retrying the same event ID does not create another row. If multiple choices happen while offline, only the latest unsaved choice is retained. Earlier local-only choices from before this integration are not backfilled. Clearing browser storage creates a new browser ID.

Policy version: `2026-11-05`. Update the frontend and backend version validation together when changing the consent policy. Schema snapshot: `supabase/schema/cookie-consents.sql`; the schema was applied through the Supabase migration `add_cookie_consent_records`.

Cookie acceptance enables the embedded client website; rejection prevents the iframe from loading. These choices do not grant newsletter subscription consent.
