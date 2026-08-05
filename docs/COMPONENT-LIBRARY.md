# Component Library

Sprint 1 primitives remain the shared component baseline.

## Sprint 2 Milestone 1 compositions

| Component | Purpose | States |
|---|---|---|
| `ExecutiveDashboard` | Command route composition | ready, loading, empty, error, disabled/restricted |
| `CommandHero` | One priority, truth, as-of, decision and replay state | active or no-risk |
| `ExecutiveKPICard` | Value, unit, detail, source and as-of | semantic replay state |
| `PriorityRiskCard` | One focus asset and bounded replay interpretation | active or empty |
| `ImpactRangeCard` | Impact dependency boundary | unavailable or permission-restricted |
| `OperationsHeadBriefCard` | Future brief schema boundary | not generated |
| `ActionStatusTimeline` | Accountable decision path | complete/pending steps |
| `TrustStrip` | Evidence, confidence, audit, and control limits | indeterminate/not-scored/traceable/read-only |

All compositions reuse Sprint 1 tokens and primitives. They introduce no new component dependency.

## Sprint 2 Milestone 2 compositions

| Component | Purpose | States |
|---|---|---|
| `IndustrialTimeline` | Source-linked eight-hour replay history | ready, loading, empty, error, disabled |
| `SignalLane` | One measurement, unit, source, domain, trace and cursor | vibration, temperature, flow |
| `TimelineTrustStrip` | Audit, source count, evidence, confidence and read-only boundaries | traceable/indeterminate/not-scored/read-only |

The visualization uses native semantic HTML, CSS, and SVG chart primitives. No chart dependency or duplicate design system was introduced.
