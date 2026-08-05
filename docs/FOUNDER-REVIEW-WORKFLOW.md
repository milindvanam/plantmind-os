# Founder Review Workflow

Every PlantMind milestone ends at a mandatory visual review gate. Product implementation must stop until the founder explicitly approves the captured milestone.

## Required gate

- Application builds successfully.
- Local development server remains running.
- Exact local URL is reported.
- All locked routes and milestone functionality pass browser regression.
- Desktop and 390×844 mobile layouts are inspected.
- Dark and light themes are inspected.
- Loading, empty, error, and disabled Dashboard compositions are inspected.
- Screenshots are saved under `docs/screenshots/founder-review`.
- Automated verification and known exceptions are recorded in a Founder Review Report.

## Review-only states

During local development only, the approved Executive Dashboard compositions can be opened at:

- `/command?founder-state=loading`
- `/command?founder-state=empty`
- `/command?founder-state=error`
- `/command?founder-state=disabled`

Unsupported values and all production builds resolve to the normal ready Dashboard. These parameters do not create a product route or production capability.

## Local workflow

```powershell
npm.cmd run build
npm.cmd run dev
npm.cmd run test:e2e
npm.cmd run review:capture
```

The review capture writes landing, Dashboard, desktop, mobile, dark, light, loading, empty, error, and disabled screenshots. Existing artifacts are intentionally replaced by the latest review run.

## Milestone handoff

The final report must include:

- Local URL and running status
- Features reviewed
- Browser and responsive verification
- Desktop and mobile screenshots
- Loading, empty, error, and disabled screenshots
- Test and build results
- Visual defects fixed, or an explicit statement that none were found
- Risks, open questions, and remaining work
- A clear stop pending founder approval
