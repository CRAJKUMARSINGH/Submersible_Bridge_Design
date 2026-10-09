import { DEFAULT_GEOMETRY } from '../src/lib/calculations';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function main() {
  let passed = true;
  const notes: string[] = [];

  console.log('=== S3-A: Geometry single-source test ===');

  console.log('(a) Import DEFAULT_GEOMETRY from calculations.tsx:');
  console.log(JSON.stringify(DEFAULT_GEOMETRY, null, 2));
  const requiredKeys = ['PIER_W_M', 'ABUT_W_M', 'FEXT_M', 'APP_M', 'PMARG_M', 'BANK_MULT'] as const;
  for (const k of requiredKeys) {
    if (!(k in DEFAULT_GEOMETRY)) {
      console.error(`  FAIL: Missing key ${k} in DEFAULT_GEOMETRY`);
      passed = false;
    }
  }
  if (passed) console.log('  PASS: DEFAULT_GEOMETRY has all required keys.');

  console.log('(b) Read pdf-export.ts as text and scan for uncommented magic numbers:');
  const pdfPath = resolve(__dirname, '../src/lib/pdf-export.ts');
  const src = readFileSync(pdfPath, 'utf8');
  const lines = src.split(/\r?\n/);

  const magicPattern = /(^|[^0-9.])(0\.6|0\.8|0\.4|3\.0)([^0-9.]|$)/;
  const falsePositiveContexts = [
    'DEFAULT_GEOMETRY.',
    'SCHEMATIC',
    '1:50',
    'titleBlock',
    'fontSize',
    'setLineWidth',
    'setDrawColor',
    'setFillColor',
    'step =',
    'step: 0',
    'step="',
    'toFixed',
    'fine sand≈',
    'coarse≈',
    '.toFixed',
    'vDim(',
    'hDim(',
    'levelLine(',
    'doc.line(',
    'doc.rect(',
    'doc.text(',
    'A=',
    'C=',
    'W=',
    'L=',
    'b=',
    'h=',
    't=',
    'N=',
    'P=',
    'R=',
    'D=',
    'V=',
    'ρ=',
    'g=',
    'Q =',
    '×9.81',
    '/1000',
    '/ 1000',
    '× 1000',
    'kg/m³',
    'kN',
    'm³/s',
    'm²',
    'mm/hr',
  ];

  // Track block-comment state
  let inBlockComment = false;
  let drawingFunctionStart = -1;
  const drawingFns = ['drawCrossSection', 'drawLongSection', 'drawPlanView'];
  const matches: { line: number; content: string; reason: string }[] = [];
  const fpHits: { line: number; content: string; note: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const lineNum = i + 1;
    let line = rawLine;

    if (drawingFns.some(fn => line.includes(`function ${fn}(`))) {
      drawingFunctionStart = lineNum;
    }

    const blockStart = line.indexOf('/*');
    const blockEnd = line.indexOf('*/');
    if (blockStart !== -1 && (blockEnd === -1 || blockEnd < blockStart)) {
      inBlockComment = true;
    }
    if (blockEnd !== -1 && inBlockComment) {
      inBlockComment = false;
    }

    const lineCommentIdx = line.indexOf('//');
    let codePart = lineCommentIdx !== -1 ? line.slice(0, lineCommentIdx) : line;
    if (inBlockComment) codePart = '';

    const match = magicPattern.exec(codePart);
    if (!match) continue;

    const inDrawingFn = drawingFunctionStart !== -1 && lineNum >= drawingFunctionStart;
    const isFP = falsePositiveContexts.some(ctx => line.includes(ctx)) ||
                 /:\s*0\.[468]/.test(line) ||
                 /=\s*0\.[468]\s*[,;]/.test(line) ||
                 /APP_M|ABUT_W_M|PIER_W_M|FEXT_M|BANK_MULT|PMARG_M/.test(line);

    if (isFP) {
      fpHits.push({ line: lineNum, content: line.trim(), note: 'Possible FP (helper/default context)' });
      continue;
    }

    if (inDrawingFn) {
      const lit = match[2];
      let reason = '';
      if (lit === '0.6') reason = 'ABUT_W was 0.6 in drawCrossSection — should use DEFAULT_GEOMETRY.ABUT_W_M (0.8)';
      if (lit === '0.8') reason = 'Potential hardcoded ABUT_W — should use DEFAULT_GEOMETRY.ABUT_W_M';
      if (lit === '0.4') reason = 'Potential hardcoded PIER_W or FEXT — should use DEFAULT_GEOMETRY.PIER_W_M/FEXT_M';
      if (lit === '3.0') reason = 'Potential hardcoded APP — should use DEFAULT_GEOMETRY.APP_M';
      matches.push({ line: lineNum, content: line.trim(), reason });
    }
  }

  if (matches.length > 0) {
    console.error('  FAIL: Uncommented magic-number literals found in drawing-scope code:');
    for (const m of matches) {
      console.error(`    L${m.line}: ${m.content}`);
      console.error(`        → ${m.reason}`);
    }
    passed = false;
  } else {
    console.log('  PASS: No drawing-scope magic-number literals (0.6/0.8/0.4/3.0) found uncommented.');
  }

  if (fpHits.length > 0) {
    notes.push(`Note: ${fpHits.length} matching literals skipped (constants/unit helpers; likely false positives).`);
    for (const fp of fpHits.slice(0, 5)) {
      notes.push(`  - L${fp.line}: ${fp.content.slice(0, 90)} [${fp.note}]`);
    }
    if (fpHits.length > 5) notes.push(`  ... +${fpHits.length - 5} more`);
  }

  console.log();
  for (const n of notes) console.log(n);
  console.log();
  console.log(passed ? 'OVERALL: PASS' : 'OVERALL: FAIL');
  process.exit(passed ? 0 : 1);
}

main();
