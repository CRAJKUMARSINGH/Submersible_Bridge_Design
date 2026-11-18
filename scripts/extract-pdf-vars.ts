/**
 * scripts/extract-pdf-vars.ts
 *
 * Task 9 (spec R8) — PDF-to-Variable extraction pipeline.
 *
 * Reads the reference design PDF ("Type Design of submersible causeway.pdf"),
 * pulls the design input values out of the extracted text with a set of
 * label -> value heuristics, and emits a `Partial<Inputs>` JSON document plus a
 * list of warnings for values that are source-silent.
 *
 * Design notes:
 * - Values are read from the PDF text itself (pdf-parse), never hard-coded.
 * - Unit conversions follow the reference: kN/m3 -> kg/m3 (x100) for the
 *   density inputs, t/m2 -> kN/m2 (x9.81) for SBC — matching `defaultInputs`.
 * - Heuristics take the FIRST labelled occurrence in document order; the design
 *   parameter block on the opening pages is authoritative for the geometry.
 *
 * Usage:
 *   node --import tsx scripts/extract-pdf-vars.ts [--pdf <path>] [--out <path>]
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFParse } from 'pdf-parse';
import type { Inputs } from '../src/lib/calculations.tsx';

/** Recognized reference fields that the app keeps as module constants. */
export type ExtraVariableKey = 'fck_pcc' | 'fck_vrcc' | 'fy' | 'reinforcementCover_mm';

export type PdfVariableExtraction = {
  source: string;
  sourceSha256: string;
  pageCount: number;
  /** Fields that map to the app's `Inputs` type. */
  inputs: Partial<Inputs>;
  /** Recognized reference fields that are not part of `Inputs`. */
  extraVariables: Partial<Record<ExtraVariableKey, number>>;
  /** `Object.keys(inputs).length + Object.keys(extraVariables).length`. */
  fieldCount: number;
  warnings: string[];
};

const NUM = String.raw`-?\d+(?:\.\d+)?`;

