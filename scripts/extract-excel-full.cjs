'use strict';
// Deep extraction of Excel workbook — outputs a structured JSON for the generator
const x    = require('xlsx');
const fs   = require('fs');
const path = require('path');

const ROOT = process.cwd();
const FILE = path.join(ROOT, 'attached_assets', 'Type Design of submersible causeway.xlsx');

const wb = x.readFile(FILE);
const ws = wb.Sheets[wb.SheetNames[0]];
const range = x.utils.decode_range(ws['!ref']);

// ── Build a flat row-by-row representation ─────────────────────────────────
// Each row: { rowNum, cells: [{col, addr, value, formula}], isHeading, text }
const rows = [];

for (let r = 0; r <= range.e.r; r++) {
  const cells = [];
  for (let c = 0; c <= range.e.c; c++) {
    const addr = x.utils.encode_cell({ r, c });
    const cell = ws[addr];
    if (!cell || cell.v === undefined || cell.v === '') continue;
    cells.push({
      col: c,
      colLetter: x.utils.encode_col(c),
      addr,
      value: cell.v,
      type: cell.t,          // 'n'=number, 's'=string, 'f'=formula
      formula: cell.f || null,
    });
  }
  if (cells.length === 0) continue;

  // Detect section headings: cell in col A only, string, no '=' sign
  const aCell = cells.find(c => c.col === 0);
  const isHeading = aCell &&
    typeof aCell.value === 'string' &&
    aCell.value.trim().length > 3 &&
    !aCell.value.includes('=') &&
    cells.filter(c => c.col > 5).length === 0;

  // Build a display text for the row
  let text = '';
  // Group: label (col A) | '=' (col AL) | value (col AV onwards)
  const label = cells.filter(c => c.col < 37).map(c => String(c.value).replace(/\n/g,' ')).join(' ').trim();
  const eq    = cells.find(c => c.col === 37); // col AL = index 37
  const vals  = cells.filter(c => c.col >= 47).map(c => String(c.value)).join('  '); // col AV onwards
  if (eq) {
    text = `${label}  =  ${vals}`;
  } else {
    text = cells.map(c => String(c.value).replace(/\n/g,' ')).join('   ').trim();
  }

  rows.push({ rowNum: r + 1, isHeading, text, cellCount: cells.length, cells });
}

// ── Find natural page breaks (blank row runs of ≥2) ──────────────────────
// Also detect bold/large heading rows for page section starts
const sections = [];
let sectionStart = 0;
let sectionTitle = '';

const allRowNums = new Set(rows.map(r => r.rowNum));
let prevRowNum = 0;
for (const row of rows) {
  const gap = row.rowNum - prevRowNum;
  if (gap >= 3 && prevRowNum > 0) {
    // Natural break
    sections.push({ startRow: sectionStart, endRow: prevRowNum, title: sectionTitle });
    sectionStart = row.rowNum;
    sectionTitle = row.text.substring(0,60);
  }
  if (row.isHeading && sectionTitle === '') sectionTitle = row.text.substring(0,60);
  prevRowNum = row.rowNum;
}
sections.push({ startRow: sectionStart, endRow: prevRowNum, title: sectionTitle });

// ── Output summary ────────────────────────────────────────────────────────
console.log(`Total data rows: ${rows.length}`);
console.log(`Detected sections: ${sections.length}`);
console.log('\n── SECTION SUMMARY ──');
sections.forEach((s, i) => {
  console.log(`  [${i+1}] rows ${s.startRow}-${s.endRow}  "${s.title}"`);
});

// ── Output first 120 rows as a preview ────────────────────────────────────
console.log('\n── FIRST 120 DATA ROWS ──');
rows.slice(0, 120).forEach(r => {
  const mark = r.isHeading ? '█' : ' ';
  console.log(`${mark} R${String(r.rowNum).padStart(4)}: ${r.text.substring(0,110)}`);
});

// ── Output rows 500-560, 1000-1060, 1500-1540, 2000-2040 for spot checks ──
for (const [start, end] of [[500,540],[1000,1040],[1500,1530],[2000,2030],[2500,2544]]) {
  console.log(`\n── ROWS ${start}-${end} ──`);
  rows.filter(r => r.rowNum >= start && r.rowNum <= end).forEach(r => {
    const mark = r.isHeading ? '█' : ' ';
    console.log(`${mark} R${String(r.rowNum).padStart(4)}: ${r.text.substring(0,110)}`);
  });
}

// ── Save full extraction to JSON for use by generator ─────────────────────
const output = {
  source: FILE,
  totalRows: rows.length,
  sections,
  rows: rows.map(r => ({ rowNum: r.rowNum, isHeading: r.isHeading, text: r.text })),
};
fs.writeFileSync(
  path.join(ROOT, 'scripts', 'excel-content.json'),
  JSON.stringify(output, null, 2)
);
console.log('\nSaved scripts/excel-content.json');
