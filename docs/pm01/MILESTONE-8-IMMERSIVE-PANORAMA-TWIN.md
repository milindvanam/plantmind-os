# PM-01 Milestone 8 — Immersive Panorama Twin

## Purpose

Replace flat-image panning with a Street View interaction model. The Chemical Industry Site Imagery
view now places the camera inside linked 360-degree equirectangular panoramas.

## Interaction

- Hold and drag directly on the scene to look left, right, up and down.
- Use the mouse wheel to alter the camera field of view.
- Use the floor movement control or next/previous buttons to change physical viewpoints.
- Jump directly between seven plant locations from the numbered route.
- Select the spatial equipment hotspot to open its observable asset record.
- Use the existing visual-stage full-screen control for an immersive presentation.

## Route

Receiving → raw-material storage → production → final output/QC → packaging → warehouse → loading
and unloading dock.

## Architecture boundary

The panorama component accepts only `Pm01FactoryView`. It maps each viewpoint to an observable
process node and significant asset; it cannot import Plant Reality or hidden ground truth.

## Deployment note

The included panoramas are prototype imagery. A customer deployment can replace them with calibrated
site-captured 360 photography while retaining the same navigation and telemetry contracts.
