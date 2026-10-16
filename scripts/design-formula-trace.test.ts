import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultInputs, type ComputedResults } from '../src/lib/calculations.tsx';
import { buildDesignFormulaTrace } from '../src/lib/design-formula-trace.ts';

const sampleResults: ComputedResults = {
  qRational: 125,
  qWeir: 9.46,
  qVelocity: 54,
  qDesign: 125,
  governingMethod: 'Rational Method',
  designDischarge: 125,
  aVent: 5.4,
  effectiveWidth: 104.167,
  aRTL: 125,
  aHFL: 260.417,
  pctObsRTL: 95.68,
  pctObsHFL: 97.93,
  passRTL: false,
  passHFL: false,
  velocityHFL: 0.48,
  hAfflux: 0.008,
  laceyPerimeter: 53.106,
  laceyScourDepth: 2.36,
  maxScourDepth: 2.997,
  fbl: 99.503,
  recommendedDepth: 0.497,
  scourSafe: false,
  passMinCarriageWidth_m: true,
  minCarriageWidthNote: 'PASS: 7.500m ≥ 6.0m minimum',
  sanityWarnings: [],
  wSelf: 55.17,
  wSilt: 10.8,
  wLive: 554,
  totalVerticalLoad: 158.303,
  fDrag: 0.052,
  fUplift: 40.5,
  fAnchor: -14.67,
  fDragTotal: 0.312,
};

test('formula trace includes the complete current app calculation set', () => {
  const rows = buildDesignFormulaTrace(defaultInputs, sampleResults);
  assert.equal(rows.length, 26);
  assert.equal(new Set(rows.map((row) => row.id)).size, rows.length);
  assert.ok(rows.every((row) => row.equation.length > 0 && row.result.length > 0));
  const liveLoad = rows.find((row) => row.id === 'W_LIVE')!;
  assert.match(liveLoad.equation, /app constant/);
  assert.match(liveLoad.substitution, /554 kN/);
});

test('changing an input changes its live substitution and reported result without changing the formula', () => {
  const initial = buildDesignFormulaTrace(defaultInputs, sampleResults);
  const revisedInputs = { ...defaultInputs, rainfallIntensity: 100 };
  const revisedResults = {
    ...sampleResults,
    qRational: 156.25,
    qDesign: 156.25,
    designDischarge: 156.25,
    governingMethod: 'Rational Method',
  };
  const revised = buildDesignFormulaTrace(revisedInputs, revisedResults);
  const oldRow = initial.find((row) => row.id === 'Q_RATIONAL')!;
  const newRow = revised.find((row) => row.id === 'Q_RATIONAL')!;

  assert.equal(newRow.equation, oldRow.equation);
  assert.match(newRow.substitution, /100\.00/);
  assert.notEqual(newRow.result, oldRow.result);
});

test('custom discharge is shown as an override, not as the calculated governing value', () => {
  const customInputs = { ...defaultInputs, customDesignDischarge: 88 };
  const customResults = { ...sampleResults, designDischarge: 88 };
  const row = buildDesignFormulaTrace(customInputs, customResults).find((item) => item.id === 'Q_SELECTED');

  assert.ok(row);
  assert.match(row.substitution, /custom override = 88\.000/);
  assert.equal(row.result, '88.000');
});