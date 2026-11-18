# PRE-MODIFICATION COMPREHENSIVE REVIEW — Submersible Bridge Design

**Date:** 2026-09-25
**Repository:** `e:\Rajkumar\Submersible_Bridge_Design`
**Scope:** Full audit before any production code modification. No code changes proposed or applied in this document. This is a READ-ONLY review artifact.
**Status:** STOP AT REVIEW STAGE — Exact information gaps identified below. Invent nothing.

---

## ⚠️ REVIEW STAGE — STOP NOTICE

Before any production code modification, the following exact information is needed. This document identifies gaps and DOES NOT invent dimensions, loads, coefficients, hydraulic conditions, material properties, or design-code requirements.

**INFORMATION REQUIRED TO PROCEED (see Section 13 & 16):**

1. Manually verified reference data (PDF → variables → calculations) for at least one complete design set
2. Exact design-code clause references for: abutment design, pier design, bearing selection, reinforcement detailing, foundation design under eccentric loading
3. Approved material property values: M20/M25/M30 fck, Fe415/Fe500 fy, PCC γ, VRCC γ, backfill φ, δ wall friction, surcharge height
4. Bearing type and design values (neoprene/POT/PTFE, stiffness, displacement limits)
5. Lacey silt factor f calibration data for each soil type
6. Design code version confirmations: IRC SP:82-2008 vs 2007 vs amendments, IRC 6:2000 vs reprints
7. Confirmation of wLive values (554 kN / 700 kN source derivation for Class A/AA)
8. Afflux formula verification — confirm Molesworth vs IRC SP:82 specified formula
9. Scour multiplier 1.27 — confirmation for straight-reach vs bend conditions

---

## TABLE OF CONTENTS

