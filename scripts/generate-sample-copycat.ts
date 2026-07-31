import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
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
const OUTPUT_PDF = join(ROOT, '169-PAGE-SUBMERSIBLE-CAUSEWAY-DESIGN-REPORT.pdf');

async function main() {
  if (!existsSync(SAMPLE_TEXT_FILE)) {
    console.error('Sample text file not found:', SAMPLE_TEXT_FILE);
    process.exit(1);
  }

  const { jsPDF } = await import('jspdf');
  const content = readFileSync(SAMPLE_TEXT_FILE, 'utf8');
  const sourceLines = parseNonEmptySourceLines(content);
  const narrativeLineCount = sourceLines.filter((line) => isNarrativeLine(line.rawText)).length;

  const doc: any = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a3',
    compress: true,
  });

  const margin = { top: 16, right: 14, bottom: 16, left: 14 };
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin.left - margin.right;
  let y = margin.top;

  const renderPlan = buildRenderPlan(sourceLines, (line, style) => {
    doc.setFont(style.fontName, style.fontStyle);
    doc.setFontSize(style.fontSize);
    return wrapLineVerbatim(line.rawText, contentWidth, (text) => doc.getTextWidth(text));
  });

  const failedPreservation = renderPlan.filter(
    (line) => reconstructRenderedLine(line.renderedSegments) !== line.rawText,
  );

  if (failedPreservation.length > 0) {
    console.error('Verbatim preservation failed before PDF rendering.');
    console.error(
      `First failing line ${failedPreservation[0].lineNumber}: ${JSON.stringify(failedPreservation[0].rawText)}`,
    );
    process.exit(1);
  }

  const ensurePageSpace = (lineHeight: number) => {
    if (y + lineHeight > pageHeight - margin.bottom) {
      doc.addPage();
      y = margin.top;
    }
  };

  doc.setTextColor(0, 0, 0);

  for (const line of renderPlan) {
    doc.setFont(line.style.fontName, line.style.fontStyle);
    doc.setFontSize(line.style.fontSize);

    for (const segment of line.renderedSegments) {
      ensurePageSpace(line.style.lineHeight);
      doc.text(segment, margin.left, y);
      y += line.style.lineHeight;
    }

    if (line.kind !== 'body') {
      y += 0.8;
    }
  }

  const arrayBuffer = doc.output('arraybuffer');
  writeFileSync(OUTPUT_PDF, Buffer.from(arrayBuffer));

  console.log(`Loaded ${sourceLines.length} non-empty source lines`);
  console.log(`Narrative lines preserved verbatim: ${narrativeLineCount}`);
  console.log(`Generated ${doc.internal.pages.length - 1} pages`);
  console.log(`Wrote PDF to: ${OUTPUT_PDF}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
