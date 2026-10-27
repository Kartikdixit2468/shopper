# Implementation plan

The repository began with product documentation only, so the build uses a modular monolith: Next.js App Router and TypeScript, Tailwind CSS, Supabase Auth with Google, Supabase-hosted PostgreSQL through Prisma, Zod validation, server actions, and Vitest. Application data uses portable PostgreSQL URLs and stays separate from the Supabase Auth schema. Domain data is capability-based so Presence and Local Store can share one store without later rewrites.

## Slice 0 — Discovery and setup

- [x] Read the product and execution specifications and audit the repository.
- [x] Choose the application architecture, responsive design tokens, and initial domain boundaries.
- [x] Add the Next.js application, Prisma schema, Supabase Auth environment contract, scripts, and test harness.
- [x] Document local setup, OAuth callback, database migration, and verification limits.

## Slice 1 — Homepage, authentication, and store type

- [x] Build the responsive public homepage with an original, calm India-first visual system.
- [x] Integrate Google OAuth through Supabase Auth with PKCE, verified server sessions, and refreshed secure cookies.
- [x] Route first-time users to one three-card question; enable Presence and Local Store only.
- [x] Persist exactly one owner-scoped draft store and safely resume returning merchants.
- [x] Add friendly pending/error states, sign-out, keyboard/focus behavior, and mobile layouts.
- [x] Run formatting, lint, typecheck, unit tests, Prisma validation/generation, and production build.

## Slice 2 — Presence end-to-end

- [ ] Add autosaved guided setup, contact details, media, themes, and configurable sections.
- [ ] Add revisioned draft/published content, preview, publish, public `/s/[slug]`, sharing, and QR.
- [ ] Add Presence listings and owner-authorized editing without commerce endpoints.

## Slice 3 — Local Store end-to-end

- [ ] Add merchant products/categories, inventory, pickup, and merchant-delivery settings.
- [ ] Add public catalog/cart and server-priced unpaid/manual-settlement checkout.
- [ ] Add merchant order inbox, valid status transitions, stock safety, and honest basic metrics.

## Slice 4 — Polish and hardening

- [ ] Complete accessibility/mobile regression QA, secure uploads, rate limits, observability, and privacy controls.
- [ ] Add tenant-isolation, publish-state, checkout, transition, and mode-gating integration coverage.
- [ ] Complete production deployment, migration, recovery, and operator documentation.

Only Slice 1 is in scope for the current implementation. Later routes and controls will not be presented as active features.
