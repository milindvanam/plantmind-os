# Decision Log

## ADR-S2-001 — Lock Sprint 1 with a release tag

Decision: adopt. Sprint 1 is committed and tagged `v0.1-foundation`; Sprint 2 uses a scoped branch.

## ADR-S2-002 — Executive Dashboard uses a pure snapshot adapter

Decision: adopt. A pure adapter composes existing replay state for presentation. This preserves the replay engine and provides a stable future server-query boundary.

## ADR-S2-003 — Dependent intelligence remains unavailable

Decision: adopt. Impact, evidence quality, confidence, anomaly, Operations Executive interpretation, and workflow status are explicit unavailable/indeterminate states until their approved priority. No placeholder number or prose may appear as a completed result.

## ADR-S2-004 — No schema or dependency change for Milestone 1

Decision: adopt. Current Sprint 1 data and UI primitives are sufficient for the bounded Command composition.

## ADR-S2-005 — Place the Industrial Timeline on Asset Intelligence

Decision: adopt. The approved journey introduces the anomaly timeline while inspecting P-204A, so the visualization extends `/assets/P-204A` without adding or renaming a route.

## ADR-S2-006 — Visualize replay truth without analytical claims

Decision: adopt. The timeline displays deterministic samples and configured stage anchors only. Display domains are viewport scales, not operating limits. Anomaly, diagnosis, evidence quality, confidence, and AI interpretation remain unavailable until their scheduled priorities.

## ADR-S2-007 — Mandatory Founder Review visual gate

Decision: adopt. Every milestone ends with a successful build, a running local development URL, Chromium route and interaction verification, desktop/mobile and dark/light screenshots, explicit loading/empty/error/disabled review captures, recorded test results, and a Founder Review Report. Product work stops until explicit founder approval.

Review-state query parameters are development-only, reuse approved Dashboard compositions, and resolve to ready outside development. They do not create a product route or production capability.
