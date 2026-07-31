import { useMemo, useState } from 'react';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '../components/ui/components';
import { buildCertificationChecks } from '../lib/sample-document';

export default function DocumentTestsPage() {
  const [runVersion, setRunVersion] = useState(0);

  const checks = useMemo(() => buildCertificationChecks(), [runVersion]);
  const passedCount = checks.filter((check) => check.passed).length;
  const allPassed = passedCount === checks.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Badge variant={allPassed ? 'success' : 'destructive'}>
            {allPassed ? 'All Tests Pass' : 'Test Failures Present'}
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Certification Tests</h2>
          <p className="text-sm text-muted-foreground">
            Self-designed verbatim checks imported from the shared update and bound to the real source file in this repo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRunVersion((value) => value + 1)}
          className="inline-flex items-center justify-center rounded-md border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          Run All Tests
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Executed</p>
            <p className="text-2xl font-bold text-primary font-mono">{checks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Passing</p>
            <p className="text-2xl font-bold text-success font-mono">{passedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Failing</p>
            <p className="text-2xl font-bold text-destructive font-mono">{checks.length - passedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Matrix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {checks.map((check) => (
            <div
              key={check.id}
              className={`rounded-lg border px-4 py-3 ${
                check.passed
                  ? 'border-success/30 bg-success/10'
                  : 'border-destructive/30 bg-destructive/10'
              }`}
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{check.id}</span>
                    <span className="font-semibold text-foreground">{check.label}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{check.details}</p>
                </div>
                <Badge variant={check.passed ? 'success' : 'destructive'}>
                  {check.passed ? 'PASS' : 'FAIL'}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
