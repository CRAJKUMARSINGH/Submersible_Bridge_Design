import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { write } from 'xlsx';
import { computeResults, defaultInputs, type Inputs } from '../src/lib/calculations';
import { DRAFT_STATUS, validateDesignInputs } from '../src/lib/design-review';
import { exportDesignPDF } from '../src/lib/pdf-export';
import { buildDesignDocxBuffer } from '../src/lib/word-export';
import { buildDesignWorkbook } from '../src/lib/workbook-export';

async function main() {
  const [inputPath, outputDirectory, ...extra] = process.argv.slice(2);
  if (!inputPath || !outputDirectory || extra.length) {
    throw new Error('Usage: npm run export:design -- <inputs.json> <new-output-directory>');
  }

  const data: unknown = JSON.parse((await readFile(inputPath, 'utf8')).replace(/^\uFEFF/, ''));
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Expected the design inputs JSON from the A4 Preview.');
  }

  const optionalNumbers = ['linearWaterway_m', 'fbl_m', 'recommendedDepth_m'];
  const defaults: Record<string, unknown> = defaultInputs;
  for (const [key, value] of Object.entries(data)) {
    if (key === 'customDesignDischarge' && value === null) continue;
    const expected = key === 'customDesignDischarge' || optionalNumbers.includes(key) ? 'number'
      : Object.hasOwn(defaults, key) ? typeof defaults[key] : undefined;
    if (!expected || typeof value !== expected || (typeof value === 'number' && !Number.isFinite(value))) {
      throw new Error(`Invalid or unknown design input: ${key}`);
    }
  }
  const inputs: Inputs = { ...defaultInputs, ...data };
  if (!['IRC Class A', 'IRC Class AA', 'IRC Class 70R'].includes(inputs.liveLoadType)) {
    throw new Error('Select IRC Class A, AA, or 70R for liveLoadType.');
  }
  const errors = validateDesignInputs(inputs);
  if (errors.length) throw new Error(errors.join('\n'));

  const results = computeResults(inputs);
  const pdf = Buffer.from(exportDesignPDF(inputs, results).output('arraybuffer'));
  const docx = await buildDesignDocxBuffer(inputs, results);
  const xlsx: Buffer = write(buildDesignWorkbook(inputs, results), { type: 'buffer', bookType: 'xlsx' });

  await mkdir(outputDirectory);
  await Promise.all([
    writeFile(join(outputDirectory, 'causeway-design-draft.pdf'), pdf, { flag: 'wx' }),
    writeFile(join(outputDirectory, 'causeway-design-draft.docx'), docx, { flag: 'wx' }),
    writeFile(join(outputDirectory, 'causeway-design-draft.xlsx'), xlsx, { flag: 'wx' }),
  ]);
  console.log(`${DRAFT_STATUS}\nPDF, DOCX, and XLSX written to ${outputDirectory}`);
}

main().catch((error: Error) => {
  console.error(error.message);
  process.exitCode = 1;
});
