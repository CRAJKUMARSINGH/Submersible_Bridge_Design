import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { jsPDF } from 'jspdf';
import {
  buildRenderPlan,
  isNarrativeLine,
  parseNonEmptySourceLines,
  reconstructRenderedLine,
  wrapLineVerbatim,
} from './verbatim-renderer.ts';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const SAMPLE_TEXT_FILE = join(ROOT, 'attached_assets', 'Type Design of submersible causeway.txt');

function createMeasureContext() {
  const doc: any = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3', compress: true });
  const margin = { left: 14, right: 14 };
  const contentWidth = doc.internal.pageSize.getWidth() - margin.left - margin.right;

  return {
    doc,
    contentWidth,
  };
}

test('wrapLineVerbatim reconstructs a long narrative line exactly', () => {
  const { doc, contentWidth } = createMeasureContext();
  const sourceLine =
    'For the purpose of calculation of exposed area to water current force,only 1.0m width of abutment is considered for full hieght upto HFL';

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);

  const segments = wrapLineVerbatim(sourceLine, contentWidth, (text) => doc.getTextWidth(text));

  assert.ok(segments.length >= 1);
  assert.equal(reconstructRenderedLine(segments), sourceLine);
});

test('wrapLineVerbatim preserves equals lines exactly without splitting semantics', () => {
  const { doc, contentWidth } = createMeasureContext();
  const sourceLine =
    'Hence,the water current force =                        3.38KN';

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);

  const segments = wrapLineVerbatim(sourceLine, contentWidth, (text) => doc.getTextWidth(text));

  assert.equal(reconstructRenderedLine(segments), sourceLine);
  assert.match(reconstructRenderedLine(segments), /=\s+3\.38KN$/);
});

test('sample-wide render plan preserves every non-empty source line exactly', () => {
  assert.ok(existsSync(SAMPLE_TEXT_FILE), 'Sample text file must exist for certification tests');

  const content = readFileSync(SAMPLE_TEXT_FILE, 'utf8');
  const sourceLines = parseNonEmptySourceLines(content);
  const { doc, contentWidth } = createMeasureContext();

  const renderPlan = buildRenderPlan(sourceLines, (line, style) => {
    doc.setFont(style.fontName, style.fontStyle);
    doc.setFontSize(style.fontSize);
    return wrapLineVerbatim(line.rawText, contentWidth, (text) => doc.getTextWidth(text));
  });

  assert.equal(renderPlan.length, sourceLines.length);

  for (const line of renderPlan) {
    assert.equal(reconstructRenderedLine(line.renderedSegments), line.rawText, `line ${line.lineNumber} changed`);
  }
});

test('sample narrative lines remain exact after wrapping', () => {
  const content = readFileSync(SAMPLE_TEXT_FILE, 'utf8');
  const sourceLines = parseNonEmptySourceLines(content).filter((line) => isNarrativeLine(line.rawText));
  const { doc, contentWidth } = createMeasureContext();

  assert.ok(sourceLines.length > 0, 'Sample should contain narrative lines');

  const renderPlan = buildRenderPlan(sourceLines, (line, style) => {
    doc.setFont(style.fontName, style.fontStyle);
    doc.setFontSize(style.fontSize);
    return wrapLineVerbatim(line.rawText, contentWidth, (text) => doc.getTextWidth(text));
  });

  for (const line of renderPlan) {
    assert.equal(reconstructRenderedLine(line.renderedSegments), line.rawText, `narrative line ${line.lineNumber} changed`);
  }
});
