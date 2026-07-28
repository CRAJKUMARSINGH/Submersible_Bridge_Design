import React, { useState } from 'react';
import { useCalculations } from '../lib/calculations';
import type { Inputs, ComputedResults } from '../lib/calculations';
import { exportDesignPDF } from '../lib/pdf-export';
import { FileDown, Layers } from 'lucide-react';

// ─── Shared SVG helpers ───────────────────────────────────────────────────────

function HatchLines({ x, y, w, h, step = 9, stroke = '#555', sw = 0.6 }: {
  x: number; y: number; w: number; h: number; step?: number; stroke?: string; sw?: number;
}) {
  const lines: React.ReactElement[] = [];
  for (let d = -h; d < w; d += step) {
    const pts: [number, number][] = [];
    const xT = x + Math.max(0, d); if (xT >= x && xT <= x + w) pts.push([xT, y]);
    const xB = x + Math.min(w, d + h); if (xB >= x && xB <= x + w) pts.push([xB, y + h]);
    const yL = x - d; if (yL >= y && yL <= y + h) pts.push([x, yL]);
    const yR = x + w - d; if (yR >= y && yR <= y + h) pts.push([x + w, yR]);
    if (pts.length >= 2)
      lines.push(<line key={d} x1={pts[0][0]} y1={pts[0][1]} x2={pts[1][0]} y2={pts[1][1]} stroke={stroke} strokeWidth={sw} />);
  }
  return <>{lines}</>;
}

function EarthLines({ x, y, w, h, step = 9, stroke = '#aaa', sw = 0.5 }: {
  x: number; y: number; w: number; h: number; step?: number; stroke?: string; sw?: number;
}) {
  const lines: React.ReactElement[] = [];
  for (let yi = y + step / 2; yi < y + h; yi += step)
    lines.push(<line key={yi} x1={x} y1={yi} x2={x + w} y2={yi} stroke={stroke} strokeWidth={sw} />);
  return <>{lines}</>;
}

function HDim({ x1, x2, y, label, extH = 8 }: { x1: number; x2: number; y: number; label: string; extH?: number }) {
  const A = 7, W = 3.5;
  return (
    <g fill="none" stroke="#222" strokeWidth="0.8">
      <line x1={x1} y1={y - extH} x2={x1} y2={y + 3} />
      <line x1={x2} y1={y - extH} x2={x2} y2={y + 3} />
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <polygon points={`${x1},${y} ${x1 + A},${y - W} ${x1 + A},${y + W}`} fill="#222" stroke="none" />
      <polygon points={`${x2},${y} ${x2 - A},${y - W} ${x2 - A},${y + W}`} fill="#222" stroke="none" />
      <text x={(x1 + x2) / 2} y={y - 3} textAnchor="middle" fontSize="9.5" fill="#222" fontFamily="monospace" stroke="none">{label}</text>
    </g>
  );
}

function VDim({ x, y1, y2, label, extR = 10 }: { x: number; y1: number; y2: number; label: string; extR?: number }) {
  const A = 6, W = 3;
  const my = (y1 + y2) / 2;
  return (
    <g fill="none" stroke="#222" strokeWidth="0.8">
      <line x1={x - 3} y1={y1} x2={x + extR} y2={y1} />
      <line x1={x - 3} y1={y2} x2={x + extR} y2={y2} />
      <line x1={x} y1={y1} x2={x} y2={y2} />
      <polygon points={`${x},${y1} ${x - W},${y1 + A} ${x + W},${y1 + A}`} fill="#222" stroke="none" />
      <polygon points={`${x},${y2} ${x - W},${y2 - A} ${x + W},${y2 - A}`} fill="#222" stroke="none" />
      <text x={x + extR + 2} y={my} textAnchor="start" dominantBaseline="middle" fontSize="9" fill="#222" fontFamily="monospace" stroke="none">{label}</text>
    </g>
  );
}

