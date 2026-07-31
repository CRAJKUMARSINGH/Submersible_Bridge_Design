import React from 'react';
import { Link, useLocation } from 'wouter';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Calculator, Waves, Construction, FileText, PenLine, Layers, FileSpreadsheet, ScrollText, BookText, ShieldCheck } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { href: '/document-viewer', label: 'Document Viewer', sub: 'Verbatim source browser', icon: BookText },
  { href: '/tests', label: 'Certification Tests', sub: '16 shared update checks', icon: ShieldCheck },
  { href: '/import', label: 'Variable Import', sub: 'CSV / Excel sheet input', icon: FileSpreadsheet },
  { href: '/statutory-preview', label: 'A4 Statutory Preview', sub: 'Live page-style report view', icon: ScrollText },
  { href: '/', label: 'Step 1: Discharge', sub: 'Rational / Weir / Velocity', icon: Calculator },
  { href: '/hydraulic', label: 'Step 2: Hydraulic', sub: 'Ventway, Afflux, Scour', icon: Waves },
  { href: '/structural', label: 'Step 3: Structural', sub: 'Loads, Drag, Uplift', icon: Construction },
  { href: '/drawings', label: 'Engineering Drawings', sub: 'Cross-section, Long., Plan', icon: PenLine },
  { href: '/summary', label: 'Summary Report', sub: 'Compliance overview', icon: FileText },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-72 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground tracking-tight">CSWY-CALC 82</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">IRC SP:82-2008</p>
            </div>
          </div>
          <div className="mt-4 px-3 py-2 rounded-md bg-primary/10 border border-primary/20">
            <p className="text-[10px] text-primary font-mono uppercase tracking-wider font-bold">Vented Submersible Causeway</p>
            <p className="text-[9px] text-muted-foreground font-mono mt-0.5">All results update live</p>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold px-3 mb-2">Design Workflow</p>
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-[13px]">{item.label}</div>
                    <div className="text-[10px] opacity-70 font-normal mt-0.5">{item.sub}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <div className="text-[10px] text-muted-foreground font-mono space-y-0.5 uppercase tracking-widest">
            <div>Ref: IRC SP:82-2008</div>
            <div>IRC 6:2000 • Lacey (1930)</div>
            <div className="text-primary/70">All calcs live-reactive</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col max-h-[100dvh] overflow-y-auto">
        <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
