# PlantMind OS Prototype

Sprint 1 is complete: one Next.js/TypeScript modular monolith, one PostgreSQL database, an industrial design system, exactly six route foundations, and a deterministic P-204A pump replay.

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

Full setup, route map, data model, design tokens, component inventory, test instructions, limitations, deferred scope, and the completion report are in [docs/SPRINT-1-IMPLEMENTATION.md](docs/SPRINT-1-IMPLEMENTATION.md).

The three approved architecture documents in the repository root remain unchanged and are the governing references. No Sprint 2 capability is included.
