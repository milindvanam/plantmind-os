# Known Issues

## Open limitations

- Dashboard values currently originate from the existing deterministic replay adapter rather than a server-generated consistent PostgreSQL snapshot.
- Evidence quality is indeterminate because the Evidence Collection Engine is not implemented.
- Confidence is not scored because the Confidence Engine is not implemented.
- Production and financial exposure ranges are unavailable because Impact Assessment is not implemented.
- AI Operations Head interpretation is not generated because that milestone is not implemented.
- Action status is informational only; no governed workflow exists.
- Founder Demo Mode and the development-only diagnostics route remain future Sprint 2 work.
- Automated visual-diff and automated accessibility-scanner gates are not yet configured; semantic, keyboard, responsive, and manual visual checks remain required.
- The full development dependency audit reports four moderate transitive advisories in the locked Sprint 1 Drizzle Kit toolchain. Production dependencies audit cleanly; npm's automated remediation proposes a breaking Drizzle Kit downgrade and has not been applied.
- The host in-app browser/image viewer could not initialize because of a Windows ACL helper fault during Milestone 1 visual QA. Playwright Chromium capture and responsive tests completed successfully.

These are explicit product states, not silent failures.
