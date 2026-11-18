'use strict';
const x = require('xlsx');
const path = require('path');
const fs = require('fs');

const ROOT = process.cwd();
const FILES = [
  'attached_assets/Type Design of submersible causeway.xlsx',
  'attached_assets/Type Design of submersible causeway01.xlsx',
];

for (const file of FILES) {
  console.log('\n' + '='.repeat(70));
  console.log('FILE:', file);
  console.log('='.repeat(70));
  const wb = x.readFile(path.join(ROOT, file));
  console.log('Sheets:', wb.SheetNames);

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const ref = ws['!ref'] || 'A1:A1';
    const range = x.utils.decode_range(ref);
    const rows = range.e.r + 1;
    const cols = range.e.c + 1;
    const merges = ws['!merges'] ? ws['!merges'].length : 0;
    const rowBreaks = ws['!rowbreaks'] || [];
    const colBreaks = ws['!colbreaks'] || [];
    const printArea = ws['!printarea'] ? JSON.stringify(ws['!printarea']) : 'none';
    const pageSetup = ws['!pageSetup'] ? JSON.stringify(ws['!pageSetup']) : 'none';

    console.log(`\nSheet: "${sheetName}"`);
    console.log(`  Range: ${ref}  (${rows} rows × ${cols} cols)`);
    console.log(`  Merges: ${merges}`);
    console.log(`  Row page breaks: ${rowBreaks.length} →`, rowBreaks.slice(0,20));
    console.log(`  Col page breaks: ${colBreaks.length} →`, colBreaks.slice(0,10));
    console.log(`  Print area: ${printArea}`);
    console.log(`  Page setup: ${pageSetup}`);

    // Sample first 60 non-empty cells to understand content
    console.log('\n  First 60 non-empty cells:');
    let count = 0;
    for (let r = 0; r <= Math.min(range.e.r, 300) && count < 60; r++) {
      for (let c = 0; c <= range.e.c && count < 60; c++) {
        const addr = x.utils.encode_cell({ r, c });
        const cell = ws[addr];
        if (cell && cell.v !== undefined && cell.v !== '') {
          const val = String(cell.v).substring(0, 80).replace(/\n/g, '\\n');
          console.log(`    [${addr}] ${val}`);
          count++;
        }
      }
    }

    // Sample rows around row 50, 100, 500, 1000 to understand structure
    console.log('\n  Row samples at r=50, 100, 500, 1000:');
    for (const targetRow of [50, 100, 500, 1000]) {
      if (targetRow > range.e.r) continue;
      const rowCells = [];
      for (let c = 0; c <= Math.min(range.e.c, 20); c++) {
        const addr = x.utils.encode_cell({ r: targetRow, c });
        const cell = ws[addr];
        if (cell && cell.v !== undefined && cell.v !== '') {
          rowCells.push(`[${addr}]=${String(cell.v).substring(0,40)}`);
        }
      }
      if (rowCells.length) console.log(`    Row ${targetRow+1}: ${rowCells.join(' | ')}`);
    }
  }
}