function TitleBlock({ inp, title, drwNo, scale, sheet, total, svgW, svgH, tbH = 72 }: {
  inp: Inputs; title: string; drwNo: string; scale: string;
  sheet: string; total: string; svgW: number; svgH: number; tbH?: number;
}) {
  const bx = 8, by = svgH - tbH - 8, bw = svgW - 16;
  const rightW = 105, midX = bx + (bw - rightW) / 2;
  const row = tbH / 3;
  return (
    <g fontFamily="monospace">
      <rect x={bx} y={by} width={bw} height={tbH} fill="white" stroke="#000" strokeWidth="1.5" />
      <line x1={midX} y1={by} x2={midX} y2={by + tbH} stroke="#000" strokeWidth="0.8" />
      <line x1={bx + bw - rightW} y1={by} x2={bx + bw - rightW} y2={by + tbH} stroke="#000" strokeWidth="0.8" />
      <line x1={bx + bw - rightW / 2} y1={by} x2={bx + bw - rightW / 2} y2={by + tbH} stroke="#000" strokeWidth="0.8" />
      <line x1={bx} y1={by + row} x2={midX} y2={by + row} stroke="#000" strokeWidth="0.8" />
      <line x1={bx} y1={by + row * 2} x2={midX} y2={by + row * 2} stroke="#000" strokeWidth="0.8" />
      <line x1={midX} y1={by + row} x2={bx + bw - rightW} y2={by + row} stroke="#000" strokeWidth="0.8" />
      <line x1={midX} y1={by + row * 2} x2={bx + bw - rightW} y2={by + row * 2} stroke="#000" strokeWidth="0.8" />
      <line x1={bx + bw - rightW} y1={by + tbH / 2} x2={bx + bw} y2={by + tbH / 2} stroke="#000" strokeWidth="0.8" />

      {['PROJECT:', 'STREAM:', 'LOCATION:'].map((l, i) => (
        <text key={l} x={bx + 4} y={by + i * row + 7} fontSize="7" fill="#666" fontWeight="bold">{l}</text>
      ))}
      <text x={bx + 4} y={by + 17} fontSize="10" fill="#000" fontWeight="bold">{inp.projectName}</text>
      <text x={bx + 4} y={by + row + 17} fontSize="9" fill="#000">{inp.streamName}</text>
      <text x={bx + 4} y={by + row * 2 + 17} fontSize="9" fill="#000">{inp.location}</text>

      {['DRAWING TITLE:', 'DRG. NO.:', 'DATE:'].map((l, i) => (
        <text key={l} x={midX + 4} y={by + i * row + 7} fontSize="7" fill="#666" fontWeight="bold">{l}</text>
      ))}
      <text x={midX + 4} y={by + 17} fontSize="10" fill="#000" fontWeight="bold">{title}</text>
      <text x={midX + 4} y={by + row + 17} fontSize="9" fill="#000">{drwNo}</text>
      <text x={midX + 4} y={by + row * 2 + 17} fontSize="9" fill="#000">{inp.date}</text>

      <text x={bx + bw - rightW + rightW / 4} y={by + 10} textAnchor="middle" fontSize="7" fill="#666" fontWeight="bold">SCALE</text>
      <text x={bx + bw - rightW + rightW / 4} y={by + tbH / 2 - 2} textAnchor="middle" fontSize="11" fill="#000" fontWeight="bold">{scale}</text>

      <text x={bx + bw - rightW / 4} y={by + 10} textAnchor="middle" fontSize="7" fill="#666" fontWeight="bold">SHEET</text>
      <text x={bx + bw - rightW / 4} y={by + tbH / 2 - 4} textAnchor="middle" fontSize="16" fill="#000" fontWeight="bold">{sheet}</text>
      <text x={bx + bw - rightW / 4} y={by + tbH / 2 + 10} textAnchor="middle" fontSize="8" fill="#666">of {total}</text>

      <text x={bx + 4} y={by + tbH - 3} fontSize="6" fill="#999" fontStyle="italic">
        Designed as per IRC SP:82-2008 &amp; IRC 6:2000
      </text>
    </g>
  );
}

// ─── CROSS SECTION A-A ────────────────────────────────────────────────────────

