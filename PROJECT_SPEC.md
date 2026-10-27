# Local-First Commerce Platform — Product & Engineering Specification

**Status:** V1 build specification | **Date:** 27 October 2026  
**Working name:** Project Local (placeholder; do not hard-code branding)
**Owner:** DwarkaLabs (project context)

## 0. How to use this document

This is a source-of-truth brief for Codex to **implement** a production-minded MVP. Treat **MUST** as required for V1; **SHOULD** as desirable after required functionality works; **LATER** as explicitly out of scope. Build in vertical slices with functioning flows, not just static screens. If starting in an existing repository, inspect it first and conform to its established framework/conventions when reasonable; do not overwrite existing functioning code. Use `AGENTS.md` for execution order.

**Product thesis:** Make it easy for a nontechnical Indian shop owner to have a beautiful, customizable online presence and, optionally, accept local orders. The same merchant account and store can later grow into a full e-commerce platform.

### Principles

1. **Mobile-first merchant UX:** shop owners should be able to run their presence or local store on a phone.
2. **One platform, modes as capabilities:** avoid three disconnected codebases.
3. **Progressive disclosure:** reveal complexity only as necessary.
4. **Fast first success:** Google sign-in → single choice → guided creation → preview → publish.
5. **Visual quality is part of the MVP:** design polished, accessible, responsive, and cohesive screens.
6. **Never promise customer discovery or delivery capacity we don't provide.**
7. **Security, tenant isolation, and durable data are non-negotiable.**

## 1. Scope & users

### V1 modes

**A. Online Presence (`PRESENCE`) — live in V1**  
For merchants with a physical business who need a shareable, searchable, branded mini-site. Includes business profile, contact information, opening hours, map/directions link, images/gallery, service or product highlights, categories, social links, WhatsApp CTA, themes, configurable page sections, preview, publishing and QR/share link. **No order acceptance, shopping cart, checkout or delivery controls.** Product-like entries are optional _listings_, not purchasable items.

**B. Local Store (`LOCAL_STORE`) — live in V1**  
Everything in Presence plus products, price, SKU (optional), inventory availability, categories, variants only if manageable in V1, basic cart, order placement, order inbox, order statuses, pickup, merchant-managed delivery within merchant-defined service areas, simple fees, contact/WhatsApp handoff, and basic activity metrics. No integration with couriers in V1. V1 orders are **unpaid/manual settlement** (cash on pickup, cash on delivery, or seller-coordinated payment). Do not collect card details or misrepresent an order as paid. Merchant should be able to confirm or reject orders.

**C. Full E-commerce (`ECOMMERCE`) — visible but unavailable**  
Card appears during store-type selection with a `Coming soon` tag and clear disabled CTA / optional interest-capture waitlist. Future includes advanced themes, conversion analytics, payment gateway onboarding, third-party plugins/webhooks/API, courier APIs (Delhivery, Blue Dart, etc.), national shipping, robust inventory and promotion systems. **Do not implement these in V1, do not render fake settings that appear active.**

### First customers

- Independent kirana/grocery, stationery, beauty, electronics, service, boutique and specialty stores in India.
- Mobile/WhatsApp-heavy, time-constrained, not necessarily technically confident.
- English initial copy; architecture must support localization. Hindi and Kannada can follow based on tests.

### Jobs to be done

- "I need my shop to show up professionally online."
- "I want to share one link or QR code containing all my business information."
- "I want customers to browse my products and contact me."
- "I want to receive local orders without managing a delivery fleet."

### Out of scope (V1)

Global delivery/logistics, Blinkit-style dispatch/ETAs, custom courier integration, payment-gateway integrations, automated payouts, complex tax/GST invoicing, marketplace discovery, reviews from unverified buyers, POS, real-time rider tracking, drag-and-drop arbitrary HTML editor, AI product generation, multi-location warehouses, subscription billing, theme/plugin marketplaces, multiple store owners/roles, fully custom domains (design for it, ship after verified DNS/SSL provisioning exists).

## 2. User journeys and requirements

### 2.1 Entry & authentication

