// scripts/compare-pages.cjs
// Usage: node scripts/compare-pages.cjs [pageNumber]
// Example: node scripts/compare-pages.cjs 15
//
// Prints sample (left) vs output (right) for the given page, marking mismatched lines with ≠.
// Adapted for pdf-parse v2 (PDFParse class API).

'use strict';
const fs   = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const SAMPLE = path.resolve(__dirname, '..', 'attached_assets', 'Type Design of submersible causeway.pdf');
const OUTPUT = path.resolve(__dirname, '..', '169-PAGE-SUBMERSIBLE-CAUSEWAY-DESIGN-REPORT.pdf');
const PAGE   = parseInt(process.argv[2] || '15', 10);
const COL_W  = 60;  // characters per column

async function extractPage(filePath, pageNum) {
  const parser = new PDFParse({ verbosity: 0, data: fs.readFileSync(filePath) });
  await parser.load();
  const result = await parser.getText({ pageNumbers: [pageNum] });
  const page = result.pages.find(p => p.num === pageNum);
  return page ? page.text.split('\n').map(l => l.trimEnd()) : [];
}

function pad(str, width) {
  if (!str) str = '';
  return str.length > width ? str.slice(0, width) : str.padEnd(width);
}

async function main() {
  if (!fs.existsSync(SAMPLE)) { console.error('Sample PDF not found:', SAMPLE); process.exit(1); }
  if (!fs.existsSync(OUTPUT)) { console.error('Output PDF not found:', OUTPUT); process.exit(1); }

  const [sp, op] = await Promise.all([
    extractPage(SAMPLE, PAGE),
    extractPage(OUTPUT, PAGE),
  ]);

  const rows = Math.max(sp.length, op.length);
  const sep  = '-'.repeat(COL_W * 2 + 9);

  console.log(sep);
  console.log(`  SAMPLE page ${PAGE}`.padEnd(COL_W + 4) + `|  OUTPUT page ${PAGE}`);
  console.log(sep);

  let matched = 0;
  for (let i = 0; i < rows; i++) {
    const L      = pad(sp[i] || '', COL_W);
    const R      = pad(op[i] || '', COL_W);
    const same   = (sp[i] || '').trim() === (op[i] || '').trim();
    const marker = same ? ' ' : '\u2260';
    if (same) matched++;
    console.log(`${String(i + 1).padStart(3)} ${L} ${marker} ${R}`);
  }

  console.log(sep);
  console.log(`Lines  — sample: ${sp.length}   output: ${op.length}`);
  console.log(`Match  — ${matched}/${rows} lines identical  (${rows > 0 ? ((matched/rows)*100).toFixed(0) : 0}%)`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