function CrossSectionSVG({ inp, res }: { inp: Inputs; res: ComputedResults }) {
  const PIER_W = 0.4, ABUT_W = 0.6, FEXT = 0.4;
  const nPiers = inp.numVents - 1;
  const totW = 2 * ABUT_W + nPiers * PIER_W + inp.numVents * inp.ventWidth;
  const deckTop = inp.rtl + inp.deckThickness;

  const minEl = res.fbl - 0.8;
  const maxEl = Math.max(inp.hfl, deckTop) + 0.7;
  const elRange = maxEl - minEl;

  const SVG_W = 960, SVG_H = 620;
  const ML = 100, MR = 65, MT = 56, TITLE_H = 80;
  const dW = SVG_W - ML - MR, dH = SVG_H - MT - TITLE_H - 10;
  const wMarg = Math.max(1.2, totW * 0.2);
  const worldW = totW + 2 * wMarg;
  const hS = dW / worldW, vS = dH / elRange;

  const mx = (wx: number) => ML + (wx + wMarg) * hS;
  const my = (el: number) => MT + (maxEl - el) * vS;

  const yDT = my(deckTop), yRTL = my(inp.rtl), yHFL = my(inp.hfl);
  const yGL = my(inp.gl), yFBL = my(res.fbl);

  type Sec = { x1: number; x2: number; kind: 'abut' | 'vent' | 'pier' };
  const secs: Sec[] = [];
  let cx = 0;
  secs.push({ x1: cx, x2: cx + ABUT_W, kind: 'abut' }); cx += ABUT_W;
  for (let i = 0; i < inp.numVents; i++) {
    secs.push({ x1: cx, x2: cx + inp.ventWidth, kind: 'vent' }); cx += inp.ventWidth;
    if (i < inp.numVents - 1) { secs.push({ x1: cx, x2: cx + PIER_W, kind: 'pier' }); cx += PIER_W; }
  }
  secs.push({ x1: cx, x2: cx + ABUT_W, kind: 'abut' });

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full bg-white" style={{ fontFamily: 'monospace' }}>
      <rect width={SVG_W} height={SVG_H} fill="white" />
      <rect x="5" y="5" width={SVG_W - 10} height={SVG_H - TITLE_H - 18} fill="none" stroke="#000" strokeWidth="2.5" />
      <rect x="9" y="9" width={SVG_W - 18} height={SVG_H - TITLE_H - 26} fill="none" stroke="#000" strokeWidth="0.8" />

      <text x={SVG_W / 2} y={30} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000">SECTION A-A — TRANSVERSE CROSS SECTION</text>
      <text x={SVG_W / 2} y={46} textAnchor="middle" fontSize="9.5" fill="#555">(View perpendicular to direction of flow)</text>

      <rect x={ML - 10} y={yGL} width={dW + 15} height={yFBL - yGL + 20} fill="#f3ede0" />
      <EarthLines x={ML - 10} y={yGL} w={dW + 15} h={yFBL - yGL + 20} step={10} />

      {secs.filter(s => s.kind === 'vent').map((s, i) => {
        const wTop = Math.min(yHFL, yRTL);
        if (wTop >= yGL) return null;
        return <rect key={i} x={mx(s.x1)} y={wTop} width={(s.x2 - s.x1) * hS} height={yGL - wTop} fill="#bfdbfe" opacity="0.75" />;
      })}

      {secs.filter(s => s.kind !== 'vent').map((s, i) => {
        const fx = mx(s.x1) - FEXT * hS, fw = (s.x2 - s.x1 + 2 * FEXT) * hS;
        return (
          <g key={i}>
            <rect x={fx} y={yGL} width={fw} height={yFBL - yGL} fill="#d4d4d4" stroke="#000" strokeWidth="1.2" />
            <HatchLines x={fx} y={yGL} w={fw} h={yFBL - yGL} step={8} />
          </g>
        );
      })}

      {secs.filter(s => s.kind !== 'vent').map((s, i) => {
        const x = mx(s.x1), w = (s.x2 - s.x1) * hS;
        return (
          <g key={i}>
            <rect x={x} y={yDT} width={w} height={yGL - yDT} fill="#d9d9d9" stroke="#000" strokeWidth={s.kind === 'abut' ? 1.8 : 1.2} />
            <HatchLines x={x} y={yDT} w={w} h={yGL - yDT} step={8} />
          </g>
        );
      })}

      <rect x={mx(0)} y={yDT} width={totW * hS} height={yRTL - yDT} fill="#c8c8c8" stroke="#000" strokeWidth="2.2" />
      <HatchLines x={mx(0)} y={yDT} w={totW * hS} h={yRTL - yDT} step={9} stroke="#444" />

      {secs.filter(s => s.kind === 'vent').map((s, i) => (
        <rect key={i} x={mx(s.x1)} y={yRTL} width={(s.x2 - s.x1) * hS} height={yGL - yRTL}
          fill="none" stroke="#000" strokeWidth="1.5" />
      ))}

      <line x1={ML - 48} x2={ML + dW + 10} y1={yHFL} y2={yHFL} stroke="#2563eb" strokeWidth="1.8" strokeDasharray="12 5" />
      <line x1={mx(0) - 8} x2={mx(totW) + 8} y1={yRTL} y2={yRTL} stroke="#555" strokeWidth="1.2" strokeDasharray="9 4" />
      <line x1={ML - 48} x2={ML + dW + 10} y1={yGL} y2={yGL} stroke="#15803d" strokeWidth="2.2" />
      <line x1={ML - 48} x2={ML + dW + 10} y1={yFBL} y2={yFBL} stroke="#dc2626" strokeWidth="1.4" strokeDasharray="7 4" />

      <text x={ML - 50} y={yHFL} textAnchor="end" dominantBaseline="middle" fontSize="10.5" fill="#2563eb" fontWeight="bold">HFL {inp.hfl.toFixed(2)}m</text>
      <text x={ML - 50} y={yRTL} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#555">RTL {inp.rtl.toFixed(2)}m</text>
      <text x={ML - 50} y={yGL} textAnchor="end" dominantBaseline="middle" fontSize="10.5" fill="#15803d" fontWeight="bold">GL {inp.gl.toFixed(2)}m</text>
      <text x={ML - 50} y={yFBL} textAnchor="end" dominantBaseline="middle" fontSize="10.5" fill="#dc2626" fontWeight="bold">FBL {res.fbl.toFixed(2)}m</text>

      <HDim x1={mx(0)} x2={mx(totW)} y={yDT - 22} label={`${totW.toFixed(2)}m TOTAL CAUSEWAY WIDTH`} extH={14} />
      {secs.filter(s => s.kind === 'vent').map((s, i) => (
        <HDim key={i} x1={mx(s.x1)} x2={mx(s.x2)} y={yGL + (yFBL - yGL) * 0.45} label={`${inp.ventWidth.toFixed(2)}m`} extH={5} />
      ))}
      <VDim x={mx(totW) + 28} y1={yDT} y2={yRTL} label={`t = ${inp.deckThickness.toFixed(3)}m`} extR={14} />
      {yHFL < yGL && <VDim x={mx(totW) + 46} y1={yHFL} y2={yGL} label={`d = ${(inp.hfl - inp.gl).toFixed(2)}m`} extR={12} />}
      <VDim x={ML - 72} y1={yGL} y2={yFBL} label={`Fdn ${res.recommendedDepth.toFixed(2)}m`} extR={12} />

      {(() => {
        const ax = mx(totW) + 58;
        return (
          <g stroke="#dc2626" strokeWidth="1.2" fill="none">
            <line x1={ax} y1={yGL} x2={ax} y2={yFBL} />
            <polygon points={`${ax},${yGL} ${ax - 3.5},${yGL + 9} ${ax + 3.5},${yGL + 9}`} fill="#dc2626" stroke="none" />
            <polygon points={`${ax},${yFBL} ${ax - 3.5},${yFBL - 9} ${ax + 3.5},${yFBL - 9}`} fill="#dc2626" stroke="none" />
            <text x={ax + 5} y={(yGL + yFBL) / 2 - 4} fontSize="9" fill="#dc2626" stroke="none">SCOUR</text>
            <text x={ax + 5} y={(yGL + yFBL) / 2 + 8} fontSize="9" fill="#dc2626" stroke="none">{res.maxScourDepth.toFixed(2)}m</text>
          </g>
        );
      })()}

      {secs.map((s, i) => {
        const cx2 = mx((s.x1 + s.x2) / 2), cy = (yDT + yGL) / 2;
        if (s.kind === 'vent') return (
          <text key={i} x={mx((s.x1 + s.x2) / 2)} y={(yRTL + yGL) / 2} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#1d4ed8" fontWeight="bold">VENT</text>
        );
        return <text key={i} x={cx2} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#000" fontWeight="bold">{s.kind === 'abut' ? 'ABT' : 'P'}</text>;
      })}

      <text x={mx(totW / 2)} y={yRTL + 13} textAnchor="middle" fontSize="10" fill="#555">
        {inp.numVents} VENTS @ {inp.ventWidth.toFixed(2)}m × {inp.ventHeight.toFixed(2)}m (W×H)
      </text>

      <TitleBlock inp={inp} title="CROSS SECTION AT A-A" drwNo="CS/DRG/01" scale="1:50" sheet="5" total="7" svgW={SVG_W} svgH={SVG_H} tbH={TITLE_H} />
    </svg>
  );
}

