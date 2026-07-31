# Submersible Causeway Design Calculator (CSWY-CALC 82)

A React/Vite application for IRC SP:82-2008 compliant vented submersible causeway design. Provides live parametric calculations, SVG engineering drawings, and a multi-sheet A4 PDF export — all updating reactively as inputs change.

## Run & Operate

- `pnpm --filter @workspace/causeway-design run dev` — run the frontend (port 18554, preview at `/`)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, path `/api`)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19, Vite 7, Tailwind CSS v4, Wouter router
- Charts: Recharts
- PDF Export: jsPDF 4.x + jspdf-autotable
- Spreadsheet Import: xlsx
- API: Express 5 (shared `artifacts/api-server`)
- Dark navy + amber engineering theme

## Where things live

- `artifacts/causeway-design/src/lib/calculations.tsx` — the CalculationsContext with all IRC SP:82-2008 formulas (source of truth for all computed values)
- `artifacts/causeway-design/src/lib/pdf-export.ts` — 7-sheet A4 PDF generator (cover, 3 calc sheets, 3 drawing sheets)
- `artifacts/causeway-design/src/lib/spreadsheet-import.ts` — CSV/XLSX variable import with alias resolution
- `artifacts/causeway-design/src/pages/` — all 7 pages (step1, step2, step3, drawings, summary, import-variables, statutory-preview)
- `artifacts/causeway-design/src/components/layout/app-layout.tsx` — sidebar nav with 7 sections

## Architecture decisions

- All calculations live in a single `CalculationsProvider` context so every page sees live-reactive results instantly
- PDF export reproduces the full IRC design sheet layout with parametric SVG drawings embedded on sheets 5-7
- Spreadsheet import uses a normalized alias map so any column naming convention (camelCase, snake_case, short) resolves to the correct input key
- The app is fully frontend-only (no database needed) — jsPDF runs in the browser

## Product

Engineers input hydraulic and structural parameters for a submersible causeway. The app instantly calculates:
- **Step 1**: Design discharge via Rational Method, Weir Formula, Area-Velocity (governing = max)
- **Step 2**: Ventway obstruction, afflux (orifice + weir methods), Lacey scour depth, foundation level
- **Step 3**: Structural loads — self-weight, silt, live load (IRC Class A/AA), drag, uplift, anchor requirement
- **Engineering Drawings**: Full SVG cross-section, longitudinal section, and plan view
- **Summary Report**: Compliance matrix vs IRC SP:82-2008
- **A4 Statutory Preview**: Page-layout report ready for PDF download
- **Variable Import**: Upload CSV/XLSX to populate all inputs from a spreadsheet

## User preferences

_Populate as you build._

## Gotchas

- jsPDF v4.x (not v2.x) — the Replit package firewall blocks the older 2.x line; always use v4+
- The PDF generator uses jsPDF's `doc.save()` which triggers a browser download — no server involvement
- After any change to `lib/*` packages, run `pnpm run typecheck:libs` before artifact typechecks

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
