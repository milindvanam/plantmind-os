# PlantMind OS — Sprint 1 Implementation and Completion Report

Status: complete and ready for founder review. This document covers Sprint 1 only. The approved architecture documents in the repository root remain unchanged and govern future work.

## 1. Implementation summary

Sprint 1 establishes one deployable Next.js 16 application, one PostgreSQL database, an industrial design system, a shared application shell, exactly six primary product routes, and one deterministic eight-hour P-204A pump-degradation replay. All industrial records are synthetic and visibly labelled. Later-sprint AI, analysis, financial, workflow, integration, knowledge-graph, and digital-twin capabilities are not implemented.

Architecture decisions applied:

- A modular monolith: one Next.js App Router application and one PostgreSQL database.
- Server Components remain the default; client boundaries are limited to shell navigation, theme, and scenario interaction.
- PostgreSQL access uses `postgres` and Drizzle without a service layer, queue, cache, event bus, or microservice.
- Replay logic is pure and deterministic. UI components consume state; they do not contain scenario business values.
- Browser local storage preserves replay continuity if PostgreSQL is unavailable. The server endpoint persists validated snapshots and audit events when PostgreSQL is available.
- The route compositions are honest foundations, not fake finished features. They state what is deferred.

## 2. Local setup

Prerequisites:

- Node.js 24 or newer
- npm
- Docker Desktop (recommended) or PostgreSQL 17 compatible server

From the repository root:

```powershell
npm.cmd install
docker compose up -d
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run db:check
npm.cmd run dev
```

Open `http://localhost:3000`. The root redirects to `/command`.

### Environment variables

Copy `.env.example` to `.env.local` only when overriding defaults.

| Variable | Required | Purpose | Local default |
|---|---:|---|---|
| `DATABASE_URL` | No | PostgreSQL connection used by runtime and scripts | `postgres://plantmind:plantmind@localhost:5432/plantmind` |
| `LOG_LEVEL` | No | Structured application logging threshold | `info` |
| `NEXT_PUBLIC_APP_NAME` | No | Public display metadata reserved for configuration | `PlantMind OS` |
| `NEXT_PUBLIC_SCENARIO_LABEL` | No | Public demo truth label reserved for configuration | `SIMULATED REPLAY` |

No live-system credentials, model keys, CMMS endpoints, or industrial connectors are required or supported.

## 3. Database, migration, and seed

Start PostgreSQL with `docker compose up -d`. The compose service exposes local port 5432 and uses a named Docker volume.

Commands:

```powershell
npm.cmd run db:generate  # generate a migration after an approved schema change
npm.cmd run db:migrate   # apply checked-in migrations
npm.cmd run db:seed      # idempotently load deterministic synthetic data
npm.cmd run db:check     # assert canonical fixture counts
```

The checked-in migration is `drizzle/0000_tense_fenris.sql`. The schema intentionally contains only 15 prototype tables:

- Tenant, Site, ProductionArea
- AssetType, Asset
- Sensor, SensorReading
- OperationalMetric
- Scenario, ScenarioStage, ScenarioState
- User, Role
- AuditEvent
- SourceRecord (minimal maintenance-history provenance)

Relationships carry tenant/site context, foreign keys, timestamps, expected query indexes, uniqueness constraints, and explicit simulated flags where relevant. Sprint 1 deliberately omits partitioning, time-series extensions, row-level security, multi-region topology, event sourcing, and data-lake abstractions.

The seed creates one enterprise, one plant, one production area, one P-204A pump, seven sensors, 679 five-minute readings, 97 operating metrics, six stages, one demo user/role, two maintenance records, and a fixture audit event. Re-running the seed does not duplicate those records.

## 4. Scenario replay

The canonical replay begins at `2026-03-17 06:00 UTC`, lasts 480 simulated minutes, and progresses through:

| Stage | Start minute | Meaning |
|---|---:|---|
| Normal | 0 | Stable simulated baseline |
| Degradation | 120 | Controlled measurement drift begins |
| Warning | 240 | Replayed values move outside operating bands |
| Critical | 330 | Highest-risk scenario state |
| Intervention | 390 | Planned operator intervention represented |
| Recovery | 450 | Values return toward baseline |

Controls support start, pause, resume, restart, reset, stage jump, and 1×/4×/12×/24× replay speed. The scenario clock, stage, and sample values come from `src/lib/scenario.ts`. Equal elapsed minutes always yield equal values and labels. Sprint 1 does not infer anomalies, causes, impact, recommendations, or outcomes from these values.

State is written immediately to local storage and, after interaction settles, to `PUT /api/scenario-state`. The endpoint validates its payload, upserts the single scenario state, and appends an audit event in one transaction. If PostgreSQL is unavailable, the API returns an explicit 503 while browser-local replay remains usable.

## 5. Route map

There are exactly six primary routes:

| Route | Label | Sprint 1 composition |
|---|---|---|
| `/command` | Executive Command | Decision-first replay context, KPI shells, trust posture, six-step journey |
| `/operations` | Plant Operations | Process-path context, operating metrics, source table |
| `/assets/P-204A` | Asset Intelligence | Asset identity, replay snapshot, evidence/deferred-analysis boundary |
| `/investigations/INV-204` | Copilot Investigation | Governed investigation structure and safe Copilot empty state |
| `/executives/INV-204` | Executive Briefs | Structurally distinct Maintenance and Operations mandate shells |
| `/interventions/ACT-204` | Approval & Outcome | Read-only proposal and governance foundations with disabled controls |

