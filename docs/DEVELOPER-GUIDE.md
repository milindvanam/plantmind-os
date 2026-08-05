# Developer Guide

## Baseline protection

- `v0.1-foundation` is the approved Sprint 1 release.
- Sprint 2 work occurs on scoped branches.
- Do not rename routes, redesign the shell, change schema, or add dependencies without an approved necessity.
- Compare regression behavior against the tagged baseline.

## Required checks

```powershell
npm.cmd run format
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
$env:RUN_DB_TESTS='1'; npm.cmd run test:integration
npm.cmd run test:e2e
npm.cmd run build
npm.cmd audit --omit=dev
npm.cmd audit
```

## Command feature conventions

Keep deterministic mapping in `command-snapshot.ts` and rendering in `executive-dashboard.tsx`. Never calculate impact, evidence quality, confidence, anomaly, or AI content in presentational components. New data must include source, unit, as-of, truth, and availability.
