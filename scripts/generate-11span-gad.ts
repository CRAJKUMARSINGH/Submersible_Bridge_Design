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
import { jsPDF } from 'jspdf';
import { exportDesignPDF } from '../src/lib/pdf-export.ts';
import type { Inputs, ComputedResults } from '../src/lib/calculations.tsx';

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

// ─── COMPUTATION (mirrors CalculationsProvider useMemo) ─────────────────────────
const calculateObstructionPercent = (ventArea: number, flowArea: number) => {
  if (flowArea <= 0) return 0;
  return Math.min(100, Math.max(0, (1 - ventArea / flowArea) * 100));
};

function compute(i: Inputs): ComputedResults {
  const qRational = (i.runoffCoefficient * i.rainfallIntensity * i.catchmentArea) / 3.6;
  const qWeir = 1.705 * i.surplusWeirLength * Math.pow(i.heightOfFallWeir, 1.5);
  const qVelocity = i.streamAreaHFL * i.meanVelocityHFL;

  let qDesign = qRational;
  let governingMethod = 'Rational Method';
  if (qWeir > qDesign) { qDesign = qWeir; governingMethod = 'Weir Formula'; }
  if (qVelocity > qDesign) { qDesign = qVelocity; governingMethod = 'Area-Velocity'; }

  const designDischarge = i.customDesignDischarge !== null ? i.customDesignDischarge : qDesign;
  const aVent = i.numVents * i.ventWidth * i.ventHeight;
  const appVel = i.approachVelocity > 0 ? i.approachVelocity : 0.01;
  const effectiveWidth = designDischarge / appVel;

  const aRTL = Math.max(0, i.rtl - i.gl) * effectiveWidth;
  const aHFL = Math.max(0, i.hfl - i.gl) * effectiveWidth;

  const pctObsRTL = calculateObstructionPercent(aVent, aRTL);
  const pctObsHFL = calculateObstructionPercent(aVent, aHFL);
  const passRTL = pctObsRTL < 70;
  const passHFL = pctObsHFL < 30;

  const velocityHFL = aHFL > 0 ? designDischarge / aHFL : 0;

  let hAfflux = 0;
  if (aVent > 0 && aHFL > aVent) {
    hAfflux = (Math.pow(velocityHFL, 2) / 17.88 + 0.015) * (Math.pow(aHFL / aVent, 2) - 1);
  }

  const laceyPerimeter = 4.75 * Math.sqrt(designDischarge);
  const sf = i.siltFactor > 0 ? i.siltFactor : 0.1;
  const laceyScourDepth = 0.473 * Math.pow(designDischarge / sf, 1 / 3);
  const maxScourDepth = 1.27 * laceyScourDepth;
  const fbl = i.hfl - maxScourDepth;
  const recommendedDepth = i.gl - fbl;
  const scourSafe = fbl < i.gl - 0.5;
  const passMinCarriageWidth_m = i.carriageWidth_m >= 6.0;
  const minCarriageWidthNote = passMinCarriageWidth_m
    ? `PASS: ${i.carriageWidth_m.toFixed(3)}m ≥ 6.0m minimum`
    : `FAIL: Carriageway ${i.carriageWidth_m.toFixed(3)}m < 6.0m (IRC SP:82-2008 Cl.6.4.2(vi))`;

  const wSelf = (i.concreteDensity * 9.81 * i.deckWidth * i.deckSpan * i.deckThickness) / 1000;
  const wSilt = i.siltLoadDeck * i.deckWidth * i.deckSpan;
  const wLive = i.liveLoadType === 'IRC Class 70R' ? 900 : i.liveLoadType === 'IRC Class AA' ? 700 : 554;
  const totalVerticalLoad = wSelf + wSilt + wLive / i.numSpans;

  const fDrag = (i.dragCoefficient * 0.5 * i.waterDensity * Math.pow(velocityHFL, 2) * (i.deckWidth * i.deckThickness)) / 1000;
  const fUplift = (i.waterDensity * 9.81 * (i.deckWidth * i.deckSpan * i.deckThickness)) / 1000;
  const fAnchor = fUplift - wSelf;
  const fDragTotal = fDrag * i.numSpans;

  return {
    qRational, qWeir, qVelocity, qDesign, governingMethod,
    designDischarge, aVent, effectiveWidth, aRTL, aHFL,
    pctObsRTL, pctObsHFL, passRTL, passHFL,
    velocityHFL, hAfflux,
    laceyPerimeter, laceyScourDepth, maxScourDepth, fbl, recommendedDepth, scourSafe,
    passMinCarriageWidth_m, minCarriageWidthNote,
    wSelf, wSilt, wLive, totalVerticalLoad,
    fDrag, fUplift, fAnchor, fDragTotal,
  };
}

// ─── RUN ────────────────────────────────────────────────────────────────────────
const results = compute(inputs);

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const runDir = join(ROOT, 'test-runs', `test-run-${timestamp}`);
mkdirSync(runDir, { recursive: true });

writeFileSync(join(runDir, 'input.json'), JSON.stringify(inputs, null, 2));
writeFileSync(join(runDir, 'results.json'), JSON.stringify(results, null, 2));

const outPdf = join(runDir, '11-SPAN-SLAB-BRIDGE-GAD.pdf');

// exportDesignPDF() ends with doc.save(filename) (browser download). For the
// head-less robotic run we intercept save() to capture the document instead.
let captured: { output: (type: string) => ArrayBuffer } | null = null;
const api = (jsPDF as unknown as { API: Record<string, unknown> }).API;
const originalSave = api.save;
api.save = function (this: { output: (type: string) => ArrayBuffer }) { captured = this; };

exportDesignPDF(inputs, results);
api.save = originalSave;

if (!captured) throw new Error('exportDesignPDF did not emit a document (doc.save was never called).');
writeFileSync(outPdf, Buffer.from(captured.output('arraybuffer')));

console.log('── 11-SPAN SLAB BRIDGE GAD TEST RUN ──────────────────────────────');
console.log(`  Run folder : ${runDir}`);
console.log(`  PDF        : ${outPdf}`);
console.log(`  Spans      : ${inputs.numSpans}  ×  ${inputs.deckSpan} m clear span`);
console.log(`  Deck width : ${inputs.deckWidth} m   Thickness: ${inputs.deckThickness} m`);
console.log(`  Q_design   : ${results.designDischarge.toFixed(2)} m³/s (${results.governingMethod})`);
console.log(`  V_HFL      : ${results.velocityHFL.toFixed(3)} m/s   Afflux: ${results.hAfflux.toFixed(4)} m`);
console.log('──────────────────────────────────────────────────────────────────');
