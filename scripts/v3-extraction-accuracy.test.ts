/**
 * scripts/v3-extraction-accuracy.test.ts
 *
 * Task 9 (spec R8, Section 14.3) — V3 PDF extraction accuracy harness.
 *
 * Runs the extractor against the reference PDF and scores the result against the
 * hand-read golden reference set (`data/golden-reference-set.csv`):
 *   Step 1  manual table (golden-reference-set.csv, PR-collected values)
 *   Step 2  automated extraction (extract-pdf-vars.ts)
 *   Step 3  side-by-side compare — numeric within 0.1 % relative, else exact string
 *
 * Rubric (Section 14.3 / Task 9 TR): 0 < 50 %, 1 = 50–94 %, 2 = ≥ 95 %.
 * Pass threshold: 2. Also enforced: ≥ 20 of the 36 recognized inputs extracted.
 *
 * Run: node --import tsx --test ./scripts/v3-extraction-accuracy.test.ts
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractPdfVariables } from './extract-pdf-vars.ts';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const PDF_PATH = resolve(root, 'attached_assets', 'Type Design of submersible causeway.pdf');
const GOLDEN_PATH = resolve(root, 'data', 'golden-reference-set.csv');

/** Minimum inputs that must be recovered (Task 9 TR). */
const MIN_EXTRACTED_INPUTS = 20;
/** Rubric score 2 threshold (Section 14.3). */
const ACCURACY_PASS_RATIO = 0.95;
/** Numeric agreement: 0.1 % relative (the reference values are ~3 s.f.). */
const REL_TOLERANCE = 1e-3;

type GoldenRow = {
  id: string;
  category: string;
  key: string;
  unit: string;
  referenceValue: string;
  status: string;
};

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      cells.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

function parseGoldenReferenceSet(csv: string): GoldenRow[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim() !== '');
  const header = parseCsvLine(lines[0]);
  const index = (name: string) => header.indexOf(name);
  const iId = index('id');
  const iCategory = index('category');
  const iKey = index('key');
  const iUnit = index('unit');
  const iValue = index('reference_value');
  const iStatus = index('status');

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return {
      id: cells[iId].trim(),
      category: cells[iCategory].trim(),
      key: cells[iKey].trim(),
      unit: cells[iUnit].trim(),
      referenceValue: cells[iValue].trim(),
      status: cells[iStatus].trim(),
    };
  });
}

/** Reference values may carry an annotation, e.g. "1000 (10 kN/m3)" or "6.00". */
const LEADING_NUMBER = /^-?\d+(?:\.\d+)?/;

function valuesAgree(actual: unknown, expected: string): boolean {
  const numeric = expected.trim().match(LEADING_NUMBER);
  if (numeric) {
    const want = Number(numeric[0]);
    const got = Number(actual);
    if (!Number.isFinite(got)) return false;
    if (want === 0) return Math.abs(got) <= 1e-9;
    return Math.abs(got - want) / Math.abs(want) <= REL_TOLERANCE;
  }
  return String(actual).trim().toLowerCase() === expected.trim().toLowerCase();
}

test('V3 — PDF extraction accuracy against the golden reference set (Task 9)', async () => {
  const extraction = await extractPdfVariables(PDF_PATH);
  const extracted: Record<string, unknown> = {
    ...extraction.inputs,
    ...extraction.extraVariables,
  };

  const golden = parseGoldenReferenceSet(readFileSync(GOLDEN_PATH, 'utf8'));
  const inputRows = golden.filter((row) => row.id.startsWith('IN-'));

  const scored: { key: string; expected: string; got: string; ok: boolean }[] = [];
  const mismatches: string[] = [];
  const unscored: string[] = [];

  for (const row of inputRows) {
    const reference = row.referenceValue;
    const got = extracted[row.key];
    const sourceSilent =
      row.status === 'NOT-STATED' || reference === '(not stated)' || reference === 'null';

    if (sourceSilent) {
      // Source-silent / nullable reference: not a defect either way. Record if the
      // extractor nevertheless produced a value (e.g. nullable customDesignDischarge).
      if (got !== undefined && reference !== 'null') {
        unscored.push(`${row.key}: extractor produced ${String(got)} but the reference is '${reference}'`);
      }
      continue;
    }

    const ok = got !== undefined && valuesAgree(got, reference);
    scored.push({ key: row.key, expected: reference, got: got === undefined ? '(missing)' : String(got), ok });
    if (!ok) mismatches.push(`${row.key}: got ${got === undefined ? '(missing)' : String(got)}, expected ${reference}`);
  }

  const matched = scored.filter((entry) => entry.ok).length;
  const considered = scored.length;
  const accuracy = considered === 0 ? 0 : matched / considered;
  const rubric = accuracy < 0.5 ? 0 : accuracy < 0.95 ? 1 : 2;

  console.log('');
  console.log('V3 — PDF EXTRACTION ACCURACY (Section 14.3)');
  console.log(`  source   : ${extraction.source}`);
  console.log(`  sha256   : ${extraction.sourceSha256}`);
  console.log(`  pages    : ${extraction.pageCount}`);
  console.log(`  extracted: ${extraction.fieldCount} fields (${Object.keys(extraction.inputs).length} Inputs + ${Object.keys(extraction.extraVariables).length} extra)`);
  console.log('');
  console.log('  key                        extracted        reference       match');
  console.log('  -------------------------- ---------------- --------------- -----');
  for (const entry of scored) {
    console.log(`  ${entry.key.padEnd(26)} ${entry.got.padEnd(16)} ${entry.expected.padEnd(15)} ${entry.ok ? '=' : '\u2260'}`);
  }
  console.log('');
  for (const note of unscored) console.log(`  note: ${note}`);
  console.log(`  accuracy : ${matched}/${considered} = ${(accuracy * 100).toFixed(1)} %  -> rubric score ${rubric}`);

  // Task 9 TR — end-to-end parse must recover at least 20 of the 36 recognized inputs.
  assert.ok(
    extraction.fieldCount >= MIN_EXTRACTED_INPUTS,
    `expected >= ${MIN_EXTRACTED_INPUTS} extracted fields, got ${extraction.fieldCount}`,
  );
  // Rubric — pass threshold is score 2 (>= 95 % of the stated values).
  assert.deepEqual(mismatches, [], `extraction mismatches:\n${mismatches.join('\n')}`);
  assert.ok(
    accuracy >= ACCURACY_PASS_RATIO,
    `V3 accuracy ${(accuracy * 100).toFixed(1)} % below the ${ACCURACY_PASS_RATIO * 100} % pass threshold`,
  );
});
