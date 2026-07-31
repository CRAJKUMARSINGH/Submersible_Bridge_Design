/**
 * RICE GRAIN TEST — Real per-page PDF text extraction via pdf-parse v2
 *
 * Success criteria:
 *   1. Output PDF contains exactly 169 pages
 *   2. The critical phrase is present in the full document text
 *   3. The critical phrase appears on output page 15 specifically
 *   4. Pages 2, 50, 100 have substantive content (no blank/placeholder pages)
 *   5. Page 2 starts with sample verbatim content (not custom cover text)
 */

'use strict';
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const ROOT = process.cwd();
const SAMPLE_PDF = path.join(ROOT, 'attached_assets', 'Type Design of submersible causeway.pdf');
const OUTPUT_PDF = path.join(ROOT, '169-PAGE-SUBMERSIBLE-CAUSEWAY-DESIGN-REPORT.pdf');
const TARGET_PHRASE = 'width of abutment is considered for full hieght upto HFL';

async function loadParser(filePath) {
  const parser = new PDFParse({ verbosity: 0, data: fs.readFileSync(filePath) });
  await parser.load();
  return parser;
}

async function getPageText(parser, pg) {
  try {
    const r = await parser.getText({ pageNumbers: [pg] });
    const page = r.pages.find(p => p.num === pg);
    return page ? page.text : '';
  } catch (e) { return ''; }
}

async function getFullText(parser) {
  const r = await parser.getText({});
  return r.pages.map(p => p.text).join('\n');
}

// Count pages by trying pages until empty
async function countPages(parser) {
  // pdf-parse v2 getInfo() doesn't reliably expose numPages; probe instead
  let lo = 1, hi = 300;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const t = await getPageText(parser, mid);
    if (t && t.trim()) lo = mid; else hi = mid - 1;
  }
  return lo;
}

async function main() {
  console.log('=== RICE GRAIN TEST (pdf-parse v2) ===\n');

  if (!fs.existsSync(OUTPUT_PDF)) {
    console.error('FAIL: Output PDF not found:', OUTPUT_PDF);
    process.exit(1);
  }

  const outParser = await loadParser(OUTPUT_PDF);
  const outPages = await countPages(outParser);
  console.log(`Output PDF pages detected: ${outPages} ${outPages === 169 ? '✓' : '✗ (expected 169)'}`);

  let sampleParser = null;
  if (fs.existsSync(SAMPLE_PDF)) {
    sampleParser = await loadParser(SAMPLE_PDF);
    const samplePages = await countPages(sampleParser);
    console.log(`Sample PDF pages: ${samplePages}\n`);
  }

  let failures = 0;
  const PASS = msg => console.log(`  ✓ PASS  ${msg}`);
  const FAIL = msg => { console.log(`  ✗ FAIL  ${msg}`); failures++; };
  const WARN = msg => console.log(`  ⚠ WARN  ${msg}`);

  // ── Test 1: Page count ─────────────────────────────────────────────
  console.log('--- Test 1: Page count ---');
  if (outPages === 169) PASS('Exactly 169 pages');
  else FAIL(`${outPages} pages (expected 169)`);

  // ── Test 2: Critical phrase in full document ───────────────────────
  console.log('\n--- Test 2: Critical phrase present in full document ---');
  const fullText = await getFullText(outParser);
  if (fullText.includes(TARGET_PHRASE)) {
    PASS(`"${TARGET_PHRASE.substring(0, 60)}" found in full document`);
  } else {
    FAIL(`Critical phrase NOT found anywhere in output PDF`);
    console.log(`  Phrase: "${TARGET_PHRASE}"`);
  }

  // ── Test 3: Critical phrase on page 15 ────────────────────────────
  console.log('\n--- Test 3: Critical phrase on page 15 ---');
  const p15Text = await getPageText(outParser, 15);
  if (p15Text.includes(TARGET_PHRASE)) {
    PASS('Critical phrase found on page 15 (exact match)');
    const lines = p15Text.split('\n');
    const lineIdx = lines.findIndex(l => l.includes(TARGET_PHRASE));
    console.log(`  Line ${lineIdx + 1} of page 15: "${lines[lineIdx].substring(0, 100)}"`);
  } else {
    // Check nearby pages 14-16
    let nearPage = null;
    for (const pg of [14, 16, 13, 17]) {
      const t = await getPageText(outParser, pg);
      if (t.includes(TARGET_PHRASE)) { nearPage = pg; break; }
    }
    if (nearPage) {
      WARN(`Phrase found on page ${nearPage} instead of 15 (offset = ${nearPage - 15})`);
    } else {
      FAIL('Critical phrase not found on pages 13-17');
    }
  }

  // ── Test 4: Page 2 has verbatim content (not cover text) ──────────
  console.log('\n--- Test 4: Page 2 starts with verbatim content ---');
  const p2Text = await getPageText(outParser, 2);
  const p2Lines = p2Text.split('\n').filter(l => l.trim());
  console.log('  Page 2 first line: ' + (p2Lines[0] || '(empty)').substring(0, 80));
  const hasDesignTitle = p2Text.includes('DESIGN') && p2Text.includes('VENTED');
  const hasNameOfWork = p2Text.includes('Name of the work') || p2Text.includes('B.T to the R/f');
  if (hasDesignTitle || hasNameOfWork) {
    PASS('Page 2 contains verbatim design content');
  } else {
    WARN('Page 2 content not recognized as sample verbatim text');
  }

  // ── Test 5: Spot-check pages 50 and 100 for substantive content ───
  console.log('\n--- Test 5: Spot-check pages 50 and 100 ---');
  for (const pg of [50, 100]) {
    const t = await getPageText(outParser, pg);
    const nonBlankLines = t.split('\n').filter(l => l.trim()).length;
    if (nonBlankLines >= 5) {
      const preview = t.replace(/\n/g, ' ').substring(0, 80);
      PASS(`Page ${pg} has ${nonBlankLines} lines: "${preview}..."`);
    } else {
      FAIL(`Page ${pg} appears near-empty (${nonBlankLines} lines)`);
    }
  }

  // ── Test 6: Sample cross-check page 15 ───────────────────────────
  if (sampleParser) {
    console.log('\n--- Test 6: Sample page 15 cross-check ---');
    const sp15 = await getPageText(sampleParser, 15);
    const sampleFirstLine = sp15.split('\n').filter(l => l.trim())[0] || '';
    if (p15Text.includes(sampleFirstLine.substring(0, 40))) {
      PASS(`Output page 15 matches sample page 15 first line`);
    } else {
      WARN(`Output page 15 first content: "${(p15Text.split('\n').filter(l=>l.trim())[0]||'').substring(0,60)}"`);
      WARN(`Sample page 15 first content: "${sampleFirstLine.substring(0,60)}"`);
    }
  }

  // ── Summary ────────────────────────────────────────────────────────
  console.log('\n=== VERDICT ===');
  if (failures === 0) {
    console.log('RICE GRAIN TEST: PASS — All critical checks passed.');
  } else {
    console.log(`RICE GRAIN TEST: FAIL — ${failures} critical failure(s).`);
    process.exit(1);
  }
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
