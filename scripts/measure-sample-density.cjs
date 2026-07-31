'use strict';
// Measure line density of sample PDF pages to calibrate our renderer
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const ROOT = process.cwd();
const SAMPLE_PDF = path.join(ROOT, 'attached_assets', 'Type Design of submersible causeway.pdf');
const TXT = path.join(ROOT, 'attached_assets', 'Type Design of submersible causeway.txt');

async function main() {
  const parser = new PDFParse({ verbosity: 0, data: fs.readFileSync(SAMPLE_PDF) });
  await parser.load();

  // Get text for pages 1-20, count non-blank lines per page
  console.log('=== SAMPLE PDF LINE DENSITY (non-blank lines per page) ===\n');
  for (let pg = 1; pg <= 20; pg++) {
    const r = await parser.getText({ pageNumbers: [pg] });
    const page = r.pages.find(p => p.num === pg);
    const lines = page ? page.text.split('\n').filter(l => l.trim()) : [];
    console.log(`Page ${pg.toString().padStart(3)}: ${lines.length} lines  |  "${(lines[0]||'').substring(0,60)}"`);
  }

  // Cross-reference: sample page 15 full content
  console.log('\n=== SAMPLE PAGE 15 FULL CONTENT ===');
  const r15 = await parser.getText({ pageNumbers: [15] });
  const p15 = r15.pages.find(p => p.num === 15);
  if (p15) {
    const lines = p15.text.split('\n');
    lines.forEach((l, i) => console.log(`  [${i+1}] ${l}`));
    console.log(`\nTotal lines on sample page 15: ${lines.length}`);
    console.log(`Non-blank lines on sample page 15: ${lines.filter(l=>l.trim()).length}`);
  }

  // Map: what filtered-txt-line corresponds to the start of each sample page?
  console.log('\n=== TXT LINE INDEX MAPPING ===');
  const txtFiltered = fs.readFileSync(TXT, 'utf8').split('\n').filter(l => l.trim());
  // Find the first distinctive line of each sample page in the txt
  for (let pg = 1; pg <= 20; pg++) {
    const r = await parser.getText({ pageNumbers: [pg] });
    const page = r.pages.find(p => p.num === pg);
    const firstLine = page ? page.text.split('\n').filter(l => l.trim())[0] : '';
    if (!firstLine) { console.log(`Page ${pg}: (empty)`); continue; }
    // Find in filtered txt
    const probe = firstLine.trim().substring(0, 40);
    const txtIdx = txtFiltered.findIndex(l => l.includes(probe));
    console.log(`Page ${pg.toString().padStart(3)}: txt-idx=${txtIdx >= 0 ? txtIdx : 'NOT FOUND'}  probe="${probe}"`);
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
