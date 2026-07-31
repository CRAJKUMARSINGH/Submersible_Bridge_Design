import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { CalculationsProvider } from './lib/calculations';
import { AppLayout } from './components/layout/app-layout';
import Step1Discharge from './pages/step1-discharge';
import Step2Hydraulic from './pages/step2-hydraulic';
import Step3Structural from './pages/step3-structural';
import SummaryReport from './pages/summary';
import DrawingsPage from './pages/drawings';
import ImportVariablesPage from './pages/import-variables';
import StatutoryPreviewPage from './pages/statutory-preview';
import React, { useEffect } from 'react';

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Step1Discharge} />
        <Route path="/import" component={ImportVariablesPage} />
        <Route path="/statutory-preview" component={StatutoryPreviewPage} />
        <Route path="/hydraulic" component={Step2Hydraulic} />
        <Route path="/structural" component={Step3Structural} />
        <Route path="/drawings" component={DrawingsPage} />
        <Route path="/summary" component={SummaryReport} />
        <Route>
          <div className="flex items-center justify-center h-full text-muted-foreground">
            404 — Section Not Found
          </div>
        </Route>
      </Switch>
    </AppLayout>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CalculationsProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
      </CalculationsProvider>
    </QueryClientProvider>
  );
}

export default App;
