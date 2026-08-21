# Beta Foundation 01 — SAP Connector Sandbox

## Outcome

PlantMind now exposes a beta-facing **Connect a Plant** workspace at `/connect`. It demonstrates a bounded SAP maintenance workflow without requiring or pretending to use a live SAP system.

## Implemented

- Controlled-beta readiness checklist separating implemented demonstration capabilities from design-partner dependencies.
- Explicit `SANDBOX` data mode and persistent on-screen statement that no live SAP or plant connection exists.
- Typed SAP equipment, functional-location, maintenance-draft and connector-audit contracts.
- Deterministic equipment fixtures mapped to PM-01 assets.
- Interactive sandbox sequence: validate contract → import equipment → prepare notification → named approval → simulated SAP document number.
- Session-local audit trail for all sandbox actions.
- Browser-side credential fields are prohibited by design and architecture test.
- Data & Integrations navigation now opens `/connect`; the existing `/real-data` experience remains a valid route and part of the same destination.

## Truth and authority boundary

- No SAP endpoint, OAuth client, certificate, password or secret is configured.
- No SAP API request or external write-back occurs.
- `SIM-SAP-NOTIF-*` identifiers are deterministic demonstration values, not SAP records.
- PlantMind remains advisory and does not connect to PLC, DCS, SIS or machinery controls.
- Simulation ground truth remains isolated from connector contracts.

## Deliberately not implemented

- Production authentication, SSO, tenant authorization and route protection.
- Durable connector configuration, credential vault integration and server-side SAP adapter.
- SAP BTP destination, Cloud Connector, Integration Suite or Event Mesh configuration.
- Live equipment synchronization, delta tokens, retries, idempotency keys or dead-letter handling.
- Real historian, OPC UA or MQTT ingestion.
- Production SAP notification/order write-back.

## Next implementation gate

The next gate requires an identified design partner to select the SAP landscape and identity pattern. After that decision, implement server-only connector configuration and a read-only adapter against an authorized SAP sandbox. Credentials must be stored in an external secret manager and represented in PlantMind only by an opaque secret reference.

