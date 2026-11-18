// C.3 STRUCTURAL DESIGN engine — Tasks 11–17 unit tests.
// Same framework-free harness style as scripts/calculations.test.ts.
// Reference values are cross-checked against data/extracted/TYPE_document.md.

import {
  computeStructural,
  coulombKa,
  astFromMoment,
  bearingPressure,
  FOS_SLIDING_MIN,
  FOS_OVERTURNING_MIN,
} from '../src/lib/structural.ts';
import { computeResults, defaultInputs, type Inputs } from '../src/lib/calculations.tsx';

// ============================================================
// SIMPLE TEST HARNESS
// ============================================================
let totalTests = 0;
let totalPassed = 0;
const failures: Array<{ id: string; message: string; stack?: string }> = [];

function test(id: string, fn: () => void): void {
  totalTests++;
  try {
    fn();
    totalPassed++;
    console.log(`PASS  ${id}`);
  } catch (err: any) {
    failures.push({
      id,
      message: err?.message ?? String(err),
      stack: err?.stack,
    });
    console.log(`FAIL  ${id}  —  ${err?.message ?? err}`);
  }
}

function assertApprox(actual: number, expected: number, eps: number = 1e-3, msg?: string): void {
  if (!Number.isFinite(actual) || Math.abs(actual - expected) > eps) {
    throw new Error(`${msg ?? 'assertApprox'}: expected ${expected} (±${eps}), got ${actual}`);
  }
}

function assertExact(actual: number, expected: number, msg?: string): void {
  if (actual !== expected) {
    throw new Error(`${msg ?? 'assertExact'}: expected ${expected}, got ${actual}`);
  }
}

function assertTrue(cond: boolean, msg?: string): void {
  if (!cond) throw new Error(`${msg ?? 'assertTrue'}: expected truthy, got ${cond}`);
}

function assertFalse(cond: boolean, msg?: string): void {
  if (cond) throw new Error(`${msg ?? 'assertFalse'}: expected falsy, got ${cond}`);
}

// ============================================================
// FIXTURES
// ============================================================
// The default Inputs carry the document's preliminary section
// (carriageway 6.0 m, deck slab 0.480 m, deck slab length 6.8 m, RCC 25 kN/m³,
// substructure 24 kN/m³, backfill 18 kN/m³), so they reproduce the source design.
const inputs: Inputs = defaultInputs;
const hydraulic = computeResults(inputs);
const results = computeStructural(inputs, hydraulic);

// ============================================================
// TASK 11 — DEAD LOAD
// ============================================================

test('ST-01 Coulomb Ka(φ=30, α=90, β=0, δ=15) ≈ 0.30 (±0.005)', () => {
  const ka = coulombKa(30, 90, 0, 15);
  assertApprox(ka, 0.30, 0.005, 'Coulomb Ka');
});

test('ST-02 Dead load — superstructure 244.80 / 55.50 / 38.25, Σ=338.55 kN', () => {
  const dl = results.deadLoads;
  assertApprox(dl.deckSlab, 244.80, 1e-6, 'deck slab');
  assertApprox(dl.dirtWall, 55.50, 1e-6, 'dirt wall');
  assertApprox(dl.wearingCoat, 38.25, 1e-6, 'wearing coat');
  assertApprox(dl.superstructureTotal, 338.55, 1e-6, 'superstructure total');
});

test('ST-03 Dead load — substructure 155.52 / 58.32 / 64.80 / 71.28, Σ=349.92 kN', () => {
  const dl = results.deadLoads;
  assertApprox(dl.abutmentShaft, 155.52, 1e-6, 'abutment shaft');
  assertApprox(dl.footing1, 58.32, 1e-6, 'footing 1');
  assertApprox(dl.footing2, 64.80, 1e-6, 'footing 2');
  assertApprox(dl.footing3, 71.28, 1e-6, 'footing 3');
  assertApprox(dl.substructureTotal, 349.92, 1e-6, 'substructure total');
});

