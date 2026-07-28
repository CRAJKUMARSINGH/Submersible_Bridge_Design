import React from 'react';
import { useCalculations } from '../lib/calculations';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../components/ui/components';
import { exportDesignPDF } from '../lib/pdf-export';
import { FileDown } from 'lucide-react';

function SectionDiagram() {
  const { inputs, results } = useCalculations();

  const deckTop = inputs.rtl + inputs.deckThickness;
  const maxEl = Math.max(deckTop, inputs.hfl) + 0.6;
  const minEl = results.fbl - 1.2;
  const range = maxEl - minEl;

  const w = 800, h = 280;
  const ML = 90, MR = 40, MT = 20, MB = 20;
  const dW = w - ML - MR, dH = h - MT - MB;

  const gX = (x: number) => ML + x;
  const gY = (el: number) => MT + ((maxEl - el) / range) * dH;

  const yHFL = gY(inputs.hfl);
  const yRTL = gY(inputs.rtl);
  const yDT = gY(deckTop);
  const yGL = gY(inputs.gl);
  const yFBL = gY(results.fbl);

  // simplified cross-section: 2 abutments + N-1 piers
  const ABUT = 18, PIER = 8, FEXT = 10;
  const nPiers = inputs.numVents - 1;
  const ventPx = (dW - 2 * ABUT - nPiers * PIER) / inputs.numVents;

  type Sec = { x: number; w: number; kind: 'abut' | 'vent' | 'pier' };
  const secs: Sec[] = [];
  let cx = 0;
  secs.push({ x: cx, w: ABUT, kind: 'abut' }); cx += ABUT;
  for (let i = 0; i < inputs.numVents; i++) {
    secs.push({ x: cx, w: ventPx, kind: 'vent' }); cx += ventPx;
    if (i < inputs.numVents - 1) { secs.push({ x: cx, w: PIER, kind: 'pier' }); cx += PIER; }
  }
  secs.push({ x: cx, w: ABUT, kind: 'abut' });
  const totW = cx + ABUT;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full font-mono overflow-visible">
      <defs>
        <pattern id="hatch-s" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#555" strokeWidth="0.7" />
        </pattern>
        <pattern id="earth-s" patternUnits="userSpaceOnUse" width="8" height="8">
          <line x1="0" y1="4" x2="8" y2="4" stroke="#aaa" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* earth */}
      <rect x={ML} y={yGL} width={dW} height={yFBL - yGL + 20} fill="#f3ede0" />
      <rect x={ML} y={yGL} width={dW} height={yFBL - yGL + 20} fill="url(#earth-s)" />

      {/* water in vents */}
      {secs.filter(s => s.kind === 'vent').map((s, i) => {
        const top = Math.min(yHFL, yRTL);
        if (top >= yGL) return null;
        return <rect key={i} x={ML + s.x} y={top} width={s.w} height={yGL - top} fill="#bfdbfe" opacity="0.7" />;
      })}

      {/* foundations */}
      {secs.filter(s => s.kind !== 'vent').map((s, i) => (
        <g key={i}>
          <rect x={ML + s.x - FEXT} y={yGL} width={s.w + 2 * FEXT} height={yFBL - yGL} fill="#d4d4d4" stroke="#000" strokeWidth="1" />
          <rect x={ML + s.x - FEXT} y={yGL} width={s.w + 2 * FEXT} height={yFBL - yGL} fill="url(#hatch-s)" />
        </g>
      ))}

      {/* walls */}
      {secs.filter(s => s.kind !== 'vent').map((s, i) => (
        <g key={i}>
          <rect x={ML + s.x} y={yDT} width={s.w} height={yGL - yDT} fill="#d9d9d9" stroke="#000" strokeWidth={s.kind === 'abut' ? 1.5 : 1} />
          <rect x={ML + s.x} y={yDT} width={s.w} height={yGL - yDT} fill="url(#hatch-s)" />
        </g>
      ))}

      {/* deck */}
      <rect x={ML} y={yDT} width={totW} height={yRTL - yDT} fill="#c8c8c8" stroke="#000" strokeWidth="2" />
      <rect x={ML} y={yDT} width={totW} height={yRTL - yDT} fill="url(#hatch-s)" />

      {/* level lines */}
      <line x1={ML - 50} x2={ML + dW + 10} y1={yHFL} y2={yHFL} stroke="#2563eb" strokeWidth="1.5" strokeDasharray="8 4" />
      <line x1={ML - 50} x2={ML + dW + 10} y1={yGL} y2={yGL} stroke="#15803d" strokeWidth="2" />
      <line x1={ML - 50} x2={ML + dW + 10} y1={yFBL} y2={yFBL} stroke="#dc2626" strokeWidth="1.2" strokeDasharray="5 3" />
      <line x1={ML + 2} x2={ML + totW - 2} y1={yRTL} y2={yRTL} stroke="#777" strokeWidth="1" strokeDasharray="6 3" />

      {/* labels */}
      <text x={ML - 52} y={yHFL} textAnchor="end" dominantBaseline="middle" fontSize="9.5" fill="#2563eb" fontWeight="bold">HFL {inputs.hfl.toFixed(2)}m</text>
      <text x={ML - 52} y={yRTL} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="#777">RTL {inputs.rtl.toFixed(2)}m</text>
      <text x={ML - 52} y={yGL} textAnchor="end" dominantBaseline="middle" fontSize="9.5" fill="#15803d" fontWeight="bold">GL {inputs.gl.toFixed(2)}m</text>
      <text x={ML - 52} y={yFBL} textAnchor="end" dominantBaseline="middle" fontSize="9.5" fill="#dc2626" fontWeight="bold">FBL {results.fbl.toFixed(2)}m</text>

      {/* vent count label */}
      {secs.filter(s => s.kind === 'vent').map((s, i) => (
        <text key={i} x={ML + s.x + s.w / 2} y={(yRTL + yGL) / 2} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="#1d4ed8" fontWeight="bold">V</text>
      ))}
      <text x={ML + totW / 2} y={yRTL + 12} textAnchor="middle" fontSize="9" fill="#555">
        {inputs.numVents} Vents @ {inputs.ventWidth.toFixed(2)}m × {inputs.ventHeight.toFixed(2)}m
      </text>

      {/* scour indicator */}
      <line x1={ML + dW + 18} y1={yGL} x2={ML + dW + 18} y2={yFBL} stroke="#dc2626" strokeWidth="1" />
      <polygon points={`${ML + dW + 18},${yGL} ${ML + dW + 14},${yGL + 7} ${ML + dW + 22},${yGL + 7}`} fill="#dc2626" />
      <polygon points={`${ML + dW + 18},${yFBL} ${ML + dW + 14},${yFBL - 7} ${ML + dW + 22},${yFBL - 7}`} fill="#dc2626" />
      <text x={ML + dW + 22} y={(yGL + yFBL) / 2} fontSize="8" fill="#dc2626">Scour {results.maxScourDepth.toFixed(2)}m</text>
    </svg>
  );
}

