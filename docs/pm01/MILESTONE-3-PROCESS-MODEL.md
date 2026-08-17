# PM-01 Milestone 3 — Deterministic Factory Process & Material Flow

## Scope

Milestone 3 implements the simulator-owned physical material journey for ASC-100. It adds no route, UI, observable-system adapter, PlantMind inference, batch model, OEE model, energy model, historian or degradation scenario.

The process path is:

1. Raw-material receiving
2. Raw-material storage
3. Feed preparation
4. Reaction
5. Separation
6. Finishing
7. Intermediate-product storage
8. Quality release into released-product storage
9. Packaging
10. Finished-goods storage
11. Dispatch

The quality-release transfer is currently a deterministic physical routing step. Per-batch laboratory state and release decisions are deferred to Milestone 4.

## Architectural boundary

The contracts in `src/features/pm01/contracts/material.ts` define material identities, process-stage identities and immutable process-state shapes. They contain no hidden degradation variables.

The implementation in `src/features/pm01/plant-reality/` owns material transformations and inventories. It does not import or expose `Pm01GroundTruth`, and no observable-system or PlantMind module was added. Existing ESLint boundaries continue to prevent future PM-01 UI and PlantMind modules from importing Plant Reality directly.

## Material model

Every inventory uses a typed material vector containing:

- RM-A
- RM-B
- RM-C
- catalyst
- process water
- ASC-100

The initial ASC-100 recipe basis is configurable in code and follows the authoritative specification for RM-A (0.62 T/T), RM-B (0.28 T/T), RM-C (0.12 T/T) and catalyst (0.015 T/T). Process water is initially assumed at 0.08 T/T pending engineering calibration.

Reaction, separation and finishing have explicit recovery factors. All rejected mass is accumulated as process loss. Transformation changes material identity from recipe components to ASC-100 while conserving total mass between output and process loss.

## Mass balance

The ledger records only four top-level quantities:

- opening inventory
- explicit external receipts
- dispatched material
- defined process loss

At any simulation point:

`opening inventory + receipts = current inventory + dispatch + process loss`

`calculateMaterialBalance` validates this invariant within a numerical tolerance. Material can enter after initialization only through `receiveMaterial`; stage transfers are bounded by upstream inventory and downstream capacity.

## Process-derived throughput

The nominal process basis is the configured 100 T/day plant capacity. Actual movement is constrained at every step by:

- upstream material availability
- downstream storage capacity
- equipment/stage capacity
- packaging's 5 T/hour nameplate capacity
- process recovery
- externally supplied physical constraint factors

Dispatch therefore draws only from finished-goods inventory. It is not an arbitrary production counter. A constrained reactor eventually drains downstream buffers and reduces dispatch.

The constraint interface is the planned extension seam for later equipment degradation and utility limitations. Milestone 3 provides neutral healthy values only; it does not implement HX-301 fouling or any PlantMind logic.

## Determinism and replay

The process engine is a pure immutable state transition driven only by:

- the prior process state
- elapsed simulation seconds
- explicit constraint inputs

It uses no browser time, wall clock or random values. The same initial state and tick sequence produces an exactly equal result. `advanceProcessByTicks` aligns the process model with the Milestone 2 fixed-step simulation clock.

## Assumptions requiring later engineering validation

- The fictional chemistry is represented by bulk mass and recovery factors, not molecular stoichiometry.
- Process water is 0.08 T per recipe basis tonne.
- Reaction recovery is 89%; separation recovery is 99.5%; finishing recovery is 99.8%.
- Initial inventories and WIP represent a plant already in steady operation.
- Quality release is immediate in this milestone.
- Recycling, rework, effluent composition, evaporation and solvent recovery are represented only as aggregated process loss.
- Capacity and residence-time parameters are simulation assumptions, not validated equipment design data.

These assumptions are isolated as model parameters so later process-engineering calibration does not require UI or PlantMind changes.

## Milestone 4 integration

Milestone 4 should derive batches, production actuals, target variance, yield, OEE and energy from process-state transitions and ledger deltas. It must not replace the material ledger with counters or make KPIs drive physical state.
