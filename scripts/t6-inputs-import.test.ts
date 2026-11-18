import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { defaultInputs, computeResults } from '../src/lib/calculations.tsx';
import {
  INPUT_FIELD_DEFINITIONS,
  parseVariableTable,
  buildTemplateRows,
} from '../src/lib/spreadsheet-import.ts';
import { exportDesignPDF } from '../src/lib/pdf-export.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Section 6 N1–N6 variables.
const NEW_KEYS = ['ofl_m', 'lbl_m', 'bottomDeck_m', 'carriageWidth_m', 'sbc_kN_m2', 'd_LBL_depth_m'];

test('T6-01 the six N1-N6 variables are declared with section + unit, and 70R is allowed', () => {
  for (const key of NEW_KEYS) {
    const field = INPUT_FIELD_DEFINITIONS.find((d) => d.key === key);
    assert.ok(field, `missing field definition for ${key}`);
    assert.ok(field!.section, `${key} needs a section`);
    assert.ok(field!.unit, `${key} needs a unit`);
    assert.ok(field!.aliases && field!.aliases.length > 0, `${key} needs CSV aliases`);
  }
  const live = INPUT_FIELD_DEFINITIONS.find((d) => d.key === 'liveLoadType')!;
  assert.equal(live.type, 'enum');
  assert.match(live.description, /IRC Class 70R/);
});

test('T6-02 parseVariableTable reads the 25-set CSV keys and imports Class 70R (sets 18 & 24)', () => {
  const lines = readFileSync(resolve(__dirname, '../test-variables-25-sets.csv'), 'utf8').trim().split(/\r?\n/);
  const header = lines[0].split(',');

  for (const setNo of [18, 24]) {
    const cells = lines[setNo].split(','); // row index == set number (line 0 is the header)
    assert.equal(Number(cells[0]), setNo);
    // Drop the SetID column; keep (variable, value) pairs exactly as the import page does.
    const rows = header.slice(1).map((h, i) => [h, cells[i + 1]]);
    const { patch, warnings } = parseVariableTable(rows);

    assert.equal(patch.liveLoadType, 'IRC Class 70R', `set ${setNo} must import as IRC Class 70R`);
    for (const key of NEW_KEYS) {
      assert.ok(key in patch, `set ${setNo}: ${key} was not imported`);
    }
    assert.equal(warnings.length, 0, `set ${setNo} produced warnings: ${warnings.join('; ')}`);
  }
});

test('T6-03 the extracted-input template lists all six N1-N6 variables', () => {
  const rows = buildTemplateRows();
  const keys = rows.slice(1).map((r) => r[0]);
  for (const key of NEW_KEYS) {
    assert.ok(keys.includes(key), `extracted-input template missing ${key}`);
  }
  assert.equal(rows.length - 1, INPUT_FIELD_DEFINITIONS.length);
});

test('T6-04 the E17 minimum-carriageway rule fires from the calculation engine', () => {
  const ok = computeResults({ ...defaultInputs, carriageWidth_m: 6.0 });
  assert.equal(ok.passMinCarriageWidth_m, true);

  const bad = computeResults({ ...defaultInputs, carriageWidth_m: 5.5 });
  assert.equal(bad.passMinCarriageWidth_m, false);
  assert.match(bad.minCarriageWidthNote, /IRC SP:82-2008 Cl\.6\.4\.2\(vi\)/);
  assert.ok(bad.sanityWarnings.some((w) => /carriageway/i.test(w)));
});

test('T6-05 the compliance summary (sheet 4, 3C) carries the E17 carriageway row', () => {
  const src = readFileSync(resolve(__dirname, '../src/lib/pdf-export.ts'), 'utf8');
  assert.match(src, /3C\. COMPLIANCE SUMMARY/);
  assert.match(src, /Min carriageway width/);
  assert.match(src, /passMinCarriageWidth_m\s*\?\s*'PASS'\s*:\s*'FAIL'/);

  const raw = exportDesignPDF(defaultInputs, computeResults(defaultInputs)).output() as string;
  assert.ok(raw.includes('Min carriageway width'), 'generated PDF must contain the carriageway compliance row');
  // AutoTable silently drops a cell whose text contains glyphs outside the WinAnsi
  // set (e.g. '≥'), so the criterion must stay ASCII for it to reach the report.
  assert.ok(raw.includes('IRC SP:82-2008 Cl.6.4.2'), 'generated PDF carriageway row must cite IRC SP:82-2008 Cl.6.4.2(vi)');
  assert.ok(src.includes("'>= 6.0m (IRC SP:82-2008 Cl.6.4.2(vi))'"), 'criterion cell text must remain ASCII-safe');
});
