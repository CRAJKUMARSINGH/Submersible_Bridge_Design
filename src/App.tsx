import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { CalculationsProvider } from './lib/calculations';
import { AppLayout } from './components/layout/app-layout';
import Step1Discharge from './pages/step1-discharge';
import Step2Hydraulic from './pages/step2-hydraulic';
import Step3Structural from './pages/step3-structural';
import React, { Suspense, lazy, useEffect, useMemo } from 'react';

const SummaryReport = lazy(() => import('./pages/summary'));
const DrawingsPage = lazy(() => import('./pages/drawings'));
const ImportVariablesPage = lazy(() => import('./pages/import-variables'));
const StatutoryPreviewPage = lazy(() => import('./pages/statutory-preview'));
const NotFound = lazy(() => import('./pages/not-found'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RouteFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse flex flex-col items-center gap-3 text-muted-foreground">
        <div className="w-8 h-8 rounded-full border-2 border-muted border-t-transparent animate-spin" />
        <span className="text-sm">Loading section…</span>
      </div>
    </div>
  );
}

function Router() {
  return (
    <AppLayout>
      <Suspense fallback={<RouteFallback />}>
        <Switch>
          <Route path="/" component={Step1Discharge} />
          <Route path="/import" component={ImportVariablesPage} />
          <Route path="/statutory-preview" component={StatutoryPreviewPage} />
          <Route path="/hydraulic" component={Step2Hydraulic} />
          <Route path="/structural" component={Step3Structural} />
          <Route path="/drawings" component={DrawingsPage} />
          <Route path="/summary" component={SummaryReport} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </AppLayout>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const base = useMemo(
    () => import.meta.env.BASE_URL.replace(/\/$/, ''),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CalculationsProvider>
        <WouterRouter base={base}>
          <Router />
        </WouterRouter>
      </CalculationsProvider>
    </QueryClientProvider>
  );
}

export default App;
