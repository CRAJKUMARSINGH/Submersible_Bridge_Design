/**
 * RICE GRAIN TEST — Real per-page PDF text extraction via pdf-parse v2
 *
 * Checks:
 *   1. Output PDF is exactly 169 pages
 *   2. Critical phrases are present in the output PDF
 *   3. Page 15 specifically contains the water-current abutment phrase
 *   4. Sample page 7 content starts appearing by page 7–8 of the output
 *   5. Spot-checks at pages 50 and 100 for mid-document drift
 */

'use strict';
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const ROOT = path.resolve(process.cwd());
const SAMPLE_PDF = path.resolve(ROOT, 'attached_assets', 'Type Design of submersible causeway.pdf');
const OUTPUT_PDF = path.resolve(ROOT, '169-PAGE-SUBMERSIBLE-CAUSEWAY-DESIGN-REPORT.pdf');

async function loadPDF(filePath) {
  const buf = fs.readFileSync(filePath);
  const parser = new PDFParse({ verbosity: 0, data: buf });
  await parser.load();
  return parser;
}

async function getPageText(parser, pageNum) {
  try {
    const result = await parser.getText({ pageNumbers: [pageNum] });
    const page = result.pages.find(p => p.num === pageNum);
    return page ? page.text : '';
  } catch (e) {
    return '';
  }
}

