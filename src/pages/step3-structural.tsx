import React from 'react';
import { useCalculations } from '../lib/calculations';
import { Card, CardHeader, CardTitle, CardContent, Input, Label, FormulaTrace, Badge } from '../components/ui/components';

export default function Step3Structural() {
  const { inputs, updateInput, results } = useCalculations();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Step 3: Structural Design</h2>
        <p className="text-muted-foreground mt-1 text-sm">Load analysis and hydrodynamic forces per span — IRC SP:82-2008 & IRC 6:2000.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deck Geometry</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deck Width W (m)</Label>
                <Input type="number" step="0.1" value={inputs.deckWidth} onChange={e => updateInput("deckWidth", Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Span Length L (m)</Label>
                <Input type="number" step="0.1" value={inputs.deckSpan} onChange={e => updateInput("deckSpan", Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Thickness t (m)</Label>
                <Input type="number" step="0.05" value={inputs.deckThickness} onChange={e => updateInput("deckThickness", Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>No. of Spans</Label>
                <Input type="number" step="1" min="1" value={inputs.numSpans} onChange={e => updateInput("numSpans", Number(e.target.value))} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Material Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Live Load Class</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-primary font-mono"
                  value={inputs.liveLoadType}
                  onChange={e => updateInput("liveLoadType", e.target.value as "IRC Class A" | "IRC Class AA")}
                >
                  <option value="IRC Class A">IRC Class A (554 kN)</option>
                  <option value="IRC Class AA">IRC Class AA (700 kN)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ρ Water (kg/m³)</Label>
                  <Input type="number" step="1" value={inputs.waterDensity} onChange={e => updateInput("waterDensity", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>ρ Concrete (kg/m³)</Label>
                  <Input type="number" step="1" value={inputs.concreteDensity} onChange={e => updateInput("concreteDensity", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Drag Coeff Cd</Label>
                  <Input type="number" step="0.1" min="1" max="3" value={inputs.dragCoefficient} onChange={e => updateInput("dragCoefficient", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Silt Load (kN/m²)</Label>
                  <Input type="number" step="0.1" value={inputs.siltLoadDeck} onChange={e => updateInput("siltLoadDeck", Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>3a. Vertical Load Analysis (per span)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Self Weight W_self</Label>
                  <FormulaTrace
                    expression={`ρ_c·g·W·L·t / 1000 = ${inputs.concreteDensity}×9.81×${inputs.deckWidth}×${inputs.deckSpan}×${inputs.deckThickness}/1000`}
                    result={results.wSelf}
                    unit="kN"
                  />
                </div>
                <div>
                  <Label>Silt Load W_silt</Label>
                  <FormulaTrace
                    expression={`w_s × W × L = ${inputs.siltLoadDeck} × ${inputs.deckWidth} × ${inputs.deckSpan}`}
                    result={results.wSilt}
                    unit="kN"
                  />
                </div>
                <div>
                  <Label>Live Load W_live (total axle)</Label>
                  <FormulaTrace
                    expression={`${inputs.liveLoadType} standard`}
                    result={results.wLive}
                    unit="kN"
                  />
                </div>
                <div>
                  <Label>Total Vertical Load (per span)</Label>
                  <FormulaTrace
                    expression={`Self + Silt + Live/N_spans`}
                    result={results.totalVerticalLoad}
                    unit="kN"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3b. Hydrodynamic Forces (IRC SP:82-2008)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-background/50 border border-card-border p-3 text-xs font-mono text-muted-foreground">
                V_HFL = {results.velocityHFL.toFixed(3)} m/s (from Step 2 hydraulic analysis)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Uplift (Buoyancy) per span</Label>
                  <FormulaTrace
                    expression={`ρ_w·g·Vol / 1000 = ${inputs.waterDensity}×9.81×(${inputs.deckWidth}×${inputs.deckSpan}×${inputs.deckThickness})/1000`}
                    result={results.fUplift}
                    unit="kN"
                  />
                </div>
                <div>
                  <Label>Drag Force per span</Label>
                  <FormulaTrace
                    expression={`Cd·0.5·ρ·V²·(W×t) / 1000`}
                    result={results.fDrag}
                    unit="kN"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <Label className="text-foreground">Total Base Shear (all spans)</Label>
                <FormulaTrace
                  expression={`F_drag × N_spans = ${results.fDrag.toFixed(3)} × ${inputs.numSpans}`}
                  result={results.fDragTotal}
                  unit="kN"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3c. Uplift & Anchor Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Net Anchor Force = F_uplift − W_self</Label>
                <FormulaTrace
                  expression={`${results.fUplift.toFixed(3)} − ${results.wSelf.toFixed(3)}`}
                  result={results.fAnchor}
                  unit="kN"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-foreground">Uplift Status</Label>
                    <Badge variant={results.fAnchor > 0 ? "destructive" : "success"}>
                      {results.fAnchor > 0 ? "ANCHORS REQD" : "SAFE"}
                    </Badge>
                  </div>
                  <div className="text-lg font-bold font-mono text-foreground">
                    {Math.max(0, results.fAnchor).toFixed(2)} kN
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {results.fAnchor > 0 ? "Stainless steel anchors required" : "Self-weight adequate"}
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-foreground">Total Drag (Base Shear)</Label>
                  </div>
                  <div className="text-lg font-bold font-mono text-primary">
                    {results.fDragTotal.toFixed(2)} kN
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Lateral force on substructure</p>
                </div>
              </div>

              <div className="rounded-md bg-background/50 border border-card-border p-3 text-xs font-mono text-muted-foreground space-y-1">
                <p>• Cd = {inputs.dragCoefficient} (IRC SP:82-2008 Cl.7.4 — blunt body)</p>
                <p>• Uplift = full buoyancy of submerged deck (conservative)</p>
                <p>• Live load standard: {inputs.liveLoadType} (IRC 6:2000)</p>
                <p>• Silt load on deck = {inputs.siltLoadDeck} kN/m² (IRC SP:82 Cl.7.3)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
