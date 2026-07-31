import { useMemo } from 'react';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '../components/ui/components';
import {
  firstNonEmptyLine,
  lastNonEmptyLine,
  nonEmptyLineCount,
  sampleDocumentLines,
  sampleDocumentSections,
  totalLineCount,
} from '../lib/sample-document';

function scrollToLine(lineNumber: number) {
  document.getElementById(`line-${lineNumber}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function DocumentViewerPage() {
  const stats = useMemo(
    () => [
      { label: 'Total Lines', value: totalLineCount.toLocaleString() },
      { label: 'Non-Empty Lines', value: nonEmptyLineCount.toLocaleString() },
      { label: 'Detected Sections', value: sampleDocumentSections.length.toLocaleString() },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="warning">Shared Update Imported</Badge>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Document Viewer</h2>
        <p className="text-sm text-muted-foreground">
          Verbatim line-by-line viewer for <span className="font-mono">Type Design of submersible causeway.txt</span>.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{stat.label}</p>
              <p className="text-2xl font-bold text-primary font-mono">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <Card className="xl:sticky xl:top-8 h-fit">
          <CardHeader>
            <CardTitle>Section Navigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[70vh] overflow-y-auto">
            {sampleDocumentSections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToLine(section.lineNumber)}
                className="w-full rounded-md border border-card-border bg-background/40 px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary/10"
              >
                <div className="text-xs font-semibold text-foreground">{section.title}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                  Line {section.lineNumber}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verbatim Source Lines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-card-border bg-background/40 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">First Non-Empty Line</p>
                <p className="mt-2 text-xs font-mono text-primary whitespace-pre-wrap">{firstNonEmptyLine?.text}</p>
              </div>
              <div className="rounded-md border border-card-border bg-background/40 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Last Non-Empty Line</p>
                <p className="mt-2 text-xs font-mono text-primary whitespace-pre-wrap">{lastNonEmptyLine?.text}</p>
              </div>
            </div>

            <div className="rounded-xl border border-card-border bg-background/40 overflow-hidden">
              <div className="border-b border-card-border px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                All lines, including blanks
              </div>
              <div className="max-h-[75vh] overflow-auto">
                <ol className="divide-y divide-card-border/60">
                  {sampleDocumentLines.map((line) => {
                    const section = sampleDocumentSections.find((item) => item.lineNumber === line.lineNumber);
                    return (
                      <li
                        key={line.lineNumber}
                        id={`line-${line.lineNumber}`}
                        className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 px-4 py-2 font-mono text-xs"
                      >
                        <div className="text-right text-muted-foreground">{line.lineNumber}</div>
                        <div className="min-w-0">
                          {section ? (
                            <div className="mb-1 inline-flex rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary">
                              {section.title}
                            </div>
                          ) : null}
                          <pre className="whitespace-pre-wrap break-words text-foreground">
                            {line.text.length > 0 ? line.text : ' '}
                          </pre>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