- Public marketing homepage: hero, product value, two active modes + upcoming third, sample storefront previews, how it works, trust/benefits, FAQ, CTA.
- Click `Get started` → Google OAuth sign-in. Use **server-side verified session**, secure HTTP-only cookies. Do not use mocked authentication beyond isolated local development fixtures. Provide friendly loading/errors and account sign-out.
- Upon first authenticated visit, show **exactly one primary question:** `What would you like to create?` with three illustrated/selectable cards:
  1. `Online Presence` — "Put your business online and help customers find you" — Choose
  2. `Local Store` — "Show products, accept local orders, and manage pickup/delivery" — Choose
  3. `Full E-commerce Store` — "Advanced online selling" — Coming soon, disabled + optional waitlist interest
- Returning users with a store should enter dashboard; first-time users without a store choose type. Support explicit `Create another store` only if multi-store architecture exists and UI is clear; otherwise one store per owner initially.

### 2.2 Guided setup (after mode choice)

Collect progressively using a friendly stepper, **not a giant form**:

1. **Business basics:** name (required), business category (required), short description (optional); suggested slug.
2. **Ways to find/contact you:** city/locality (required), physical address (optional but prompt for accuracy), phone/WhatsApp (one contact method required), directions/location URL (optional), opening hours (optional). Never claim exact geolocation based only on city.
3. **Make it yours:** select from 3 professionally designed templates; add logo/cover photo, primary color and accent color, preview live.
4. **For Local Store only:** add first product(s), configure pickup address and optionally merchant delivery settings. Allow `Skip for now` on optional tasks; merchant cannot accept orders until required fulfilment/contact details are provided.
5. **Review & publish:** display checklist with missing mandatory fields and a true storefront preview. Publish creates publicly accessible slug route. Provide "Share link" and QR export where feasible.

- Autosave drafts; draft and published states distinct. Saved progress survives refresh and login.
- Friendly inline validation, loading states, recovery; no dead ends. Setup must support back/next and editable prior steps.
- Store slug collisions resolved safely; allow slug edit with validation. Publishing must not expose unapproved drafts.

### 2.3 Online Presence management

Merchant dashboard:

- Overview: publish state, storefront link, setup completeness, quick actions, basic visits (if measured accurately), contact/share shortcuts.
- `Edit Website`: guided section editor, not full unrestricted drag-and-drop. Hero, About, Gallery, Offerings/Listings, Hours, Location, Contact, Social links. Reorder sections, toggle visibility, edit text/images, preview desktop/mobile, save draft, publish updates.
- Branding: logo, cover, fonts from limited curated choices, color theme, layout/template selection. Keep contrast readable automatically.
- Listings: name, picture, optional description/category, optional price display with clear `Enquire` CTA; no purchasing flows in this mode.
- Store settings: hours, address, phone, WhatsApp, socials, map link.
- View published storefront and share QR/link.
- Upgrade CTA from `PRESENCE` to `LOCAL_STORE` with explicit confirmation; preserve business, theme, content, URL; enable local commerce features and launch relevant checklist. Never downgrade destructively.

### 2.4 Local Store management

Additional dashboard sections:

- Products CRUD: image, name, description, price in INR (store smallest currency unit server-side), category, status, optional quantity/stock; safe file size/type validation. Define out-of-stock behavior clearly. Efficient mobile form.
- Product categories CRUD (simple).
- Orders inbox: statuses `PLACED`, `CONFIRMED`, `PREPARING`, `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY`, `COMPLETED`, `CANCELLED`, `REJECTED`; apply only valid transitions based on chosen fulfilment type, show history + timestamps. Merchant can view buyer contact and fulfilment detail subject to access controls.
- Fulfilment settings: `PICKUP` and/or `MERCHANT_DELIVERY`; pickup instructions; seller-defined delivery area by eligible postal codes (simpler/more precise than a distance radius initially), flat delivery charge, minimum order if chosen. **No platform courier dispatch.**
- Ordering: product listing/detail, cart (with quantity), checkout capturing buyer name, phone, required address + postal code for delivery; pickup needs no shipping address. Clear payment method `Pay merchant on pickup/delivery` or `Arrange payment with merchant` and **never imply integrated payments**. Order confirmation displays number and seller contact. Merchant accepts/rejects manually.
- Notify merchant in dashboard; optional WhatsApp deep link with pre-filled summary as a _user-triggered_ action, not pretend automated message sending. Automated WhatsApp Business messaging requires a future approved API integration.
- Availability: products with zero stock cannot be purchased. Prevent quantity overselling via transactional/atomic order-creation logic where practical. Explain stock semantics clearly (reserve at placement or confirmation consistently).
- Basic metrics: orders count, product count, recent orders, estimated order value marked unpaid; avoid falsely labeling it as revenue or settled payments.

