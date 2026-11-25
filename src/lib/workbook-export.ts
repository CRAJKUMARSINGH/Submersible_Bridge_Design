import * as XLSX from 'xlsx';
import type { ComputedResults, Inputs } from './calculations';
import { buildDesignFormulaTrace } from './design-formula-trace';
import { DRAFT_STATUS, getDesignChecks, validateDesignInputs } from './design-review';
import { buildRowsFromInputs } from './spreadsheet-import';

type ResultRow = [string, string, string | number | boolean];

function resultRows(section: string, value: unknown, path = ''): ResultRow[] {
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, field]) => resultRows(section, field, path ? `${path}.${key}` : key));
  }
  if (typeof value === 'number' && Number.isFinite(value)) return [[section, path, value]];
  if (typeof value === 'boolean') return [[section, path, value]];
  return [[section, path, String(value ?? '')]];
}

export function buildDesignWorkbook(inputs: Inputs, results: ComputedResults): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  const checks = getDesignChecks(inputs, results);
  const structural = results.structural;
  const warnings = [...validateDesignInputs(inputs), ...results.sanityWarnings, ...structural.warnings];
  const [inputHeader, ...inputRows] = buildRowsFromInputs(inputs);
  const listedInputs = new Set(inputRows.map(([key]) => key));
  const additionalInputs = Object.entries(inputs)
    .filter(([key, value]) => value !== undefined && !listedInputs.has(key))
    .map(([key, value]) => [key, value, 'Advanced']);
  const { structural: _structural, sanityWarnings: _sanityWarnings, ...primaryResults } = results;
  const { loadCombinations: _loadCombinations, warnings: _warnings, ...structuralResults } = structural;
  const intermediateRows = [
    ...resultRows('Hydraulic and deck model', primaryResults),
    ...Object.entries(structuralResults).flatMap(([section, value]) => resultRows(section, value)),
  ];
  const sheets = {
    Review: [
      [DRAFT_STATUS],
      ['Check', 'Computed', 'Criterion', 'Status'],
      ...checks.map(({ check, val, limit, pass }) => [check, val, limit, pass ? 'PASS' : 'REVIEW']),
      ...warnings.map((warning) => ['Review item', warning, '', 'REVIEW']),
    ],
    Inputs: [[DRAFT_STATUS], inputHeader, ...inputRows, ...additionalInputs],
    'Intermediate results': [
      [DRAFT_STATUS],
      ['Section', 'Model field', 'Value'],
      ...intermediateRows,
    ],
    'Formula trace': [
      [DRAFT_STATUS],
      ['ID', 'Section', 'Equation', 'Substitution', 'Result', 'Unit', 'Source'],
      ...buildDesignFormulaTrace(inputs, results).map((row) => [
        row.id, row.section, row.equation, row.substitution, row.result, row.unit, row.prototypeReference,
      ]),
    ],
    'Load combinations': [
      [DRAFT_STATUS],
      ['ID', 'Case', 'Vertical (kN)', 'Horizontal (kN)', 'FOS sliding', 'FOS overturning', 'Status'],
      ...structural.loadCombinations.cases.map((row) => [
        row.id, row.description, row.vertical, row.horizontal,
        Number.isFinite(row.fosSliding) ? row.fosSliding : 'No driving force',
        Number.isFinite(row.fosOverturning) ? row.fosOverturning : 'No overturning moment',
        structural.loadCombinations.exemptIds.includes(row.id) ? 'NOT REQUIRED' : row.safe ? 'PASS' : 'REVIEW',
      ]),
    ],
  };
  for (const [name, rows] of Object.entries(sheets)) {
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet['!cols'] = [22, 45, 45, 34, 22, 22, 42].map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(workbook, sheet, name);
  }
  return workbook;
}

export function downloadDesignWorkbook(inputs: Inputs, results: ComputedResults): void {
  XLSX.writeFile(buildDesignWorkbook(inputs, results), 'causeway-design-draft.xlsx');
}
