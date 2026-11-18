/**
 * v9-load-combinations.test.ts — V9 ("Load Combination Coverage", spec §14.1).
 * ─────────────────────────────────────────────────────────────────────────────
 * Pass criterion (spec §14.1 V9): "≥10/12 combinations evaluated with results",
 * measured by listing the applied combinations against the 12 required by
 * IRC 6:2000 Cl.202.
 *
 * `data/load-combination-coverage.csv` is the applied-vs-required matrix. Every
 * row marked EVALUATED must point at a real engine output (`result_source`) that
 * resolves to a finite number — so the matrix cannot claim coverage it does not
 * have. Rows that are NOT-REQUIRED (e.g. seismic at a Zone-I site) are excluded
 * from the denominator.
 *
 * Run: node --import tsx --test ./scripts/v9-load-combinations.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeResults, defaultInputs, type ComputedResults } from '../src/lib/calculations';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const REQUIRED_COMBINATIONS = 12;
const REQUIRED_EVALUATED = 10; // spec §14.1 V9

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) {
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQ = false;
        else cur += c;
      } else if (c === '"') inQ = true;
      else if (c === ',') { cells.push(cur); cur = ''; }
      else cur += c;
    }
    cells.push(cur);
    const row: Record<string, string> = {};
    header.forEach((h, i) => { row[h] = (cells[i] ?? '').trim(); });
    return row;
  });
}

const STATUSES = new Set(['EVALUATED', 'PARTIAL', 'NOT-EVALUATED', 'NOT-REQUIRED']);

/** Resolve a `result_source` path against the live results.
 *  `results.<path>` traverses ComputedResults; a bare `<path>` traverses StructuralResults. */
function resolveSource(results: ComputedResults, path: string): number | undefined {
  const fromResults = path.startsWith('results.');
  const segments = (fromResults ? path.slice('results.'.length) : path).split('.');
  let node: unknown = fromResults ? results : results.structural;
  for (const segment of segments) {
    if (node === null || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[segment];
  }
  return typeof node === 'number' && Number.isFinite(node) ? node : undefined;
}

test('V9 — load combination coverage vs IRC 6:2000 Cl.202', () => {
  const results = computeResults(defaultInputs);
  const rows = parseCsv(readFileSync(resolve(ROOT, 'data/load-combination-coverage.csv'), 'utf8'));

  console.log('=== V9: load-combination coverage ===');
  assert.equal(rows.length, REQUIRED_COMBINATIONS, `expected ${REQUIRED_COMBINATIONS} combinations, found ${rows.length}`);

  let evaluated = 0;
  let partial = 0;
  let notEvaluated = 0;
  let notRequired = 0;
  const claimed: string[] = [];

  for (const row of rows) {
    assert.ok(STATUSES.has(row.status), `V9: row ${row.combination_id} has unrecognised status "${row.status}"`);

    if (row.status === 'EVALUATED') {
      evaluated++;
      const value = resolveSource(results, row.result_source);
      assert.ok(
        value !== undefined,
        `V9: ${row.combination_id} claims EVALUATED via "${row.result_source}" but that path does not resolve to a finite engine output`,
      );
      claimed.push(`${row.combination_id} -> ${row.result_source} = ${value}`);
    } else if (row.status === 'PARTIAL') {
      partial++;
      // A PARTIAL row must still name the constituent output it relies on.
      assert.ok(resolveSource(results, row.result_source) !== undefined, `V9: ${row.combination_id} PARTIAL source must resolve`);
    } else if (row.status === 'NOT-EVALUATED') {
      notEvaluated++;
    } else {
      notRequired++;
    }
  }

  const required = rows.length - notRequired;
  const coverage = evaluated / required;
  console.log(claimed.map((c) => `  EVALUATED ${c}`).join('\n'));
  console.log(
    `EVALUATED ${evaluated}, PARTIAL ${partial}, NOT-EVALUATED ${notEvaluated}, NOT-REQUIRED ${notRequired}`,
  );
  console.log(
    `\nRequired combinations: ${required} (of ${rows.length}); fully evaluated: ${evaluated}/${required} = ${(coverage * 100).toFixed(0)} %` +
    `  |  criterion: >= ${REQUIRED_EVALUATED}/${REQUIRED_COMBINATIONS}`,
  );

  assert.ok(
    evaluated >= REQUIRED_EVALUATED,
    `V9: at least ${REQUIRED_EVALUATED}/${REQUIRED_COMBINATIONS} IRC 6:2000 Cl.202 combinations must be evaluated with results (found ${evaluated})`,
  );
});
