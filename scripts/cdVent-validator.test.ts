import { parseVariableTable } from '../src/lib/spreadsheet-import.ts';

let allPassed = true;

console.log('=== cdVent VALIDATOR TESTS ===\n');

function testCase(name: string, fn: () => { pass: boolean; message: string }) {
  const result = fn();
  if (result.pass) {
    console.log(`PASS: ${name}`);
  } else {
    console.log(`FAIL: ${name}`);
    console.log(`  ${result.message}`);
    allPassed = false;
  }
}

testCase('(a) cdVent = 0.9 → validator passes (no warning)', () => {
  const rows: string[][] = [['cdVent', '0.9']];
  const result = parseVariableTable(rows);

  if (result.patch.cdVent !== 0.9) {
    return { pass: false, message: `Expected cdVent=0.9 in patch, got ${result.patch.cdVent}` };
  }

  const cdVentWarnings = result.warnings.filter((w) => w.includes('cdVent'));
  if (cdVentWarnings.length !== 0) {
    return { pass: false, message: `Expected 0 cdVent warnings, got ${cdVentWarnings.length}: ${cdVentWarnings.join('; ')}` };
  }

  return { pass: true, message: '' };
});

testCase('(b) cdVent = 4.1 → validator produces exactly 1 range warning', () => {
  const rows: string[][] = [['cdVent', '4.1']];
  const result = parseVariableTable(rows);

  if (result.patch.cdVent !== 4.1) {
    return { pass: false, message: `Expected cdVent=4.1 still in patch (warn-only), got ${result.patch.cdVent}` };
  }

  const rangeWarnings = result.warnings.filter((w) =>
    w.includes('out of allowed range [0.6, 1.1]'),
  );

  if (rangeWarnings.length !== 1) {
    return {
      pass: false,
      message: `Expected exactly 1 warning containing "out of allowed range [0.6, 1.1]", got ${rangeWarnings.length}: ${result.warnings.join('; ')}`,
    };
  }

  const expectedSubstring = 'out of allowed range [0.6, 1.1]';
  if (!rangeWarnings[0].includes(expectedSubstring)) {
    return {
      pass: false,
      message: `Warning did not contain expected substring "${expectedSubstring}". Actual: "${rangeWarnings[0]}"`,
    };
  }

  if (!rangeWarnings[0].includes('cdVent = 4.1')) {
    return {
      pass: false,
      message: `Warning did not contain "cdVent = 4.1". Actual: "${rangeWarnings[0]}"`,
    };
  }

  return { pass: true, message: '' };
});

testCase('(c) cdVent = 0.6 (lower bound) → validator passes (no warning)', () => {
  const rows: string[][] = [['cdVent', '0.6']];
  const result = parseVariableTable(rows);
  const cdVentWarnings = result.warnings.filter((w) => w.includes('cdVent'));

  if (result.patch.cdVent !== 0.6) {
    return { pass: false, message: `Expected cdVent=0.6 in patch, got ${result.patch.cdVent}` };
  }
  if (cdVentWarnings.length !== 0) {
    return { pass: false, message: `Expected 0 cdVent warnings at lower bound, got ${cdVentWarnings.length}: ${cdVentWarnings.join('; ')}` };
  }
  return { pass: true, message: '' };
});

testCase('(d) cdVent = 1.1 (upper bound) → validator passes (no warning)', () => {
  const rows: string[][] = [['cdVent', '1.1']];
  const result = parseVariableTable(rows);
  const cdVentWarnings = result.warnings.filter((w) => w.includes('cdVent'));

  if (result.patch.cdVent !== 1.1) {
    return { pass: false, message: `Expected cdVent=1.1 in patch, got ${result.patch.cdVent}` };
  }
  if (cdVentWarnings.length !== 0) {
    return { pass: false, message: `Expected 0 cdVent warnings at upper bound, got ${cdVentWarnings.length}: ${cdVentWarnings.join('; ')}` };
  }
  return { pass: true, message: '' };
});

testCase('(e) cdVent = 0.59 (just below lower bound) → exactly 1 range warning', () => {
  const rows: string[][] = [['cdVent', '0.59']];
  const result = parseVariableTable(rows);
  const rangeWarnings = result.warnings.filter((w) =>
    w.includes('out of allowed range [0.6, 1.1]'),
  );

  if (rangeWarnings.length !== 1) {
    return { pass: false, message: `Expected exactly 1 range warning for 0.59, got ${rangeWarnings.length}: ${result.warnings.join('; ')}` };
  }
  return { pass: true, message: '' };
});

testCase('(f) cdVent = 1.11 (just above upper bound) → exactly 1 range warning', () => {
  const rows: string[][] = [['cdVent', '1.11']];
  const result = parseVariableTable(rows);
  const rangeWarnings = result.warnings.filter((w) =>
    w.includes('out of allowed range [0.6, 1.1]'),
  );

  if (rangeWarnings.length !== 1) {
    return { pass: false, message: `Expected exactly 1 range warning for 1.11, got ${rangeWarnings.length}: ${result.warnings.join('; ')}` };
  }
  return { pass: true, message: '' };
});

console.log('');
if (allPassed) {
  console.log('ALL TESTS PASSED');
  process.exit(0);
} else {
  console.log('SOME TESTS FAILED');
  process.exit(1);
}