// ─── LONGITUDINAL SECTION B-B ─────────────────────────────────────────────────

function LongitudinalSVG({ inp, res }: { inp: Inputs; res: ComputedResults }) {
  const ABUT_W = 0.8, PIER_W = 0.4, FEXT = 0.4, APP = 3.0;
  const totL = inp.numSpans * inp.deckSpan;
  const worldL = totL + 2 * ABUT_W + 2 * APP;
  const deckTop = inp.rtl + inp.deckThickness;
  const minEl = res.fbl - 0.8, maxEl = Math.max(inp.hfl, deckTop) + 0.7;

  const SVG_W = 960, SVG_H = 620;
  const ML = 100, MR = 30, MT = 56, TITLE_H = 80;
  const dW = SVG_W - ML - MR, dH = SVG_H - MT - TITLE_H - 10;
  const hS = dW / worldL, vS = dH / (maxEl - minEl);

  const xLA = APP, xCS = xLA + ABUT_W, xCE = xCS + totL, xRA = xCE, xRApp = xRA + ABUT_W;
  const mx = (lx: number) => ML + lx * hS;
  const my = (el: number) => MT + (maxEl - el) * vS;

  const yDT = my(deckTop), yRTL = my(inp.rtl), yHFL = my(inp.hfl);
  const yGL = my(inp.gl), yFBL = my(res.fbl);

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full bg-white" style={{ fontFamily: 'monospace' }}>
      <rect width={SVG_W} height={SVG_H} fill="white" />
      <rect x="5" y="5" width={SVG_W - 10} height={SVG_H - TITLE_H - 18} fill="none" stroke="#000" strokeWidth="2.5" />
      <rect x="9" y="9" width={SVG_W - 18} height={SVG_H - TITLE_H - 26} fill="none" stroke="#000" strokeWidth="0.8" />

      <text x={SVG_W / 2} y={30} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000">SECTION B-B — LONGITUDINAL SECTION</text>
      <text x={SVG_W / 2} y={46} textAnchor="middle" fontSize="9.5" fill="#555">(View along direction of flow — side elevation)</text>

      <rect x={ML} y={yGL} width={dW} height={yFBL - yGL + 20} fill="#f3ede0" />
      <EarthLines x={ML} y={yGL} w={dW} h={yFBL - yGL + 20} step={10} />

      {yHFL < yGL && (
        <rect x={mx(xCS)} y={yHFL} width={totL * hS} height={yGL - yHFL} fill="#bfdbfe" opacity="0.6" />
      )}

      {([[0, xLA], [xRApp, worldL]] as [number, number][]).map(([s, e], i) => (
        <g key={i}>
          <rect x={mx(s)} y={yRTL} width={(e - s) * hS} height={yGL - yRTL} fill="#d4d4d4" stroke="#000" strokeWidth="1" />
          <HatchLines x={mx(s)} y={yRTL} w={(e - s) * hS} h={yGL - yRTL} step={9} />
          <text x={mx((s + e) / 2)} y={(yRTL + yGL) / 2} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#555">APPROACH</text>
        </g>
      ))}

      {([[xLA, 'L.ABUT'], [xRA, 'R.ABUT']] as [number, string][]).map(([ax, lbl], i) => (
        <g key={i}>
          <rect x={mx(ax as number)} y={yDT} width={ABUT_W * hS} height={yGL - yDT} fill="#cacaca" stroke="#000" strokeWidth="1.8" />
          <HatchLines x={mx(ax as number)} y={yDT} w={ABUT_W * hS} h={yGL - yDT} step={8} />
          <rect x={mx(ax as number) - FEXT * hS} y={yGL} width={(ABUT_W + 2 * FEXT) * hS} height={yFBL - yGL} fill="#bbb" stroke="#000" strokeWidth="1.5" />
          <HatchLines x={mx(ax as number) - FEXT * hS} y={yGL} w={(ABUT_W + 2 * FEXT) * hS} h={yFBL - yGL} step={8} />
          <text x={mx((ax as number) + ABUT_W / 2)} y={(yDT + yGL) / 2} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="bold" fill="#000">{lbl}</text>
        </g>
      ))}

      {Array.from({ length: inp.numSpans - 1 }, (_, i) => {
        const px = xCS + (i + 1) * inp.deckSpan - PIER_W / 2;
        return (
          <g key={i}>
            <rect x={mx(px)} y={yRTL} width={PIER_W * hS} height={yGL - yRTL} fill="#cacaca" stroke="#000" strokeWidth="1.2" />
            <HatchLines x={mx(px)} y={yRTL} w={PIER_W * hS} h={yGL - yRTL} step={8} />
            <rect x={mx(px) - FEXT * hS} y={yGL} width={(PIER_W + 2 * FEXT) * hS} height={yFBL - yGL} fill="#bbb" stroke="#000" strokeWidth="1" />
            <HatchLines x={mx(px) - FEXT * hS} y={yGL} w={(PIER_W + 2 * FEXT) * hS} h={yFBL - yGL} step={8} />
            <text x={mx(px + PIER_W / 2)} y={(yRTL + yGL) / 2} textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fontWeight="bold" fill="#000">P{i + 1}</text>
          </g>
        );
      })}

      <rect x={mx(xLA)} y={yDT} width={(totL + 2 * ABUT_W) * hS} height={yRTL - yDT} fill="#c0c0c0" stroke="#000" strokeWidth="2.2" />
      <HatchLines x={mx(xLA)} y={yDT} w={(totL + 2 * ABUT_W) * hS} h={yRTL - yDT} step={9} stroke="#444" />

      {(() => {
        const scx = mx((xLA + xRA + ABUT_W) / 2), dip = 0.4 * vS;
        return <polyline points={`${mx(xCS)},${yGL} ${scx},${yGL + dip} ${mx(xCE)},${yGL}`} fill="none" stroke="#7c5d2e" strokeWidth="1.8" />;
      })()}

      <line x1={ML - 50} x2={ML + dW + 5} y1={yHFL} y2={yHFL} stroke="#2563eb" strokeWidth="1.8" strokeDasharray="12 5" />
      <line x1={ML - 50} x2={ML + dW + 5} y1={yGL} y2={yGL} stroke="#15803d" strokeWidth="2.2" />
      <line x1={ML - 50} x2={ML + dW + 5} y1={yFBL} y2={yFBL} stroke="#dc2626" strokeWidth="1.4" strokeDasharray="7 4" />
      <line x1={mx(0)} x2={mx(worldL) + 5} y1={yRTL} y2={yRTL} stroke="#555" strokeWidth="1.2" strokeDasharray="9 4" />

      <text x={ML - 52} y={yHFL} textAnchor="end" dominantBaseline="middle" fontSize="10.5" fill="#2563eb" fontWeight="bold">HFL {inp.hfl.toFixed(2)}m</text>
      <text x={ML - 52} y={yRTL} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#555">RTL {inp.rtl.toFixed(2)}m</text>
      <text x={ML - 52} y={yGL} textAnchor="end" dominantBaseline="middle" fontSize="10.5" fill="#15803d" fontWeight="bold">GL {inp.gl.toFixed(2)}m</text>
      <text x={ML - 52} y={yFBL} textAnchor="end" dominantBaseline="middle" fontSize="10.5" fill="#dc2626" fontWeight="bold">FBL {res.fbl.toFixed(2)}m</text>

      <HDim x1={mx(xLA)} x2={mx(xRA + ABUT_W)} y={yDT - 22} label={`${(totL + 2 * ABUT_W).toFixed(2)}m TOTAL CAUSEWAY LENGTH (INCL. ABUTMENTS)`} extH={14} />
      <HDim x1={mx(xCS)} x2={mx(xCS + inp.deckSpan)} y={yFBL - 15} label={`${inp.deckSpan.toFixed(2)}m SPAN`} extH={6} />
      <VDim x={ML + dW + 20} y1={yGL} y2={yFBL} label={`SCOUR ${res.maxScourDepth.toFixed(2)}m`} extR={14} />
      <VDim x={mx(xLA) - 16} y1={yDT} y2={yRTL} label={`t=${inp.deckThickness.toFixed(3)}m`} extR={10} />

      {(() => {
        const cx2 = mx(xCS + totL / 2);
        return (
          <g>
            <line x1={cx2} y1={MT + 2} x2={cx2} y2={yGL - 2} stroke="#000" strokeWidth="1.5" strokeDasharray="6 3" />
            <text x={cx2} y={MT + 12} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000">A</text>
            <text x={cx2} y={yGL - 4} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000">A</text>
          </g>
        );
      })()}

      {Array.from({ length: inp.numSpans }, (_, i) => (
        <text key={i} x={mx(xCS + (i + 0.5) * inp.deckSpan)} y={(yDT + yRTL) / 2}
          textAnchor="middle" dominantBaseline="middle" fontSize="10.5" fontWeight="bold" fill="#000">S{i + 1}</text>
      ))}

      {(() => {
        const fy = SVG_H - TITLE_H - 18;
        return (
          <g stroke="#2563eb" strokeWidth="1.5" fill="none">
            <line x1={mx(xCS + totL * 0.15)} y1={fy - 12} x2={mx(xCS + totL * 0.85)} y2={fy - 12} />
            <polygon points={`${mx(xCS + totL * 0.85)},${fy - 12} ${mx(xCS + totL * 0.85) - 10},${fy - 17} ${mx(xCS + totL * 0.85) - 10},${fy - 7}`} fill="#2563eb" stroke="none" />
            <text x={mx(xCS + totL / 2)} y={fy - 1} textAnchor="middle" fontSize="9.5" fill="#2563eb" stroke="none">FLOW DIRECTION</text>
          </g>
        );
      })()}

      <TitleBlock inp={inp} title="LONGITUDINAL SECTION B-B" drwNo="CS/DRG/02" scale="1:50" sheet="6" total="7" svgW={SVG_W} svgH={SVG_H} tbH={TITLE_H} />
    </svg>
  );
}

