# Submersible Bridge Design (BridgeCAD Enterprise Suite)

Repository: https://github.com/CRAJKUMARSINGH/Submersible_Bridge_Design

Engineering design application for submersible causeway / causeway bridge design:
React + Vite + pnpm, jsPDF for PDF export, `docx` for Word export, Drizzle for the
Section-12 audit schema. Calculation logic lives in the pure, exported
`computeResults()` in `src/lib/calculations.tsx` so the UI, the headless harnesses,
and the CLI share one source of truth.

---

## Standing Orders

Persistent instructions that apply to every working session on this repository.

### SO-1 — Session chat log, refreshed every 12 minutes

- A running **session chat log** is kept in [`creat.md`](creat.md) at the repository root.
- The log **MUST be refreshed at least every 12 minutes** while a session is active.
- The log is **append-only**: never delete or rewrite earlier entries.
  Each refresh adds a new timestamped block.
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
