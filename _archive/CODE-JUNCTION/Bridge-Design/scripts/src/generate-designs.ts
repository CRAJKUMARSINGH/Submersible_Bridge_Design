import { mkdirSync, writeFileSync, copyFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = resolve(__dirname, '..', '..');
const TEST_RUNS_DIR = join(WORKSPACE_ROOT, 'test-runs');
const DEFAULT_SEED_CSV = join(TEST_RUNS_DIR, 'seed-inputs-25.csv');

type Inputs = {
  set_id: string;
  projectName: string;
  streamName: string;
  location: string;
  date: string;
  catchmentArea: number;
  runoffCoefficient: number;
  rainfallIntensity: number;
  surplusWeirLength: number;
  heightOfFallWeir: number;
  streamAreaHFL: number;
  meanVelocityHFL: number;
  customDesignDischarge: number | null;
  hfl: number;
  gl: number;
  rtl: number;
  numVents: number;
  ventWidth: number;
  ventHeight: number;
  approachVelocity: number;
  siltFactor: number;
  cdVent: number;
  deckWidth: number;
  deckSpan: number;
  deckThickness: number;
  numSpans: number;
  liveLoadType: 'IRC Class A' | 'IRC Class AA';
  waterDensity: number;
  concreteDensity: number;
  dragCoefficient: number;
  siltLoadDeck: number;
};

type ComputedResults = {
  qRational: number; qWeir: number; qVelocity: number; qDesign: number; governingMethod: string;
  designDischarge: number; aVent: number; effectiveWidth: number; aRTL: number; aHFL: number;
  pctObsRTL: number; pctObsHFL: number; passRTL: boolean; passHFL: boolean;
  velocityHFL: number; hAfflux: number;
  laceyPerimeter: number; laceyScourDepth: number; maxScourDepth: number; fbl: number;
  recommendedDepth: number; scourSafe: boolean;
  wSelf: number; wSilt: number; wLive: number; totalVerticalLoad: number;
  fDrag: number; fUplift: number; fAnchor: number; fDragTotal: number;
  verdict: { pass: boolean; reasons: string[] };
};

function computeResults(inputs: Inputs): ComputedResults {
  const qRational = (inputs.runoffCoefficient * inputs.rainfallIntensity * inputs.catchmentArea) / 3.6;
  const qWeir = 1.705 * inputs.surplusWeirLength * Math.pow(inputs.heightOfFallWeir, 1.5);
  const qVelocity = inputs.streamAreaHFL * inputs.meanVelocityHFL;

  let qDesign = qRational;
  let governingMethod = 'Rational Method';
  if (qWeir > qDesign) { qDesign = qWeir; governingMethod = 'Weir Formula'; }
  if (qVelocity > qDesign) { qDesign = qVelocity; governingMethod = 'Area-Velocity'; }

  const designDischarge = inputs.customDesignDischarge !== null ? inputs.customDesignDischarge : qDesign;

  const aVent = inputs.numVents * inputs.ventWidth * inputs.ventHeight;
  const appVel = inputs.approachVelocity > 0 ? inputs.approachVelocity : 0.01;
  const effectiveWidth = designDischarge / appVel;

  const depthRTL = Math.max(0, inputs.rtl - inputs.gl);
  const aRTL = depthRTL * effectiveWidth;
  const depthHFL = Math.max(0, inputs.hfl - inputs.gl);
  const aHFL = depthHFL * effectiveWidth;

  const pctObsRTL = aRTL > 0 ? (1 - (aVent / aRTL)) * 100 : 0;
  const pctObsHFL = aHFL > 0 ? (1 - (aVent / aHFL)) * 100 : 0;
  const passRTL = pctObsRTL < 70;
  const passHFL = pctObsHFL < 30;

  const velocityHFL = aHFL > 0 ? designDischarge / aHFL : 0;

  let hAfflux = 0;
  if (aVent > 0 && aHFL > aVent) {
    hAfflux = (Math.pow(velocityHFL, 2) / 17.88 + 0.015) * (Math.pow(aHFL / aVent, 2) - 1);
  }

  const laceyPerimeter = 4.75 * Math.sqrt(designDischarge);
  const sf = inputs.siltFactor > 0 ? inputs.siltFactor : 0.1;
  const laceyScourDepth = 0.473 * Math.pow(designDischarge / sf, 1 / 3);
  const maxScourDepth = 1.27 * laceyScourDepth;
  const fbl = inputs.hfl - maxScourDepth;
  const recommendedDepth = inputs.gl - fbl;
  const scourSafe = fbl < (inputs.gl - 0.5);

  const wSelf = (inputs.concreteDensity * 9.81 * inputs.deckWidth * inputs.deckSpan * inputs.deckThickness) / 1000;
  const wSilt = inputs.siltLoadDeck * inputs.deckWidth * inputs.deckSpan;
  const wLive = inputs.liveLoadType === 'IRC Class AA' ? 700 : 554;
  const totalVerticalLoad = wSelf + wSilt + (wLive / inputs.numSpans);

  const fDrag = (inputs.dragCoefficient * 0.5 * inputs.waterDensity * Math.pow(velocityHFL, 2) * (inputs.deckWidth * inputs.deckThickness)) / 1000;
  const fUplift = (inputs.waterDensity * 9.81 * (inputs.deckWidth * inputs.deckSpan * inputs.deckThickness)) / 1000;
  const fAnchor = fUplift - wSelf;
  const fDragTotal = fDrag * inputs.numSpans;

  const reasons: string[] = [];
  if (!passRTL) reasons.push(`Ventway @ RTL obstructs ${pctObsRTL.toFixed(1)}% (limit 70%)`);
  if (!passHFL) reasons.push(`Ventway @ HFL obstructs ${pctObsHFL.toFixed(1)}% (limit 30%)`);
  if (!scourSafe) reasons.push(`Foundation level above required scour depth`);
  if (fAnchor > 0) reasons.push(`Deck buoyancy exceeds self-weight; anchors required`);

  return {
    qRational, qWeir, qVelocity, qDesign, governingMethod,
    designDischarge, aVent, effectiveWidth, aRTL, aHFL,
    pctObsRTL, pctObsHFL, passRTL, passHFL,
    velocityHFL, hAfflux,
    laceyPerimeter, laceyScourDepth, maxScourDepth, fbl, recommendedDepth, scourSafe,
    wSelf, wSilt, wLive, totalVerticalLoad,
    fDrag, fUplift, fAnchor, fDragTotal,
    verdict: { pass: reasons.length === 0, reasons },
  };
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else { inQ = false; }
      } else {
        cur += c;
      }
    } else {
      if (c === ',') { out.push(cur); cur = ''; }
      else if (c === '"') { inQ = true; }
      else { cur += c; }
    }
  }
  out.push(cur);
  return out;
}

