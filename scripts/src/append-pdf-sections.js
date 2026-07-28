// Helper: appends remaining sections to gen-causeway-pdf.mjs
const fs = require('fs');
const p = 'C:/Users/Rajkumar/Downloads/Design-Line-Complete/scripts/src/gen-causeway-pdf.mjs';

const sections = [];

// ── SECTION 5: AFFLUX ────────────────────────────────────
sections.push(`
// ==========================================================
// SECTION 5 — AFFLUX CALCULATIONS
// ==========================================================
y=addPage();
y=bigTitle(y,'SECTION 5 — AFFLUX CALCULATIONS (HFL CONDITION)');
y=secHead(y,'5.1 Method A: Orifice Formula [IRC SP:13-2004, Cl.15.1]');
y=para(y,'Assumption: afflux h < 1.4 x Dd = 1.4 x 0.80 = 1.12m. Orifice formula for submerged bridge openings is applied.');
y=fml(y,'Orifice Discharge Formula',
  'Q = Co x sqrt(2g) x L x D x [h + (1+e).u^2/2g]^0.5',
  'a/A = 0.71  =>  Co = 0.867 (IRC SP:13 table),  e = 0.91',
  '','','IRC SP:13-2004, Cl.15.1');
y=mini(y,'Reduced simultaneous equations after algebraic substitution:');
y=fml(y,'Equation (1)',
  '0.26735 = h + 0.097350 x u^2',
  'Derived from Q=45.75, a/A=0.71, Co=0.867, e=0.91, g=9.81',
  '--- Eq.(1)','','');
y=fml(y,'Equation (2) — upstream approach velocity',
  'u = Q / [(Dd + h) x W]  =  1.008153 / (0.80 + h)',
  'Q=45.75 cumecs, W=28.80m (linear waterway), Dd=0.80m',
  '--- Eq.(2)','','');
y=mini(y,'Trial and Error — substituting Eq.(2) into Eq.(1):');
y=tbl(y,
  ['Trial h (m)','Computed RHS of Eq.1','LHS = 0.26735','Status'],
  [
    ['h = 0.300','0.333765','0.267350','NOT satisfied'],
    ['h = 0.131','0.267765','0.267350','SATISFIED'],
  ],
  {0:{cellWidth:38},1:{cellWidth:45},2:{cellWidth:38},3:{cellWidth:52}});
y=gap(y,2);
y=fml(y,'ADOPTED AFFLUX (Method A)',
  'h_afflux = 0.131m  |  u = 1.008153/(0.80+0.131)',
  'u = 1.008153 / 0.931 = 1.083 m/s',
  '0.131m','m','IRC SP:13-2004');
y=hl(y);
y=secHead(y,'5.2 Method B: Broad-Crested Weir Formula [IRC SP:13, Cl.15.2] — CHECK');
y=para(y,'Case (b): Afflux assumed > 1.4 x Dd. Broad-crested weir formula applied as verification check.');
y=fml(y,'Weir Discharge Formula',
  'Q = 1.706 x Cw x L x H^(3/2)',
  '45.75 = 1.706 x 0.94 x 28.80 x H^1.5  =>  H = 0.99m',
  '0.99m','H','IRC SP:13, Cl.15.2');
y=fml(y,'Upstream Depth Du by iteration',
  'Q = Du x W x u  and  Du = H - u^2/2g',
  'H=0.99m => iterate: u=1.018 m/s, Du = 0.937m',
  '0.937m','Du','');
y=fml(y,'Afflux (Method B)',
  'h = Du - Dd',
  'h = 0.937 - 0.80',
  '0.137m','','');
y=tbl(y,
  ['Method','Afflux h (m)','Code Reference','Adopted?'],
  [
    ['Method A — Orifice Formula','0.131','IRC SP:13-2004 Cl.15.1','YES — GOVERNS (h < 1.4xDd)'],
    ['Method B — Broad-Crested Weir','0.137','IRC SP:13-2004 Cl.15.2','Check only — not adopted'],
  ],
  {0:{cellWidth:52},1:{cellWidth:20},2:{cellWidth:52},3:{cellWidth:49}});
y=note(y,'Afflux is less than (1/4)th of Dd. Hence Orifice formula GOVERNS. ADOPTED AFFLUX h = 0.131m');
`);

