# API Guide

## Existing route handlers

### `PUT /api/scenario-state`

Persists a validated replay snapshot and an audit event. This Sprint 1 contract is unchanged.

## Executive Dashboard

Milestone 1 introduces no network endpoint. `buildCommandSnapshot(state)` is an internal pure query adapter that returns:

- replay truth, stage, status, and as-of time;
- four raw/context KPI records with units and provenance;
- one priority asset context;
- explicit unavailable contracts for impact and AI brief;
- indeterminate/not-scored trust contracts;
- current non-governed action status.

When later server query work is authorized, the approved dashboard API must preserve these unavailable/null semantics and safe error codes (`RUN_NOT_FOUND`, `SNAPSHOT_INCOMPLETE`).
