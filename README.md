# Local-first storefront platform

Slice 1 of an India-first platform for independent merchants. The current application provides a polished public homepage, real Google authentication, a one-question mode picker, and a durable owner-scoped store draft. Presence setup, publishing, products, orders, fulfilment, and payments are deliberately not implemented in this slice.

The visible product name is temporary and configurable with `NEXT_PUBLIC_PRODUCT_NAME`; a final brand decision is still open.

## Stack

- Next.js App Router, React, and strict TypeScript
- Tailwind CSS plus project-level design tokens
- Supabase Auth with Google OAuth, PKCE, and server-verified cookie sessions
- Supabase-hosted PostgreSQL through Prisma ORM, accessed only through portable PostgreSQL URLs
- Zod input validation and Vitest
- A modular monolith: page/server-action boundaries today, ready for domain modules as later slices arrive

## What works

- `/` — responsive marketing homepage with product modes, an explicitly labelled demo preview, how-it-works narrative, honest product boundaries, FAQ, and calls to action.
- `/login` — Google OAuth entry through Supabase. The button is shown only when all required auth variables exist; there is no fake production login.
- `/auth/callback` — exchanges the one-time PKCE code for a Supabase session, synchronizes the portable profile, and resumes onboarding.
- `/start` — authenticated routing: a first-time user goes to the type question and a returning store owner goes to the dashboard.
- `/onboarding/type` — exactly one primary question with active Presence and Local Store cards. Full E-commerce is visibly disabled and rejected by server validation if a forged value is submitted.
- Store choice persistence — creates one `DRAFT` store per authenticated owner with the chosen capability, `Asia/Kolkata`, and `en-IN`. The unique owner constraint and conflict handling make duplicate submissions safe.
- `/dashboard` — reads the persisted draft from PostgreSQL, confirms the chosen mode, supports sign-out, and honestly marks guided setup as the next slice.
- `/privacy` and `/terms` — transparent development summaries rather than invented final policies.

## Local setup

Requirements: Node.js 20+ (the project was verified with Node 24), pnpm, and a Supabase project.

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a Supabase project. In its **Connect** panel, copy the Session pooler connection string into `DATABASE_URL`. Put a direct connection string into `DIRECT_URL` when your machine supports IPv6; otherwise the Session pooler string can be used for both. Retain `sslmode=require`, URL-encode reserved characters in the database password, and never expose either URL to the browser.

3. Copy `.env.example` to `.env.local`. Set the two database URLs, `NEXT_PUBLIC_SUPABASE_URL`, the project's publishable key in `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.

4. In Google Cloud Console, create an OAuth 2.0 Client ID of type **Web application**. Use the callback shown in Supabase Dashboard → Authentication → Providers → Google; it is normally:

   - Authorized redirect URI: `https://PROJECT_REF.supabase.co/auth/v1/callback`

   Put the Google client ID and secret in the Supabase Google provider settings, not in this application's environment. Then open Supabase Authentication → URL Configuration, set the local Site URL, and add `http://localhost:3000/auth/callback` to the redirect allow list. Add the production HTTPS callback when deploying.

5. Apply the committed migration to Supabase and generate the client:

   ```bash
   pnpm db:deploy
   pnpm db:generate
   ```

6. Start the application:

   ```bash
   pnpm dev
   ```

Open `http://localhost:3000`. Without Supabase Auth variables the public site and configuration guidance still render, but sign-in is intentionally unavailable.

## Verification commands

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm db:validate
pnpm build
```

Live OAuth requires the Google provider and redirect allow lists to be configured in Supabase. End-to-end draft persistence additionally requires a reachable migrated Supabase Postgres database; neither is replaced by a mock account in this repository.

## Supabase and AWS portability

Supabase provides two deliberately separated capabilities: Supabase Auth owns Google identity and the session, while Prisma owns application data in ordinary PostgreSQL tables. The app does not use Supabase's Data API or Realtime for merchant data. A public `Profile` mirrors only the authenticated UUID, email, name, and avatar; Google provider tokens are not copied into application tables.

For a later move to PostgreSQL on AWS EC2 or RDS:

1. Provision PostgreSQL and secure network access from the application host.
2. Export/import the PostgreSQL database with `pg_dump` and `pg_restore`, or replay the Prisma migrations for a fresh environment.
3. Change `DATABASE_URL` and `DIRECT_URL` to the AWS PostgreSQL URLs.
4. Run `pnpm db:deploy` and restart the application.

No store repository queries, models, or server actions need to change. Supabase Auth remains the identity provider after a database-only move; replacing authentication later would be a separate, contained migration at the auth client/callback boundary. See [`docs/DATABASE.md`](docs/DATABASE.md) for details.

## Security notes

- Supabase Auth verifies the Google OAuth response and uses PKCE for the server-side callback flow.
- Middleware refreshes and verifies auth claims; protected server code resolves the user with `auth.getUser()` before accessing merchant data.
- Session cookies are managed through Supabase's supported SSR cookie adapter.
- Draft creation derives `ownerUserId` exclusively from the authenticated session; no client-supplied store or owner ID is trusted.
- `ECOMMERCE` does not exist in the active database enum and the server accepts only `PRESENCE` or `LOCAL_STORE`.
- Secrets stay in environment variables and `.env*` files are ignored except for `.env.example`.

## Scope boundary

The next proposed slice is Slice 2: autosaved business setup, contact information, themes, revisioned draft-versus-published content, preview, and public Presence storefronts. The current dashboard does not imply those features already work.
