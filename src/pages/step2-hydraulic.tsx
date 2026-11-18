import React from 'react';
import { useCalculations, foundationQPerMetreWidth, scourDischargeWidth } from '../lib/calculations';
import { Card, CardHeader, CardTitle, CardContent, Input, Label, FormulaTrace, Badge } from '../components/ui/components';

export default function Step2Hydraulic() {
  const { inputs, updateInput, results } = useCalculations();

  // E3 / Task 26: discharge per metre width in the foundation-design regime,
  // q = 1.30 × Q / B (IRC:5-1985 Cl.101.1.2). B = measured linear waterway when supplied.
  const scourWidth = scourDischargeWidth(inputs, results.effectiveWidth);
  const laceyQ = foundationQPerMetreWidth(results.designDischarge, scourWidth);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Step 2: Hydraulic Design</h2>
        <p className="text-muted-foreground mt-1 text-sm">Ventway area, afflux, and scour depth per IRC SP:82-2008 Cl.6.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left — inputs */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stream Levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Design Discharge Q (m³/s)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number" step="0.1"
                    value={inputs.customDesignDischarge !== null ? inputs.customDesignDischarge : results.qDesign}
                    onChange={e => {
                      const val = e.target.value === "" ? null : Number(e.target.value);
                      updateInput("customDesignDischarge", val);
                    }}
                    className={inputs.customDesignDischarge === null ? "text-muted-foreground" : "text-primary"}
                  />
                  {inputs.customDesignDischarge !== null && (
                    <button
                      onClick={() => updateInput("customDesignDischarge", null)}
                      className="text-xs text-muted-foreground hover:text-foreground underline whitespace-nowrap px-2"
                    >Reset</button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {inputs.customDesignDischarge === null ? "Auto from Step 1" : "Manual override active"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>HFL (m)</Label>
                  <Input type="number" step="0.1" value={inputs.hfl} onChange={e => updateInput("hfl", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>OFL / GL (m)</Label>
                  <Input type="number" step="0.1" value={inputs.gl} onChange={e => updateInput("gl", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>RTL (m)</Label>
                  <Input type="number" step="0.1" value={inputs.rtl} onChange={e => updateInput("rtl", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>OFL Ordinary Flood (m)</Label>
                  <Input type="number" step="0.1" value={inputs.ofl_m} onChange={e => updateInput("ofl_m", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>LBL Low Bed (m)</Label>
                  <Input type="number" step="0.1" value={inputs.lbl_m} onChange={e => updateInput("lbl_m", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Bottom of Deck (m)</Label>
                  <Input type="number" step="0.1" value={inputs.bottomDeck_m} onChange={e => updateInput("bottomDeck_m", Number(e.target.value))} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Carriageway Width (m) — E17 min 6.0m</Label>
                  <Input type="number" step="0.1" value={inputs.carriageWidth_m} onChange={e => updateInput("carriageWidth_m", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Approach Vel (m/s)</Label>
                  <Input type="number" step="0.1" value={inputs.approachVelocity} onChange={e => updateInput("approachVelocity", Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vent Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>No. of Vents N</Label>
                  <Input type="number" step="1" min="1" value={inputs.numVents} onChange={e => updateInput("numVents", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Vent Width b (m)</Label>
                  <Input type="number" step="0.1" min="0.1" value={inputs.ventWidth} onChange={e => updateInput("ventWidth", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Vent Height h_v (m)</Label>
                  <Input type="number" step="0.1" min="0.1" value={inputs.ventHeight} onChange={e => updateInput("ventHeight", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Cd (vent)</Label>
                  <Input type="number" step="0.05" min="0.5" max="1" value={inputs.cdVent} onChange={e => updateInput("cdVent", Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scour Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Lacey Silt Factor f</Label>
                <Input type="number" step="0.05" min="0.1" max="3" value={inputs.siltFactor} onChange={e => updateInput("siltFactor", Number(e.target.value))} />
                <p className="text-[10px] text-muted-foreground">f = 0.6 fine | 1.0 medium | 1.5 coarse sand</p>
              </div>
              <div className="space-y-2">
                <Label>Linear Waterway L (m) — optional</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number" step="0.1" min="0"
                    placeholder={`auto (B_eff = ${results.effectiveWidth.toFixed(2)})`}
                    value={inputs.linearWaterway_m ?? ""}
                    onChange={e => updateInput("linearWaterway_m", e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                  {inputs.linearWaterway_m != null && (
                    <button
                      onClick={() => updateInput("linearWaterway_m", undefined)}
                      className="text-xs text-muted-foreground hover:text-foreground underline whitespace-nowrap px-2"
                    >Reset</button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Measured waterway between banks (source L4845 = 28.80m). Used for scour q = 1.30Q/L; blank → B_eff = Q/V.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Foundation Bottom Level FBL (m) — optional</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number" step="0.01"
                    placeholder={`auto (FBL = HFL − D_max = ${(inputs.hfl - results.maxScourDepth).toFixed(3)})`}
                    value={inputs.fbl_m ?? ""}
                    onChange={e => updateInput("fbl_m", e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                  {inputs.fbl_m != null && (
                    <button
                      onClick={() => updateInput("fbl_m", undefined)}
                      className="text-xs text-muted-foreground hover:text-foreground underline whitespace-nowrap px-2"
                    >Reset</button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Stated design datum (source L112 = 2.315m); overrides the derived HFL − D_max when supplied.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Recommended Foundation Depth (m) — optional</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number" step="0.01"
                    placeholder={`auto (GL − FBL = ${(inputs.gl - results.fbl).toFixed(3)})`}
                    value={inputs.recommendedDepth_m ?? ""}
                    onChange={e => updateInput("recommendedDepth_m", e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                  {inputs.recommendedDepth_m != null && (
                    <button
                      onClick={() => updateInput("recommendedDepth_m", undefined)}
                      className="text-xs text-muted-foreground hover:text-foreground underline whitespace-nowrap px-2"
                    >Reset</button>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Stated design datum (source L4920 = 3.83m); overrides the derived GL − FBL when supplied.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — results */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>2a. Ventway Area Check (IRC SP:82-2008 Cl.6.2)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Total Ventway Area A_vent</Label>
                  <FormulaTrace expression={`N × b × h_v = ${inputs.numVents} × ${inputs.ventWidth} × ${inputs.ventHeight}`} result={results.aVent} unit="m²" />
                </div>
                <div>
                  <Label>Effective Flow Width</Label>
                  <FormulaTrace expression={`Q / V_app = ${results.designDischarge.toFixed(2)} / ${inputs.approachVelocity}`} result={results.effectiveWidth} unit="m" />
                </div>
                <div>
                  <Label>Flow Area at RTL</Label>
                  <FormulaTrace expression={`(RTL−GL) × B_eff = ${(inputs.rtl - inputs.gl).toFixed(2)} × ${results.effectiveWidth.toFixed(2)}`} result={results.aRTL} unit="m²" />
                </div>
                <div>
                  <Label>Flow Area at HFL</Label>
                  <FormulaTrace expression={`(HFL−GL) × B_eff = ${(inputs.hfl - inputs.gl).toFixed(2)} × ${results.effectiveWidth.toFixed(2)}`} result={results.aHFL} unit="m²" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-foreground">% Obstruction @ RTL</Label>
                    <Badge variant={results.passRTL ? "success" : "destructive"}>{results.passRTL ? "PASS" : "FAIL"}</Badge>
                  </div>
                  <div className="text-2xl font-bold font-mono text-foreground">{results.pctObsRTL.toFixed(1)}%</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Limit: &lt; 70% (IRC SP:82 Cl.6.2)</p>
                </div>
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-foreground">% Obstruction @ HFL</Label>
                    <Badge variant={results.passHFL ? "success" : "destructive"}>{results.passHFL ? "PASS" : "FAIL"}</Badge>
                  </div>
                  <div className="text-2xl font-bold font-mono text-foreground">{results.pctObsHFL.toFixed(1)}%</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Limit: &lt; 30% (IRC SP:82 Cl.6.2)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2b. Afflux (Molesworth's formula — indicative)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Velocity at HFL</Label>
                  <FormulaTrace expression={`Q / A_HFL = ${results.designDischarge.toFixed(2)} / ${results.aHFL.toFixed(3)}`} result={results.velocityHFL} unit="m/s" />
                </div>
                <div>
                  <Label>Afflux h_f</Label>
                  <FormulaTrace expression={`(V²/17.88 + 0.015) × ((A_HFL/A_vent)² − 1)`} result={results.hAfflux} unit="m" />
                </div>
              </div>
              <div className="rounded-md bg-background/50 border border-card-border p-3 text-xs font-mono text-muted-foreground">
                A_HFL/A_vent = {results.aHFL > 0 ? (results.aHFL / (results.aVent || 1)).toFixed(3) : '—'}  |  V_HFL = {results.velocityHFL.toFixed(3)} m/s  |  h_afflux = {results.hAfflux.toFixed(4)} m
              </div>
              <p className="text-xs text-muted-foreground">
                Note: this single-step Molesworth estimate is indicative only. The design of record
                adopted the IRC SP:13-2004 <strong>Orifice formula</strong> (afflux = 0.131 m) — see E2.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2c. Scour Depth & Foundation Level (Lacey's Equations)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Lacey Regime Perimeter</Label>
                  <FormulaTrace expression={`P = 4.75 × √Q = 4.75 × √${results.designDischarge.toFixed(2)}`} result={results.laceyPerimeter} unit="m" />
                </div>
                <div>
                  <Label>Normal Scour Depth D</Label>
                  <FormulaTrace expression={`1.34 × (q²/f)^(1/3), q = 1.30Q/B = ${laceyQ.toFixed(3)} (B = ${scourWidth.toFixed(2)}m)`} result={results.laceyScourDepth} unit="m" />
                </div>
                <div>
                  <Label>Max Scour Depth D_max</Label>
                  <FormulaTrace expression={`1.5 × D = 1.5 × ${results.laceyScourDepth.toFixed(3)}`} result={results.maxScourDepth} unit="m" />
                </div>
                <div>
                  <Label>Foundation Bottom Level (FBL)</Label>
                  <FormulaTrace
                    expression={inputs.fbl_m != null
                      ? `stated FBL datum = ${inputs.fbl_m.toFixed(3)}`
                      : `HFL − D_max = ${inputs.hfl} − ${results.maxScourDepth.toFixed(3)}`}
                    result={results.fbl} unit="m" />
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground text-sm">Foundation depth below GL</Label>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      {inputs.recommendedDepth_m != null
                        ? `stated depth datum = ${inputs.recommendedDepth_m.toFixed(3)} m`
                        : `GL − FBL = ${inputs.gl} − ${results.fbl.toFixed(3)}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono text-primary">{results.recommendedDepth.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground ml-1">m</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Safety check (depth &gt; 0.5m)</p>
                  <Badge variant={results.scourSafe ? "success" : "warning"}>{results.scourSafe ? "SAFE" : "CHECK — shallow"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
