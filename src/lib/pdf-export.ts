import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Inputs, ComputedResults } from './calculations';

const f = (n: number, d = 2) => n.toFixed(d);

function hatch(doc: jsPDF, rx: number, ry: number, rw: number, rh: number, step = 3.5) {
  const prevLW = doc.getLineWidth();
  doc.setLineWidth(0.15);
  doc.setDrawColor(100);
  for (let d = -rh; d < rw; d += step) {
    const pts: [number, number][] = [];
    const xT = rx + Math.max(0, d); if (xT >= rx && xT <= rx + rw) pts.push([xT, ry]);
    const xB = rx + Math.min(rw, d + rh); if (xB >= rx && xB <= rx + rw) pts.push([xB, ry + rh]);
    const yL = rx - d; if (yL >= ry && yL <= ry + rh) pts.push([rx, yL]);
    const yR = rx + rw - d; if (yR >= ry && yR <= ry + rh) pts.push([rx + rw, yR]);
    if (pts.length >= 2) doc.line(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
  }
  doc.setLineWidth(prevLW);
  doc.setDrawColor(0);
}

function earth(doc: jsPDF, rx: number, ry: number, rw: number, rh: number, step = 4) {
  const prevLW = doc.getLineWidth();
  doc.setLineWidth(0.15);
  doc.setDrawColor(140);
  for (let yi = ry + step / 2; yi < ry + rh; yi += step) {
    doc.line(rx, yi, rx + rw, yi);
  }
  doc.setLineWidth(prevLW);
  doc.setDrawColor(0);
}

function hDim(doc: jsPDF, x1: number, x2: number, y: number, label: string, extLen = 5) {
  const prev = doc.getLineWidth();
  doc.setLineWidth(0.2); doc.setDrawColor(0);
  doc.line(x1, y - extLen, x1, y + 2); doc.line(x2, y - extLen, x2, y + 2);
  doc.line(x1, y, x2, y);
  const A = 1.8, W = 0.7;
  doc.line(x1, y, x1 + A, y - W); doc.line(x1, y, x1 + A, y + W);
  doc.line(x2, y, x2 - A, y - W); doc.line(x2, y, x2 - A, y + W);
  doc.setFontSize(5); doc.setFont('helvetica', 'normal');
  doc.text(label, (x1 + x2) / 2, y - 1.5, { align: 'center' });
  doc.setLineWidth(prev);
}

function vDim(doc: jsPDF, x: number, y1: number, y2: number, label: string, extLen = 4) {
  const prev = doc.getLineWidth();
  doc.setLineWidth(0.2); doc.setDrawColor(0);
  doc.line(x - extLen, y1, x + 2, y1); doc.line(x - extLen, y2, x + 2, y2);
  doc.line(x, y1, x, y2);
  const A = 1.8, W = 0.7;
  doc.line(x, y1, x - W, y1 + A); doc.line(x, y1, x + W, y1 + A);
  doc.line(x, y2, x - W, y2 - A); doc.line(x, y2, x + W, y2 - A);
  doc.setFontSize(5); doc.setFont('helvetica', 'normal');
  doc.text(label, x + 2, (y1 + y2) / 2, { baseline: 'middle' });
  doc.setLineWidth(prev);
}

function levelLine(doc: jsPDF, x1: number, x2: number, y: number, label: string, rgb: [number, number, number], dashed = false) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]); doc.setLineWidth(0.3);
  if (dashed) {
    for (let cx = x1; cx < x2; cx += 7) doc.line(cx, y, Math.min(cx + 4.5, x2), y);
  } else {
    doc.line(x1, y, x2, y);
  }
  doc.setFontSize(5.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  doc.text(label, x1 - 1, y, { align: 'right', baseline: 'middle' });
  doc.setTextColor(0); doc.setDrawColor(0);
}

