import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import {
  buildRenderPlan,
  classifyLine,
  isNarrativeLine,
  parseNonEmptySourceLines,
  reconstructRenderedLine,
  wrapLineVerbatim,
} from './verbatim-renderer.ts';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const SAMPLE_TEXT_FILE = join(ROOT, 'attached_assets', 'Type Design of submersible causeway.txt');
const REPORT_PATH = join(ROOT, 'VERBATIM-CERTIFICATION-REPORT.txt');

interface CertificationResult {
  certification: 'PASS' | 'FAIL';
  totalSourceLines: number;
  nonEmptySourceLines: number;
  renderedLines: number;
  exactLineMatches: number;
  narrativeLines: number;
  exactNarrativeMatches: number;
  sectionLines: number;
  exactSectionMatches: number;
  failures: string[];
  details: string[];
}

async function runCertification(): Promise<CertificationResult> {
  const result: CertificationResult = {
    certification: 'PASS',
    totalSourceLines: 0,
    nonEmptySourceLines: 0,
    renderedLines: 0,
    exactLineMatches: 0,
    narrativeLines: 0,
    exactNarrativeMatches: 0,
    sectionLines: 0,
    exactSectionMatches: 0,
    failures: [],
    details: [],
  };

  if (!existsSync(SAMPLE_TEXT_FILE)) {
    result.certification = 'FAIL';
    result.failures.push(`Missing sample file: ${SAMPLE_TEXT_FILE}`);
    return result;
  }

  const { jsPDF } = await import('jspdf');
  const content = readFileSync(SAMPLE_TEXT_FILE, 'utf8');
  const rawLines = content.split(/\r?\n/);
  const sourceLines = parseNonEmptySourceLines(content);
  result.totalSourceLines = rawLines.length;
  result.nonEmptySourceLines = sourceLines.length;

  const doc: any = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3', compress: true });
  const margin = { left: 14, right: 14 };
  const contentWidth = doc.internal.pageSize.getWidth() - margin.left - margin.right;

  const renderPlan = buildRenderPlan(sourceLines, (line, style) => {
    doc.setFont(style.fontName, style.fontStyle);
    doc.setFontSize(style.fontSize);
    return wrapLineVerbatim(line.rawText, contentWidth, (text) => doc.getTextWidth(text));
  });

  result.renderedLines = renderPlan.length;

  for (const line of renderPlan) {
    const reconstructed = reconstructRenderedLine(line.renderedSegments);
    const exactMatch = reconstructed === line.rawText;

    if (exactMatch) {
      result.exactLineMatches++;
    } else {
      result.failures.push(
        `Line ${line.lineNumber} changed during wrapping: ${JSON.stringify(line.rawText)} -> ${JSON.stringify(reconstructed)}`,
      );
    }

    if (isNarrativeLine(line.rawText)) {
      result.narrativeLines++;
      if (exactMatch) {
        result.exactNarrativeMatches++;
      }
    }

    if (classifyLine(line.rawText) !== 'body') {
      result.sectionLines++;
      if (exactMatch) {
        result.exactSectionMatches++;
      }
    }

    if (result.details.length < 20 || line.lineNumber % 500 === 0) {
      result.details.push(
        `Line ${line.lineNumber}: segments=${line.renderedSegments.length} kind=${line.kind} text=${JSON.stringify(line.rawText.slice(0, 120))}`,
      );
    }
  }

  const targetPhrases = [
    'Water pressure is considered on square ended abutments as per clause 213.2 of',
    'For the purpose of calculation of exposed area to water current force,only 1.0m width of abutment is considered for full hieght upto HFL',
    'Hence,the water current force =                        3.38KN',
  ];

  for (const phrase of targetPhrases) {
    const matchedLine = renderPlan.find((line) => line.rawText.includes(phrase));
    if (!matchedLine) {
      result.failures.push(`Target phrase missing from render plan: ${phrase}`);
      continue;
    }

    if (reconstructRenderedLine(matchedLine.renderedSegments) !== matchedLine.rawText) {
      result.failures.push(`Target phrase failed exact preservation on line ${matchedLine.lineNumber}`);
    }
  }

  const criteria = [
    {
      name: 'All non-empty source lines are represented',
      passed: result.renderedLines === result.nonEmptySourceLines,
    },
    {
      name: 'All rendered lines reconstruct exactly',
      passed: result.exactLineMatches === result.nonEmptySourceLines,
    },
    {
      name: 'All narrative lines reconstruct exactly',
      passed: result.exactNarrativeMatches === result.narrativeLines && result.narrativeLines > 0,
    },
    {
      name: 'All section/title lines reconstruct exactly',
      passed: result.exactSectionMatches === result.sectionLines,
    },
    {
      name: 'Rice-grain target phrases are preserved',
      passed: result.failures.every((failure) => !failure.startsWith('Target phrase')),
    },
  ];

  for (const criterion of criteria) {
    result.details.push(`${criterion.passed ? 'PASS' : 'FAIL'}: ${criterion.name}`);
    if (!criterion.passed) {
      result.certification = 'FAIL';
    }
  }

  if (result.failures.length > 0) {
    result.certification = 'FAIL';
  }

  return result;
}

const result = await runCertification();

const reportLines = [
  'VERBATIM CERTIFICATION TEST REPORT',
  '=================================',
  `Date: ${new Date().toISOString()}`,
  `Sample File: ${SAMPLE_TEXT_FILE}`,
  '',
  'SUMMARY',
  '-------',
  `Certification: ${result.certification}`,
  `Total source lines: ${result.totalSourceLines}`,
  `Non-empty source lines: ${result.nonEmptySourceLines}`,
  `Rendered lines: ${result.renderedLines}`,
  `Exact line matches: ${result.exactLineMatches}`,
  `Narrative lines: ${result.narrativeLines}`,
  `Exact narrative matches: ${result.exactNarrativeMatches}`,
  `Section/title lines: ${result.sectionLines}`,
  `Exact section/title matches: ${result.exactSectionMatches}`,
  '',
  'DETAILS',
  '-------',
  ...result.details,
  '',
  'FAILURES',
  '--------',
  ...(result.failures.length > 0 ? result.failures : ['None']),
];

writeFileSync(REPORT_PATH, reportLines.join('\n'));

console.log('=== VERBATIM CERTIFICATION ===');
console.log(`Certification: ${result.certification}`);
console.log(`Non-empty source lines: ${result.nonEmptySourceLines}`);
console.log(`Exact line matches: ${result.exactLineMatches}`);
console.log(`Narrative lines preserved exactly: ${result.exactNarrativeMatches}/${result.narrativeLines}`);
console.log(`Report: ${REPORT_PATH}`);

if (result.certification === 'FAIL') {
  process.exit(1);
}
