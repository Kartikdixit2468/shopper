# Codex Execution Instructions

Read `PROJECT_SPEC.md` completely before editing code. The purpose is a **working**, visually polished India-first merchant storefront platform with `PRESENCE` and `LOCAL_STORE` enabled, and `ECOMMERCE` visibly `Coming soon`.

1. Inspect the repository. Summarize existing stack, dependencies, working features and gaps before changing architecture. If repo is empty, use default stack in `PROJECT_SPEC.md`.
2. Create a brief `IMPLEMENTATION_PLAN.md` using slices 0–4 from the spec. Update checkboxes as each slice completes.
3. Implement Slice 1 first. Do not generate a superficial full-app mockup. Deliver real Google OAuth integration (env-driven), persisted draft store, responsive homepage and one-question mode picker.
4. Implement Slice 2 as a fully functioning end-to-end Presence experience, including revisions/draft-vs-published behavior and customization.
5. Implement Slice 3 as actual Local Store ordering, with server-validated checkout, merchant-managed delivery/pickup, and merchant order status workflow; **no pretend online payment**.
6. Implement Slice 4 quality requirements, tests, mobile usability, secure access and clear README.
7. For each slice, run available lint, typecheck, migrations, tests and build; fix failures before proceeding. If external credentials block a live integration, implement and document the integration and report which verification cannot be performed.
8. Never silently expand scope into courier APIs, payments, a marketplace, complex editor, native app or paid plans. These are future milestones.
9. Favor clear, accessible UI; style with restrained tasteful colors and subtle gradient accents. Reference supplied Shopify/Dukaan screenshots for tone only, no copying of brand assets.
10. At completion, report actual implemented routes/features, setup steps, tests run, limitations, and next proposed slice. Do not label placeholders as working functionality.

**First Codex prompt:**

> Read `PROJECT_SPEC.md` and `AGENTS.md`. Inspect this repository, then write `IMPLEMENTATION_PLAN.md` with the proposed architecture and step-by-step tasks. Implement Slice 1 fully: a beautiful responsive landing page inspired by Shopify's premium restraint and Dukaan's friendliness, secure Google authentication, a one-question 3-card store-type chooser (Presence and Local Store active, Full E-commerce disabled as Coming soon), and persisted draft-store creation. Use a calm modern visual system with subtle colorful gradients, not neon. Verify lint/types/build and describe exactly what works and any environment setup required. Respect the later slices and schema so we can add Presence/Local flows without rewrites.
