# Decision Log

## ADR-S2-001 — Lock Sprint 1 with a release tag

Decision: adopt. Sprint 1 is committed and tagged `v0.1-foundation`; Sprint 2 uses a scoped branch.

## ADR-S2-002 — Executive Dashboard uses a pure snapshot adapter

Decision: adopt. A pure adapter composes existing replay state for presentation. This preserves the replay engine and provides a stable future server-query boundary.

## ADR-S2-003 — Dependent intelligence remains unavailable

Decision: adopt. Impact, evidence quality, confidence, anomaly, Operations Executive interpretation, and workflow status are explicit unavailable/indeterminate states until their approved priority. No placeholder number or prose may appear as a completed result.

## ADR-S2-004 — No schema or dependency change for Milestone 1

Decision: adopt. Current Sprint 1 data and UI primitives are sufficient for the bounded Command composition.