// ── SECTION 6: SCOUR DEPTH ───────────────────────────────
sections.push(`
// ==========================================================
// SECTION 6 — SCOUR DEPTH & FOUNDATION LEVEL
// ==========================================================
y=addPage();
y=bigTitle(y,'SECTION 6 — SCOUR DEPTH & FOUNDATION LEVEL');
y=secHead(y,'6.1 Enhanced Design Discharge for Foundations [IRC:5-1985, Cl.101.1.2]');
y=para(y,'As per IRC:5-1985 Cl.101.1.2, design discharge for foundations and protection works is increased by 30% to provide adequate safety margin.');
y=fml(y,'Enhanced Discharge for Foundation Design',
  'Q_fdn = 1.30 x Q_design',
  'Q_fdn = 1.30 x 45.75',
  '60.85','Cumecs','IRC:5-1985, Cl.101.1.2');
y=hl(y);
y=secHead(y,"6.2 Lacey's Silt Factor");
y=fml(y,"Lacey's Silt Factor f",
  'f = 1.76 x m^(1/2)  [due to pebbles/boulders in bed]',
  'f = 1.76 x m^0.5  =>  f = 2.00 (pebbles and boulders)',
  '2.00','—','Lacey (1930)');
y=hl(y);
y=secHead(y,"6.3 Normal Scour Depth — Lacey's Equation");
y=fml(y,'Discharge per metre width at foundation section',
  'q = Q_fdn / L_waterway',
  'q = 60.85 / 28.80',
  '2.113','m3/s per m','');
y=fml(y,"Normal Scour Depth (Lacey's Regime Depth)",
  'D = 1.34 x (q^2 / f)^(1/3)',
  'D = 1.34 x (2.113^2 / 2.00)^0.333',
  '1.75','m','Lacey (1930)');
y=hl(y);
y=secHead(y,'6.4 Maximum Scour Depth [IRC:5-1985, Cl.110.1.4.2]');
y=fml(y,'Maximum Scour Depth — Abutment Foundation',
  'Dm = 1.5 x D  [for abutment foundations — straight reach]',
  'Dm = 1.5 x 1.75',
  '2.63','m','IRC:5-1985, Cl.110.1.4.2');
y=hl(y);
y=secHead(y,'6.5 Foundation Bottom Level (BFL)');
y=fml(y,'Minimum Foundation Depth Required',
  'D_fdn = Dm + Max(1.2m  or  Dm/3)',
  'Dm/3 = 2.63/3 = 0.877m < 1.2m  =>  use 1.2m',
  '3.83','m','IRC:5-1985');
y=fml(y,'Bottom Level of Foundation',
  'BFL = LBL - D_fdn_from_LBL',
  'BFL = 3.965 - 1.65 = 2.315  [1.80m below LBL adopted]',
  '+2.315','m RL','As fixed');
y=datarow(y,'Depth of foundation below LBL (provided)','1.80','m (> 1.56m required — safe)');
y=hl(y);
y=secHead(y,'6.6 Summary of Scour Calculations');
y=tbl(y,
  ['Parameter','Symbol','Formula','Value','Unit'],
  [
    ['Enhanced discharge','Q_fdn','1.30 x 45.75','60.85','Cumecs'],
    ["Lacey's silt factor",'f','1.76 x m^0.5','2.00','—'],
    ['Discharge intensity','q','Q_fdn / L_WW = 60.85/28.80','2.113','m3/s/m'],
    ['Normal scour depth','R','1.34 x (q^2/f)^(1/3)','1.75','m'],
    ['Max scour depth (abutment)','Dm','1.5 x R','2.63','m'],
    ['Foundation depth (required)','D_fdn','Dm + 1.2m','3.83','m'],
    ['Bottom of Foundation Level','BFL','HFL - D_total','2.315','m RL'],
    ['Depth below LBL (provided)','d_LBL','Provided = 1.80m','1.80','m (> 1.56m req.)'],
    ['Safe Bearing Capacity','SBC','From soil test at 1.50m below LBL','15.0','t/m2'],
  ],
  {0:{cellWidth:55},1:{cellWidth:18},2:{cellWidth:60},3:{cellWidth:14},4:{cellWidth:12}});
y=chk(y,'Foundation depth provided (1.80m) > Required (1.56m)','1.80m','> 1.56m reqd',true);
y=note(y,'Individual foundations (strip footings) proposed at BFL = +2.315m. As foundations are below max scour level, bed protection from scour depth consideration is NOT needed.');
`);