export default function SummaryReport() {
  const { inputs, results } = useCalculations();
  const [exporting, setExporting] = React.useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      try { exportDesignPDF(inputs, results); }
      finally { setExporting(false); }
    }, 50);
  };

  const allPass = results.passRTL && results.passHFL && results.scourSafe && results.fAnchor <= 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Summary Report</h2>
          <p className="text-muted-foreground mt-1 text-sm">All IRC checks, computed values, and compliance status.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-all font-semibold text-sm disabled:opacity-60 shrink-0"
        >
          <FileDown className="w-4 h-4" />
          {exporting ? 'Generating…' : 'Export 7-Sheet PDF'}
        </button>
      </div>

      {/* Overall status banner */}
      <div className={`p-4 rounded-lg border ${allPass ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${allPass ? 'bg-success' : 'bg-destructive'}`} />
          <span className={`font-bold text-sm ${allPass ? 'text-success' : 'text-destructive'}`}>
            {allPass ? 'ALL CHECKS PASSED — Design compliant with IRC SP:82-2008' : 'ONE OR MORE CHECKS FAILED — Review parameters'}
          </span>
        </div>
      </div>

      {/* Project info */}
      <Card>
        <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            ['Project', inputs.projectName],
            ['Stream', inputs.streamName],
            ['Location', inputs.location],
            ['Date', inputs.date],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-muted-foreground uppercase tracking-wider text-[10px] font-bold">{k}</p>
              <p className="font-semibold text-foreground mt-1 text-sm">{v}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Cross section */}
      <Card>
        <CardHeader>
          <CardTitle>Cross Section — Live Preview</CardTitle>
        </CardHeader>
        <CardContent className="h-64 px-4 pb-4">
          <SectionDiagram />
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-primary">1. Discharge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ['Catchment Area', `${inputs.catchmentArea} km²`],
              ['Rainfall Intensity', `${inputs.rainfallIntensity} mm/hr`],
              ['Runoff Coefficient', inputs.runoffCoefficient.toString()],
              ['Governing Method', results.governingMethod],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                <span className="text-muted-foreground text-sm">{k}</span>
                <span className="font-mono text-sm text-foreground">{v}</span>
              </div>
            ))}
            <div className="flex justify-between pt-1">
              <span className="font-semibold text-foreground">Design Q</span>
              <span className="font-mono font-bold text-primary">{results.designDischarge.toFixed(2)} m³/s</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-primary">2. Hydraulic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ['Total Ventway Area', `${results.aVent.toFixed(2)} m²`],
              ['Velocity at HFL', `${results.velocityHFL.toFixed(3)} m/s`],
              ['Afflux', `${results.hAfflux.toFixed(4)} m`],
              ['Max Scour Depth', `${results.maxScourDepth.toFixed(3)} m`],
              ['Foundation (FBL)', `${results.fbl.toFixed(2)} m`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                <span className="text-muted-foreground text-sm">{k}</span>
                <span className="font-mono text-sm text-foreground">{v}</span>
              </div>
            ))}
            <div className="flex justify-between items-center border-t border-border pt-2">
              <span className="text-sm text-muted-foreground">Obs @ RTL</span>
              <div className="flex gap-2 items-center">
                <span className="font-mono text-sm">{results.pctObsRTL.toFixed(1)}%</span>
                <Badge variant={results.passRTL ? "success" : "destructive"}>{results.passRTL ? "PASS" : "FAIL"}</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Obs @ HFL</span>
              <div className="flex gap-2 items-center">
                <span className="font-mono text-sm">{results.pctObsHFL.toFixed(1)}%</span>
                <Badge variant={results.passHFL ? "success" : "destructive"}>{results.passHFL ? "PASS" : "FAIL"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-primary">3. Structural</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ['Self Weight/span', `${results.wSelf.toFixed(2)} kN`],
              ['Silt Load/span', `${results.wSilt.toFixed(2)} kN`],
              ['Live Load (total)', `${results.wLive} kN`],
              ['Uplift/span', `${results.fUplift.toFixed(2)} kN`],
              ['Drag/span', `${results.fDrag.toFixed(2)} kN`],
              ['Total Drag', `${results.fDragTotal.toFixed(2)} kN`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                <span className="text-muted-foreground text-sm">{k}</span>
                <span className="font-mono text-sm text-foreground">{v}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-1">
              <span className="font-semibold text-foreground">Anchor Status</span>
              <Badge variant={results.fAnchor > 0 ? "destructive" : "success"}>
                {results.fAnchor > 0 ? "ANCHORS REQD" : "SAFE"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance table */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Summary — IRC SP:82-2008 & IRC 6:2000</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 pr-4 text-muted-foreground uppercase text-xs tracking-wider">Check</th>
                  <th className="pb-2 pr-4 text-muted-foreground uppercase text-xs tracking-wider">Computed</th>
                  <th className="pb-2 pr-4 text-muted-foreground uppercase text-xs tracking-wider">Limit</th>
                  <th className="pb-2 text-muted-foreground uppercase text-xs tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  { check: 'Ventway obstruction @ RTL', val: `${results.pctObsRTL.toFixed(1)}%`, limit: '< 70%', pass: results.passRTL },
                  { check: 'Ventway obstruction @ HFL', val: `${results.pctObsHFL.toFixed(1)}%`, limit: '< 30%', pass: results.passHFL },
                  { check: 'Foundation depth vs scour', val: `${results.recommendedDepth.toFixed(2)}m below GL`, limit: '> 0.5m', pass: results.scourSafe },
                  { check: 'Deck uplift resistance', val: `F_anchor = ${results.fAnchor.toFixed(2)} kN`, limit: 'W_self > F_uplift', pass: results.fAnchor <= 0 },
                ].map(row => (
                  <tr key={row.check}>
                    <td className="py-3 pr-4 text-foreground">{row.check}</td>
                    <td className="py-3 pr-4 text-primary">{row.val}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{row.limit}</td>
                    <td className="py-3">
                      <Badge variant={row.pass ? "success" : "destructive"}>
                        {row.pass ? "PASS" : "FAIL"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
