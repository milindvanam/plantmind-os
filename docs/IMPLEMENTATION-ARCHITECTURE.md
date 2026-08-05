# Implementation Architecture

## Current shape

PlantMind OS remains a modular monolith: one Next.js App Router application and one PostgreSQL database. Sprint 1 is locked at `v0.1-foundation`.

Sprint 2 Milestone 1 adds a Command feature module without changing routes, schema, dependencies, replay contracts, or shell behavior:

```text
ScenarioProvider
  -> ReplayState
    -> buildCommandSnapshot (pure deterministic adapter)
      -> ExecutiveDashboard
        -> CommandHero
        -> ExecutiveKPIGrid / ExecutiveKPICard
        -> PriorityRiskCard
        -> ImpactRangeCard
        -> OperationsHeadBriefCard
        -> ActionStatusTimeline
        -> TrustStrip
```

`buildCommandSnapshot` is the anti-corruption boundary between replay state and executive presentation. It may expose raw replay measurements and configured stage truth. It must not invent anomaly, impact, confidence, evidence, AI, workflow, or authorization outputs.

## Compatibility rules

- Six primary routes remain unchanged.
- Sprint 1 schema and migration remain unchanged.
- Shared shell, tokens, provider, replay engine, and persistence remain the baseline.
- New Command CSS extends existing semantic tokens.
- Missing dependent results are `null`/unavailable, never zero or Normal.
