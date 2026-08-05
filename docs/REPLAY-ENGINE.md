# Replay Engine Guide

The Sprint 1 replay engine remains unchanged and backward compatible.

The Executive Dashboard reads `ReplayState` from the existing `ScenarioProvider` and derives a snapshot through the pure `buildCommandSnapshot` adapter. It does not create a second clock, timer, store, or persistence mechanism. Stage jumps and replay controls update the Dashboard through the same provider used by every existing route.

Determinism rule: equal replay state produces equal dashboard measurements, source labels, availability states, and priority copy. Wall-clock values are not used for business display.
