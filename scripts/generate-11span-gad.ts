/**
 * generate-11span-gad.ts
 * ───────────────────────────────────────────────────────────────────────────
 * Robotic test-run harness: drives the SAME PDF pipeline the app uses
 * (`src/lib/pdf-export.ts → exportDesignPDF`) head-lessly, with an 11-span
 * RCC slab bridge (vented submersible causeway) input set.
 *
 * Produces the elegant multi-sheet design PDF including the GAD drawings
 * (Cross Section A-A, Longitudinal Section B-B, Plan View) plus the live
 * formula-trace sheets.
 *
 * Run:  npx tsx ./scripts/generate-11span-gad.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exportDesignPDF } from '../src/lib/pdf-export.ts';
import { computeResults, type Inputs } from '../src/lib/calculations.tsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── 11-SPAN SLAB BRIDGE INPUT SET ─────────────────────────────────────────────
const inputs: Inputs = {
  projectName: '11-Span RCC Slab Bridge — Vented Submersible Causeway',
  streamName: 'Nallah / Minor Stream (Medium-Sand Bed)',
  location: 'B.T to the R/f KB Road to P.Bheemavaram',
  date: new Date().toISOString().split('T')[0],

  // Step 1 — Discharge
  catchmentArea: 25.0,
  runoffCoefficient: 0.45,
  rainfallIntensity: 90.0,
  surplusWeirLength: 18.0,
  heightOfFallWeir: 0.75,
  streamAreaHFL: 62.0,
  meanVelocityHFL: 1.4,

  // Step 2 — Hydraulic
  customDesignDischarge: null,
  hfl: 104.5,
  gl: 102.0,
  rtl: 103.25,
  ofl_m: 5.1,
  lbl_m: 4.2,
  bottomDeck_m: 5.5,
  carriageWidth_m: 7.5,
  numVents: 5,
  ventWidth: 2.0,
  ventHeight: 1.0,
  approachVelocity: 1.4,
  siltFactor: 1.0,
  cdVent: 0.9,

  // Step 3 — Structural (the 11-span configuration)
  deckWidth: 4.5,
  deckSpan: 2.5,
  deckThickness: 0.3,
  numSpans: 11,
  liveLoadType: 'IRC Class A',
  waterDensity: 1000,
  concreteDensity: 2500,
  dragCoefficient: 2.0,
  siltLoadDeck: 1.2,
  sbc_kN_m2: 98,
  d_LBL_depth_m: 2.0,
};

// ─── COMPUTATION ────────────────────────────────────────────────────────────────
// Single source of truth: the same pure core the UI uses. No copy-paste, so the
// CLI run can never silently drift from the app's numbers.
const results = computeResults(inputs);

// ─── RUN ────────────────────────────────────────────────────────────────────────
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const runDir = join(ROOT, 'test-runs', `test-run-${timestamp}`);
mkdirSync(runDir, { recursive: true });

writeFileSync(join(runDir, 'input.json'), JSON.stringify(inputs, null, 2));
writeFileSync(join(runDir, 'results.json'), JSON.stringify(results, null, 2));

const outPdf = join(runDir, '11-SPAN-SLAB-BRIDGE-GAD.pdf');

// exportDesignPDF now returns the document instead of triggering a browser
// download, so the head-less run can serialise it directly.
const doc = exportDesignPDF(inputs, results);
writeFileSync(outPdf, Buffer.from(doc.output('arraybuffer')));

console.log('── 11-SPAN SLAB BRIDGE GAD TEST RUN ──────────────────────────────');
console.log(`  Run folder : ${runDir}`);
console.log(`  PDF        : ${outPdf}`);
console.log(`  Spans      : ${inputs.numSpans}  ×  ${inputs.deckSpan} m clear span`);
console.log(`  Deck width : ${inputs.deckWidth} m   Thickness: ${inputs.deckThickness} m`);
console.log(`  Q_design   : ${results.designDischarge.toFixed(2)} m³/s (${results.governingMethod})`);
console.log(`  V_HFL      : ${results.velocityHFL.toFixed(3)} m/s   Afflux: ${results.hAfflux.toFixed(4)} m`);
if (results.sanityWarnings.length > 0) {
  console.log('  ── SANITY ADVISORIES ──');
  results.sanityWarnings.forEach((w) => console.log(`   • ${w}`));
}
console.log('──────────────────────────────────────────────────────────────────');
