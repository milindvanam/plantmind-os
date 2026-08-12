# PlantMind OS

PlantMind OS is a decision-ready industrial intelligence prototype. The modular Next.js/TypeScript monolith combines the original six-route P-204A operational golden thread with a private CEO Vision Preview for Power + FGD/APC and Cement + Bulk Material Handling.

## Quick start

```powershell
npm.cmd install
docker compose up -d
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run db:check
npm.cmd run dev
```

Open `http://localhost:3000`.

## Real industrial data prototype

- `/real-data` — Real Data Lab and explicit entry point for public industrial evidence
- `/real-data/P-204A` — actual-cycle equipment-health replay, sensor evidence, recommendation and provenance
- `/assets/P-204A` — the original deterministic simulated experience, retained separately

The first adapter uses UCI's **Condition Monitoring of Hydraulic Systems** dataset: 2,205 labelled, 60-second operating cycles across 17 pressure, flow, power, temperature, vibration and efficiency channels. The committed normalized artifact preserves per-cycle statistics and source labels. Raw source files are intentionally ignored; exact setup and regeneration instructions are in [data/real/hydraulic-system/README.md](data/real/hydraulic-system/README.md).

Run `npm run data:hydraulic` after placing the official source files in `data/real/hydraulic-system/raw/` to reproduce the normalized artifact.

Truth boundary: telemetry and pump-condition labels on the real-data routes come from the public UCI dataset. P-204A, the fictional company, Maharashtra site and all business context are simulated PlantMind demonstration context. PlantMind's health interpretation and maintenance recommendation are deterministic prototype outputs, not certified engineering diagnoses.

## CEO Vision Preview routes

- `/overview` — seven-chapter animated executive introduction and default public entry
- `/briefing` — executive narrative, SCADA positioning and decision architecture
- `/in-action` — two flagship sector journeys with explicit truth classification
- `/in-action/power-fgd` — Power + FGD/APC journey and pilot path
- `/in-action/cement-bulk-material-handling` — Cement + BMH journey and pilot path
- `/connect` — honest Demo / Planned / Custom connector catalog
- `/discovery/ceo-morning-brief` — decision-ready executive agenda
- `/discovery/predict-equipment-failure` — deterministic P-204A failure-risk experience
- `/discovery/ai-executive-team` — Maintenance Director AI and CEO Strategy AI

The preview uses simulated context, deterministic demo logic and illustrative INR ranges. It does not claim production ML, live production connectors or write-back. Write-back is simulated, and every evidence/output class is labelled in the interface.

Full setup, original route map, data model, design tokens, component inventory, test instructions, limitations and the original completion report are in [docs/SPRINT-1-IMPLEMENTATION.md](docs/SPRINT-1-IMPLEMENTATION.md).

The approved charter and [decision-ready architecture blueprint](docs/PLANTMIND-OS-DECISION-READY-ARCHITECTURE-BLUEPRINT-v1.0.md) remain governing references. No new service, production connector, authentication layer or production write-back was introduced for this preview.