/** Numeric capture group as a finite number, or `undefined` when absent. */
function num(match: RegExpMatchArray | null, group = 1): number | undefined {
  const raw = match?.[group];
  if (raw === undefined) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

/** Fields the reference PDF does not state numerically (recorded, never guessed). */
const SOURCE_SILENT_KEYS = [
  'streamName',
  'location',
  'date',
  'runoffCoefficient',
  'rainfallIntensity',
  'ventHeight',
  'cdVent',
  'dragCoefficient',
] as const;

export async function extractPdfVariables(pdfPath: string): Promise<PdfVariableExtraction> {
  const data = readFileSync(pdfPath);
  const parser = new PDFParse({ data, verbosity: 0 });
  const result = await parser.getText({});
  const text = result.text;

  const warnings: string[] = [];
  const inputs: Partial<Inputs> = {};
  const extraVariables: Partial<Record<ExtraVariableKey, number>> = {};

  const setInput = (key: keyof Inputs, value: unknown, label: string): void => {
    if (value === undefined) {
      warnings.push(`NOT FOUND: ${label}`);
      return;
    }
    (inputs as Record<string, unknown>)[key] = value;
  };

  const setExtra = (key: ExtraVariableKey, value: number | undefined, label: string): void => {
    if (value === undefined) {
      warnings.push(`NOT FOUND: ${label}`);
      return;
    }
    extraVariables[key] = value;
  };

  // ── Metadata ──────────────────────────────────────────────────────────────
  const project = text.match(/Name of the work\s*:?-+\s*(.+)/);
  setInput('projectName', project?.[1].trim(), 'Name of the work');

  // ── Step 1 — Design discharge ─────────────────────────────────────────────
  setInput(
    'catchmentArea',
    num(text.match(new RegExp(`Catchment area[^\\n]*?=\\s*(${NUM})\\s*sq\\s*km`, 'i'))),
    'Catchment area (km2)',
  );
  setInput(
    'surplusWeirLength',
    num(text.match(new RegExp(`Length of check dam\\s*=\\s*(${NUM})\\s*m`, 'i'))),
    'Surplus weir length / check dam (m)',
  );
  setInput(
    'heightOfFallWeir',
    num(text.match(new RegExp(`Assume head of flow\\s*=\\s*(${NUM})\\s*m`, 'i'))),
    'Head over surplus weir (m)',
  );

  // Area at HFL is the totals row of the area-velocity table at the bridge site:
  // "<area> <wetted perimeter>" immediately above the "Hydraulic Radius" line.
  const areaRow = text.match(
    new RegExp(`\\r?\\n\\s*(${NUM})\\s+(${NUM})\\s*\\r?\\n\\s*Hydraulic Radius`, 'i'),
  );
  setInput('streamAreaHFL', num(areaRow, 1), 'Stream area at HFL (m2)');
  setInput(
    'meanVelocityHFL',
    num(text.match(new RegExp(`Velocity V = [^\\n]*?(${NUM})\\s*m/sec`, 'i'))),
    'Mean velocity at HFL (m/s)',
  );
  setInput(
    'customDesignDischarge',
    num(text.match(new RegExp(`Design Discharge\\s*=\\s*(${NUM})\\s*Cumecs`))),
    'Design discharge (m3/s)',
  );

  // ── Step 2 — Hydraulic / ventway ──────────────────────────────────────────
  setInput('hfl', num(text.match(new RegExp(`High flood Level\\s*\\(HFL\\)\\s*=\\s*(${NUM})\\s*m`, 'i'))), 'HFL (m)');
  setInput('gl', num(text.match(new RegExp(`Low bed level\\s*\\(LBL\\)\\s*=\\s*(${NUM})\\s*m`, 'i'))), 'LBL / GL (m)');
  setInput('rtl', num(text.match(new RegExp(`Road crest level\\s*\\(RTL\\)\\s*=\\s*(${NUM})\\s*m`, 'i'))), 'RTL (m)');

  const spans = text.match(new RegExp(`(\\d+)\\s*spans?\\s+of\\s+each\\s+(${NUM})\\s*m`, 'i'));
  setInput('numVents', num(spans, 1), 'Number of vents');
  setInput('ventWidth', num(spans, 2), 'Vent width (m)');
  setInput('numSpans', num(spans, 1), 'Number of spans');
  setInput(
    'approachVelocity',
    num(text.match(new RegExp(`Design Velocity\\s*=\\s*(${NUM})\\s*m/sec`, 'i'))),
    'Design / approach velocity (m/s)',
  );
  setInput(
    'siltFactor',
    num(text.match(new RegExp(`Silt factor[^\\n]*=\\s*(${NUM})\\s*$`, 'im'))),
    'Lacey silt factor f',
  );

  // ── Step 3 — Structural geometry, materials, loads ────────────────────────
  setInput('deckSpan', num(text.match(new RegExp(`Clear Right Span\\s*=\\s*(${NUM})\\s*m`, 'i'))), 'Clear right span (m)');
  setInput(
    'deckWidth',
    num(text.match(new RegExp(`Width of the carriage way\\s*=\\s*(${NUM})\\s*m`, 'i'))),
    'Carriageway width (m)',
  );
  setInput(
    'deckThickness',
    num(text.match(new RegExp(`Thickness of deck slab[^\\n]*=\\s*(${NUM})\\s*m`, 'i'))),
    'Deck slab thickness (m)',
  );

  const liveLoad = text.match(/IRC\s*Class\s*(70R|AA|A)\b/);
  setInput(
    'liveLoadType',
    liveLoad ? `IRC Class ${liveLoad[1]}` : undefined,
    'Live load class (IRC Class A / AA / 70R)',
  );

  const waterUnitWeight = num(text.match(new RegExp(`Unit weight of water[^\\n]*=\\s*(${NUM})\\s*KN/cum`, 'i')));
  setInput(
    'waterDensity',
    waterUnitWeight === undefined ? undefined : waterUnitWeight * 100,
    'Unit weight of water (kN/m3 -> kg/m3)',
  );
  const rccUnitWeight = num(text.match(new RegExp(`Unit weight of RCC[^\\n]*=\\s*(${NUM})\\s*KN/cum`, 'i')));
  setInput(
    'concreteDensity',
    rccUnitWeight === undefined ? undefined : rccUnitWeight * 100,
    'Unit weight of RCC (kN/m3 -> kg/m3)',
  );
  setInput(
    'siltLoadDeck',
    num(text.match(new RegExp(`(${NUM})\\s*KN/m(?:²|2)\\s*\\r?\\n\\s*silt load`, 'i'))),
    'Silt load on deck (kN/m2)',
  );

  const sbcTonnes = num(text.match(new RegExp(`Safe Bearing Capacity of the soil[^\\n]*=\\s*(${NUM})\\s*t/sqm`, 'i')));
  setInput(
    'sbc_kN_m2',
    sbcTonnes === undefined ? undefined : sbcTonnes * 9.81,
    'SBC (t/m2 -> kN/m2)',
  );
  setInput(
    'backfillUnitWeight_kN_m3',
    num(text.match(new RegExp(`Density of back fill soil[^\\n]*=\\s*(${NUM})\\s*KN/Cum`, 'i'))),
    'Backfill unit weight (kN/m3)',
  );

  // ── Reference fields outside the Inputs type ──────────────────────────────
  // On the design-parameter page the PCC / VRCC grades print as bare
  // "= <value> N/sqmm" lines directly under the SBC row (PCC first, VRCC second).
  const grades = text.match(
    new RegExp(
      `Safe Bearing Capacity of the soil[^\\n]*\\r?\\n\\s*=\\s*(${NUM})\\s*N/sqmm\\s*\\r?\\n\\s*=\\s*(${NUM})\\s*N/sqmm`,
      'i',
    ),
  );
  if (grades) {
    extraVariables.fck_pcc = Number(grades[1]);
    extraVariables.fck_vrcc = Number(grades[2]);
  } else {
    warnings.push('NOT FOUND: fck_pcc / fck_vrcc (PCC / VRCC concrete grades)');
  }
  setExtra(
    'fy',
    num(text.match(new RegExp(`Yield strength of steel[^\\n]*=\\s*(${NUM})\\s*N/sqmm`, 'i'))),
    'Yield strength of steel fy (N/mm2)',
  );
  setExtra(
    'reinforcementCover_mm',
    num(text.match(new RegExp(`Cover to reinforcement\\s*=\\s*(${NUM})\\s*mm`, 'i'))),
    'Cover to reinforcement (mm)',
  );

  for (const key of SOURCE_SILENT_KEYS) {
    warnings.push(`SOURCE-SILENT: ${key} — not stated numerically in the reference PDF; left unset`);
  }

  return {
    source: pdfPath,
    sourceSha256: createHash('sha256').update(data).digest('hex'),
    pageCount: result.pages.length,
    inputs,
    extraVariables,
    fieldCount: Object.keys(inputs).length + Object.keys(extraVariables).length,
    warnings,
  };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const pdfFlag = args.indexOf('--pdf');
  const outFlag = args.indexOf('--out');
  const pdfPath = resolve(pdfFlag >= 0 ? (args[pdfFlag + 1] ?? '') : 'attached_assets/Type Design of submersible causeway.pdf');
  const outPath = resolve(outFlag >= 0 ? (args[outFlag + 1] ?? '') : 'data/extracted/pdf-extracted-inputs.json');

  if (!existsSync(pdfPath)) {
    throw new Error(`PDF not found: ${pdfPath}`);
  }

  const extraction = await extractPdfVariables(pdfPath);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(extraction, null, 2)}\n`, 'utf8');

  console.log(`Extracted ${extraction.fieldCount} fields from ${extraction.pageCount} pages`);
  console.log(`  inputs          : ${Object.keys(extraction.inputs).length}`);
  console.log(`  extraVariables  : ${Object.keys(extraction.extraVariables).length}`);
  console.log(`  warnings        : ${extraction.warnings.length}`);
  for (const warning of extraction.warnings) console.log(`    - ${warning}`);
  console.log(`Wrote ${outPath}`);
}

const invokedDirectly =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
