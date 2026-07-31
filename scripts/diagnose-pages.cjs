'use strict';
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const ROOT = process.cwd();
const OUTPUT_PDF = path.join(ROOT, '169-PAGE-SUBMERSIBLE-CAUSEWAY-DESIGN-REPORT.pdf');
const SAMPLE_PDF = path.join(ROOT, 'attached_assets', 'Type Design of submersible causeway.pdf');

async function getPageText(parser, pg) {
  const r = await parser.getText({ pageNumbers: [pg] });
  const page = r.pages.find(p => p.num === pg);
  return page ? page.text : '';
}

async function main() {
  console.log('=== DIAGNOSIS: PAGE-BY-PAGE SPOT CHECK ===\n');

  const outParser = new PDFParse({ verbosity: 0, data: fs.readFileSync(OUTPUT_PDF) });
  await outParser.load();

  const sampleParser = new PDFParse({ verbosity: 0, data: fs.readFileSync(SAMPLE_PDF) });
  await sampleParser.load();

  // 1. Show first 4 lines of output pages 7–20
  console.log('--- OUTPUT PDF pages 7-20 (first 4 lines each) ---');
  for (let pg = 7; pg <= 20; pg++) {
    const text = await getPageText(outParser, pg);
    const lines = text.split('\n').filter(l => l.trim()).slice(0, 4);
    console.log(`Page ${pg}:`);
    lines.forEach(l => console.log('  ' + l.substring(0, 100)));
  }

  // 2. Show sample PDF pages 7–20 first lines for comparison
  console.log('\n--- SAMPLE PDF pages 7-20 (first 4 lines each) ---');
  for (let pg = 7; pg <= 20; pg++) {
    const text = await getPageText(sampleParser, pg);
    const lines = text.split('\n').filter(l => l.trim()).slice(0, 4);
    console.log(`Page ${pg}:`);
    lines.forEach(l => console.log('  ' + l.substring(0, 100)));
  }

  // 3. Search for the critical phrase in entire output
  console.log('\n--- CRITICAL PHRASE SEARCH IN OUTPUT PDF ---');
  const TARGET = 'width of abutment is considered for full hieght upto HFL';
  let found = false;
  // Get all text at once via getText with all pages
  const allText = await outParser.getText({});
  const allLines = allText.pages.map(p => p.text).join('\n').split('\n');
  const idx = allLines.findIndex(l => l.includes(TARGET));
  if (idx >= 0) {
    console.log(`Found at line ${idx + 1}:`);
    for (let k = Math.max(0, idx-2); k <= Math.min(allLines.length-1, idx+2); k++) {
      console.log((k===idx?'>>>':'   ') + ' ' + allLines[k]);
    }
  } else {
    console.log('NOT FOUND in output PDF');
    // Show what's around the water-current section in the output
    const waterIdx = allLines.findIndex(l => l.toLowerCase().includes('water current'));
    if (waterIdx >= 0) {
      console.log(`\n"water current" found at line ${waterIdx + 1}, nearby lines:`);
      for (let k = Math.max(0, waterIdx-1); k <= Math.min(allLines.length-1, waterIdx+5); k++) {
        console.log(`  [${k+1}] ${allLines[k].substring(0,100)}`);
      }
    } else {
      console.log('"water current" also not found');
    }
  }

  // 4. What does output verbatim section look like? Show pages around the filtered-line-35 offset
  console.log('\n--- FILTERED LINE 35 OFFSET CHECK ---');
  console.log('Generator starts verbatim at filtered line index 35 -> maps to roughly:');
  // Read the .txt file and show filtered line 35
  const txtLines = fs.readFileSync(
    path.join(ROOT, 'attached_assets', 'Type Design of submersible causeway.txt'), 'utf8'
  ).split('\n').filter(l => l.trim());
  console.log(`Filtered line 0:  "${txtLines[0].substring(0, 80)}"`);
  console.log(`Filtered line 35: "${txtLines[35] ? txtLines[35].substring(0, 80) : '(out of range)'}"`)
  console.log(`Filtered line 36: "${txtLines[36] ? txtLines[36].substring(0, 80) : '(out of range)'}"`)
  // Where is the critical phrase in the filtered array?
  const criIdx = txtLines.findIndex(l => l.includes(TARGET));
  console.log(`\nCritical phrase at filtered line index: ${criIdx}`);
  console.log(`Lines from start-35 to critical phrase: ${criIdx - 35}`);
  const linesPerPage = 43; // approx from A3 landscape geometry
  console.log(`Estimated page in output (starting from page 7): ${7 + Math.floor((criIdx - 35) / linesPerPage)}`);
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