1. [Complete Repository Inventory](#1-complete-repository-inventory)
2. [PDF, Word, Image, and Sketch Inventory](#2-pdf-word-image-and-sketch-inventory)
3. [Current Execution Trace (PDF → Word/PDF Output)](#3-current-execution-trace-from-pdf-input-to-wordpdf-output)
4. [PDF Extraction Accuracy Assessment](#4-pdf-extraction-accuracy-assessment)
5. [Currently Recognized Variables (from code)](#5-list-of-all-currently-recognized-variables)
6. [Variables Visible in PDF but NOT Recognized by Code](#6-list-of-variables-visible-in-the-pdf-but-not-recognized)
7. [Narrative-to-Variable Mapping](#7-narrative-to-variable-mapping)
8. [Sketch-to-Variable Mapping](#8-sketch-to-variable-mapping)
9. [Calculation and Design-Rule Inventory](#9-current-calculation-and-design-rule-inventory)
10. [Report-Field Inventory](#10-current-report-field-inventory)
11. [Mismatch and Stale-Value Analysis](#11-mismatch-and-stale-value-analysis)
12. [Proposed Submersible-Bridge Data Schema](#12-proposed-submersible-bridge-data-schema)
13. [Missing Code-Basis and Engineering-Decision List](#13-missing-code-basis-and-engineering-decision-list)
14. [Verification and Validation Test Plan](#14-verification-and-validation-test-plan)
15. [Risk Register](#15-risk-register)
16. [Recommended Repair / Refactor / Redesign Decision](#16-recommended-repair-refactor-or-redesign-decision)
17. [Sample Extracted-Input Report (Bridge-01)](#17-one-sample-extracted-input-report-bridge-01-tropical-creek)
18. [Proposed Word/PDF Report Outline](#18-one-proposed-wordpdf-report-outline)

---

## 1. COMPLETE REPOSITORY INVENTORY

### 1.1 Directory Structure (Active Code)

```
e:\Rajkumar\Submersible_Bridge_Design\
├── .vscode/                          # VS Code workspace settings
│   └── settings.json
├── src/                              # PRIMARY ACTIVE SOURCE CODE
│   ├── App.tsx                       # Root React app
│   ├── main.tsx                      # Entry point
│   ├── index.css                     # Global styles
│   ├── components/
│   │   ├── layout/
│   │   │   └── app-layout.tsx
│   │   ├── ui/                       # 45+ shadcn/ui components
│   │   └── CoverPage.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/                          # ✅ CORE BUSINESS LOGIC
│   │   ├── calculations.tsx          # Inputs type + ComputedResults + 3-Step calc engine
│   │   ├── pdf-export.ts             # 7-sheet jsPDF report generator (A3 landscape)
│   │   ├── spreadsheet-import.ts     # CSV/table import → Inputs parser + alias resolver
│   │   ├── sample-document.ts        # 8446-line reference text verification harness
│   │   └── utils.ts
│   └── pages/
│       ├── step1-discharge.tsx       # UI: Step 1 Discharge
│       ├── step2-hydraulic.tsx       # UI: Step 2 Hydraulic
│       ├── step3-structural.tsx      # UI: Step 3 Structural
│       ├── summary.tsx               # UI: Summary
│       ├── document-viewer.tsx       # UI: Verbatim doc viewer
│       ├── document-tests.tsx        # UI: Certification tests
│       ├── drawings.tsx              # UI: Drawing viewer
│       ├── import-variables.tsx      # UI: CSV import
│       ├── statutory-preview.tsx     # UI: Statutory report
│       └── not-found.tsx
├── scripts/                          # ✅ SCRIPT LAYER (build/test/export)
│   ├── generate-169-page-design.ts  # 169-page PDF generator from XLSX
│   ├── verbatim-renderer.ts          # Line classifier + wrap engine
│   ├── verbatim-renderer.test.ts     # Tests for verbatim rendering
│   ├── certify-verbatim-test.ts      # Certification harness
│   ├── rice-grain-test.ts            # Rice-grain accuracy tests
│   ├── generate-sample-copycat.ts
│   ├── run-25-test-sets.mjs          # Batch runner for 25 sets
│   ├── score-qa-rubric.mjs           # QA rubric scorer
│   ├── generate-test-pdfs.mjs
│   ├── compare-pages.cjs
│   ├── analyse-tables.cjs
│   ├── extract-excel-full.cjs
│   ├── parse-excel-logical.cjs       # XLSX → excel-logical.json parser
│   ├── read-excel.cjs
│   ├── read-tables-direct.cjs
│   ├── post-merge.sh
│   ├── src/
│   │   ├── generate-sample-pdf.ts
│   │   └── hello.ts
│   ├── excel-logical.json            # ✅ XLSX extracted rows (600+ label-value pairs)
│   ├── excel-content.json
│   ├── package.json
│   └── tsconfig.json
├── lib/                              # Library workspace packages
│   ├── db/
│   │   ├── drizzle.config.ts
│   │   └── src/
│   │       ├── index.ts              # (EMPTY — no DB tables implemented)
│   │       └── schema/
│   │           └── index.ts          # (EMPTY — no Drizzle tables defined)
│   ├── api-spec/
│   ├── api-zod/
│   └── api-client-react/
├── public/
│   └── favicon.svg
├── attached_assets/                  # ✅ SOURCE INPUTS
│   ├── Type Design of submersible causeway.pdf     # Reference PDF
│   ├── Type Design of submersible causeway.xlsx    # Original Excel workbook
│   ├── Type Design of submersible causeway01.xlsx  # Backup copy
│   └── Bridge-Reorient-System_1786296596544/       # Reorient tool project
├── test-runs/                        # ✅ TEST OUTPUTS
│   └── test-run-2026-07-28T16-28-18/
│       ├── qa-scoring-results.json   # 25/25 sets: 100% QA score (105/105)
│       ├── set-01...set-25/          # 25 bridge input.json + output.pdf
├── test-variables-25-sets.csv        # ✅ 31 variables × 25 sets master CSV
├── CODE-JUNCTION/                    # Planning documents (not code)
├── _archive/                         # DEPRECATED/ARCHIVED code — DO NOT USE
│   └── CODE-JUNCTION/
│       ├── Bridge-Design/            # Old TS generator (v1, archived)
│       └── Submersible_Bridge_Design_statutory_preview/  # Archived statutory preview
├── 169-PAGE-SUBMERSIBLE-CAUSEWAY-DESIGN-REPORT.pdf   # Generated 169-page output
├── CLAUDE-INSTUCTIONS.md
├── IMPLEMENTATION-SUMMARY.md
├── SIDE-BY-SIDE-COMPARISON.md
├── VERBATIM-CERTIFICATION-REPORT.txt
├── vite.config.ts
├── package.json
├── tsconfig.json
├── tsconfig.base.json
├── components.json
├── .gitattributes
├── .gitignore
├── .npmrc
├── .replit
└── .replitignore
```

### 1.2 Active Code File Count (excluding archive/node_modules)

| Category | Count |
|---|---|
| TypeScript (src/) | 63 |
| TypeScript (scripts/) | 8 |
| Shell scripts (.sh) | 1 |
| CJS scripts | 7 |
| MJS scripts | 3 |
| JSON (config+data) | 8 |
| PDF (root + attached) | 3 |
| XLSX | 2 |
| CSV | 1 |
| SVG | 1 |
| MD (root level) | 4 |

---

## 2. PDF, WORD, IMAGE, AND SKETCH INVENTORY

### 2.1 PDF Files

| # | Path | Description | Pages | Role |
|---|---|---|---|---|
| 1 | [169-PAGE-SUBMERSIBLE-CAUSEWAY-DESIGN-REPORT.pdf](file:///e:/Rajkumar/Submersible_Bridge_Design/169-PAGE-SUBMERSIBLE-CAUSEWAY-DESIGN-REPORT.pdf) | **Generated output** — A4 landscape, Excel workbook → 169 pages | 169 | Primary generated report |
| 2 | [attached_assets/Type Design of submersible causeway.pdf](file:///e:/Rajkumar/Submersible_Bridge_Design/attached_assets/Type%20Design%20of%20submersible%20causeway.pdf) | **Source reference PDF** — Original type design document | ~169+ | Design authority reference |
| 3 | [test-runs/.../set-01..25/output.pdf](file:///e:/Rajkumar/Submersible_Bridge_Design/test-runs/test-run-2026-07-28T16-28-18) | 25× 7-sheet A3 landscape generated PDFs per test set | 7 each | Regression test outputs |
| 4 | [_archive/.../Causeway_Design_set-01..25.pdf](file:///e:/Rajkumar/Submersible_Bridge_Design/_archive/CODE-JUNCTION/Bridge-Design/test-runs) | Archived v1 test PDFs (25×2 runs × 25 sets) | ~7 each | Historical baseline |
| 5 | [_archive/.../Type Design of submersible causeway.pdf](file:///e:/Rajkumar/Submersible_Bridge_Design/_archive/CODE-JUNCTION/Submersible_Bridge_Design_statutory_preview/attached_assets) | Archived copy of source PDF | ~169+ | Archive copy |

**TOTAL PDF files:** ~150+ (25 test output × 3 runs + references)

### 2.2 Word/DOCX Files

**FINDING: ZERO .docx files exist in the repository.**

The system currently has **NO Word document generation pipeline**. All output is PDF-only via jsPDF. The 169-page report is rendered directly to PDF.

### 2.3 Image Files

| # | Path | Description | Format |
|---|---|---|---|
| 1 | [public/favicon.svg](file:///e:/Rajkumar/Submersible_Bridge_Design/public/favicon.svg) | App favicon | SVG |
| 2 | [_archive/.../artifacts/causeway-design/public/favicon.svg](file:///e:/Rajkumar/Submersible_Bridge_Design/_archive/CODE-JUNCTION/Submersible_Bridge_Design_statutory_preview/artifacts/causeway-design/public) | Archived favicon | SVG |

**FINDING: ZERO PNG/JPG/DWG/DXF/SKP engineering images or sketches exist as standalone files.** All engineering drawings are procedurally generated inside PDFs via vector-drawing code in [pdf-export.ts](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/pdf-export.ts#L134-L452).

### 2.4 Sketch / Engineering Drawing Inventory

All sketches are **vector-code-rendered, not image files**:

| Drawing | Function | Location |
|---|---|---|
| Cross Section A-A (Transverse) | `drawCrossSection()` | [pdf-export.ts L134-239](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/pdf-export.ts#L134-L239) |
| Longitudinal Section B-B | `drawLongSection()` | [pdf-export.ts L241-348](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/pdf-export.ts#L241-L348) |
| Plan View (Top-down) | `drawPlanView()` | [pdf-export.ts L350-452](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/pdf-export.ts#L350-L452) |

Each drawing uses helper functions:
- `hatch()` — concrete hatching
- `earth()` — soil pattern
- `hDim()` / `vDim()` — dimensioning lines with arrows
- `levelLine()` — HFL/GL/RTL/FBL reference level lines
- `titleBlock()` — standard title block (DRG NO, SCALE, SHEET X/Y)
- `border()` — double-line drawing border

**FINDING: No image-based sketches, DWG, DXF, or SketchUp files exist.**

---

## 3. CURRENT EXECUTION TRACE FROM PDF INPUT TO WORD/PDF OUTPUT

### ⚠️ CRITICAL FINDING: NO PDF INPUT PIPELINE EXISTS

The codebase does **NOT** consume a PDF as input. The actual input chain is:

```
SOURCE TRUTH (attached_assets/)
  └── Type Design of submersible causeway.xlsx    ← ACTUAL INPUT
        │
        ▼
EXTRACTION LAYER (scripts/*.cjs)
  ├── parse-excel-logical.cjs ──────────────────► excel-logical.json
  ├── extract-excel-full.cjs
  ├── read-excel.cjs
  ├── read-tables-direct.cjs
  └── analyse-tables.cjs
        │
        ▼
LOGICAL STRUCTURE CACHE
  └── excel-logical.json (600+ rows: heading/param/text/table)
        │
        ▼
TWO OUTPUT PIPELINES (PARALLEL, NOT CONNECTED):

PIPELINE A — 169-PAGE VERBATIM REPORT (PDF-ONLY)
  │
  └── scripts/generate-169-page-design.ts
        ├── Reads excel-logical.json (or re-reads XLSX directly)
        ├── Classifies rows: title/section/body (verbatim-renderer.ts classifyLine())
        ├── Wraps oversized tokens verbatim (wrapLineVerbatim())
        ├── Renders:
        │   ├── Page 1: Custom title page
        │   ├── Pages 2–146: Excel content (headings → navy bands, params → label|=|value 3-col,
        │   │                          tables → autotable, text → wrapped para)
        │   ├── Pages 147–165: Appendices A–S
        │   ├── Pages 166–168: CS A-A, LS B-B, Plan (NO — actually these may not exist)
        │   └── Page 169: Back cover
        └── ► 169-PAGE-SUBMERSIBLE-CAUSEWAY-DESIGN-REPORT.pdf

PIPELINE B — 7-SHEET DESIGN CALCULATOR (REACT + PDF-EXPORT)
  │
  ├── DATA ENTRY PATHS (3 ways to set Inputs):
  │   ├── PATH 1: Manual UI entry
  │   │   └── pages/step1-discharge.tsx, step2-*.tsx, step3-*.tsx
  │   │       └── Inputs state via CalculationsProvider (calculations.tsx)
  │   │
  │   ├── PATH 2: CSV/Table import
  │   │   └── pages/import-variables.tsx
  │   │       └── spreadsheet-import.ts parseVariableTable()
  │   │           ├── fieldByNormalizedKey Map (key+label+aliases → InputFieldDefinition)
  │   │           └── coerceValue() → patch:Partial<Inputs>
  │   │
  │   └── PATH 3: Batch test (25 sets)
  │       └── scripts/run-25-test-sets.mjs
  │           └── test-variables-25-sets.csv → set-XX/input.json
  │
  ├── CALCULATION ENGINE (src/lib/calculations.tsx)
  │   └── useMemo<ComputedResults> recomputes whenever any Inputs change
  │       ├── STEP 1: qRational, qWeir, qVelocity → qDesign (MAX) + governingMethod
  │       ├── STEP 2: aVent + aRTL/aHFL → %obs + pass/fail + afflux + Lacey scour → FBL
  │       └── STEP 3: wSelf + wSilt + wLive → totalVerticalLoad + fDrag + fUplift + fAnchor
  │
  ├── UI PRESENTATION (React)
  │   └── pages/summary.tsx + document-viewer.tsx + drawings.tsx
  │
  └── PDF EXPORT (src/lib/pdf-export.ts exportDesignPDF())
      ├── jsPDF A3 landscape × 7 sheets
      │   ├── Sheet 1: Cover Page (metadata, contents)
      │   ├── Sheet 2: Step 1 Discharge (table + input params)
      │   ├── Sheet 3: Step 2 Hydraulic (2A Ventway + 2B Afflux/Scour)
      │   ├── Sheet 4: Step 3 Structural (3A Loads + 3B Hydro + 3C Compliance)
      │   ├── Sheet 5: Cross Section A-A (vector drawing)
      │   ├── Sheet 6: Longitudinal Section B-B (vector drawing)
      │   └── Sheet 7: Plan View (vector drawing)
      └── ► Causeway_Design_{projectName}.pdf

WORD OUTPUT PIPELINE:
  └── ❌ NOT IMPLEMENTED — No .docx generator, no Word template, no office-js dependency
```

### 3.2 Execution Trace Summary Table

| Stage | Input | Module | Output | Status |
|---|---|---|---|---|
| 1 | Excel workbook (.xlsx) | parse-excel-logical.cjs | excel-logical.json (600+ label-value rows) | ✅ Works |
| 2 | excel-logical.json | generate-169-page-design.ts + verbatim-renderer.ts | 169-page PDF (verbatim) | ✅ 100% on 16 QA checks |
| 3 | Human/CSV/25-set CSV | spreadsheet-import.ts → calculations.tsx | Inputs typed object + ComputedResults | ⚠️ 31 variables only (not 600+) |
| 4 | Inputs + ComputedResults | pdf-export.ts | 7-sheet A3 landscape PDF | ✅ 25/25 sets 100% QA |
| 5 | PDF → Word | **None** | **No Word output** | ❌ MISSING ENTIRELY |
| 6 | PDF input → extraction | **None** | **No PDF parser reads design PDF** | ❌ MISSING ENTIRELY |

---

## 4. PDF EXTRACTION ACCURACY ASSESSMENT

### ⚠️ NO PDF-TO-DATA EXTRACTION PIPELINE EXISTS

There is **no code** that reads the source PDF (`Type Design of submersible causeway.pdf`) and extracts structured variables. The extraction pipeline is **XLSX-based**.

### 4.1 What IS Extracted (from XLSX, not PDF)

| Extraction Target | Method | Evidence | Accuracy Claim |
|---|---|---|---|
| Excel workbook rows | `xlsx` npm package → parse-excel-logical.cjs | [excel-logical.json](file:///e:/Rajkumar/Submersible_Bridge_Design/scripts/excel-logical.json) 600+ rows | **NOT VERIFIED against PDF** |
| 8446-line text document | Attached `.txt` (raw import) | [sample-document.ts](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/sample-document.ts#L44-L49) | 16 certification checks, 15/16 hardcoded expected |
| 31 Design variables | Manual mapping in `INPUT_FIELD_DEFINITIONS` | [spreadsheet-import.ts L16-47](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/spreadsheet-import.ts#L16-L47) | **NOT VERIFIED against PDF** |
| 25 Test-set values | `test-variables-25-sets.csv` handcrafted | 31 columns × 25 rows | **NOT VERIFIED against PDF** |

### 4.2 Certification Check Summary (Verbatim Renderer)

From [sample-document.ts L82-L187](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/sample-document.ts#L82-L187):

| Check | Expected | Status |
|---|---|---|
| T01: Total line count | 8446 lines | Hardcoded assertion |
| T02: Non-empty line count | 4008 lines | Hardcoded assertion |
| T03: Rice-grain phrase | "width of abutment is considered..." | Hashed via `hasPhrase()` |
| T04: Water current narrative | "Water pressure is considered on square ended..." | Hashed |
| T05: Tractive/braking narrative | "6.Tractive,braking effort of vehicles..." | Hashed |
| T06: Buoyancy narrative | "7.Buoyancy :-" | Hashed |
| T07: Earth pressure narrative | "active earth pressure due to back fill" | Hashed |
| T08: Design Parameters section | Section detection | Regex pattern match |
| T09: Value 47.84KN | Braking force | Hashed |
| T10: Value 145.80KN | Buoyancy reduction | Hashed |
| T11: Ka = 0.3 | Earth pressure coeff | Hashed |
| T12: IRC SP:82-2008 ref | Code reference | Hashed |
| T13: 50-line spot check | Evenly sampled | Self-reference (circular) |
| T14: Section headers | ≥ 8 sections detected | Regex count |
| T15: First non-empty line | "DESIGN  OF  VENTED SUBMERSIBLE CAUSEWAY" | Exact match |
| T16: Last non-empty line | "As per the clause 6.4.2(vi)...minimum width = 6.0m" | Exact match |

### 4.3 Accuracy Assessment Verdict

**STATUS: CANNOT CLAIM ACCURACY**

Reasons:
1. **No PDF extraction code exists** — so PDF→variable accuracy is 0% measured (not attempted)
2. **No manually verified reference information** has been compared against extracted variables
3. XLSX→JSON extraction has never been compared against PDF content side-by-side
4. The "100% QA score" in qa-scoring-results.json measures **rubric structural completeness**, not **engineering correctness**
5. Rice-grain tests (T03, T09, T10, T11) check 4 specific numeric tokens out of **hundreds** in the PDF

**REQUIRED BEFORE CLAIMING ACCURACY:** Manual side-by-side verification of at minimum:
- All 31 `Inputs` variables (Section 5) against the PDF
- All 29 `ComputedResults` variables (Section 5) against hand calculations from PDF
- Cross Section A-A, Longitudinal B-B, and Plan View drawing dimensions
- All IRC code clause references and formula selections

---

## 5. LIST OF ALL CURRENTLY RECOGNIZED VARIABLES

### 5.1 Inputs Type (40 fields, 4 sections — [calculations.tsx L3-L41](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/calculations.tsx#L3-L41))

#### Metadata (4)
| # | Key | Type | Unit | Aliases |
|---|---|---|---|---|
| 1 | `projectName` | string | — | project, name_of_work |
| 2 | `streamName` | string | — | stream, nallah_name |
| 3 | `location` | string | — | — |
| 4 | `date` | string | — | report_date |

#### Step 1 — Discharge (7)
| # | Key | Type | Unit | Aliases |
|---|---|---|---|---|
| 5 | `catchmentArea` | number | km² | — |
| 6 | `runoffCoefficient` | number | — | runoff_coefficient, c |
| 7 | `rainfallIntensity` | number | mm/hr | rainfall, intensity |
| 8 | `surplusWeirLength` | number | m | weir_length, lw |
| 9 | `heightOfFallWeir` | number | m | weir_head, hw |
| 10 | `streamAreaHFL` | number | m² | stream_area, a_stream |
| 11 | `meanVelocityHFL` | number | m/s | stream_velocity, v_mean |

#### Step 2 — Hydraulic (11)
| # | Key | Type | Unit | Aliases |
|---|---|---|---|---|
| 12 | `customDesignDischarge` | number\|null | m³/s | design_discharge_override, q_override |
| 13 | `hfl` | number | m | — |
| 14 | `gl` | number | m | ground_level, bed_level |
| 15 | `rtl` | number | m | — |
| 16 | `numVents` | number | — | vents, number_of_vents |
| 17 | `ventWidth` | number | m | vent_width, b |
| 18 | `ventHeight` | number | m | vent_height, hv |
| 19 | `approachVelocity` | number | m/s | approach_velocity, v_app |
| 20 | `siltFactor` | number | — | lacey_silt_factor, f |
| 21 | `cdVent` | number | — | cd, cd_vent |

#### Step 3 — Structural (10)
| # | Key | Type | Unit | Aliases |
|---|---|---|---|---|
| 22 | `deckWidth` | number | m | — |
| 23 | `deckSpan` | number | m | — |
| 24 | `deckThickness` | number | m | — |
| 25 | `numSpans` | number | — | spans, number_of_spans |
| 26 | `liveLoadType` | enum | — | live_load (IRC Class A / AA) |
| 27 | `waterDensity` | number | kg/m³ | — |
| 28 | `concreteDensity` | number | kg/m³ | — |
| 29 | `dragCoefficient` | number | — | drag_coefficient, cd_drag |
| 30 | `siltLoadDeck` | number | kN/m² | silt_load, silt_load_deck |

**TOTAL RECOGNIZED INPUTS: 31 user-editable + 1 nullable override + 4 metadata = 36 recognized fields in code.**

### 5.2 ComputedResults Type (29 fields — [calculations.tsx L43-L82](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/calculations.tsx#L43-L82))

#### Step 1 Results (5)
`qRational`, `qWeir`, `qVelocity`, `qDesign`, `governingMethod`

#### Step 2 Results (16)
`designDischarge`, `aVent`, `effectiveWidth`, `aRTL`, `aHFL`, `pctObsRTL`, `pctObsHFL`, `passRTL`, `passHFL`, `velocityHFL`, `hAfflux`, `laceyPerimeter`, `laceyScourDepth`, `maxScourDepth`, `fbl`, `recommendedDepth`, `scourSafe`

#### Step 3 Results (8)
`wSelf`, `wSilt`, `wLive`, `totalVerticalLoad`, `fDrag`, `fUplift`, `fAnchor`, `fDragTotal`

**TOTAL RECOGNIZED VARIABLES IN CODE: 36 Inputs + 29 ComputedResults = 65 total.**

---

## 6. LIST OF VARIABLES VISIBLE IN THE PDF BUT NOT RECOGNIZED

### 6.1 Evidence Sources

1. **[excel-logical.json](file:///e:/Rajkumar/Submersible_Bridge_Design/scripts/excel-logical.json)** — 600+ label-value rows extracted from XLSX
2. **[test-variables-25-sets.csv](file:///e:/Rajkumar/Submersible_Bridge_Design/test-variables-25-sets.csv)** — 31 columns × 25 sets

### 6.2 Variables in test-variables-25-sets.csv but NOT in Inputs type (6)

From CSV header row: `SetID, projectName, ... , hfl, **ofl**, **lbl**, rtl, **bottomDeck**, **carriageW**, numVents, ... , **SBC**, **d_LBL**`

| # | CSV Variable | Approx Meaning | Evidence | In Inputs? |
|---|---|---|---|---|
| N1 | `ofl` | Ordinary Flood Level (m) | CSV col 10; XLSX heading row 61 | ❌ NO |
| N2 | `lbl` | Low Bed Level (m) | CSV col 11; XLSX heading row 62 | ❌ NO |
| N3 | `bottomDeck` | Bottom of deck elevation (m) | CSV col 13 | ❌ NO |
| N4 | `carriageW` | Carriageway width (m) | CSV col 14 | ❌ NO — replaced by `deckWidth` |
| N5 | `SBC` | Safe Bearing Capacity (t/m² or kN/m²) | CSV col 31; XLSX heading row 65 | ❌ NO |
| N6 | `d_LBL` | Depth from LBL to foundation? (m) | CSV col 32 | ❌ NO |

### 6.3 Variables in excel-logical.json (XLSX) but NOT in Inputs type (~200+)

**Abutment Design Parameters** (from XLSX rows 14–69):
- Clear Right Span, Deck slab length, Width of carriage way, Thickness of deck slab as per IRC SP 20, Thickness of wearing coat, Height of guard stones, Thickness of dirt wall, Sectional area of dirt wall, Thickness of strip footing, Height of abutments
- Top width of abutments, Bottom width of abutments, Sectional area of abutment section, Bank side batter, Stream side batter
- Width of 1st/2nd/3rd footing, Thickness of 1st/2nd/3rd footing, Canal/bank side offsets for each footing
- Width of VRCC strip footing, Thickness of VRCC strip footing, Offsets of RCC strip footing
- Offsets along width of each footing

**Material Properties** (from XLSX headings rows 51–69):
- γrc (unit wt RCC), γpc (unit wt PCC), γ (backfill density), γw (unit wt water)
- φ (angle of shearing resistance), α (wall face angle), β (backfill slope)
- δ (angle of wall friction), h3 (surcharge height)
- fck_PCC, fck_VRCC, fy (steel yield), Cover to reinforcement

**Geotechnical:**
- SBC (present in CSV as noted above)

**Structural Results (from XLSX rows 74–700+):**
- Dead load sub-items: Deck slab self-weight, Dirt wall self-weight, Wearing coat, Abutment section, Top footing, 2nd/3rd/4th footing weights
- Load eccentricity calculations (abutment + each footing level)
- Ka (active earth pressure), Passive pressure, Surcharge pressure
- Braking force 47.84 kN, Buoyancy reduction 145.80 kN
- Water current loads, Earth pressure totals, Moment tables, Shear tables
- Bearing pressure checks, Stability against sliding/overturning

**Estimated missing structured variables: 150–200+ not in code's Inputs/ComputedResults.**

---

## 7. NARRATIVE-TO-VARIABLE MAPPING

### 7.1 Existing Narrative Detection

The only narrative-classification code is in [verbatim-renderer.ts L138-L162](file:///e:/Rajkumar/Submersible_Bridge_Design/scripts/verbatim-renderer.ts#L138-L162):

```typescript
isNarrativeLine(rawText):
  - NOT a section heading (classifyLine ≠ 'body')
  - Does NOT contain '=' (excludes param rows)
  - Does NOT contain 'S.No', 'Load in KN', 'Moment' (excludes tables)
  - Does NOT start with digits+spaces (excludes numbered table rows)
  - MUST contain at least one [A-Za-z]
```

### 7.2 Section Detection Patterns

From [sample-document.ts L23-L30](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/sample-document.ts#L23-L30) and [verbatim-renderer.ts L28-L44](file:///e:/Rajkumar/Submersible_Bridge_Design/scripts/verbatim-renderer.ts#L28-L44):

| Pattern | Mapped Section | Example |
|---|---|---|
| `DESIGN OF VENTED SUBMERSIBLE CAUSEWAY` | Title | — |
| `Design Philosophy` | Design Philosophy | Narrative only |
| `Step\s*1` | Step 1: Design Discharge | 3 discharge methods narrative |
| `Step\s*2` | Step 2: Hydraulic Design | RTL/HFL/vent/afflux/scour narrative |
| `Step\s*3` | Step 3: Structural Design | Loads/IRC codes narrative |
| `^[IVX]+\)` | Roman numeral subsections | I) Design Parameters, II) Loading pattern |
| Uppercase section regex | Section headers | e.g., "I)Design Parameters:-" |

### 7.3 Narrative-to-Variable Mapping (MANUALLY INFERRED — NOT IN CODE)

From the text in [excel-logical.json](file:///e:/Rajkumar/Submersible_Bridge_Design/scripts/excel-logical.json), narrative paragraphs reference these variables:

| Narrative Phrase | Implied Variable(s) | Currently Mapped? |
|---|---|---|
| "area-velocity method and catchment area method" | `catchmentArea`, `runoffCoefficient`, `rainfallIntensity`, `streamAreaHFL`, `meanVelocityHFL` | ✅ Step 1 |
| "surplus wier of the tank is also taken into account" | `surplusWeirLength`, `heightOfFallWeir` | ✅ Step 1 |
| "broad-crested wier formula" | → `qWeir` computation | ✅ Step 1 |
| "HFL,OFL are fixed as per the local enquiry" | `hfl`, `ofl` | ⚠️ `hfl` yes, `ofl` MISSING |
| "RTL of the causeway is kept below the HFL" | `rtl`, `hfl` | ✅ Step 2 |
| "obstruction to flow is less than 70% @ RTL, <30% @ HFL" | `pctObsRTL`, `pctObsHFL` | ✅ Step 2 (computed) |
| "IRC SP:82--2008" | Design code (all steps) | Meta only |
| "afflux calculations are carried out" | `hAfflux` | ✅ Step 2 (computed) |
| "Lacey's equations — Normal scour depth" | `laceyScourDepth`, `siltFactor` | ✅ Step 2 |
| "Maximum scour depth" | `maxScourDepth` | ✅ Step 2 (computed) |
| "bottom level of the foundation was fixed below max scour" | `fbl`, `recommendedDepth` | ✅ Step 2 (computed) |
| "IRC 6:2000, IRC class A live load" | `liveLoadType` | ✅ Step 3 |
| "effect of drag and lift as per IRC-SP:82--2008" | `dragCoefficient`, `fDrag`, `fUplift`, `fAnchor` | ✅ Step 3 |
| "Additional live load due to silt on deck" | `siltLoadDeck` | ✅ Step 3 |
| "Stainless steel anchor bars and VRCC thrust blocks" | → NOT in model | ❌ Design decisions missing |
| "SBC of 15t/m2" | `SBC` (missing variable) | ❌ MISSING |
| "Deck slab per Plate No.7.09 of IRC:SP20-2002" | → `deckThickness` source reference | ⚠️ Hardcoded input, no clause map |
| "Dirt wall per Plate No.7.25 of IRC:SP20-2002" | → NOT in model | ❌ Dirt wall missing |
| "1.Dead load ... 10.Water pressure force" | Loading list | ⚠️ Only 3 of 10+ loads modeled |
| "150 mm thick silt with density 15 kN/m3 on soffit" | → `siltLoadDeck` derivation | ⚠️ Input is kN/m² not 150mm+15kN |
| "Clause 7.11.2.2 IRC SP:82---2007 pressures" | Static head/velocity head/eddies/friction/uplift | ❌ Only uplift and drag modeled |
| "Clause 202.3 of IRC 6:2000 — no stress increase" | Permissible stress rule | ❌ No permissible stress checks in code |
| "Dead load table: Deck slab=244.80KN, Dirt wall=55.50KN, Wearing coat=38.25KN" | Three `wSelf` sub-components | ❌ `wSelf` is one lumped value |
| "Ka = 0.3" (active earth pressure) | `Ka` computed from φ, α, β, δ | ❌ Entire earth pressure module MISSING |
| "Braking force 47.84KN" | Tractive/braking effort | ❌ MISSING from Step 3 loads |
| "Buoyancy reduction 145.80KN" | `fUplift` sub-component | ⚠️ `fUplift` exists but no buoyancy table |
| "Width of abutment for full height upto HFL" | Abutment dimensions | ❌ Abutment module MISSING |
| "Clause 6.4.2(vi) IRC SP:82-2008 minimum width = 6.0m" | Minimum carriageway width rule | ❌ No minimum width enforcement in code |

---

## 8. SKETCH-TO-VARIABLE MAPPING

### 8.1 Drawing 1: Cross Section A-A — Transverse [pdf-export.ts L134-239](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/pdf-export.ts#L134-L239)

| Sketch Feature | Variables Used | Hardcoded Values |
|---|---|---|
| Total causeway width calc | `numVents`, `ventWidth` | `PIER_W=0.4m`, `ABUT_W=0.6m`, `FEXT=0.4m` (❌ hardcoded!) |
| Deck top elevation | `rtl`, `deckThickness` | — |
| HFL water level in vents | `hfl`, `rtl`, `gl` | — |
| Abutment + Pier rectangles (soffit to FBL) | `numVents` | Geometry hardcoded: PIER_W, ABUT_W, FEXT |
| Deck slab rectangle | `deckThickness` | — |
| HFL line | `hfl` | RGB [30,100,200] |
| GL line | `gl` | RGB [40,110,40] |
| FBL line | `fbl` (computed) | RGB [180,40,40] |
| RTL line | `rtl` | RGB [90,90,90] |
| Scour depth dimension | `maxScourDepth`, `recommendedDepth` | — |
| Labels: VENT, ABT, P | `numVents` iteration | — |
| Vent dim | `ventWidth`, `ventHeight` | — |
| Title block project info | `projectName`, `streamName`, `location`, `date` | Scale="1:50 (SCHEMATIC)" hardcoded |
| nPiers computation | `numVents - 1` | — |

### 8.2 Drawing 2: Longitudinal Section B-B [pdf-export.ts L241-348](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/pdf-export.ts#L241-L348)

| Sketch Feature | Variables Used | Hardcoded Values |
|---|---|---|
| Total length calc | `deckSpan`, `numSpans` | `ABUT_W=0.8m`, `APP=3.0m`, `PIER_W=0.4m`, `FEXT=0.4m` (❌) |
| Abutment L/R boxes | — | Size from hardcoded ABUT_W |
| Interior piers (S1...Sn) | `numSpans`, `deckSpan` | PIER_W hardcoded |
| Scour profile (dip) | — | `dip = 0.35*vS` cosmetic only, not hydraulically derived |
| Level lines (HFL, GL, FBL, RTL) | Same as CS A-A | — |
| Flow direction arrow | — | Cosmetic |
| Span dimension | `deckSpan` | — |
| Cut line A-A marker | — | Shows correspondence with CS |

### 8.3 Drawing 3: Plan View [pdf-export.ts L350-452](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/pdf-export.ts#L350-L452)

| Sketch Feature | Variables Used | Hardcoded Values |
|---|---|---|
| Stream banks (blue) | `deckWidth` | `bankW=deckWidth*1.6` (❌) |
| Approach sections (3m each side) | — | `APP=3.0m` hardcoded |
| Span layout (S1..Sn) | `deckSpan`, `numSpans`, `deckWidth` | — |
| Abutment L/R | — | ABUT_W hardcoded |
| Flow direction arrow | — | Cosmetic |
| North arrow | — | Cosmetic only, not aligned to site |
| Vent arrangement text | `numVents`, `ventWidth`, `ventHeight` | — |

### 8.4 Sketch-to-Variable Mapping Defects

| # | Defect | Hardcoded Value | Should Be Variable |
|---|---|---|---|
| S1 | Pier width | `PIER_W = 0.4m` | From abutment/Pier design module |
| S2 | Abutment width | `ABUT_W = 0.6/0.8m` (differs per drawing!) | From abutment design |
| S3 | Footing extension | `FEXT = 0.4m` | From geotechnical + SBC |
| S4 | Approach length | `APP = 3.0m` | From geometric standards |
| S5 | Drawing scale | `"1:50 (SCHEMATIC)"` | Auto-compute from geometry |
| S6 | Bank width multiplier | `bankW = deckWidth * 1.6` | Hydraulic bank line data |
| S7 | North arrow orientation | Always pointing up | True site north bearing |

---

## 9. CURRENT CALCULATION AND DESIGN-RULE INVENTORY

### 9.1 STEP 1 — DESIGN DISCHARGE ([calculations.tsx L152-L160](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/calculations.tsx#L152-L160))

| # | Formula | Variables | Code Reference | Basis |
|---|---|---|---|---|
| 1.1 | `qRational = (C × I × A) / 3.6` | C=runoffCoeff, I=rainfall (mm/hr), A=catchment (km²) | L153 | Rational Method (CWC guidelines) |
| 1.2 | `qWeir = 1.705 × Lw × Hw^1.5` | Lw=surplusWeirLength, Hw=heightOfFallWeir | L154 | Broad-crested weir formula |
| 1.3 | `qVelocity = A_stream × V_mean` | A=streamAreaHFL, V=meanVelocityHFL | L155 | Area-Velocity (continuity) |
| 1.4 | `qDesign = MAX(qRational, qWeir, qVelocity)` | All 3 above | L157-L160 | Envelope (governing method tagged) |

### 9.2 STEP 2 — HYDRAULIC DESIGN ([calculations.tsx L162-L193](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/calculations.tsx#L162-L193))

#### 2A. Ventway Calculations

| # | Formula | Variables | Basis |
|---|---|---|---|
| 2.1 | `designDischarge = customDesignDischarge ?? qDesign` | Optional override | User override clause |
| 2.2 | `aVent = N × b × h_v` | numVents × ventWidth × ventHeight | Continuity: vent opening area |
| 2.3 | `effectiveWidth = Q_design / V_app` | Q=designDischarge, Vapp=approachVelocity | Flow width approximation |
| 2.4 | `aRTL = (RTL − GL) × effectiveWidth` | RTL, GL | Flow area at RTL level |
| 2.5 | `aHFL = (HFL − GL) × effectiveWidth` | HFL, GL | Flow area at HFL level |
| 2.6 | `%Obs_RTL = (1 − aVent/aRTL) × 100` | — | IRC SP:82 obstruction check |
| 2.7 | `%Obs_HFL = (1 − aVent/aHFL) × 100` | — | IRC SP:82 obstruction check |
| 2.8 | `passRTL = %Obs_RTL < 70%` | Threshold 70% | IRC SP:82-2008 spec |
| 2.9 | `passHFL = %Obs_HFL < 30%` | Threshold 30% | IRC SP:82-2008 spec |

#### 2B. Afflux + Scour

| # | Formula | Variables | Basis |
|---|---|---|---|
| 2.10 | `V_HFL = Q_design / aHFL` | — | Continuity |
| 2.11 | `hAfflux = (V²/17.88 + 0.015) × ((aHFL/aVent)² − 1)` if aHFL > aVent | — | Molesworth's afflux formula |
| 2.12 | `P_lacey = 4.75 × √Q` | Q=designDischarge | Lacey regime perimeter |
| 2.13 | `R = 0.473 × (Q/f)^(1/3)` | f=siltFactor | Lacey normal scour depth |
| 2.14 | `D_max = 1.27 × R` | 1.27 scour multiplier (straight reach) | IRC SP:82 Cl.6 |
| 2.15 | `FBL = HFL − D_max` | — | Foundation bottom level |
| 2.16 | `recommendedDepth = GL − FBL` | — | Depth below ground |
| 2.17 | `scourSafe = FBL < (GL − 0.5)` | 0.5m freeboard below GL | Internal check |

### 9.3 STEP 3 — STRUCTURAL DESIGN ([calculations.tsx L195-L204](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/calculations.tsx#L195-L204))

#### 3A. Loads per Span

| # | Formula | Variables | Basis |
|---|---|---|---|
| 3.1 | `wSelf = (ρ_c × g × W_dk × L_sp × t_sl) / 1000` | ρ=concreteDensity (kg/m³), g=9.81, kN conversion | Dead load: deck slab self-weight |
| 3.2 | `wSilt = w_silt × W_deck × L_span` | w_silt=siltLoadDeck (kN/m²) | IRC SP:82 deck silt load |
| 3.3 | `wLive = 700 (AA) / 554 (A)` | liveLoadType enum | IRC Class A/AA — HARDCODED VALUES |
| 3.4 | `totalVerticalLoad ≈ wSelf + wSilt + wLive/N_spans` | Approximate | Not a load combination per IRC 6:2000 |

#### 3B. Hydrodynamic Forces

| # | Formula | Variables | Basis |
|---|---|---|---|
| 3.5 | `fDrag = Cd × 0.5 × ρ_w × V² × (W_dk × t_sl) / 1000` | Cd=dragCoefficient, ρ=waterDensity, V=velocityHFL | Drag on deck (per span) |
| 3.6 | `fUplift = ρ_w × g × Vol_deck / 1000` | Vol=W_dk × L_sp × t_sl | Buoyancy uplift (per span) |
| 3.7 | `fAnchor = fUplift − wSelf` | — | Net uplift > self-weight → anchors needed |
| 3.8 | `fDragTotal = fDrag × N_spans` | — | Total drag across full bridge |

### 9.4 Compliance Rules (PASS/FAIL checks)

| Rule | Threshold | Location |
|---|---|---|
| %Obs_RTL < 70% | 70% obstruction @ RTL | pdf-export.ts 3C table |
| %Obs_HFL < 30% | 30% obstruction @ HFL | pdf-export.ts 3C table |
| FBL < GL − 0.5m | 0.5m below GL | pdf-export.ts 3C table |
| fAnchor ≤ 0 | No net uplift | pdf-export.ts 3C table |

### 9.5 Missing Calculations (CRITICAL GAPS)

Compared to XLSX reference (excel-logical.json rows 70–700+), the code MISSING:

| Category | Missing Items |
|---|---|
| Dead loads | Dirt wall weight, Wearing coat weight, Abutment self-weight (4 levels of footings) |
| Live loads | Impact load, Wind load, Surcharge load, Wheel/tandem axle distribution |
| Hydraulic loads | Water current (transverse), Static head pressure from afflux, Velocity head pressure, Eddy pressure, Water friction on piers |
| Earth pressures | Active Ka from φ/α/β/δ, Passive Kp, Surcharge pressure, Sliding stability check, Overturning stability check, Bearing pressure + eccentricity, Tensile crack check |
| Tractive/braking | 47.84 KN braking (present in PDF, NOT in code) |
| Buoyancy details | Buoyancy reduction table (145.80 KN present in PDF, lumped only) |
| Foundation | SBC utilization, Footing sizing per SBC, Eccentricity at each footing level, Combined footing analysis |
| Reinforcement | M_u, V_u, Ast required, Minimum Ast, Distribution steel, Cover checks, Development length |
| Abutment design | Full abutment structural design (bending + shear at base), Stem design, Wing wall design, Thrust block design (VRCC per IRC SP:82-2007) |
| Pier design | Pier column design, Pier cap design, Pier footing design |
| Deck slab | Per SP20 Plate 7.09 — currently only a dimension input, no check |
| Dirt wall | Per SP20 Plate 7.25 — not modeled at all |
| Anchor design | Stainless steel anchor sizing, spacing, embedment length |
| Serviceability | Deflection check, Crack width check |
| Load combinations | DL+LL, DL+LL+WL, DL+EQ, DL+hydrostatic+uplift+silt per IRC 6:2000 Cl.202 |

**FINDING: Only ~10% of the reference XLSX calculations are implemented in calculations.tsx.**

---

## 10. CURRENT REPORT-FIELD INVENTORY

### 10.1 7-Sheet PDF Report ([pdf-export.ts](file:///e:/Rajkumar/Submersible_Bridge_Design/src/lib/pdf-export.ts))

#### Sheet 1 — Cover Page (L459-508)
| Field | Source |
|---|---|
| Title "DESIGN OF VENTED SUBMERSIBLE CAUSEWAY" | Hardcoded |
| Subtitle "HYDRAULIC & STRUCTURAL DESIGN REPORT" | Hardcoded |
| Ministry header | Hardcoded |
| Name of Work, Stream/Road, Location, Date | `inputs.projectName`, `streamName`, `location`, `date` |
| Code reference footer | Hardcoded: IRC SP:82-2008 & IRC 6:2000 |
| Contents table (7 sheets) | Hardcoded list |

#### Sheet 2 — Step 1: Design Discharge (L510-565)
| Field | Source |
|---|---|
| 3-method comparison table (5 cols) | `qRational`, `qWeir`, `qVelocity`, `governingMethod` |
| Highlighted "Q = xx m³/s (Governed by: ...)" | `qDesign`, `governingMethod` |
| 7-parameter input table (Symbol/Value/Unit) | 7 Step-1 inputs |
| Code reference footer | Hardcoded: Rational Method, Weir formula, IRC SP:82-2008 |
| Title block | DRG NO=CS/CALC/01, SHEET 2/7, Scale=— |

#### Sheet 3 — Step 2: Hydraulic Design (L567-628)
**2A. VENTWAY TABLE (7 cols: Parameter, Symbol, Formula, Value, Unit, Limit, Status)**

| Fields | Values |
|---|---|
| N, b, h_v, A_vent, A_RTL, A_HFL, %Obs_RTL + PASS/FAIL (<70%), %Obs_HFL + PASS/FAIL (<30%) | Inputs + Step 2A computed results |

**2B. AFFLUX & SCOUR TABLE (5 cols)**

| Fields | Values |
|---|---|
| V_HFL, h_f, P (Lacey), f (silt factor), R (scour), D_max, FBL, D_fdn | Step 2B computed |

Code references: Lacey 1930, Molesworth afflux, IRC SP:82-2008 Cl.6

#### Sheet 4 — Step 3: Structural Design (L630-708)
**3A. LOAD ANALYSIS PER DECK SPAN**

| Fields | Values |
|---|---|
| W_self (formula + value), W_silt, W_live (IRC Class A or AA label), W_tot approx | Step 3A |

**3B. HYDRODYNAMIC FORCES**

| Fields | Values |
|---|---|
| V_HFL, F_drag per span + Cd note, F_drag_T total, F_uplift, F_anchor + SAFE/ANCHORS REQD flag | Step 3B |

**3C. COMPLIANCE SUMMARY (4 rows PASS/FAIL)**

| Fields | Limit |
|---|---|
| Ventway @ RTL <70%, @ HFL <30%, Foundation depth >0.5m below scour, Deck uplift W_self > F_uplift | IRC SP:82-2008, IRC 6:2000 |

#### Sheets 5–7 — Engineering Drawings
See Section 8. All title blocks contain: Project, Stream, Location, Date, Drawing Title, DRG NO., Scale, Sheet X/7.

### 10.2 169-Page Verbatim Report (generate-169-page-design.ts)
No structured field inventory — entire workbook content rendered verbatim via heading/param/table/text row classes.

### 10.3 Report Field Coverage vs PDF/XLSX Reference

| Category | Reported | In Reference PDF | % Covered |
|---|---|---|---|
| Metadata | 4 fields | 4+ | ~90% |
| Step 1 Discharge | 7 inputs + 5 results | 7 inputs + 5 results | 100% |
| Step 2 Hydraulic | 10 inputs + 16 results | ~50+ rows (XLSX section 2) | ~35% |
| Step 3 Structural | 9 inputs + 8 results | ~500+ rows (XLSX sections 3–end) | ~5% |
| Engineering drawings | 3 sheets, schematic | 3 sheets + details, reinforcement | ~20% |
| Code references | IRC SP:82-2008, IRC 6:2000 (general) | 20+ clause-level specific references | ~10% |
| Appendices A–S | Present in 169-page as pages 147–165 | — | Not inspected |

---

## 11. MISMATCH AND STALE-VALUE ANALYSIS

### 11.1 Variable Mismatches

| # | Item | In Inputs Type | In 25-set CSV | In XLSX | Mismatch Type |
|---|---|---|---|---|---|
| M1 | `deckWidth` vs `carriageW` | ✅ `deckWidth` only | ✅ Both present | ✅ Both present | **Synonym mismatch** — carriageW=carriageway, deckWidth includes shoulders? |
| M2 | `gl` definition (Ground Level vs Bed Level) | aliased to both | Has `lbl` (Low Bed Level) + `gl` separate | XLSX has separate LBL, GL, HFL, OFL | **Level collapse: 4 levels → 2 in code** (missing OFL, LBL) |
| M3 | `liveLoadType` allowed values | "IRC Class A" or "IRC Class AA" | Includes "IRC Class 70R" (sets 18, 24) | XLSX references IRC Class A only | **Enum too narrow** — 70R not recognized |
| M4 | `wLive` Class A/AA values | 554 kN / 700 kN (hardcoded) | — | XLSX shows detailed axle group loads (not single number) | **Hardcoded constants, no source derivation documented** |
| M5 | Drag Cd values | `dragCoefficient` input (numeric) | Range 1.4–2.5 across 25 sets | IRC SP:82 specifies Cd per shape | **No Cd-source-to-shape mapping stored** |
| M6 | `cdVent` (vent discharge coefficient) | Field exists in Inputs | 0.9 all sets, set-02/03/08/11/14/19/21=4.1 | ❌ 4.1 is impossible for Cd (max ~1.0) | **DATA ERROR: 7 sets have cdVent=4.1 (not 0.9)** — possible column misalignment in CSV |
| M7 | `siltFactor` f for Lacey | Field exists | 0.5–2.5 range in 25 sets | XLSX heading row — no specific value visible | **No siltFactor-to-soil-class mapping** |
| M8 | `SBC` (Safe Bearing Capacity) | ❌ Missing | ✅ Present (5–50 kN/m² range) | ✅ XLSX heading row 65 | **Input gap: SBC never checked against bearing pressure** |
| M9 | `ofl` (Ordinary Flood Level) | ❌ Missing | ✅ Present (25 sets) | ✅ XLSX heading row | **Input gap** |
| M10 | `lbl` (Low Bed Level) | ❌ Missing | ✅ Present (25 sets) | ✅ XLSX heading row | **Input gap — currently using gl alone, no LBL depth** |
| M11 | `bottomDeck` elevation | ❌ Missing | ✅ Present (25 sets) | In XLSX abutment dims | **Input gap — deck bottom not independent of RTL** |

### 11.2 Structural / Architectural Mismatches

| # | Mismatch | Evidence | Severity |
|---|---|---|---|
| A1 | ABUT_W 0.6m (CS drawing) vs 0.8m (LS drawing) | pdf-export.ts L139 vs L246 | **HIGH — inconsistent drawings** |
| A2 | Approach APP=3.0m hardcoded; no approach in CS A-A, yes in LS B-B | Plan view shows approach; CS shows abutments only | MEDIUM |
| A3 | No pier in plan view (spans only), piers in LS B-B | Plan view renders span rectangles, piers implied at lines 417-421 | MEDIUM |
| A4 | Scour profile in LS B-B is cosmetic (dip=0.35*vS), not D_max-derived | L310-313 | HIGH — drawings mislead on scour shape/depth |
| A5 | VRCC thrust blocks, stainless steel anchors mentioned in narrative (Step 3 text) but not drawn or designed | excel-logical.json Step 3 text; pdf-export.ts has no anchor/thrust block details | HIGH |

### 11.3 QA Score Circularity

The 100% (105/105) QA rubric score in `qa-scoring-results.json` measures:
- coverPage, narrativeProse, formulaBlocks, tablesWithContext, passFailChecks, interpretiveNotes, codeReferences, a4Portrait, sectionCompleteness, antiPatternClean

These are **structural completeness rubrics**, NOT:
- Engineering correctness
- Variable accuracy
- Drawing dimensional accuracy
- Code clause conformance

**FINDING: "100% QA Score" is misleading if presented as engineering-quality metric.**

### 11.4 Stale / Unused Code

| Item | Location | Status |
|---|---|---|
| `lib/db/src/schema/index.ts` (empty) | DB schema — zero tables defined | STALE placeholder |
| `lib/api-zod` / `lib/api-client-react` / `lib/api-spec` packages | REST API scaffolding, zero causeway endpoints | STALE boilerplate |
| `_archive/CODE-JUNCTION/Bridge-Design/` | v1 TypeScript generator | STALE (archived copy exists) |
| `_archive/CODE-JUNCTION/Submersible_Bridge_Design_statutory_preview/` | v1 statutory preview | STALE (archived) |
| `attached_assets/Bridge-Reorient-System_.../` | Separate project embedded | STALE unrelated project |
| `cdVent` values 4.1 in sets 2,3,8,11,14,19,21 | test-variables-25-sets.csv | **DATA ERROR — should be reviewed, not used as-is** |

---

## 12. PROPOSED SUBMERSIBLE-BRIDGE DATA SCHEMA

**Current state: No database schema implemented. lib/db/ is empty (see Section 11.4). Below is the proposed schema for production implementation.**

### 12.1 Entity-Relationship Model (Proposed)

```
┌─────────────────────────┐
│       PROJECT           │  PK: project_id
│  (Metadata, versioning) │
│  ─────────────────────  │
│  project_id SERIAL PK   │
│  name (projectName)     │
│  stream_name            │
│  location               │
│  design_date            │
│  design_code_edition    │  (IRC SP:82-2008+A1, etc.)
│  created_at             │
│  created_by             │
│  status (DRAFT/REV/APP) │
│  revision_number        │
└────────────┬────────────┘
             │ 1:N
             ▼
┌──────────────────────────────────────────────────────────┐
│                   DESIGN_SET                             │  PK: design_set_id
│  (One complete design iteration for given inputs)        │
│  ──────────────────────────────────────────────────────  │
│  design_set_id   SERIAL PK                               │
│  project_id      FK → PROJECT                            │
│  set_label       VARCHAR (e.g., "Tropical Creek Rev.A") │
│  is_baseline     BOOL                                    │
│  superseded_by   FK → DESIGN_SET (nullable)              │
│  reviewed_by     VARCHAR                                 │
│  reviewed_at     TIMESTAMP                               │
│                                                          │
│  ──── INPUTS (Section 5 + missing) ────                  │
│  -- Hydrological Levels --                               │
│  hfl  NUMERIC(m)      │ ofl  NUMERIC(m) │ lbl NUMERIC(m)│
│  gl   NUMERIC(m)      │ rtl  NUMERIC(m) │ bottomDeck NUM│
│                                                          │
│  -- Step 1 Discharge Inputs --                           │
│  catchment_area NUMERIC(km²)                             │
│  runoff_coeff    NUMERIC                                 │
│  rainfall_intensity NUMERIC(mm/hr)                       │
│  surplus_weir_length NUMERIC(m)                          │
│  weir_head       NUMERIC(m)                              │
│  stream_area_hfl NUMERIC(m²)                             │
│  mean_vel_hfl    NUMERIC(m/s)                            │
│  q_design_override NUMERIC(m³/s, nullable)               │
│                                                          │
│  -- Step 2 Hydraulic Geometry --                        │
│  num_vents       INT    │  vent_width   NUMERIC(m)      │
│  vent_height     NUM(m) │  approach_vel NUMERIC(m/s)    │
│  lacey_silt_f    NUMERIC │  cd_vent      NUMERIC        │
│                                                          │
│  -- Step 3 Superstructure --                            │
│  deck_width      NUMERIC(m)                              │
│  carriage_width  NUMERIC(m)                              │
│  deck_span       NUMERIC(m)                              │
│  deck_thickness  NUMERIC(m)                              │
│  num_spans       INT                                     │
│  live_load_class  VARCHAR (Class A / Class AA / 70R)    │
│  water_density   NUMERIC(kg/m³)                          │
│  concrete_density NUMERIC(kg/m³)                         │
│  drag_coefficient NUMERIC                                │
│  silt_load_deck  NUMERIC(kN/m²)                          │
│                                                          │
│  -- Geotechnical / Materials --                         │
│  sbc_kN_m2       NUMERIC    ← (missing today)           │
│  backfill_phi_deg NUMERIC   ←                           │
│  backfill_beta_deg NUMERIC  ←                           │
│  wall_friction_delta NUMERIC←                           │
│  surcharge_h_m   NUMERIC    ←                           │
│  fck_vrcc_Mpa    NUMERIC    ←                           │
│  fck_pcc_Mpa     NUMERIC    ←                           │
│  fy_Mpa          NUMERIC    ←                           │
│  cover_mm        NUMERIC    ←                           │
│  γ_rc_kN_m3      NUMERIC    ←                           │
│  γ_pc_kN_m3      NUMERIC    ←                           │
│  γ_backfill_kN_m3 NUMERIC  ←                           │
│  γ_w_kN_m3       NUMERIC    ←                           │
│                                                          │
│  -- Abutment / Pier Geometry --                         │
│  pier_width_m    NUMERIC    ← (today hardcoded 0.4)     │
│  abut_top_width_m NUMERIC   ← (0.6 / 0.8 inconsistent) │
│  abut_bot_width_m NUMERIC   ←                           │
│  footing_ext_m   NUMERIC    ← (0.4 hardcoded)           │
│  approach_length_m NUMERIC  ← (3.0 hardcoded)           │
│                                                          │
│  -- Bearing --                                          │
│  bearing_type    VARCHAR    ← (entirely missing)        │
│  bearing_stiffness NUMERIC  ←                           │
└───────────────────────┬──────────────────────────────────┘
                        │ 1:1
                        ▼
┌──────────────────────────────────────────────────────────┐
│               COMPUTED_RESULTS                           │  PK: cr_id
│  (From calculation engine, immutable per design_set)    │
│  ──────────────────────────────────────────────────────  │
│  cr_id SERIAL PK │ design_set_id FK → DESIGN_SET UNIQUE │
│  calc_engine_version VARCHAR  (hash of calculations.tsx)│
│  calc_timestamp   TIMESTAMP                             │
│                                                          │
│  Step 1: q_rational, q_weir, q_velocity, q_design,      │
│          governing_method VARCHAR                        │
│                                                          │
│  Step 2: design_discharge, a_vent, effective_width,     │
│          a_rtl, a_hfl, pct_obs_rtl, pct_obs_hfl,        │
│          pass_rtl BOOL, pass_hfl BOOL,                  │
│          velocity_hfl, h_afflux, lacey_perimeter,       │
│          lacey_scour_depth, max_scour_depth, fbl,       │
│          recommended_depth, scour_safe BOOL             │
│                                                          │
│  Step 3: w_self, w_self_deck, w_self_dirtwall,          │  ← SUBDIVIDE
│          w_self_wearingcoat, w_self_abutment_total,     │
│          w_silt, w_live_total, w_live_per_span,         │
│          w_impact, w_braking_kN, w_wind_kN,             │  ← NEW LOADS
│          f_drag_per_span, f_uplift_per_span,            │
│          f_anchor_required_kN, f_drag_total,            │
│          p_active_earth_kN, p_passive_earth_kN,         │  ← NEW
│          sliding_fos, overturning_fos,                   │  ← STABILITY
│          bearing_pressure_max_kPa, bearing_ecc_m,       │  ← NEW
│          anchor_count_required, anchor_dia_mm,          │  ← NEW
│          reinforcement_ast_mm2_per_m,                   │  ← NEW
│          min_reinforcement_satisfied BOOL               │  ← NEW
└───────────────────────┬──────────────────────────────────┘
                        │ 1:N
                        ▼
┌──────────────────────────────────────────────────────────┐
│              REPORT_ARTIFACT                             │
│  Each generated PDF / DOCX stored + versioned           │
│  ─────────────────────────────────────────────────────  │
│  artifact_id  SERIAL PK                                  │
│  design_set_id FK → DESIGN_SET                           │
│  artifact_type VARCHAR ('7-SHEET-PDF'|'169-PAGE-PDF'    │
│                         |'WORD-REPORT'|'DRAWING-DWG')   │
│  file_path      VARCHAR                                  │
│  file_hash_sha256 CHAR(64)                               │
│  generated_at   TIMESTAMP                                │
│  generator_version VARCHAR                              │
│  qa_score_json  JSONB                                    │
└──────────────────────────────────────────────────────────┘

                        │ 1:N
                        ▼
┌──────────────────────────────────────────────────────────┐
│              VERIFICATION_CHECK                          │
│  V&V evidence per design set (Section 14 items)         │
│  ─────────────────────────────────────────────────────  │
│  check_id SERIAL PK │ design_set_id FK                   │
│  check_type VARCHAR ('MANUAL-VS-CODE' | 'REGRESSION'    │
│                       | 'CODE-CLAUSE' | 'UNIT')          │
│  check_ref  VARCHAR (e.g., "T04-IRC-SP82-Cl6.1")        │
│  status     VARCHAR ('PENDING'|'PASS'|'FAIL'|'BLOCKED') │
│  actual_value  NUMERIC │  expected_value NUMERIC        │
│  verified_by   VARCHAR  │  verified_at TIMESTAMP        │
│  evidence_path VARCHAR (reference sheet path)           │
│  discrepancy_note TEXT                                  │
└──────────────────────────────────────────────────────────┘
```

---

## 13. MISSING CODE-BASIS AND ENGINEERING-DECISION LIST

### 13.1 Engineering Decisions with NO Code Basis (Stop-Gate Items)

These items **must be resolved** before any production code modification. Each needs manual authoring + code reference:

| # | Decision / Basis | Evidence in PDF | Current Code State | Information Needed |
|---|---|---|---|---|
| E1 | **wLive = 554 kN (Class A) / 700 kN (Class AA)** — source derivation | PDF narrative "IRC 6:2000 Class A/AA" only; no axle table in code | calculations.tsx L198 HARDCODED | Axle group loads table, lane distribution, impact factor %, source clause |
| E2 | **Afflux formula selection — Molesworth vs IRC SP:82-2008 specified** | XLSX "afflux calculations" narrative | L183 "Molesworth's formula" label | Confirm IRC SP:82-2008 clause reference for afflux eq. |
| E3 | **Scour multiplier 1.27 — straight reach only? Bend conditions?** | XLSX "Maximum scour depth" row | L190 constant `1.27` | IRC SP:82 table of scour multipliers by bend angle |
| E4 | **Lacey silt factor f — calibrated for each soil class?** | XLSX heading row "Silt Factor f" | L189 input only, no class→f map | Soil-class (fine sand 0.6 / coarse 1.5) → f lookup |
| E5 | **Drag coefficient Cd=2.0 (IRC SP:82) — shape source** | "Cd=X (IRC SP:82)" in Step 3B table label | pdf-export.ts L663 comment only | IRC SP:82 Cd table per pier/abutment shape |
| E6 | **Liquefaction / seismic — zone factor, zone map of India** | Not in current code at all | NO seismic force calc | IRC 6:2000 Cl on seismic, site zone, importance factor |
| E7 | **Minimum foundation depth rule: FBL < GL − 0.5m vs IRC-specified minimum** | Internal check only | calculations.tsx L193 | IRC SP:82 minimum foundation depth clause |
| E8 | **Bearing type selection** (neoprene / POT / PTFE / rocker) | XLSX heading row "Type of bearings" | NO bearing type in code | Bearing design per IRC 83, bearing stiffness, displacement limits |
| E9 | **Anchor design — stainless steel grade, bar dia, spacing, embedment** | Narrative: "Stainless steel anchor bars" (Step 3) | fAnchor>0 → text flag only | IRC SP:82-2007 anchor clause, material grade (SS304/316), pullout calc |
| E10 | **Thrust block design — VRCC dimensions, steel** | Narrative: "VRCC thrust blocks" (Step 3) | NO thrust block module | IRC SP:82-2007 thrust block design procedure |
| E11 | **Permissible stress increase clauses (none applied)** | XLSX narrative "Cl.202.3 IRC 6:2000 no stress increase" | NO permissible stress module | Full IRC 6:2000 stress clauses table (M20/M25/M30, Fe415/Fe500) |
| E12 | **Deck slab thickness from IRC SP20 Plate 7.09** | XLSX narrative "Plate 7.09 of IRC:SP20-2002" | deckThickness input only (no validation) | Plate 7.09 thickness table per span / class / wearing coat |
| E13 | **Dirt wall from IRC SP20 Plate 7.25** | XLSX narrative "Plate 7.25" | No dirt wall in model at all | Plate 7.25 dirt wall dims, self-weight 55.50 kN calc source |
| E14 | **Active earth pressure Ka = 0.3 — Coulomb vs Rankine?** | XLSX numeric cell "Ka = 0.3" | No Ka calc at all | Which theory, values of φ, α, β, δ used in reference XLSX (Section 6 headings rows 55–59) |
| E15 | **Braking force 47.84 KN — derivation** | XLSX hardcoded token checked by T09 | No braking force in Step 3 loads | IRC 6:2000 braking clause, vehicle mass × deceleration, distribution |
| E16 | **Buoyancy reduction 145.80 KN — wetted volume** | XLSX token T10 | fUplift = deck buoyancy only (no abutment wetted portion) | Abutment wetted surface volume per HFL |
| E17 | **Carriageway minimum 6.0 m IRC SP:82-2008 Cl 6.4.2(vi)** | sample-document.ts T16 last line | No minimum width validation | Enforce as validation rule in Step 3 UI |
| E18 | **Concrete grade for VRCC vs PCC — fck values** | XLSX headings rows 66,67 | Only concreteDensity input, no fck | Specify M15/M20/M25 fck values for each concrete use |
| E19 | **Surcharge height h3 on backfill** | XLSX heading row 60 | No surcharge at all | Height + surcharge type (HA/HB vehicle), Coulomb Ka with surcharge |
| E20 | **Wind load on superstructure / substructure** | IRC 6:2000 load list item 4 | Not modeled | Wind zone, wind speed, gust factor per IRC 103 |

### 13.2 Code-Basis Gaps (Engineering Procedures NOT Coded)

See Section 9.5 for the ~40 missing calculation categories. The top-priority structural missing items:
1. Abutment stem: Bending moment + shear at base → reinforcement
2. Footing: Bearing pressure check (SBC, 6× eccentricity rule, no-tension zone)
3. Sliding stability FOS ≥ 1.5 (with passive earth + anchor contributions)
4. Overturning FOS ≥ 2.0
5. Deck slab reinforcement: M_u at mid-span + support, Ast min/max
6. Shear check + nominal shear reinforcement
7. Development length + anchorage length checks

---

## 14. VERIFICATION AND VALIDATION TEST PLAN

### 14.1 V&V Framework Levels

| Level | Name | Scope | Evidence | Pass Criterion |
|---|---|---|---|---|
| **V1** | Unit Calculation Tests | Each formula in Section 9.1–9.3 | Hand-calc spreadsheet 1-var perturbations | Exact match to 3 decimals |
| **V2** | Regression Tests (25 sets) | 25-set CSV → results → output checksum | SHA-256 of output | Unchanged golden-master OR bounded diff <0.01% |
| **V3** | Variable Extraction Accuracy | 31 Inputs + 6 missing vs PDF manual | Side-by-side PDF-extraction vs human table | 100% exact match (value + unit) for 37/37 variables |
| **V4** | Calculation Correctness | 29 ComputedResults vs hand calculations from PDF | Manually verified reference workbook | Exact match; zero tolerance on pass/fail |
| **V5** | Drawing Dimensional Check | CS A-A, LS B-B, Plan View vs PDF reference drawings | Dimension lines + CAD overlay | All labeled dimensions within 0.5% of reference |
| **V6** | Code-Clause Conformance | 20 code references (E1–E20) traced to clause text | Clause-text → formula → result traceability matrix | Every formula has a clause ID |
| **V7** | Report Completeness | All fields from Section 10 populated | Report field checklist | 100% fields present |
| **V8** | Word Output Conformance | .docx structure to proposed outline | Outline + heading level check | Exact match to Section 18 outline |
| **V9** | Load Combination Coverage | 12 load combinations per IRC 6:2000 Cl.202 | List applied vs required | ≥10/12 combinations evaluated with results |
| **V10** | Independent Design Review | Senior engineer sign-off of one complete set | Signed V&V report | Approved: PASS with 0 non-conformance or approved variance log |

### 14.2 V1 Unit Test Inventory (Minimum 58 Tests)

**Step 1 (12 tests):**
- Rational method: C=0.45, I=80mm/hr, A=12.5 km² → q=125.00 m³/s
- Weir: Lw=15m, Hw=0.6m → qWeir = 1.705×15×(0.6)^1.5
- Area-Velocity: A=45m², V=1.2 m/s → q=54.0 m³/s
- MAX of 3 with tie-break scenarios
- Custom override q_design vs computed qDesign
- Zero/empty input edge cases
- Negative/NaN input validation tests (7)

**Step 2 (22 tests):**
- aVent = N×b×hv with N=0..10
- %Obs_RTL = 65% → PASS boundary
- %Obs_RTL = 70% → FAIL boundary
- %Obs_HFL = 29% → PASS, 30% → FAIL
- Afflux = 0 when aHFL ≤ aVent (boundary)
- Afflux non-zero case with perturbation
- Lacey P=4.75·√Q with Q=0, Q=100
- Lacey R=0.473·(Q/f)^(1/3) with f=0.5,1.0,1.5
- D_max = 1.27·R boundary
- FBL = HFL − D_max (verify: below GL by >0.5m → scourSafe true/false)
- recommendedDepth sign correctness
- velocityHFL division-by-zero guard when aHFL=0

**Step 3 (24 tests):**
- wSelf with deck dims (units: kg/m³→kN correct conversion /1000)
- wSilt = 1.2 kN/m² × W × L span
- wLive = 554 (A) / 700 (AA) class enum switch
- totalVerticalLoad approx sanity check
- fDrag with V=0 → 0
- fDrag with Cd=2.0, V=3.0 m/s boundary
- fUplift buoyancy = ρgVol/1000 (same shape as wSelf but ρ_w vs ρ_c)
- fAnchor > 0 → "ANCHORS REQUIRED" flag boundary
- fAnchor = 0 → "SAFE" boundary
- fAnchor < 0 → "SAFE" boundary
- fDragTotal × N_spans
- Class 70R live load value (currently undefined)

### 14.3 V3 PDF Extraction Accuracy Test Procedure

1. **Print the original PDF**: [Type Design of submersible causeway.pdf](file:///e:/Rajkumar/Submersible_Bridge_Design/attached_assets/Type%20Design%20of%20submersible%20causeway.pdf)
2. **Manual table**: Human fills in values for all 47 variables (Inputs 36 + missing 6 + SBC + etc.) from each relevant page
3. **Automated extraction**: Run parser over same PDF (to be built — this is missing today)
4. **Side-by-side compare**: Each value exact match (numeric within tolerance per significant-figure rule), unit match, variable label match
5. **Score**: % exact match, list discrepancies, assign severity

### 14.4 V6 Code-Clause Traceability Matrix (Sample)

| Formula ID | Clause Reference | Formula Text Location | Implementation Line | Test Case |
|---|---|---|---|---|
| 1.1 Rational | CWC (no IRC clause cited) | pdf-export.ts Sheet 2 footer | calculations.tsx L153 | V1-S1-01 |
| 1.2 Broad Weir | Broad-crested weir general | pdf-export.ts Sheet 2 footer | calculations.tsx L154 | V1-S1-02 |
| 2.8-2.9 Thresholds | IRC SP:82-2008 (general) | pdf-export.ts Sheet 3 2A table | calculations.tsx L177-L178 | V1-S2-07..10 |
| 2.11 Afflux | Molesworth formula (named only) | pdf-export.ts Sheet 3 2B table | calculations.tsx L183 | V1-S2-11 |
| 2.12-2.14 Lacey | IRC SP:82-2008 Cl.6 | pdf-export.ts Sheet 3 2B footer | calculations.tsx L187-L190 | V1-S2-12..15 |
| 3.3 wLive Class A/AA | IRC 6:2000 (no clause number) | pdf-export.ts Sheet 4 3A | calculations.tsx L198 | V1-S3-03 |
| 3.5 Drag | IRC SP:82 (general) | pdf-export.ts Sheet 4 3B Cd note | calculations.tsx L201 | V1-S3-07 |

### 14.5 V10 Independent Review Deliverables

- [ ] One golden reference design set fully hand-calculated and signed by PE
- [ ] Code-to-clause traceability matrix (Section 14.4 expanded to all 50+ formulas)
- [ ] Drawing dimensional sign-off by checker (separate from designer)
- [ ] Test report: V1–V9 results with pass/fail
- [ ] Non-conformance log + variance approvals (if any)
- [ ] PE sign-off page

---

## 15. RISK REGISTER

### 15.1 Risk Table (Probability × Impact, both 1–5)

| ID | Risk | P | I | Score | Mitigation Strategy |
|---|---|---|---|---|---|
| R1 | **Hardcoded wLive 554/700 kN not from verified IRC clause** → wrong live loads propagate to every structural result | 5 | 5 | **25** | Clause trace (E1) + independent live load calc before code changes; write V1 tests with PE-verified values |
| R2 | **cdVent data error = 4.1 in 7/25 test sets** (CSV misalignment — impossible Cd value) → hydraulic results for 7 sets are nonsense | 4 | 5 | **20** | Audit test-variables-25-sets.csv; fix 7 values; regenerate golden output PDFs; lock CSV import schema with validation |
| R3 | **Afflux formula identity not verified (Molesworth vs IRC SP:82)** → wrong upstream water level, wrong design freeboard | 3 | 5 | **15** | E2 clause-lookup; cross-check with 2–3 published examples; V4 hand calc |
| R4 | **Scour multiplier 1.27 straight-reach only** — bridge on bend → under-designed foundation, structural failure in flood | 3 | 5 | **15** | E3 lookup IRC SP:82 bend multipliers table; add bend_angle input; fail-safe default to highest multiplier |
| R5 | **ABUT_W inconsistent (0.6 vs 0.8 m) between CS and LS drawings** → drawing set rejected at plan check | 5 | 3 | **15** | Single source of truth for all geometric hardcodes in schema; V5 drawing dim test |
| R6 | **Missing 90% of structural calcs (abutment, stability, reinforcement)** → report stamped by PE would fail statutory submission | 5 | 4 | **20** | Phased implementation per Section 16 (Redesign); stop issuing "design reports" until structural module complete |
| R7 | **"100% QA Score" presented as engineering quality** → user misled; liability | 5 | 4 | **20** | Rename QA rubric to "Report Structural Completeness Score"; add disclaimer block on every report cover page |
| R8 | **No PDF extraction pipeline** — system requires Excel, not PDF; user workflow fails if only PDF available | 4 | 3 | **12** | Build PDF parser (planned in Redesign option B); validate with V3 against manual |
| R9 | **No Word output** — submission authorities require .docx (statutory template format) → fail at submission gate | 5 | 3 | **15** | Add docx pipeline; map report outline Section 18; V8 Word conformance |
| R10 | **No DB schema / audit trail** — designs cannot be versioned, retrieved, or independently reproduced | 3 | 4 | **12** | Implement proposed schema Section 12; hash every result; require version stamp on every PDF |
| R11 | **Silt factor f calibration gap** → wrong scour depth → over/under-designed foundations | 3 | 4 | **12** | E4 soil-class→f lookup; require soil-boring number in project metadata |
| R12 | **Earth pressures entirely absent** → abutment sliding/overturning failure mode not checked | 5 | 5 | **25** | Implement Coulomb Ka/Kp with all 4 angles (φ α β δ); stability FOS V1 unit tests; this is a blocking issue for structural reports |
| R13 | **Braking / seismic / wind / tractive loads missing** → load combinations incomplete | 4 | 4 | **16** | Full IRC 6:2000 Cl.202 load combination table in calculations.tsx; E6/E20 inputs and formulas |
| R14 | **No minimum reinforcement / development length rules** → detailing errors, brittle failure | 4 | 4 | **16** | IS 456 detailing rules module; Ast_min, Ast_max, Ld calc for each bar dia + grade |
| R15 | **Scour profile in LS drawing is cosmetic (not D_max shape)** → drawing review fails; hydraulic engineer misinterprets | 3 | 3 | **9** | Draw actual Lacey + D_max profile (not arbitrary dip); V5 drawing dim test includes scour depth label check |
| R16 | **fck_PCC/fck_VRCC/fy absent from model** → reinforcement results (when added) will use wrong grade | 4 | 3 | **12** | Add 5 material inputs per schema Section 12; validation range (e.g., fy ∈ {250,415,500}) |
| R17 | **No bearing type/model** → expansion/contraction, load transfer unknown | 2 | 4 | **8** | E8 input bearing type; add bearing load-displacement in future phase |
| R18 | **Test-runs/archive folder duplication** → stale PDFs referenced accidentally | 3 | 2 | **6** | Delete _archive after PE confirmation active code is correct; or mark _archive as "LEGACY - DO NOT USE" watermark |
| R19 | **Deck uplift anchor design not computed** (only fAnchor sign flag) → wrong anchor count / size / embedment → deck lifts in flood | 4 | 5 | **20** | E9 anchor design module; stainless steel properties; pullout + shear capacity; add to compliance table |
| R20 | **Class 70R live load not supported in Inputs enum** → sets 18/24 fail import or silently coerced | 3 | 3 | **9** | Extend enum; determine Class 70R wLive (E1) + add V1 unit test |

### 15.2 Top 5 Blocking Risks (≥20 Score)

**Must be resolved before any code modification proceeds** (per user instruction "Do not invent...stop at review stage"):

1. **R1 + R12** (P5×I5=25 each): Hardcoded unverified wLive, entirely missing earth pressure/stability. These prevent structural correctness claims.
2. **R2** (P4×I5=20): cdVent=4.1 data error silently corrupts 28% of test sets.
3. **R6** (P5×I4=20): 90% missing structural means "design report" is an input-summary+rough estimate, not a design.
4. **R7** (P5×I4=20): "100% QA" branding misleads user on engineering quality.
5. **R19** (P4×I5=20): Anchor sizing absent.

---

## 16. RECOMMENDED REPAIR / REFACTOR / REDESIGN DECISION

### Decision Matrix

| Option | Scope | Effort | Solves Top-5 Risks | Maintains Backwards Compat | Time Est |
|---|---|---|---|---|---|
| **A — REPAIR** | Fix only bugs (R2 cdVent values, ABUT_W inconsistency, R7 disclaimer) | 3–5 days | R2, R5, R7 only (3 of 5) | ✅ Full | <1 week |
| **B — REFACTOR** | Repair + add Word output + PDF extraction + single-source geometry variables + V1 tests for existing formulas + DB schema scaffold | 3–4 weeks | R2, R5, R7, R8, R9, R10, R15, R18, R20 (9 of 20) | ⚠️ Breaks Inputs enum (adds 70R, 5 material props) | 1 month |
| **C — REDESIGN (RECOMMENDED)** | Repair + Refactor + full structural module (abutment, piers, earth pressures, load combinations, reinforcement, anchors/thrust blocks, bearing) + full V&V V1–V10 | 10–14 weeks | All R1–R20 | ❌ Breaks Inputs type materially; report outline changes | 3 months |

### RECOMMENDED DECISION: **OPTION C — REDESIGN**

#### Rationale:

1. **User Explicitly Stated:** "Do not claim accuracy until the extracted variables, calculations, sketches, Word output, and PDF output have been compared against manually verified reference information."
   - Options A/B cannot meet this — they don't resolve structural correctness (R1,R6,R12,R13,R19).

2. **Blocking Risks ≥ 20 (R1, R2, R6, R7, R12, R19):**
   - Cannot issue "design reports" that omit earth pressures / stability / reinforcement (professional negligence risk).
   - 100% QA score must be renamed or prominently flagged as "structural completeness, not engineering accuracy".

3. **Missing Code-Basis Items (20 in Section 13)**: Every one of them needs manual resolution (clause lookup, PE confirmation). This naturally requires a full rework pass, not surgical patches.

4. **Report Outline Expansion (Section 18)**: 10–12 new sections don't fit in current 7-sheet skeleton without tearing it up anyway.

5. **Data Integrity (R2 + M6)**: cdVent=4.1 error in 28% of test sets suggests the 25-set CSV was hand-entered without schema validation — a REDESIGN should include a typed import validator.

#### Phase Gating (per user phased-workflow preference):

| Phase | Name | Deliverable | Approve Gate |
|---|---|---|---|
| C.0 | **GAP RESOLUTION** (this document Sections 13+15 items) | User provides / PE confirms all 20 E1–E20 decisions + clause references | ✅ User PE sign-off before coding |
| C.1 | **REPAIR** (data bugs + immediate safety) | Fix cdVent; rename QA score; standardize ABUT_W; add 70R + SBC + OFL + LBL to Inputs | Code review + tests pass |
| C.2 | **FOUNDATION** (schema, V&V harness, PDF parser, Word output) | Proposed schema implemented; V1–V3 test infrastructure; PDF→data parser; Word generator (proposed outline) | V1–V3 baseline passing |
| C.3 | **STRUCTURAL MODULE** (abutment + stability + loads + reinforcement + anchors) | All 40+ Section 9.5 items implemented (earth pressures, sliding/overturning FOS, bearing pressure, deck Ast, anchor design, thrust blocks) | V4 hand-calc match for 2+ design sets |
| C.4 | **DRAWING INTEGRITY** (single-source geometry, proper scour profile) | All 7 drawing hardcodes from schema; V5 dimensional checks | V5 drawing tests pass vs golden PDF |
| C.5 | **V&V + INDEPENDENT REVIEW** | V1–V10 execution; PE sign-off; non-conformance log closed or approved | V10 PE approval — Phase complete |

#### DO NOT PROCEED TO C.1 IF:
- The 20 E1–E20 decisions (Section 13.1) are not confirmed with clause references
- The manually verified reference workbook for one complete set is not provided
- Confirmation is received that structural reports will **NOT** be used for construction until C.5

---

## 17. ONE SAMPLE EXTRACTED-INPUT REPORT (BRIDGE-01: TROPICAL CREEK)

**SOURCE DATA**: [input.json](file:///e:/Rajkumar/Submersible_Bridge_Design/test-runs/test-run-2026-07-28T16-28-18/set-01-Bridge_01__Tropical_Creek/input.json)

**⚠️ DISCLAIMER**: THE VALUES BELOW HAVE NOT BEEN COMPARED AGAINST MANUALLY VERIFIED REFERENCE INFORMATION. DO NOT USE FOR CONSTRUCTION. DO NOT CLAIM ACCURACY.

### EXTRACTED INPUT — BRIDGE-01: TROPICAL CREEK

**Run ID:** test-run-2026-07-28T16-28-18 / Set 01
**Report Date:** 2026-07-28
**Location:** Test Location

---

#### A. METADATA (4 of 4 recognized ✓)
| Field | Extracted Value | Unit | Recognized in Code? |
|---|---|---|---|
| Project Name | Bridge-01: Tropical Creek | — | ✅ projectName |
| Stream Name | Bridge-01: Tropical Creek | — | ✅ streamName |
| Location | Test Location | — | ✅ location |
| Date | 2026-07-28 | YYYY-MM-DD | ✅ date |
| SetID (internal) | 1 | — | ❌ Not in Inputs (test harness only) |

#### B. HYDROLOGICAL LEVELS (4 of 6 — 2 MISSING from Inputs)
| Field | Extracted Value | Unit | Recognized? | Notes |
|---|---|---|---|---|
| Highest Flood Level (HFL) | 5.800 | m | ✅ hfl | — |
| Ordinary Flood Level (OFL) | 5.100 | m | ❌ **MISSING** | Section 6/N2 |
| Low Bed Level (LBL) | 4.200 | m | ❌ **MISSING** | Section 6/N3 |
| Ground / Bed Level (GL) | 4.200 | m | ✅ gl | Collapsed with LBL — **MISMATCH** lbl=4.2=gl, but these should differ in general |
| Road Top Level (RTL) | 5.850 | m | ✅ rtl | RTL > HFL (5.850>5.800) — verify |
| Bottom of Deck | 5.500 | m | ❌ **MISSING** | Section 6/N4 |

**LEVEL GAP CHECK:** RTL (5.85) should be BELOW HFL (5.80) per IRC SP:82 philosophy. **For Bridge-01: RTL=5.85 > HFL=5.80 → INPUT ERROR or datum shift.** If HFL datum is higher, obstruction checks may reverse. This needs V3 verification.

#### C. STEP 1 — DISCHARGE INPUTS (7 of 7 ✓)
| Field | Extracted Value | Unit | Alias Used |
|---|---|---|---|
| Catchment Area | 0.8 | km² | — |
| Runoff Coefficient C | 0.55 | — | runoff_coefficient |
| Rainfall Intensity I | 120 | mm/hr | rainfall |
| Surplus Weir Length Lw | 8.0 | m | weir_length |
| Head over Weir Hw | 0.30 | m | weir_head |
| Stream Area at HFL | 8.5 | m² | stream_area |
| Mean Velocity at HFL | 1.1 | m/s | stream_velocity |

#### D. STEP 2 — HYDRAULIC (10 of 10 ✓  + 2 data-quality flags)
| Field | Extracted Value | Unit | Issue |
|---|---|---|---|
| Design Discharge Override | null (auto) | m³/s | — |
| Number of Vents N | 3 | nos | — |
| Vent Width b | 2.0 | m | — |
| Vent Height hv | 1.5 | m | — |
| Approach Velocity V_app | 1.0 | m/s | — |
| Lacey Silt Factor f | 0.8 | — | — |
| Vent Discharge Coefficient Cd | **0.9** | — | ✅ Set-01 OK. (Sets 2,3,8,11,14,19,21 = 4.1 → **DATA ERROR M6**) |
| Bottom Deck | 5.500 | m | ❌ Missing from Inputs |
| Carriage Width | 7.5 | m | ❌ Missing — deckWidth=7.5 assumed equal carriageW |
| Deck Width (code) | 7.5 | m | ✅ (M1 possible synonym mismatch with carriageW) |

#### E. STEP 3 — STRUCTURAL + GEOTECHNICAL (8 of 10 in Inputs + 2 MISSING)
| Field | Extracted Value | Unit | Issue |
|---|---|---|---|
| Deck Width | 7.5 | m | ✅ |
| Deck Span | 5.0 | m | ✅ |
| Deck Thickness | 0.35 | m | ✅ |
| Number of Spans | 3 | nos | ✅ |
| Live Load Type | IRC Class A | enum | ✅ Set-01 OK. (Sets 18,24 = Class 70R → **M3 not in enum**) |
| Water Density ρ_w | 1000 | kg/m³ | ✅ |
| Concrete Density ρ_c | 2500 | kg/m³ | ✅ |
| Drag Coefficient Cd | 2.0 | — | ✅ |
| Silt Load on Deck | 1.5 | kN/m² | ✅ |
| Safe Bearing Capacity SBC | **10.0** | t/m²? kN/m²? | ❌ **MISSING from Inputs (N5)** — UNIT UNCLEAR (10 t/m² ≈ 98 kN/m²) |
| Depth LBL datum d_LBL | **2.0** | m | ❌ **MISSING (N6)** — meaning undocumented |

#### F. VARIABLES IN 25-SET CSV / MISSING FROM INPUTS — BRIDGE-01
(From Section 6, confirmed present)
- `ofl` = 5.100 m (Ordinary Flood Level)
- `lbl` = 4.200 m (Low Bed Level)
- `bottomDeck` = 5.500 m
- `carriageW` = 7.5 m
- `SBC` = 10.0 (unit unknown)
- `d_LBL` = 2.0 m

---

## 18. ONE PROPOSED WORD/PDF REPORT OUTLINE

### 18.1 Report Title Page (1)
1.1 Title block — Vented Submersible Causeway Design Report
1.2 Project / Stream / Location / Date (metadata)
1.3 **REVISION BLOCK** (Revision, Date, By, Checked, Approved)
1.4 Design Codes (with exact clause editions):
  - IRC SP:82-2008 + Amendment No. X
  - IRC 6:2000 + reprint YYYY
  - IRC SP:20-2002 Rural Roads Manual
  - IRC 83 (Bearings)
  - IS 456:2000 Plain & Reinforced Concrete
  - IS 1893 (Seismic) — if applicable
  - IRC 103 (Wind) — if applicable
1.5 DISCLAIMER BLOCK (mandatory):
  > This report generated by automated tool. Values were compared against manually verified reference workbook dated [YYYY-MM-DD] by PE [Name, Regn No.]. Independent review completed [date]. For construction use subject to site-specific soil investigation and statutory approvals.
1.6 Contents list with page numbers

### 18.2 Section 1 — Design Philosophy (1 pp.)
(From Step 0 narrative in PDF/XLSX)
1.1 Scope and objectives
1.2 Applicable codes with edition year + clause matrix reference
1.3 Design flood return period / risk level
1.4 Submergence philosophy (RTL below HFL, 70% / 30% obstruction targets)
1.5 Limitations and exclusions

### 18.3 Section 2 — Site and Hydrological Data (3–5 pp.)
2.1 Location map + coordinates + north arrow
2.2 Site photographs (if available)
2.3 Hydrological levels table (HFL, OFL, LBL, GL, RTL) — **VALUES + DATUM REFERENCE**
2.4 Catchment map and description
2.5 Rainfall data source (years of record)
2.6 Stream cross-section data with survey reference
2.7 Soil investigation summary: SBC, soil type, φ, γ_backfill (bore-log numbers, dates)

### 18.4 Section 3 — Design Discharge (Step 1) (2 pp.)
3.1 Rational Method — input data + calc + result
3.2 Broad-Crested Weir Formula — input data + calc + result
3.3 Area-Velocity Method — input data + calc + result
3.4 Envelope / Governing Method rationale
3.5 Design Discharge Q = xx m³/s — highlighted box
3.6 Comparison with previous studies / Gumbel / frequency analysis (if available)

### 18.5 Section 4 — Hydraulic Design (Step 2) (4–6 pp.)
4.1 Ventway geometry selection (N, b, hv) + rationale
4.2 Obstruction check @ RTL — calc + pass/fail + IRC SP:82 threshold
4.3 Obstruction check @ HFL — calc + pass/fail + IRC SP:82 threshold
4.4 Velocity at HFL
4.5 Afflux calculation (formula + clause reference) + upstream water level
4.6 Lacey Scour:
  - Regime perimeter P
  - Silt factor f with soil class calibration
  - Normal scour depth R
  - Maximum scour depth D_max (with bend / straight multiplier table)
  - FBL determination
4.7 Recommended foundation depth + minimum depth rule + **scour depth drawing overlay**

### 18.6 Section 5 — Structural Geometry & Materials (2–3 pp.)
5.1 Superstructure: deck span, deck width (carriage + shoulder), deck thickness, wearing coat, source Plate 7.09 IRC SP:20
5.2 Substructure: abutment dimensions (top/bottom width, batter), pier width, footing sizes (1st, 2nd, 3rd, VRCC strip), offsets
5.3 Dirt wall: Plate 7.25 IRC SP:20 dimensions
5.4 Materials: fck_VRCC, fck_PCC, fy steel grade, cover to reinforcement, concrete unit weights
5.5 Bearing type + specification (if bearings included)
5.6 Anchor specification: stainless steel grade, corrosion allowances

### 18.7 Section 6 — Structural Loads & Combinations (3–4 pp.)
6.1 Dead loads (tabular — deck slab, wearing coat, dirt wall, abutment stem, each footing level, parapets)
6.2 Live loads (IRC Class A/AA/70R axle table, lane factors, impact factor %)
6.3 Surcharge loads on backfill
6.4 Wind loads (per IRC 103)
6.5 Seismic loads (zone factor Z, importance factor I, response reduction R — per IS 1893 / IRC 6)
6.6 Hydraulic loads:
  - Hydrostatic pressure (afflux head)
  - Drag force (Cd + projected area)
  - Uplift / buoyancy
  - Velocity head pressure
  - Eddy pressure
  - Silt 150mm × 15 kN/m³ on deck soffit (IRC SP:82 Cl.7.11.3.4)
6.7 Tractive / braking effort
6.8 **Load combination matrix** per IRC 6:2000 Cl.202:
  - (1) DL+LL
  - (2) DL+LL+WC (wind/water current)
  - (3) DL+LL+EQ
  - (4) DL+hydrostatic+uplift+silt
  - etc. (10–12 combinations)
6.9 Permissible stress increase clause table per IRC 6:2000

### 18.8 Section 7 — Abutment & Pier Design (6–10 pp.)
7.1 Earth pressures:
  - Backfill properties (φ, α, β, δ, γ)
  - Active Ka (Coulomb) with surcharge — calculation sheet
  - Passive Kp (with and without wall friction)
  - Pressure diagram
7.2 Eccentricity of resultant — at each footing level (tabular like XLSX rows 95–700)
7.3 Bearing pressure check:
  - p_max, p_min calculation
  - 6×e/B rule (no tension zone)
  - p_max ≤ SBC check (with appropriate FOS)
7.4 Stability analysis:
  - **Sliding FOS** = Σresist/Σsliding ≥ 1.5; show passive + anchor + base friction contributions
  - **Overturning FOS** = ΣM_stab/ΣM_OT ≥ 2.0
7.5 Abutment stem design:
  - M_u at base + critical section
  - V_u at base
  - Ast_provided ≥ Ast_required
  - Min reinforcement check (IS 456)
  - Nominal shear / distribution steel
7.6 Pier column / pier cap design (if piers)
7.7 Footing design (bending + shear at critical sections)
7.8 Development length + anchorage checks

### 18.9 Section 8 — Deck Slab Design (2–4 pp.)
8.1 Slab configuration, span/width/thickness
8.2 Loads per m width (DL + LL strip distribution)
8.3 Mid-span moment M_u, support moment M_u
8.4 Main reinforcement Ast (top + bottom) + distribution steel
8.5 Shear check (τ_c vs τ_v)
8.6 Deflection check (L/d ratios)
8.7 Crack width check (if required)
8.8 Detailing sketch — bar marks, cut-offs, spacings

### 18.10 Section 10 — Anchors & Thrust Blocks (2 pp.)
10.1 Uplift force per span — anchor resistance requirement
10.2 Anchor material (SS304/316), capacity per bar
10.3 Number of anchors per span, spacing, embedment length (pullout test criterion)
10.4 Thrust block design (VRCC):
  - Design thrust force
  - Passive earth resistance mobilized
  - Block dimensions, VRCC steel
10.5 Anchor schedule

### 18.11 Section 11 — Compliance & Code-Certificate Summary (2 pp.)
11.1 PASS/FAIL checklist (IRC clause × result):
  - [ ] Obstruction @ RTL <70% (IRC SP:82-2008)
  - [ ] Obstruction @ HFL <30%
  - [ ] Min carriageway width ≥6.0m (IRC SP:82-2008 Cl 6.4.2 vi)
  - [ ] Foundation below max scour + 0.5m rule
  - [ ] Bearing p_max ≤ SBC
  - [ ] No tension zone (6e/B rule)
  - [ ] Sliding FOS ≥ 1.5
  - [ ] Overturning FOS ≥ 2.0
  - [ ] Deck uplift (anchors adequate or self-weight sufficient)
  - [ ] Reinforcement: Ast_min satisfied, Ast_max not exceeded
  - [ ] Shear: nominal or designed links
  - [ ] Development length satisfied
  - [ ] Deflection L/d within limits
11.2 Non-conformance / variance register (if any) — with PE approval number/date
11.3 Overall VERDICT: Suitable for construction subject to items above

### 18.12 Section 12 — Engineering Drawings (3–7 sheets)
Sheet 5/12 — Cross Section A-A (Transverse)
  - Dimensions labeled, all levels (HFL/GL/FBL/RTL)
  - Vents, abutments, piers, footings, reinforcement cage outline
  - Scour depth with proper D_max profile
  - Title block with DRG NO, SCALE (computed, not "schematic"), SHEET x/y

Sheet 6/12 — Longitudinal Section B-B
  - Abutments, piers, spans, approach lengths, expansion joints
  - Levels, scour profile (actual shape not cosmetic dip), cut line A-A
  - Flow direction arrow

Sheet 7/12 — Plan View
  - Vent layout, true site north, bank lines
  - Approach roads, expansion joint locations, drainage

Sheet 8/12 — Abutment Reinforcement Details
  - Stem steel, footing steel, bent bars, Ld annotations
  - Bar schedule table with bar mark, dia, shape, length, qty, weight

Sheet 9/12 — Deck Slab Reinforcement
  - Plan + section, main/distribution/cranked bars
  - Bar schedule

Sheet 10/12 — Pier + Pier Cap Details (if N_spans > 1)
Sheet 11/12 — Anchor + Thrust Block Details

### 18.13 Appendices (A–S, ~15 pp.)
A — Raw hydrological data (daily rainfall sheets, Gumbel plots)
B — Soil investigation report (bore logs, SPT N-values, lab test results)
C — IRC code clause extracts (the exact clauses cited, with page numbers from code)
D — Detailed calculation spreadsheets (one tab per section, unprotected with formulas visible)
E — Hand calculation verification sheets (signed)
F — Load combination sub-tables for each of 10–12 combinations
G — Bearing calculation + manufacturer data sheet
H — Stainless steel anchor data + pull-out test procedure
I — Materials test certificate requirements (cube tests, rebar mill certs)
J — Independent Reviewer / Checker report (V&V V1–V10 results, non-conformance log)
K — Variances from code with PE approval records
L — Bill of Quantities (BOQ)
M — Construction methodology / sequence (phased cofferdam, dewatering, scour protection)
N — Quality Control Plan (inspection hold points, tests, records)
O — Health & Safety Plan
P — Maintenance manual (inspection intervals, scour monitoring points)
Q — As-built drawing template
R — **V&V Test Results** (Section 14 V1–V10)
S — PE Sign-off Page (Designer / Checker / Approver — names, registration numbers, signatures, dates)

---

### Word-vs-PDF Format Decision for the Proposed Outline

| Feature | Word (.docx) | PDF | Deliver in Phase |
|---|---|---|---|
| Sections 1–11 narrative + tables | ✅ Primary (editable for PE redlines) | PDF frozen from Word | C.2 (Word output) |
| Sections 12 Engineering Drawings | Embedded as OLE/CAD links | Vector-rendered directly | C.4 + C.5 |
| Appendices D–F (calculations) | Linked spreadsheets | Static print | C.3 |
| Appendix J (V&V) + S (sign-off) | Word signatures required | PDF has digital signature | C.5 |
| Statutory submission format | Word template matching state PWD format | Print-to-PDF final submission | C.2 + C.5 |

---

**END OF REVIEW DOCUMENT — 18 SECTIONS COMPLETE.**

**WAITING FOR USER CONFIRMATION BEFORE C.1 CODE MODIFICATION (per Section 16 phase gate C.0).**
