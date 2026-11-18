import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = process.cwd();
const sourcePath = resolve(root, process.argv[2] ?? 'attached_assets/Type Design of submersible causeway.txt');
const outputPath = resolve(root, process.argv[3] ?? 'data/extracted/prototype-equation-inventory.json');
const source = readFileSync(sourcePath, 'utf8');
const operatorPattern = /(?:[+\-×*÷/^√=<>≤≥]|\b(?:sin|cos|tan|sqrt|log|pow)\b)/i;

const lines = source.split(/\r?\n/);
const entries = lines.flatMap((rawLine, index) => {
  const line = rawLine.trim();
  if (!line || !/[=≈≤≥]/.test(line)) return [];

  const separator = line.search(/[=≈≤≥]/);
  const left = separator >= 0 ? line.slice(0, separator).trim() : '';
  const right = separator >= 0 ? line.slice(separator).trim() : '';
  const hasArithmeticOperator = operatorPattern.test(line.replace(/^[^=≈≤≥]*[=≈≤≥]/, ''));

  return [{
    sourceLine: index + 1,
    kind: hasArithmeticOperator ? 'equation-or-substitution-candidate' : 'assignment-or-check',
    left,
    right,
    rawLine,
  }];
});

const inventory = {
  source: sourcePath.replace(`${root}/`, ''),
  sourceSha256: createHash('sha256').update(source, 'utf8').digest('hex'),
  totalSourceLines: lines.length,
  equationOrSubstitutionCandidates: entries.filter((entry) => entry.kind === 'equation-or-substitution-candidate').length,
  assignmentsOrChecks: entries.filter((entry) => entry.kind === 'assignment-or-check').length,
  note: 'Verbatim line inventory for human review. Multi-line equations are not reconstructed and no expressions are evaluated.',
  entries,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8');
console.log(
  `Wrote ${entries.length} source equation/result lines `
  + `(${inventory.equationOrSubstitutionCandidates} equation candidates) to ${outputPath}`,
);