### 2.5 Public storefront

- Each merchant receives a public route e.g. `/s/{slug}`; possible custom subdomains are future optional feature. Avoid assuming wildcard DNS already configured.
- Branded, attractive, fast mobile storefront with SEO metadata (title, description, Open Graph, local-business structured data **only where fields accurate**), accessible semantics, gallery, address/hours, directions, WhatsApp/phone/contact CTAs.
- Presence mode: informational site; no cart/order endpoints exposed.
- Local mode: shop sections + product listing + cart + valid order checkout (no integrated online payment).
- Draft stores must not be publicly discoverable. Unpublished sections must not leak. 404 for unknown slug.
- Display clear merchant fulfillment and payment policies, and privacy notice before collecting customer contact details.

## 3. Information architecture

### Marketing site

`/`, `/features`, `/pricing` (avoid publishing invented final prices; use pricing preview / `Coming soon` until decided), `/examples`, `/login`, `/privacy`, `/terms`.

### Authenticated app

`/onboarding/type`, `/onboarding/setup`, `/dashboard`, `/dashboard/website`, `/dashboard/listings`, `/dashboard/products` [LOCAL_STORE], `/dashboard/orders` [LOCAL_STORE], `/dashboard/fulfilment` [LOCAL_STORE], `/dashboard/settings`, `/dashboard/upgrade`.

### Customer/public

`/s/[slug]`, `/s/[slug]/products/[productId]`, `/s/[slug]/cart`, `/s/[slug]/checkout`, `/s/[slug]/order-confirmation/[publicToken]` (only for LOCAL_STORE).

All routes are illustrative and can be made idiomatic for framework.

## 4. Design & UX system — highest priority

### Reference direction

The supplied screenshots show Dukaan's soft colorful/light landing presentation and Shopify's premium typography, spacious hierarchy, restrained high-contrast framing. **Use as inspiration, not as source assets or a layout to copy**. Own visual identity: welcoming, confident, polished, modern, calm. Avoid neon gradients everywhere, excessive animations, generic identical SaaS cards, dark dashboards everywhere, and crowded admin tables.

### Visual language

- Foundations: warm off-white `#FAFAF7`, clean white `#FFFFFF`, near-black ink `#17211F`, soft slate `#66736F`; gentle elevated surfaces.
- Primary green/teal `#167D6D` (adjust to accessible contrast), secondary blue `#5679CF`, accent apricot `#F4AD82`, subtle lavender `#C6B9E8`; **never use all accents on one screen**.
- Use soft low-opacity multi-color backgrounds selectively in marketing hero, onboarding illustrations, occasional empty states. Core dashboard surfaces should be neutral.
- Typography: legible modern sans (e.g. Geist or Inter) with expressive display headings. Indic font fallback if localization is added.
- Generous spacing (8px scale), rounded corners 12–20px, light borders, restrained shadows, helpful icons and authentic/store-related images.
- Great usability on phones starting ~360px width; responsive tablet/desktop. Sticky bottom primary CTA on mobile setup where appropriate.
- Clear visible focus, 44px touch targets, WCAG AA contrast goal, keyboard navigation, reduced-motion support.
- Micro-interactions: subtle hover, skeleton loading, success confirmation, preview transitions. Avoid performance-heavy scroll animations.
- Empty states must tell the user what to do next (`Add first product`, `Publish store`, etc.). Never use fabricated sales metrics, merchants or testimonials.

### Key screens to prioritize visually

1. Marketing homepage (premium visual hook and immediate explanation)
2. One-question mode picker after Google auth (three differentiated cards, 3rd `Coming soon`)
3. Step-by-step setup (simple, uncluttered, autosaved)
4. Merchant dashboard (contextual, reassuring, actionable)
5. Theme/content editor with live preview (mobile/desktop)
6. Public Presence template(s)
7. Public Local Store and frictionless manual-payment checkout
8. Product and order management on mobile

