/**
 * v7-report-completeness.test.ts — V7 ("Report Completeness", spec §14.1).
 * ─────────────────────────────────────────────────────────────────────────────
 * Pass criterion (spec §14.1 V7): "100 % of Section 10 fields present".
 *
 * The checklist below is transcribed from spec §10.1 (Sheets 1–4 of the report
 * field inventory) and is therefore independent of the report generator. Each
 * checklist entry must appear in the generated .docx `document.xml`.
 *
 * Run: node --import tsx --test ./scripts/v7-report-completeness.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inflateRawSync } from 'node:zlib';
import { buildDesignDocxBuffer } from '../src/lib/word-export';
import { computeResults, defaultInputs } from '../src/lib/calculations';

// ─── Dependency-free .docx (zip) reader (central-directory walk) ─────────────
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

function xmlToText(xml: string): string {
  return xml
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
}

// ─── Section 10.1 field checklist (spec-derived, generator-independent) ──────
// Sheet 1 — Cover
const SHEET_1 = [
  'DESIGN OF VENTED SUBMERSIBLE CAUSEWAY',
  'HYDRAULIC & STRUCTURAL DESIGN REPORT',
  'Name of Work',
  'Stream / Road',
  'Location',
  'IRC SP:82-2008',
  'IRC 6:2000',
  'Contents',
];
// Sheet 2 — Step 1 Design Discharge
const SHEET_2 = [
  'Rational',
  'Broad-Crested Weir',
  'Area-Velocity',
  'Governing method',
  'Design Discharge',
];
// Sheet 3 — Step 2 Hydraulic
const SHEET_3 = [
  'Number of vents',
  'Vent width',
  'Vent height',
  'Vent area',
  'Flow area @ RTL',
  'Flow area @ HFL',
  'Obstruction @ RTL',
  'Obstruction @ HFL',
  'Velocity at HFL',
  'Afflux',
  'Regime perimeter',
  'Silt factor',
  'Normal scour depth',
  'Maximum scour depth',
  'Foundation bed level',
  'Recommended foundation depth',
];
// Sheet 4 — Step 3 Structural
const SHEET_4 = [
  'Total dead load',
  'Live load per span',
  'Silt load on deck',
  'Self weight',
  'Total vertical load',
  'Drag force per span',
  'Total drag force',
  'Uplift',
  'Required anchor force',
];
// Sheets 5–7 — drawing title-block fields (§10.1). In the §18 Word report the
// drawings are placeholders (§18.12): the sheet title blocks are rendered by the
// PDF vector sheets, so this group verifies the report *names* the required
// title-block field set. Matched case-insensitively (the narrative uses
// "SCALE"/"SHEET x/y").
const SHEETS_5_7 = ['DRG NO', 'Scale', 'Sheet'];

const CHECKLIST: { sheet: string; items: string[]; ci?: boolean }[] = [
  { sheet: 'Sheet 1 (Cover)', items: SHEET_1 },
  { sheet: 'Sheet 2 (Step 1)', items: SHEET_2 },
  { sheet: 'Sheet 3 (Step 2)', items: SHEET_3 },
  { sheet: 'Sheet 4 (Step 3)', items: SHEET_4 },
  { sheet: 'Sheets 5–7 (Drawings)', items: SHEETS_5_7, ci: true },
];

test('V7 — report completeness: every Section 10 field present', async () => {
  const inputs = defaultInputs;
  const results = computeResults(inputs);
  const buffer = await buildDesignDocxBuffer(inputs, results);
  const text = xmlToText(readZipEntry(buffer, 'word/document.xml'));
  const textLower = text.toLowerCase();

  console.log('=== V7: Section 10 report-field checklist ===');
  const missing: string[] = [];
  let checked = 0;

  for (const group of CHECKLIST) {
    const groupMissing: string[] = [];
    for (const item of group.items) {
      checked++;
      const haystack = group.ci ? textLower : text;
      const needle = group.ci ? item.toLowerCase() : item;
      if (!haystack.includes(needle)) groupMissing.push(item);
    }
    missing.push(...groupMissing.map((m) => `${group.sheet}: ${m}`));
    const ok = group.items.length - groupMissing.length;
    console.log(`${group.sheet.padEnd(24)} ${ok}/${group.items.length} present`);
  }

  const present = checked - missing.length;
  console.log(`\nSection 10 fields present: ${present}/${checked} = ${((present / checked) * 100).toFixed(1)} %`);
  missing.forEach((m) => console.log(`  MISSING ${m}`));

  assert.deepEqual(missing, [], 'V7: 100% of Section 10 report fields must be present');
});
