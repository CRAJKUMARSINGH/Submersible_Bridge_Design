import React from 'react';
import { useCalculations } from '../lib/calculations';
import { Card, CardHeader, CardTitle, CardContent, Input, Label, FormulaTrace, Badge } from '../components/ui/components';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function Step1Discharge() {
  const { inputs, updateInput, results } = useCalculations();

  const chartData = [
    { name: 'Rational', value: parseFloat(results.qRational.toFixed(3)), governing: results.governingMethod === "Rational Method" },
    { name: 'Weir', value: parseFloat(results.qWeir.toFixed(3)), governing: results.governingMethod === "Weir Formula" },
    { name: 'Velocity', value: parseFloat(results.qVelocity.toFixed(3)), governing: results.governingMethod === "Area-Velocity" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Step 1: Design Discharge</h2>
        <p className="text-muted-foreground mt-1 text-sm">Determine the maximum expected flow using three IRC-approved methods. The highest governs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column — inputs */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Metadata</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>Project Name</Label>
                <Input type="text" value={inputs.projectName} onChange={e => updateInput("projectName", e.target.value)} />
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label>Stream Name</Label>
                <Input type="text" value={inputs.streamName} onChange={e => updateInput("streamName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input type="text" value={inputs.location} onChange={e => updateInput("location", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={inputs.date} onChange={e => updateInput("date", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>1a. Rational Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground font-mono">Q = (C × I × A) / 3.6</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Catchment Area A (km²)</Label>
                  <Input type="number" step="0.1" min="0" value={inputs.catchmentArea}
                    onChange={e => updateInput("catchmentArea", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Runoff Coeff C (0–1)</Label>
                  <Input type="number" step="0.05" min="0" max="1" value={inputs.runoffCoefficient}
                    onChange={e => updateInput("runoffCoefficient", Number(e.target.value))} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Rainfall Intensity I (mm/hr)</Label>
                  <Input type="number" step="1" min="0" value={inputs.rainfallIntensity}
                    onChange={e => updateInput("rainfallIntensity", Number(e.target.value))} />
                </div>
              </div>
              <FormulaTrace
                expression={`Q = (${inputs.runoffCoefficient} × ${inputs.rainfallIntensity} × ${inputs.catchmentArea}) / 3.6`}
                result={results.qRational}
                unit="m³/s"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>1b. Broad-Crested Weir Formula</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground font-mono">Q = 1.705 × Lw × Hw^1.5</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Weir Length Lw (m)</Label>
                  <Input type="number" step="0.5" min="0" value={inputs.surplusWeirLength}
                    onChange={e => updateInput("surplusWeirLength", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Head over Weir Hw (m)</Label>
                  <Input type="number" step="0.05" min="0" value={inputs.heightOfFallWeir}
                    onChange={e => updateInput("heightOfFallWeir", Number(e.target.value))} />
                </div>
              </div>
              <FormulaTrace
                expression={`Q = 1.705 × ${inputs.surplusWeirLength} × ${inputs.heightOfFallWeir}^1.5`}
                result={results.qWeir}
                unit="m³/s"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>1c. Area-Velocity Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground font-mono">Q = A_stream × V_mean</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stream Area at HFL (m²)</Label>
                  <Input type="number" step="1" min="0" value={inputs.streamAreaHFL}
                    onChange={e => updateInput("streamAreaHFL", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Mean Velocity V (m/s)</Label>
                  <Input type="number" step="0.1" min="0" value={inputs.meanVelocityHFL}
                    onChange={e => updateInput("meanVelocityHFL", Number(e.target.value))} />
                </div>
              </div>
              <FormulaTrace
                expression={`Q = ${inputs.streamAreaHFL} × ${inputs.meanVelocityHFL}`}
                result={results.qVelocity}
                unit="m³/s"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column — results */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Design Discharge — Final Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Governing Q (max of 3 methods)</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">Method: {results.governingMethod}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold font-mono text-primary">{results.qDesign.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground ml-1">m³/s</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Method Comparison</Label>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(val: number) => [`${val.toFixed(3)} m³/s`, 'Q']}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.governing ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                {[
                  { label: 'Rational Method', value: results.qRational, method: 'Rational Method' },
                  { label: 'Weir Formula', value: results.qWeir, method: 'Weir Formula' },
                  { label: 'Area-Velocity', value: results.qVelocity, method: 'Area-Velocity' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-foreground">{row.value.toFixed(3)} m³/s</span>
                      {results.governingMethod === row.method && (
                        <Badge variant="warning">GOVERNS</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>IRC Reference Values</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs font-mono text-muted-foreground">
              <p>• Rational Method: Q = CIA/3.6 (CWC / IRC guidelines)</p>
              <p>• Broad-crested weir: Q = 1.705·L·H^1.5 (standard formula)</p>
              <p>• Area-velocity: field-measured cross-section at HFL</p>
              <p>• IRC SP:82-2008 Cl.4: design Q = max of all methods</p>
              <p>• Typical C values: 0.30–0.45 (cultivated), 0.50–0.70 (hilly)</p>
              <p>• Silt factor f: 0.6 (fine sand), 1.0 (medium), 1.5 (coarse)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
