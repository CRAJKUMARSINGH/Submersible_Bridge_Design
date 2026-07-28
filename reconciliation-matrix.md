# Phase 1: Audit & Reconciliation Matrix

Generated from diff of `CODE-JUNCTION/` folders against root `Submersible_Bridge_Design/`.

## Folders Audited

| Folder | Engineer | Status |
|--------|----------|--------|
| `CODE-JUNCTION/Bridge-Design/` | Engineer A | Near-identical to root |
| `CODE-JUNCTION/Submersible_Bridge_Design_statutory_preview/` | Engineer B | Near-identical to root |
| `CODE-JUNCTION/Submersible-Bridge-Report/` | Engineer C | Significant divergences |

## File-Level Diff Summary

### 1. `artifacts/causeway-design/src/lib/pdf-export.ts`

| Folder | Diff from Root |
|--------|---------------|
| Root | Baseline — long-form narrative PDF, portrait A4, manual positioning with `fml()`, `tbl()`, `para()`, `chk()`, `note()` |
| Bridge-Design | Cosmetic only: `setFillColor(210)` → `setFillColor(210,210,210)` and `setFillColor(215)` → `setFillColor(215,215,215)`. No functional change. |
| statutory_preview | Identical to root. No changes. |
| Submersible-Bridge-Report | Divergent rewrite: landscape A3, autoTable-heavy, narrative interpretation paragraphs, color-coded PASS/FAIL cells, no `fml()`/`para()`/`note()` manual positioning |

### 2. `artifacts/causeway-design/src/lib/calculations.tsx`

| Folder | Diff from Root |
|--------|---------------|
| Root | Standalone module; exports `defaultInputs`, `mergeInputs`, `resetInputs`, `CalculationsContextType`; no React dependency |
| Bridge-Design | Identical to root |
| statutory_preview | **Missing** `mergeInputs`, `resetInputs`, `defaultInputs`, and `CalculationsContextType` with those methods. Context type reduced to only `updateInput` and `results`. |
| Submersible-Bridge-Report | Full rewrite: React hooks (`useState`, `useMemo`, `createContext`), typed `Inputs`/`ComputedResults` interfaces, `CalculationsProvider` component, `useCalculations` hook |

### 3. `scripts/src/generate-sample-pdf.ts`

| Folder | Diff from Root |
|--------|---------------|
| Root | Identical to pdf-export.ts — long-form narrative generator |
| Bridge-Design | Not present (no copy) |
| statutory_preview | Identical to root |
| Submersible-Bridge-Report | Not present (uses gen-causeway-pdf.mjs instead) |

### 4. `scripts/src/gen-causeway-pdf.mjs`

| Folder | Diff from Root |
|--------|---------------|
| Root | Stub — `const p = "C:/Users/Rajkumar/Downloads/Design-Line-Complete/scripts/src/gen-causeway-pdf.mjs"` |
| Bridge-Design | Not present |
| statutory_preview | Identical stub |
| Submersible-Bridge-Report | **Full implementation** — compact narrative PDF generator with working `D` data object, `f()` formatter, `frame()`, `heading()`, `autoTable`, narrative interpretation paragraphs |

### 5. `scripts/src/run-append.mjs`

| Folder | Diff from Root |
|--------|---------------|
| Root | Stub — same Windows path as gen-causeway-pdf.mjs stub |
| Bridge-Design | Not present |
| statutory_preview | Identical stub |
| Submersible-Bridge-Report | Stub pointing to gen-causeway-pdf.mjs (same pattern) |

### 6. `scripts/src/append-pdf-sections.js`

| Folder | Diff from Root |
|--------|---------------|
| Root | Functional — appends Sections 5–7 (Afflux, Scour, Protection Works) as template strings to gen-causeway-pdf.mjs |
| Bridge-Design | Not present |
| statutory_preview | Not present |
| Submersible-Bridge-Report | Not present |

## Canonical Pipeline Determination

The **canonical pipeline** is the root's long-form narrative style:
- **pdf-export.ts** root version — `fml()`, `tbl()`, `para()`, `note()`, `chk()` pattern for storytelling
- **calculations.tsx** root version — standalone, no React, with `mergeInputs`/`resetInputs`/`defaultInputs`
- **generate-sample-pdf.ts** root version — the reference narrative template (identical to pdf-export.ts)

The Submersible-Bridge-Report provides the **compact narrative PDF** approach (landscape A3, autoTables, interpretation paragraphs) which is the best model for the desired output style.

## Reconciliation Action Items

1. The root pdf-export.ts already has narrative storytelling functions — it IS the reference format
2. The Submersible-Bridge-Report pdf-export.ts demonstrates the compact narrative style that should be adopted
3. The statutory_preview's deletions of `mergeInputs`/`resetInputs`/`defaultInputs` should be reverted
4. The Bridge-Design cosmetic changes (setFillColor 3-arg) should be standardized to match root
5. The gen-causeway-pdf.mjs stub in root should be replaced with a working implementation (like Submersible-Bridge-Report's version)