function titleBlock(doc: jsPDF, inputs: Inputs, drwTitle: string, drwNo: string, scale: string, sheet: string, total: string) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const tbH = 36; const tbY = H - tbH - 10;
  const tbX = 10; const tbW = W - 20;
  const rightW = 52; const rightX = tbX + tbW - rightW;
  const midX = tbX + (rightX - tbX) / 2;
  const row = tbH / 3;

  doc.setDrawColor(0); doc.setLineWidth(0.4);
  doc.rect(tbX, tbY, tbW, tbH);
  doc.line(midX, tbY, midX, tbY + tbH);
  doc.line(rightX, tbY, rightX, tbY + tbH);
  doc.line(rightX + rightW / 2, tbY, rightX + rightW / 2, tbY + tbH);
  doc.line(rightX, tbY + tbH / 2, tbX + tbW, tbY + tbH / 2);
  doc.line(tbX, tbY + row, midX, tbY + row);
  doc.line(tbX, tbY + row * 2, midX, tbY + row * 2);
  doc.line(midX, tbY + row, rightX, tbY + row);
  doc.line(midX, tbY + row * 2, rightX, tbY + row * 2);

  const p = 1.5;
  const labels = ['PROJECT NAME:', 'STREAM / ROAD:', 'LOCATION:'];
  const vals = [inputs.projectName, inputs.streamName, inputs.location];
  const rLabels = ['DRAWING TITLE:', 'DRG. NO.:', 'DATE:'];
  const rVals = [drwTitle, drwNo, inputs.date];

  labels.forEach((lbl, i) => {
    doc.setFontSize(4.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(80);
    doc.text(lbl, tbX + p, tbY + i * row + p + 2.5);
    doc.setFontSize(6); doc.setFont('helvetica', 'normal'); doc.setTextColor(0);
    doc.text(vals[i], tbX + p, tbY + i * row + p + 7.5, { maxWidth: midX - tbX - 4 });
  });

  rLabels.forEach((lbl, i) => {
    doc.setFontSize(4.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(80);
    doc.text(lbl, midX + p, tbY + i * row + p + 2.5);
    doc.setFontSize(6); doc.setFont('helvetica', 'normal'); doc.setTextColor(0);
    doc.text(rVals[i], midX + p, tbY + i * row + p + 7.5, { maxWidth: rightX - midX - 4 });
  });

  doc.setFontSize(4.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(80);
  doc.text('SCALE', rightX + rightW / 4, tbY + 4, { align: 'center' });
  doc.text('SHEET', rightX + rightW * 3 / 4, tbY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(0);
  doc.text(scale, rightX + rightW / 4, tbY + tbH / 2 + 2, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`${sheet}/${total}`, rightX + rightW * 3 / 4, tbY + tbH / 2 + 4, { align: 'center' });

  doc.setFontSize(4); doc.setFont('helvetica', 'italic'); doc.setTextColor(120);
  doc.text('Per IRC SP:82-2008 & IRC 6:2000', tbX + p, tbY + tbH - 2);
  doc.setTextColor(0);
}

function border(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  doc.setLineWidth(0.8); doc.setDrawColor(0);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setLineWidth(0.3);
  doc.rect(10, 10, W - 20, H - 20);
}

function drawCrossSection(doc: jsPDF, inp: Inputs, res: ComputedResults) {
  border(doc);
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  const PIER_W = 0.4, ABUT_W = 0.6, FEXT = 0.4;
  const nPiers = inp.numVents - 1;
  const totW = 2 * ABUT_W + nPiers * PIER_W + inp.numVents * inp.ventWidth;
  const deckTop = inp.rtl + inp.deckThickness;

  const minEl = res.fbl - 0.8;
  const maxEl = Math.max(inp.hfl, deckTop) + 0.6;
  const elRange = maxEl - minEl;

  const ML = 30, MR = 18, MT = 18, TB = 46;
  const dW = W - ML - MR, dH = H - MT - TB;
  const wMarg = Math.max(1.2, totW * 0.2);
  const worldW = totW + 2 * wMarg;
  const hS = dW / worldW, vS = dH / elRange;

  const mx = (wx: number) => ML + (wx + wMarg) * hS;
  const my = (el: number) => MT + (maxEl - el) * vS;

  const yDT = my(deckTop), yRTL = my(inp.rtl), yHFL = my(inp.hfl), yGL = my(inp.gl), yFBL = my(res.fbl);

  type Sec = { x1: number; x2: number; type: 'abut' | 'vent' | 'pier' };
  const secs: Sec[] = [];
  let cx = 0;
  secs.push({ x1: cx, x2: cx + ABUT_W, type: 'abut' }); cx += ABUT_W;
  for (let i = 0; i < inp.numVents; i++) {
    secs.push({ x1: cx, x2: cx + inp.ventWidth, type: 'vent' }); cx += inp.ventWidth;
    if (i < inp.numVents - 1) { secs.push({ x1: cx, x2: cx + PIER_W, type: 'pier' }); cx += PIER_W; }
  }
  secs.push({ x1: cx, x2: cx + ABUT_W, type: 'abut' });

  doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.text('SECTION A-A — TRANSVERSE CROSS SECTION', W / 2, 15, { align: 'center' });
  doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
  doc.text('(View perpendicular to direction of flow)', W / 2, 20, { align: 'center' });

  earth(doc, ML, yGL, dW, yFBL - yGL + 5);

  secs.filter(s => s.type === 'vent').forEach(s => {
    const waterTop = Math.min(yHFL, yRTL);
    if (waterTop < yGL) {
      doc.setFillColor(219, 234, 254);
      doc.rect(mx(s.x1), waterTop, (s.x2 - s.x1) * hS, yGL - waterTop, 'F');
    }
  });

  secs.filter(s => s.type !== 'vent').forEach(s => {
    const fx = mx(s.x1) - FEXT * hS, fw = (s.x2 - s.x1 + 2 * FEXT) * hS;
    doc.setFillColor(210, 210, 210); doc.rect(fx, yGL, fw, yFBL - yGL, 'F');
    hatch(doc, fx, yGL, fw, yFBL - yGL);
    doc.setLineWidth(0.5); doc.setDrawColor(0); doc.rect(fx, yGL, fw, yFBL - yGL);
  });

  secs.filter(s => s.type !== 'vent').forEach(s => {
    const x = mx(s.x1), w = (s.x2 - s.x1) * hS;
    doc.setFillColor(215, 215, 215); doc.rect(x, yDT, w, yGL - yDT, 'F');
    hatch(doc, x, yDT, w, yGL - yDT);
    doc.setLineWidth(s.type === 'abut' ? 0.6 : 0.4); doc.rect(x, yDT, w, yGL - yDT);
  });

  doc.setFillColor(200, 200, 200); doc.rect(mx(0), yDT, totW * hS, yRTL - yDT, 'F');
  hatch(doc, mx(0), yDT, totW * hS, yRTL - yDT, 4);
  doc.setLineWidth(0.8); doc.setDrawColor(0); doc.rect(mx(0), yDT, totW * hS, yRTL - yDT);

  levelLine(doc, ML, ML + dW, yHFL, `HFL: ${f(inp.hfl)}m`, [30, 100, 200], true);
  levelLine(doc, ML, ML + dW, yGL, `GL: ${f(inp.gl)}m`, [40, 110, 40]);
  levelLine(doc, ML, ML + dW, yFBL, `FBL: ${f(res.fbl)}m`, [180, 40, 40], true);
  levelLine(doc, mx(0) - 3, mx(totW) + 3, yRTL, `RTL: ${f(inp.rtl)}m`, [90, 90, 90], true);

  doc.setFontSize(6); doc.setFont('helvetica', 'bold'); doc.setTextColor(0);
  secs.forEach(s => {
    const cx2 = mx((s.x1 + s.x2) / 2);
    if (s.type === 'abut') doc.text('ABT', cx2, (yDT + yGL) / 2, { align: 'center', baseline: 'middle' });
    if (s.type === 'pier') doc.text('P', cx2, (yDT + yGL) / 2, { align: 'center', baseline: 'middle' });
    if (s.type === 'vent') {
      doc.setTextColor(30, 80, 180);
      doc.text('VENT', cx2, (yRTL + yGL) / 2, { align: 'center', baseline: 'middle' });
      doc.setTextColor(0);
    }
  });

  doc.setFontSize(5.5); doc.setFont('helvetica', 'normal');
  doc.text(`${inp.numVents} VENTS @ ${f(inp.ventWidth)}m × ${f(inp.ventHeight)}m`, mx(totW / 2), yRTL + 4, { align: 'center' });

  hDim(doc, mx(0), mx(totW), yDT - 8, `${f(totW)}m TOTAL CAUSEWAY WIDTH`);
  secs.filter(s => s.type === 'vent').forEach(s =>
    hDim(doc, mx(s.x1), mx(s.x2), yGL + (yFBL - yGL) * 0.5, `${f(inp.ventWidth)}m`, 3));
  vDim(doc, mx(totW) + 10, yDT, yRTL, `t=${f(inp.deckThickness, 3)}m`);
  if (yHFL < yGL) vDim(doc, mx(totW) + 18, yHFL, yGL, `${f(inp.hfl - inp.gl)}m`, 3);
  vDim(doc, ML - 12, yGL, yFBL, `${f(res.recommendedDepth)}m fdn`);

  const ax = mx(totW) + 28;
  doc.setDrawColor(180, 40, 40); doc.setLineWidth(0.4);
  doc.line(ax, yGL, ax, yFBL);
  doc.line(ax, yGL, ax - 1, yGL + 2.5); doc.line(ax, yGL, ax + 1, yGL + 2.5);
  doc.line(ax, yFBL, ax - 1, yFBL - 2.5); doc.line(ax, yFBL, ax + 1, yFBL - 2.5);
  doc.setFontSize(4.5);
  doc.text(`SCOUR ${f(res.maxScourDepth)}m`, ax + 1.5, (yGL + yFBL) / 2, { baseline: 'middle' });
  doc.setDrawColor(0);

  titleBlock(doc, inp, 'CROSS SECTION AT A-A', 'CS/DRG/01', '1:50 (SCHEMATIC)', '5', '7');
}

function drawLongSection(doc: jsPDF, inp: Inputs, res: ComputedResults) {
  border(doc);
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  const ABUT_W = 0.8, PIER_W = 0.4, FEXT = 0.4, APP = 3.0;
  const totL = inp.numSpans * inp.deckSpan;
  const worldL = totL + 2 * ABUT_W + 2 * APP;
  const deckTop = inp.rtl + inp.deckThickness;
  const minEl = res.fbl - 0.8, maxEl = Math.max(inp.hfl, deckTop) + 0.6;

  const ML = 30, MR = 18, MT = 18, TB = 46;
  const dW = W - ML - MR, dH = H - MT - TB;
  const hS = dW / worldL, vS = dH / (maxEl - minEl);

  const xLA = APP, xCS = xLA + ABUT_W, xCE = xCS + totL, xRA = xCE, xRApp = xRA + ABUT_W;
  const mx = (lx: number) => ML + lx * hS;
  const my = (el: number) => MT + (maxEl - el) * vS;

  const yDT = my(deckTop), yRTL = my(inp.rtl), yHFL = my(inp.hfl), yGL = my(inp.gl), yFBL = my(res.fbl);

  doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.text('SECTION B-B — LONGITUDINAL SECTION', W / 2, 15, { align: 'center' });
  doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
  doc.text('(View along direction of flow)', W / 2, 20, { align: 'center' });

  earth(doc, ML, yGL, dW, yFBL - yGL + 5);

  if (yHFL < yGL) {
    doc.setFillColor(219, 234, 254);
    doc.rect(mx(xCS), yHFL, totL * hS, yGL - yHFL, 'F');
  }

  [[0, xLA], [xRApp, worldL]].forEach(([s, e]) => {
    const rw = (e - s) * hS;
    doc.setFillColor(215, 215, 215); doc.rect(mx(s), yRTL, rw, yGL - yRTL, 'F');
    hatch(doc, mx(s), yRTL, rw, yGL - yRTL);
    doc.setLineWidth(0.4); doc.rect(mx(s), yRTL, rw, yGL - yRTL);
  });

  [[xLA, 'L.ABUT'], [xRA, 'R.ABUT']].forEach(([ax_, lbl]) => {
    const ax = ax_ as number;
    doc.setFillColor(205, 205, 205); doc.rect(mx(ax), yDT, ABUT_W * hS, yGL - yDT, 'F');
    hatch(doc, mx(ax), yDT, ABUT_W * hS, yGL - yDT);
    doc.setLineWidth(0.6); doc.rect(mx(ax), yDT, ABUT_W * hS, yGL - yDT);
    doc.setFillColor(190, 190, 190); doc.rect(mx(ax) - FEXT * hS, yGL, (ABUT_W + 2 * FEXT) * hS, yFBL - yGL, 'F');
    hatch(doc, mx(ax) - FEXT * hS, yGL, (ABUT_W + 2 * FEXT) * hS, yFBL - yGL);
    doc.setLineWidth(0.6); doc.rect(mx(ax) - FEXT * hS, yGL, (ABUT_W + 2 * FEXT) * hS, yFBL - yGL);
    doc.setFontSize(5.5); doc.setFont('helvetica', 'bold');
    doc.text(lbl as string, mx(ax + ABUT_W / 2), (yDT + yGL) / 2, { align: 'center', baseline: 'middle' });
  });

  for (let i = 1; i < inp.numSpans; i++) {
    const px = xCS + i * inp.deckSpan - PIER_W / 2;
    doc.setFillColor(205, 205, 205); doc.rect(mx(px), yRTL, PIER_W * hS, yGL - yRTL, 'F');
    hatch(doc, mx(px), yRTL, PIER_W * hS, yGL - yRTL);
    doc.setLineWidth(0.4); doc.rect(mx(px), yRTL, PIER_W * hS, yGL - yRTL);
    doc.setFillColor(190, 190, 190); doc.rect(mx(px) - FEXT * hS, yGL, (PIER_W + 2 * FEXT) * hS, yFBL - yGL, 'F');
    hatch(doc, mx(px) - FEXT * hS, yGL, (PIER_W + 2 * FEXT) * hS, yFBL - yGL);
    doc.setLineWidth(0.4); doc.rect(mx(px) - FEXT * hS, yGL, (PIER_W + 2 * FEXT) * hS, yFBL - yGL);
    doc.setFontSize(5); doc.setFont('helvetica', 'bold');
    doc.text(`P${i}`, mx(px + PIER_W / 2), (yRTL + yGL) / 2, { align: 'center', baseline: 'middle' });
  }

  doc.setFillColor(195, 195, 195); doc.rect(mx(xLA), yDT, (totL + 2 * ABUT_W) * hS, yRTL - yDT, 'F');
  hatch(doc, mx(xLA), yDT, (totL + 2 * ABUT_W) * hS, yRTL - yDT, 4);
  doc.setLineWidth(0.8); doc.rect(mx(xLA), yDT, (totL + 2 * ABUT_W) * hS, yRTL - yDT);

  const scx = mx((xLA + xRA + ABUT_W) / 2), dip = 0.35 * vS;
  doc.setDrawColor(100, 75, 30); doc.setLineWidth(0.6);
  doc.line(mx(xCS), yGL, scx, yGL + dip);
  doc.line(scx, yGL + dip, mx(xCE), yGL);
  doc.setDrawColor(0);

  levelLine(doc, ML, ML + dW, yHFL, `HFL: ${f(inp.hfl)}m`, [30, 100, 200], true);
  levelLine(doc, ML, ML + dW, yGL, `GL: ${f(inp.gl)}m`, [40, 110, 40]);
  levelLine(doc, ML, ML + dW, yFBL, `FBL: ${f(res.fbl)}m`, [180, 40, 40], true);
  levelLine(doc, mx(0), mx(worldL) + 3, yRTL, `RTL: ${f(inp.rtl)}m`, [90, 90, 90], true);

  for (let i = 0; i < inp.numSpans; i++) {
    const scx2 = mx(xCS + (i + 0.5) * inp.deckSpan);
    doc.setFontSize(6); doc.setFont('helvetica', 'bold'); doc.setTextColor(0);
    doc.text(`S${i + 1}`, scx2, (yDT + yRTL) / 2, { align: 'center', baseline: 'middle' });
  }

  const cutX = mx(xCS + totL / 2);
  doc.setDrawColor(0); doc.setLineWidth(0.6);
  for (let yi = MT; yi < yGL; yi += 4) doc.line(cutX, yi, cutX, Math.min(yi + 2.5, yGL));
  doc.setFontSize(8); doc.setFont('helvetica', 'bold');
  doc.text('A', cutX, MT + 5, { align: 'center' });
  doc.text('A', cutX, yGL - 2, { align: 'center' });

  const faY = H - TB - 14;
  doc.setDrawColor(30, 80, 200); doc.setLineWidth(0.5);
  doc.line(mx(xCS + totL * 0.15), faY, mx(xCS + totL * 0.85), faY);
  doc.line(mx(xCS + totL * 0.85), faY, mx(xCS + totL * 0.85) - 3, faY - 1.5);
  doc.line(mx(xCS + totL * 0.85), faY, mx(xCS + totL * 0.85) - 3, faY + 1.5);
  doc.setFontSize(5.5); doc.setTextColor(30, 80, 200);
  doc.text('FLOW DIRECTION', mx(xCS + totL / 2), faY + 4, { align: 'center' });
  doc.setTextColor(0); doc.setDrawColor(0);

  hDim(doc, mx(xLA), mx(xRA + ABUT_W), yDT - 9, `${f(totL + 2 * ABUT_W)}m TOTAL CAUSEWAY LENGTH (INCL. ABUTMENTS)`);
  hDim(doc, mx(xCS), mx(xCS + inp.deckSpan), yFBL - 7, `${f(inp.deckSpan)}m SPAN`, 3);
  vDim(doc, ML + dW + 8, yGL, yFBL, `SCOUR ${f(res.maxScourDepth)}m`);
  vDim(doc, mx(xLA) - 10, yDT, yRTL, `t=${f(inp.deckThickness, 3)}m`);

  titleBlock(doc, inp, 'LONGITUDINAL SECTION B-B', 'CS/DRG/02', '1:50 (SCHEMATIC)', '6', '7');
}

function drawPlanView(doc: jsPDF, inp: Inputs, res: ComputedResults) {
  border(doc);
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  const ABUT_W = 0.8, APP = 3.0;
  const totL = inp.numSpans * inp.deckSpan;
  const worldL = totL + 2 * ABUT_W + 2 * APP;
  const PMARG = 1.5, worldW = inp.deckWidth + 2 * PMARG;

  const ML = 20, MR = 20, MT = 20, TB = 46, MB = 12;
  const dW = W - ML - MR, dH = H - MT - TB - MB;
  const hS = dW / worldL, vS = dH / worldW;

  const xLA = APP, xCS = xLA + ABUT_W, xCE = xCS + totL, xRA = xCE, xRApp = xRA + ABUT_W;
  const mx = (lx: number) => ML + lx * hS;
  const my = (wy: number) => MT + (wy + PMARG) * vS;

  const yTop = -inp.deckWidth / 2, yBot = inp.deckWidth / 2;
  const bankW = inp.deckWidth * 1.6;

  doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.text('PLAN VIEW', W / 2, 15, { align: 'center' });
  doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
  doc.text('Top-down view — showing vent arrangement and deck layout', W / 2, 20, { align: 'center' });

  doc.setFillColor(219, 234, 254);
  doc.rect(ML, my(-bankW / 2), dW, my(bankW / 2) - my(-bankW / 2), 'F');

  doc.setDrawColor(60, 140, 60); doc.setLineWidth(0.5);
  [my(-bankW / 2), my(bankW / 2)].forEach(y => {
    for (let xi = ML; xi < ML + dW; xi += 7) doc.line(xi, y, Math.min(xi + 5, ML + dW), y);
  });
  doc.setFontSize(5); doc.setTextColor(60, 140, 60);
  doc.text('STREAM BANK', ML + dW / 2, my(-bankW / 2) - 2, { align: 'center' });
  doc.text('STREAM BANK', ML + dW / 2, my(bankW / 2) + 4, { align: 'center' });
  doc.setTextColor(0); doc.setDrawColor(0);

  [[0, xLA], [xRApp, worldL]].forEach(([s, e]) => {
    const rw = (e - s) * hS, rh = inp.deckWidth * vS;
    doc.setFillColor(215, 215, 215); doc.rect(mx(s), my(yTop), rw, rh, 'F');
    hatch(doc, mx(s), my(yTop), rw, rh, 5);
    doc.setLineWidth(0.4); doc.setDrawColor(0); doc.rect(mx(s), my(yTop), rw, rh);
    doc.setFontSize(5.5); doc.setFont('helvetica', 'normal');
    doc.text('APPROACH', mx((s + e) / 2), my(0), { align: 'center', baseline: 'middle' });
  });

  [[xLA, 'L.ABUT'], [xRA, 'R.ABUT']].forEach(([ax_, lbl]) => {
    const ax = ax_ as number;
    const rh = inp.deckWidth * vS;
    doc.setFillColor(195, 195, 195); doc.rect(mx(ax), my(yTop), ABUT_W * hS, rh, 'F');
    hatch(doc, mx(ax), my(yTop), ABUT_W * hS, rh, 4);
    doc.setLineWidth(0.6); doc.rect(mx(ax), my(yTop), ABUT_W * hS, rh);
    doc.setFontSize(5.5); doc.setFont('helvetica', 'bold');
    doc.text(lbl as string, mx(ax + ABUT_W / 2), my(0), { align: 'center', baseline: 'middle' });
  });

  for (let i = 0; i < inp.numSpans; i++) {
    const spX = xCS + i * inp.deckSpan;
    const rh = inp.deckWidth * vS;
    doc.setFillColor(215, 215, 215); doc.rect(mx(spX), my(yTop), inp.deckSpan * hS, rh, 'F');
    earth(doc, mx(spX), my(yTop), inp.deckSpan * hS, rh, 6);
    doc.setLineWidth(0.4); doc.setDrawColor(0); doc.rect(mx(spX), my(yTop), inp.deckSpan * hS, rh);
    doc.setFontSize(7); doc.setFont('helvetica', 'bold');
    doc.text(`S${i + 1}`, mx(spX + inp.deckSpan / 2), my(0), { align: 'center', baseline: 'middle' });
  }

  for (let i = 1; i < inp.numSpans; i++) {
    const px = xCS + i * inp.deckSpan;
    doc.setDrawColor(0); doc.setLineWidth(0.8);
    for (let yi = my(yTop); yi < my(yBot); yi += 5) doc.line(mx(px), yi, mx(px), Math.min(yi + 3, my(yBot)));
  }

  doc.setLineWidth(1); doc.setDrawColor(0);
  doc.rect(mx(xLA), my(yTop), (totL + 2 * ABUT_W) * hS, inp.deckWidth * vS);

  const nax = ML + dW - 22, nay = MT + 20;
  doc.setLineWidth(0.5); doc.setDrawColor(0);
  doc.line(nax, nay + 14, nax, nay - 14);
  doc.line(nax - 6, nay + 6, nax, nay - 14);
  doc.line(nax + 6, nay + 6, nax, nay - 14);
  doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.text('N', nax, nay - 16, { align: 'center' });

  const faY = my(-bankW / 2) - 8;
  doc.setDrawColor(30, 80, 200); doc.setLineWidth(0.6);
  doc.line(mx(worldL * 0.2), faY, mx(worldL * 0.8), faY);
  doc.line(mx(worldL * 0.8), faY, mx(worldL * 0.8) - 4, faY - 1.5);
  doc.line(mx(worldL * 0.8), faY, mx(worldL * 0.8) - 4, faY + 1.5);
  doc.setFontSize(5.5); doc.setTextColor(30, 80, 200);
  doc.text('FLOW DIRECTION', ML + dW / 2, faY - 2.5, { align: 'center' });
  doc.setTextColor(0); doc.setDrawColor(0);

  hDim(doc, mx(xLA), mx(xRA + ABUT_W), my(yBot) + 10, `${f(totL + 2 * ABUT_W)}m TOTAL CAUSEWAY LENGTH`);
  hDim(doc, mx(xCS), mx(xCS + inp.deckSpan), my(yTop) - 8, `${f(inp.deckSpan)}m SPAN`, 5);
  vDim(doc, mx(worldL) + 8, my(yTop), my(yBot), `${f(inp.deckWidth)}m DECK WIDTH`);

  doc.setFontSize(5.5); doc.setFont('helvetica', 'normal');
  doc.text(`N_SPANS = ${inp.numSpans}  |  N_VENTS = ${inp.numVents}  |  VENT: ${f(inp.ventWidth)}m × ${f(inp.ventHeight)}m`,
    ML + dW / 2, H - TB - MB - 4, { align: 'center' });

  titleBlock(doc, inp, 'PLAN VIEW', 'CS/DRG/03', '1:50 (SCHEMATIC)', '7', '7');
}

export function exportDesignPDF(inputs: Inputs, results: ComputedResults) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // ── COVER PAGE ─────────────────────────────────────────────────────────────
  doc.setFillColor(12, 20, 45); doc.rect(0, 0, W, H, 'F');
  doc.setDrawColor(245, 158, 11); doc.setLineWidth(1.5);
  doc.line(15, 15, W - 15, 15);
  doc.line(15, H - 15, W - 15, H - 15);

  doc.setTextColor(245, 158, 11); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text('GOVERNMENT OF INDIA  |  MINISTRY OF ROAD TRANSPORT & HIGHWAYS', W / 2, 25, { align: 'center' });

  doc.setFontSize(22); doc.setTextColor(255, 255, 255);
  doc.text('DESIGN OF VENTED SUBMERSIBLE CAUSEWAY', W / 2, 65, { align: 'center' });
  doc.setFontSize(11); doc.setTextColor(200, 200, 200);
  doc.text('HYDRAULIC & STRUCTURAL DESIGN REPORT', W / 2, 76, { align: 'center' });

  doc.setDrawColor(245, 158, 11); doc.setLineWidth(0.5);
  doc.line(W / 2 - 80, 82, W / 2 + 80, 82);

  doc.setFontSize(9.5); doc.setTextColor(220, 220, 220); doc.setFont('helvetica', 'normal');
  const meta = [
    ['Name of Work', inputs.projectName],
    ['Stream / Road', inputs.streamName],
    ['Location', inputs.location],
    ['Date', inputs.date],
  ];
  meta.forEach(([k, v], i) => {
    doc.setFont('helvetica', 'bold'); doc.text(`${k}:`, W / 2 - 60, 95 + i * 9);
    doc.setFont('helvetica', 'normal'); doc.text(v, W / 2 - 10, 95 + i * 9);
  });

  doc.setTextColor(245, 158, 11); doc.setFontSize(8.5); doc.setFont('helvetica', 'bold');
  doc.text('Designed as per IRC SP:82-2008 & IRC 6:2000', W / 2, 140, { align: 'center' });

  doc.setTextColor(200, 200, 200); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
  doc.text('CONTENTS', W / 2, 160, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  [
    ['Sheet 1', 'Cover Page'],
    ['Sheet 2', 'Design Discharge — Step 1 (Rational / Weir / Area-Velocity)'],
    ['Sheet 3', 'Hydraulic Design — Step 2 (Ventway, Afflux, Scour — IRC SP:82-2008)'],
    ['Sheet 4', 'Structural Design — Step 3 (Loads, Drag, Uplift — IRC 6:2000)'],
    ['Sheet 5', 'Cross Section at A-A — Engineering Drawing'],
    ['Sheet 6', 'Longitudinal Section B-B — Engineering Drawing'],
    ['Sheet 7', 'Plan View — Engineering Drawing'],
  ].forEach(([s, t], i) => {
    doc.text(`${s}`, W / 2 - 60, 170 + i * 8);
    doc.text(t, W / 2 - 30, 170 + i * 8);
  });

  doc.setFontSize(6); doc.setTextColor(120, 120, 120);
  doc.text('Generated by CSWY-CALC 82 — IRC SP:82-2008 Compliant Design Tool', W / 2, H - 20, { align: 'center' });

  // ── SHEET 2: STEP 1 ────────────────────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, H, 'F');
  doc.setTextColor(0); doc.setDrawColor(0);
  border(doc);

  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text('SHEET 2 — STEP 1: DESIGN DISCHARGE', W / 2, 17, { align: 'center' });
  doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text('Discharge computed by three methods; maximum governs.', W / 2, 23, { align: 'center' });
  doc.setLineWidth(0.4); doc.line(12, 26, W - 12, 26);

  autoTable(doc, {
    startY: 30,
    head: [['Method', 'Formula', 'Variables Used', 'Q Result (m³/s)', 'Governs?']],
    body: [
      ['Rational Method', 'Q = (C × I × A) / 3.6', `C=${inputs.runoffCoefficient}, I=${inputs.rainfallIntensity}mm/hr, A=${inputs.catchmentArea}km²`, f(results.qRational), results.governingMethod === 'Rational Method' ? '✓ YES' : 'No'],
      ['Broad-Crested Weir', 'Q = 1.705 × Lw × Hw^1.5', `Lw=${inputs.surplusWeirLength}m, Hw=${inputs.heightOfFallWeir}m`, f(results.qWeir), results.governingMethod === 'Weir Formula' ? '✓ YES' : 'No'],
      ['Area-Velocity Method', 'Q = A_stream × V_mean', `A=${inputs.streamAreaHFL}m², V=${inputs.meanVelocityHFL}m/s`, f(results.qVelocity), results.governingMethod === 'Area-Velocity' ? '✓ YES' : 'No'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [12, 20, 45], textColor: [245, 158, 11], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 }, 1: { cellWidth: 65, fontStyle: 'italic' }, 3: { halign: 'right', fontStyle: 'bold' }, 4: { halign: 'center', fontStyle: 'bold' } },
    didParseCell: (d) => { if (d.column.index === 4 && d.section === 'body' && String(d.cell.raw).startsWith('✓')) d.cell.styles.textColor = [0, 120, 0]; },
  });

  const y2 = (doc as any).lastAutoTable.finalY + 6;
  doc.setFontSize(9.5); doc.setFont('helvetica', 'bold');
  doc.setFillColor(245, 158, 11); doc.rect(12, y2 - 1, W - 24, 12, 'F');
  doc.setTextColor(12, 20, 45);
  doc.text(`DESIGN DISCHARGE  Q = ${f(results.qDesign)} m³/s   (Governed by: ${results.governingMethod})`, W / 2, y2 + 6.5, { align: 'center' });
  doc.setTextColor(0);

  autoTable(doc, {
    startY: y2 + 17,
    head: [['Input Parameter', 'Symbol', 'Value', 'Unit']],
    body: [
      ['Catchment Area', 'A', f(inputs.catchmentArea), 'km²'],
      ['Runoff Coefficient', 'C', f(inputs.runoffCoefficient, 3), '—'],
      ['Rainfall Intensity', 'I', f(inputs.rainfallIntensity, 1), 'mm/hr'],
      ['Surplus Weir Length', 'Lw', f(inputs.surplusWeirLength), 'm'],
      ['Head over Weir', 'Hw', f(inputs.heightOfFallWeir, 3), 'm'],
      ['Stream X-Section Area at HFL', 'A_stream', f(inputs.streamAreaHFL), 'm²'],
      ['Mean Stream Velocity at HFL', 'V_mean', f(inputs.meanVelocityHFL, 3), 'm/s'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [40, 60, 100], fontSize: 8 },
    bodyStyles: { fontSize: 7.5 },
    columnStyles: { 1: { fontStyle: 'italic' }, 2: { halign: 'right', fontStyle: 'bold' } },
  });

  doc.setFontSize(6); doc.setFont('helvetica', 'italic'); doc.setTextColor(100);
  doc.text('Ref: Rational Method (CWC guidelines), Broad-crested weir formula, IRC SP:82-2008', 12, (doc as any).lastAutoTable.finalY + 5);
  doc.setTextColor(0);
  titleBlock(doc, inputs, 'DESIGN DISCHARGE — STEP 1', 'CS/CALC/01', '—', '2', '7');

  // ── SHEET 3: STEP 2 ────────────────────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, H, 'F');
  doc.setTextColor(0); doc.setDrawColor(0);
  border(doc);

  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text('SHEET 3 — STEP 2: HYDRAULIC DESIGN', W / 2, 17, { align: 'center' });
  doc.setLineWidth(0.4); doc.line(12, 21, W - 12, 21);

  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.text('2A. VENTWAY CALCULATIONS (IRC SP:82-2008)', 14, 27);
  autoTable(doc, {
    startY: 30,
    head: [['Parameter', 'Symbol', 'Formula / Basis', 'Value', 'Unit', 'Limit', 'Status']],
    body: [
      ['Number of Vents', 'N', 'Design input', String(inputs.numVents), 'nos', '—', ''],
      ['Vent Width', 'b', 'Design input', f(inputs.ventWidth), 'm', '—', ''],
      ['Vent Height', 'h_v', 'Design input', f(inputs.ventHeight), 'm', '—', ''],
      ['Total Ventway Area', 'A_vent', 'N × b × h_v', f(results.aVent), 'm²', '—', ''],
      ['Flow Area at RTL', 'A_RTL', '(RTL-GL)×(Q/V_app)', f(results.aRTL, 3), 'm²', '—', ''],
      ['Flow Area at HFL', 'A_HFL', '(HFL-GL)×(Q/V_app)', f(results.aHFL, 3), 'm²', '—', ''],
      ['% Obstruction at RTL', '%Obs_RTL', '(1-A_vent/A_RTL)×100', `${f(results.pctObsRTL, 1)}%`, '—', '< 70%', results.passRTL ? 'PASS' : 'FAIL'],
      ['% Obstruction at HFL', '%Obs_HFL', '(1-A_vent/A_HFL)×100', `${f(results.pctObsHFL, 1)}%`, '—', '< 30%', results.passHFL ? 'PASS' : 'FAIL'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [12, 20, 45], textColor: [245, 158, 11], fontSize: 7.5 },
    bodyStyles: { fontSize: 7 },
    columnStyles: { 1: { fontStyle: 'italic', cellWidth: 20 }, 3: { halign: 'right', fontStyle: 'bold' }, 5: { halign: 'center' }, 6: { halign: 'center', fontStyle: 'bold' } },
    didParseCell: (d) => {
      if (d.column.index === 6 && d.section === 'body') {
        const v = String(d.cell.raw);
        if (v === 'PASS') d.cell.styles.textColor = [0, 130, 0];
        if (v === 'FAIL') d.cell.styles.textColor = [200, 0, 0];
      }
    },
  });

  const y3b = (doc as any).lastAutoTable.finalY + 5;
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.text("2B. AFFLUX & SCOUR CALCULATIONS (LACEY'S EQUATIONS)", 14, y3b);
  autoTable(doc, {
    startY: y3b + 4,
    head: [['Parameter', 'Symbol', 'Formula', 'Value', 'Unit']],
    body: [
      ['Velocity at HFL', 'V_HFL', 'Q / A_HFL', f(results.velocityHFL, 3), 'm/s'],
      ["Afflux (Molesworth's formula)", 'h_f', '(V²/17.88+0.015)×((A_HFL/A_vent)²-1)', f(results.hAfflux, 4), 'm'],
      ['Lacey Regime Perimeter', 'P', '4.75 × √Q', f(results.laceyPerimeter, 3), 'm'],
      ['Lacey Silt Factor', 'f', 'Site data (fine sand≈0.6, coarse≈1.5)', f(inputs.siltFactor, 2), '—'],
      ['Lacey Normal Scour Depth', 'R', '0.473 × (Q/f)^(1/3)', f(results.laceyScourDepth, 3), 'm'],
      ['Maximum Scour Depth', 'D_max', '1.27 × R (straight reach, IRC SP:82)', f(results.maxScourDepth, 3), 'm'],
      ['Foundation Bottom Level', 'FBL', 'HFL − D_max', f(results.fbl, 3), 'm'],
      ['Foundation Depth below GL', 'D_fdn', 'GL − FBL', f(results.recommendedDepth, 3), 'm'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [12, 20, 45], textColor: [245, 158, 11], fontSize: 7.5 },
    bodyStyles: { fontSize: 7 },
    columnStyles: { 1: { fontStyle: 'italic', cellWidth: 20 }, 2: { fontStyle: 'italic', cellWidth: 80 }, 3: { halign: 'right', fontStyle: 'bold' } },
  });

  doc.setFontSize(6); doc.setFont('helvetica', 'italic'); doc.setTextColor(100);
  doc.text('Ref: Lacey (1930) regime scour equations, Molesworth afflux formula, IRC SP:82-2008 Cl.6', 12, (doc as any).lastAutoTable.finalY + 4);
  doc.setTextColor(0);
  titleBlock(doc, inputs, 'HYDRAULIC DESIGN — STEP 2', 'CS/CALC/02', '—', '3', '7');

  // ── SHEET 4: STEP 3 ────────────────────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, H, 'F');
  doc.setTextColor(0); doc.setDrawColor(0);
  border(doc);

  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text('SHEET 4 — STEP 3: STRUCTURAL DESIGN', W / 2, 17, { align: 'center' });
  doc.setLineWidth(0.4); doc.line(12, 21, W - 12, 21);

  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.text('3A. LOAD ANALYSIS PER DECK SPAN', 14, 27);
  autoTable(doc, {
    startY: 30,
    head: [['Load Component', 'Symbol', 'Formula', 'Value', 'Unit', 'Per']],
    body: [
      ['Deck Slab Self Weight', 'W_self', 'ρ_c × g × W_dk × L_sp × t_sl / 1000', f(results.wSelf, 3), 'kN', 'per span'],
      ['Silt Load (IRC SP:82-2008)', 'W_silt', 'w_silt × W_deck × L_span', f(results.wSilt, 3), 'kN', 'per span'],
      [`${inputs.liveLoadType} Live Load`, 'W_live', 'Standard axle group', f(results.wLive, 0), 'kN', 'total'],
      ['Total Vertical Load (approx)', 'W_tot', 'Self + Silt + Live/N_spans', f(results.totalVerticalLoad, 3), 'kN', 'per span'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [12, 20, 45], textColor: [245, 158, 11], fontSize: 7.5 },
    bodyStyles: { fontSize: 7 },
    columnStyles: { 0: { fontStyle: 'bold' }, 2: { fontStyle: 'italic', cellWidth: 75 }, 3: { halign: 'right', fontStyle: 'bold' } },
  });

  const y4b = (doc as any).lastAutoTable.finalY + 5;
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.text('3B. HYDRODYNAMIC FORCES (IRC SP:82-2008)', 14, y4b);
  autoTable(doc, {
    startY: y4b + 4,
    head: [['Force', 'Symbol', 'Formula', 'Value (kN)', 'Remarks']],
    body: [
      ['Flow Velocity at HFL', 'V_HFL', 'Q / A_HFL', `${f(results.velocityHFL, 3)} m/s`, 'From Step 2'],
      ['Drag Force per Span', 'F_drag', 'Cd × 0.5 × ρ × V² × (W_dk × t_sl) / 1000', f(results.fDrag, 3), `Cd=${inputs.dragCoefficient} (IRC SP:82)`],
      ['Total Drag Force (all spans)', 'F_drag_T', 'F_drag × N_spans', f(results.fDragTotal, 3), `N=${inputs.numSpans} spans`],
      ['Uplift (Buoyancy) per Span', 'F_uplift', 'ρ_w × g × Vol_deck / 1000', f(results.fUplift, 3), ''],
      ['Net Anchor Force', 'F_anchor', 'F_uplift − W_self', f(results.fAnchor, 3), results.fAnchor > 0 ? 'STAINLESS STEEL ANCHORS REQUIRED' : 'SAFE — No anchors needed'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [12, 20, 45], textColor: [245, 158, 11], fontSize: 7.5 },
    bodyStyles: { fontSize: 7 },
    columnStyles: { 2: { fontStyle: 'italic', cellWidth: 75 }, 3: { halign: 'right', fontStyle: 'bold' }, 4: { fontStyle: 'bold' } },
    didParseCell: (d) => {
      if (d.column.index === 4 && d.section === 'body') {
        const v = String(d.cell.raw);
        if (v.includes('SAFE')) d.cell.styles.textColor = [0, 130, 0];
        if (v.includes('REQUIRED')) d.cell.styles.textColor = [200, 0, 0];
      }
    },
  });

  const y4c = (doc as any).lastAutoTable.finalY + 5;
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.text('3C. COMPLIANCE SUMMARY', 14, y4c);
  autoTable(doc, {
    startY: y4c + 4,
    head: [['Check', 'Result', 'Limit / Criteria', 'Status']],
    body: [
      ['Ventway obstruction @ RTL', `${f(results.pctObsRTL, 1)}%`, '< 70% (IRC SP:82-2008)', results.passRTL ? 'PASS' : 'FAIL'],
      ['Ventway obstruction @ HFL', `${f(results.pctObsHFL, 1)}%`, '< 30% (IRC SP:82-2008)', results.passHFL ? 'PASS' : 'FAIL'],
      ['Foundation depth vs scour', `${f(results.recommendedDepth, 2)}m below GL`, '> 0.5m below max scour', results.scourSafe ? 'SAFE' : 'REVIEW'],
      ['Deck uplift resistance', results.fAnchor > 0 ? 'Anchors needed' : 'Self-weight adequate', 'W_self > F_uplift', results.fAnchor <= 0 ? 'SAFE' : 'ANCHORS REQD'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [12, 20, 45], textColor: [245, 158, 11], fontSize: 7.5 },
    bodyStyles: { fontSize: 7.5 },
    columnStyles: { 1: { halign: 'center' }, 3: { halign: 'center', fontStyle: 'bold' } },
    didParseCell: (d) => {
      if (d.column.index === 3 && d.section === 'body') {
        const v = String(d.cell.raw);
        if (v === 'PASS' || v === 'SAFE') d.cell.styles.textColor = [0, 130, 0];
        if (v === 'FAIL' || v.includes('REQD') || v === 'REVIEW') d.cell.styles.textColor = [200, 0, 0];
      }
    },
  });

  doc.setFontSize(6); doc.setFont('helvetica', 'italic'); doc.setTextColor(100);
  doc.text('Ref: IRC 6:2000 (Loads & Combinations), IRC SP:82-2008 (Drag / Uplift / Silt on deck), IRC Class A/AA standard loading', 12, (doc as any).lastAutoTable.finalY + 4);
  doc.setTextColor(0);
  titleBlock(doc, inputs, 'STRUCTURAL DESIGN — STEP 3', 'CS/CALC/03', '—', '4', '7');

  // ── SHEETS 5–7: DRAWINGS ───────────────────────────────────────────────────
  doc.addPage(); doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, H, 'F');
  doc.setTextColor(0); doc.setDrawColor(0); doc.setLineWidth(0.3);
  drawCrossSection(doc, inputs, results);

  doc.addPage(); doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, H, 'F');
  doc.setTextColor(0); doc.setDrawColor(0); doc.setLineWidth(0.3);
  drawLongSection(doc, inputs, results);

  doc.addPage(); doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, H, 'F');
  doc.setTextColor(0); doc.setDrawColor(0); doc.setLineWidth(0.3);
  drawPlanView(doc, inputs, results);

  const filename = `Causeway_Design_${inputs.projectName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
  doc.save(filename);
}
