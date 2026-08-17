# PM-01 Milestone 4 — Production, Batch & Energy Models

## Scope and boundary

Milestone 4 adds deterministic batch, production, OEE, utility-energy and downsampled history models on top of the Milestone 3 material-flow engine. All calculations remain within Plant Reality. No PM-01 route, UI, observable adapter, SCADA, historian persistence, HX-301 fouling or PlantMind intelligence is introduced.

The integrated `factory-model.ts` advances the Milestone 2 run clock and Milestone 3 process state together. Production, batches and energy are calculated from each physical process transition; none can advance independently.

## Production basis

- Design capacity: 100 T/day
- Daily target: 100 T/day
- Shift target: 33.333 T across each eight-hour shift
- Default batch target: 25 T
- Production actual: newly finished ASC-100 from the finishing stage
- Packaging and dispatch: separately tracked downstream material movements

Using newly finished output prevents opening packaged or finished-goods inventory from being counted as current production.

### Calculations

- Current rate = `last tick finished tonnes / tick seconds × 86,400`
- Target expected by now = `daily target × seconds elapsed in production day / 86,400`
- Target achievement = `day actual / target expected by now`
- Production variance = `day actual − target expected by now`
- Capacity utilization = `cumulative actual / design output expected across elapsed time`
- Projected end of day = `day actual + current physical rate × remaining day fraction`

The projection is null before any defensible operating evidence exists. It is a simple run-rate projection, not a forecast, and later milestones may replace it with a constraint-aware projection.

## Batch model

Batch identifiers are deterministic and scoped to the simulation run, for example `run-id-ASC-0001`. Each batch records:

- planned and actual quantities
- simulated start, expected completion and actual completion timestamps
- raw-material lot identifiers and consumed quantities
- process-constraint snapshot
- calculated yield
- quality placeholder

The default expected cycle is six hours for a 25 T batch at 100 T/day. Raw-material lots currently identify the opening lot for each material. Supplier-lot rotation is deferred.

Batch yield is:

`finished ASC-100 / total recipe material consumed`

The batch ledger consumes the exact feed-preparation material vector from the process transition. Across batches, recorded consumption reconciles to the reduction in receiving plus raw-material storage.

Completed batches receive a provisional `PASS` quality placeholder. No laboratory result or quality prediction is implied; LIMS timing and real release decisions remain future work.

## OEE

OEE is calculated as:

`Availability × Performance × Quality`

- Availability = reactor-active seconds / planned simulation seconds
- Performance = gross finishing input / ideal output during reactor-active seconds, capped at 1.0
- Quality = accepted finished output / gross finishing input
- OEE = product of the three components

Gross finishing input is finished output plus finishing loss. This ensures the quality term and OEE reconcile to physical process loss. No OEE component is a presentation constant.

## Energy model

The healthy energy configuration resolves to approximately 410 kWh-equivalent/T at design load:

- Electricity: 600 kWh/day fixed idle demand plus 175.5 kWh per tonne of reactor output
- Steam: 0.25 T steam per tonne of reactor output
- Steam conversion: 650 kWh-equivalent/T steam
- Cooling: 55 kWh-equivalent per finished tonne
- Compressed air: 100 Nm³ per packaged tonne
- Compressed-air conversion: 0.11 kWh/Nm³

At 100 T/day the components reconcile to the configured 410 kWh-equivalent/T baseline. `createEnergyConfiguration` recalculates variable electricity from a changed baseline or utility assumptions.

Energy responds only to physical state:

- reactor output drives variable electricity and steam
- finished output drives cooling
- packaged output drives compressed air
- elapsed operating time drives fixed electricity

Low-load operation therefore has higher energy per tonne because fixed electricity is divided across fewer finished tonnes. There is no random energy telemetry.

## Histories

Production and energy snapshots are retained every five simulated minutes by default. Samples use simulation timestamps and contain only derived values suitable for later projection into historian or SCADA contracts. No database persistence is added yet.

## Determinism and lifecycle

Factory advance is a pure fixed-step sequence over the simulation clock and material process. Pause prevents physical, production, batch and energy advancement. Reset reconstructs the exact opening state, batch sequence, energy totals and histories. Replaying the same configuration, initial state and command sequence produces equal process, production, batch and energy results.

## Extension points

Later scenarios can alter `Pm01ProcessConstraints` to change feed availability, reactor/separation/finishing capacity, packaging capacity and dispatch demand. Resulting throughput, cycle time, OEE and energy consequences will propagate from the process rather than from KPI overrides.

Additional utility coefficients can be introduced through `Pm01EnergyConfiguration` without coupling the model to UI or PlantMind.

## Assumptions and limitations

- The production model uses a continuous/batch-hybrid campaign abstraction rather than discrete vessel charging and emptying.
- First-batch accounting begins while the initial plant contains steady-state WIP.
- One opening lot per raw material is used; lot depletion and supplier changes are deferred.
- Completed-batch quality is a placeholder, not a simulated LIMS decision.
- Planned time currently equals all running simulation time; planned shutdown calendars are deferred.
- Availability uses reactor activity as the production-train operating signal.
- Performance is evaluated against the 100 T/day design rate, not individual equipment ideal cycles.
- Energy coefficients are credible simulation assumptions, not validated equipment heat and power balances.
- Histories are in-memory immutable snapshots; durable historian storage is deferred.
- The end-of-day projection assumes the latest physical rate persists and does not yet model future inventory exhaustion or scheduled downtime.

These parameters require later chemical/process, production and energy engineering validation. PM-01 is not industrially validated at this milestone.