`/` is redirect-only. `/api/scenario-state` is an internal route handler, not a product route.

## 6. Design tokens and themes

Tokens live in `src/app/globals.css` and cover:

- Background and three-level surface hierarchy
- Text, muted text, and borders
- Accent, info, warning, critical, and executive-violet semantics
- Severity/asset/recovery, evidence, confidence, audit, AI, and simulated-data treatments
- Focus ring, disabled opacity, skeleton animation, elevation, and three radii
- Desktop, tablet, and mobile layout behavior at 1100, 820, and 520 pixels

Dark command-centre is the default. Light mode is user-selectable and persisted locally. Text labels, icons, borders, and shape accompany state colours. Forced-colour and reduced-motion media queries are included.

## 7. Shared-component inventory

Implemented foundations include Button, IconButton, Input, Select, Textarea, Badge, StatusIndicator, SeverityIndicator, ConfidenceIndicator, EvidenceIndicator, Card, KpiCard, Panel, Drawer, Dialog, Tooltip, Tabs, TableShell, Skeleton, EmptyState, ErrorState, Alert, Breadcrumb, PageHeader, SectionHeader, theme switcher, scenario badge/controls, simulated-data label, audit label, sidebar navigation, global notification indicator, and shared loading/error/not-found route states.

Components expose native accessible semantics, keyboard focus, explicit labels, and non-colour state text. Route-specific finished business widgets are deferred.

## 8. Testing and verification

Commands:

```powershell
npm.cmd run format
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
$env:RUN_DB_TESTS='1'; npm.cmd run test:integration
npm.cmd run test:e2e
npm.cmd run build
```

Coverage added:

- Pure deterministic stage, timestamp, clamping, and sample behavior
- Start, pause, resume, reset, jump, and speed controls
- Shared component variants and accessibility-critical semantics
- PostgreSQL fixture counts against a migrated/seeded database
- Six-route availability, shared shell, simulated-data labels, navigation
- Responsive mobile navigation and light-theme interaction
- Empty and error-state foundations

Final results:

- Format: pass
- ESLint: pass
- TypeScript: pass
- Unit tests: 10 passed; database test intentionally skipped in the default unit command
- Database integration: 1 passed with `RUN_DB_TESTS=1`
- Playwright E2E: 10 passed in Chromium
- Production build: pass; all six product routes statically generated and the persistence API server-rendered on demand

## 9. Files created and modified

Created: project/tooling configuration; `compose.yaml`; Drizzle schema, repository, migration, and scripts; application shell and shared UI; scenario engine/provider/controls; five new route pages plus the Command page; route loading/error/not-found states; unit/integration/E2E tests; and this report.

Modified: `package.json`, lockfile, `next.config.ts`, root layout/page, global styles, environment validation, README, and generated `AGENTS.md`. The three approved blueprint documents were not modified.

## 10. Review-ready screens and states

Ready for founder review:

- Six-route desktop journey
- Mobile navigation at 390 px
- Dark and light themes
- Normal, degradation, warning, critical, intervention, and recovery stage display
- Start/pause/resume/restart/reset/jump/speed controls
- Loading, empty, error, disabled, simulated-data, confidence, evidence, and audit treatments
- Explicit AI-disabled and workflow-disabled foundations

## 11. Known limitations and technical debt

- Authentication and persona switching are fixed demo context; permissions currently shape navigation copy, not server authorization.
- Replay state uses local storage as the responsive client source and PostgreSQL as best-effort snapshot persistence; there is no cross-browser synchronization.
- The API records settled state snapshots, not every 250 ms replay tick. This is intentional to avoid noisy writes.
- Route data is composed from the deterministic in-memory replay model; pages do not yet query sensor readings from PostgreSQL.
- Visual regression snapshots and automated WCAG scanning are not included; semantic and interaction coverage is present.
- Docker is a local developer dependency, not deployment infrastructure.
- npm production audit reports zero vulnerabilities. The full audit reports four moderate transitive advisories in Drizzle Kit development tooling; npm proposes a breaking downgrade, so no unsafe forced change was applied.

## 12. Deferred capabilities

Deferred pending explicit founder authorization: model/LLM integration, Copilot tools and answers, AI executive content, anomaly and severity calculations, root-cause hypotheses, evidence citation resolver, operational/financial impact, recommendations, approval/revision/rejection state machine, simulated CMMS submission, digital twin, knowledge graph, live connectors, background agents, queues, caches, vector databases, observability platforms, enterprise authentication/SSO, and hosting/deployment.

## 13. Recommended Sprint 2 starting point

Begin with the deterministic evidence layer, not AI: query the seeded PostgreSQL readings into the Asset route, introduce versioned threshold/anomaly rules with golden tests, and make Command/Operations/Asset consume one server-generated scenario snapshot. Preserve the current truth labels and replay contract. Do not add a model until deterministic findings, evidence resolution, and citation validation are approved.

Sprint 1 stops here and awaits explicit founder approval.