### Copy voice

Plain English with everyday examples. Say "Your shop is now online" rather than "Provisioning successful". Explain terms when needed. "Delivery by this shop" vs "Instant delivery". No deceptive dark patterns. Merchant always knows if changes are a draft or published.

## 5. Suggested technical architecture (default, adapt to repo)

**Default stack when repo is empty:** Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui primitives + PostgreSQL + Prisma ORM + Auth.js Google provider (or equivalent secure Google OAuth) + Zod validation + object storage compatible with S3 (local dev adapter) + server actions/route handlers. pnpm preferred. Use a modular monolith, not microservices. If existing stack materially differs, retain it unless impossible.

### Domain entities

- `User`: id, googleSubject/provider identity, email, name, avatar, timestamps.
- `Store`: id, ownerUserId, type (`PRESENCE`/`LOCAL_STORE`), name, unique slug, category, shortDescription, status (`DRAFT`/`PUBLISHED`/`SUSPENDED`), timezone, locale, createdAt/updatedAt/publishedAt.
- `StoreContact`: storeId, phone, whatsappNumber, address lines, locality, city, state, postalCode, mapUrl, socials, openingHours JSON with schema.
- `ThemeConfig`: storeId, templateId, primary/accent colors, fontSet, logoAssetId, coverAssetId, navigation config.
- `PageSection`: storeId, type, sortOrder, visible, structuredContent JSON validated per component. Prefer schema-versioned sections.
- `MediaAsset`: storeId, storageKey, mimeType, bytes, metadata.
- `Listing`: storeId, title, description, priceDisplay?, category, image, status, order. Presence-only, or shared with product carefully.
- `Product`: storeId, title, description, priceMinor, currency=INR, stockQuantity?, availability, image, categoryId, status, timestamps.
- `ProductCategory`: storeId, name, slug, position.
- `FulfilmentSettings`: storeId, pickupEnabled, deliveryEnabled, pickupInstructions, deliveryPinCodes, deliveryFeeMinor, minOrderMinor.
- `Order`: storeId, humanReadableOrderNo, publicLookupToken (not sequential identifier authorization), buyer name/phone, fulfilmentType, address snapshot, orderStatus, paymentStatus (`UNPAID`/`MANUALLY_SETTLED` if confirmed by merchant), subtotalMinor, deliveryFeeMinor, totalMinor, notes, timestamps.
- `OrderLine`: orderId, productId, productTitleSnapshot, unitPriceMinor, quantity, lineTotalMinor.
- `OrderEvent`: orderId, actor, fromStatus, toStatus, reason, timestamp.
- `WaitlistInterest`: userId/email and consent timestamp for future ECOMMERCE updates (optional).

**Important:** all merchant mutations/checks MUST derive authorized `storeId` from authenticated session/ownership checks; never trust user-supplied store ID. Public shopper/order endpoints validate published mode and rate limit. Distinguish draft theme content vs published revisions (snapshot on publish or revision table), otherwise save-draft cannot safely differ from public site.

### Functional requirements

- Schema-validated inputs; secure upload constraints; prevent cross-tenant reads/writes.
- Index store slug, ownerUserId, order storeId+createdAt, product storeId/status.
- Use database transactions for consistent order line totals and inventory reservations. Totals always computed on server from current product prices and fulfilment settings; ignore user-submitted totals.
- India-oriented validation: E.164 phone normalization (+91 default when appropriate), 6-digit PIN code, INR minor units; do not force false geocoding precision.
- Session cookies secure/httpOnly/sameSite; CSRF considerations, OAuth state protection, API rate limiting, ownership authorization.
- Minimal PII collection + retention/deletion policy placeholder to finalize before launch; secrets solely in env, `.env.example` with documented variable names.
- Analytics only when instrumented; avoid counting bot previews as real storefront visitors when possible; design analytics to be replaceable.
- Error tracking/logging without exposing secrets, buyer contact info or tokens.
- SEO and public page cache strategy with invalidation upon publication.
- Lightweight tests for auth guard, tenant isolation, publish state, slug collision, order total, invalid status transitions, mode gating and upgrade preservation.

## 6. Acceptance criteria (Definition of Done)

### Merchant signup

