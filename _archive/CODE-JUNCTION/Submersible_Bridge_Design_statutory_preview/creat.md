# CSWY-CALC 82 — Full Session Log (creat.md)
**Project:** Vented Submersible Causeway Design Tool  
**Document Source:** Type Design of submersible causeway (IRC SP:82-2008)  
**Workspace:** C:\Users\Rajkumar\Downloads\Design-Line-Complete  
**Last Updated:** 2026-07-24

---

## COMPLETE CHAT LOG

### [Session 1] User: Replicate the Scribd document into a modifiable app
**Agent:** Built React/Vite app — 3 design steps, live calculations, IRC SP:82-2008 formulas, dark navy/amber theme.

### [Session 1] User: EXACT PROTOTYPE DESIGN LINE BY LINE
**Agent:** Added SVG engineering drawings (cross-section, longitudinal, plan view with dimension lines, hatching, title blocks) and 7-sheet A3 PDF export.

### [Session 1] User: 169 PAGE LONG DETAILED DESIGN WITH ALL COMPONENTS LINKED WITH ALTERED VARIABLES
Session hit daily quota. Incomplete.

### [Session 2] User: INTEGRATE ROOT APP AND THAT IN Submersible-Causeway-Modeler
**Agent:** Deep-compared both project trees. Found 11 files with differences. Root was more complete. Merged: DrawingsPage + /drawings route, richer app-layout (w-72, Layers icon, 5 nav items), improved step1/2/3 pages, parametric SectionDiagram in summary, PDF export wired, compliance table, status banner, IRC reference cards.

### [Session 2] User: UNDO / REDO INTEGRATE
**Agent:** Re-compared after undo — found only 2 cosmetic differences (CSS comments, data-testid). Integration already complete.

### [Session 2] User: Save input sample in PDF from https://www.scribd.com/doc/140639054
**Agent:** Scribd blocks extraction. Tried multiple approaches. Found attached_assets folder with .pdf, .doc, .txt files.

### [Session 2] User: I HAVE SHARED .DOC AND .TXT FILES — see attached_assets
**Agent:** Found and read the full 258KB .txt file. Extracted ALL exact variables, computations, load tables, stress checks, hydraulic calculations from the document.

### [Session 2] User: NO SHORT CUT — 170 PAGES — COPY CAT — FORMULAE LINKED WITH VARIABLES
**Agent:** Started building full Node.js PDF generator using jspdf/jspdf-autotable. Installed packages, wrote all data variables, PDF helper functions, cover page, Sections 1-5 (Philosophy, Hydraulic Data, Discharge, Ventway, Afflux). Hit git block issues.

### [Session 2] User: INCLUDE COMPUTATION FORMULAE LINKED WITH VARIABLES (HIDDEN)
**Agent:** Confirmed — every formula shows: symbolic form, substituted values, computed result, code reference. Continuing all sections.

### [Session 2] User: CONTINUE + KEEP ITERATING + KEEP RECORD IN creat.md
**Agent (NOW):** Updating creat.md. Building all remaining sections: Scour, Protection Works, Loading Pattern, Abutment Design, Stability, Strip Footing, Pier Design, Face Walls, Compliance Summary. Running PDF and outputting file.

---

## DOCUMENT DATA — EXACT VARIABLES FROM YOUR FILE

### Hydraulic Particulars
- MFL = 6.235m, OFL = 5.015m, LBL = 3.965m
- Slope = 0.01520 (1 in 1000), n = 0.050
- Bottom of Deck = 5.165m, RTL = 5.645m, Carriage Width = 6.0m

### Discharge Calculations
| Location | Area m2 | Perim m | R m | V m/s | Q Cumecs |
|---|---|---|---|---|---|
| Bridge site | 11.74 | 10.99 | 1.07 | 2.58 | 30.28 |
| 300m upstream | 12.29 | 14.22 | 0.86 | 2.23 | 27.41 |
| 300m downstream | 14.82 | 14.22 | 1.04 | 2.53 | 37.49 |
| Dicken catchment 1.38 km2 | — | — | — | — | 21.65 |
| Surplus weir (22.75m, h=0.45m) | — | — | — | — | 15.47 |
| **DESIGN Q = 30.28 + 15.47** | — | — | — | — | **45.75** |

