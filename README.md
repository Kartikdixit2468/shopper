# Local-first storefront platform

Slice 1 of an India-first platform for independent merchants. The current application provides a polished public homepage, real Google authentication, a one-question mode picker, and a durable owner-scoped store draft. Presence setup, publishing, products, orders, fulfilment, and payments are deliberately not implemented in this slice.

The visible product name is temporary and configurable with `NEXT_PUBLIC_PRODUCT_NAME`; a final brand decision is still open.

## Stack

- Next.js App Router, React, and strict TypeScript
- Tailwind CSS plus project-level design tokens
- Auth.js Google provider with the Prisma adapter and database sessions
- PostgreSQL and Prisma ORM
- Zod input validation and Vitest
- A modular monolith: page/server-action boundaries today, ready for domain modules as later slices arrive

## What works

- `/` — responsive marketing homepage with product modes, an explicitly labelled demo preview, how-it-works narrative, honest product boundaries, FAQ, and calls to action.
- `/login` — Google OAuth entry. The button is shown only when all required auth variables exist; there is no fake production login.
- `/start` — authenticated routing: a first-time user goes to the type question and a returning store owner goes to the dashboard.
- `/onboarding/type` — exactly one primary question with active Presence and Local Store cards. Full E-commerce is visibly disabled and rejected by server validation if a forged value is submitted.
- Store choice persistence — creates one `DRAFT` store per authenticated owner with the chosen capability, `Asia/Kolkata`, and `en-IN`. The unique owner constraint and conflict handling make duplicate submissions safe.
- `/dashboard` — reads the persisted draft from PostgreSQL, confirms the chosen mode, supports sign-out, and honestly marks guided setup as the next slice.
- `/privacy` and `/terms` — transparent development summaries rather than invented final policies.

## Local setup

Requirements: Node.js 20+ (the project was verified with Node 24), pnpm, and PostgreSQL.

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` and `AUTH_SECRET`.

   Generate a suitable secret with:

   ```bash
   openssl rand -base64 32
   ```

3. In Google Cloud Console, create an OAuth 2.0 Client ID of type **Web application**. For local development add:

   - Authorized JavaScript origin: `http://localhost:3000`
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

   Put the client ID and secret in `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`. For deployment, add the production origin and `https://your-domain/api/auth/callback/google`, and set `AUTH_URL` to the production origin.

4. Create/update the database and generate the client:

   ```bash
   pnpm db:migrate
   pnpm db:generate
   ```

5. Start the application:

   ```bash
   pnpm dev
   ```

Open `http://localhost:3000`. Without Google variables the public site and configuration guidance still render, but sign-in is intentionally unavailable.

## Verification commands

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm db:validate
pnpm build
```

Live OAuth requires credentials issued for the running origin. End-to-end draft persistence additionally requires a reachable migrated PostgreSQL database; neither is replaced by a mock account in this repository.

## Security notes

- Auth.js verifies the Google OAuth response and stores sessions server-side.
- Session cookies are HTTP-only, `SameSite=Lax`, and use the secure prefix/flag in production.
- Draft creation derives `ownerUserId` exclusively from the authenticated session; no client-supplied store or owner ID is trusted.
- `ECOMMERCE` does not exist in the active database enum and the server accepts only `PRESENCE` or `LOCAL_STORE`.
- Secrets stay in environment variables and `.env*` files are ignored except for `.env.example`.

## Scope boundary

The next proposed slice is Slice 2: autosaved business setup, contact information, themes, revisioned draft-versus-published content, preview, and public Presence storefronts. The current dashboard does not imply those features already work.