- First-time Google login arrives at three-option choice; only two create a store.
- Disabled full-commerce option clearly marked Coming soon; no false activation route.
- Returning merchant resumes draft/setup or sees dashboard.

### Presence mode

- Nontechnical merchant can create draft, configure branding and sections, preview, publish and share live URL.
- Refresh/login does not lose progress.
- A different user cannot edit the store; public visitors cannot see unpublished content.
- Presence pages never show buy/cart/checkout functions.

### Local Store mode

- Merchant can publish and manage products/categories and pickup or merchant-delivery rules.
- Customer can add available items to cart, choose valid available fulfilment method, place an **unpaid** order and see real confirmation.
- Merchant can receive, inspect, and transition orders with status history; invalid transitions fail safely.
- Customers cannot order outside approved delivery postal codes when delivery chosen.
- Order totals are server-calculated; cross-store product submissions rejected.

### Upgrade

- Presence merchant can opt into Local Store; same store URL, settings, assets, and existing sections preserved.

### UX and quality

- All key flows usable at 360px and desktop; accessible keyboard interactions.
- All buttons/routes have real action or honest disabled/coming-soon states; no fake data in production UI.
- Test suite and typecheck pass, README includes local setup, environment variables, migrations/seed and preview workflow.

## 7. Prioritized implementation slices

**Slice 0 — Discovery and setup:** inspect repo, establish design tokens/layout/components, DB schema, auth env setup, scripts, tests. If Google credentials missing, provide precise setup documentation and an explicitly dev-only mode; NEVER fake production Google login.

**Slice 1 — Beautiful public homepage + auth + type picker:** fully responsive marketing page, Google sign-in, mode selection, disabled third option, persisted store draft.

**Slice 2 — Presence end-to-end:** stepper, business details, template gallery, editor, storage, draft vs published, public `/s/[slug]`, sharing/QR.

**Slice 3 — Local Store end-to-end:** products, categories, fulfillments, public catalog, cart, unpaid checkout, merchant order inbox/status transitions.

**Slice 4 — Polish and hardening:** accessibility, mobile regression, optimistic UI where safe, upload security, rate limits, error messages, QA and deployment guide.

Do not proceed to later slices if prior slice's core flows are broken. Prefer a small complete working slice to a large nonfunctional scaffold.

## 8. Explicit product decisions and unresolved questions

**Decided for MVP:** Google OAuth first; one initial choice after login; PRESENCE and LOCAL_STORE active; ECOMMERCE is Coming soon; local delivery only merchant-managed; no online payments yet; all stores use same underlying platform; customization is template/sections/theme controls rather than arbitrary code editor.

**Provisional defaults (easy to change in configuration):** India launch, English UI first, INR currency, one store per owner initially, catalog can be browsed publicly, platform-hosted `/s/{slug}` URLs, three templates per mode, free beta with no billing before pricing validation.

**Needs founder decisions before public monetized launch:** brand/name/domain, paid pricing/limits, whether WhatsApp or in-app order flow is the primary checkout, merchant verification/abuse policy, business support model, privacy/terms/refunds, custom domain rollout, and automatic WhatsApp provider if desired. Do not invent final policy or pricing answers.

## 9. Competitive research & inspiration (not to copy)

- Shopify India: https://www.shopify.com/in — premium brand, editorial typographic hierarchy, commerce depth.
- Dukaan: https://mydukaan.io/ (user screenshot) and https://dukaan.fun/ — approachable store setup, mobile commerce / WhatsApp and order-management patterns.
- Dukkan (distinct product): https://dukkan.app/ — useful example of simplified WhatsApp ordering and visual store builder.
- Other India SMB commerce: Instamojo, DotPe, etc. Study their onboarding, feature vocabulary and pricing; do not assume any one product owns a unique feature.

Competitor features and prices may change. The moat must be measurable setup simplicity, merchant adoption, local relevance and support—not generic cheaper claims.

## 10. Data and UI sample principles

Use clearly marked **DEMO** seed businesses in development with realistic Indian business categories (stationery shop, beauty store, bakery), Indian addresses only if invented and clearly demo, INR formatting and authentic-looking but licensed/placeholder imagery. Never publish invented testimonials, sales volumes or customer lists as facts. Empty merchant dashboards should show genuine empty states, not fabricated performance charts.
