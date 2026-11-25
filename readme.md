# Submersible Bridge Design (BridgeCAD Enterprise Suite)

Repository: https://github.com/CRAJKUMARSINGH/Submersible_Bridge_Design

Engineering design application for submersible causeway / causeway bridge design:
React + Vite + pnpm, with PDF, Word, and Excel report exports and Drizzle for the
Section-12 audit schema. Calculation logic lives in the pure, exported
`computeResults()` in `src/lib/calculations.tsx` so the UI, the headless harnesses,
and the CLI share one source of truth.

## Production status

**DRAFT – Engineering sign-off required.** The application supports engineering
review. Construction use requires site-specific verification, statutory approvals,
and independent reviewer and professional engineer sign-off (V10). The launch
gate currently reports a V4 calculation mismatch against the reference workbook.
See [Launch hardening report](LAUNCH_HARDENING_REPORT.md).

```sh
pnpm install --frozen-lockfile
npm run launch:gate
```

The gate runs TypeScript, unit and verification tests, and the production build.
Each stage runs even if an earlier stage fails. A failing stage makes the command
exit unsuccessfully.

Start the app with `pnpm dev`. Choose an example or import project variables on
**Variable Import**, review each design step, then export PDF, Word, or Excel
from **Summary Report**. For headless use, download JSON from **A4 Statutory
Preview** and supply a new output directory.

```sh
npm run export:design -- causeway-current-inputs.json draft-exports
```

---

## Standing Orders

Persistent instructions that apply to every working session on this repository.

### SO-1 — Session chat log, refreshed every 12 minutes

- A running **session chat log** is kept in [`creat.md`](creat.md) at the repository root.
- The log **MUST be refreshed at least every 12 minutes** while a session is active.
- Keep a concise rolling 24-hour window with the newest timestamped entry first.
  Earlier entries are available in Git history.
- Every block records, at minimum:
  1. Timestamp (`Asia/Shanghai`) of the refresh.
  2. The user's request / current instruction being worked.
  3. Actions taken so far in the session.
  4. Files created, modified, or deleted.
  5. Verification evidence (test counts, typecheck/build exit codes).
  6. Open blockers and the next intended step.
- `creat.md` is a working record, not a submission deliverable.

### SO-2 — Engineering evidence rule

No engineering constant, coefficient, or clause number is changed or stamped unless
it is present in the source evidence (`data/extracted/TYPE_document.md` and the
reference PDF). Source-silent items are flagged for PE supply, never guessed.
