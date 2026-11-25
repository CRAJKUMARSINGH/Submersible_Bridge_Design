# Launch baseline

Baseline `13a9f1f` matched `origin/main` before the launch work. A clean
lockfile install in a temporary checkout verified the following results.

| Check | Baseline |
| --- | --- |
| TypeScript and production build | Passed |
| Node test runner | 26 passed, 1 failed |
| Calculation and structural scripts | 60/60 and 19/19 assertions passed |
| V2 regression | All 25 cases matched their committed checksums |
| V4 calculation parity | 14 of 32 matched, 18 mismatched, 7 skipped |
| V6 traceability | All 26 rows mapped. Fourteen carry explicit clause IDs |
| V10 independent review and PE sign-off | Outstanding |

Reference fixtures include `test-variables-25-sets.csv`,
`scripts/v2-golden-checksums.json`, `data/golden-reference-set.csv`,
`data/clause-traceability-matrix.csv`, and the project source evidence in
`data/extracted` and `attached_assets`.

The browser accepts examples, custom entries, and CSV or Excel variables.
The provider merges inputs and calls `computeResults()`. The review stages and
reports consume its discharge, hydraulic, and structural outputs. At baseline,
live reports were available as PDF and Word. The Excel export contained inputs
only. The preview advertised a 169-page generator whose root implementation was
incomplete.

The protected folders `attached_assets`, `CODE-JUNCTION`, and
`_archive/CODE-JUNCTION` were present before this work.
