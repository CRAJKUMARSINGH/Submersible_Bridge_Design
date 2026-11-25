# Launch hardening report

**DRAFT – Engineering sign-off required.** The software changes below are ready
for review. The launch and construction acceptance gates remain open.

## Implemented

- Added a single launch command for typecheck, all TypeScript test suites in
  `scripts`, and the production build. The command reports every stage and exits
  unsuccessfully when any stage fails.
- Added live input validation, report export guards, and a summary that includes
  hydraulic, stability, bearing, uplift, and applicable load-combination checks.
  Model warnings are visible alongside the review status.
- Added small, medium, and large regression examples. These use the fixture
  low-bed level as the example ground datum. Site-specific levels must come from
  a survey.
- Added a draft Excel report with the input snapshot, intermediate results,
  formula trace, and load combinations. PDF and Word display the draft status
  and modeled checks. Word includes the live formula trace.
- Added a CLI that accepts the browser's JSON input snapshot and uses the same
  `computeResults()` and PDF, Word, and Excel report builders as the browser.
  The preview links to this supported export path.
- Preserved the model equations and committed golden fixtures. The baseline
  and fixture inventory are in [BASELINE.md](BASELINE.md).

## Verification

| Check | Result |
| --- | --- |
| TypeScript and Vite production build | Passed with a clean lockfile install |
| Node test runner | 29 passed, 1 failed (existing V4 calculation parity) |
| Calculation and structural scripts | 60/60 and 19/19 assertions passed |
| V2 regression | 25/25 cases matched committed checksums |
| CLI export with the default inputs | PDF, DOCX, and XLSX generated successfully |
| Report checks | Draft footer on all nine PDF pages and in the Word footer. Serialized Excel retains failed checks and source trace |

The launch gate returned exit code 1. Interactive browser acceptance and
engineering sign-off are outstanding.

## Outstanding acceptance work

- **V4 calculation parity.** The reference comparison matches 14 of 32
  reproducible rows. Eighteen differ, including a ventway pass/fail result.
  The [PE decision brief](.trae/specs/pre-modification-review-20260925/tasks.md#pe-ruling-brief--tasks-2833-the-six-open-v4-divergences)
  records the evidence and rulings needed for the surveyed section, discharge
  method, deck footprint, weir inputs, scour factor, and earth pressure.
- **V6 and V10.** All 26 trace rows are mapped. Fourteen have explicit clause IDs.
  Evidence for the remaining clause IDs and independent professional engineering
  sign-off is outstanding.
- **Model coverage.** The examples are regression cases. Verified Larathi/Som
  and high-level bridge templates, high-skew cases, interruption duration, and
  unmodeled prototype checks remain open. The 169-page prototype is reference
  material. The live CLI exports the supported model report.
- **Folder checks.** This launch work made no changes to `attached_assets`,
  `CODE-JUNCTION`, or `_archive/CODE-JUNCTION`. The two active junction files
  were preserved. The bridge launch brief remains open, and the companion
  Markdown file concerns a different application.
