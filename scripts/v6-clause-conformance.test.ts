/**
 * v6-clause-conformance.test.ts — V6 ("Code-Clause Conformance", spec §14.1).
 * ─────────────────────────────────────────────────────────────────────────────
 * Pass criterion (spec §14.1 V6): "Every formula has a clause ID", measured as a
 * "clause-text → formula → result traceability matrix".
 *
 * Two coverage layers are checked:
 *   1. STRUCTURAL COMPLETENESS — every live formula emitted by
 *      `buildDesignFormulaTrace()` appears in `data/clause-traceability-matrix.csv`,
 *      and all 20 PE decisions E1–E20 carry a non-empty code/clause field.
 *   2. CLAUSE-DEPTH — how many of those formulas carry an *explicit* IRC/IS clause
 *      number (status = EXACT) versus only a general code reference, a
 *      source-silent entry, or not-applicable. The distribution is printed so the
 *      residual is auditable rather than hidden.
 *
 * Run: node --import tsx --test ./scripts/v6-clause-conformance.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDesignFormulaTrace } from '../src/lib/design-formula-trace';
import { computeResults, defaultInputs } from '../src/lib/calculations';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    // Simple RFC-ish split that tolerates quoted commas.
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

test('V6 — clause conformance: every formula traceable, E1–E20 stamped', () => {
  const trace = buildDesignFormulaTrace(defaultInputs, computeResults(defaultInputs));
  const traceIds = trace.map((r) => r.id);

  const matrix = parseCsv(readFileSync(resolve(ROOT, 'data/clause-traceability-matrix.csv'), 'utf8'));
  const matrixById = new Map(matrix.map((r) => [r.formula_id, r]));

  console.log('=== V6: clause-traceability matrix ===');
  console.log(`Live trace formulas: ${traceIds.length}`);

  // Layer 1a — every live formula ID is mapped.
  const unmapped = traceIds.filter((id) => !matrixById.has(id));
  assert.deepEqual(unmapped, [], `V6: every formula must appear in the clause matrix; unmapped: ${unmapped.join(', ')}`);

  // Layer 1b — every matrix row has a clause field and an evidence anchor.
  const emptyClause = matrix.filter((r) => !r.clause_reference).map((r) => r.formula_id);
  const emptyEvidence = matrix.filter((r) => !r.source_evidence).map((r) => r.formula_id);
  assert.deepEqual(emptyClause, [], 'V6: every matrix row must carry a clause_reference');
  assert.deepEqual(emptyEvidence, [], 'V6: every matrix row must carry source_evidence');

  // Layer 1c — E1–E20 all present with a code/clause field.
  const decisions = parseCsv(readFileSync(resolve(ROOT, 'data/engineering-decisions-e1-e20.csv'), 'utf8'));
  assert.equal(decisions.length, 20, `expected 20 engineering decisions, found ${decisions.length}`);
  const expectedIds = Array.from({ length: 20 }, (_, i) => `E${i + 1}`);
  assert.deepEqual(decisions.map((d) => d.id).sort(), [...expectedIds].sort(), 'V6: decision ids must be E1…E20');
  const noClause = decisions.filter((d) => !d.code_clause).map((d) => d.id);
  assert.deepEqual(noClause, [], 'V6: every E-decision must carry a code_clause field');

  // Layer 2 — clause depth distribution (report; not a hard gate by itself).
  const byStatus: Record<string, string[]> = {};
  for (const r of matrix) (byStatus[r.status] ??= []).push(r.formula_id);
  for (const [status, ids] of Object.entries(byStatus).sort()) {
    console.log(`${status.padEnd(15)} ${String(ids.length).padStart(2)}  ${ids.join(', ')}`);
  }

  const exact = (byStatus['EXACT'] ?? []).length;
  const general = (byStatus['GENERAL-ONLY'] ?? []).length;
  const silent = (byStatus['SOURCE-SILENT'] ?? []).length;
  const pending = (byStatus['PENDING'] ?? []).length;
  const na = (byStatus['NOT-APPLICABLE'] ?? []).length;
  assert.equal(exact + general + silent + pending + na, matrix.length, 'V6: every matrix row must carry a recognised status');

  const withClause = exact + general;
  console.log(
    `\nExplicit clause number: ${exact}/${matrix.length} = ${((exact / matrix.length) * 100).toFixed(1)} %` +
    `  |  code-cited (EXACT+GENERAL): ${withClause}/${matrix.length} = ${((withClause / matrix.length) * 100).toFixed(1)} %`,
  );
  console.log(`SOURCE-SILENT: ${silent}, PENDING: ${pending}, NOT-APPLICABLE: ${na}`);

  // The spec ideal is "every formula has a clause ID"; the explicit-clause rate is
  // reported for the reviewer (Task 19 materializes any residual as a finding).
  assert.ok(traceIds.length >= 20, `expected >= 20 traced formulas, found ${traceIds.length}`);
});