// ─── PLAN VIEW ────────────────────────────────────────────────────────────────

function PlanViewSVG({ inp }: { inp: Inputs }) {
  const ABUT_W = 0.8, APP = 3.0;
  const totL = inp.numSpans * inp.deckSpan;
  const worldL = totL + 2 * ABUT_W + 2 * APP;
  const PMARG = 1.6, worldW = inp.deckWidth + 2 * PMARG;

  const SVG_W = 960, SVG_H = 580;
  const ML = 28, MR = 28, MT = 56, TITLE_H = 80;
  const dW = SVG_W - ML - MR, dH = SVG_H - MT - TITLE_H - 12;
  const hS = dW / worldL, vS = dH / worldW;

  const xLA = APP, xCS = xLA + ABUT_W, xCE = xCS + totL, xRA = xCE, xRApp = xRA + ABUT_W;
  const yTop = -inp.deckWidth / 2, yBot = inp.deckWidth / 2;
  const bankW = inp.deckWidth * 1.6;

  const mx = (lx: number) => ML + lx * hS;
  const my = (wy: number) => MT + (wy + PMARG) * vS;

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full bg-white" style={{ fontFamily: 'monospace' }}>
      <rect width={SVG_W} height={SVG_H} fill="white" />
      <rect x="5" y="5" width={SVG_W - 10} height={SVG_H - TITLE_H - 18} fill="none" stroke="#000" strokeWidth="2.5" />
      <rect x="9" y="9" width={SVG_W - 18} height={SVG_H - TITLE_H - 26} fill="none" stroke="#000" strokeWidth="0.8" />

      <text x={SVG_W / 2} y={30} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000">PLAN VIEW</text>
      <text x={SVG_W / 2} y={46} textAnchor="middle" fontSize="9.5" fill="#555">(Top-down — showing deck layout, vent positions, and approach road)</text>

      <rect x={ML} y={my(-bankW / 2)} width={dW} height={my(bankW / 2) - my(-bankW / 2)} fill="#dbeafe" opacity="0.4" />

      {[my(-bankW / 2), my(bankW / 2)].map((y, i) => (
        <line key={i} x1={ML} y1={y} x2={ML + dW} y2={y} stroke="#16a34a" strokeWidth="1.5" strokeDasharray="9 4" />
      ))}
      <text x={SVG_W / 2} y={my(-bankW / 2) - 5} textAnchor="middle" fontSize="9" fill="#16a34a">STREAM BANK (APPROX.)</text>
      <text x={SVG_W / 2} y={my(bankW / 2) + 13} textAnchor="middle" fontSize="9" fill="#16a34a">STREAM BANK (APPROX.)</text>

      {([[0, xLA], [xRApp, worldL]] as [number, number][]).map(([s, e], i) => {
        const rw = (e - s) * hS, rh = inp.deckWidth * vS;
        return (
          <g key={i}>
            <rect x={mx(s)} y={my(yTop)} width={rw} height={rh} fill="#ddd" stroke="#000" strokeWidth="1" />
            <HatchLines x={mx(s)} y={my(yTop)} w={rw} h={rh} step={12} />
            <text x={mx((s + e) / 2)} y={my(0)} textAnchor="middle" dominantBaseline="middle" fontSize="9.5" fill="#555">ROAD</text>
          </g>
        );
      })}

      {([[xLA, 'L.ABT'], [xRA, 'R.ABT']] as [number, string][]).map(([ax, lbl], i) => {
        const rh = inp.deckWidth * vS;
        return (
          <g key={i}>
            <rect x={mx(ax as number)} y={my(yTop)} width={ABUT_W * hS} height={rh} fill="#c0c0c0" stroke="#000" strokeWidth="1.8" />
            <HatchLines x={mx(ax as number)} y={my(yTop)} w={ABUT_W * hS} h={rh} step={8} />
            <text x={mx((ax as number) + ABUT_W / 2)} y={my(0)} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="bold" fill="#000">{lbl}</text>
          </g>
        );
      })}

      {Array.from({ length: inp.numSpans }, (_, i) => {
        const spX = xCS + i * inp.deckSpan, rh = inp.deckWidth * vS;
        return (
          <g key={i}>
            <rect x={mx(spX)} y={my(yTop)} width={inp.deckSpan * hS} height={rh} fill="#d5d5d5" stroke="#000" strokeWidth="1" />
            <EarthLines x={mx(spX)} y={my(yTop)} w={inp.deckSpan * hS} h={rh} step={8} stroke="#bbb" />
            <text x={mx(spX + inp.deckSpan / 2)} y={my(0)} textAnchor="middle" dominantBaseline="middle" fontSize="11.5" fontWeight="bold" fill="#000">S{i + 1}</text>
          </g>
        );
      })}

      {Array.from({ length: inp.numSpans - 1 }, (_, i) => {
        const px = xCS + (i + 1) * inp.deckSpan;
        return <line key={i} x1={mx(px)} y1={my(yTop)} x2={mx(px)} y2={my(yBot)} stroke="#000" strokeWidth="1.8" strokeDasharray="5 3" />;
      })}

      <rect x={mx(xLA)} y={my(yTop)} width={(totL + 2 * ABUT_W) * hS} height={inp.deckWidth * vS} fill="none" stroke="#000" strokeWidth="2.5" />

      {(() => {
        const nx = ML + dW - 30, ny = MT + 26;
        return (
          <g>
            <circle cx={nx} cy={ny} r={20} fill="none" stroke="#000" strokeWidth="1" />
            <line x1={nx} y1={ny + 16} x2={nx} y2={ny - 16} stroke="#000" strokeWidth="1.5" />
            <polygon points={`${nx},${ny - 16} ${nx - 8},${ny + 6} ${nx + 8},${ny + 6}`} fill="#000" />
            <polygon points={`${nx},${ny + 16} ${nx - 8},${ny - 6} ${nx + 8},${ny - 6}`} fill="white" stroke="#000" strokeWidth="1" />
            <text x={nx} y={ny - 21} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#000">N</text>
          </g>
        );
      })()}

      {(() => {
        const fy = my(-bankW / 2) - 18;
        return (
          <g>
            <line x1={mx(worldL * 0.15)} y1={fy} x2={mx(worldL * 0.82)} y2={fy} stroke="#1d4ed8" strokeWidth="1.8" />
            <polygon points={`${mx(worldL * 0.82)},${fy} ${mx(worldL * 0.82) - 12},${fy - 5} ${mx(worldL * 0.82) - 12},${fy + 5}`} fill="#1d4ed8" />
            <text x={SVG_W / 2} y={fy - 6} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1d4ed8">FLOW DIRECTION</text>
          </g>
        );
      })()}

      <HDim x1={mx(xLA)} x2={mx(xRA + ABUT_W)} y={my(yBot) + 20} label={`${(totL + 2 * ABUT_W).toFixed(2)}m TOTAL CAUSEWAY LENGTH`} extH={10} />
      <HDim x1={mx(xCS)} x2={mx(xCS + inp.deckSpan)} y={my(yTop) - 14} label={`${inp.deckSpan.toFixed(2)}m SPAN`} extH={7} />
      <VDim x={mx(worldL) + 14} y1={my(yTop)} y2={my(yBot)} label={`${inp.deckWidth.toFixed(2)}m DECK WIDTH`} extR={16} />

      <text x={SVG_W / 2} y={SVG_H - TITLE_H - 20} textAnchor="middle" fontSize="9.5" fill="#555">
        N_SPANS = {inp.numSpans}  |  N_VENTS = {inp.numVents}  |  VENT: {inp.ventWidth.toFixed(2)}m (W) × {inp.ventHeight.toFixed(2)}m (H)  |  TOTAL VENTWAY AREA = {(inp.numVents * inp.ventWidth * inp.ventHeight).toFixed(2)}m²
      </text>

      <TitleBlock inp={inp} title="PLAN VIEW" drwNo="CS/DRG/03" scale="1:50" sheet="7" total="7" svgW={SVG_W} svgH={SVG_H} tbH={TITLE_H} />
    </svg>
  );
}

