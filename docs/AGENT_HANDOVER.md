# PlantMind AI Development Agent Protocol

The repository and its documentation are the authoritative PlantMind project memory. Never rely on previous AI conversation history as the source of truth.

## Before modifying PlantMind

1. Read `README.md`.
2. Read `docs/PRODUCT_VISION.md`.
3. Read `docs/ARCHITECTURE.md`.
4. Read `docs/PLANT_MODEL.md`.
5. Read `docs/MILESTONES.md`.
6. Read `docs/DECISIONS.md`.
7. Read `docs/CURRENT_STATE.md`.
8. Read `docs/NEXT_STEPS.md`.
9. Inspect recent Git history.
10. Check current Git status.
11. Read the relevant Next.js version guide under `node_modules/next/dist/docs/` before changing Next.js code, as required by root `AGENTS.md`.

## Before implementing anything

- Understand the existing architecture.
- Preserve working functionality.
- Identify the requested milestone.
- Identify affected modules.
- Propose an implementation plan.
- Avoid unnecessary refactoring.
- Confirm whether the request concerns legacy P-204A, real UCI data, PM-01, or the CEO preview; do not merge their truth models accidentally.
- Treat broad blueprint documents as vision unless current code, current-state documentation and an explicit product-owner request authorize implementation.

## During development

- Keep changes milestone-scoped.
- Preserve deterministic simulation behavior unless explicitly instructed otherwise.
- Maintain physical and data consistency.
- Add or update tests.
- Do not silently change established formulas or assumptions.
- Document important architectural decisions.
- Keep Plant Reality, observable industrial systems and UI/intelligence separated.
- Never expose PM-01 hidden ground truth through an observable contract, API, log, serialization or UI.
- Do not describe simulated, illustrative or curated outputs as live production intelligence.
- Keep secrets and local `.env` files out of Git.

## After development

1. Run relevant tests.
2. Run full validation where practical.
3. Verify application behavior.
4. Verify the production build.
5. Update documentation.
6. Update `docs/MILESTONES.md`.
7. Update `docs/CURRENT_STATE.md`.
8. Update `docs/NEXT_STEPS.md`.
9. Update `docs/DECISIONS.md` if an architecture/product decision changed.
10. Update `docs/project-state.json`.
11. Commit using a descriptive commit message.

## Conflict protocol

If repository implementation conflicts with documentation:

1. Investigate Git history.
2. Identify which is newer.
3. Report the discrepancy.
4. Do not silently overwrite either interpretation.

If product intent is ambiguous: **ASK THE PRODUCT OWNER.** Do not invent business requirements.

## Non-negotiable project boundaries

- The physical simulation drives production, OEE and energy; KPI values do not drive physical state.
- Identical PM-01 seed/configuration/commands must replay identically.
- PM-01 UI consumes observable contracts, not Plant Reality.
- Hidden simulator ground truth stays isolated and server-only.
- The legacy P-204A replay and PM-01 are separate simulation architectures.
- Other-industry visuals are not operational twins until their models and observable projections exist.
- Production connectors, AI, authentication and write-back must never be implied by preview UI.

**The repository and its documentation are the authoritative PlantMind project memory.**

