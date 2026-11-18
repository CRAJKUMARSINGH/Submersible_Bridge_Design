'use strict';
const XLSX = require('xlsx');
const path = require('path');
const ROOT = process.cwd();
const wb = XLSX.readFile(path.join(ROOT,'attached_assets','Type Design of submersible causeway.xlsx'));
const ws = wb.Sheets[wb.SheetNames[0]];
const range = XLSX.utils.decode_range(ws['!ref']);

function rowCells(r) {
  const cells = [];
  for (let c = 0; c <= range.e.c; c++) {
    const cell = ws[XLSX.utils.encode_cell({r,c})];
    if (cell && cell.v !== undefined && String(cell.v).trim()) {
      cells.push({ c, colLetter: XLSX.utils.encode_col(c), v: String(cell.v).trim() });
    }
  }
  return cells;
}

// Print rows 94-145 (known load table area — abutment eccentricity)
console.log('=== ROWS 94-145 (abutment load table) ===');
for (let r = 93; r <= 144; r++) {
  const cells = rowCells(r);
  if (!cells.length) continue;
  const parts = cells.map(c => `${c.colLetter}:${c.v.substring(0,20)}`);
  console.log(`R${r+1}: ${parts.join(' | ')}`);
}

// Print rows 504-535 (stress check tables)
console.log('\n=== ROWS 504-535 (stress check table) ===');
for (let r = 503; r <= 534; r++) {
  const cells = rowCells(r);
  if (!cells.length) continue;
  const parts = cells.map(c => `${c.colLetter}:${c.v.substring(0,18)}`);
  console.log(`R${r+1}: ${parts.join(' | ')}`);
}

// Print rows 1186-1210 (pier eccentricity table)
console.log('\n=== ROWS 1186-1210 (pier load table) ===');
for (let r = 1185; r <= 1209; r++) {
  const cells = rowCells(r);
  if (!cells.length) continue;
  const parts = cells.map(c => `${c.colLetter}:${c.v.substring(0,18)}`);
  console.log(`R${r+1}: ${parts.join(' | ')}`);
}

// Look for ALL unique column positions that have data in rows 93-145
console.log('\n=== ACTIVE COLUMNS in rows 93-145 ===');
const activeCols = new Set();
for (let r = 93; r <= 144; r++) {
  rowCells(r).forEach(c => activeCols.add(c.c));
}
const sorted = [...activeCols].sort((a,b)=>a-b);
console.log('Active col indices:', sorted.join(', '));
console.log('Active col letters:', sorted.map(c=>XLSX.utils.encode_col(c)).join(', '));
