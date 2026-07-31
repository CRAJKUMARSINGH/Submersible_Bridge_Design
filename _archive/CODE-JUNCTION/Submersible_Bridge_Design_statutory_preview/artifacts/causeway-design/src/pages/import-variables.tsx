import React from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Download, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Input, Label, Badge } from '../components/ui/components';
import { Button } from '../components/ui/button';
import { useCalculations } from '../lib/calculations';
import {
  INPUT_FIELD_DEFINITIONS,
  buildTemplateCsv,
  buildTemplateRows,
  parseVariableTable,
} from '../lib/spreadsheet-import';

export default function ImportVariablesPage() {
  const { inputs, mergeInputs, resetInputs } = useCalculations();
  const [warnings, setWarnings] = React.useState<string[]>([]);
  const [importedKeys, setImportedKeys] = React.useState<string[]>([]);
  const [fileName, setFileName] = React.useState<string>('');

  const handleTemplateDownload = React.useCallback(() => {
    const blob = new Blob([buildTemplateCsv()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'causeway-variable-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleExportCurrent = React.useCallback(() => {
    const rows = [
      ['variable', 'value', 'section', 'label', 'description', 'unit'],
      ...INPUT_FIELD_DEFINITIONS.map((field) => [
        String(field.key),
        inputs[field.key] === null ? 'auto' : String(inputs[field.key]),
        field.section,
        field.label,
        field.description,
        field.unit ?? '',
      ]),
    ];
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Variables');
    XLSX.writeFile(workbook, 'causeway-current-inputs.xlsx');
  }, [inputs]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setWarnings([]);
    setImportedKeys([]);
    setFileName(file.name);

    try {
      let rows: string[][];
      if (file.name.toLowerCase().endsWith('.csv')) {
        const csvText = await file.text();
        const workbook = XLSX.read(csvText, { type: 'string' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, blankrows: false }) as string[][];
      } else {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, blankrows: false }) as string[][];
      }

      const result = parseVariableTable(rows);
      mergeInputs(result.patch);
      setWarnings(result.warnings);
      setImportedKeys(result.importedKeys.map(String));
    } catch (error) {
      setWarnings([`Import failed: ${(error as Error).message}`]);
      setImportedKeys([]);
    } finally {
      event.target.value = '';
    }
  };

  const templatePreview = buildTemplateRows().slice(0, 9);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Variable Import</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Upload one CSV or Excel sheet and push values straight into the live causeway model.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleTemplateDownload}>
            <Download className="w-4 h-4" />
            Download CSV Template
          </Button>
          <Button variant="outline" onClick={handleExportCurrent}>
            <FileSpreadsheet className="w-4 h-4" />
            Export Current XLSX
          </Button>
          <Button variant="secondary" onClick={resetInputs}>
            <RotateCcw className="w-4 h-4" />
            Reset Inputs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spreadsheet Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Accepted formats</p>
                  <p className="text-xs text-muted-foreground">`.csv` and `.xlsx` with `variable,value` columns</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Choose file</Label>
                <Input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
              </div>
              {fileName && (
                <p className="text-xs text-muted-foreground font-mono mt-3">Last file: {fileName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-card-border p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Imported values</p>
                <p className="text-2xl font-bold text-primary mt-1">{importedKeys.length}</p>
              </div>
              <div className="rounded-lg border border-card-border p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Warnings</p>
                <p className="text-2xl font-bold text-foreground mt-1">{warnings.length}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">How the sheet should look</p>
              <div className="rounded-lg border border-card-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>
                      {templatePreview[0].slice(0, 4).map((cell) => (
                        <th key={cell} className="text-left px-3 py-2 font-semibold text-muted-foreground uppercase tracking-wide">
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {templatePreview.slice(1, 6).map((row, index) => (
                      <tr key={`${row[0]}-${index}`} className="border-t border-card-border">
                        {row.slice(0, 4).map((cell, cellIndex) => (
                          <td key={`${row[0]}-${cellIndex}`} className="px-3 py-2 font-mono text-[11px] text-foreground">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                Excel files should use the same columns as the CSV template. Extra rows are ignored if the variable name is unknown.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Updated keys</p>
              <div className="flex flex-wrap gap-2">
                {importedKeys.length > 0 ? importedKeys.map((key) => (
                  <Badge key={key} variant="success" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {key}
                  </Badge>
                )) : (
                  <p className="text-sm text-muted-foreground">No import applied yet.</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Warnings</p>
              <div className="rounded-lg border border-card-border divide-y divide-card-border">
                {warnings.length > 0 ? warnings.map((warning, index) => (
                  <div key={`${warning}-${index}`} className="px-3 py-2 text-sm flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{warning}</span>
                  </div>
                )) : (
                  <div className="px-3 py-3 text-sm text-muted-foreground">No warnings.</div>
                )}
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Current live metadata</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ['Project', inputs.projectName],
                  ['Stream', inputs.streamName],
                  ['Location', inputs.location],
                  ['Live Load', inputs.liveLoadType],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-lg border border-card-border p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</p>
                    <p className="text-sm font-semibold mt-1 break-words">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