function loadSeedCSV(path: string): Inputs[] {
  const raw = readFileSync(path, 'utf8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows = lines.slice(1).map(parseCsvLine);

  const numKeys: (keyof Inputs)[] = ['catchmentArea','runoffCoefficient','rainfallIntensity','surplusWeirLength','heightOfFallWeir','streamAreaHFL','meanVelocityHFL','hfl','gl','rtl','numVents','ventWidth','ventHeight','approachVelocity','siltFactor','cdVent','deckWidth','deckSpan','deckThickness','numSpans','waterDensity','concreteDensity','dragCoefficient','siltLoadDeck'];

  return rows.map((cells, idx) => {
    const rec: Record<string, string> = {};
    header.forEach((k, i) => { rec[k] = (cells[i] ?? '').trim(); });

    const liveLoadRaw = (rec['liveLoadType'] ?? 'IRC Class A').toLowerCase().replace(/[^a-z0-9]/g, '');
    const liveLoadType: 'IRC Class A' | 'IRC Class AA' = liveLoadRaw.includes('aa') || liveLoadRaw === 'ircclassaa' ? 'IRC Class AA' : 'IRC Class A';

    const cdd = rec['customDesignDischarge'] ?? '';
    const customDesignDischarge: number | null = (!cdd || ['null','none','auto','default'].includes(cdd.toLowerCase()))
      ? null
      : Number(cdd);

    const base: Inputs = {
      set_id: rec['set_id'] || `set-${String(idx + 1).padStart(2, '0')}`,
      projectName: rec['projectName'] || 'Unnamed Project',
      streamName: rec['streamName'] || 'Unnamed Stream',
      location: rec['location'] || 'Unknown',
      date: rec['date'] || new Date().toISOString().split('T')[0],
      customDesignDischarge,
      liveLoadType,
    } as Inputs;

    for (const k of numKeys) {
      const raw = rec[k as string];
      const n = Number(raw);
      if (raw !== undefined && raw !== '' && !Number.isFinite(n)) {
        throw new Error(`Row ${idx + 2}: non-numeric ${k}=${raw}`);
      }
      (base as any)[k] = Number.isFinite(n) ? n : 0;
    }
    return base;
  });
}

function stampFolderName(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}-designs`;
}

const BOOL = (b: boolean) => b ? 'PASS' : 'FAIL';

function buildSummaryRows(all: Array<{ inputs: Inputs; results: ComputedResults }>) {
  const header = [
    'set_id','projectName','qDesign_m3s','governingMethod','pctObsRTL','pctObsHFL','maxScourDepth_m','fbl_m','fAnchor_kN',
    'totalVerticalLoad_kN','fDragTotal_kN','passRTL','passHFL','scourSafe','anchorsNeeded','OVERALL'
  ];
  const rows = all.map(({ inputs, results: r }) => [
    inputs.set_id, inputs.projectName, r.qDesign.toFixed(3), r.governingMethod,
    r.pctObsRTL.toFixed(2), r.pctObsHFL.toFixed(2), r.maxScourDepth.toFixed(3), r.fbl.toFixed(3), r.fAnchor.toFixed(2),
    r.totalVerticalLoad.toFixed(2), r.fDragTotal.toFixed(2),
    BOOL(r.passRTL), BOOL(r.passHFL), BOOL(r.scourSafe), r.fAnchor > 0 ? 'YES' : 'NO',
    r.verdict.pass ? 'PASS' : 'REVIEW'
  ]);
  return [header, ...rows];
}

function rowsToCsv(rows: string[][]): string {
  return rows.map((r) => r.map((c) => {
    const s = String(c);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }).join(',')).join('\r\n');
}

async function tryWriteXlsx(rows: string[][], outPath: string): Promise<boolean> {
  try {
    const xlsxPkg = await import('xlsx');
    const XLSX = (xlsxPkg as any).default ?? xlsxPkg;
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Design-Summary');
    XLSX.writeFile(wb, outPath);
    return true;
  } catch {
    return false;
  }
}

async function writePdfIfAble(inputs: Inputs, results: ComputedResults, outPath: string): Promise<boolean> {
  try {
    const jsPdfPkg = await import('jspdf');
    const autoTablePkg = await import('jspdf-autotable');
    const jsPDF = (jsPdfPkg as any).jsPDF ?? jsPdfPkg.default?.jsPDF ?? jsPdfPkg.default ?? jsPdfPkg;
    if (!jsPDF) return false;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' }) as any;
    const autoTable = (autoTablePkg as any).default ?? autoTablePkg;

    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const f = (n: number, d = 2) => Number.isFinite(n) ? n.toFixed(d) : 'N/A';

    // Cover
    doc.setFillColor(12, 20, 45); doc.rect(0, 0, W, H, 'F');
    doc.setTextColor(245, 158, 11); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('GOVERNMENT OF INDIA  |  MINISTRY OF ROAD TRANSPORT & HIGHWAYS', W / 2, 25, { align: 'center' });
    doc.setFontSize(22); doc.setTextColor(255, 255, 255);
    doc.text('DESIGN OF VENTED SUBMERSIBLE CAUSEWAY', W / 2, 60, { align: 'center' });
    doc.setFontSize(11); doc.setTextColor(200, 200, 200);
    doc.text(`BATCH RUN — ${inputs.set_id.toUpperCase()} — COMPUTATION REPORT`, W / 2, 72, { align: 'center' });
    doc.setDrawColor(245, 158, 11); doc.setLineWidth(0.5);
    doc.line(W / 2 - 80, 78, W / 2 + 80, 78);
    doc.setFontSize(9.5); doc.setTextColor(220, 220, 220); doc.setFont('helvetica', 'normal');
    const meta = [
      ['Name of Work', inputs.projectName],
      ['Stream / Road', inputs.streamName],
      ['Location', inputs.location],
      ['Date', inputs.date],
      ['Batch Set', inputs.set_id],
      ['Overall Verdict', results.verdict.pass ? 'PASS' : 'REVIEW'],
    ];
    meta.forEach(([k, v], i) => {
      doc.setFont('helvetica', 'bold'); doc.text(`${k}:`, W / 2 - 70, 92 + i * 9);
      doc.setFont('helvetica', 'normal'); doc.text(String(v), W / 2 - 10, 92 + i * 9);
    });
    if (results.verdict.reasons.length) {
      doc.setFontSize(8); doc.setTextColor(255, 120, 120); doc.setFont('helvetica', 'bold');
      doc.text('REVIEW ITEMS:', W / 2 - 70, 92 + meta.length * 9 + 6);
      doc.setFont('helvetica', 'normal');
      results.verdict.reasons.forEach((r, i) => {
        doc.text(`\u2022 ${r}`, W / 2 - 66, 92 + meta.length * 9 + 13 + i * 5.5);
      });
    }
    doc.setTextColor(245, 158, 11); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
    doc.text('Designed as per IRC SP:82-2008 & IRC 6:2000', W / 2, H - 28, { align: 'center' });
    doc.setFontSize(6); doc.setTextColor(140, 140, 140); doc.setFont('helvetica', 'italic');
    doc.text('Batch generated — computation engine identical to CSWY-CALC 82 UI', W / 2, H - 18, { align: 'center' });

    // Step 1
    doc.addPage();
    doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, H, 'F');
    doc.setTextColor(0); doc.setDrawColor(0);
    doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.text(`${inputs.set_id} — STEP 1: DESIGN DISCHARGE`, W / 2, 17, { align: 'center' });

    autoTable(doc, {
      startY: 28,
      head: [['Method', 'Formula', 'Variables Used', 'Q (m\u00B3/s)', 'Governs?']],
      body: [
        ['Rational Method', 'Q = C\u00B7I\u00B7A / 3.6', `C=${inputs.runoffCoefficient}, I=${inputs.rainfallIntensity}mm/hr, A=${inputs.catchmentArea}km\u00B2`, f(results.qRational), results.governingMethod === 'Rational Method' ? '\u2713 YES' : 'No'],
        ['Broad-Crested Weir', 'Q = 1.705\u00B7Lw\u00B7Hw^1.5', `Lw=${inputs.surplusWeirLength}m, Hw=${inputs.heightOfFallWeir}m`, f(results.qWeir), results.governingMethod === 'Weir Formula' ? '\u2713 YES' : 'No'],
        ['Area-Velocity', 'Q = A\u00B7V_mean', `A_stream=${inputs.streamAreaHFL}m\u00B2, V=${inputs.meanVelocityHFL}m/s`, f(results.qVelocity), results.governingMethod === 'Area-Velocity' ? '\u2713 YES' : 'No'],
      ],
      theme: 'grid', headStyles: { fillColor: [12, 20, 45], textColor: [245, 158, 11], fontStyle: 'bold', fontSize: 9 }, bodyStyles: { fontSize: 9 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 }, 1: { cellWidth: 70, fontStyle: 'italic' }, 3: { halign: 'right', fontStyle: 'bold' }, 4: { halign: 'center', fontStyle: 'bold' } },
    });

    const y2 = (doc as any).lastAutoTable.finalY + 6;
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.setFillColor(245, 158, 11); doc.rect(12, y2 - 1, W - 24, 12, 'F');
    doc.setTextColor(12, 20, 45);
    doc.text(`DESIGN DISCHARGE  Q = ${f(results.designDischarge)} m\u00B3/s  (${results.governingMethod}${inputs.customDesignDischarge !== null ? ' + override' : ''})`, W / 2, y2 + 6.5, { align: 'center' });
    doc.setTextColor(0);

    autoTable(doc, {
      startY: y2 + 17,
      head: [['Input Parameter', 'Value', 'Unit'], ['Step 2 — Hydraulic', '', ''],
        ['Number of Vents', String(inputs.numVents), 'nos'],
        ['Vent Size (W \u00D7 H)', `${f(inputs.ventWidth)} \u00D7 ${f(inputs.ventHeight)}`, 'm'],
        ['Total Ventway Area A_vent', f(results.aVent), 'm\u00B2'],
        ['% Obstruction @ RTL', `${f(results.pctObsRTL, 1)}%`, results.passRTL ? 'PASS (<70%)' : 'FAIL'],
        ['% Obstruction @ HFL', `${f(results.pctObsHFL, 1)}%`, results.passHFL ? 'PASS (<30%)' : 'FAIL'],
        ['Step 2b — Scour (Lacey)', '', ''],
        ['Lacey Normal Scour R', f(results.laceyScourDepth, 3), 'm'],
        ['Maximum Scour Depth D_max', f(results.maxScourDepth, 3), 'm'],
        ['Foundation Bottom Level FBL', f(results.fbl, 3), 'm'],
        ['Depth below GL', f(results.recommendedDepth, 3), 'm'],
        ['Step 3 — Structural', '', ''],
        ['Self Weight / Span W_self', f(results.wSelf, 3), 'kN'],
        ['Silt / Span W_silt', f(results.wSilt, 3), 'kN'],
        ['Live Load ' + inputs.liveLoadType, f(results.wLive, 0), 'kN total'],
        ['Total Vertical Load / Span', f(results.totalVerticalLoad, 2), 'kN'],
        ['Drag Force (total)', f(results.fDragTotal, 2), 'kN'],
        ['Uplift Force / Span', f(results.fUplift, 2), 'kN'],
        ['Anchor Requirement F_anchor', f(results.fAnchor, 2), results.fAnchor > 0 ? 'kN — NEED ANCHORS' : 'kN — SAFE'],
      ],
      theme: 'striped', headStyles: { fillColor: [40, 60, 100], fontSize: 9 }, bodyStyles: { fontSize: 9 },
    });

    const buf: ArrayBuffer = doc.output('arraybuffer');
    writeFileSync(outPath, Buffer.from(buf));
    return true;
  } catch (err) {
    console.error(`  ! PDF skip ${inputs.set_id}: ${(err as Error).message.split('\n')[0]}`);
    return false;
  }
}

async function main() {
  const argvSeed = process.argv[2];
  const csvPath = argvSeed ? resolve(process.cwd(), argvSeed) : DEFAULT_SEED_CSV;
  if (!existsSync(csvPath)) {
    console.error(`Seed CSV not found: ${csvPath}`);
    process.exit(1);
  }
  const inputsArr = loadSeedCSV(csvPath);
  console.log(`Loaded ${inputsArr.length} seed cases from ${csvPath}`);

  const runFolder = join(TEST_RUNS_DIR, stampFolderName());
  mkdirSync(runFolder, { recursive: true });
  console.log(`Output folder: ${runFolder}`);

  const all: Array<{ inputs: Inputs; results: ComputedResults }> = [];
  let pdfOk = 0;

  for (const inputs of inputsArr) {
    const setDir = join(runFolder, inputs.set_id);
    mkdirSync(setDir, { recursive: true });
    const results = computeResults(inputs);
    all.push({ inputs, results });

    writeFileSync(join(setDir, 'inputs.json'), JSON.stringify(inputs, null, 2));
    writeFileSync(join(setDir, 'results.json'), JSON.stringify(results, null, 2));
    const caseCsv = rowsToCsv(buildSummaryRows([{ inputs, results }]));
    writeFileSync(join(setDir, 'design-summary.csv'), caseCsv);

    const pdfOut = join(setDir, `Causeway_Design_${inputs.set_id}.pdf`);
    const ok = await writePdfIfAble(inputs, results, pdfOut);
    if (ok) pdfOk++;

    const flag = results.verdict.pass ? 'OK' : 'REVIEW';
    const extra = results.verdict.reasons.length ? ` — ${results.verdict.reasons.join('; ')}` : '';
    console.log(`  [${flag}] ${inputs.set_id.padEnd(7)} Q=${results.qDesign.toFixed(2)}m3/s  Obs@HFL=${results.pctObsHFL.toFixed(1)}%  FBL=${results.fbl.toFixed(2)}m  anchors=${results.fAnchor > 0 ? 'YES' : 'no'}  pdf=${ok ? 'yes' : 'skip'}${extra}`);
  }

  const rows = buildSummaryRows(all);
  const summaryCsv = join(runFolder, 'ALL-SETS-SUMMARY.csv');
  writeFileSync(summaryCsv, rowsToCsv(rows));
  const xlsxOk = await tryWriteXlsx(rows, join(runFolder, 'ALL-SETS-SUMMARY.xlsx'));
  copyFileSync(csvPath, join(runFolder, 'seed-inputs.csv'));

  const passCount = all.filter((a) => a.results.verdict.pass).length;
  const index = [
    '# Submersible Causeway Batch Design Run',
    '',
    `- Folder: ${runFolder}`,
    `- Generated: ${new Date().toISOString()}`,
    `- Cases: ${all.length}   PASS: ${passCount}   REVIEW: ${all.length - passCount}   PDFs: ${pdfOk}/${all.length}`,
    `- Seed CSV used: seed-inputs.csv`,
    `- Aggregate outputs: ALL-SETS-SUMMARY.csv${xlsxOk ? ' / ALL-SETS-SUMMARY.xlsx' : ''}`,
    '',
    '## Per Set',
    ...all.map(({ inputs, results: r }) => `- \`${inputs.set_id}\` ${inputs.projectName} — ${r.verdict.pass ? 'PASS' : 'REVIEW'} — Q=${r.qDesign.toFixed(2)} m3/s`),
  ].join('\n');
  writeFileSync(join(runFolder, 'RUN-README.md'), index);

  console.log('');
  console.log(`\u2728 Done: ${passCount}/${all.length} PASS; PDFs ${pdfOk}/${all.length}.`);
  console.log(`\ud83d\udcc1 Summary CSV: ${summaryCsv}`);
  console.log(`\ud83d\uddc2\ufe0f  Output dir : ${runFolder}`);
}

void main();
