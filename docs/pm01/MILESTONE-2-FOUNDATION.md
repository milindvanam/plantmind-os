# PM-01 Milestone 2 — Deterministic Foundation

## Scope

Milestone 2 establishes contracts and pure domain foundations only. It does not add a PM-01 route, factory UI, persistence, physical/process equations, SCADA, historian, HX-301 fouling, PlantMind inference or ground-truth inspector.

The existing CEO preview, P-204A deterministic replay and UCI real-data experience remain unchanged.

## Domain boundaries

PM-01 is independent of `src/lib/scenario.ts` and `ScenarioProvider`.

- `contracts/` contains types that may cross a domain boundary.
- `plant-reality/` contains the deterministic simulator foundation.
- `plant-reality/state/ground-truth.ts` is explicitly marked `server-only`.
- Observable and future PlantMind/UI modules are prohibited by ESLint from importing hidden plant-reality state.
- Architecture tests scan for hidden-field leakage, legacy replay coupling and nondeterministic APIs.

Database-role and schema isolation is intentionally scheduled for the approved storage/replay milestone. The current milestone creates no ground-truth endpoint, serialized ground-truth object or database record.

## Asset registry

`asset-registry.ts` defines the PM-01 site, eight process areas and the v0.1 equipment hierarchy. Every asset has a typed ID, name, type, parent, area, optional rated capacity and extensible design parameters.

Registry validation fails on duplicate IDs, missing parents and missing equipment-area assignments.

## Tag registry

`tag-registry.ts` defines 82 v0.1 tags across the reactor, heat exchanger, cooling valve, circulation pumps, cooling tower, boiler, packaging, material tanks, feed mixer, separator, filter, dryer and compressor.

Tag definitions distinguish metadata from observable values. Values later projected to industrial systems will carry a simulation timestamp and one of `GOOD`, `UNCERTAIN`, `BAD` or `STALE`.

Registry validation fails on duplicate IDs, unknown assets and invalid sampling intervals.

## Deterministic random streams

`createDeterministicRng(seed, namespace)` creates an independent pseudo-random stream for a subsystem or asset. Equal seed and namespace reproduce equal output. Different namespaces prevent a later change in one asset's sampling from shifting every other asset's stream.

This generator is for simulation only and is not cryptographically secure.

## Simulation clock

The clock uses integer ticks and a configurable positive whole-second step. The v0.1 baseline uses ten simulated seconds per tick.

It derives:

- simulated timestamp;
- elapsed simulated time;
- production day;
- PM-01's three operating shifts in `Asia/Kolkata`;
- approved speed: 1×, 10×, 100× or 1000×.

Plant behaviour never reads browser time, `Date.now()` or `new Date()` without an explicit simulation timestamp.

## Run lifecycle

A run contains an immutable configuration, authoritative clock, finite horizon and optimistic version number. Supported commands are play, pause, reset and speed selection. Advancement can occur by exact ticks or by integer real milliseconds with a retained remainder, making the clock invariant to UI polling chunk size.

The healthy baseline configuration is `PM01-HEALTHY-BASELINE` with seed `PM01-BASELINE-001`.

Persistence, concurrent command handling and API route handlers are deferred until the storage/application milestone; no in-memory singleton is introduced because it would be unreliable on Netlify's serverless runtime.
