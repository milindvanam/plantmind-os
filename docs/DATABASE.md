# Database Guide

The current database foundation is documented in `SPRINT-1-IMPLEMENTATION.md` and implemented in `src/db/schema.ts`.

Sprint 2 Milestone 1 makes no schema or migration change. The Executive Dashboard consumes the existing deterministic client replay snapshot. Later evidence, confidence, impact, and AI milestones may require approved schema additions; each must document necessity, migration compatibility, seed impact, rollback, and integration coverage before implementation.

Current migration: `drizzle/0000_tense_fenris.sql`.
