'use strict';
/**
 * Re-parse the Excel workbook treating it as a narrative calculation document,
 * NOT as a 89-column spreadsheet. The PDF→Excel conversion spread one logical
 * row across many merged cells. We collapse each row into:
 *
 *   { section, label, value, isHeading, isSectionTitle, rawRow }
 *
 * Rules:
 *  - Columns A..~AL  (0..36)  = label / description text
 *  - Column  AL      (37)     = '=' separator (often empty after conversion)
 *  - Columns AV..CK  (47..88) = value / result / unit
 *  - If the row has ONLY a label cell spanning most columns → section heading
 *  - If label ends with ':-' or starts with known keywords → section title
 */

const XLSX = require('xlsx');
const fs   = require('fs');
const path = require('path');

const ROOT = process.cwd();
const FILE = path.join(ROOT, 'attached_assets', 'Type Design of submersible causeway.xlsx');

const wb = XLSX.readFile(FILE);
const ws = wb.Sheets[wb.SheetNames[0]];
const range = XLSX.utils.decode_range(ws['!ref']);

const LABEL_END_COL  = 36;   // cols 0-36 = label zone  (A..AK)
const VALUE_START_COL = 47;  // cols 47+  = value zone  (AV..)

// ── helper: get all text from a row within a column band ──────────────────
function rowBandText(r, colStart, colEnd) {
  const parts = [];
  for (let c = colStart; c <= colEnd; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r, c })];
    if (cell && cell.v !== undefined && String(cell.v).trim()) {
      parts.push(String(cell.v).trim().replace(/\r?\n/g, ' '));
    }
  }
  return parts.join('  ').trim();
}

// ── classify row ──────────────────────────────────────────────────────────
function classifyRow(label, value) {
  const l = label.trim();
  if (!l && !value) return 'empty';

  const headingKeywords = [
    'Design Philosophy', 'Design of Abutment', 'Design of Pier',
    'Design of Deck', 'Design of Face Wall', 'DESIGN OF FACE',
    'General loading', 'II)General', 'III)Loading', 'IV)Calculation',
    'Check for', 'Stability', 'Reinforcement', 'As per clause',
    'GENERAL  IRC', 'DESIGN OF', 'Summary', 'Ventway', 'Hydraulic',
    'Scour', 'Afflux', 'Lacey', 'IRC Class',
  ];

  const isSectionTitle =
    l.endsWith(':-') ||
    l.endsWith(':') ||
    /^[IVX]+\)/.test(l) ||          // Roman numeral sections I) II) III)
    /^[a-z]\)/.test(l) ||            // sub-sections a) b) c)
    headingKeywords.some(k => l.startsWith(k)) ||
    (l.length < 60 && !value && !l.includes('='));

  const isParam = !!value && value.trim() !== '';

  return isSectionTitle ? 'heading' : (isParam ? 'param' : 'text');
}

// ── main extraction loop ───────────────────────────────────────────────────
const logicalRows = [];
let currentSection = 'Design Philosophy';

for (let r = range.s.r; r <= range.e.r; r++) {
  const label = rowBandText(r, 0, LABEL_END_COL);
  const value = rowBandText(r, VALUE_START_COL, range.e.c);

  if (!label && !value) continue;

  const type = classifyRow(label, value);
  if (type === 'empty') continue;

  if (type === 'heading') currentSection = label.replace(/:-$/, '').replace(/:$/, '').trim();

  logicalRows.push({
    rowNum: r + 1,
    section: currentSection,
    type,          // 'heading' | 'param' | 'text'
    label,
    value,
  });
}

// ── group into pages (20-25 logical rows per page) ─────────────────────────
const ROWS_PER_PAGE = 22;
const pages = [];
let currentPage = [];
let currentPageSection = '';

for (const row of logicalRows) {
  // Force page break on major section title
  const majorBreak = row.type === 'heading' &&
    currentPage.length >= 8 &&
    row.section !== currentPageSection;

  if (majorBreak || currentPage.length >= ROWS_PER_PAGE) {
    if (currentPage.length) pages.push([...currentPage]);
    currentPage = [];
  }

  currentPage.push(row);
  currentPageSection = row.section;
}
if (currentPage.length) pages.push(currentPage);

// ── print summary ────────────────────────────────────────────────────────
console.log(`Logical rows extracted : ${logicalRows.length}`);
console.log(`Pages at ${ROWS_PER_PAGE} rows/page : ${pages.length}`);
console.log('\n── SECTION LIST ──');
const sections = [...new Set(logicalRows.map(r => r.section))];
sections.forEach((s, i) => console.log(`  [${i+1}] ${s}`));

console.log('\n── FIRST 3 PAGES PREVIEW ──');
pages.slice(0, 3).forEach((pg, pi) => {
  console.log(`\nPage ${pi+1} (${pg.length} rows):`);
  pg.forEach(r => {
    const marker = r.type === 'heading' ? '█' : (r.type === 'param' ? '·' : ' ');
    const val = r.value ? `  =  ${r.value}` : '';
    console.log(`  ${marker} [R${r.rowNum}] ${r.label.substring(0,70)}${val.substring(0,50)}`);
  });
});

// ── save for generator ────────────────────────────────────────────────────
const output = { logicalRows, pages, sections, rowsPerPage: ROWS_PER_PAGE };
fs.writeFileSync(
  path.join(ROOT, 'scripts', 'excel-logical.json'),
  JSON.stringify(output, null, 2)
);
console.log(`\nSaved scripts/excel-logical.json  (${logicalRows.length} rows, ${pages.length} pages)`);
