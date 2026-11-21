# IMPLEMENTATION PLAN — Submersible Bridge Design (REDESIGN Option C)

**Date Issued:** 2026-09-25  
**Document ID:** IMPL-PLAN-25092026-V1.0  
**Governing Spec:** [spec.md](file:///e:/Rajkumar/Submersible_Bridge_Design/.trae/specs/pre-modification-review-20260925/spec.md)  
**Governing Tasks:** [tasks.md](file:///e:/Rajkumar/Submersible_Bridge_Design/.trae/specs/pre-modification-review-20260925/tasks.md)  
**Session Summary:** [CREAT.MD](file:///e:/Rajkumar/Submersible_Bridge_Design/CREAT.MD)  
**Status:** ⚠️ **PARTIAL C.0 CLEARANCE MODE ACTIVE** (Option C). Non-blocking tasks (C.1 Tasks 3–6 with safe defaults + C.2 scaffold Tasks 7/8/10) proceed NOW. C.3 structural Tasks 11–17, C.4 Task 18, C.5 Task 19 remain **BLOCKED pending Option C deferral matrix (E1–E20)**.

---

## TABLE OF CONTENTS

1.  [Executive Decision Log](#1-executive-decision-log)
2.  [Option A/B/C Detailed Step-by-Step Procedures (FULL TABULAR ANALYSIS)](#2-option-abc-detailed-step-by-step-procedures-full-tabular-analysis)
    *   2.1 Option A — Full C.0→C.5 REDESIGN (all E1–E20 + 1 golden set provided)
    *   2.2 Option B — Spec/Task Revision Workflow (no code)
    *   2.3 Option C — Partial C.0 Clearance (today: deferral matrix + non-blocking tasks)
3.  [CRITICAL CYCLE-0 E-item → Task Dependency Matrix (Tabular)](#3-critical-cycle-0-e-item--task-dependency-matrix-tabular)
4.  [Six-Phase REDESIGN Rollout Matrix (C.0 → C.5) (Tabular)](#4-six-phase-redesign-rollout-matrix-c0--c5-tabular)
5.  [Tasks 1–19 Atomic Action Plan (per tasks.md) with Step-by-Step](#5-tasks-119-atomic-action-plan-per-tasksmd-with-step-by-step)
6.  [V1–V10 V&V Checkpoints (Tabular)](#6-v1v10-vv-checkpoints-tabular)
7.  [Risk Register R1–R20 with Mitigation Actions (Tabular)](#7-risk-register-r1r20-with-mitigation-actions-tabular)
8.  [Spec Section → Task Cross-Reference (Tabular)](#8-spec-section--task-cross-reference-tabular)
9.  [Files to Edit Per Task (Impact Inventory) (Tabular)](#9-files-to-edit-per-task-impact-inventory-tabular)
10. [Immediate Work Order — Executing NOW (2026-09-25)](#10-immediate-work-order--executing-now-2026-09-25)
11. [Stop Gates & Pause Conditions](#11-stop-gates--pause-conditions)
12. [Deliverable Manifest per Phase](#12-deliverable-manifest-per-phase)

---

## 1. EXECUTIVE DECISION LOG

| # | Decision | Rationale | Effective Immediately? |
|---|---|---|---|
| D1 | **Proceed with Option C (Partial C.0 Clearance)** | User deputed sub-agents and instructed "proceed to work upon it" without yet providing all 20 E1–E20 decisions. Per Option C procedures §2.3, deploy safe-default non-blocking tasks today; block structural tasks until deferral matrix populated. | ✅ YES |
| D2 | **Safe defaults adopted for tasks proceeding NOW** | See §3 dependency matrix rows with "Placeholder OK". Geometry defaults (ABUT_W 0.8m conservative, PIER_W 0.4m, APP 3.0m, FEXT 0.4m, BANK_MULT 1.6); cdVent validator 0.6–1.1 range; QA disclaimer text "AUTOMATED — NOT VERIFIED"; unit tests for formulas with numerical safe golden (e.g., Ka=0.333 textbook only). | ✅ YES |
| D3 | **Placeholder values are RED-FLAGGED, not source-of-truth** | Every value not sourced from a PROVIDED E-item will carry `[PLACEHOLDER — OVERRIDE WITH E## DECISION]` comment in code + red banner in UI + yellow highlight in reports. No accuracy claim per user mandate. | ✅ YES |
| D4 | **Sub-agent division of labour** | 5 parallel sub-agents: (S1) REPAIR-T3 cdVent, (S2) REPAIR-T5 QA rename+disclaimer, (S3) REPAIR-T4 geometry constants, (S4) FOUND-T8 unit-test scaffold 58, (S5) FOUND-T10 docx generator scaffold. | ✅ TODAY |
| D5 | **No structural (C.3) tasks touched until at least E1/E14/E17/E18 PROVIDED in Option C matrix** | Per §3 dependency matrix — these E-items are HIGH impact for earth pressures/wLive/reinforcement. | ⏸ HOLD |
| D6 | **CREAT.MD update every ≤5 minutes of work activity** | Enforced per user profile. | ✅ YES |

---

## 2. OPTION A/B/C DETAILED STEP-BY-STEP PROCEDURES (FULL TABULAR ANALYSIS)

### 2.1 Option A — Full REDESIGN C.0 → C.5 (All E1–E20 + 1 Golden Provided)

Time: 10–14 weeks. Close all R1–R20.

#### PHASE C.0 — GAP RESOLUTION (USER — no code)

| Step # | Action | Input / Source | Output | Acceptance |
|---|---|---|---|---|
| C.0.1 | Fill 20-row Engineering Decisions Traceability Table | [spec.md §13.1 Table E1–E20](file:///e:/Rajkumar/Submersible_Bridge_Design/.trae/specs/pre-modification-review-20260925/spec.md#L1015-L1036) | 20-row CSV: clause #(year) + numeric value/table + PE name/reg # | Tasks.md Task 1 TR rubric: 2/2 (all 20 fully cited) |
| C.0.2 | Provide 1 PE-Verified Golden Reference Design Set | [attached_assets/Type Design of submersible causeway.pdf](file:///e:/Rajkumar/Submersible_Bridge_Design/attached_assets/Type%20Design%20of%20submersible%20causeway.pdf) OR hand-signed workbook | 65+ row verification table (36 Inputs + 6 N1-N6 + 29 Computed × value/unit/page/step) | ≥ 95% coverage (≤3 pending). Tasks.md Task 2 TR. |
| C.0.3 | Confirm Code Editions | IRC SP:82 (2007/2008/Amd X), IRC 6:2000 reprint, IS 456, IS 1893 Part, IRC 103 applicability | 1-line per code: "IRC SP:82-2008 + A1" etc. | 0 "TBD" codes |
| C.0.4 | Sign-off C.0 gate | Artifacts C.0.1–C.0.3 | 1 line: "C.0 Gate cleared — proceed to C.1. Signed [Name/Date]" in CREAT.MD | Explicit written signal; silence = not cleared |

#### PHASE C.1 — REPAIR (1 week, Tasks 3–6)

| Task | Files Edited | Step-by-Step Procedure | Evidence After Done |
|---|---|---|---|
| **Task 3 (cdVent data error + validator)** | [test-variables-25-sets.csv](file:///e:/Rajkumar/Submersible_Bridge_Design/test-variables-25-sets.csv) L3-L26 col 28; [spreadsheet-import.ts](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/spreadsheet-import.ts) L16-L47 | (3.1) Locate sets 02,03,08,11,14,19,21 where cdVent=4.1 → (3.2) If XLSX alignment ok → fix→0.9 (default). Else → realign shifted column → (3.3) In INPUT_FIELD_DEFINITIONS add validator: `cdVent ∈ [0.6, 1.1]` → reject with message "cdVent=X out of range [0.6,1.1] per IRC SP:82 Cd-shape table (E5)" → (3.4) Re-run run-25-test-sets.mjs → regenerate 7 PDFs → (3.5) Commit CSV diff + validator unit test | CSV diff 7 lines; validator unit test passes 0.9/0.6/1.1→PASS 4.1→FAIL; new 7 PDF checksums |
| **Task 4 (Single-source geometry)** | [calculations.tsx](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/calculations.tsx) L3-L41 + export; [pdf-export.ts](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/pdf-export.ts) L139/L246/L355 | (4.1) Add: `export const DEFAULT_GEOMETRY = { PIER_W_M: 0.4, ABUT_W_M: 0.8, FEXT_M: 0.4, APP_M: 3.0, PMARG_M: 2.0, BANK_MULT: 1.6 } /* [PLACEHOLDER E##: OVERRIDE WITH GEOMETRY SOURCE DECISION] */` → (4.2) drawCrossSection L139: replace 0.6→DEFAULT_GEOMETRY.ABUT_W_M → (4.3) drawLongSection L246: replace 0.8/3.0/0.4 → DEFAULT_GEOMETRY values → (4.4) drawPlan: bankW=deckWidth×BANK_MULT → (4.5) V5 unit test: CS/LS/Plan-implied-ABUT_W all === DEFAULT_GEOMETRY.ABUT_W_M to 1e-9 | V5 unit test green; grep pdf-export 0 uncommented geometric numeric literals outside geometry object |
| **Task 5 (QA rename + disclaimer)** | [pdf-export.ts](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/pdf-export.ts) cover sheet + footer; [score-qa-rubric.mjs](file:///e:/Rajkumar/Submersible_Bridge_Design/scripts/score-qa-rubric.mjs); [qa-scoring-results.json](file:///e:/Rajkumar/Submersible_Bridge_Design/test-runs/test-run-2026-07-28T16-28-18/qa-scoring-results.json); [summary.tsx](file:///e:/Rajkumar/Submersible_Bridge_Design/src/pages/summary.tsx) | (5.1) PDF cover top add 5-line red/orange 18pt bold disclaimer block per spec.md §18.1.5 → (5.2) Every PDF sheet footer: "Automated — not independently verified unless Appendix S signed" → (5.3) All labels "QA Score" → s/"QA Score"/"Report Structural Completeness Score"/g in rubric script + JSON → (5.4) summary.tsx red banner: if `V10_signature_date === undefined` → display banner CSS class `v10-unsigned-banner`. | String grep disclaimer on every cover; footer on all 7×25×N sheets; banner CSS class present when no V10 sig; score JSON renames complete |
| **Task 6 (Enum Class 70R + 6 missing vars + E17 min 6.0m rule)** | [calculations.tsx](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/calculations.tsx) L3-L82 + useMemo L198; [spreadsheet-import.ts](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/spreadsheet-import.ts) L16-L47; [step1-discharge.tsx](file:///e:/Rajkumar/Submersible_Bridge_Design/src/pages/step1-discharge.tsx); [step2-hydraulic.tsx](file:///e:/Rajkumar/Submersible_Bridge_Design/src/pages/step2-hydraulic.tsx); [step3-structural.tsx](file:///e:/Rajkumar/Submersible_Bridge_Design/src/pages/step3-structural.tsx) | (6.1) `liveLoadType: "IRC Class A" \| "IRC Class AA" \| "IRC Class 70R"` → wLive for 70R = TEMP 900 kN `[PLACEHOLDER E1]` red flagged → (6.2) Add fields: ofl_m, lbl_m, bottomDeck_m, carriageWidth_m, sbc_kN_m2, d_LBL_depth_m → (6.3) INPUT_FIELD_DEFINITIONS 7 new rows → (6.4) Compliance row in calc engine: `carriageWidth_m < 6.0 ? FAIL IRC SP:82-2008 Cl 6.4.2(vi) : PASS` → (6.5) 3-step UI pages render new fields with units/aliases. | Typecheck clean; CSV parse Set-18/Set-24 Class 70R SUCCESS; E17 boundary 5.999→FAIL 6.000→PASS |

#### PHASE C.2 — FOUNDATION (2 weeks, Tasks 7–10)

| Task | Files Created/Edited | Procedure |
|---|---|---|
| **Task 7 (5-table Drizzle schema)** | `lib/db/src/schema/index.ts` (new); `lib/api-zod/*.ts` (extend); calculations.tsx footer; pdf-export post-write | (7.1) 5 Drizzle tables: PROJECT (PK project_id, meta, codes, status/rev), DESIGN_SET (PK, FK PROJECT, ALL Inputs + missing vars), COMPUTED_RESULTS (PK, UNIQUE FK DESIGN_SET, all 29+ new results, calc version+sha), REPORT_ARTIFACT (PK, FK, type/file/path/sha256/generator_ver/qa_json), VERIFICATION_CHECK (PK, FK, type/ref/status/actual/expected/by/at/evidence/discrepancy) → (7.2) Zod insert schemas → (7.3) calc engine append `calc_engine_version = git_sha + pkg_ver` → (7.4) PDF write → sha256 → upsert REPORT_ARTIFACT |
| **Task 8 (V1 58+ unit tests)** | `scripts/calculations.test.ts` (new); package.json scripts | Step 1 (12): Rational 2, Weir 2, Area-Velocity 2, 3 MAX tie-break scenarios, override null→50, 7 neg/zero/NaN → Step 2 (22): aVent N=0..10, %Obs RTL 70.0→FAIL / 69.9→PASS, %Obs HFL 30/29 boundaries, Afflux 0 when aHFL≤aVent + non-zero + perturbation, Lacey P=0 + √100, Lacey R f=0.5/1.0/1.5, D_max=1.27R, FBL, recommendedDepth, velocityHFL div0 guard, scourSafe boolean → Step 3 (24): wSelf kN /1000 conv, wSilt=1.2·W·L, wLive A/AA/(70R placeholder), totalVerticalLoad sanity, fDrag V=0→0, Cd=2.0 V=3.0, fUplift same-shape, fAnchor 3-sign boundary, fDragTotal×Nspans, perturbation ∂Q/∂C linear |
| **Task 9 (PDF→variable parser)** | `scripts/extract-pdf-vars.cjs` (new); import-variables.tsx UI "Import from PDF" button; `scripts/pdf-extraction.test.ts` harness | (9.1) pdf-parse (devDep already) to open `attached_assets/…pdf` → (9.2) regex heuristic label/value + table align detection (mirror excel-logical.json parse style) → (9.3) Partial<Inputs> JSON + warnings[] → (9.4) V3 harness: vs C.0.2 golden manual (when arrives) → ≥95% numeric+unit match threshold |
| **Task 10 (docx generator)** | `src/lib/docx-generator.ts` (new); `npm install docx`; `scripts/docx.test.ts` V8 | (10.1) Install `docx` → (10.2) generateWordReport(inputs, results, drawings?) implements spec.md §18 (18.1 Title → 18.13 Appendices A–S with H1/H2/H3 heading levels per outline) → (10.3) §10 Report-Field Inventory → 20+ spot docx XML paragraphs contain values → (10.4) V8: H1 count==13, heading order exact match §18 |

#### PHASE C.3 — STRUCTURAL MODULE (5–6 weeks Tasks 11–17) BLOCKED TODAY pending E1/E12/E13/E14/E15/E16/E18/E19

| Task | Core Procedure | E-items Required |
|---|---|---|
| Task 11 (Dead load subdivision) | DeadLoadBreakdown subtype (deck + dirt wall E13 Plate 7.25 + wearing coat + abutment stem + 4 footings + parapets). Eccentricity 4 footing-level tables. Sum equals legacy wSelf. | E12 (Plate 7.09), E13 (Plate 7.25 dirt wall dims + 55.50kN source) |
| Task 12 (Ka/Kp Coulomb + surcharge) | Implement full Coulomb formula. 4 angle inputs: φ α β δ + surcharge h3. V1 tests: φ=30/α=90/β=0/δ=0 → Ka=0.333 (textbook). Golden match E14 Ka=0.3. | E14 (4 angles + surcharge h3 E19) |
| Task 13 (Sliding + Overturning FOS) | Sliding FOS=Σresist/Σslide ≥1.5 with base friction + passive + anchor contribution. Overturning FOS=ΣM_stab/ΣM_OT ≥2.0 about toe. 2 compliance rows. | E14 (Ka/Kp), E1/E15/E20 (loads), E9 (anchor resist) |
| Task 14 (Bearing pressure + 6e/B + SBC) | p_max/p_min = ΣV/B ± 6ΣM/B². No-tension 6e≤B. SBC util ≤100%+FOS. 3 compliance rows. | E8 (bearing), E18 (PCC allowable), M8 (SBC input E17) |
| Task 15 (Ast abutment stem + deck slab + Ld) | M_u method V_u method. Ast req vs prov. Min Ast IS 456 0.12% b·D. Max ceiling. Development Ld = 0.87·fy·φ/(4τ_bd). Bar schedule output. | E12 (deck thick), E18 (fck_VRCC/fck_PCC/fy/cover), E11 (permissible stress) |
| Task 16 (Braking/seismic/wind + IRC 6 Cl.202 12 combos) | Braking E15 47.84kN. Seismic Z·I·Sa/(2Rg)·ΣV E6. Wind 0.6·V_z² IRC 103 E20. 12 combos table with E11 stress increase factors. 1 compliance row ≥10/12 evaluated. | E6 (seismic Z,I,R), E15 (braking), E20 (wind), E11 (permissible table), E1 (wLive LL) |
| Task 17 (SS anchor design + VRCC thrust block) | fAnchor>0 → distribute. SS316 grade shear + pullout. Count/spacing/embedment. Thrust block Kp·γ·B·H²/2 ≥ unbalanced thrust → VRCC dims. 2 compliance rows. | E9 (anchor spec), E10 (VRCC thrust block procedure), E14 (Kp), E18 (VRCC fck) |

#### PHASE C.4 — DRAWING INTEGRITY (1 week Task 18)

| Task | Procedure |
|---|---|
| Task 18 (Real scour profile + scale + north bearing) | (1) LS dip 0.35·vS → actual Lacey+D_max shape (V-notch pier mid-span max depth) → (2) Title block: compute actual scale world_extent/paper_extent ×1000 → write "1:XX" remove "(SCHEMATIC)" → (3) Plan: add drawingNorthAngle_deg input; north arrow bearing. (4) V5 5 dims each 3 drawing overlay ≤0.5% vs golden. |

#### PHASE C.5 — V&V + INDEPENDENT REVIEW (2–3 weeks Task 19)

| Step | Procedure |
|---|---|
| 19.1 Implementer self-run V1–V9 evidence |
| 19.2 Fresh-context reviewer re-audit V1–V9 + V10 PE sign-off. Write review.md per TRAE-spec-mode |
| 19.3 User/PE sign-off C.5 in CREAT.MD → REDESIGN Option C COMPLETE |

---

### 2.2 Option B — Spec/Task Revision Workflow (No Code, B.1 → B.2 → B.3 loop)

| Loop Step | Action | Owner | Output |
|---|---|---|---|
| **B.1** | User lists requested edits. Format: `B.1-N / file(spec.md\|tasks.md) / section # / Old → New / Rationale`. Example: `B.1-1 / spec §15 R12 / Old P=5 I=5 → New P=4 I=5 / Rationale: Ka=0.3 available in excel-logical T11` | USER | Bullet list (chat or annotated spec) |
| **B.2** | Apply edits via Edit tool. Material changes (>1 risk score point, >1 task deleted) → append "B.2 Change Log" at TOP: `Field / Old / New / Reason / Approved By` | ASSISTANT | Edited spec.md + edited tasks.md |
| **B.3** | User re-reads. Accept → "B.3 accepted — proceed to Option A/C". Else → B.1 again (B-cycle #2, etc.). ≤5 loops recommended; >5 → synchronous call. | USER | Explicit written "accepted" (silence = not accepted) |

---

### 2.3 Option C — Partial C.0 Clearance (Executing TODAY)

| Step # | Action | Owner | Deliverable |
|---|---|---|---|
| **C.1 (YOU — STILL REQUIRED, but not blocking immediate work)** | Produce 20-row Deferral Matrix: each E1–E20 × STATUS=(PROVIDED / DEFER-C3 / DEFER-C5 / TBD) + clause+value (if PROVIDED) + Planned provision date (if DEFER) + PE name. Format same as §3 with 2 extra columns: STATUS, Planned Date. **Send via chat when ready.** I pause structural work on date boundary if date passes. | USER | 20-row matrix (csv/MD table) |
| **C.2** | Produce Blocking-Propagation Table (§3 × §4 × §8 × §9 cross) → append to tasks.md L360+ bottom as new section. Every E-item status propagated to task status=pending/blocked/deferred. | ASSISTANT | Blocking-Propagation Table appended to tasks.md |
| **C.3** | Approve Blocking-Propagation Table: (a) PROVIDED → source-of-truth; (b) DEFER → date ok; (c) TBD → accept permanent red banner or provide date. | USER | Written "C.3 Matrix approved — proceed with non-blocked tasks" |
| **C.4** | Execute ONLY non-blocked tasks (today: C.1 Tasks 3/4/5/6 placeholder-safe; C.2 Tasks 7/8/10 scaffold). At C.3/C.4 boundary: STOP; write pause notice CREAT.MD; wait deferred items. | ASSISTANT (sub-agents S1–S5 TODAY) | Tasks done; halted report in CREAT.MD |
| **C.5** | Deferred item date arrived OR provided early → unblock tasks; re-run V1; regression bounded diff check | BOTH | Resume notice CREAT.MD |

---

## 3. CRITICAL CYCLE-0 E-item → Task Dependency Matrix (Tabular)

| E-item | Description | If UNPROVIDED: HIGH Impact (BLOCKS) | If UNPROVIDED: Medium/Low (Placeholder OK) | Default Placeholder Used TODAY |
|---|---|---|---|---|
| E1 | wLive Class A/AA/70R source IRC 6 | Task 11 dead-load breakdown, Task 16 LL in combos, V1 wLive tests | Task 6 enum ext (70R) | Class 70R wLive = **900 kN TEMPORARY [PLACEHOLDER E1 — RED FLAGGED]**; use 554/700 for A/AA (hardcoded, unverified) |
| E2 | Afflux formula IRC SP:82 clause reference | Task 8 V1 afflux exact expected, V4 golden match | None (formula exists) | Keep "Molesworth" label + note `[E2 clause pending]` |
| E3 | Scour multiplier 1.27 straight/bend table | Task 18 LS bend-case shape, V1 D_max boundary | None | Straight=1.27 conservative; no bend-case branch taken until E3 provided |
| E4 | Lacey silt-factor f soil-class lookup | Task 8 V1 coarse-soil perturbation | None (f input field exists) | No placeholder; user provides f |
| E5 | Cd vent shape table IRC SP:82 | Task 3 validator bound fine-tune | None | Validator bound: 0.6–1.1 (WIDE safe default); narrow after E5 |
| E6 | Seismic Z/I/R zone | Task 16 EQ force calc; V1 EQ tests | None | Skip EQ in combo matrix; row says: "[E6 DEFERRED — seismic not evaluated]" |
| E7 | Min fdn depth rule IRC SP:82 clause | Task 8 FBL boundary V1 tests | N/A | Current 1.0m below FBL conservative retained |
| E8 | Bearing type/stiffness IRC 83 | Task 14 bearing pressure (future load-displ) | None (no bearing stiffness yet) | N/A |
| E9 | Anchor SS spec IRC SP:82-2007 | Task 17 anchor sizing; compliance rows R19 | fAnchor sign-flag (no size calc) | fAnchor>0 → text: "ANCHORS REQUIRED — CALCULATION PENDING E9" |
| E10 | VRCC thrust block design | Task 17 thrust block dims | None | Thrust block: not drawn; note: "[E10 PENDING]" |
| E11 | Permissible stress table IRC 6 Cl.202 | Task 16 stress increase factor per 12 combos | N/A (evaluate combos without factor) | Combines evaluated raw — stress factor applied =1.0 until E11 |
| E12 | Plate 7.09 IRC SP:20 deck thickness table | Task 15 Ast deck calc (d = thickness − cover) | deckThickness input alone for C.1/C.2 | No placeholder; deck Ast skipped until E12 |
| E13 | Plate 7.25 dirt wall dims + 55.50 kN source | Task 11 wSelfDirtWall calc | wSelf row "Dirt wall: TBD" in breakdown | Dirt wall weight = **0 placeholder** in subdiv; flagged `[E13 PENDING]` |
| E14 | Ka Coulomb φ/α/β/δ angles (Ka=0.3 golden) | **Task 12 earth pressure module ENTIRELY BLOCKED; Task 13 stability; R12 HIGH RISK** | None | Earth pressure rows: "NOT CALCULATED [E14 PROVIDED → RUN Task 12]"; stability FOS rows: "NOT EVALUATED PENDING E14" |
| E15 | Braking 47.84 kN derivation IRC 6 | Task 16 braking force in load combos | None | Skip braking in combos matrix; row: "[E15 PENDING]" |
| E16 | Buoyancy 145.80 kN wetted abutment vol | Task 11 abutment buoyancy subdiv | fUplift deck-only exists | Abutment buoyancy sub-row: "0.0 kN [E16 PENDING — deck uplift only shown]" |
| E17 | Min carriageway 6.0m IRC SP:82 Cl 6.4.2(vi) | Task 6 E17 validation row | N/A — 6.0m value explicitly in code sample-document.ts T16 | Enforce 6.0m rule AS-IS today; PE confirmation noted in row: "E17 confirm 6.0m minimum" |
| E18 | fck_PCC/fck_VRCC/fy/cover grades | **Task 15 reinforcement Ast ENTIRELY BLOCKED; Task 14 PCC allowable stress** | Task 6 fields can be added empty + validation non-empty | Fields added in Task 6; empty until provided; Ast rows: "NOT CALCULATED [E18 PROVIDED]" |
| E19 | Surcharge h3 backfill + vehicle type | Task 12 Ka with surcharge term | h3=0 default (no surcharge conservative for Ka) | h3=0 until provided |
| E20 | Wind IRC 103 Vb zone + terrain | Task 16 wind line in 12 combos | N/A (skip wind) | Combines row: "[E20 PENDING — wind not evaluated]" |

---

## 4. SIX-PHASE REDESIGN ROLLOUT MATRIX (C.0 → C.5) (Tabular)

| Phase | Name | Weeks | Tasks | Deliverables | Approve Gate | Status TODAY (2026-09-25) |
|---|---|---|---|---|---|---|
| **C.0** | GAP RESOLUTION | 0–2 (user dependent) | Task 1 (E1–E20), Task 2 (Golden 1-set) | 20 decision rows + 65-verification-table | Explicit "C.0 cleared" in CREAT.MD | ⏸ **OPTION C MODE**: Non-blocking C.1/C.2 proceed; 14 structural tasks blocked pending matrix |
| **C.1** | REPAIR | 1 | 3, 4, 5, 6 | 7 cdVent-fixed sets PDF, geometry single-source + V5, disclaimer on 25-set PDFs, Class 70R enum + 6 vars + E17 6.0m rule | Code review + npm run test/typecheck/lint green | 🔴 **IN PROGRESS TODAY** via sub-agents S1–S3 + Task 6 partial |
| **C.2** | FOUNDATION | 2 | 7, 8, 9, 10 | 5 Drizzle tables + Zod + migrations, 58 V1 unit tests scaffold, PDF→vars parser V3, docx generator V8 H1=13 | V1 (58 tests) green; V3 ≥20/36 Inputs; V8 H1 count=13 | 🟡 **IN PROGRESS TODAY** via sub-agents S4 (Task 8) and S5 (Task 10). Task 7 DB scaffold depends on Task 6 field expansion. |
| **C.3** | STRUCTURAL MODULE | 5–6 | 11, 12, 13, 14, 15, 16, 17 | Dead load subdiv + eccentricity, Ka/Kp Coulomb, FOS sliding/overturning, bearing 6e/B + SBC, Ast abutment+deck+Ld, 12 IRC 6 combos with EQ/wind/braking/water, SS anchors + VRCC thrust | V4 hand-calc match for ≥2 design sets (incl. E14 Ka=0.3 golden) | 🔴 **BLOCKED** until PROVIDED at minimum: E1, E12, E13, E14, E15, E16, E18, E19 |
| **C.4** | DRAWING INTEGRITY | 1 | 18 | Lacey/D_max scour real profile, actual scale, true north arrow bearing on plan | V5 drawing dim ≤0.5% overlay on golden PDF | 🔴 **BLOCKED** until E3 (scour bend table) PROVIDED; partial C.1 geometry done |
| **C.5** | V&V + INDEPENDENT REVIEW | 2–3 | 19 | Implementer V1–V9 evidence; Fresh reviewer re-audit V1–V10; review.md; non-conformance log closed or PE-approved variances | V10 PE sign-off — REDESIGN COMPLETE | 🔴 **BLOCKED** all prior phases complete first + Task 2 golden set PROVIDED |

---

## 5. TASKS 1–19 ATOMIC ACTION PLAN (Per tasks.md)

| # | Task | Phase | Priority | Status 2026-09-25 | Assigned Sub-agent | Core Steps Count |
|---|---|---|---|---|---|---|
| 1 | Confirm E1–E20 decisions | C.0 | HIGH | PENDING USER | — (manual) | 20 rows × 4 fields |
| 2 | Golden 1-set PE verified | C.0 | HIGH | PENDING USER | — (manual) | 65-row verif table |
| 3 | Fix cdVent 4.1 CSV + validator | C.1 | HIGH | ✅ ASSIGNED S1 today | **Sub-agent S1 REPAIR** | 5-step: audit/fix/validator/re-7-PDFs/commit |
| 4 | Single-source geometry constants | C.1 | HIGH | ✅ ASSIGNED S3 today | **Sub-agent S3 REPAIR** | 5-step: export const + refactor 3 drawing functions + V5 test |
| 5 | QA rename + report disclaimer | C.1 | HIGH | ✅ ASSIGNED S2 today | **Sub-agent S2 REPAIR** | 5-step: cover disclaimer/footer/score rename/summary banner/25-set visual grep |
| 6 | Extend enum Class 70R + 6 vars + E17 rule | C.1 | HIGH | ⚠️ PARTIAL (placeholder 900 kN for 70R) | **Sub-agent S3 extends geometry work → Task 6 in-session after S3** | 5-step: type extend/INPUT_FIELD_DEFS + aliases/E17 rule/UI 3-page render/typecheck + boundary tests |
| 7 | 5-table Drizzle schema + Zod | C.2 | HIGH | PENDING (after Task 6 field list final) | To be assigned after S3/Task 6 | 5-step: 5 tables PK/FK/Zod/calc version sha/report sha256/migrations |
| 8 | V1 58+ unit tests for current formulas | C.2 | HIGH | ✅ ASSIGNED S4 today | **Sub-agent S4 FOUNDATION** | 4-step: test runner confirm/Step 1 12/Step 2 22/Step 3 24 = 58 + perturbation |
| 9 | PDF→variable extraction pipeline | C.2 | MED | PENDING (after Task 2 golden V3 baseline) | TBD — requires golden to validate accuracy | 4-step: pdf-parse script/heuristic label-value/Output JSON/V3 harness UI button |
| 10 | Word (.docx) report generator §18 | C.2 | HIGH | ✅ ASSIGNED S5 today | **Sub-agent S5 FOUNDATION** | 4-step: install docx / 18.1→18.13 sections / §10 20-field spot / V8 H1 count=13 |
| 11 | Dead load subdiv + 4 eccentricity tables | C.3 | HIGH | 🔴 BLOCKED (E12/E13) | TBD | subdiv wSelf / 4 footing eccentricity / backwards-compat sum |
| 12 | Coulomb Ka/Kp + surcharge | C.3 | HIGH (BLOCKING R12) | 🔴 BLOCKED (E14/E19) | TBD | Coulomb formula / 4 angles + h3 / V1 tests textbook 0.333 / golden E14 Ka=0.3 |
| 13 | Stability FOS sliding ≥1.5 + overturning ≥2.0 | C.3 | HIGH | 🔴 BLOCKED (E14/E9) | TBD | FOS formulas / 2 compliance rows / perturbation |
| 14 | Bearing p_max/min + 6e/B + SBC util | C.3 | HIGH | 🔴 BLOCKED (E8/E18/SBC) | TBD | formulas / no-tension check / 3 compliance rows |
| 15 | Ast abutment stem + deck slab + Ld | C.3 | HIGH | 🔴 BLOCKED (E18/E12/E11) | TBD | M_u method / min-max Ast IS 456 / Ld / bar schedule |
| 16 | Braking/EQ/Wind + IRC 6 12 combos | C.3 | MED | 🔴 BLOCKED (E15/E6/E20/E11/E1) | TBD | 4 loads implemented / 12×combo matrix table + E11 increase factor |
| 17 | Anchor SS design + VRCC thrust blocks | C.3 | HIGH (R19) | 🔴 BLOCKED (E9/E10/E14/E18) | TBD | shear/pullout cap / count spacing embedment / thrust dims / 2 compliance rows |
| 18 | Scour real shape + scale + north bearing | C.4 | MED | 🔴 BLOCKED (E3) | TBD | Lacey/D_max shape / real scale / north arrow |
| 19 | V1–V10 run + independent review | C.5 | HIGH (FINAL) | 🔴 BLOCKED (all prior phases + Task 2 golden set) | TBD (independent reviewer agent) | implementer V1-V9 / reviewer re-audit / review.md / PE sign-off |

---

## 6. V1–V10 V&V CHECKPOINTS (Tabular)

| Level | Name | Scope | Evidence | Pass Criterion | Schedule / Blocker |
|---|---|---|---|---|---|
| V1 | Unit Calculation Tests | Every formula §9.1–9.3 + C.3 new formulas | Hand-calc spreadsheet 1-var perturbations | Exact match 3 decimals | 🟡 **S4 building TODAY (58 existing; +40+ after C.3)** |
| V2 | 25-set Regression | 25 CSV → results → SHA-256 of output | Checksum vs golden | Unchanged OR bounded diff <0.01% | BLOCKED until C.1 fixes applied → then 1st baseline in Phase C.2 end |
| V3 | PDF Extraction Accuracy | 37+ variables vs PDF manual | Side-by-side table | 100% exact match value+unit (all 37) | BLOCKED Task 2 golden reference PDF manual table PROVIDED |
| V4 | Calc Correctness | 29+ computed vs hand calc | Manually verified workbook | Exact match; zero tolerance pass/fail | BLOCKED Task 2 golden set PROVIDED |
| V5 | Drawing Dimensional | CS/LS/Plan vs reference PDF | Dim overlay CAD | All labeled dims ≤0.5% vs ref | 🟡 Partial: geometry Task 4 S3 applies V5 consts test; full V5 BLOCKED golden PDF dims + E3 scour shape |
| V6 | Code-Clause Conformance | 20 refs E1–E20 → formula | Traceability matrix §14.4 expanded | Every formula has clause ID | BLOCKED C.0.1 20 decisions clause # fully populated |
| V7 | Report Completeness | All §10 Report-Field Inventory fields | Field checklist | 100% fields present in PDF/Word | 🟡 Partial (C.1 Task 5 disclaimer + Task 10 Word scaffold) |
| V8 | Word Output Conformance | docx structure vs §18 outline | Heading level check | Exact match outline (H1 count=13) | 🟡 **S5 building TODAY** |
| V9 | Load Combination Coverage | 12 IRC 6 Cl.202 combinations | List applied vs required | ≥10/12 evaluated with results | BLOCKED C.3 Task 16 + E1/E6/E15/E20/E11 PROVIDED |
| V10 | Independent Design Review | Senior engineer 1 set sign-off | Signed V&V report | PASS: 0 non-conformance OR approved variance log | BLOCKED ALL C.0–C.4 complete + Task 2 golden + V1–V9 evidence |

---

## 7. RISK REGISTER R1–R20 WITH MITIGATION ACTIONS (Tabular)

| ID | Risk | P | I | Score | Mitigation Action in This Plan | Affected Task | Status 2026-09-25 |
|---|---|---|---|---|---|---|---|
| R1 | wLive 554/700 unverified IRC 6 source → all structural results wrong | 5 | 5 | 25 | Wait E1; placeholder 900 for 70R RED FLAGGED; V1 golden test on E1 arrival | 11/16 | 🔴 BLOCKED |
| R2 | cdVent=4.1 in 7/25 sets (28%) → hydraulic nonsense | 4 | 5 | 20 | Task 3 fix + validator ∈[0.6,1.1] + re-7-PDFs | 3 | 🔴 S1 WORKING |
| R3 | Afflux formula identity (Molesworth/IRC SP:82) unverified → wrong freeboard | 3 | 5 | 15 | Wait E2; label carry `[E2 clause pending]` | 2/8 | 🟡 E2 DEFERRED acceptable |
| R4 | Scour 1.27 straight-only → bend locations under-designed | 3 | 5 | 15 | Wait E3; bend branch not drawn until E3; conservative 1.27 | 18/8 | 🟡 E3 DEFERRED |
| R5 | ABUT_W 0.6 (CS) vs 0.8 (LS) inconsistent → plan reject | 5 | 3 | 15 | Task 4 single-source DEFAULT_GEOMETRY; V5 unit test 3 drawings equality | 4 | 🔴 S3 WORKING |
| R6 | 90% structural calcs missing → cannot stamp "design report" | 5 | 4 | 20 | Disclaimer banner Task 5; C.3 build Tasks 11–17 when E-decisions; no accuracy claim | 5 + 11–17 | 🔴 S2 on disclaimer; structural BLOCKED |
| R7 | "100% QA Score" presented as engineering quality → liability | 5 | 4 | 20 | Task 5 rename → "Report Structural Completeness Score" + cover+footer disclaimer | 5 | 🔴 S2 WORKING |
| R8 | No PDF extraction pipeline → fails if only PDF available | 4 | 3 | 12 | Task 9 build when Task 2 golden V3 baseline available | 9 | 🟡 DEFER C.2 end |
| R9 | No Word output → submission fail (statutory .docx req) | 5 | 3 | 15 | Task 10 install docx → §18 outline V8 H1=13 | 10 | 🔴 S5 WORKING |
| R10 | No DB schema / audit trail → no versioning / reproduce | 3 | 4 | 12 | Task 7 5 Drizzle tables + sha256 on calc+artifact | 7 | 🟡 AFTER Task 6 (field list final) |
| R11 | Silt factor f uncalibrated → wrong scour depth | 3 | 4 | 12 | Wait E4 soil→f lookup; soil-boring number metadata | 8 | 🟡 DEFER acceptable |
| R12 | Earth pressures + stability ENTIRELY MISSING (R12 P5×I5=25) → sliding/overturning failure mode unchecked | 5 | 5 | 25 | Block C.3 Tasks 12/13 until E14/E19 PROVIDED; red banner "EARTH PRESSURE NOT EVALUATED" | 12/13 | 🔴 BLOCKED |
| R13 | Braking/EQ/Wind/Tractive missing → load combos incomplete | 4 | 4 | 16 | Wait E6/E15/E20; Task 16 skip those rows with notes until E items | 16 | 🔴 BLOCKED |
| R14 | No min reinforcement / Ld → detailing brittle failure | 4 | 4 | 16 | Wait E18 grades; Task 15 blocked | 15 | 🔴 BLOCKED |
| R15 | LS scour dip cosmetic → hydraulic engineer misled | 3 | 3 | 9 | Task 18 real Lacey/D_max profile when E3 scour table | 18 | 🔴 BLOCKED |
| R16 | fck_PCC/fck_VRCC/fy absent → Ast uses wrong grade | 4 | 3 | 12 | Task 6 add empty fields + mandatory-fill validation; Ast blocked until non-empty | 6/15 | 🟡 Task 6 adds fields today |
| R17 | No bearing type/model → expansion/contraction unknown | 2 | 4 | 8 | Deferred bearing; E8 requested in Option C matrix | 14 | 🟡 DEFER C.3 acceptable |
| R18 | Archive folder stale PDFs accidentally referenced | 3 | 2 | 6 | Mark _archive "LEGACY — DO NOT USE" watermark at top after C.1 confirmation active code | N/A (docs) | 🟡 AFTER C.1 |
| R19 | Anchor design not computed (only sign flag) → wrong size → deck lift | 4 | 5 | 20 | Block Task 17 until E9/E10/E14/E18; fAnchor>0 → red text "ANCHOR CALC PENDING E9" | 17 | 🔴 BLOCKED |
| R20 | Class 70R missing enum → sets 18/24 fail import | 3 | 3 | 9 | Task 6 extend enum + 70R wLive=900 TEMP [PLACEHOLDER E1]; V1 boundary tests | 6 | 🔴 S3 includes Task 6 today |

### Top 5 Blocking Risks ≥20 Score
1. **R1 + R12** (25 each): wLive source + earth pressure/stability structural → **BLOCKED pending E1/E14**.
2. **R2 cdVent=4.1** (20): → **S1 WORKING NOW**.
3. **R6 (90% structural missing)** (20): → **S2 adding disclaimer; structural Tasks blocked**.
4. **R7 (QA score branding)** (20): → **S2 WORKING NOW**.
5. **R19 (anchor sizing)** (20): → fAnchor sign-flag only; blocked until E9/E10.

---

## 8. SPEC SECTION → TASK CROSS-REFERENCE (Tabular)

| Spec Section AC (rule/rubric) | Tasks Covering | Status |
|---|---|---|
| §1 Inventory + §2 File Inventory | Documentation only (already complete in spec.md) | ✅ COMPLETE |
| §3 Execution trace gap → PDF parser + Word pipelines | Task 9, Task 10 | S5 on T10; T9 deferred V3 golden |
| §4 Accuracy CANNOT CLAIM → disclaimer banners | Task 5 (cover/footer/summary) | S2 WORKING |
| §5 Recognized 36 Inputs → extend with N1-N6 Class 70R | Task 6 | S3 Task 6 |
| §6 Variables visible unrecognized 150-200 → extend Inputs 6 (ofl lbl bottomDeck carriageW SBC d_LBL) | Task 6 | S3 Task 6 |
| §7 Narrative-to-variable mapping → calc engine compliance rows reference phrases | Task 11/12/13/14 narrative labels | BLOCKED C.3 |
| §8 Sketch-to-variable mapping → geometry single-source + V5 dim tests | Task 4 + Task 18 | S3 WORKING on T4; T18 BLOCKED E3 |
| §9.1–9.3 Calculations (existing) → V1 58 unit tests | Task 8 | S4 WORKING |
| §9.5 ~40 missing calc categories (deadload subdiv, Ka/FOS, bearing, Ast, combos, anchors/thrust) | Tasks 11–17 | ALL BLOCKED C.3 |
| §10 Report-Field Inventory → docx + PDF 20-field spot | Task 10 (docx) + Task 5 (PDF disclaimer fields) | S5 WORKING |
| §11.1 Variable mismatches M1–M11 (cdVent=4.1 M6; Class 70R M3; carriageW/ofl/lbl/SBC/bottomDeck/d_LBL M8-11) | Task 3 (M6) + Task 6 (M1/M3/M8-11) | S1+S3 WORKING |
| §11.2 Drawing mismatches A1–A5 (ABUT_W inconsistent, scour cosmetic, anchors/thrust not drawn) | Task 4 (A1-approach) + Task 17 (A5) + Task 18 (A4) | S3 on A1; A4/A5 BLOCKED |
| §11.3 QA circularity (100% not engineering) → rename + disclaimer | Task 5 | S2 WORKING |
| §11.4 Stale scaffold → schema populate + boilerplate cleanup | Task 7 + post-C.1 archive watermark | T7 AFTER Task 6; archive deferred |
| §12 Proposed 5-table schema ERD → Drizzle + Zod | Task 7 | AFTER Task 6 |
| §13 Missing E1–E20 → Option C deferral matrix USER | Task 1 | PENDING USER Option C matrix |
| §13.2 ~40 code-basis → Tasks 11–17 | Tasks 11–17 | BLOCKED |
| §14 V1–V10 test plan → V1/V8 scaffold today; V2-V4/V6-V9-V10 deferred | Task 8 (V1) + Task 10 (V8) | S4+S5 WORKING; rest BLOCKED |
| §15 Risk Register 20 → each row mitigation column §7 above | All tasks (R1→R20 mapped) | As per status per R |
| §16 Option C REDESIGN 6-phase → this entire document | All 19 tasks | IN PROGRESS (partial C.0) |
| §17 Sample extracted-input Bridge-01 → updated fields Task 6 outputs new sample with 6 vars | Task 6 + PDF template update | Task 6 end of C.1 |
| §18 Proposed 13 H1 sections Word/PDF outline → Task 10 docx generator | Task 10 + pdf-export sheet reorg (future phase) | S5 WORKING on Word; PDF future |

---

## 9. FILES TO EDIT PER TASK (Impact Inventory) (Tabular)

| # | Files Created | Files Edited (absolute path link) | Database Impact | UI Impact | PDF/Word Impact |
|---|---|---|---|---|---|
| 3 | `scripts/cdVent-validator.test.ts` | [test-variables-25-sets.csv](file:///e:/Rajkumar/Submersible_Bridge_Design/test-variables-25-sets.csv) L3-L26; [spreadsheet-import.ts](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/spreadsheet-import.ts) L16-L47; `scripts/run-25-test-sets.mjs` re-run | 0 | 0 | 7 output PDFs regenerated |
| 4 | `scripts/v5-geometry-single-source.test.ts` | [calculations.tsx](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/calculations.tsx) exports; [pdf-export.ts](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/pdf-export.ts) L139/L246/L355 | 0 | 0 | All 3 drawing functions reference DEFAULT_GEOMETRY |
| 5 | 0 | [pdf-export.ts](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/pdf-export.ts) cover+footer; [score-qa-rubric.mjs](file:///e:/Rajkumar/Submersible_Bridge_Design/scripts/score-qa-rubric.mjs); [qa-scoring-results.json](file:///e:/Rajkumar/Submersible_Bridge_Design/test-runs/test-run-2026-07-28T16-28-18/qa-scoring-results.json); [summary.tsx](file:///e:/Rajkumar/Submersible_Bridge_Design/src/pages/summary.tsx) banner component | 0 | summary.tsx: new v10-unsigned-banner CSS class | Every PDF cover+footer + 25-set score JSON labels |
| 6 | `scripts/e17-min-width-boundary.test.ts`; `scripts/class-70r-import.test.ts` | [calculations.tsx](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/calculations.tsx) Inputs/ComputedResults/useMemo L3-L215; [spreadsheet-import.ts](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/spreadsheet-import.ts) L16-L47; [step1-discharge.tsx](file:///e:/Rajkumar/Submersible_Bridge_Design/src/pages/step1-discharge.tsx); [step2-hydraulic.tsx](file:///e:/Rajkumar/Submersible_Bridge_Design/src/pages/step2-hydraulic.tsx); [step3-structural.tsx](file:///e:/Rajkumar/Submersible_Bridge_Design/src/pages/step3-structural.tsx) | DESIGN_SET table 6 new columns (Task 7) | 3 UI pages new form fields | New compliance row "Carriageway ≥6.0m" row on sheet 4; extracted-input sample updated |
| 7 | `migrations/0001_init_5tables.sql`; `lib/api-zod/insert-schemas.ts` (extend) | [lib/db/src/schema/index.ts](file:///e:/Rajkumar/Submersible_Bridge_Design/lib/db/src/schema/index.ts) (empty→5 tables); [calculations.tsx](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/calculations.tsx) footer version sha | 5 new tables PK/FK/Zod + migrations | 0 | REPORT_ARTIFACT row sha256 written post-export |
| 8 | `scripts/calculations.test.ts` (58+ cases; ~500 lines) | `package.json` scripts (add `test:unit` if missing) | 0 | 0 | 0 |
| 9 | `scripts/extract-pdf-vars.cjs`; `scripts/pdf-extraction.test.ts` V3 | [import-variables.tsx](file:///e:/Rajkumar/Submersible_Bridge_Design/src/pages/import-variables.tsx) "Import from PDF" button | 0 | Import UI new button | 0 (INPUT only) |
| 10 | `src/lib/docx-generator.ts` (~800-1200 lines); `scripts/docx-v8.test.ts` | `package.json` add dep `docx`; `pdf-export.ts` (future: unify section ordering template) | 0 | Download "Word Report" button | .docx generated V8 H1 count=13; 20+ field spot tests pass |
| 11 | `scripts/dead-load-subdiv.test.ts`; `scripts/eccentricity-table.test.ts` | calculations.tsx new DeadLoadBreakdown subtype + useMemo subdivision | COMPUTED_RESULTS 8 new wSelf columns | Summary UI: dead-load breakdown tables | 8 new compliance rows + eccentricity tables in Word §7, PDF sheet 4 ext |
| 12 | `scripts/coulomb-ka-kp.test.ts` (textbook 0.333 + golden E14 Ka=0.3 cases) | calculations.tsx Coulomb fn; 4 angle inputs; surcharge_h3 input | DESIGN_SET 5 new geo-tech cols; COMPUTED_RESULTS Ka/Kp | Step 3 UI new earth-pressure inputs | Ka/Kp calc in Word §7; 2 compliance rows |
| 13 | `scripts/stability-fos.test.ts` (FOS=1.5/2.0 boundaries) | calculations.tsx Σresist/Σslide/ΣM_stab/ΣM_OT; compliance rows | COMPUTED_RESULTS fos_slide / fos_ot | Summary pass/fail FOS rows | 2 compliance PASS/FAIL rows new |
| 14 | `scripts/bearing-pressure.test.ts` (6e=B boundary p_min=0) | calculations.tsx p_max/p_min 6e/B SBC_utilization; inputs sbc_kN_m2 bearing_type | DESIGN_SET 2 new cols; COMPUTED_RESULTS p_max/p_min/e_m/SBC% | Step 3 inputs; Summary bearing rows | 3 compliance rows new |
| 15 | `scripts/reinforcement-ast.test.ts` (Ast min IS456 0.12% boundary); `scripts/development-length.test.ts` | calculations.tsx Ast required/provided/min/max/Ld; inputs fck_VRCC/fck_PCC/fy/cover_mm | DESIGN_SET 4 new mat cols; COMPUTED_RESULTS ast_mm2 + Ld values | New page: reinforcement-details.tsx | Bar schedule table in Word §11 / PDF appendix |
| 16 | `scripts/load-combinations.test.ts` (12 combos × E11 increase factor) | calculations.tsx braking/eq/wind load fns; 12 combo matrix; E11 factors | DESIGN_SET seismic/wind inputs (Z I R Vb terrain) | Step 3 UI seismic/wind inputs card | 12 combo table Word §6 / PDF sheet 4 ext |
| 17 | `scripts/anchor-capacity.test.ts`; `scripts/thrust-block.test.ts` | calculations.tsx anchor shear/pullout/spacing/embed; thrust VRCC dims; inputs anchor_grade/thrust_fck | DESIGN_SET anchor/thrust cols | Compliance rows anchors/thrust blocks | Anchors spec Word §9; thrust sketch appendix |
| 18 | `scripts/v5-scour-shape.test.ts`; `scripts/v5-scale-titleblock.test.ts` | [pdf-export.ts](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/pdf-export.ts) L310 scour profile + title block scale + north arrow | 0 | drawing-viewer.tsx add north bearing input | LS drawing real profile; Plan north arrow; Title "1:XX" not schematic |
| 19 | `.trae/specs/pre-modification-review-20260925/review.md` (new) | tasks.md Task 19 checklist closeouts | VERIFICATION_CHECK rows populated V1–V10 | N/A (review process docs) | PE sign-off appendix S Word / PDF last page |

---

## 10. IMMEDIATE WORK ORDER — EXECUTING NOW (2026-09-25)

> **Sub-agent skill assignment criteria:** Each sub-agent assigned ONLY 1 task from Phase C.1–C.2 (no structural work). Each sub-agent writes unit tests per Task's TR rules, runs typecheck/lint/tests, returns edited file paths + evidence.

| Sub-agent ID | Skill Set | Assigned Task | Mandatory Outputs | Deadline |
|---|---|---|---|---|
| **S1** | Data validation + CSV hygiene + type guards | **Task 3 cdVent** | (a) CSV diff 7 values, (b) cdVent validator in INPUT_FIELD_DEFINITIONS with range-check error message, (c) validator unit test file pass/fail, (d) npm run typecheck green, (e) short commit message. | End of session today |
| **S2** | PDF/jsPDF layout + accessibility banner + score data | **Task 5 QA rename + disclaimer** | (a) PDF cover red disclaimer block (18pt bold text, revised per §18.1.5 spec), (b) every PDF sheet footer disclaimer string grep present, (c) score-qa-rubric.mjs + qa-scoring-results.json rename s/QA Score/Report Structural Completeness Score/g, (d) summary.tsx v10-unsigned-banner CSS class renders when no V10, (e) visual grep string test passes 25 × (cover + footer). | End of session today |
| **S3** | Geometry + TypeScript refactor + UI form fields | **Task 4 geometry single-source → then Task 6 enum + 6 vars + E17 rule** | (Task4) DEFAULT_GEOMETRY const exported; pdf-export 3 drawings all reference it; V5 3-drawings ABUT_W equality test. THEN (Task6): Inputs type extend Class70R + ofl/lbl/bottomDeck/carriageWidth/sbc_kN_m2/d_LBL_depth_m; INPUT_FIELD_DEFINITIONS + aliases; 3 UI pages form fields; E17 6.0m compliance PASS/FAIL boundary test file; typecheck clean. | End of session today |
| **S4** | Unit testing + numerical formula verification + boundary perturbation | **Task 8 V1 58+ unit tests scaffold** | calculations.test.ts: Step1=12 tests, Step2=22 tests, Step3=24 tests (2 placeholder Class 70R = 900 kN + skip text about E1). Total 58+. `npm run test:unit` returns 100% pass on 58 (no failures). Perturbation tests ∂Q/∂C linear within 0.1%. | End of session today |
| **S5** | docx / Office Open XML generation + heading conformance | **Task 10 Word (.docx) generator scaffold** | Install dep `docx`; docx-generator.ts implements spec.md §18 outline 18.1 Title → 18.13 Appendices (13 H1 headings). Populate 20 fields from §10 Report-Field Inventory into correct sections. V8 test: H1 count=13, heading order matches outline order exactly. Download button on UI. Typecheck clean. | End of session today |

### Master Coordinator (Main agent) Actions Today
1. Dispatch all 5 sub-agents S1–S5 in parallel.
2. Collect outputs. Run `GetDiagnostics + npm run typecheck + npm run lint + npm run test:unit` on consolidated result.
3. If any test or lint fails → return that sub-agent's task with failure log for fixes (max 1 revision).
4. Update CREAT.MD every ≤5 minutes per user profile.
5. After all 5 succeed → write pause notice in CREAT.MD:
   > 2026-09-25 [HH:MM] PHASE C.1 (Tasks 3/4/5/6) + C.2 Scaffold (Tasks 8/10) COMPLETE. HALTED at C.1/C.2 boundary. Awaiting: (a) Option C Deferral Matrix 20-row E1–E20 (USER) to populate Blocking-Propagation Table; (b) Task 7 DB schema to start after final field list confirmation from Task 6; (c) Task 9 PDF parser when V3 golden data arrives from Task 2; (d) C.3 Tasks 11–17 BLOCKED on structural E-items. No code will proceed to structural module until USER provides E-items.

---

## 11. STOP GATES & PAUSE CONDITIONS

**HARD-STOP (no code proceeds past this point):**

| Gate | Trigger | Action |
|---|---|---|
| G1 | Any structural module file in C.3 is touched BEFORE at least E1/E14/E17/E18 PROVIDED → VIOLATION | Immediate revert via `git checkout HEAD -- src/lib/calculations.tsx src/lib/pdf-export.ts ...`; notify USER; event logged CREAT.MD |
| G2 | User did not provide Option C matrix by 2026-10-02 (1 week) → pause timer on C.3 work | C.1/C.2 work complete already; set reminder 1 week; write "PAUSED awaiting Option C matrix" CREAT.MD |
| G3 | E-item deferral date passes 2× planned date without extension granted | Deferred item escalates to "blocked"; downstream tasks set blocked |
| G4 | Any placeholder value (e.g., Class 70R wLive=900 kN, or 0.8m ABUT_W) is ACCIDENTALLY COMMITTED without `[PLACEHOLDER E##]` comment AND red banner in UI → audit failure | Search all changed lines for literal numeric constants ≥3; add missing comments/banners; re-commit |
| G5 | User instruction "STOP MODIFYING" received | All tasks halt within 1 tool call; status written CREAT.MD |

**SOFT-PAUSE (review point before major actions):**
- Before Task 7 DB migrations generated & applied → brief "migration plan OK?" check (avoid schema drift).
- Before Task 9 PDF parser committed → validate ≥20/36 non-metadata Inputs from reference PDF (not 100% accurate yet; acceptable for C.2 scaffold).
- Before Phase C.3 Task 12 Coulomb Ka/Kp first line of code → explicit E14 confirmation signed in CREAT.MD (this is the high-severity earth pressure module).

---

## 12. DELIVERABLE MANIFEST PER PHASE

| Phase | Artifact | Path (absolute link) | Count / Metric | Due |
|---|---|---|---|---|
| **THIS DOCUMENT** | Implementation Plan V1.0 | [implementation-dated-25092026.md](file:///e:/Rajkumar/Submersible_Bridge_Design/implementation-dated-25092026.md) | 12 sections, ~9 tabular matrices | ✅ 2026-09-25 (written) |
| C.0 | Engineering Decisions 20-row CSV | `attached_assets/engineering-decisions-E1-E20.csv` | 20 rows × clause+value+PE fields | USER WHEN READY |
| C.0 | Golden 1-set 65-row verification table | `attached_assets/golden-ref-set-verification.csv` | 65 rows × value/unit/page/step | USER WHEN READY |
| C.0 | Code Editions Confirmation | `attached_assets/code-editions-confirmation.md` | 7 codes × edition+year line | USER WHEN READY |
| C.1 | cdVent validator unit test | `scripts/cdVent-validator.test.ts` | validator 0.6/1.1 PASS 4.1 FAIL | END TODAY (S1) |
| C.1 | cdVent fixed CSV + re-7 PDFs | [test-variables-25-sets.csv](file:///e:/Rajkumar/Submersible_Bridge_Design/test-variables-25-sets.csv) L3-L26 | 7 value changes; 7 regenerated output PDFs | END TODAY (S1) |
| C.1 | V5 geometry equality unit test | `scripts/v5-geometry-single-source.test.ts` | CS/LS/Plan ABUT_W === DEFAULT to 1e-9 | END TODAY (S3) |
| C.1 | Geometry DEFAULT_GEOMETRY in calculations.tsx | [calculations.tsx](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/calculations.tsx) exports | 1 const exported with 6 fields + placeholder comment | END TODAY (S3) |
| C.1 | Cover disclaimer + footer string grep evidence | `scripts/pdf-disclaimer-string-test.sh|ps1` | 25-set covers + 7 sheets all contain required disclaimer strings | END TODAY (S2) |
| C.1 | QA rename audit diff | score-qa-rubric + qa-results.json | s/QA Score/Report Structural Completeness Score/g count | END TODAY (S2) |
| C.1 | Class70R + 6 var import test | `scripts/class-70r-import.test.ts` + `scripts/e17-min-width-boundary.test.ts` | Set-18/24 import PASS; E17 5.999→FAIL 6.000→PASS | END TODAY (S3) |
| C.1 | Updated Inputs type + 3 UI pages | 3 pages in src/pages/*step-*.tsx | ofl/lbl/bottomDeck/carriageW/sbc/d_LBL new form inputs (empty default with mat-field hints) | END TODAY (S3) |
| C.2 | V1 58+ unit calculations tests | `scripts/calculations.test.ts` | 58+ cases, 100% pass | END TODAY (S4) |
| C.2 | Word .docx generator §18 | `src/lib/docx-generator.ts` + V8 test | 13 H1 headings exact order; 20 field spot pass | END TODAY (S5) |
| C.2 | 5 Drizzle tables + Zod + migrations | `lib/db/src/schema/index.ts`, migrations/0001_init_5tables.sql, `lib/api-zod/insert-schemas.ts` | 5 tables, PK/FK relations, migrations run clean | AFTER Task 6 field list final + user schema approval |
| C.2 | PDF parser V3 scaffold | `scripts/extract-pdf-vars.cjs` + Import UI button | ≥20/36 non-metadata Inputs extracted from reference PDF | AFTER Task 2 golden available to validate accuracy |
| C.3 | Dead load subdiv + eccentricity | calculations.tsx DeadLoadBreakdown | 8 sub-categories sum to wSelf 0.1% tolerance; 4 eccentricity tables | AFTER E12/E13 PROVIDED |
| C.3 | Coulomb Ka/Kp + surcharge | calculations.tsx coulomb() + V1 test | φ=30→Ka=0.333 textbook; E14 golden Ka=0.3 match; 4 angle inputs working | AFTER E14/E19 PROVIDED |
| C.3 | Stability FOS + 2 compliance rows | calculations.tsx stability() + V1 FOS boundaries | FOS_slide ≥1.5 boundary; FOS_OT ≥2.0 boundary | AFTER E14/E9 PROVIDED |
| C.3 | Bearing pressure 6e/B + SBC | calculations.tsx bearing() + V1 p_min=0 boundary | p_min=0 when 6e=B exactly; SBC utilization % row | AFTER E8/E18 PROVIDED + Task 6 SBC field confirmed |
| C.3 | Reinforcement Ast + Ld + bar schedule | calculations.tsx reinforcement() + min-Ast 0.12% IS456 boundary | min/max Ast boundaries; Ld formula; bar schedule output table | AFTER E18/E12/E11 PROVIDED |
| C.3 | 12 Load combos IRC 6 Cl.202 + braking/EQ/wind | calculations.tsx 12 combos matrix + E11 stress factor | ≥10/12 combos evaluated; E11 increase factor on each combo | AFTER E1/E6/E15/E20/E11 PROVIDED |
| C.3 | SS anchor + VRCC thrust block | calculations.tsx anchor() + thrustBlock() | anchor shear/pullout FOS ≥3; thrust passive FOS ≥2 | AFTER E9/E10/E14/E18 PROVIDED |
| C.4 | Real scour + scale + north bearing | pdf-export.ts L310 + title block + plan north | V5 shape test matches Lacey/D_max; scale integer denominator computed | AFTER E3 PROVIDED + geometry Task 4 confirmed |
| C.5 | Implementer V1–V9 evidence folder | `.trae/specs/pre-modification-review-20260925/V1-V9-evidence/` | 9 evidence files, each pass/fail explicit | ALL PRIOR PHASES DONE |
| C.5 | Independent reviewer V1–V10 audit review.md | `.trae/specs/pre-modification-review-20260925/review.md` | pass/fail per V checkpoint; non-conformance log closed OR variance PE-approved | V1–V9 DONE + TASK 2 GOLDEN + FRESH REVIEWER AGENT |
| C.5 | PE sign-off appendix S | PDF + Word report last page Appendix S | PE name, reg#, date, signature block | review.md shows 0 blocking non-conformance |

---

## END OF IMPLEMENTATION PLAN V1.0

> **Next action:** All 5 sub-agents S1–S5 deployed in parallel. Coordinator compiles outputs. Status updates every ≤5 minutes to [CREAT.MD](file:///e:/Rajkumar/Submersible_Bridge_Design/CREAT.MD) per user profile preference. You (user) can provide Option C deferral matrix at any time — when it arrives, C.2 remaining tasks (Task 7/9) and all C.3/C.4/C.5 unblock as per §3 dependency rules.