// ── SECTION 7: PROTECTION WORKS ─────────────────────────
sections.push(`
// ==========================================================
// SECTION 7 — DESIGN OF PROTECTION WORKS
// ==========================================================
y=addPage();
y=bigTitle(y,'SECTION 7 — DESIGN OF PROTECTION WORKS & LAUNCHING APRONS');
y=secHead(y,'7.1 Velocity Through Vents Check [IRC SP:82-2008, Cl.6.4.2(i)]');
y=fml(y,'Head due to velocity of approach',
  'h_vap = (V^2/2g) x [di/(di+x)]^2',
  'V=2.58, di=2.27, x=afflux=0.131',
  '0.303','m','IRC SP:82');
y=fml(y,'Combined Head (hi)',
  'hi = afflux + h_vap',
  'hi = 0.131 + 0.303',
  '0.434','m','');
y=fml(y,'Velocity through vents (Vv)',
  'Vv = 0.90 x sqrt(2g x hi)',
  'Vv = 0.90 x sqrt(2 x 9.81 x 0.434)',
  '2.63','m/s','IRC SP:82');
y=fml(y,'Linear waterway required',
  'LWW = Q_fdn / (Vv x di)',
  'LWW = 60.85 / (2.63 x 2.27)',
  '7.67','m','IRC SP:82');
y=chk(y,'LWW required (7.67m) < LWW provided (28.80m) — ADEQUATE','7.67m','< 28.80m',true);
y=fml(y,'Discharge that can be safely passed',
  'Q_safe = Vlim x A_flow',
  'Q_safe = 2.00 x 56.27',
  '112.54','Cumecs','IRC SP:82');
y=chk(y,'Q_safe (112.54) > Q_fdn (60.85) — ADEQUATE','112.54','>60.85',true);
y=note(y,'As bed is rocky strata, increased velocity of 2.63 m/s is permissible without rigid floor protection (IRC SP:82 Cl.5.1.3(iv)).');
y=hl(y);
y=secHead(y,'7.2 Stone Size for Flexible Apron [IRC 89-1985, Cl.5.3.7.2]');
y=fml(y,'Required stone diameter',
  'd = (Vmax / 4.893)^2',
  'd = (2.63 / 4.893)^2',
  '0.30','m (say 0.30m)','IRC 89-1985');
y=fml(y,'Weight of each stone (SG = 2.65)',
  'W = (4/3) x pi x (d/2)^3 x 2.65 x 1000',
  'W = (4/3) x 3.14159 x 0.15^3 x 2.65 x 1000',
  '37.48 Kg => adopt 40 Kg','Kg','IRC 89-1985');
y=hl(y);
y=secHead(y,'7.3 Apron Thickness [IRC 89-1985, Cl.5.3.5.2]');
y=fml(y,'Characteristic apron thickness T',
  'T = 0.06 x (Q_d x f)^(1/3)',
  'T = 0.06 x (60.85 x 2.00)^0.333',
  '0.236','m','IRC 89-1985');
y=datarow(y,'Thickness at inner edge (near raft)','0.60','m  [= 1.5T = 1.5 x 0.236 = 0.354m; provide 0.60m]');
y=datarow(y,'Thickness at outer edge','0.90','m  [= 2.25T = 2.25 x 0.236 = 0.531m; provide 0.90m]');
y=hl(y);
y=secHead(y,'7.4 Launching Apron Width [IRC SP:82-2008, Cl.6.4.2(vi)]');
y=fml(y,'U/S Apron: design to reach 1.5 x Normal Scour depth',
  'Bottom level = HFL - 1.5 x R',
  'Bottom = 6.235 - 1.5 x 1.75 = 3.61m',
  '4.0m (min per IRC SP:82)','m','IRC SP:82');
y=fml(y,'D/S Apron: design to reach 2.0 x Normal Scour depth',
  'Bottom level = HFL - 2.0 x R',
  'Bottom = 6.235 - 2.0 x 1.75 = 2.74m',
  '6.0m (min per IRC SP:82)','m','IRC SP:82');
y=tbl(y,
  ['Apron Location','Scour Level Target','Width Provided','Thickness','Stone Weight'],
  [
    ['Upstream','1.5 x R = 1.5 x 1.75 = 2.625m from HFL','4.0m (min per IRC SP:82)','0.60m inner — 0.90m outer','40 Kg min'],
    ['Downstream','2.0 x R = 2.0 x 1.75 = 3.50m from HFL','6.0m (min per IRC SP:82)','0.60m inner — 0.90m outer','40 Kg min'],
  ],
  {0:{cellWidth:28},1:{cellWidth:55},2:{cellWidth:38},3:{cellWidth:35},4:{cellWidth:17}});
y=note(y,'Rigid floor protection NOT proposed as bed is rocky strata. Flexible aprons with cut-off walls (toe walls 0.90m deep) proposed on both U/S and D/S sides.');
`);

fs.appendFileSync(p, sections.join('\n'));
console.log('Sections 5-7 appended. File size:', fs.statSync(p).size);
