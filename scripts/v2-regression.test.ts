/**
 * v2-regression.test.ts — V2 ("Regression Tests (25 sets)", spec §14.1).
 * ─────────────────────────────────────────────────────────────────────────────
 * Feeds the 25-set variable CSV (`test-variables-25-sets.csv`) through the app's
 * REAL import path (`parseVariableTable`, `src/lib/spreadsheet-import.ts`) and
 * the live engine (`computeResults`), then takes a SHA-256 checksum of each
 * set's canonical `ComputedResults` serialization.
 *
 * Pass criterion (spec §14.1 V2): "Unchanged golden-master OR bounded diff
 * < 0.01 %". This harness implements the stricter unchanged-golden-master form:
 *   - every set must run without throwing,
 *   - the run must be deterministic (two passes → identical checksums),
 *   - each checksum must equal the committed master in
 *     `scripts/v2-golden-checksums.json` (created on first run if absent).
 *
 * Run: node --import tsx --test ./scripts/v2-regression.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeResults, defaultInputs, type Inputs } from '../src/lib/calculations';
import { parseVariableTable } from '../src/lib/spreadsheet-import';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CSV_PATH = resolve(ROOT, 'test-variables-25-sets.csv');
const MASTER_PATH = resolve(__dirname, 'v2-golden-checksums.json');

// ─── CSV parse (values are simple; live-load label carries a space) ──────────
function splitCsvLine(line: string): string[] {
  return line.split(',').map((c) => c.trim());
}

/** Canonical, order-stable serialization of the full ComputedResults tree. */
function canonicalize(value: unknown): string {
  if (typeof value === 'number') return Number.isFinite(value) ? value.toFixed(6) : 'NaN';
  if (typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize((value as Record<string, unknown>)[k])}`).join(',')}}`;
  }
  return String(value);
}

function checksum(results: unknown): string {
  return createHash('sha256').update(canonicalize(results)).digest('hex');
}

function buildInputs(header: string[], row: string[]): { inputs: Inputs; warnings: string[] } {
  const verticalRows = header.map((h, i) => [h, row[i] ?? '']);
  const parsed = parseVariableTable(verticalRows);
  return { inputs: { ...defaultInputs, ...parsed.patch }, warnings: parsed.warnings };
}

test('V2 — 25-set regression: deterministic results match the golden checksum master', () => {
  const lines = readFileSync(CSV_PATH, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  const header = splitCsvLine(lines[0]);
  const dataRows = lines.slice(1);

  console.log('=== V2: 25-set regression checksums ===');
  assert.equal(dataRows.length, 25, `expected 25 regression sets, found ${dataRows.length}`);

  const sumsPass1 = new Map<string, string>();
  const sumsPass2 = new Map<string, string>();

  for (const line of dataRows) {
    const cells = splitCsvLine(line);
    const setId = cells[0];

    // Pass 1 — real import path + live engine.
    const { inputs } = buildInputs(header, cells);
    const a = checksum(computeResults(inputs));
    sumsPass1.set(setId, a);

    // Pass 2 — determinism guard (same inputs ⇒ identical output).
    const b = checksum(computeResults(inputs));
    sumsPass2.set(setId, b);
  }

  // Cross-check a Step-1 derivation for set 01 so the master is not trusted blindly.
  {
    const cells = splitCsvLine(dataRows[0]);
    const { inputs } = buildInputs(header, cells);
    const r = computeResults(inputs);
    const expectedQRational = (inputs.runoffCoefficient * inputs.rainfallIntensity * inputs.catchmentArea) / 3.6;
    const expectedQVelocity = inputs.streamAreaHFL * inputs.meanVelocityHFL;
    assert.ok(Math.abs(r.qRational - expectedQRational) < 1e-9, 'Set 01 qRational must match C·I·A/3.6');
    assert.ok(Math.abs(r.qVelocity - expectedQVelocity) < 1e-9, 'Set 01 qVelocity must match A·V');
  }

  // Determinism.
  const nonDeterministic: string[] = [];
  for (const [id, a] of sumsPass1) {
    if (sumsPass2.get(id) !== a) nonDeterministic.push(id);
  }
  assert.deepEqual(nonDeterministic, [], 'V2: results must be deterministic across runs');

  // Golden master compare (create on first run).
  if (!existsSync(MASTER_PATH)) {
    const master = {
      note: 'V2 golden-master checksums — SHA-256 of canonical ComputedResults per 25-set regression set.',
      source: 'test-variables-25-sets.csv',
      sets: Object.fromEntries([...sumsPass1.entries()].sort()),
    };
    writeFileSync(MASTER_PATH, `${JSON.stringify(master, null, 2)}\n`, 'utf8');
    console.log(`Golden master CREATED at ${MASTER_PATH} (first run)`);
  }

  const master = JSON.parse(readFileSync(MASTER_PATH, 'utf8')) as { sets: Record<string, string> };
  const drift: string[] = [];
  for (const [id, sha] of sumsPass1) {
    const expected = master.sets[id];
    if (expected !== sha) drift.push(`set ${id}: ${sha.slice(0, 12)} ≠ master ${String(expected).slice(0, 12)}`);
  }
  sumsPass1.forEach((sha, id) => console.log(`set ${id.padStart(2, '0')}  ${sha.slice(0, 16)}`));

  assert.deepEqual(drift, [], 'V2: every 25-set result must match the committed golden checksum master');
  console.log(`\nV2: 25/25 sets deterministic and unchanged vs golden master.`);
});