test('ST-04 Dead-load total (default Inputs) = 688.47 kN = Sh + Sb', () => {
  const dl = results.deadLoads;
  assertApprox(dl.totalDeadLoad, 688.47, 1e-6, 'total dead load');
  assertApprox(dl.totalDeadLoad, dl.superstructureTotal + dl.substructureTotal, 1e-9, 'sum check');
  assertTrue(Number.isFinite(dl.totalDeadLoad) && dl.totalDeadLoad > 0);
});

// ============================================================
// TASK 12 — EARTH PRESSURE (COULOMB)
// ============================================================

test('ST-05 Earth pressure ≈ P=69.98, Ph=67.60, Pv=18.10 kN, lever 0.53 m', () => {
  const ep = results.earthPressure;
  // The document rounds the Coulomb Ka to 0.3 (P=69.98); the engine keeps the
  // exact Ka≈0.3014, so the magnitudes sit within ~0.5% of the rounded figures.
  assertApprox(ep.totalThrust, 69.98, 0.5, 'total P');
  assertApprox(ep.horizontalComponent, 67.60, 0.5, 'Ph');
  assertApprox(ep.verticalComponent, 18.10, 0.2, 'Pv');
  assertApprox(ep.leverArmFromBase, 0.53, 5e-3, 'lever arm');
});

test('ST-06 Passive coefficient Kp = 1/Ka', () => {
  const ep = results.earthPressure;
  assertApprox(ep.kp, 1 / ep.ka, 1e-9, 'Kp');
});

// ============================================================
// TASK 13/14 — STABILITY & BEARING
// ============================================================

test('ST-07 FOS sliding & overturning finite and > 0', () => {
  const st = results.stability;
  assertTrue(Number.isFinite(st.fosSliding) && st.fosSliding > 0, `fosSliding=${st.fosSliding}`);
  assertTrue(
    Number.isFinite(st.fosOverturning) && st.fosOverturning > 0,
    `fosOverturning=${st.fosOverturning}`,
  );
  assertTrue(FOS_SLIDING_MIN === 1.5 && FOS_OVERTURNING_MIN === 2.0, 'threshold constants');
});

test('ST-08 Bearing pressure symmetric about P/A when e=0', () => {
  const r = bearingPressure(147.15, 9.9, 0, 1.65);
  assertApprox(r.pMax, 147.15 / 9.9, 1e-9, 'p_max');
  assertApprox(r.pMin, r.pMax, 1e-12, 'symmetry');
  assertApprox(r.sixEOverB, 0, 1e-12, '6e/b');
});

test('ST-09 Bearing reports p_max, p_min, 6e/b and SBC utilisation', () => {
  const b = results.bearing;
  assertTrue(Number.isFinite(b.pMax) && Number.isFinite(b.pMin));
  assertTrue(Number.isFinite(b.sixEOverB));
  assertApprox(b.sbcUtilisation, (b.pMax / b.sbc) * 100, 1e-9, 'utilisation');
  assertTrue(typeof b.noTension === 'boolean' && typeof b.bearingSafe === 'boolean');
});

// ============================================================
// TASK 15 — REINFORCEMENT
// ============================================================

test('ST-10 astFromMoment returns a positive finite area for a valid section', () => {
  const ast = astFromMoment(50, 1000, 400, 25, 415);
  assertTrue(Number.isFinite(ast) && ast > 0, `ast=${ast}`);
});

test('ST-11 Reinforcement exposes stem + deck slab with Ast_req and Ast_min', () => {
  const r = results.reinforcement;
  for (const s of [r.stem, r.deckSlab]) {
    assertTrue(Number.isFinite(s.effectiveDepthMm) && s.effectiveDepthMm > 0, 'effective depth');
    assertApprox(s.ultimateMoment, 1.5 * s.serviceMoment, 1e-9, 'Mu = 1.5·M');
    assertTrue(s.astGoverns >= s.astMin - 1e-9, 'Ast governs ≥ minimum');
  }
});

