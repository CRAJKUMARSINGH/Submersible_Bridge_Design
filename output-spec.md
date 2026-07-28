# Output Format Specification — Canonical Narrative PDF

Extracted from `attached_assets/Type Design of submersible causeway.{pdf,txt}` and `scripts/src/generate-sample-pdf.ts` (root).

## 1. Document Structure

| Element | Requirement |
|---------|-------------|
| Page size | A4 portrait (210×297mm) |
| Margins | 7mm outer, 9.5mm inner border |
| Font family | Helvetica (sans-serif) |
| Font sizes | Title 20pt, Section 13pt bold + 0.5pt rule, Subsection 8.5pt bold on dark bar, Body 7.5pt, Formula 7.5pt, Note 6.5pt italic |
| Color palette | Header: RGB(15,30,70); Accent: RGB(245,180,0); Body: RGB(0,0,0); Formula: RGB(0,50,150) courier; Note: RGB(60,60,60); PASS: RGB(0,130,0) on white; FAIL: RGB(200,0,0) on white |

## 2. Cover Page

- Dark blue background (RGB 0,15,45)
- Gold border (3 layers: 1.2pt, 0.5pt, 0.3pt)
- "GOVERNMENT OF INDIA" / "ROADS & BUILDINGS DEPARTMENT" in gold 9pt bold
- Title "DETAILED DESIGN REPORT" in white 20pt bold
- Subtitle "VENTED SUBMERSIBLE CAUSEWAY" in gold 14pt
- Project info box with: Name of Work, Design Philosophy, Applicable Codes, Design Discharge, Vent Configuration, Foundation Level, SBC
- Contents list: 14 sections

## 3. Narrative Elements (Mandated)

### 3.1 Prose Paragraphs (`para` function)
Every calculation step is introduced with a narrative paragraph that states:
- What is being computed (in words)
- Why it matters (design rationale)
- Assumptions made (with values substituted inline)

Example: "The design of the Vented Submersible Causeway is carried out as per the procedure outlined in IRC SP:82-2008."

### 3.2 Formula Blocks (`fml` function)
Each formula block contains 4 lines:
1. **Name** — descriptive label in bold 7.5pt
2. **Formula** — symbolic equation in courier blue
3. **Values** — substituted variable values with units
4. **Result** — computed answer with unit, in bold dark navy
5. Optional **Reference** — code citation in small italic grey, right-aligned

### 3.3 Data Rows (`datarow` function)
Simple key-value pairs: label on left, `= value unit` right-aligned at column 105mm.

### 3.4 Tables (`tbl` function)
- AutoTable with `theme: 'grid'`
- Dark navy header `RGB(15,30,70)` with gold text `RGB(245,180,0)` 7pt bold
- Body 6.2pt with alternating row shading `RGB(240,244,255)`
- Column widths specified explicitly
- Remarks column explaining significance

### 3.5 Notes (`note` function)
- 6.5pt italic grey text
- Prefixed with "Note: "
- Interpretive text explaining why a result is acceptable or what it means

### 3.6 Checks (`chk` function)
- Left-aligned label, right-aligned computed value, limit, and PASS/FAIL badge
- PASS: green fill `RGB(0,130,0)` white text
- FAIL: red fill `RGB(200,0,0)` white text

### 3.7 Highlight Rules (`hl` function)
- Thin horizontal rule `RGB(150,150,150)` separating sections

### 3.8 Sub-headings (`subHead` function)
- Light blue bar `RGB(210,220,240)` with dark navy bold 8pt text

## 4. Section Flow (Mandatory 14 Sections)

1. Design Philosophy & Scope
2. Hydraulic Particulars & Stream Survey Data
3. Discharge Calculations (Area-Velocity + Catchment + Weir)
4. Ventway Calculations & Fixation of RTL
5. Afflux Calculations (Orifice & Broad-Crested Weir Methods)
6. Scour Depth & Foundation Level (Lacey's Equations)
7. Design of Protection Works & Launching Aprons
8. General Loading Pattern (IRC 6:2000)
9. Design of Abutments (All Load Envelopes)
10. Stability Checks — Overturning & Sliding
11. Design of Strip Footing (RCC)
12. Design of Piers (All Footings)
13. Design of Face Walls (BIT-I to BIT-IV)
14. Summary of Results & Compliance

## 5. Code Compliance Markers
Every formula, table, or check must reference the applicable IRC code:
- `IRC SP:82-2008 Cl.5.1.3`
- `IRC SP:13-2004, Cl.15.1`
- `IRC SP:82, Cl.4`
- `Lacey (1930)`

## 6. Anti-Patterns (Forbidden)
- Raw data dumps without narrative context
- Tables without "Remarks" or interpretation column
- Formulas without substituted values (show the formula, then show numeric substitution, then show result)
- Missing code references
- Landscape orientation (use portrait A4)
- Missing PASS/FAIL status indicators for design checks