// ─── DRAWINGS PAGE ────────────────────────────────────────────────────────────

const TABS = [
  { id: 'cs', label: 'Cross Section A-A', sub: 'Transverse — perpendicular to flow' },
  { id: 'ls', label: 'Longitudinal Section B-B', sub: 'Side elevation — along flow' },
  { id: 'pv', label: 'Plan View', sub: 'Top-down — deck & vent layout' },
];

export default function DrawingsPage() {
  const { inputs, results } = useCalculations();
  const [tab, setTab] = useState('cs');
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      try { exportDesignPDF(inputs, results); }
      finally { setExporting(false); }
    }, 50);
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Engineering Drawings</h2>
          <p className="text-muted-foreground mt-1 text-sm">Line-by-line technical drawings — update live as you change inputs.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-all font-semibold text-sm disabled:opacity-60 shrink-0"
        >
          <FileDown className="w-4 h-4" />
          {exporting ? 'Generating PDF...' : 'Export 7-Sheet PDF'}
        </button>
      </div>

      <div className="flex gap-0 border-b border-border overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap ${
              tab === t.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}>
            <div className="font-semibold">{t.label}</div>
            <div className="text-[10px] font-normal opacity-70 mt-0.5">{t.sub}</div>
          </button>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden border border-border shadow-xl">
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-3">
          <Layers className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            {tab === 'cs' ? 'DRG CS/DRG/01 — CROSS SECTION A-A'
              : tab === 'ls' ? 'DRG CS/DRG/02 — LONGITUDINAL SECTION B-B'
              : 'DRG CS/DRG/03 — PLAN VIEW'}
          </span>
          <span className="ml-auto text-xs text-slate-400 font-mono">IRC SP:82-2008  |  Scale 1:50 (schematic)</span>
        </div>
        <div className="bg-white overflow-x-auto">
          {tab === 'cs' && <CrossSectionSVG inp={inputs} res={results} />}
          {tab === 'ls' && <LongitudinalSVG inp={inputs} res={results} />}
          {tab === 'pv' && <PlanViewSVG inp={inputs} />}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {[
          { fill: '#d9d9d9', border: '#000', label: 'Concrete (diagonal hatch)', dash: false },
          { fill: '#f3ede0', border: '#aaa', label: 'Earth / Natural Ground', dash: false },
          { fill: '#bfdbfe', border: '#2563eb', label: 'Water Body (at HFL)', dash: false },
          { fill: 'white', border: '#2563eb', label: 'HFL — Highest Flood Level', dash: true },
          { fill: 'white', border: '#15803d', label: 'GL — Ground / Stream Bed', dash: false },
          { fill: 'white', border: '#dc2626', label: 'FBL — Foundation Bottom Level', dash: true },
          { fill: 'white', border: '#555', label: 'RTL — Road Top Level', dash: true },
          { fill: 'white', border: '#000', label: '↔ Dimension line with value', dash: false },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <div className="w-8 h-4 rounded-sm border shrink-0"
              style={{ background: item.fill, borderColor: item.border, borderStyle: item.dash ? 'dashed' : 'solid', borderWidth: '1.5px' }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
