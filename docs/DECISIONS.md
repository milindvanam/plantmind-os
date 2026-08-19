# Architecture and Product Decision Log

## D-001 — Modular Next.js monolith

### Decision
Use one Next.js App Router application with feature modules and a PostgreSQL/Drizzle foundation.

### Reason
The implementation provides one deployable prototype while preserving module boundaries and a simple local setup.

### Impact
Do not introduce services, brokers or separate frontends without an approved architectural need. PM-01 persistence is not implied by the legacy database schema.

### Status
Active.

## D-002 — Deterministic replay and fixed simulation time

### Decision
Drive Plant Reality with integer fixed ticks, explicit elapsed time, immutable state and seeded namespaced RNG; forbid wall-clock/random APIs inside the simulation foundation.

### Reason
Identical configuration and commands must reproduce identical physical and KPI results.

### Impact
New faults, assets and utilities must preserve replay invariance. UI refresh timing must not become plant time.

### Status
Active.

## D-003 — Separate PM-01 from legacy P-204A

### Decision
PM-01 does not import the P-204A `ScenarioProvider` or scenario fixture.

### Reason
PM-01 is a new plant/process simulation with different contracts and timescales.

### Impact
Do not reuse legacy replay state as PM-01 physical state. Shared concepts require explicit neutral contracts.

### Status
Active.

## D-004 — Isolate Plant Reality, observable systems and UI

### Decision
Keep hidden ground truth server-only; expose factory information through `projectFactoryView` and `Pm01FactoryView`; prevent UI/observable imports of hidden state.

### Reason
Simulation truth must not leak into what SCADA, operators or PlantMind could legitimately observe.

### Impact
Every new UI/twin/intelligence feature must consume an observable contract. Extend architecture tests when hidden fields or projections change.

### Status
Active.

## D-005 — Derive production from physical flow

### Decision
Count newly finished ASC-100 as production and keep packaging/dispatch as downstream movements.

### Reason
Independent KPI counters would drift from inventories and material balance.

### Impact
Faults and constraints must alter process flow; KPIs then change through derived calculations.

### Status
Active.

## D-006 — Explicit bulk material balance

### Decision
Reconcile opening inventory plus receipts with current inventory, dispatch and defined losses.

### Reason
The simulation requires auditable physical consistency despite simplified chemistry.

### Impact
New recycle, waste, rework or by-product paths must be represented in the ledger rather than disappearing mass.

### Status
Active.

## D-007 — OEE components are derived

### Decision
Calculate Availability from reactor-active/planned time, Performance from gross finishing input versus ideal active-time output, and Quality from accepted versus gross finishing input.

### Reason
OEE must reconcile to operating and loss state, not presentation constants.

### Impact
Changing planned-time calendars, quality release or equipment ideal cycles requires an explicit documented formula decision and updated tests.

### Status
Active; engineering calibration needed.

## D-008 — Energy follows load

### Decision
Tie fixed electricity to elapsed operation, variable electricity/steam to reactor output, cooling to finished output and compressed air to packaging.

### Reason
Energy/T should respond to physical load and expose fixed-load penalties.

### Impact
Do not generate random utility KPIs or override energy intensity in the UI. Coefficients require future engineering validation.

### Status
Active; calibration needed.

## D-009 — Continuous/batch hybrid

### Decision
Use continuous material transitions while accumulating deterministic 25 T production batches and lot consumption.

### Reason
This supports batch identity and reconciliation without a vessel scheduling model.

### Impact
The current batch model is not a detailed recipe-execution or MES model. Discrete charge/hold/discharge behavior requires a separate approved extension.

### Status
Active.

## D-010 — Healthy baseline before failure scenarios

### Decision
Implement the physically consistent healthy ASC-100 baseline and extension constraints before adding HX-301 fouling or other degradation.

### Reason
Failure consequences need a stable, testable reference model.

### Impact
Hidden failure fields exist only as isolated types. Do not expose or activate them without a scoped milestone.

### Status
Active.

## D-011 — Client-local PM-01 state

### Decision
Run PM-01 in the browser and retain only bounded observable history in the current session.

### Reason
The visualization milestone required responsive deterministic interaction without introducing unreliable serverless singletons or premature storage.

### Impact
Reload resets the factory. Multi-user runs, durable replay and historian queries require an approved persistence architecture.

### Status
Active for prototype.

## D-012 — Multi-layer virtual plant visualization

### Decision
Offer diagrammatic process, interactive 3D, site-tour/panorama and statistical views; connect only the chemical PM-01 visuals to `Pm01FactoryView`.

### Reason
Different users need topology, spatial understanding and metrics while maintaining the data boundary.

### Impact
Do not label other industry scenes as operational twins until they have their own physical model and observable projection. Prototype imagery must not be represented as a customer site scan.

### Status
Active.

## D-013 — GitHub `main` to Netlify

### Decision
Use the existing GitHub repository and `main` branch as the source for the Netlify application.

### Reason
This is the established repository/deployment workflow evidenced by remote configuration and the live site.

### Impact
Documentation commits may trigger deployment. External Netlify settings are not version-controlled and must be checked in the platform when changed.

### Status
Active.

