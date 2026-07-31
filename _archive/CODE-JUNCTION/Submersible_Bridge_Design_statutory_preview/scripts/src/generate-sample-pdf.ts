/**
 * generate-sample-pdf.ts
 * Generates a 7-sheet design PDF pre-filled with the IRC SP:82-2008
 * Type Design worked example values (Scribd doc/140639054).
 *
 * Run: pnpm --filter @workspace/scripts tsx src/generate-sample-pdf.ts
 */

// ─── jsPDF import via dynamic require (ESM-compat wrapper) ───────────────────
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

// ─── Calculation helper ───────────────────────────────────────────────────────
const f = (n: number, d = 2) => n.toFixed(d);

// ─── IRC SP:82-2008 Type-Design Sample Inputs ─────────────────────────────────
// Values drawn from the standard worked example in the IRC SP:82-2008 type design
// document (Scribd doc 140639054) for a rural vented submersible causeway on a
// medium-sand stream, IRC Class A live load.
const inputs = {
  // Metadata
  projectName:   'Type Design — Vented Causeway (IRC SP:82-2008)',
  streamName:    'Nallah / Minor Stream (Medium-Sand Bed)',
  location:      'Rural Road, District HQ — 35 km Section',
  date:          '2024-07-24',

  // Step 1: Discharge
  catchmentArea:      25.0,   // km²  — typical small catchment
  runoffCoefficient:  0.45,   // —    — mixed cultivated/hilly (IRC Table)
  rainfallIntensity:  90.0,   // mm/hr — 50-yr return period, Zone II
  surplusWeirLength:  18.0,   // m    — from field survey
  heightOfFallWeir:   0.75,   // m    — head over weir at HFL
  streamAreaHFL:      62.0,   // m²  — cross-section area at HFL
  meanVelocityHFL:    1.40,   // m/s  — gauged velocity

  // Step 2: Hydraulic
  customDesignDischarge: null as number | null,
  hfl:              104.50,   // m    — Highest Flood Level
  gl:               102.00,   // m    — Ground / Stream-Bed Level (OFL)
  rtl:              103.25,   // m    — Road Top Level
  numVents:         5,        // nos  — 5-vent arrangement
  ventWidth:        2.00,     // m    — each vent clear width
  ventHeight:       1.00,     // m    — vent clear height
  approachVelocity: 1.40,     // m/s  — same as mean velocity
  siltFactor:       1.0,      // —    — medium sand (Lacey f=1.0)
  cdVent:           0.90,     // —    — discharge coefficient

  // Step 3: Structural
  deckWidth:        4.50,     // m    — carriageway + kerbs
  deckSpan:         2.50,     // m    — clear span between piers
  deckThickness:    0.30,     // m    — solid RCC slab
  numSpans:         7,        // nos  — total spans
  liveLoadType:     'IRC Class A' as 'IRC Class A' | 'IRC Class AA',
  waterDensity:     1000,     // kg/m³
  concreteDensity:  2500,     // kg/m³ — M25 RCC
  dragCoefficient:  2.0,      // —    — blunt body, IRC SP:82 Cl.7.4
  siltLoadDeck:     1.20,     // kN/m² — IRC SP:82 Cl.7.3
};

// ─── Compute Results ──────────────────────────────────────────────────────────
const qRational  = (inputs.runoffCoefficient * inputs.rainfallIntensity * inputs.catchmentArea) / 3.6;
const qWeir      = 1.705 * inputs.surplusWeirLength * Math.pow(inputs.heightOfFallWeir, 1.5);
const qVelocity  = inputs.streamAreaHFL * inputs.meanVelocityHFL;

let qDesign = qRational, governingMethod = 'Rational Method';
if (qWeir     > qDesign) { qDesign = qWeir;     governingMethod = 'Weir Formula'; }
if (qVelocity > qDesign) { qDesign = qVelocity; governingMethod = 'Area-Velocity'; }

const designDischarge = inputs.customDesignDischarge ?? qDesign;
const aVent        = inputs.numVents * inputs.ventWidth * inputs.ventHeight;
const effectiveWidth = designDischarge / inputs.approachVelocity;
const aRTL         = Math.max(0, inputs.rtl - inputs.gl) * effectiveWidth;
const aHFL         = Math.max(0, inputs.hfl - inputs.gl) * effectiveWidth;
const pctObsRTL    = aRTL > 0 ? (1 - aVent / aRTL) * 100 : 0;
const pctObsHFL    = aHFL > 0 ? (1 - aVent / aHFL) * 100 : 0;
const passRTL      = pctObsRTL < 70;
const passHFL      = pctObsHFL < 30;
const velocityHFL  = aHFL > 0 ? designDischarge / aHFL : 0;
const hAfflux      = (aVent > 0 && aHFL > aVent)
  ? (Math.pow(velocityHFL, 2) / 17.88 + 0.015) * (Math.pow(aHFL / aVent, 2) - 1)
  : 0;
const laceyPerimeter  = 4.75 * Math.sqrt(designDischarge);
const laceyScourDepth = 0.473 * Math.pow(designDischarge / inputs.siltFactor, 1 / 3);
const maxScourDepth   = 1.27 * laceyScourDepth;
const fbl             = inputs.hfl - maxScourDepth;
const recommendedDepth = inputs.gl - fbl;
const scourSafe       = fbl < (inputs.gl - 0.5);