// ============================================================
// TASK 16 — TRANSIENT LOADS
// ============================================================

test('ST-12 Braking = 47.84 kN and wind on live load = 18.00 kN', () => {
  const tr = results.transient;
  assertApprox(tr.brakingForce, 47.84, 5e-3, 'braking');
  assertApprox(tr.windOnLiveLoad, 18.00, 1e-9, 'wind on live load');
});

test('ST-13 Wind on deck ≈ 3.86 kN (50% perforation)', () => {
  assertApprox(results.transient.windOnDeck, 3.86, 5e-3, 'wind on deck');
});

test('ST-14 Seismic Zone-I → not required, force = 0 (IRC:6-2000 Cl.222.1)', () => {
  const tr = computeStructural({ ...inputs, seismicZone: 'I' }, hydraulic).transient;
  assertFalse(tr.seismicRequired, 'Zone-I not required');
  assertExact(tr.seismicForce, 0);
});

// ============================================================
// TASK 17 — UPLIFT / ANCHOR / THRUST
// ============================================================

test('ST-15 Uplift = 145.80 kN for a 14.58 m³ displacement (IRC:6-2000 Cl.216.4)', () => {
  const u = results.uplift;
  assertApprox(u.submergedVolume, 14.58, 1e-6, 'submerged volume');
  assertApprox(u.upliftForce, 145.80, 1e-6, 'uplift force');
});

test('ST-16 Anchor check: required resistance = max(0, uplift − 0.9·dead) and FOS ≥ 0', () => {
  const u = results.uplift;
  assertApprox(u.submergedDeadWeight, 0.9 * results.deadLoads.totalDeadLoad, 1e-9, '0.9·W');
  assertApprox(
    u.anchorResistanceRequired,
    Math.max(0, u.upliftForce - u.submergedDeadWeight),
    1e-9,
    'required anchor resistance',
  );
  assertTrue(Number.isFinite(u.fosAnchor) && u.fosAnchor >= 0, 'anchor FOS');
  assertTrue(Number.isFinite(u.thrustBlockSafetyRatio), 'thrust block safety ratio');
});

// ============================================================
// PURITY / ROBUSTNESS
// ============================================================

test('ST-17 Pure: same inputs → identical outputs (no side effects)', () => {
  const a = computeStructural(inputs, hydraulic);
  const b = computeStructural(inputs, hydraulic);
  assertExact(a.deadLoads.totalDeadLoad, b.deadLoads.totalDeadLoad);
  assertExact(a.earthPressure.ka, b.earthPressure.ka);
  assertExact(a.uplift.upliftForce, b.uplift.upliftForce);
});

test('ST-18 Missing optional fields fall back to safe defaults', () => {
  const sparse = { ...defaultInputs } as Inputs;
  delete (sparse as Record<string, unknown>).wallAngleAlpha;
  delete (sparse as Record<string, unknown>).brakingLiveLoad_kN;
  const s = computeStructural(sparse, hydraulic);
  assertApprox(s.earthPressure.ka, 0.3014, 5e-3, 'default Ka');
  assertApprox(s.transient.brakingForce, 47.84, 5e-3, 'default braking');
});

// ============================================================
// FOOTER — summary + exit code
// ============================================================
console.log('');
console.log('='.repeat(60));
console.log(`TOTAL TESTS RUN : ${totalTests}`);
console.log(`TOTAL PASSED    : ${totalPassed} / ${totalTests}`);
console.log(`TOTAL FAILED    : ${totalTests - totalPassed}`);
console.log('='.repeat(60));

if (failures.length > 0) {
  console.error('\nFAILURES DETAIL:');
  for (const f of failures) {
    console.error(`\n  ❌ ${f.id}`);
    console.error(`     ${f.message}`);
    if (f.stack) console.error(`     ${f.stack.split('\n').slice(1).join('\n     ')}`);
  }
}

const ALL_PASS_EXPECTED = totalTests;
process.exit(totalPassed === ALL_PASS_EXPECTED ? 0 : 1);
