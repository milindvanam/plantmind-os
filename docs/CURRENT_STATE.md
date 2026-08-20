# PlantMind OS Current State

Last repository audit: 2026-08-20 (Asia/Kolkata).

## Current release state

PlantMind is a working multi-experience prototype. Its most advanced physical product area is PM-01: a healthy, deterministic 100 T/day chemical factory simulation connected to process, statistical, 3D operational-twin and 360° panorama views. It is not an MVP/beta for live industrial deployment.

## Repository checkpoint

- Current branch: `main`.
- Audited implementation commit: `05c5803d037f5c1fcee6ff9ca477730ecc2fbd13` (`feat(pm01): add immersive Street View panorama twin`).
- Working tree at audit start: clean.
- Repository: `https://github.com/milindvanam/plantmind-os.git`.
- Documentation commit: recorded in Git history immediately after this file; a commit cannot contain its own final hash.

## Deployment status

- Public site: `https://plantmind-os.netlify.app`.
- Virtual plant: `https://plantmind-os.netlify.app/virtual-plant`.
- The panorama release was verified live before this audit.
- Netlify is connected to GitHub and may automatically rebuild documentation-only commits.
- Netlify build settings, environment variables, analytics and access controls are external and cannot be fully established from repository files.

## Implemented product areas

- Seven-chapter executive overview and CEO vision preview.
- Executive briefing, sector journeys and connector catalogue with truth classification.
- Legacy P-204A deterministic asset replay, executive dashboard and industrial timeline.
- Public UCI hydraulic-data replay with provenance and deterministic prototype assessment.
- PM-01 virtual factory, asset/tag drill-down, production dashboard and visual twin layers.
- Simulated SAP maintenance handoff and curated executive/maintenance AI preview experiences.
- Seven-destination workflow navigation: Overview, Executive Command, Virtual Plant, Plant Operations, Asset Intelligence, Decisions & Actions, and Data & Integrations.
- An eighth sidebar destination opens the PlantMind Knowledge Hub at `/knowledgehub` in a new tab. Its Docusaurus static build is packaged into PlantMind OS, preserving the main portal tab, Hub navigation and local search without sending users to another domain.
- Executive Briefing/Live Command and Investigation/Approval/Executive Outcome remain separate routes presented as internal workspace views. Industry Solutions is available from Overview.
- The shared product header provides persistent A/A+/A++ interface text sizing for navigation, enterprise/header context and workspace tabs.

## Implemented plant simulation

- Fixed-step deterministic clock and run lifecycle.
- Typed asset hierarchy and 82-tag registry.
- Receiving-to-dispatch material flow with explicit capacities and recovery losses.
- Material balance, inventories, WIP, finished goods, packaging and dispatch.
- Deterministic batches, raw-material lot consumption and provisional quality state.
- Daily/shift targets, actuals, rate, variance, utilization and EOD run-rate projection.
- Derived Availability, Performance, Quality and OEE.
- Load-responsive electricity, steam, cooling and compressed-air use, plus energy/T.
- Five-minute in-memory production/energy histories.

## Implemented dashboards and visualizations

- Executive command dashboard and industrial timeline for P-204A.
- PM-01 diagrammatic process and statistical views.
- Industry selector for chemical, MSME manufacturing, clean-tech EPC/bulk handling, dairy and sugar landscapes.
- Interactive 3D views; the chemical model is connected to observable state/history.
- Seven-stop chemical panorama tour with direct drag, wheel zoom, linked movement and an observable equipment hotspot.

## Implemented AI/intelligence features

Only curated deterministic preview experiences are implemented. There is no live LLM/agent runtime, production ML inference, evidence engine, confidence engine, autonomous workflow or certified industrial diagnosis. The PM-01 UI explicitly keeps PlantMind Intelligence inactive.

## Implemented digital-twin features

The chemical PM-01 3D and panorama views consume `Pm01FactoryView`, show observable state and permit equipment inspection. Hidden simulator ground truth is isolated. Dairy, sugar, MSME and clean-tech scenes are illustrative and are not connected digital twins.

## Testing status

The repository contains unit, component, integration, architecture and Playwright E2E suites. Final results for this documentation checkpoint are updated after validation below:

- Format: **FAIL** — five pre-existing tracked application/test files are not Prettier-clean (`globals.css`, three PM-01 UI files and `virtual-factory.spec.ts`). The new JSON file is formatted. No unrelated source formatting was changed.
- Lint: **PASS**.
- Type check: **PASS**.
- Vitest: **PASS** — 19 files passed, 1 skipped; 76 tests passed, 1 skipped.
- Playwright: updated navigation and text-size assertions pass, including persistence after reload. The Playwright process required manual termination after all assertions because its temporary web-server cleanup hung on this Windows host.
- Production build: **PASS** — Next.js compiled, type-checked and generated all 22 pages/routes.

## Known issues and technical debt

- PM-01 state and history are client-local and reset on reload.
- No PM-01 server API, durable run store, historian or multi-user concurrency model exists.
- Quality release and completed-batch `PASS` are placeholders, not LIMS results.
- One opening lot per raw material is used; supplier-lot rotation/genealogy is incomplete.
- Planned operating time equals running simulation time; shutdown calendars are absent.
- Chemistry, capacities, recoveries and energy coefficients require engineering calibration.
- EOD projection is a simple current-rate extrapolation.
- No active failure/degradation scenario, including HX-301 fouling, is wired into PM-01.
- No production authentication, tenancy enforcement or route protection exists.
- No live PLC/DCS/SCADA/historian/MES/LIMS/CMMS/ERP connector or write-back exists.
- Other industry landscapes lack industry-specific physical models and observable twins.
- Panorama imagery is prototype imagery, not calibrated customer 360 photography or photogrammetry.
- External Netlify configuration is not version-controlled.
- Existing older documents describe earlier route counts/milestones and must be read as historical snapshots, not the current total application state.
- Five tracked PM-01 UI/CSS/E2E files pre-date this handover in a non-Prettier-clean state.

## Immediate product state

The repository is ready for another coding agent to understand and continue safely after reading `docs/AGENT_HANDOVER.md`. The next product milestone is not authorized by repository evidence.

**PRODUCT OWNER DECISION REQUIRED:** choose the next scoped milestone before implementation.
