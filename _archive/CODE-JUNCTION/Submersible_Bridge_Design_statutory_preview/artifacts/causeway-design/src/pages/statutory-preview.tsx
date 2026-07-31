import React from 'react';
import { FileDown, FileSpreadsheet, Eye, ScrollText } from 'lucide-react';
import { useCalculations } from '../lib/calculations';
import { Button } from '../components/ui/button';
import { buildRowsFromInputs } from '../lib/spreadsheet-import';
import * as XLSX from 'xlsx';

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-300 py-1.5 text-[11px]">
      <span className="text-slate-700">{label}</span>
      <span className="font-mono font-semibold text-slate-900 text-right">{value}</span>
    </div>
  );
}

function A4Page({ children, title, pageNo }: { children: React.ReactNode; title: string; pageNo: number }) {
  return (
    <div className="mx-auto w-[210mm] min-h-[297mm] bg-white shadow-2xl border border-slate-300 p-[14mm] print:shadow-none print:border-none print:mx-0 print:w-full print:min-h-0">
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3 mb-4">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-slate-500">Statutory A4 Preview</p>
          <h2 className="text-xl font-bold text-slate-900 mt-1">{title}</h2>
        </div>
        <div className="text-right text-[11px] text-slate-600">
          <div>Page {pageNo}</div>
          <div>A4 Portrait</div>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function StatutoryPreviewPage() {
  const { inputs, results } = useCalculations();

  const exportCurrentJson = React.useCallback(() => {
    const blob = new Blob([JSON.stringify(inputs, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'causeway-current-inputs.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [inputs]);

  const exportCurrentXlsx = React.useCallback(() => {
    const workbook = XLSX.utils.book_new();
    const rows = buildRowsFromInputs(inputs);
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Variables');
    XLSX.writeFile(workbook, 'causeway-current-inputs.xlsx');
  }, [inputs]);

  const commandExample = `pnpm --filter @workspace/scripts run pdf:statutory -- --input /path/to/causeway-current-inputs.xlsx --output /workspace/my-statutory-report.pdf`;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">A4 Statutory Preview</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Live page-style preview from the current inputs. Use the export command below to build the full 169-page detailed PDF from CSV or Excel.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={exportCurrentJson}>
            <FileDown className="w-4 h-4" />
            Download JSON
          </Button>
          <Button variant="outline" onClick={exportCurrentXlsx}>
            <FileSpreadsheet className="w-4 h-4" />
            Download XLSX
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-card-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ScrollText className="w-4 h-4 text-primary" />
          Full report generator command
        </div>
        <pre className="rounded-lg bg-slate-950 text-slate-100 p-4 text-xs overflow-x-auto whitespace-pre-wrap">{commandExample}</pre>
        <p className="text-xs text-muted-foreground">
          The generator reads the same spreadsheet keys used by the import page, computes the live results, and writes a 169-page A4 portrait statutory report.
        </p>
      </div>

      <div className="space-y-8 bg-slate-100 rounded-2xl p-6">
        <A4Page title="Detailed Design Report - Vented Submersible Causeway" pageNo={1}>
          <div className="text-center mt-10">
            <p className="text-[12px] tracking-[0.35em] uppercase text-slate-500">Government / Technical Submission Format</p>
            <h1 className="text-3xl font-bold text-slate-900 mt-6 leading-tight">{inputs.projectName || 'Submersible Causeway Design'}</h1>
            <p className="text-lg text-slate-700 mt-4">{inputs.location}</p>
            <p className="text-sm text-slate-500 mt-2">Stream / Crossing: {inputs.streamName}</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-14">
            <div className="border border-slate-300 p-4">
              <h3 className="font-bold text-sm uppercase tracking-wide text-slate-700 mb-3">Project data</h3>
              <MetricRow label="Report date" value={inputs.date} />
              <MetricRow label="Live load type" value={inputs.liveLoadType} />
              <MetricRow label="Deck width" value={`${inputs.deckWidth.toFixed(2)} m`} />
              <MetricRow label="Deck span" value={`${inputs.deckSpan.toFixed(2)} m`} />
              <MetricRow label="Number of spans" value={String(inputs.numSpans)} />
            </div>
            <div className="border border-slate-300 p-4">
              <h3 className="font-bold text-sm uppercase tracking-wide text-slate-700 mb-3">Hydraulic control values</h3>
              <MetricRow label="HFL" value={`${inputs.hfl.toFixed(3)} m`} />
              <MetricRow label="Ground level" value={`${inputs.gl.toFixed(3)} m`} />
              <MetricRow label="RTL" value={`${inputs.rtl.toFixed(3)} m`} />
              <MetricRow label="Design discharge" value={`${results.designDischarge.toFixed(3)} m³/s`} />
              <MetricRow label="Foundation level" value={`${results.fbl.toFixed(3)} m`} />
            </div>
          </div>

          <div className="mt-16 border-t border-slate-300 pt-6 text-[12px] leading-6 text-slate-700">
            <p>
              This preview mirrors the statutory report structure and updates from the same live inputs used by the design steps. The full generator preserves the 169-page count while rewriting project-specific values and computed checks from the imported spreadsheet.
            </p>
          </div>
        </A4Page>

        <A4Page title="Hydraulic Design and Ventway Checks" pageNo={2}>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 mb-3">Discharge basis</h3>
              <MetricRow label="Catchment area" value={`${inputs.catchmentArea.toFixed(3)} km²`} />
              <MetricRow label="Runoff coefficient" value={inputs.runoffCoefficient.toFixed(3)} />
              <MetricRow label="Rainfall intensity" value={`${inputs.rainfallIntensity.toFixed(2)} mm/hr`} />
              <MetricRow label="Surplus weir length" value={`${inputs.surplusWeirLength.toFixed(3)} m`} />
              <MetricRow label="Computed design discharge" value={`${results.designDischarge.toFixed(3)} m³/s`} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 mb-3">Ventway / afflux</h3>
              <MetricRow label="Number of vents" value={String(inputs.numVents)} />
              <MetricRow label="Vent size" value={`${inputs.ventWidth.toFixed(2)} m × ${inputs.ventHeight.toFixed(2)} m`} />
              <MetricRow label="Vent area provided" value={`${results.aVent.toFixed(3)} m²`} />
              <MetricRow label="Afflux" value={`${results.hAfflux.toFixed(4)} m`} />
              <MetricRow label="Velocity at HFL" value={`${results.velocityHFL.toFixed(3)} m/s`} />
            </div>
          </div>

          <div className="mt-8 border border-slate-300">
            <div className="grid grid-cols-4 bg-slate-100 text-[11px] font-bold uppercase tracking-wide text-slate-700">
              <div className="p-3 border-r border-slate-300">Check</div>
              <div className="p-3 border-r border-slate-300">Value</div>
              <div className="p-3 border-r border-slate-300">Limit</div>
              <div className="p-3">Status</div>
            </div>
            {[
              ['Obstruction at RTL', `${results.pctObsRTL.toFixed(2)}%`, '< 100%', results.passRTL ? 'PASS' : 'FAIL'],
              ['Obstruction at HFL', `${results.pctObsHFL.toFixed(2)}%`, '< 30%', results.passHFL ? 'PASS' : 'FAIL'],
              ['Scour safety', `${results.maxScourDepth.toFixed(3)} m`, 'Foundation below scour', results.scourSafe ? 'PASS' : 'FAIL'],
              ['Anchor / buoyancy', `${results.fAnchor.toFixed(3)} kN`, '<= 0 net uplift', results.fAnchor <= 0 ? 'PASS' : 'FAIL'],
            ].map(([label, value, limit, status]) => (
              <div key={String(label)} className="grid grid-cols-4 text-[11px] border-t border-slate-300">
                <div className="p-3 border-r border-slate-300">{label}</div>
                <div className="p-3 border-r border-slate-300 font-mono">{value}</div>
                <div className="p-3 border-r border-slate-300">{limit}</div>
                <div className={`p-3 font-bold ${status === 'PASS' ? 'text-emerald-700' : 'text-red-700'}`}>{status}</div>
              </div>
            ))}
          </div>
        </A4Page>

        <A4Page title="Structural Design and Generator Notes" pageNo={3}>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 mb-3">Loads</h3>
              <MetricRow label="Self weight per span" value={`${results.wSelf.toFixed(3)} kN`} />
              <MetricRow label="Silt load per span" value={`${results.wSilt.toFixed(3)} kN`} />
              <MetricRow label="Live load total" value={`${results.wLive.toFixed(3)} kN`} />
              <MetricRow label="Uplift per span" value={`${results.fUplift.toFixed(3)} kN`} />
              <MetricRow label="Drag per span" value={`${results.fDrag.toFixed(3)} kN`} />
              <MetricRow label="Total drag" value={`${results.fDragTotal.toFixed(3)} kN`} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 mb-3">Generator behavior</h3>
              <p className="text-[11px] leading-6 text-slate-700">
                The detailed statutory generator reads a CSV, XLSX, or JSON input file, applies the same variable keys used by this app, computes the live design values, and then rebuilds a page-aligned 169-page A4 portrait document using the original statutory source pages as the narrative base.
              </p>
              <p className="text-[11px] leading-6 text-slate-700 mt-3">
                Use the import page for spreadsheet upload, use this preview page for A4 layout review, and use the script command above when you need the final detailed PDF deliverable.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-xl border border-dashed border-slate-400 p-6">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <Eye className="w-4 h-4" />
              Preview scope
            </div>
            <p className="mt-3 text-[11px] leading-6 text-slate-700">
              This page intentionally previews the first part of the statutory layout in browser-friendly A4 blocks. The actual PDF generator writes the full detailed set to a file and keeps the statutory page count fixed at 169 pages.
            </p>
          </div>
        </A4Page>
      </div>
    </div>
  );
}
