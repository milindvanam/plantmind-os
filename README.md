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
