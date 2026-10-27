# Local-first storefront platform

An India-first platform for independent merchants. Slices 1 and 2 are complete: a merchant can sign in with Google, choose a store type, build and customize a Presence website, manage enquiry-only listings, preview unpublished work, and publish a revisioned public storefront.

The visible product name is temporary and configurable with `NEXT_PUBLIC_PRODUCT_NAME`; a final brand decision is still open.

## Stack

- Next.js App Router, React, strict TypeScript, and server actions
- Tailwind CSS plus project-level design tokens
- Supabase Auth with Google OAuth, PKCE, and server-verified cookie sessions
- Supabase-hosted PostgreSQL through Prisma ORM and portable PostgreSQL URLs
- Zod validation, Vitest, and a transactional database integration check
- A modular monolith with clear auth, persistence, publishing, and media boundaries

## What works

- `/` — polished responsive marketing homepage with honest product boundaries.
- `/login` and `/auth/callback` — real Google OAuth through Supabase; no mock production login.
- `/start` and `/onboarding/type` — resumable onboarding with Presence and Local Store enabled, and Full E-commerce disabled as Coming soon.
- `/onboarding/setup` — guided Presence setup for basics, contact details, visual design, media, review, preview, and publishing. Text inputs autosave after changes settle.
- `/dashboard` — merchant overview, publishing status, setup progress, quick actions, sharing, and QR access.
- `/dashboard/website` — edit content sections, reorder them, change the theme, and manage brand imagery.
- `/dashboard/listings` — add, hide, show, or delete enquiry-only products/services with optional price text and images.
- `/dashboard/preview` — authenticated draft preview that never exposes unpublished work publicly.
- `/dashboard/settings` — edit identity, contact, locality, opening hours, WhatsApp number, and unique public slug.
- `/dashboard/upgrade` — preserves the Presence data while enabling the Local Store capability; ordering remains clearly marked as the next slice.
- `/s/[slug]` — public mobile-first storefront rendered exclusively from the latest immutable published revision, with metadata and LocalBusiness structured data.
- `/s/[slug]/qr` — downloadable SVG QR code for the published storefront.
- `/media/[id]` — owner-authorized draft media and public access only for media referenced by a published revision.

Presence pages support three original templates, restrained color palettes, typography choices, configurable sections, click-to-call/WhatsApp/directions actions, gallery imagery, and share controls. They intentionally contain no cart, checkout, online payment, or order flow.

## Local setup

Requirements: Node.js 20+ (verified with Node 24), pnpm, and a Supabase project.

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. In Supabase's **Connect** panel, copy the Session pooler connection string into `DIRECT_URL`. Use the transaction pooler on port `6543` for `DATABASE_URL` on serverless hosting, or the Session pooler/direct URL for a long-running Node server such as EC2. Keep `sslmode=require`, URL-encode reserved password characters, and never expose these URLs to the browser.

3. Copy `.env.example` to `.env.local`. Set `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, the project's publishable key in `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.

4. In Google Cloud Console, create an OAuth 2.0 Client ID of type **Web application**. Use the callback shown in Supabase Dashboard → Authentication → Providers → Google, normally:

   - `https://PROJECT_REF.supabase.co/auth/v1/callback`

   Put the Google client ID and secret in Supabase's Google provider settings. In Supabase Authentication → URL Configuration, set the local Site URL and allow `http://localhost:3000/auth/callback`. Add the production HTTPS callback before deployment.

5. Apply the committed migrations and generate Prisma's client:

   ```bash
   pnpm db:deploy
   pnpm db:generate
   ```

6. Start the application and open `http://localhost:3000`:

   ```bash
   pnpm dev
   ```

Without the Supabase Auth variables the public marketing site still renders, but sign-in is intentionally unavailable.

## Media storage

The current adapter stores JPEG, PNG, and WebP files up to 5 MB in `.data/uploads`; random server-generated keys prevent path injection. This is appropriate for local development and a single EC2 instance with a persistent volume. For horizontally scaled or ephemeral hosting, replace the small storage adapter in `src/lib/storage.ts` with S3-compatible object storage. Store/domain code and database records do not need to change.

## Verification commands

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:presence-db
pnpm db:validate
pnpm build
```

`test:presence-db` validates real Supabase persistence, immutable revision behavior, and owner-scoped reads in a transaction that is always rolled back. Live OAuth still requires the Google provider and redirect allow lists to be configured in your Supabase project.

## Supabase and AWS portability

Supabase provides two separate capabilities: Supabase Auth owns Google identity and sessions, while Prisma owns application data in ordinary PostgreSQL tables. The app does not use Supabase's Data API or Realtime for merchant data. A public `Profile` mirrors only the authenticated UUID, email, name, and avatar; provider tokens are never copied into application tables.

To move application data to PostgreSQL on AWS EC2 or RDS:

1. Provision PostgreSQL and restrict network access to the application hosts.
2. Export/import with `pg_dump` and `pg_restore`, or replay Prisma migrations for a fresh database.
3. Change `DATABASE_URL` and `DIRECT_URL` to the AWS PostgreSQL URLs.
4. Run `pnpm db:deploy` and restart the app.

No store queries, models, or server actions need to change. Supabase Auth can remain the identity provider after the database move. See [`docs/DATABASE.md`](docs/DATABASE.md) for the connection-mode and schema details.

## Security and publishing model

- Supabase verifies the OAuth response; the callback uses PKCE and secure cookie sessions.
- Protected code calls `auth.getUser()` before every merchant lookup and constrains data by `ownerUserId`.
- Server actions parse untrusted inputs with Zod and derive owner/store identity from the session.
- Uploads are type/size checked and draft files require ownership. Public media must be referenced by a published snapshot.
- Publishing records an immutable `StoreRevision`; public pages never read mutable drafts.
- Full E-commerce is absent from the active capability enum. Presence listings are enquiry-only.

## Current boundary

Local Store ordering is not implemented yet. Slice 3 will add merchant inventory, pickup/delivery settings, server-priced unpaid/manual-settlement checkout, and an order-status workflow. There is no pretend online payment, courier integration, marketplace, native app, or paid-plan flow in the current build.
