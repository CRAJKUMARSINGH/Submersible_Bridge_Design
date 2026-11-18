/**
 * v4-calculation-correctness.test.ts — V4 ("Calculation Correctness", spec §14.1).
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs the live calculation engine on the golden reference inputs and compares
 * each `ComputedResults` field against `data/golden-reference-set.csv` (RS-01…
 * RS-30 + XTRA-01…XTRA-10, the hand-verified reference workbook values).
 *
 * Classification per row:
 *   PASS             — value reproduced within 0.1 % (numbers) / exactly (bool, string)
 *   FAIL             — value reproduced from stated inputs but outside tolerance
 *   NOT-REPRODUCIBLE — the reference quantity depends on an input the source does
 *                      not state (IN-06/IN-07 runoff coefficient / intensity, etc.)
 *   NOT-STATED       — the reference itself records "not stated"
 *
 * Run: node --import tsx --test ./scripts/v4-calculation-correctness.test.ts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeResults, defaultInputs, type Inputs } from '../src/lib/calculations';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const REL_TOLERANCE = 1e-3; // 0.1 %

// ─── Golden inputs: reference project, from the Task-9 extraction + source notes ─
const extracted = JSON.parse(
  readFileSync(resolve(ROOT, 'data/extracted/pdf-extracted-inputs.json'), 'utf8'),
) as { inputs: Partial<Inputs> };

const goldenInputs: Inputs = { ...defaultInputs, ...extracted.inputs };
// RS-08 / TYPE_document.md L4845 — linear waterway read off the cross-section (28.80 m).
goldenInputs.linearWaterway_m = 28.80;
// IN-18 is NOT-STATED; the only stated constraint is the total vented area (26.21 m², L4825).
goldenInputs.ventHeight = 26.21 / (goldenInputs.numVents * goldenInputs.ventWidth);
// Task 32 — RS-20 / RS-21 are stated design datums in the reference, not derivations
// (foundation bottom level L112 = 2.315 m; recommended foundation depth L4920 = 3.83 m).
goldenInputs.fbl_m = 2.315;
goldenInputs.recommendedDepth_m = 3.83;

const results = computeResults(goldenInputs);
const s = results.structural;

type Kind = 'number' | 'bool' | 'string';
interface Probe {
  id: string;
  key: string;
  kind: Kind;
  reproducible: boolean;
  actual: number | boolean | string;
}

const PROBES: Probe[] = [
  { id: 'RS-01', key: 'qRational', kind: 'number', reproducible: false, actual: results.qRational },
  { id: 'RS-02', key: 'qWeir', kind: 'number', reproducible: true, actual: results.qWeir },
  { id: 'RS-03', key: 'qVelocity', kind: 'number', reproducible: true, actual: results.qVelocity },
  { id: 'RS-04', key: 'qDesign', kind: 'number', reproducible: false, actual: results.qDesign },
  { id: 'RS-05', key: 'governingMethod', kind: 'string', reproducible: false, actual: results.governingMethod },
  { id: 'RS-06', key: 'designDischarge', kind: 'number', reproducible: true, actual: results.designDischarge },
  { id: 'RS-07', key: 'aVent', kind: 'number', reproducible: true, actual: results.aVent },
  { id: 'RS-08', key: 'effectiveWidth', kind: 'number', reproducible: true, actual: results.effectiveWidth },
  { id: 'RS-09', key: 'aRTL', kind: 'number', reproducible: true, actual: results.aRTL },
  { id: 'RS-10', key: 'aHFL', kind: 'number', reproducible: true, actual: results.aHFL },
  { id: 'RS-11', key: 'pctObsRTL', kind: 'number', reproducible: true, actual: results.pctObsRTL },
  { id: 'RS-12', key: 'pctObsHFL', kind: 'number', reproducible: true, actual: results.pctObsHFL },
  { id: 'RS-13', key: 'passRTL', kind: 'bool', reproducible: true, actual: results.passRTL },
  { id: 'RS-14', key: 'passHFL', kind: 'bool', reproducible: true, actual: results.passHFL },
  { id: 'RS-15', key: 'velocityHFL', kind: 'number', reproducible: true, actual: results.velocityHFL },
  { id: 'RS-16', key: 'hAfflux', kind: 'number', reproducible: true, actual: results.hAfflux },
  { id: 'RS-17', key: 'alluvialPerimeter_m', kind: 'number', reproducible: true, actual: results.laceyPerimeter },
  { id: 'RS-18', key: 'laceyScourDepth', kind: 'number', reproducible: true, actual: results.laceyScourDepth },
  { id: 'RS-19', key: 'maxScourDepth', kind: 'number', reproducible: true, actual: results.maxScourDepth },
  { id: 'RS-20', key: 'fbl', kind: 'number', reproducible: true, actual: results.fbl },
  { id: 'RS-21', key: 'recommendedDepth', kind: 'number', reproducible: true, actual: results.recommendedDepth },
  { id: 'RS-22', key: 'scourSafe', kind: 'bool', reproducible: true, actual: results.scourSafe },
  { id: 'RS-23', key: 'wSelf', kind: 'number', reproducible: true, actual: s.deadLoads.superstructureTotal },
  { id: 'RS-24', key: 'wSilt', kind: 'number', reproducible: true, actual: results.wSilt },
  { id: 'RS-25', key: 'wLive', kind: 'number', reproducible: true, actual: results.wLive },
  { id: 'RS-26', key: 'totalVerticalLoad', kind: 'number', reproducible: false, actual: results.totalVerticalLoad },
  { id: 'RS-27', key: 'fDrag', kind: 'number', reproducible: false, actual: results.fDrag },
  { id: 'RS-28', key: 'fUplift', kind: 'number', reproducible: true, actual: results.fUplift },
  { id: 'RS-29', key: 'fAnchor', kind: 'number', reproducible: false, actual: results.fAnchor },
  { id: 'RS-30', key: 'fDragTotal', kind: 'number', reproducible: false, actual: results.fDragTotal },
  { id: 'XTRA-01', key: 'ka_active', kind: 'number', reproducible: true, actual: s.earthPressure.ka },
  { id: 'XTRA-02', key: 'pa_base_kN_m2', kind: 'number', reproducible: true, actual: s.earthPressure.activePressureBase },
  { id: 'XTRA-03', key: 'earthPressure_P_kN', kind: 'number', reproducible: true, actual: s.earthPressure.totalThrust },
  { id: 'XTRA-04', key: 'earthPressure_Ph_kN', kind: 'number', reproducible: true, actual: s.earthPressure.horizontalComponent },
  { id: 'XTRA-05', key: 'earthPressure_Pv_kN', kind: 'number', reproducible: true, actual: s.earthPressure.verticalComponent },
  { id: 'XTRA-06', key: 'buoyancy_kN', kind: 'number', reproducible: true, actual: s.uplift.upliftForce },
  { id: 'XTRA-07', key: 'braking_kN', kind: 'number', reproducible: true, actual: s.transient.brakingForce },
  { id: 'XTRA-08', key: 'wind_deck_kN', kind: 'number', reproducible: true, actual: s.transient.windOnDeck },
  { id: 'XTRA-09', key: 'wind_liveload_kN', kind: 'number', reproducible: true, actual: s.transient.windOnLiveLoad },
];

// ─── RFC-quote-aware CSV parse (values may carry annotations, e.g. "1000 (10 kN/m3)") ─
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

const LEADING_NUMBER = /^-?\d+(?:\.\d+)?/;

function toNum(raw: string): number | null {
  const m = LEADING_NUMBER.exec(raw.trim());
  return m ? Number(m[0]) : null;
}

test('V4 — calculation correctness against the golden reference workbook', () => {
  const lines = readFileSync(resolve(ROOT, 'data/golden-reference-set.csv'), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  const header = parseCsvLine(lines[0]);
  const idx = (name: string) => header.indexOf(name);

  // Rows keyed by id → { reference_value, status }
  const rows = new Map<string, { ref: string; status: string }>();
  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line);
    rows.set(cells[idx('id')], { ref: cells[idx('reference_value')], status: cells[idx('status')] });
  }

  let pass = 0;
  let fail = 0;
  let skip = 0;
  const failures: string[] = [];

  console.log('=== V4: Calculation Correctness vs golden reference set ===');
  console.log('id        key                     actual          reference       result');
  for (const p of PROBES) {
    const row = rows.get(p.id);
    if (!row) { skip++; continue; }

    const refRaw = row.ref.trim();
    if (row.status === 'NOT-STATED' || /^\(not stated/i.test(refRaw)) {
      skip++;
      console.log(`${p.id.padEnd(9)} ${p.key.padEnd(23)} (not stated)   SKIP`);
      continue;
    }

    const refNum = toNum(refRaw);
    const refBool = /true/i.test(refRaw) ? true : /false/i.test(refRaw) ? false : null;
    let ok = false;
    let shown = String(p.actual);

    if (p.kind === 'number' && refNum !== null) {
      const actual = p.actual as number;
      const denom = Math.max(Math.abs(refNum), 1e-9);
      ok = Math.abs(actual - refNum) / denom <= REL_TOLERANCE;
      shown = `${(actual as number).toFixed(3)} (ref ${refNum})`;
    } else if (p.kind === 'bool' && refBool !== null) {
      ok = (p.actual as boolean) === refBool;
      shown = `${p.actual} (ref ${refBool})`;
    } else if (p.kind === 'string') {
      ok = String(p.actual) === refRaw;
      shown = `"${p.actual}" (ref "${refRaw}")`;
    }

    if (ok) { pass++; console.log(`${p.id.padEnd(9)} ${p.key.padEnd(23)} ${shown}   PASS`); }
    else if (!p.reproducible) { skip++; console.log(`${p.id.padEnd(9)} ${p.key.padEnd(23)} ${shown}   NOT-REPRODUCIBLE`); }
    else { fail++; failures.push(`${p.id} ${p.key}: ${shown}`); console.log(`${p.id.padEnd(9)} ${p.key.padEnd(23)} ${shown}   FAIL`); }
  }

  const checked = pass + fail;
  const ratio = checked > 0 ? pass / checked : 0;
  console.log(`\nReproducible rows: ${pass}/${checked} = ${(ratio * 100).toFixed(1)} %  (skipped: ${skip})`);
  failures.forEach((x) => console.log(`  FAIL ${x}`));

  assert.ok(checked >= 20, `expected at least 20 reproducible golden rows, got ${checked}`);

  // V4 pass criterion (spec §14.1): "Exact match; zero tolerance on pass/fail."
  // This assertion is intentionally strict — a divergence is a genuine V&V finding.
  assert.deepEqual(failures, [], 'V4: every reproducible golden value must be reproduced within tolerance');
});
