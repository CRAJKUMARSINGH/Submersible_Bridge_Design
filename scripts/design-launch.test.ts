import assert from 'node:assert/strict';
import { test } from 'node:test';
import { read, utils, write } from 'xlsx';
import { computeResults, defaultInputs } from '../src/lib/calculations';
import { buildDesignFormulaTrace } from '../src/lib/design-formula-trace';
import { DRAFT_STATUS, getDesignChecks, validateDesignInputs } from '../src/lib/design-review';
import { buildDesignWorkbook } from '../src/lib/workbook-export';

test('Design inputs surface invalid geometry, hydraulic, material and geotechnical values', () => {
  assert.deepEqual(validateDesignInputs(defaultInputs), []);
  const errors = validateDesignInputs({
    ...defaultInputs,
    deckThickness: 0, numSpans: 1.5, runoffCoefficient: 2, hfl: defaultInputs.gl,
    waterDensity: Number.NaN, sbc_kN_m2: 0, siltFactor: 0,
  });
  for (const message of [/deck dimensions/i, /whole number/i, /runoff/i, /flood level/i, /finite/i, /bearing capacity/i, /silt factor/i]) {
    assert.ok(errors.some((error) => message.test(error)), String(message));
  }
});

test('The review reflects only applicable load combinations and exposes failures', () => {
  const inputs = { ...defaultInputs, carriageWidth_m: 5.5 };
  const results = computeResults(inputs);
  const modelCases = results.structural.loadCombinations;
  modelCases.cases = modelCases.cases.map((row) => ({ ...row, safe: !modelCases.exemptIds.includes(row.id) }));
  const find = (name: string) => getDesignChecks(inputs, results).find((row) => row.check === name);
  assert.equal(find('Min carriageway width')?.pass, false);
  assert.equal(find('Applicable load combinations')?.pass, true);
  const applicable = modelCases.cases.find((row) => !modelCases.exemptIds.includes(row.id))!;
  applicable.safe = false;
  assert.deepEqual(find('Applicable load combinations')?.val, `Review ${applicable.id}`);
  assert.equal(find('Applicable load combinations')?.pass, false);
});

test('The serialized Excel report retains draft status, failed checks and the live trace', () => {
  const inputs = { ...defaultInputs, carriageWidth_m: 5.5, liveLoadType: 'IRC Class 70R' as const };
  const results = computeResults(inputs);
  const bytes = write(buildDesignWorkbook(inputs, results), { type: 'buffer', bookType: 'xlsx' });
  const workbook = read(bytes, { type: 'buffer' });
  for (const sheet of Object.values(workbook.Sheets)) assert.equal(sheet.A1.v, DRAFT_STATUS);
  const checks = utils.sheet_to_json<string[]>(workbook.Sheets.Review, { header: 1 });
  assert.equal(checks.find(([name]) => name === 'Min carriageway width')?.[3], 'REVIEW');
  const trace = utils.sheet_to_json<string[]>(workbook.Sheets['Formula trace'], { header: 1 });
  assert.equal(trace.length - 2, buildDesignFormulaTrace(inputs, results).length);
  const cases = utils.sheet_to_json<string[]>(workbook.Sheets['Load combinations'], { header: 1 });
  assert.equal(cases.filter((row) => row[6] === 'NOT REQUIRED').length, 2);
});
