/**
 * v8-word-conformance.test.ts — Task 10 / V8 ("Word Output Conformance").
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates the Word report, unzips `word/document.xml` from the produced
 * .docx and checks:
 *   (a) the document carries exactly 13 Heading-1 paragraphs, in the Section 18
 *       outline order;
 *   (b) at least 20 Section-10 report-field values appear verbatim in the XML.
 *
 * Run: node --import tsx --test ./scripts/v8-word-conformance.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inflateRawSync } from 'node:zlib';
import { defaultInputs, computeResults } from '../src/lib/calculations';
import { buildDesignDocxBuffer, WORD_TOP_LEVEL_SECTIONS } from '../src/lib/word-export';

// ─── Minimal ZIP reader (no external dependency; reads the central directory) ─
function readZipEntry(zip: Buffer, entryName: string): string {
  let eocd = -1;
  for (let i = zip.length - 22; i >= 0 && i > zip.length - 22 - 65536; i--) {
    if (zip.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  assert.ok(eocd >= 0, 'EOCD record not found — not a valid .docx (zip) file');

  const cdCount = zip.readUInt16LE(eocd + 10);
  let off = zip.readUInt32LE(eocd + 16);
  for (let n = 0; n < cdCount; n++) {
    assert.equal(zip.readUInt32LE(off), 0x02014b50, 'corrupt central-directory signature');
    const method = zip.readUInt16LE(off + 10);
    const compSize = zip.readUInt32LE(off + 20);
    const nameLen = zip.readUInt16LE(off + 28);
    const extraLen = zip.readUInt16LE(off + 30);
    const commentLen = zip.readUInt16LE(off + 32);
    const localOff = zip.readUInt32LE(off + 42);
    const name = zip.toString('utf8', off + 46, off + 46 + nameLen);
    if (name === entryName) {
      const lNameLen = zip.readUInt16LE(localOff + 26);
      const lExtraLen = zip.readUInt16LE(localOff + 28);
      const dataStart = localOff + 30 + lNameLen + lExtraLen;
      const data = zip.subarray(dataStart, dataStart + compSize);
      return method === 8 ? inflateRawSync(data).toString('utf8') : data.toString('utf8');
    }
    off += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error(`zip entry not found: ${entryName}`);
}

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/** Return the text of every Heading-1 paragraph, in document order. */
function extractHeading1Texts(xml: string): string[] {
  const out: string[] = [];
  for (const p of xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) ?? []) {
    if (!p.includes('w:val="Heading1"')) continue;
    let text = '';
    for (const t of p.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) ?? []) {
      text += decodeXml(t.replace(/<[^>]*>/g, ''));
    }
    out.push(text);
  }
  return out;
}

// Distinctive keyword per outline block (independent of the generator's own array).
const OUTLINE_KEYWORDS = [
  'Report Title Page',
  'Design Philosophy',
  'Site and Hydrological',
  'Design Discharge (Step 1)',
  'Hydraulic Design (Step 2)',
  'Structural Geometry',
  'Structural Loads',
  'Abutment & Pier Design',
  'Deck Slab Design',
  'Anchors & Thrust Blocks',
  'Compliance',
  'Engineering Drawings',
  'Appendices',
];

test('V8 — Word output conformance to the Section 18 outline', async () => {
  const inputs = defaultInputs;
  const results = computeResults(inputs);

  const buffer = await buildDesignDocxBuffer(inputs, results);
  assert.ok(Buffer.isBuffer(buffer) && buffer.length > 0, 'generator produced an empty .docx buffer');
  console.log(`Generated .docx: ${buffer.length} bytes`);

  const xml = readZipEntry(buffer, 'word/document.xml');
  console.log(`word/document.xml: ${xml.length} chars`);

  // (a) 13 Heading-1 blocks, in outline order.
  const headings = extractHeading1Texts(xml);
  console.log(`Heading-1 count: ${headings.length}`);
  headings.forEach((h, i) => console.log(`  ${i + 1}. ${h}`));

  assert.equal(headings.length, 13, `expected 13 top-level Heading-1 sections, found ${headings.length}`);
  assert.equal(WORD_TOP_LEVEL_SECTIONS.length, 13, 'WORD_TOP_LEVEL_SECTIONS must define exactly 13 blocks');

  OUTLINE_KEYWORDS.forEach((kw, i) => {
    assert.ok(
      headings[i] && headings[i].includes(kw),
      `Heading ${i + 1} should contain "${kw}" but was "${headings[i]}"; outline order/section missing`,
    );
  });

  // (b) Section-10 field spot-check — ≥ 20 values present verbatim.
  const f2 = (n: number) => n.toFixed(2);
  const s = results.structural;
  const fields: Array<[string, string]> = [
    ['projectName', inputs.projectName],
    ['streamName', inputs.streamName],
    ['location', inputs.location],
    ['qRational', f2(results.qRational)],
    ['qWeir', f2(results.qWeir)],
    ['qVelocity', f2(results.qVelocity)],
    ['designDischarge', f2(results.designDischarge)],
    ['governingMethod', results.governingMethod],
    ['aVent', f2(results.aVent)],
    ['aRTL', f2(results.aRTL)],
    ['aHFL', f2(results.aHFL)],
    ['pctObsRTL', f2(results.pctObsRTL)],
    ['pctObsHFL', f2(results.pctObsHFL)],
    ['velocityHFL', f2(results.velocityHFL)],
    ['hAfflux', f2(results.hAfflux)],
    ['laceyPerimeter', f2(results.laceyPerimeter)],
    ['siltFactor', f2(inputs.siltFactor)],
    ['laceyScourDepth', f2(results.laceyScourDepth)],
    ['maxScourDepth', f2(results.maxScourDepth)],
    ['fbl', f2(results.fbl)],
    ['recommendedDepth', f2(results.recommendedDepth)],
    ['wSelf', f2(results.wSelf)],
    ['wSilt', f2(results.wSilt)],
    ['wLive', f2(results.wLive)],
    ['totalVerticalLoad', f2(results.totalVerticalLoad)],
    ['fDrag', f2(results.fDrag)],
    ['fDragTotal', f2(results.fDragTotal)],
    ['fUplift', f2(results.fUplift)],
    ['fAnchor', f2(results.fAnchor)],
    ['ka', f2(s.earthPressure.ka)],
    ['fosSliding', f2(s.stability.fosSliding)],
    ['fosOverturning', f2(s.stability.fosOverturning)],
    ['pMax', f2(s.bearing.pMax)],
    ['pMin', f2(s.bearing.pMin)],
  ];

  const missing = fields.filter(([, value]) => !xml.includes(value));
  console.log(`Field spot-check: ${fields.length - missing.length}/${fields.length} present (need ≥ 20)`);
  missing.forEach(([label, value]) => console.log(`  MISSING ${label} = ${value}`));

  assert.ok(fields.length >= 20, 'spot-check list must contain at least 20 fields');
  assert.deepEqual(missing, [], 'all spot-checked Section-10 field values must appear in word/document.xml');

  // Rubric (Task 10): 2 = identical structure, 1 = minor layout issues, 0 = missing 3+ sections.
  const matched = OUTLINE_KEYWORDS.length - OUTLINE_KEYWORDS.filter((kw, i) => !(headings[i] ?? '').includes(kw)).length;
  const rubric = matched === 13 ? 2 : matched >= 10 ? 1 : 0;
  console.log(`\nRubric: ${rubric} (matched ${matched}/13 outline blocks). Pass ≥ 1.`);
  assert.ok(rubric >= 1, 'V8 rubric below the pass threshold');
});