const wSelf  = (inputs.concreteDensity * 9.81 * inputs.deckWidth * inputs.deckSpan * inputs.deckThickness) / 1000;
const wSilt  = inputs.siltLoadDeck * inputs.deckWidth * inputs.deckSpan;
const wLive  = inputs.liveLoadType === 'IRC Class AA' ? 700 : 554;
const totalVerticalLoad = wSelf + wSilt + wLive / inputs.numSpans;
const fDrag  = (inputs.dragCoefficient * 0.5 * inputs.waterDensity * Math.pow(velocityHFL, 2) * (inputs.deckWidth * inputs.deckThickness)) / 1000;
const fUplift = (inputs.waterDensity * 9.81 * inputs.deckWidth * inputs.deckSpan * inputs.deckThickness) / 1000;
const fAnchor = fUplift - wSelf;
const fDragTotal = fDrag * inputs.numSpans;

const results = {
  qRational, qWeir, qVelocity, qDesign, governingMethod,
  designDischarge, aVent, effectiveWidth, aRTL, aHFL,
  pctObsRTL, pctObsHFL, passRTL, passHFL, velocityHFL, hAfflux,
  laceyPerimeter, laceyScourDepth, maxScourDepth, fbl, recommendedDepth, scourSafe,
  wSelf, wSilt, wLive, totalVerticalLoad, fDrag, fUplift, fAnchor, fDragTotal,
};

// ─── PDF helpers ──────────────────────────────────────────────────────────────
function hatch(doc: any, rx: number, ry: number, rw: number, rh: number, step = 3.5) {
  const p = doc.getLineWidth();
  doc.setLineWidth(0.15); doc.setDrawColor(100);
  for (let d = -rh; d < rw; d += step) {
    const pts: [number,number][] = [];
    const xT = rx + Math.max(0,d); if(xT>=rx&&xT<=rx+rw) pts.push([xT,ry]);
    const xB = rx + Math.min(rw,d+rh); if(xB>=rx&&xB<=rx+rw) pts.push([xB,ry+rh]);
    const yL = rx-d; if(yL>=ry&&yL<=ry+rh) pts.push([rx,yL]);
    const yR = rx+rw-d; if(yR>=ry&&yR<=ry+rh) pts.push([rx+rw,yR]);
    if(pts.length>=2) doc.line(pts[0][0],pts[0][1],pts[1][0],pts[1][1]);
  }
  doc.setLineWidth(p); doc.setDrawColor(0);
}
function earth(doc: any, rx: number, ry: number, rw: number, rh: number, step = 4) {
  const p = doc.getLineWidth();
  doc.setLineWidth(0.15); doc.setDrawColor(140);
  for (let yi = ry+step/2; yi < ry+rh; yi += step) doc.line(rx,yi,rx+rw,yi);
  doc.setLineWidth(p); doc.setDrawColor(0);
}
function hDim(doc: any, x1: number, x2: number, y: number, label: string, ext = 5) {
  const p = doc.getLineWidth();
  doc.setLineWidth(0.2); doc.setDrawColor(0);
  doc.line(x1,y-ext,x1,y+2); doc.line(x2,y-ext,x2,y+2); doc.line(x1,y,x2,y);
  const A=1.8,W=0.7;
  doc.line(x1,y,x1+A,y-W); doc.line(x1,y,x1+A,y+W);
  doc.line(x2,y,x2-A,y-W); doc.line(x2,y,x2-A,y+W);
  doc.setFontSize(5); doc.setFont('helvetica','normal');
  doc.text(label,(x1+x2)/2,y-1.5,{align:'center'});
  doc.setLineWidth(p);
}
function vDim(doc: any, x: number, y1: number, y2: number, label: string, ext = 4) {
  const p = doc.getLineWidth();
  doc.setLineWidth(0.2); doc.setDrawColor(0);
  doc.line(x-ext,y1,x+2,y1); doc.line(x-ext,y2,x+2,y2); doc.line(x,y1,x,y2);
  const A=1.8,W=0.7;
  doc.line(x,y1,x-W,y1+A); doc.line(x,y1,x+W,y1+A);
  doc.line(x,y2,x-W,y2-A); doc.line(x,y2,x+W,y2-A);
  doc.setFontSize(5); doc.setFont('helvetica','normal');
  doc.text(label,x+2,(y1+y2)/2,{baseline:'middle'});
  doc.setLineWidth(p);
}
function levelLine(doc: any, x1: number, x2: number, y: number,
    label: string, rgb: [number,number,number], dashed = false) {
  doc.setDrawColor(rgb[0],rgb[1],rgb[2]); doc.setLineWidth(0.3);
  if(dashed) { for(let cx=x1;cx<x2;cx+=7) doc.line(cx,y,Math.min(cx+4.5,x2),y); }
  else doc.line(x1,y,x2,y);
  doc.setFontSize(5.5); doc.setFont('helvetica','bold');
  doc.setTextColor(rgb[0],rgb[1],rgb[2]);
  doc.text(label,x1-1,y,{align:'right',baseline:'middle'});
  doc.setTextColor(0); doc.setDrawColor(0);
}
function border(doc: any) {
  const W=doc.internal.pageSize.getWidth(), H=doc.internal.pageSize.getHeight();
  doc.setLineWidth(0.8); doc.setDrawColor(0); doc.rect(8,8,W-16,H-16);
  doc.setLineWidth(0.3); doc.rect(10,10,W-20,H-20);
}
