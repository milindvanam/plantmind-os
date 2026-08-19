# PlantMind OS Product Vision

## Purpose

PlantMind OS is an industrial operations-intelligence prototype intended to turn fragmented plant data into decision-ready operating context. The repository demonstrates how plant-floor evidence, physical process state, production outcomes and executive narratives can be joined without pretending that simulated or illustrative outputs are live industrial truth.

The problem is not lack of data. Industrial sites commonly have PLC/DCS control signals, SCADA screens, historian trends, maintenance records, MES production records, ERP transactions and operating procedures, but the information remains separated by system and organizational boundary. PlantMind's direction is to preserve those source systems while adding a governed context and decision layer above them.

## Intended users

- Plant managers, operations leaders and shift teams needing current operating context.
- Reliability, maintenance and process-engineering teams investigating equipment and process behavior.
- Quality, energy and production teams reconciling physical performance.
- Executives and CEOs needing concise, evidence-linked operating priorities.
- Data and integration teams responsible for source provenance and safe industrial connectivity.

## Relationship to industrial systems

PlantMind is positioned as an overlay, not a replacement for control or transaction systems:

| System | Intended relationship | Current repository state |
|---|---|---|
| PLC / DCS | Continue deterministic control and interlocks; provide observable signals. | No live connector or control write-back. |
| SCADA | Continue operator monitoring; provide current tags, quality and alarms. | PM-01 projects simulated observable tags into a UI contract only. |
| Historian | Supply timestamped measurements and trends. | PM-01 history is bounded, in-memory simulation history; P-204A uses deterministic fixtures. |
| MES / LIMS | Supply batches, genealogy, quality and release state. | PM-01 batches are simulated; quality is a placeholder. |
| CMMS / EAM | Supply work orders and maintenance context. | Preview contains a simulated SAP maintenance handoff, not an integration. |
| ERP / SAP | Supply business, inventory and maintenance transactions. | Connector catalogue is Demo/Planned/Custom; no production connector exists. |

## Current implementation

The application currently provides:

- A seven-chapter executive overview and a curated CEO vision preview.
- A deterministic eight-hour P-204A pump-degradation replay and executive/timeline views.
- A separate UCI hydraulic-system data experience using a committed normalized public dataset.
- PM-01, a deterministic ASC-100 chemical-plant simulation with material flow, batches, production, OEE and energy calculations.
- PM-01 process, statistical, interactive 3D, connected operational-twin and seven-stop 360-degree panorama views.
- Explicit truth labels and a strict PM-01 boundary between hidden Plant Reality and observable UI data.

The repository does **not** implement production AI inference, autonomous control, a knowledge graph, production SCADA/historian/MES/ERP connectors, production authentication, durable PM-01 persistence or governed industrial write-back.

## Industrial AI positioning

### Implemented

The CEO preview contains deterministic, curated Maintenance Director AI and CEO Strategy AI demonstrations. The application also presents deterministic recommendations in demo contexts. These are product-experience prototypes, not general-purpose agents, trained production models or certified engineering diagnoses.

### Planned direction

Repository architecture documents describe an intelligence layer that could combine observable evidence, context, confidence, impact and governed recommendations. Implementing that layer requires product-owner approval, source-system contracts, evidence semantics and validation criteria.

### Long-term direction

The long-term platform concept is an industrial context and decision layer spanning plant operations and executive governance: contextualized assets and events, operational digital twins, investigation workflows, bounded industrial agents and human-approved interventions. This direction is documented vision, not current functionality.

## Digital twin concept

PM-01 is the current digital-twin foundation. The simulator owns physical state; a projection exposes only observable operating information; visualization consumes that projection. The chemical 3D twin and panorama tour are connected to observable simulated state. Other industry landscapes are visual demonstrations and are not connected to industry-specific physical models.

The intended future twin would substitute real observable plant sources for simulated observations while retaining provenance, time, quality and safety boundaries. Customer-calibrated engineering models and site-captured 3D/360 assets are not yet present.

## Product direction requiring confirmation

The repository contains several broad architecture and blueprint documents, but it does not establish an approved sequence after the current PM-01 visualization work. The next intelligence milestone, first production industry, connector priority and pilot deployment model all require product-owner confirmation.

