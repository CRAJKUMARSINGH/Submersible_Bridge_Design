# Phase 5: Correction & Re-iteration Protocol

## Identified Narrative Gaps (Submersible-Bridge-Report vs Canonical Root)

Comparing `CODE-JUNCTION/Submersible-Bridge-Report/artifacts/causeway-design/src/lib/pdf-export.ts` against `root/pdf-export.ts` (the canonical narrative source, which includes `generate-sample-pdf.ts` and `gen-causeway-pdf.mjs`), the following gaps exist:

### Gap 1: No `para()` narrative paragraphs — 0 pts
The Submersible-Bridge-Report uses only `autoTable` and minimal text nodes. It lacks the `para()` function for prose-style design rationale explanations. Every calculation step should be introduced with a paragraph.

**Fix**: Add `para()` function to Submersible-Bridge-Report pdf-export.ts:
```typescript
function para(y: number, t: string, indent = 14): number {
  doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(0);
  const lines = doc.splitTextToSize(t, PW - 24);
  doc.text(lines, indent, y);
  return y + lines.length * 4 + 1;
}
```

### Gap 2: No `fml()` formula blocks — 0 pts
The Submersible-Bridge-Report uses inline autoTable cells for formula display. It lacks the structured `fml()` format that shows formula → substituted values → result → reference in a multi-line block.

**Fix**: Add `fml()` function to Submersible-Bridge-Report pdf-export.ts (same implementation as root).

### Gap 3: No `note()` interpretive notes — 0 pts
The Submersible-Bridge-Report lacks the `note()` function for italic interpretation text after tables and checks.

**Fix**: Add `note()` function to Submersible-Bridge-Report pdf-export.ts.

### Gap 4: No `chk()` PASS/FAIL badges — 0 pts
The Submersible-Bridge-Report uses color-coded inline autoTable cells for pass/fail but lacks the dedicated `chk()` function with explicit computed value, limit column, and green/red badge rectangle.

**Fix**: Add `chk()` function to Submersible-Bridge-Report pdf-export.ts (same implementation as root).

### Gap 5: No `hl()` highlight rules — 0 pts
The Submersible-Bridge-Report doesn't have `hl()` thin horizontal rule separating sections. Sections are separated by autoTable breaks instead.

**Fix**: Add `hl()` function to Submersible-Bridge-Report pdf-export.ts.

### Gap 6: Inconsistent code compliance references — 5 pts
The autoTable cells reference codes but not consistently via `fml()` footnote parameter. Every formula block must cite the code in its ref footnote.

**Fix**: Ensure all `fml()` calls include the `ref` parameter with IRC clause citation (e.g., IRC SP:82, IRC SP:13, IRC:5-1985, Lacey, etc.).

## Correction Steps (Iterative)

1. **Apply Gap 1–6 fixes** to `CODE-JUNCTION/Submersible-Bridge-Report/artifacts/causeway-design/src/lib/pdf-export.ts`
2. **Re-run** the canonical pipeline for all 15 test sets (Phase 3)
3. **Re-score** all 15 outputs against QA Rubric (Phase 4)
4. **Check pass rate**: If ≥ 14/15 score ≥ 75, proceed to sign-off. If < 14/15, return to Step 1.
5. **Max iterations**: 3 correction cycles before escalation

## Expected Outcome After Correction

After applying the `para()`, `fml()`, `note()`, `chk()`, and `hl()` functions to the Submersible-Bridge-Report's pdf-export.ts, all 15 test sets should score ≥ 75/100 on the QA rubric.

The corrected pdf-export.ts will produce:
- A4 portrait PDFs
- Narrative prose paragraphs introducing each calculation step
- Structured formula blocks with symbolic equation → substituted values → result → code reference
- Interpretive notes explaining pass/fail significance
- PASS/FAIL badges with green/red color coding
- All 14 sections in correct order
- No raw data dumps; every table has a remarks column