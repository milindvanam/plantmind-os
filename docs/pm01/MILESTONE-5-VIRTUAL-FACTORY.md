# PM-01 Milestone 5 — Virtual Factory Visualization

## Route and purpose

Milestone 5 adds `/virtual-plant`, labelled **Virtual Plant** in the primary navigation. The existing CEO Preview route and narrative remain unchanged.

The route presents PM-01 as a premium industrial control-room view rather than a generic dashboard. The process topology preserves the complete physical journey:

`Receiving → Tank farm → Feed preparation → Reaction → Separation → Finishing → Quality release → Packaging → Finished goods → Dispatch`

The reaction thermal loop identifies HX-301, CV-301 and circulation pumps P-301A/B. A separate utility bus connects electricity, steam, cooling water and compressed air.

## Visual composition

The desktop view contains:

1. PM-01 simulation identity, timestamp, production day and shift
2. Play, pause, reset and 1×/10×/100×/1000× controls
3. Compact live KPI rail
4. Prominent target-versus-actual production strip
5. Connected process topology with equipment, WIP and rates
6. Reaction thermal-loop and utility connections
7. Raw-material inventory utilization
8. Active/recent batch information and material lots
9. OEE decomposition
10. An intentionally inactive PlantMind Intelligence area

Material-flow particles animate only while both the simulation and the relevant process transition are active. UI animation remains at a restrained fixed visual speed; simulation acceleration changes model advancement, not animation speed. Reduced-motion preferences disable movement.

On compact screens the process topology retains its horizontal industrial layout inside a dedicated scroll viewport instead of collapsing into unrelated cards. Other information reorganizes responsively without creating page-level horizontal overflow.

## Data flow and boundaries

The UI does not import Plant Reality.

Data passes through:

`Plant Reality factory state → observable factory projection → application simulation controller → visualization UI`

- `factory-projection.ts` converts factory state into the explicit `Pm01FactoryView` contract.
- `use-factory-simulation.ts` owns client-side lifecycle commands and the 250 ms UI refresh cadence.
- `virtual-factory.tsx` renders only the safe projected view.

Architecture tests verify that the UI has no Plant Reality import and that neither projection nor controller references ground truth. The projected object is also serialized in tests and checked against every hidden field name.

No hidden fouling, bearing health, valve stiction, filter loading, raw-material reactivity or sensor bias is present in the visualization contract.

## KPI provenance

All displayed values originate in Milestones 3–4:

- Production, target achievement, expected output, variance, rate, capacity utilization and projection come from `Pm01ProductionMetrics`.
- Availability, performance, quality and OEE come from the derived OEE model.
- Energy/T and utility totals come from `Pm01EnergyState`.
- Raw inventories combine receiving and raw-material storage material vectors.
- Stage inventory and throughput use process-stage state and last physical transition quantities.
- Batch values come from deterministic batch records.

The visualization contains no independent KPI timers, random telemetry or hard-coded production figures.

## Observable asset drill-down

Clicking a significant process node, thermal-loop asset or utility opens an asset drawer. It contains:

- asset ID, name, type, area and operational state
- rated capacity and design parameters where configured
- current observable tag values and engineering units
- normal, warning and alarm ranges where configured
- tag quality

Current visualization values are deterministic observable projections of the healthy process state. They are not yet persisted historian or full SCADA measurements; those belong to Milestone 6.

HX-301 normal detail deliberately contains no fouling index or simulator-only condition.

## Status model

The view uses four conventional operating states:

- Green: normal
- Amber: warning
- Red: critical/alarm
- Grey: offline

Status is evaluated from observable values and configured operating bands. No PlantMind-specific status is created. The healthy baseline remains normal because its observable measurements are within configured limits.

## Lifecycle behavior

- Play advances the integrated factory model.
- Pause stops model advancement and material-flow animation.
- Reset reconstructs the exact deterministic opening state.
- Speed changes use the approved simulation speeds.
- UI refresh remains independent of fixed simulation ticks.

At 1000×, a short real-time run visibly consumes raw material, moves WIP, increases finished production and utility totals, updates batch progress and maintains production near 99.8 T/day.

## Files introduced

- `src/app/virtual-plant/page.tsx`
- `src/features/pm01/contracts/visualization.ts`
- `src/features/pm01/observable/factory-projection.ts`
- `src/features/pm01/application/use-factory-simulation.ts`
- `src/features/pm01/ui/virtual-factory.tsx`
- `tests/unit/pm01/factory-projection.test.ts`
- `tests/unit/pm01/virtual-factory.test.tsx`
- `tests/e2e/virtual-factory.spec.ts`

The application shell and global stylesheet are extended for the new route and navigation entry.

## Known limitations

- Observable tag projection is a healthy-state visualization adapter, not the Milestone 6 SCADA/historian implementation.
- Process topology uses restrained symbolic equipment rather than detailed P&ID symbols.
- Secondary equipment is available through drill-down rather than displayed at equal prominence.
- The process map scrolls horizontally on narrower presentation widths to preserve topology.
- Histories and trends are not shown yet.
- Quality remains the Milestone 4 placeholder.
- No alarm event stream exists until SCADA work.
- The simulation is client-local and resets on page reload.
- No PlantMind intelligence, HX-301 fouling or maintenance/enterprise-system functionality is included.