### Ventway
- Total vented area = 26.21 m2, pct = 39.40% > 30% OK
- Obstruction at HFL = 29.07% < 30% OK

### Afflux
- Method A (Orifice): h = 0.131m GOVERNS
- Method B (Weir check): h = 0.137m

### Scour
- Q_fdn = 1.30 x 45.75 = 60.85 Cumecs
- f = 2.00, q = 2.113 m3/m
- R = 1.75m, Dm = 2.63m, D_fdn = 3.83m
- BFL = +2.315m, depth below LBL = 1.56m, SBC = 15 t/m2

### Structural — Abutment
- Span = 6.0m, Deck = 6.8m, t_slab = 0.480m, t_wc = 0.075m
- H_abut = 1.200m, b_top = 0.750m, b_bot = 1.05m
- W_DL_super = 338.55 kN, W_abut_total = 349.92 kN
- W_LL = 478.41 kN, Ra = 182.64 kN, Rb = 295.77 kN
- Impact factor = 0.352 (full), 0.176 (at abutment base)
- F_wind_LL = 18.00 kN, F_wc_deck = 3.80 kN, F_wc_abut = 3.38 kN
- F_brake = 47.84 kN, Buoyancy reduction = 145.80 kN
- Ka = 0.30, EP_h = 67.60 kN, EP_v = 18.10 kN
- F_uplift = 195.48 kN (uplift head = 0.543m)

### Stress Checks (all SAFE)
| Section | Heel (kN/m2) | Toe (kN/m2) | U/S (kN/m2) | D/S (kN/m2) |
|---|---|---|---|---|
| Strip footing top | 37.03 | 172.34 | 42.41 | 198.24 |
| 3rd footing top | 34.23 | 180.21 | 32.95 | 218.21 |
| 2nd footing top | 26.21 | 195.70 | 20.59 | 245.57 |
| 1st footing top | 6.41 | 260.77 | 31.92 | 58.84 |

### Stability (all SAFE)
| Load Envelope | FS Overturning | FS Sliding |
|---|---|---|
| Env III (dry, LL, backfill intact) | 2.79 > 2.0 | 5.47 > 1.5 |
| Env II (full canal, no LL) | 4.35 > 2.0 | 2.98 > 1.5 |

### Pier Stresses (all SAFE)
- Max stress at bottom footing = 64.47 kN/m2 < 5000
- Min stress = 48.53 kN/m2 > -2800

### Face Walls (all SAFE)
| Bit | H (m) | Ka | Max Stress (kg/m2) | Min Stress | FS_OT | FS_SL |
|---|---|---|---|---|---|---|
| I | 2.40 | 0.57 | 11468 | 4915 | 3.27 | 1.81 |
| II | 1.80 | 0.57 | 8640 | 4160 | 3.36 | 1.81 |
| III | 1.20 | 0.51 | 5958 | 3208 | 3.05 | 1.69 |
| IV | 0.80 | 0.42 | 4171 | 2557 | 2.56 | 1.51 |

---

## PDF GENERATOR STATUS
- File: scripts/src/gen-causeway-pdf.mjs
- Sections written: 1 (Philosophy), 2 (Hydraulic), 3 (Discharge), 4 (Ventway), 5 (Afflux)
- Sections pending: 6 (Scour), 7 (Protection), 8 (Loading), 9 (Abutments), 10 (Stability), 11 (Strip Footing), 12 (Piers), 13 (Face Walls), 14 (Summary)
- Output: Causeway_Full_Design_Report.pdf

---

## FILES MODIFIED THIS SESSION
| File | Change |
|---|---|
| scripts/src/gen-causeway-pdf.mjs | Full PDF generator (in progress) |
| scripts/src/append-pdf-sections.js | Section appender helper |
| scripts/package.json | Added jspdf + jspdf-autotable |
| creat.md | This session log |
| Submersible-Causeway-Modeler/ (all src files) | Merged from root — full integration |
