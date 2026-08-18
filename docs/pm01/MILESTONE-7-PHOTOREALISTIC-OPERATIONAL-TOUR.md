# PM-01 Milestone 7 — Photorealistic Operational Tour

## Outcome

The Site Imagery view now provides a guided, floor-oriented plant journey rather than a static
photograph. The route follows material from receiving and storage through production, final QC,
packaging, finished-goods warehousing and the loading/unloading dock.

## Tour experience

- Seven named viewpoints with smooth zoom and position transitions.
- Previous, next, reset and direct route navigation.
- A prominent **Take a Tour** control with automatic progression and pause/resume.
- A forward movement cue showing the next physical destination.
- Full-screen operation through the existing Virtual Factory visual-stage control.
- Industry-specific imagery and route labels.

## Connected PM-01 context

For the Chemical Industry PM-01 model, each tour stop maps to an observable process node and a
significant asset where one exists. The equipment panel displays current status, throughput,
material held and configured tag values. Detailed asset records remain available from the same
panel.

The view receives only `Pm01FactoryView`; it cannot access Plant Reality state or simulation ground
truth. Other industries are explicitly labelled as illustrative until their own deterministic
models and observable projections are implemented.

## Prototype limitation

This release simulates movement by navigating high-resolution photorealistic plant imagery. A real
deployment can replace each viewpoint with customer-provided 360-degree panoramas, photogrammetry,
LiDAR or site scans while retaining the same route, hotspot and observable-asset contracts.