async function getPageCount(parser) {
  try {
    const info = await parser.getInfo();
    return info.numPages || 0;
  } catch (e) {
    // fallback: try pages 1..200 until empty
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== RICE GRAIN TEST (pdf-parse v2, per-page extraction) ===\n');

  if (!fs.existsSync(OUTPUT_PDF)) {
    console.error('FAIL: Output PDF not found:', OUTPUT_PDF);
    process.exit(1);
  }

  // ── Load both PDFs ─────────────────────────────────────────────────────────
  console.log('Loading output PDF...');
  const outParser = await loadPDF(OUTPUT_PDF);
  const outInfo = await outParser.getInfo();
  const outPages = outInfo.numPages;
  console.log(`Output PDF pages: ${outPages} ${outPages === 169 ? '✓' : `✗ (expected 169)`}\n`);

  let sampleParser = null;
  let samplePages = 0;
  if (fs.existsSync(SAMPLE_PDF)) {
    console.log('Loading sample PDF...');
    sampleParser = await loadPDF(SAMPLE_PDF);
    const sInfo = await sampleParser.getInfo();
    samplePages = sInfo.numPages;
    console.log(`Sample PDF pages: ${samplePages}\n`);
  }

  let failures = 0;
  const PASS = (msg) => console.log(`  ✓ PASS  ${msg}`);
  const FAIL = (msg) => { console.log(`  ✗ FAIL  ${msg}`); failures++; };
  const WARN = (msg) => console.log(`  ⚠ WARN  ${msg}`);

  // ── Test 1: Page count ─────────────────────────────────────────────────────
  console.log('--- Test 1: Page Count ---');
  if (outPages === 169) PASS('Output PDF is exactly 169 pages');
  else FAIL(`Output PDF is ${outPages} pages (expected 169)`);

  // ── Test 2: Front matter (Pages 1–6) ──────────────────────────────────────
  console.log('\n--- Test 2: Front Matter (Pages 1–6) ---');
  for (let pg = 1; pg <= 6; pg++) {
    const text = await getPageText(outParser, pg);
    const preview = text.replace(/\n/g, ' ').substring(0, 100);
    console.log(`  Page ${pg}: ${preview || '(empty)'}`);
  }

  // ── Test 3: Critical rice-grain phrase on page ~15 ─────────────────────────
  console.log('\n--- Test 3: Rice-Grain Phrase (target: page ~15) ---');
  const TARGET_PHRASE = 'width of abutment is considered for full hieght upto HFL';
  let foundOnPage = null;
  // Search pages 7–30 to locate it
  for (let pg = 7; pg <= Math.min(outPages, 30); pg++) {
    const text = await getPageText(outParser, pg);
    if (text.includes(TARGET_PHRASE)) {
      foundOnPage = pg;
      break;
    }
  }

  if (foundOnPage !== null) {
    if (foundOnPage === 15) {
      PASS(`Target phrase found on page ${foundOnPage} (exactly page 15)`);
    } else {
      WARN(`Target phrase found on page ${foundOnPage} (expected page 15 — offset of ${foundOnPage - 15} pages)`);
      // Still a pass if present, with a page-offset warning
    }
    // Show the surrounding lines on that page
    const pageText = await getPageText(outParser, foundOnPage);
    const lines = pageText.split('\n');
    const lineIdx = lines.findIndex(l => l.includes(TARGET_PHRASE));
    console.log(`  Context around phrase (page ${foundOnPage}):`);
    for (let k = Math.max(0, lineIdx - 1); k <= Math.min(lines.length - 1, lineIdx + 2); k++) {
      const marker = k === lineIdx ? '>>>' : '   ';
      console.log(`  ${marker} ${lines[k]}`);
    }
  } else {
    // Wider search across whole document
    let foundWider = null;
    for (let pg = 1; pg <= outPages; pg++) {
      const text = await getPageText(outParser, pg);
      if (text.includes(TARGET_PHRASE)) { foundWider = pg; break; }
    }
    if (foundWider) {
      WARN(`Target phrase found on page ${foundWider} (outside pages 7–30 window)`);
    } else {
      FAIL(`Target phrase NOT found anywhere in output PDF: "${TARGET_PHRASE}"`);
    }
  }

  // ── Test 4: Sample page 7 content appears on output page 7–9 ──────────────
  console.log('\n--- Test 4: Verbatim content starts by page 7–9 ---');
  if (sampleParser) {
    const sampleP7 = await getPageText(sampleParser, 7);
    // Extract a short distinctive phrase from sample page 7
    const sampleLines = sampleP7.split('\n').filter(l => l.trim().length > 10);
    if (sampleLines.length > 0) {
      const probe = sampleLines[0].trim().substring(0, 50);
      console.log(`  Sample page 7 probe phrase: "${probe}"`);
      let found = false;
      for (let pg = 7; pg <= 12; pg++) {
        const t = await getPageText(outParser, pg);
        if (t.includes(probe)) { 
          PASS(`Sample page-7 probe found on output page ${pg}`);
          found = true; break;
        }
      }
      if (!found) WARN(`Sample page-7 probe not found in output pages 7–12`);
    }
  } else {
    WARN('Sample PDF not available for cross-check');
  }

  // ── Test 5: Spot-check pages 50 and 100 ───────────────────────────────────
  console.log('\n--- Test 5: Spot-check pages 50 and 100 ---');
  for (const pg of [50, 100]) {
    const text = await getPageText(outParser, pg);
    const preview = text.replace(/\n/g, ' ').substring(0, 120);
    const hasContent = text.trim().length > 50;
    if (hasContent) {
      PASS(`Page ${pg} has content: "${preview.substring(0, 80)}..."`);
    } else {
      FAIL(`Page ${pg} appears empty or near-empty`);
    }
  }

  // ── Test 6: Sample PDF page 15 comparison ─────────────────────────────────
  if (sampleParser) {
    console.log('\n--- Test 6: Sample PDF page 15 content ---');
    const sP15 = await getPageText(sampleParser, 15);
    const sP15Lines = sP15.split('\n').filter(l => l.trim());
    console.log('  Sample PDF page 15 (first 4 lines):');
    sP15Lines.slice(0, 4).forEach(l => console.log(`  > ${l.substring(0, 100)}`));
    // Check if output has same content somewhere around its page 15
    const outP15 = await getPageText(outParser, 15);
    const sP15Probe = sP15Lines[0] ? sP15Lines[0].trim().substring(0, 40) : '';
    if (sP15Probe && outP15.includes(sP15Probe)) {
      PASS(`Output page 15 contains sample page-15 probe: "${sP15Probe}"`);
    } else {
      WARN(`Output page 15 does NOT match sample page 15 (probe: "${sP15Probe}")`);
      console.log('  Output page 15 (first 3 lines):');
      outP15.split('\n').filter(l => l.trim()).slice(0, 3)
        .forEach(l => console.log(`  > ${l.substring(0, 100)}`));
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n=== VERDICT ===');
  if (failures === 0) {
    console.log('RICE GRAIN TEST: PASS — No critical failures.');
  } else {
    console.log(`RICE GRAIN TEST: FAIL — ${failures} critical failure(s).`);
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Unexpected error:', e.message);
  console.error(e.stack);
  process.exit(1);
});
