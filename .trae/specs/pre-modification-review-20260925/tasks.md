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
**Status:** `pending` (T21 re-audit 2026-11-18: premise unsupported — see note; validator + CSV audit still to do)
**Priority:** `high`

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
**Status:** `pending`
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
**Status:** `pending`
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
**Status:** `pending`
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
**Status:** `pending`
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
**Status:** `pending`
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
**Status:** `pending`
**Priority:** `medium`

**Scope:**
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
**Status:** `pending`
**Priority:** `high`

**Scope:**
- Add docx dependency (docx / office-js) — peer review library choice
- Template-driven: map Section 18 outline (1.1 → 18.13) to docx section objects with heading levels
- Populate: metadata, 3 design step tables, compliance, drawing placeholders (drawings to vector-embedded later in C.4)
- V8 conformance check: verify all headings present in output

**AC Coverage:** spec.md R9, Section 3 missing Word pipeline, Section 18 proposed outline

**Test Requirements (TR):**
- **RULE:** Generated .docx has 13 top-level sections (1. Title … 13. Appendices) with correct heading level 1
- **RULE:** For each field in Section 10 Report-Field Inventory, corresponding docx XML paragraph contains the value (spot-check N≥20)
- **RUBRIC:** Visual fidelity to outline. 0=sections unordered or missing 3+, 1=minor layout issues, 2=identical structure. Pass ≥1.

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
**Status:** `pending`
**Priority:** `medium`

**Scope:**
- Replace cosmetic dip `0.35*vS` in Long Section with actual Lacey-scour shape (function of laceyScourDepth + maxScourDepth)
- Compute actual drawing scale based on world size vs page size → fill title block SCALE field (not "1:50 SCHEMATIC")
- Add true bearing to plan-view north arrow (as angle input; default 0° N up)

---

## Phase C.5 — V&V + INDEPENDENT REVIEW

### Task 19: Execute V1–V10 + Independent Reviewer Sign-Off
**Status:** `pending`
**Priority:** `high` (final gate)

**Scope:**
- V1–V9 run by implementer → self-verification evidence attachments
- Independent reviewer (fresh agent/context) re-runs V1–V9 + performs V10:
  - 1 golden set hand-calc vs computed
  - Drawing overlay
  - Code-clause trace final audit
- review.md artifact with pass/fail/blocked per checkpoint (per TRAE-spec-mode Review rules)
- Any findings → materialize as pending tasks in this file BEFORE selecting next work

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
