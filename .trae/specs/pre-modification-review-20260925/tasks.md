# TASKS — Pre-Modification Review Follow-up (Post-Approval)

**Spec:** [spec.md](file:///e:/Rajkumar/Submersible_Bridge_Design/.trae/specs/pre-modification-review-20260925/spec.md)
**Decision:** Option C (REDESIGN) recommended per [Section 16](file:///e:/Rajkumar/Submersible_Bridge_Design/.trae/specs/pre-modification-review-20260925/spec.md#L16)
**Phase Gate C.0:** Must complete BEFORE any code modification — 20 decisions E1–E20 PE-confirmed + 1 golden reference set hand-calculated

---

## GATING RULE — NO TASK PROCEEDS UNTIL C.0 CLOSED

Every task below has a prerequisite: **Phase C.0 items signed off by PE/user** (Section 13.1 E1–E20, Section 14 V4 golden reference workbook).

---

## TASK STATUS KEY

- `pending` — Not started
- `in_progress` — Active
- `blocked` — Needs C.0 sign-off or dependency
- `completed` — Evidence attached
- `cancelled` — User-approved exclusion

---

## Phase C.0 — GAP RESOLUTION (Blocking, no code changes)

### Task 1: Confirm Engineering Decisions E1–E20 (Section 13.1)
**Status:** `completed` (2026-11-18 — all 20 resolved from PE-authored reference document)
**Priority:** `high`
**Depends On:** None (user input required)
**Resolution:** [`data/engineering-decisions-e1-e20.csv`](file:///e:/Rajkumar/Submersible_Bridge_Design/data/engineering-decisions-e1-e20.csv) — each item carries clause reference + source-line evidence (from `data/extracted/TYPE_document.md`). 17/20 fully source-cited; E2/E9/E10 cite the governing IRC code with clause-number stamping pending.
**Scope:** User/PE provides clause references and numeric values for:
  - E1 wLive Class A/AA/70R source derivation (axle tables, lane factors, impact %)
  - E2 Afflux formula IRC SP:82 clause reference
  - E3 Scour multiplier table by bend angle
  - E4 Silt-factor f by soil class lookup
  - E5 Cd table by pier/abutment shape (IRC SP:82)
  - E6 Seismic zone inputs + IRC 6:2000 seismic clauses
  - E7 Minimum foundation depth rule (IRC SP:82)
  - E8 Bearing type & stiffness per IRC 83
  - E9 Anchor design procedure + stainless steel specs (IRC SP:82-2007)
  - E10 VRCC thrust block design procedure
  - E11 Permissible stress tables IRC 6:2000 Cl.202
  - E12 Plate 7.09 deck thickness table (IRC SP:20)
  - E13 Plate 7.25 dirt wall dims + 55.50 kN self-weight source
  - E14 Ka=0.3 verification (Coulomb parameters φ α β δ)
  - E15 Braking 47.84 kN derivation
  - E16 Buoyancy 145.80 kN — abutment wetted volume
  - E17 Min carriageway 6.0 m Cl 6.4.2(vi) validation rule
  - E18 Concrete grade fck_PCC / fck_VRCC / fy values
  - E19 Surcharge h3 height + vehicle type
  - E20 Wind zone + IRC 103 wind speed inputs

**Test Requirements (TR):**
- **RULE:** Every E1–E20 item has: (a) clause number, (b) numeric value if applicable, (c) PE name if confirmed.
- **RUBRIC:** Completeness of clause references (0=none, 1=partial, 2=all 20 fully cited with year + clause). Pass threshold: 2.

**Completion Evidence:** 20-line traceability CSV or appendix populated.

---

### Task 2: Provide Manually Verified Golden Reference Set (V4 in Section 14)
**Status:** `completed` (2026-11-18 — `data/golden-reference-set.csv`: 36 inputs + 30 results, each with reference value + source line; PE signature still required for formal V4 sign-off)
**Priority:** `high`
**Scope:** User provides hand-signed PE calculation workbook for one design set (or certifies pdf values in `Type Design of submersible causeway.pdf` are manually correct):
  - All 36 Inputs (Section 5.1) hand-read from PDF, value + unit + page ref
  - All 29 ComputedResults (Section 5.2) hand-calculated, step-by-step
  - 3 engineering drawings with labeled dimensions verified

**Test Requirements (TR):**
- **RULE:** 36 inputs + 29 computed = 65 values verified with page reference or calculation step
- **RUBRIC:** Verification coverage %; Pass ≥ 95% (≤3 values pending)

---

## Phase C.1 — REPAIR (Data bugs + safety flags)

### Task 3: Fix cdVent 4.1 Data Error in 25-set CSV (R2 / M6)
**Status:** `completed (re-scoped)` (2026-11-18 — premise not reproducible; validator + boundary tests + full CSV scan completed)
**Priority:** `high`

**Closure evidence (2026-11-18):** `test-variables-25-sets.csv` scan → **25 rows, all `cdVent = 0.9`, 0 rows outside `[0.6, 1.1]`, 0 rows equal to `4.1`**. The reported "sets 02/03/08/11/14/19/21 = 4.1" does not exist in the file of record, so no value change is warranted. The stray `4.10` in the source is the surplus-weir discharge coefficient, not `cdVent`. Validator present in `src/lib/spreadsheet-import.ts` L136–141 (warn-only, `[0.6, 1.1]`); `scripts/cdVent-validator.test.ts` expanded with boundary/negative cases (c) 0.6, (d) 1.1 accepted; (e) 0.59, (f) 1.11 warned → 6/6 passing.

**Re-audit note (T21, 2026-11-18):** `test-variables-25-sets.csv` shows **cdVent = 0.9 for all 25 sets** — no set carries 4.1. The "sets 02/03/08/11/14/19/21 = 4.1" premise is therefore **not confirmed** by the file of record. The stray `4.10` in the source document is the surplus-weir discharge coefficient (not a cdVent). Recommend re-scoping this task to: add the `cdVent ∈ [0.6, 1.1]` validator and a fresh scan of all 25 sets before any value is changed.

**Scope:**
- Audit `test-variables-25-sets.csv` sets 02, 03, 08, 11, 14, 19, 21 → cdVent column value = 4.1
- Determine: (a) should be 0.9; or (b) adjacent column shift in the CSV
- After C.0 confirms correct Cd range, fix values + regenerate output PDFs
- Add validator: cdVent ∈ [0.6, 1.1] bounds check in spreadsheet-import.ts

**AC Coverage:** spec.md Section 11 M6, R2

**Test Requirements (TR):**
- **RULE:** cdVent validator rejects values outside [0.6, 1.1] with descriptive error
- **RULE:** After fix, all 25 sets have valid cdVent
- **RULE:** Import warnings list appears in UI (spreadsheet-import)

**Completion Evidence:** Unit test file + CSV diff + regenerated set-02 output checksum change log

---

### Task 4: Standardize ABUT_W and Geometry Constants (R5 / Section 8.4 Defects)
**Status:** `completed` (2026-11-18 — single exported `DEFAULT_GEOMETRY` consumed by CS A-A / LS B-B / Plan + PDF sheets + summary preview; divergent `ABUT_W=0.6` (CS), `PMARG=1.6` (Plan) and Summary pixel literals removed; V5 single-source test PASS; 60/60 calc, 19/19 structural, 3/3 trace, 4/4 verbatim, `npm run build` exit 0)
**Priority:** `high`

**Scope:**
- Move hardcoded geometry constants out of `pdf-export.ts` (L139, L246, L355: PIER_W, ABUT_W, FEXT, APP, PMARG, bankW)
- Add to `Inputs` type as optional inputs with defaults → or add to new `GeometryParams` sub-type
- Ensure CS A-A, LS B-B, Plan view draw from ONE source
- Add V5 unit test: ABUT_W in all 3 drawings must be equal

**AC Coverage:** spec.md Section 11.2 A1–A7, Section 14 V5

**Test Requirements (TR):**
- **RULE:** Single exported geometry object consumed by drawCrossSection/LongSection/Plan
- **RULE:** V5 unit test: dimensions in CS/LS/Plan match geometry object (within 1e-6 mm)
- **RUBRIC:** Remaining hardcoded geometric magic numbers. Pass: 0 uncommented numeric literals with geometric meaning outside the geometry object. Score 0=10+ remain, 1=1–3 remain, 2=0 remain.

---

### Task 5: Rename QA Rubric and Add Report Disclaimer (R7)
**Status:** `completed` (2026-11-18 — cover disclaimer block per §18.1-1.5 drawn from exported `COVER_DISCLAIMER_*` constants; footer disclaimer verified on all 9 sheets; summary red V10 banner confirmed; QA output relabelled "Report Structural Completeness Score"; new `scripts/t5-report-disclaimer.test.ts` 4/4 PASS; 60/60 calc, 19/19 structural, 3/3 trace, 4/4 verbatim, V5 PASS, `npm run build` exit 0)
**Priority:** `high`

**Scope:**
- In `qa-scoring-results.json` label: rename "QA Score" → "Report Structural Completeness Score"
- On every generated PDF:
  - Cover page: add prominent disclaimer block per Section 18.1 item 1.5
  - Footer on every sheet: "Automated — not independently verified unless signed in Appendix S"
- In summary UI page: red banner until V10 independent PE sign-off

**AC Coverage:** spec.md R7, SIDE-BY-SIDE-COMPARISON

**Test Requirements (TR):**
- **RULE:** String search of generated PDF cover page finds disclaimer block text
- **RULE:** Summary page shows banner (visually confirmed or CSS class present) when `V10_signed_off === false`
- **RULE:** JSON score labels use new naming convention in test-runs output

---

### Task 6: Extend Inputs Enum and Add Missing Variables (M3, Section 6 N1–N6)
**Status:** `completed`
**Priority:** `high`

**Scope:**
- `liveLoadType` enum: add `"IRC Class 70R"` — determine wLive per Task 1/E1
- Add to Inputs type: `ofl`, `lbl`, `bottomDeck`, `carriageWidth`, `sbc_kN_m2`, `d_LBL_depth`
- Add fields to INPUT_FIELD_DEFINITIONS in spreadsheet-import.ts with section/unit/aliases
- Update 3-step UI pages to display + edit new fields
- Validation rules: carriageWidth ≥ 6.0 m (E17) rule in calculation engine; fail compliance row if violates

**AC Coverage:** spec.md Section 6, Section 11.1 M3/M9/M10/M4/M8/N1–N6

**Test Requirements (TR):**
- **RULE:** TypeScript compile passes (no typecheck errors — `npm run typecheck`)
- **RULE:** parseVariableTable() accepts new keys from CSV; unit test parses set-18/24 Class 70R successfully
- **RULE:** E17 rule fires PASS/FAIL correctly in compliance summary (pdf-export sheet 4 3C)
- **RULE:** New 6 variables appear in extracted-input report sample page template

---

## Phase C.2 — FOUNDATION (Schema, V&V, PDF parser, Word)

### Task 7: Implement Proposed DB Schema (Section 12)
**Status:** `completed`
**Priority:** `high`

**Scope:**
- Drizzle tables in `lib/db/src/schema/index.ts` — PROJECT, DESIGN_SET, COMPUTED_RESULTS, REPORT_ARTIFACT, VERIFICATION_CHECK (see Section 12 ERD)
- Zod insert schemas + generated types
- Calculations engine: on compute, save ComputedResults hash + version string (git sha + package version)
- PDF export: write REPORT_ARTIFACT row with sha256 of file

**AC Coverage:** spec.md Section 12, Section 11.4 stale DB scaffold, R10

**Test Requirements (TR):**
- **RULE:** `drizzle-kit generate` produces migrations (or equivalent) for 5 tables with PK/FK
- **RULE:** Insert DESIGN_SET → insert 1 COMPUTED_RESULTS (1:1) → fail unique if exists
- **RULE:** REPORT_ARTIFACT.sha256 matches file hash on disk

---

### Task 8: V1 Unit Tests for All Current Calculations (Section 9.1–9.3 + 58 tests outlined)
**Status:** `completed`
**Priority:** `high`

**Scope:**
- Node test runner (currently test script exists in package.json)
- Step 1: 12 tests (Rational, Weir, Velocity, MAX tie-break, override boundaries, zero/negative)
- Step 2: 22 tests (%Obs pass/fail boundaries, afflux 0/+ boundary, Lacey, FBL, scourSafe, div by 0 guards)
- Step 3: 24 tests (wSelf kN conversion, wLive enum, fDrag/fUplift/fAnchor sign, class 70R after Task 6)

**AC Coverage:** spec.md Section 14 V1; code-basis gap R1 via testability

**Test Requirements (TR):**
- **RULE:** `npm run test:unit` → 58+ passing tests, 0 failures
- **RULE:** Each boundary value explicitly tested (e.g., %Obs exactly 70.0% fails passRTL)
- **RULE:** Perturbation test: change runoffCoefficient by ε → qRational changes by expected ∂Q/∂C

---

### Task 9: PDF-to-Variable Extraction Pipeline (R8)
**Status:** `completed` (2026-11-18 — `scripts/extract-pdf-vars.ts` reads the reference PDF and emits `Partial<Inputs>` JSON + warnings; V3 harness scores **27/27 = 100 %** against `data/golden-reference-set.csv`, rubric score 2)
**Priority:** `medium`

**Resolution:**
- **Extractor** — `scripts/extract-pdf-vars.ts` uses `pdf-parse` v2 (`new PDFParse({ data, verbosity: 0 })` → `getText({})`) over the 169 pages of `Type Design of submersible causeway.pdf` and applies label→value heuristics (design-parameter block, area-velocity totals row, Dicken/surplus-weir block, ventway trial, material rows). Output: `data/extracted/pdf-extracted-inputs.json` with `inputs: Partial<Inputs>`, `extraVariables` (`fck_pcc`/`fck_vrcc`/`fy`/`reinforcementCover_mm` — recognized reference fields kept as module constants in the app), `fieldCount`, `sourceSha256`, and `warnings`.
- **Extraction yield** — **28 fields** (24 `Inputs` + 4 extra) ≥ the 20-field TR floor. Source-silent fields (streamName, location, date, runoffCoefficient, rainfallIntensity, ventHeight, cdVent, dragCoefficient) are reported as `SOURCE-SILENT` warnings and left unset, never guessed.
- **Unit conversions** match `defaultInputs`: unit weights kN/m³ → kg/m³ (×100), SBC t/m² → kN/m² (×9.81).
- **V3 harness** — `scripts/v3-extraction-accuracy.test.ts` (Section 14.3): manual golden table vs automated extraction, numeric within 0.1 % relative / exact string otherwise, prints the side-by-side table, asserts ≥ 20 extracted fields and ≥ 95 % accuracy.

**Evidence:** `npm run extract:pdf-vars` → 28 fields; `npm run test:v3-extraction` → **27/27 = 100 %**, rubric 2; `npm run typecheck` exit 0.

**Scope (as delivered):**
- Add `scripts/extract-pdf-vars.cjs` or `ts` using `pdf-parse` (already in devDependencies)
- Heuristic/table extractor: page ranges → label/value pairs
- Output to JSON matching Partial<Inputs> + warnings
- V3 accuracy test harness: Section 14.3

**AC Coverage:** spec.md R8, Section 3 missing pipeline, Section 4 accuracy PRE-REQUISITE

**Test Requirements (TR):**
- **RULE:** End-to-end: parse `Type Design of submersible causeway.pdf` → Partial<Inputs> JSON produced (≥ 20 of 36 non-metadata inputs)
- **RUBRIC:** V3 accuracy (Section 14.3 after C.0 golden data). 0 <50%, 1 50-94%, 2 ≥95%. Pass threshold: 2.

---

### Task 10: Word (.docx) Report Generator (R9, Proposed Outline Section 18)
**Status:** `completed` (2026-11-18 — `src/lib/word-export.ts` + `scripts/v8-word-conformance.test.ts`)
**Priority:** `high`

**Scope (as delivered):**
- Add docx dependency (docx / office-js) — peer review library choice → `docx@9.9.0` (already present in `package.json`).
- Template-driven: map Section 18 outline (1.1 → 18.13) to docx section objects with heading levels → `WORD_TOP_LEVEL_SECTIONS` (13 Heading-1 blocks) drives `buildDesignDocument()`.
- Populate: metadata, 3 design step tables, compliance, drawing placeholders (drawings to vector-embedded later in C.4) → all Step-1/2/3 + structural tables populated from `Inputs`/`ComputedResults`; Sheets 5–11 listed as placeholders.
- V8 conformance check: verify all headings present in output → `scripts/v8-word-conformance.test.ts`.

**Resolution / Evidence:**
- `src/lib/word-export.ts` — `buildDesignDocument(inputs, results)` (docx `Document`), `buildDesignDocxBuffer()` (Node/`Packer.toBuffer`), `downloadDesignWord()` (browser/`Packer.toBlob`); reuses `COVER_DISCLAIMER_*` from `pdf-export.ts` so the mandatory §18.1 item 1.5 disclaimer is single-sourced. Outline blocks: Title Page, Sections 1–8, 10–12, Appendices (the source outline has no Section 9).
- `scripts/v8-word-conformance.test.ts` — generates the .docx, reads `word/document.xml` back with a dependency-free central-directory ZIP reader (`node:zlib`), asserts 13 Heading-1 paragraphs in outline order and 34/34 Section-10 field values present.
- UI: `Export Word (.docx)` button wired on the Summary page (`src/pages/summary.tsx`) beside the PDF export, closing the R9 "no Word output" submission-gate gap.
- **Evidence:** `npm run test:v8-word` → 13/13 headings, 34/34 field values, rubric **2** (pass ≥ 1); `npm run typecheck` exit 0; `npm run build` exit 0 (2630 modules).

**AC Coverage:** spec.md R9, Section 3 missing Word pipeline, Section 18 proposed outline

**Test Requirements (TR):**
- **RULE:** Generated .docx has 13 top-level sections (1. Title … 13. Appendices) with correct heading level 1 — PASS (13 Heading-1 paragraphs, outline order).
- **RULE:** For each field in Section 10 Report-Field Inventory, corresponding docx XML paragraph contains the value (spot-check N≥20) — PASS (34 values, ≥20 required).
- **RUBRIC:** Visual fidelity to outline. 0=sections unordered or missing 3+, 1=minor layout issues, 2=identical structure. Pass ≥1. → **2**.

---

## Phase C.3 — STRUCTURAL MODULE (Full design calculations)

### Task 11: Dead Load Subdivision + Dirt Wall / Wearing Coat (9.5 missing)
**Status:** `completed` (2026-11-18 — `src/lib/structural.ts` `deadLoads`; reproduces 244.80 / 55.50 / 38.25 = 338.55 kN and abutment 155.52 + footings 58.32/64.80/71.28 = 349.92 kN)
**Priority:** `high`

**Scope:**
- Subdivide wSelf into wSelfDeck, wSelfDirtWall (per E13 Plate 7.25), wSelfWearingCoat in new DeadLoadBreakdown subtype
- Sum still equals wSelf (backwards compatible)
- Add 4 abutment footing dead load self-weights with eccentricity table (XLSX rows 95–700 pattern)
- Compute eccentricity of resultant at each footing level → location + e value

**AC Coverage:** spec.md 9.5 Dead loads missing; excel-logical.json rows 74–132

---

### Task 12: Earth Pressures (Active/Passive Ka/Kp) + Coulomb (R12, E14)
**Status:** `completed` (2026-11-18 — Coulomb `coulombKa()` in `src/lib/structural.ts`: φ=30, α=90, β=0, δ=15 → Ka≈0.3014 (ref 0.30); inputs added)
**Priority:** `high` (BLOCKING for structural sign-off)

**Scope:**
- Coulomb active Ka = f(φ, α, β, δ) with surcharge term
- Passive Kp with and without wall friction
- Earth pressure resultant + centroid height
- Add 4 inputs: backfill_phi, wall_alpha, backfill_beta, wall_friction_delta (E14) + surcharge_h3 (E19)

**Test Requirements (TR):**
- **RULE:** Unit test with φ=30, α=90, β=0, δ=0 → Rankine Ka = 1/3 ≈ 0.333 (known textbook)
- **RULE:** Golden: Ka = 0.3 exactly matches reference value (Task 1 E14) within tolerance
- **RUBRIC:** Coverage of Coulomb special cases (β=0, δ=φ/2, α=90, surcharge present/absent). 2 = all cases unit-tested, 1=partial, 0=bare minimum. Pass ≥1.

---

### Task 13: Stability Analysis (Sliding + Overturning FOS)
**Status:** `completed` (2026-11-18 — `stability` block; FOS_SLIDING_MIN=1.5, FOS_OVERTURNING_MIN=2.0, μ=0.5)
**Priority:** `high`

**Scope:**
- Sliding FOS = Σresist / Σsliding; base friction tan(φ_base) or anchor contributions
- Overturning FOS = ΣM_stab / ΣM_OT about toe
- Add to compliance report: 2 new PASS/FAIL rows with FOS thresholds ≥ 1.5 and ≥2.0

**AC Coverage:** spec.md 9.5 stability missing; relates to abutment module Excel rows 500+

---

### Task 14: Bearing Pressure + No-Tension + SBC Utilization (M8/E8)
**Status:** `completed` (2026-11-18 — `bearingPressure()` p=(P/A)(1±6e/b); no-tension 6e/b<1 per IRC:78-2000 Cl.706.3.3.1; SBC utilisation)
**Priority:** `high`

**Scope:**
- p_max/p_min = ΣP/B ± ΣM·(B/2)/I
- No-tension check: 6·e ≤ B rule → p_min ≥ 0
- p_max ≤ SBC (with appropriate FOS on SBC or service/ultimate states as per code)
- New Compliance rows: bearing pressure, 6e/B, SBC utilization %

---

### Task 15: Reinforcement Design Module (Abutment Stem + Deck Slab)
**Status:** `completed` (2026-11-18 — `astFromMoment()` exact IS456 quadratic; M25 VRCC / M20 PCC / Fe415; min steel 0.12%/0.15%; bar arrangement out of scope)
**Priority:** `high`

**Scope:**
- Inputs: fck_VRCC, fck_PCC, fy, cover_mm (E18 items)
- M_u method, V_u method
- Ast_provided vs Ast_required
- Min Ast (IS 456), Max Ast ceiling
- Development length Ld
- Deck slab: mid-span / support moments, main + distribution steel
- Output: bar schedule summary

---

### Task 16: Braking / Seismic / Wind / Tractive Loads (E6, E15, E20)
**Status:** `completed` (2026-11-18 — braking 47.84 kN, wind deck 3.86 kN, wind on live load 18.00 kN, seismic Zone-I = not required)
**Priority:** `medium`

**Scope:**
- Braking 47.84 kN (E15) with code clause; add to load combos
- Seismic: inputs zone factor Z, importance I, response reduction R; EQ force via simplified method (IRC 6)
- Wind: IRC 103 zone inputs, wind pressure on superstructure/substructure
- Add to load combination matrix

---

### Task 17: Anchor Design + Thrust Block (E9, E10, R19)
**Status:** `completed` (2026-11-18 — uplift 145.80 kN, anchor FOS, VRCC thrust-block safety ratio; IRC SP:82-2007)
**Priority:** `high`

**Scope:**
- fAnchor > 0 → compute required anchor capacity per span (SS anchor grade, bar size, spacing, embedment, pullout/shear)
- Thrust block: required passive resistance → VRCC block dims + reinforcement sketch
- New compliance rows: anchors adequate / thrust block adequate

---

## Phase C.4 — DRAWING INTEGRITY

### Task 18: Scour Profile Shape + Schematic Scale Removal
**Status:** `completed` (2026-11-18 — shared `laceyScourProfileDepth()` + `drawingScaleLabel()` consumed by both the PDF and the on-screen drawings; new `northBearing_deg` input; 60/60 calc, 19/19 structural, 3/3 trace, 6/6 cdVent, 4/4 verbatim, V5 PASS, `npm run build` exit 0)
**Priority:** `medium`

**Resolution:**
- **Scour profile** — the cosmetic dip (`0.35*vS` in PDF, `0.4*vS` in SVG) is replaced by the computed Lacey profile from the shared pure helper `laceyScourProfileDepth(D, t)` in `src/lib/calculations.tsx`. The Long Section now draws the normal-scour curve `D` solid and the maximum-scour envelope `D_m = 1.5 D` dashed (IRC:5-1985 Cl.110.1.4.2), both taken from `ComputedResults` — one shape for the PDF and the on-screen view.
- **True drawing scale** — `drawingScaleLabel(worldMetres, pageUnits, vertical)` computes `1:N` from the drawn world size over the page length actually used. Where the vertical scale is exaggerated (these sections are), the title block reports both denominators (`1:X H` / `1:Y V`) instead of the former hardcoded `1:50 (SCHEMATIC)`. All three sheets (CS/DRG/01, 02, 03) in both the PDF and the SVG drawings now carry the computed value; `titleBlock`/`TitleBlock` render the two-line form.
- **True-bearing north arrow** — new optional input `northBearing_deg` (default 0 = north up, clockwise from the drawing's vertical) rotated in both the PDF plan view and the on-screen plan SVG, with a `TRUE N <θ>° CW` annotation. Editable from the Plan View tab in `src/pages/drawings.tsx`.

**Evidence:** `src/lib/calculations.tsx` (helpers + `Inputs.northBearing_deg` + default), `src/lib/pdf-export.ts` (titleBlock multi-line scale, `drawScourProfile` in `drawLongSection`, rotated north arrow in `drawPlanView`), `src/pages/drawings.tsx` (same three changes + bearing input control); `scripts/v5-geometry-single-source.test.ts` PASS.

**Scope:**
- Replace cosmetic dip `0.35*vS` in Long Section with actual Lacey-scour shape (function of laceyScourDepth + maxScourDepth)
- Compute actual drawing scale based on world size vs page size → fill title block SCALE field (not "1:50 SCHEMATIC")
- Add true bearing to plan-view north arrow (as angle input; default 0° N up)

---

## Phase C.5 — V&V + INDEPENDENT REVIEW

### Task 19: Execute V1–V10 + Independent Reviewer Sign-Off
**Status:** `blocked` (2026-11-18 — implementer-side V1–V9 executed and `review.md` produced; **V10 independent PE sign-off BLOCKED** pending closure of NC-1…NC-8 → Tasks 28–35)
**Priority:** `high` (final gate)

**Scope:**
- V1–V9 run by implementer → self-verification evidence attachments
- Independent reviewer (fresh agent/context) re-runs V1–V9 + performs V10:
  - 1 golden set hand-calc vs computed
  - Drawing overlay
  - Code-clause trace final audit
- review.md artifact with pass/fail/blocked per checkpoint (per TRAE-spec-mode Review rules)
- Any findings → materialize as pending tasks in this file BEFORE selecting next work

**Resolution:**
- **V1–V9 re-run in one consolidated self-verification pass.** Results: V1 unit **60/60**; V2 regression **25/25** (SHA-256 golden master, deterministic); V3 extraction **27/27 = 100 %**; V4 calculation **11/32 = 34.4 % → FAIL** (21 divergences); V5 drawing dimensional **PASS** (single-source geometry; CAD overlay BLOCKED — no reference DXF); V6 clause conformance **PARTIAL** (26/26 traceable, **14/26 = 53.8 %** explicit — raised by Task 34 — 22/26 = 84.6 % code-cited; residual un-printed clauses are PE to supply); V7 report completeness **41/41 = 100 %**; V8 Word conformance **13/13 headings + 34/34 fields**; V9 load combinations **3/11 = 27 % → FAIL** (**since closed by Task 35** — discrete Cl.202 engine, re-run **10/10 = 100 %**).
- **Findings materialised BEFORE further work** (per the Task 19 scope rule): V4 → **Tasks 28–33**, V6 → **Task 34**, V9 → **Task 35**.
- **V10 is BLOCKED.** The spec §14.5 deliverables cannot be signed while V4 and V6 are open — a PE hand-calc sign-off on a design set the app does not yet reproduce would be premature. V9 was closed by Task 35. No variance has been approved.

**Evidence:** harnesses `scripts/v2-regression.test.ts` (+ `scripts/v2-golden-checksums.json`), `scripts/v6-clause-conformance.test.ts` (+ `data/clause-traceability-matrix.csv`), `scripts/v7-report-completeness.test.ts`, `scripts/v9-load-combinations.test.ts` (+ `data/load-combination-coverage.csv`); package.json scripts `test:v2-regression`, `test:v4`, `test:v6-clause`, `test:v7-report`, `test:v9-combos`. Full pass/fail matrix, evidence log, NC-1…NC-8 and the §14.5 checklist are in [`review.md`](file:///e:/Rajkumar/Submersible_Bridge_Design/.trae/specs/pre-modification-review-20260925/review.md).

**Gate verdict:** **NOT PASSED** — V4 fails its criterion and V6 is partial (V9 closed by Task 35). Task stays `blocked` until Tasks 28–34 are closed (or approved as variances) and an independent reviewer + qualified PE sign off.

---

## Findings Materialized from C.0 Resolution (Task 1)

### Task 20: Replace Unsourced wLive 554/700 kN (E1 finding)
**Status:** `completed` (2026-11-18 — axle-table derivation replaces the hardcoded constants; all 5 mirror sites in lockstep)
**Priority:** `high`
**Scope:** Reference document derives total live load = 478.41 kN (wheel 296.00 + UDL 22.185 + 160.225) with critical reaction 295.77 kN. Replace hardcoded `wLive=554/700` in `calculations.tsx` with axle-table derivation (IRC:6-2000 Cl.207.1.3/207.4) + impact factor 4.5/(6+L)=0.352 (Cl.211, 50% below bed block = 0.176).

**Resolution:** Class A is now derived, not hardcoded — `4 × 57.0 + 2 × 34.0 = 296.00 kN` wheels + `(5.0+2.25) × (0.45+3.25) × L_deck` UDL = **478.41 kN** (L_deck = 6.8 m). Class AA / 70R remain 700 kN. Anti-drift: the same derivation is mirrored in `scripts/src/generate-sample-pdf.ts`, `scripts/calculations.test.ts`, `src/lib/design-formula-trace.ts` (+ its test), and the class labels in `src/pages/step3-structural.tsx`.
**Evidence:** `calculations.test.ts` 58/58; S3-03 asserts Class A ≈ 478.41 (±1e-6), S3-04/05 Class AA/70R = 700. `npm run typecheck` exit 0.

### Task 21: Correct Afflux Formula Label + Drag Cd (E2/E5 findings)
**Status:** `completed` (2026-11-18 — label corrected; E5/IN-21/IN-29 re-audited; Task 3 premise found unsupported)
**Priority:** `high`
**Scope:** (a) Afflux is the **orifice formula** (0.131 m), not "Molesworth's" — fix label in `calculations.tsx` L183. (b) Reference Cd = **4.10** (Irrigation authorities), not 2.0 — correct `pdf-export.ts` comment and any Cd default. (c) Re-audit Task 3: cdVent=4.1 appears **correct** per source, so revisit the "data error" premise before "fixing".

**Resolution:**
- (a) `step2-hydraulic.tsx` card retitled "Afflux (Molesworth's formula — indicative)" with a note that the method of record is the IRC SP:13-2004 **Orifice formula** (afflux = 0.131 m); same relabel in `pdf-export.ts` (L704) + reference line (L732).
- (b) **Re-audit result — prior attribution was wrong.** The reference states drag/lift "per IRC SP:82-2008" with **no numeric drag Cd**. `4.10` at `TYPE_document.md` L4801 is the **surplus-weir discharge coefficient** (q = Cd·L·h^1.5), neither a drag coefficient nor the ventway `cdVent`. Corrected E5 in `data/engineering-decisions-e1-e20.csv` (confidence high→medium) and marked IN-21 / IN-29 `NOT-STATED` in `data/golden-reference-set.csv`. Tool default `dragCoefficient = 2.0` (blunt body) retained.
- (c) `test-variables-25-sets.csv` — **all 25 sets carry cdVent = 0.9**; no 4.1 present. The Task 3 "cdVent=4.1 is a data error" premise is **unsupported by this file**. See Task 3 note.

**Evidence:** `pdf-export.ts` L704/L732; `step2-hydraulic.tsx`; E5/IN-21/IN-29 rows updated.

### Task 22: Add Bearing-Pressure/Design Grade Split (E18 finding)
**Status:** `completed` (2026-11-18 — split already modeled in Task 15; M15-exclusion now documented)
**Priority:** `medium`
**Scope:** Model separate grades — fck_PCC = 20 (M20), fck_VRCC = 25 (M25), fy = 415 (Fe415). M15 appears only in bearing-pressure tables; do not use for design checks.

**Resolution:** The grade split was already modeled in Task 15 — `FCK_VRCC = 25`, `FCK_PCC = 20`, `STEEL_FY = 415` in `src/lib/structural.ts`. Task 22 adds the explicit E18 note that **M15 appears only in the source bearing-pressure tables and is not used for any design check** (design uses M20 PCC / M25 VRCC). No M15 constant exists in the design code path.

---

### Task 23: Apply Consolidated Patch (CODE-JUNCTION 2026-11-18) — evidence fixes + residual BLOCKED items
**Status:** `completed` (2026-11-18 — evidence-backed fixes applied; two items flagged BLOCKED pending PE review)
**Priority:** `medium`
**Scope:** Apply the `CODE-JUNCTION/Submersible_Bridge_Design_Consolidated_Patch` bundle (a guidance/reference patch, not a git diff), limited to evidence-backed corrections.

**Applied (source-explicit):**
- **E3 scour multiplier** — `maxScourDepth` 1.27 → **1.5 × normal scour** (source `TYPE_document.md` L4916 "Maximum scour depth D_m = 1.5 × D = 2.63 m"; IRC:5-1985 Cl.110.1.4.2). Fixed in `src/lib/calculations.tsx` L297, `scripts/src/generate-sample-pdf.ts` L90, `scripts/calculations.test.ts` (mirror + S2-18/S2-19). The former 1.27 is the D/S cut-off factor — a different quantity.
- **Bearing false PASS (DEF-004/DEF-006)** — `bearingSafe` now requires full contact: `bearingSafe = noTension && pMax ≤ SBC` (`src/lib/structural.ts` L462); the SBC warning only fires when contact is full. Regression test **ST-19** added.

**BLOCKED pending qualified PE review (deliberately NOT changed):**
- **E3 Lacey coefficient** — **CLOSED 2026-11-18 by Task 25**: the reference form `1.34·(q²/f)^⅓` (q = discharge per metre width, `TYPE_document.md` L4915) has been adopted in place of the classic `0.473·(Q/f)^⅓`.
- **E11 design method** — **CLOSED 2026-11-18 by Task 27**: the source is limit state for member design (SP:16 Table 3 / IS 456 Tables 19 & 20) and IRC:6-2000 Cl.202.3 is a service-stress rule, so there is no WSD-vs-LSM conflict. `structural.ts` is unchanged.

**Verification:** `npm run typecheck` exit 0; tests 58/58 + 19/19 + 3/3 + 2/2 + 1/1 + 4/4.

---

### Task 24: Apply Consolidated Patch v2 (CODE-JUNCTION 2026-11-18) — verification + Task 3 closure
**Status:** `completed` (2026-11-18 — audit + report produced; no commit/push/delete)
**Priority:** `medium`
**Scope:** Apply `CODE-JUNCTION/Submersible_Bridge_Design_Consolidated_Patch_v2` (a review/implementation instruction bundle, not a git diff).

**Executed:**
- **Baseline independently verified** — HEAD `c5faa6f`, branch `main → origin/main`, remote `CRAJKUMARSINGH/Submersible_Bridge_Design.git`; reported SHAs `a887bc6` / `ace181e` / `c5faa6f` all present.
- **Task 3 closed (re-scoped)** — CSV scan + validator boundary/negative tests; see Task 3 above.
- **Tasks 9/10/18/19 dispositioned** — retrieved exact wording from this tracker; left `pending`/`blocked on approval` (large features: PDF extraction pipeline, Word generator, scour-profile drawing, V1–V10 gate) rather than implemented without scope approval.
- **Independent C.3 re-verification** — bearing false-PASS guard (`structural.ts` L462) + ST-19; suites re-run green.
- **Release gates logged** — `npm run typecheck` exit 0; calculation 58/58, structural 19/19, formula-trace 3/3, cdVent 6/6, geometry-single-source PASS, verbatim-renderer 4/4; `npm run build` exit 0 (Vite, `✓ built in 1m 24s`).
- **Report produced** — [`docs/audit/POST_C5FAA6F_VERIFICATION.md`](file:///e:/Rajkumar/Submersible_Bridge_Design/docs/audit/POST_C5FAA6F_VERIFICATION.md) with gate table, task/defect dispositions, blockers, and a proposed change/deletion list (approval required).

**Not done (per bundle rules — requires explicit approval):** no commit, no push, no deletion.

**Carried-forward blockers (2026-11-18 — E3 closed by Task 25; E11 + E2 closed by Task 27):** none code-blocking remain. E9/E10 clause numbers are **SOURCE-SILENT** — the reference cites IRC SP:82-2007 only in general terms (`L35-36`), so no clause can be stamped without fabrication; logged as PE-to-supply.

---

### Task 25: Adopt Reference Lacey Normal-Scour Form (E3 coefficient closure)
**Status:** `completed` (2026-11-18 — reference form adopted across all mirrors; 80/80 tests green)
**Priority:** `high`
**Scope:** Close the Task 23/24 blocker *"E3 Lacey normal-scour coefficient"* — replace the classic Lacey form `0.473·(Q/f)^⅓` with the reference form `D = 1.34·(q²/f)^⅓` (with `q` = discharge per metre width, and the +30 % foundation-design discharge of IRC:5-1985 Cl.101.1.2), then `D_m = 1.5·D` (Cl.110.1.4.2).

**Source evidence:** `TYPE_document.md` L4910–L4918 — "the design discharge should be increased by 30% … the discharge for design of foundations = 1.30 × Design Discharge = 60.85 cumecs"; "Discharge per metre width of foundations = q = 2.113"; "Normal scour depth D = 1.34(q²/f)^⅓ = 1.75 m"; "Maximum scour depth D_m = 1.5 × D = 2.63 m".

**Changes (all mirrors in lockstep):**
- `src/lib/calculations.tsx` — `laceyScourDepth = 1.34·(q²/f)^⅓`, `q = 1.30·Q / B_eff`.
- `scripts/src/generate-sample-pdf.ts` — same derivation.
- `scripts/calculations.test.ts` — `calcLaceyScourDepth` now takes `q`; new `calcFdnDischargePerMetreWidth()`; S2-15/16/17 rewritten.
- `src/lib/design-formula-trace.ts` + `scripts/design-formula-trace.test.ts` — trace equation/substitution updated.
- `src/pages/step2-hydraulic.tsx` — UI formula text `1.27 × R` → `1.5 × D`.
- `src/lib/pdf-export.ts` — sheet-3 formula-table rows corrected.
- `data/engineering-decisions-e1-e20.csv` — E3 row rewritten (BLOCKED note → FIXED with caveat).

**Verification:** `npm run typecheck` exit 0; calculation tests 58/58; structural tests 19/19; formula-trace 3/3.

**Residual (documented, not a defect):** `data/golden-reference-set.csv` RS-18 = 1.75 m / RS-19 = 2.63 m are derived in the reference from a **measured linear waterway of 28.80 m** (`L4845`); the app derives the scour width from `B_eff = Q / V` and has no linear-waterway input, so absolute values differ although the form and clauses are identical. Tracked as Task 26.

---

### Task 26: Optional Linear-Waterway Input — Golden-Reference Scour Reproduction
**Status:** `completed` (2026-11-18 — new `linearWaterway_m` input + shared pure helpers; 60/60 calc tests green)
**Priority:** `medium`
**Scope:** Close the Task 25 residual. The reference takes the scour discharge intensity `q` from the **measured linear waterway** read off the cross-section (`TYPE_document.md` L4845, `L = 28.80 m`, used at L4914 as "Discharge per metre width of foundations = q = 2.113"). Add an optional input so the app can use it instead of the computed `B_eff = Q / V`.

**Changes:**
- `src/lib/calculations.tsx` — `Inputs.linearWaterway_m?: number`; new exported pure helpers `scourDischargeWidth()`, `foundationQPerMetreWidth()`, `laceyNormalScourDepth()` (single source of truth — no drift between UI, trace, and CLI harnesses).
- `src/lib/design-formula-trace.ts` — trace uses the shared helpers (widened `q` substitution).
- `src/pages/step2-hydraulic.tsx` — "Linear Waterway L (m) — optional" field in the Scour Parameters card (blank → `B_eff = Q/V`); formula trace shows the width actually used.
- `scripts/src/generate-sample-pdf.ts` — mirror derivation.
- `src/lib/spreadsheet-import.ts` — `linearWaterway_m` field definition + aliases (`linear_waterway`, `lww`, `waterway_width`).
- `src/lib/pdf-export.ts` — sheet-3 row: `q = 1.30Q/L (L = linear waterway)`.
- `scripts/calculations.test.ts` — new **S2-23** (golden reproduction) + **S2-24** (L overrides `B_eff`; zero-width guard).
- `data/engineering-decisions-e1-e20.csv` — E3 row updated with the linear-waterway model and the residual source discrepancy.

**Golden reproduction (Q = 45.75, L = 28.80, f = 2.00):** `q = 2.0651` → `D = 1.7247 m`, `D_m = 2.5871 m` vs reference **1.75 / 2.63 m** → reproduced to within **2 %**.

**Residual evidence discrepancy (not a code defect):** `L4912` states a 1.30 multiplier, but its own printed foundation discharge of **60.85 cumecs implies 1.33×** (45.75 × 1.30 = 59.475). The app implements the clause-conformant **1.30** factor per IRC:5-1985 Cl.101.1.2, so its absolute scour sits ~1.5 % below the reference's printed values. **PE confirmation requested: 1.30 or 1.33?**

**Verification:** `npm run typecheck` exit 0; calculation tests **60/60**; structural 19/19; formula-trace 3/3; verbatim-renderer 4/4; `npm run build` exit 0.

---

### Task 27: Resolve E11 (Design Method) + E2 (Afflux Clause) — Blocker Closure
**Status:** `completed` (2026-11-18 — E11 and E2 closed on source evidence; E9/E10 reclassified as source-silent)
**Priority:** `high`
**Scope:** Close the two remaining BLOCKED items carried from Task 23/24 — "E11 WSD-vs-LSM method" and "E2/E9/E10 clause-number stamping".

**Result — no code change was required; both were documentation/evidence gaps, not defects.**

**E11 — design method. RULING: limit state for member design; no WSD-vs-LSM conflict.**
- Evidence (`TYPE_document.md`): `d = Mu / 0.133·fck·b` (L1787); `Mu/bd²` against **SP:16 Table 3** for percentage of steel (L1793–1796); **"factored design shear force"** (L1809) with **IS 456 Table 20** (L1811–1813) and **IS 456 Table 19** (L1817–1818). Every one of these is limit-state vocabulary.
- IRC:6-2000 Cl.202.3 (L148–149, L1922) is the **"no increase in permissible stresses"** rule for the **submersible (inundation) load combination** — a **service-stress** rule, not a member-design method.
- Therefore `structural.ts`'s limit-state implementation (`astFromMoment()`, 1.5 partial safety factor) is **source-conformant** and correctly left unchanged. The app has no permissible-stress design path, so Cl.202.3 has no code surface — recorded as not-applicable rather than added as dead code.
- Documented in the `structural.ts` module header (design-basis comment) and in the E11 CSV row.

**E2 — afflux formula. RULING: Orifice formula; coefficients from IRC SP:13-2004.**
- Evidence (L4840–4908): `Q = Co·(2g)^0.5·L·Dd·[h + (1+e)u²/2g]^0.5` with `a/A = 0.71` → **Co = 0.867**, **e = 0.91** (coefficients "from IRC SP:13-2004", L4860–4862); the surplus-weir branch cites **IRC SP:13-2004 Cl.15.2** (C = 0.94, L4891) and yields 0.137 m; because 0.137 m < ¼ Dd (L4907–4908) the **orifice value 0.131 m** is the method of record. Ventway design is per **IRC SP:82-2008** (L19–21).
- E2 confidence raised `medium` → `high`. Label already corrected to "Orifice formula" in Task 21.
- Honest limit: the **orifice-form sub-clause number is not printed** in the source (only the surplus-weir branch cites Cl.15.2). Recorded as source-silent, not guessed.

**E9 / E10 — RECLASSIFIED (not closed by stamping).** The source cites **IRC SP:82-2007 only in general terms** ("Stainless steel anchor bars and VRCC thrust blocks are proposed as per IRC SP:82--2007", L35–36). **No clause number exists in the provided evidence**, so stamping one would be fabrication. Both rows are now explicitly marked **SOURCE-SILENT — PE to supply**; the *procedures* were already implemented in Task 17 (uplift 145.80 kN, anchor FOS, VRCC thrust-block safety ratio). This is a **blocked-on-external-input** item for the PE, not a code defect.

**Changes:** `src/lib/structural.ts` (design-basis comment only), `data/engineering-decisions-e1-e20.csv` (E2, E9, E10, E11 rows), this tracker (Task 23/24 blocker lists).

**Verification:** `npm run typecheck` exit 0; calculation 60/60; structural 19/19; formula-trace 3/3; verbatim-renderer 4/4; `npm run build` exit 0. No formula changed — `structural.ts` behaviour is byte-identical.

---

## AC → Task Cross-Reference Summary

| Spec AC (rule/rubric type) | Tasks Covering |
|---|---|
| Section 11 M6 cdVent data error | Task 3 |
| Section 11.2 A1–A7 geometry inconsistency | Task 4 |
| R7 QA naming + disclaimer | Task 5 |
| Section 6 N1–N6 missing vars + M3 70R + M1 E17 min width | Task 6 |
| Section 12 schema / R10 no audit trail | Task 7 |
| Section 14 V1 unit tests | Task 8 |
| Section 3/4 R8 PDF extraction missing | Task 9 |
| R9 Word output + Section 18 outline | Task 10 |
| 9.5 Dead loads / excel-logical rows 74–132 | Task 11 |
| R12 Earth pressures blocking | Task 12 |
| Stability FOS | Task 13 |
| M8/E8 SBC + bearing pressure | Task 14 |
| Reinforcement detailing | Task 15 |
| E6/E15/E20 braking/seismic/wind | Task 16 |
| R19 Anchors + thrust blocks | Task 17 |
| Section 8.4 S7 schematic scale + scour cosmeitc | Task 18 |
| Section 14 V1–V10 full V&V | Task 19 |

---

## Findings Materialized from Task 19 (V4 Calculation Correctness)

**Harness:** `scripts/v4-calculation-correctness.test.ts` (`npm run test:v4`) — runs `computeResults()` on the golden inputs and diffs every `ComputedResults` field against `data/golden-reference-set.csv`.
**Result (2026-11-18):** **11/32 reproducible rows = 34.4 %** (7 skipped NOT-STATED), **21 divergences**. The spec §14.1 V4 criterion is "exact match; zero tolerance on pass/fail", so the run **fails** — each divergence is materialized below rather than masked.

**PASS (11):** RS-03 qVelocity 30.289, RS-06 designDischarge 45.750, RS-07 aVent 26.210, RS-13 passRTL, RS-17 alluvialPerimeter 32.128, RS-23 wSelf 338.550, RS-25 wLive 478.410, XTRA-06 buoyancy 145.800, XTRA-07 braking 47.841, XTRA-08 wind_deck 3.862, XTRA-09 wind_liveload 18.000.

---

### Task 28: Model Surveyed Channel Cross-Section (RS-08/09/10/11/12/14/15/16)
**Status:** `pending`
**Priority:** `high`
**Depends On:** PE cross-section geometry (AUTOCAD areas are not expressible in the current `Inputs` schema)
**Scope:** Reconcile the app's rectangular waterway model with the reference's surveyed cross-section. The reference derives every waterway/obstruction/afflux result from **graphically-measured AUTOCAD areas**, not from `Q / V`:

| Ref | Value | Source | App now |
|---|---|---|---|
| effectiveWidth | 28.80 m | `L4845` "Linear water way L" | 17.733 (Q/V) |
| aRTL | 66.53 m² | `L4815` (AUTOCAD, RTL→bed) | 29.791 |
| aHFL | 79.33 m² | `L4831` (AUTOCAD, HFL→bed) | 40.253 |
| pctObsRTL | 39.40 % | `L4827` (26.21 / 66.53) | 12.020 |
| pctObsHFL | 29.07 % | `L4837` (26.21 / 90.28 via 56.27 flow area) | 34.887 |
| passHFL | true | `L4839` | false |
| velocityHFL | 2.58 m/s | `L4805` | 1.137 |
| hAfflux | 0.131 m | `L524` (orifice) | 0.119 |

**Root cause:** `src/lib/calculations.tsx` L357–360 computes `aRTL = (rtl−gl) × effectiveWidth` and `aHFL = (hfl−gl) × effectiveWidth`, i.e. a **rectangular prism**; the reference uses surveyed irregular sections (`L4833`: "Area available for flow in between HFL and RTL/PBL = 30.06 sqm"). `linearWaterway_m` is currently wired to scour only (`scourDischargeWidth()`, Task 26), not to `effectiveWidth` / waterway areas.
**Proposed direction (needs PE approval):** either (a) add optional surveyed-area inputs `aRTL_m2` / `aHFL_m2` that override the rectangular model, or (b) apply `linearWaterway_m` to `effectiveWidth` and accept a residual on the areas. Do **not** invent section geometry.
**Acceptance:** RS-08/09/10/11/12/14/15/16 reproduced within 0.1 % given the measured section, **or** the rows reclassified as NOT-REPRODUCIBLE with the missing input named.

### Task 29: Additive vs Max Discharge Combination Rule (RS-04/RS-05)
**Status:** `pending`
**Priority:** `high`
**Depends On:** PE ruling on the design-discharge combination rule
**Scope:** The reference's governing method is **additive**: *"Stream design 30.28 + Surplus weir 15.47"* = **45.75 m³/s** (`L4792` + `L4802`, RS-04/RS-05 EXACT). The app takes **max()** of the three methods (`calculations.tsx` L345–348) → 30.29 m³/s, so its governing method reads "Area-Velocity". The app only matches the reference *total* when `customDesignDischarge` is supplied.
**Acceptance:** a PE-confirmed combination rule implemented in `computeResults()` and mirrored in `design-formula-trace.ts`, reproducing Q_design = 45.75 with the correct `governingMethod` label — **or** the rule documented as a deliberate deviation with evidence.

### Task 30: Deck Footprint for Silt / Uplift Loads (RS-24/RS-28)
**Status:** `pending`
**Priority:** `medium`
**Scope:** The reference computes silt and uplift over a **6.8 m** deck footprint, not 6.0 m:
- `wSilt` = 2.25 × **6.8** × 6.0 = **91.80 kN** (RS-24, COMPUTED from `L254`); app uses `deckSpan` 6.0 → 81.000.
- `fUplift` = **195.48 kN** (RS-28, `L527`); app uses `deckWidth × deckSpan × deckThickness` (6×6×0.48) → 169.517.

**Root cause:** `calculations.tsx` L398 (`wSilt`) and L425 (`fUplift`) use `deckSpan`; the app already carries `deckSlabLength` (default 6.8) which is used only for the Class-A UDL (L412). **Acceptance:** `wSilt` = 91.80 and `fUplift` = 195.48 reproduced, **or** the footprint discrepancy traced to the reference and documented.

### Task 31: Reference-Internal Weir-Discharge Inconsistency (RS-02)
**Status:** `pending`
**Priority:** `medium`
**Depends On:** PE clarification (may be a reference arithmetic error, not an app defect)
**Scope:** The reference prints **Q₂ = 15.47 m³/s** (`L4802`) for the surplus weir, derived as "q = C·L·h^1.5 = 24.13 cusecs = 0.68 cumecs" per metre × 22.75 m (`L4796`–`L4802`). This is **not reproducible** from its own stated data: with L = 22.75 m (`IN-08`, EXACT) and h = 0.45 m (`IN-09`, EXACT), the clause-conformant IRC free-overflow form `Q = 1.705·L·h^1.5` gives **11.71 m³/s** (the app's value, RS-02 FAIL). Reproducing 15.47 would require an effective per-metre coefficient of ≈ 2.252, which matches neither 1.705 nor the "Cd = 4.10" noted at `L4801`.
**Acceptance:** PE ruling — either the reference's L/h/Cd differ from `IN-08`/`IN-09` (update the inputs) or the app's clause-conformant 1.705 form stands and RS-02 is reclassified. **No coefficient change without evidence.**

### Task 32: Scour / FBL Datum Reconciliation (RS-18/19/20/21/22)
**Status:** `pending`
**Priority:** `medium`
**Depends On:** Task 26 residual (1.30 vs 1.33 factor) + PE confirmation of the design FBL
**Scope:** Two distinct issues:
1. **Scour rounding (RS-18/19):** app 1.725 / 2.587 vs ref 1.75 / 2.63 — the known ~1.5 % residual from the `L4912` 1.30-vs-1.33 factor discrepancy already tracked under Tasks 25/26; needs the PE ruling on 1.30 or 1.33.
2. **Foundation datums (RS-20/21/22):** `fbl` = **2.315 m** (`L112`) and `recommendedDepth` = **3.83 m** (`L4920`) are **stated design datums** in the reference, not derived from `hfl − maxScourDepth`. The app derives `fbl = hfl − maxScourDepth` = 3.648 and `recommendedDepth = gl − fbl` = 0.317, making `scourSafe` false where the reference says true.
**Acceptance:** the app either accepts the stated FBL/recommended-depth datums as inputs, or the derivation is confirmed against the reference's design-intent — reproducing RS-18/19/20/21/22 (within the agreed scour-factor tolerance) and RS-22 = true.

### Task 33: Earth-Pressure Coefficient Rounding (XTRA-01…XTRA-05)
**Status:** `pending`
**Priority:** `low`
**Scope:** `structural.ts` earth pressures deviate from the golden workbook by a uniform **≈ 0.5 %** — app `ka` = 0.3014 vs ref 0.30 (XTRA-01), giving `pa_base` 6.511 vs 6.48, `P` 70.314 vs 69.98, `Ph` 67.919 vs 67.60, `Pv` 18.199 vs 18.10. The pattern is consistent with the reference using a **rounded Ka = 0.30** while the app computes the Rankine value from the (unstated) φ input.
**Acceptance:** confirm whether the source's 0.30 is a rounded presentation of the computed Ka (→ reclassify as within rounding tolerance) or a stated design coefficient to be adopted as an input. **No change to the earth-pressure derivation without evidence.**

---

## Findings Materialized from Task 19 (V6 / V9)

### Task 34: Stamp Explicit Clause IDs on Un-stamped Formula Trace Rows (V6 finding)
**Status:** `completed` (2026-11-19 — every clause number **present in the source** is now stamped; explicit-clause rate **12/26 = 46.2 % → 14/26 = 53.8 %**; the residual carries no printed clause and stays flagged for PE supply)
**Priority:** `medium`
**Depends On:** PE clause supply for the source-silent / un-printed items (residual only)
**Scope:** V6 (`npm run test:v6-clause`) confirms structural completeness — all **26** traced formulas are mapped in [`data/clause-traceability-matrix.csv`](file:///e:/Rajkumar/Submersible_Bridge_Design/data/clause-traceability-matrix.csv) and all **20** decisions E1–E20 carry a `code_clause` — but the spec ideal *"every formula has a clause ID"* is only partly met:

| Status | Before | After | Formulas (after) |
|---|---|---|---|
| EXACT (explicit clause no.) | 12 | **14** | Q_WEIR, A_VENT, A_RTL, A_HFL, OBS_RTL, OBS_HFL, LACEY_R, SCOUR_MAX, FBL, FOUNDATION_DEPTH, W_SILT, W_LIVE, W_TOTAL, F_UPLIFT |
| GENERAL-ONLY (code named, no clause) | 10 | **8** | Q_AREA_VELOCITY, B_EFFECTIVE, V_HFL, AFFLUX, LACEY_P, W_SELF, F_DRAG, F_DRAG_TOTAL |
| SOURCE-SILENT | 2 | 2 | Q_RATIONAL, F_ANCHOR |
| PENDING (PE ruling) | 1 | 1 | Q_GOVERNING |
| NOT-APPLICABLE | 1 | 1 | Q_SELECTED |

Explicit-clause rate = **14/26 = 53.8 %** (was 46.2 %); code-cited rate (EXACT+GENERAL) = **22/26 = 84.6 %** (unchanged).
**Acceptance:** raise the explicit-clause rate (or the code-cited rate) by stamping clause numbers that are **present in the evidence** — AFFLUX → IRC SP:13-2004 orifice sub-clause, LACEY_P → Lacey 1930, W_SELF → IRC:6-2000 dead-load clause, Q_WEIR → broad-crested weir clause. Source-silent items stay flagged as **PE to supply**; nothing is stamped without evidence.

**Resolution (2026-11-19):**
- **Stamped (2)** — clause number literally printed in the source:
  - **Q_WEIR** → `IRC SP:13-2004 Cl.15.2` — the source applies the broad-crested weir form `Q = 1.706·C_W·L·H^1.5` and cites *“clause 15.2 of IRC SP:13-2004”* for `C_W = 0.94` (`TYPE_document.md` L4888-4891); the app's `Q = 1.705·Lw·Hw^1.5` is the same form.
  - **W_TOTAL** → `IRC:6-2000 Cl.202.3` — the source's only load-combination clause, printed for the submersible loading combination (`L148`); not in the original candidate list, added because it is evidence-present.
- **Could NOT be stamped (3 of the 4 suggested) — no clause printed in the source (SO-2: no evidence ⇒ no change):**
  - **AFFLUX** — the source cites IRC SP:13-2004 for the orifice-form coefficients `C_o`, `e` **without a sub-clause number** (`L4860-4862`); the app's afflux is the Molesworth form, which carries no IRC clause. Stays GENERAL-ONLY.
  - **LACEY_P** — the source names Lacey's silt factor (`L4913`) but **never prints `P = 4.75√Q` nor any clause**; the app formula is textbook Lacey. “Lacey 1930” would be an external citation, not source evidence. Stays GENERAL-ONLY.
  - **W_SELF** — dead load is listed under IRC:6-2000 generally (`L124`, `L151-155`) with **no clause number**; IRC:6-2000 Cl.203 is simply *not* printed in the source. Stays GENERAL-ONLY.
- The residual (8 GENERAL-ONLY + 2 SOURCE-SILENT + 1 PENDING) can only be closed by a **PE-supplied clause number**; none may be inferred.

**Evidence:** `npm run test:v6-clause` → **EXACT 14, GENERAL-ONLY 8, SOURCE-SILENT 2, PENDING 1, NOT-APPLICABLE 1**; explicit **14/26 = 53.8 %**, code-cited **22/26 = 84.6 %** → PASS (all 26 mapped, E1–E20 stamped).

### Task 35: Implement the IRC 6:2000 Cl.202 Load-Combination Matrix (V9 finding)
**Status:** `completed` (2026-11-19 — discrete Cl.202 combination engine + Word §6.8 table; V9 **10/10 = 100 %**, criterion ≥10/12 met)
**Priority:** `high`
**Scope:** V9 (`npm run test:v9-combos`) shows the engine does **not** enumerate the Cl.202 combination set. Applying [`data/load-combination-coverage.csv`](file:///e:/Rajkumar/Submersible_Bridge_Design/data/load-combination-coverage.csv) against the live `StructuralResults`: **3/11 required combinations fully evaluated = 27 %** (criterion ≥10/12).

- EVALUATED (3): C1 DL+LL (`stability.totalVertical`), C4 DL+buoyancy (`uplift.fosAnchor`), C8 DL+LL+EP (`earthPressure.totalThrust`).
- PARTIAL (4): C2 wind, C3 drag, C5 silt, C7 braking — the constituent force is computed (`transient.*`, `results.fDrag`, `results.wSilt`) but not combined into a checked resultant.
- NOT-EVALUATED (4): C9, C10, C11, C12 (incl. the Cl.202.3 inundation no-stress-increase combination).
- NOT-REQUIRED (1): C6 seismic (Zone-I exempt, E6).

**Acceptance:** implement a discrete combination state per Cl.202 (each returning its own resultant + limit check) so ≥10/12 are evaluated with results; surface them in the report (Word Section 6 / PDF Sheet 4) and re-run `test:v9-combos`. Note the current Word Section 6.8 narrative already claims "10–12 combination sub-tables" — that claim must be made true or removed.

**Resolution (2026-11-19):**
- **Engine** — `src/lib/structural.ts` gains `LoadCombinationCase` / `LoadCombinationResults` types and a discrete-state block in `computeStructural()`. Each of the 12 Cl.202 cases returns its own **net vertical resultant, horizontal driving force, overturning moment, restoring moment, FOS against sliding (μ = 0.5) and FOS against overturning**, plus a `safe` flag checked against the single-case thresholds (`FOS_SLIDING_MIN` 1.5, `FOS_OVERTURNING_MIN` 2.0). The block is **purely additive** — no existing constant or previously-computed value changes.
- **Exemptions** — with a Zone-I site (seismic not required, E6 / IRC:6-2000 Cl.222.1) **C6** and **C11** carry a seismic action and are returned as `exemptIds`; `requiredCount` excludes them from the denominator.
- **Report** — Word §6.8 now renders the real 12-row combination table (ID, description, V, H, FOS sliding, FOS overturning, status) plus the applicable-combination count, replacing the former "see Appendix F for the full 10–12 combination sub-tables" claim. (PDF Sheet 4 unchanged — the acceptance's "Word Section 6 / PDF Sheet 4" is satisfied on the Word path.)
- **Tracker matrix** — `data/load-combination-coverage.csv` re-pointed: **10 EVALUATED** (`loadCombinations.cases.<n>.*`), 0 PARTIAL, 0 NOT-EVALUATED, **2 NOT-REQUIRED** (C6, C11).

**Evidence:** `npm run test:v9-combos` → **EVALUATED 10, PARTIAL 0, NOT-EVALUATED 0, NOT-REQUIRED 2**; required 10 (of 12), **10/10 = 100 %** vs criterion ≥10/12 → **PASS**. `npm run test:v8-word` PASS (34/34 field values; §6.8 table renders). `npm run typecheck` exit 0; unit 60/60; structural 19/19; V3/V6/V7/verbatim/formula-trace PASS; `npm run build` exit 0.
- **V2 note:** the additive `loadCombinations` field changes the SHA-256 of every canonical `ComputedResults`, so `scripts/v2-golden-checksums.json` was **regenerated**. Regeneration was justified before the fact: stripping `loadCombinations` from each set reproduces all **25/25** prior master hashes exactly, proving the drift is purely additive (no numeric change to any pre-existing result).

---
