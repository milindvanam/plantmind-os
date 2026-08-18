# PM-01 Milestone 6 — Connected Operational Digital Twin

## Scope

The PM-01 chemical 3D plant is connected to the existing observable factory projection. The twin
renders operating state, material throughput, equipment tags, KPI overlays and bounded observable
history. Other industry landscapes remain illustrative until they receive their own deterministic
Plant Reality models and observable projections.

## Data boundary

```text
Plant Reality -> observable/factory-projection -> Pm01FactoryView -> 3D twin
```

The 3D component accepts only `Pm01FactoryView`. It does not import Plant Reality, hidden scenario
state or ground-truth types. Replay stores at most 120 projected view snapshots and therefore cannot
reveal values that were not already observable at the corresponding simulation time.

## Connected behavior

- Equipment is mapped to process nodes and significant assets.
- Beacons and flow animation respond to observable operating state and throughput.
- Selecting equipment exposes its observable asset identity, status, throughput and configured tags.
- Recent projected tag values are rendered as compact trends.
- The history control switches between the latest view and prior observable snapshots.
- The existing asset record remains the detailed source for tag ranges and data-quality context.

## Explicit limitations

- PM-01 currently models only the healthy ASC-100 chemical process.
- Dairy, sugar, MSME and clean-tech scenes are geometry demonstrations, not connected twins.
- History is in-memory and limited to the current browser session.
- No inference, anomaly detection, failure prediction or PlantMind recommendation is introduced.
- Hidden simulation ground truth remains inaccessible to the visualization layer.

## Next extension points

Persist observable history in a historian adapter, introduce event/alarm overlays, add batch genealogy
and maintenance context, and later connect scenario-driven faults through the physical model and
observable sensors rather than directly manipulating the visualization.
