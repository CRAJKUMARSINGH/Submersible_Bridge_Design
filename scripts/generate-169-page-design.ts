/**
 * generate-169-page-design.ts
 * ───────────────────────────────────────────────────────────────────────────
 * Generates the 169-page Vented Submersible Causeway Design Report from the
 * original Excel design workbook (A4 landscape).
 *
 * Architecture:
 *  Page   1        → Custom title page
 *  Pages  2–146    → Excel workbook content (145 pages × 22 rows)
 *                    • Heading rows   → Navy full-width section band
 *                    • Param rows     → 3-col layout: Label | = | Value
 *                    • Table rows     → jsPDF-autotable (6–10 logical cols)
 *                    • Text rows      → wrapped paragraph
 *  Pages 147–165   → Appendices (A–S)
 *  Pages 166–168   → Engineering drawings (CS A-A, LS B-B, Plan)
 *  Page  169       → Back cover
 *
 * Source: attached_assets/Type Design of submersible causeway.xlsx
 * Note:   89-column range is a PDF→Excel artefact.
 *         Logical columns: A–AK=label, AL='=', AV–CK=value
 *         Table columns:   A=SNo, B-F=Desc, M-P=Load, AA-AE=Dist/Ecc,
 *                          AN-AS=Intensity, BB-BC=Direction, BN-BP=Stress,
 *                          BD-BJ=Moment
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..');
const XLSX_FILE = join(ROOT, 'attached_assets', 'Type Design of submersible causeway.xlsx');
const JSON_CACHE = join(ROOT, 'scripts', 'excel-logical.json');
const OUTPUT_PDF = join(ROOT, '169-PAGE-SUBMERSIBLE-CAUSEWAY-DESIGN-REPORT.pdf');
const TARGET_PAGES = 169;
