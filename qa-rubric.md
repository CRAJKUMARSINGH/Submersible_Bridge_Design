# Phase 4: QA Rubric — Scoring Matrix for 15 Test Outputs

## Scoring Dimensions (100 pts total)

| # | Dimension | Weight | Criteria | Points |
|---|-----------|--------|----------|--------|
| 1 | Cover Page | 15 | Project name, design philosophy, applicable codes, design discharge, vent config, foundation level, SBC all present | /15 |
| 2 | Narrative Prose | 20 | Each calculation step introduced in words; rationale explained; assumptions stated inline; `para()` paragraphs present between sections | /20 |
| 3 | Formula Blocks (`fml`) | 15 | Every formula shows: (a) symbolic equation, (b) substituted values, (c) computed result with unit, (d) code reference footnote | /15 |
| 4 | Tables with Context | 10 | AutoTable with grid theme; headers in dark navy/gold; body has alternating row shading; every table has a "Remarks" or interpretive column | /10 |
| 5 | PASS/FAIL Checks (`chk`) | 10 | All design checks (ventilation %, obstruction %, scour depth, uplift) have chk() with computed value, limit, and green/red badge | /10 |
| 6 | Interpretive Notes (`note`) | 10 | Key results have note() explaining significance (e.g., "Orifice formula governs because h < 1.4×Dd") | /10 |
| 7 | Code References | 10 | Every formula/table/check cites applicable IRC clause or standard (IRC SP:82, IRC SP:13, IRC:5-1985, Lacey, etc.) | /10 |
| 8 | A4 Portrait Orientation | 5 | Document is A4 portrait, not landscape | /5 |
| 9 | Section Completeness | 5 | All 14 sections present in order | /5 |
| 10 | Anti-Pattern Clean | 5 | No raw data dumps; no tables without remarks; no missing code refs; no landscape; no missing PASS/FAIL | /5 |
| | **TOTAL** | | | **/100** |

## Pass/Fail Thresholds

| Score | Verdict |
|-------|---------|
| 90–100 | **PASS** — fully compliant, narrative storytelling present, all checks pass |
| 75–89 | **CONDITIONAL** — minor narrative gaps, fixable in correction phase |
| 60–74 | **FAIL** — significant storytelling gaps, requires correction |
| < 60 | **FAIL** — major format or content issues |

## Per-Set Scoring Template

| Set # | Project Name | Cover | Narrative | Formulas | Tables | Checks | Notes | Codes | Portrait | Sections | Clean | **Total** | **Verdict** |
|-------|-------------|-------|-----------|----------|--------|--------|-------|-------|----------|----------|-------|-----------|-------------|
| 01 | Tropical Creek | /15 | /20 | /15 | /10 | /10 | /10 | /10 | /5 | /5 | /5 | /100 | PASS/FAIL |
| 02 | Temperate River | /15 | /20 | /15 | /10 | /10 | /10 | /10 | /5 | /5 | /5 | /100 | PASS/FAIL |
| 03 | Flat Floodplain | /15 | /20 | /15 | /10 | /10 | /10 | /10 | /5 | /5 | /5 | /100 | PASS/FAIL |
| 04 | Rocky Stream | /15 | /20 | /15 | /10 | /10 | /10 | /10 | /5 | /5 | /5 | /100 | PASS/FAIL |
| 05 | Soft Soil | /15 | /20 | /15 | /10 | /10 | /10 | /10 | /5 | /5 | /5 | /100 | PASS/FAIL |
| 06 | Constrained Vent | /15 | /20 | /15 | /10 | /10 | /10 | /10 | /5 | /5 | /5 | /100 | PASS/FAIL |
| 07 | Wide Vent | /15 | /20 | /15 | /10 | /10 | /10 | /10 | /5 | /5 | /5 | /100 | PASS/FAIL |
| 08 | High Velocity | /15 | /20 | /15 | /10 | /10 | /10 | /10 | /5 | /5 | /5 | /100 | PASS/FAIL |
| 09 | Highway Grade | /15 | /20 | /15 | /10 | /10 | /10 | /10 | /5 | /5 | /5 | /100 | PASS/FAIL |
| 10 | Concrete Channel | /15 | /20 | /15 | /10 | /10 | /10 | /10 | /5 | /5 | /5 | /100 | PASS/FAIL |
| 11 | Vegetated Floodplain | /15 | /20 | /15 | /10 | /10 | /10 | /10 | /5 | /5 | /5 | /100 | PASS/FAIL |
| 12 | Coastal Crossing | /15 | /20 | /15 | /10 | /10 | /10 | /10 | /5 | /5 | /5 | /100 | PASS/FAIL |
| 13 | Mountain Stream | /15 | /20 | /15 | /10 | /10 | /10 | /10 | /5 | /5 | /5 | /100 | PASS/FAIL |
| 14 | Commercial Highway | /15 | /20 | /15 | /10 | /10 | /10 | /10 | /5 | /5 | /5 | /100 | PASS/FAIL |
| 15 | High Flood Critical | /15 | /20 | /15 | /10 | /10 | /10 | /10 | /5 | /5 | /5 | /100 | PASS/FAIL |

## Aggregate Metrics
- **Pass rate**: N/15 sets scoring ≥ 75
- **Mean score**: Σ(scores) / 15
- **Min score**: Lowest individual set score
- **Max score**: Highest individual set score
- **Std deviation**: Score distribution tightness