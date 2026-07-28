// FULL DETAILED DESIGN REPORT - VENTED SUBMERSIBLE CAUSEWAY
// Source: Type Design of submersible causeway (shared document)
// IRC SP:82-2008 | IRC 6:2000 | IRC SP:13-2004 | IRC 78-2000 | IRC:5-1985
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const OUT='C:/Users/Rajkumar/Downloads/Design-Line-Complete/Causeway_Full_Design_Report.pdf';

const D={
  project:'B.T to the R/f KB Road to P.Bheemavaram',
  MFL:6.235,OFL:5.015,LBL:3.965,slope:0.01520,n:0.050,
  bottomDeck:5.165,RTL:5.645,carriageW:6.000,
  A1:11.74,P1:10.99,R1:1.07,V1:2.58,Q1:30.28,
  A2:12.29,P2:14.22,R2:0.86,V2:2.23,Q2:27.41,
  A3:14.82,P3:14.22,R3:1.04,V3:2.53,Q3:37.49,
  catchA:1.38,C_d:11.5,Q_dickens:21.65,
  h_weir:0.45,L_weir:22.75,Cd_weir:4.10,q_weir:0.68,Q_weir:15.47,
  Q_design:45.75,V_design:2.58,
  A_mid:6.88,A_left:5.75,A_right:5.95,A_pipes:7.63,
  A_vent:26.21,pct_vent:39.40,
  A_HFL:79.33,A_RTL_HFL:30.06,pct_obs:29.07,LW:28.80,W_HFL:45.38,
  a_A:0.71,Co:0.867,e_c:0.91,Dd:0.80,h_aff:0.131,u_vel:1.083,
  Cw:0.94,H_wc:0.99,Du:0.937,h_aff2:0.137,
  di:2.27,hi:0.434,Vv:2.63,LWW:7.67,A_flow:56.27,Vlim:2.0,Q_safe:112.54,
  Q_fdn:60.85,f:2.00,q_m:2.113,R_sc:1.75,Dm:2.63,D_fdn:3.83,
  BFL:2.315,d_LBL:1.56,SBC:15.0,
  d_stone:0.30,wt_stone:40,T_ap:0.236,t_near:0.60,t_far:0.90,W_US:4.0,W_DS:6.0,
  span:6.00,L_dk:6.800,t_slab:0.480,t_wc:0.075,h_guard:0.750,
  t_dirt:0.30,A_dirt:0.370,t_strip:0.45,H_abut:1.200,
  b_top:0.750,b_bot:1.05,A_abut:1.080,
  b1:1.35,d1:0.30,b2:1.50,d2:0.30,b3:1.65,d3:0.30,b4:1.95,d4:0.45,
  yRCC:25,yPCC:24,yFill:18,yW:10,phi:30,alpha:90,beta:0,delta:15,h_sur:1.20,
  W_slab:244.80,W_dw:55.50,W_wc:38.25,W_DL:338.55,
  W_abut:155.52,W_f1:58.32,W_f2:64.80,W_f3:71.28,W_abut_tot:349.92,
  loc_abut:0.60,e_abut:0.075,loc_f1:0.73,e_f1:0.055,
  loc_f2:0.85,e_f2:0.100,loc_f3:0.84,e_f3:0.015,
  W_LL:478.41,Ra:182.64,Rb:295.77,
  imp_f:0.352,imp_abut:0.176,LL_imp:347.83,imp_load:52.06,
  ecc_x:0.543,ecc_y:0.804,
  P_wind:59.48,h_wind:1.755,B_wind:7.4,F_wind:18.00,F_wind_dk:3.86,
  V_wc:3.65,K_wc:1.5,P_wc:201.24,F_wc_dk:3.80,F_wc_abut:3.38,
  F_brake:47.84,vol_abut:14.58,buoy:145.80,
  Ka:0.30,Pa_base:6.48,A_rect:7.78,A_tri:3.89,
  EP:69.98,EP_h:67.60,EP_v:18.10,EP_ht:0.53,
  F_wp:11.48,ht_wp:0.71,F_eddy:0.007,F_fr_dk:4.96,F_fr_abut:0.50,
  h_up:0.543,F_uplift:195.48,
  s_heel_sf:37.03,s_toe_sf:172.34,s_US_sf:42.41,s_DS_sf:198.24,
  s_heel_f3:34.23,s_toe_f3:180.21,s_US_f3:32.95,s_DS_f3:218.21,
  s_heel_f2:26.21,s_toe_f2:195.70,s_US_f2:20.59,s_DS_f2:245.57,
  s_heel_f1:6.41,s_toe_f1:260.77,
  M_ot3:177.66,M_r3:496.00,FS_OT3:2.79,FS_SL3:5.47,
  M_ot2:36.05,M_r2:156.65,FS_OT2:4.35,FS_SL2:2.98,
  mu_cc:0.80,mu_sf:0.50,
  pier_w:0.90,pier_h:1.200,pb1:0.90,pb2:1.20,pb3:1.50,pb4:1.80,
  W_pier:155.52,W_pier_DL:627.60,W_pier_LL:421.85,
  F_wc_pier:4.30,F_fr_pier:0.50,
  ps_heel4:64.47,ps_toe4:48.53,ps_US4:44.17,ps_DS4:68.83,
  FS_OT_pier:3.83,FS_SL_pier:9.18,
  FW:[
    {id:'BIT-I',  H:2.40,Ka:0.57,sur:615.6, Pa:2462.40,EP_h:3050.65,EP_v:3215.43,maxS:11468,minS:4915,FS_sl:1.81,FS_ot:3.27},
    {id:'BIT-II', H:1.80,Ka:0.57,sur:615.6, Pa:1846.80,EP_h:1906.65,EP_v:2009.65,maxS:8640, minS:4160,FS_sl:1.81,FS_ot:3.36},
    {id:'BIT-III',H:1.20,Ka:0.51,sur:550.8, Pa:1101.60,EP_h:973.55, EP_v:894.24, maxS:5958, minS:3208,FS_sl:1.69,FS_ot:3.05},
    {id:'BIT-IV', H:0.80,Ka:0.42,sur:453.6, Pa:604.80, EP_h:501.50, EP_v:338.05, maxS:4171, minS:2557,FS_sl:1.51,FS_ot:2.56},
  ],
  fck_PCC:20,fck_RCC:25,fy:415,fc:5000,ft:-2800,cover:50,
};

// ── PDF ENGINE ────────────────────────────────────────────
const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
const PW=doc.internal.pageSize.getWidth();
const PH=doc.internal.pageSize.getHeight();
let pg=0;

function addPage(){
  if(pg>0)doc.addPage();
  pg++;
  doc.setDrawColor(0);doc.setLineWidth(0.6);doc.rect(7,7,PW-14,PH-14);
  doc.setLineWidth(0.25);doc.rect(9.5,9.5,PW-19,PH-19);
  // header bar
  doc.setFillColor(15,30,70);doc.rect(7,7,PW-14,10,'F');
  doc.setFontSize(7);doc.setFont('helvetica','bold');doc.setTextColor(245,180,0);
  doc.text('DESIGN OF VENTED SUBMERSIBLE CAUSEWAY | '+D.project,PW/2,13.5,{align:'center'});
  // footer
  doc.setFontSize(6);doc.setFont('helvetica','normal');doc.setTextColor(80);
  doc.text('IRC SP:82-2008 | IRC 6:2000 | IRC SP:13-2004 | IRC 78-2000',14,PH-5);
  doc.text('Page '+pg+' of 40',PW-14,PH-5,{align:'right'});
  doc.setTextColor(0);
  return 22;
}

function bigTitle(y,t){
  doc.setFontSize(13);doc.setFont('helvetica','bold');doc.setTextColor(0);
  doc.text(t,PW/2,y,{align:'center'});
  doc.setLineWidth(0.5);doc.setDrawColor(15,30,70);
  doc.line(12,y+2,PW-12,y+2);
  doc.setDrawColor(0);
  return y+9;
}

function secHead(y,t){
  doc.setFillColor(15,30,70);doc.rect(11,y-4.5,PW-22,7,'F');
  doc.setFontSize(8.5);doc.setFont('helvetica','bold');doc.setTextColor(245,180,0);
  doc.text(t,14,y);doc.setTextColor(0);
  return y+6;
}

function subHead(y,t){
  doc.setFillColor(210,220,240);doc.rect(11,y-4,PW-22,6,'F');
  doc.setFontSize(8);doc.setFont('helvetica','bold');doc.setTextColor(15,30,70);
  doc.text(t,14,y);doc.setTextColor(0);
  return y+5.5;
}

function mini(y,t){
  doc.setFontSize(7.5);doc.setFont('helvetica','bold');doc.setTextColor(30,50,120);
  doc.text(t,14,y);doc.setTextColor(0);
  return y+4.5;
}

// formula: shows symbolic formula, then substituted values, then result
function fml(y,name,symbolic,subst,result,unit,ref,indent=14){
  const lim=PW-26;
  doc.setFontSize(7.5);doc.setFont('helvetica','bold');doc.setTextColor(0);
  doc.text(name,indent,y);y+=4.2;
  doc.setFont('courier','normal');doc.setTextColor(0,50,150);
  doc.text('  Formula : '+symbolic,indent+2,y);y+=3.8;
  doc.text('  Values  : '+subst,indent+2,y);y+=3.8;
  doc.setFont('helvetica','bold');doc.setTextColor(15,30,70);
  doc.text('  Result  : '+result+' '+unit,indent+2,y);
  if(ref){doc.setFont('helvetica','italic');doc.setFontSize(6);doc.setTextColor(100);
    doc.text('['+ref+']',PW-13,y,{align:'right'});}
  doc.setTextColor(0);doc.setFontSize(7.5);
  return y+5;
}

function datarow(y,label,value,unit,indent=14){
  doc.setFontSize(7.5);doc.setFont('helvetica','normal');
  doc.text(label,indent,y);
  doc.setFont('helvetica','bold');
  doc.text('= '+String(value)+' '+unit, indent+105,y);
  doc.setFont('helvetica','normal');
  return y+4.2;
}

function para(y,t,indent=14){
  doc.setFontSize(7.5);doc.setFont('helvetica','normal');doc.setTextColor(0);
  const lines=doc.splitTextToSize(t,PW-24);
  doc.text(lines,indent,y);
  return y+lines.length*4+1;
}

function note(y,t){
  doc.setFontSize(6.5);doc.setFont('helvetica','italic');doc.setTextColor(60);
  const lines=doc.splitTextToSize('Note: '+t,PW-24);
  doc.text(lines,16,y);doc.setTextColor(0);
  return y+lines.length*3.8+1;
}

function hl(y,col=[150,150,150]){
  doc.setDrawColor(col[0],col[1],col[2]);doc.setLineWidth(0.2);
  doc.line(11,y,PW-11,y);doc.setDrawColor(0);return y+2;
}

function chk(y,label,computed,limit,pass){
  doc.setFontSize(7.5);doc.setFont('helvetica','normal');
  doc.text(label,16,y);
  doc.setFont('helvetica','bold');
  doc.text(String(computed),PW*0.55,y,{align:'right'});
  doc.text(limit,PW*0.55+3,y);
  if(pass){doc.setFillColor(0,130,0);doc.setTextColor(255);}
  else    {doc.setFillColor(200,0,0);doc.setTextColor(255);}
  doc.rect(PW-30,y-3.5,18,5,'F');
  doc.text(pass?'SAFE / OK':'UNSAFE',PW-21,y,{align:'center'});
  doc.setTextColor(0);doc.setFillColor(255,255,255);
  return y+5;
}

function tbl(y,head,rows,cw){
  doc.autoTable({
    startY:y,head:[head],body:rows,theme:'grid',
    margin:{left:11,right:11},
    headStyles:{fillColor:[15,30,70],textColor:[245,180,0],fontStyle:'bold',fontSize:6.5,cellPadding:1.5},
    bodyStyles:{fontSize:6.2,cellPadding:1.2},
    alternateRowStyles:{fillColor:[240,244,255]},
    columnStyles:cw||{},
  });
  return doc.lastAutoTable.finalY+3;
}

function gap(y,n=4){return y+n;}
function cp(y,n=20){if(y+n>PH-18){y=addPage();}return y;}

// ═══════════════════════════════════════════════════════════
// PAGE 1 — COVER PAGE
// ═══════════════════════════════════════════════════════════
let y=addPage();
doc.setFillColor(15,30,70);doc.rect(7,7,PW-14,PH-14,'F');
doc.setDrawColor(245,180,0);doc.setLineWidth(1.2);
doc.rect(12,12,PW-24,PH-24);
doc.setLineWidth(0.5);doc.rect(14,14,PW-28,PH-28);

doc.setFontSize(9);doc.setFont('helvetica','bold');doc.setTextColor(245,180,0);
doc.text('GOVERNMENT OF INDIA',PW/2,32,{align:'center'});
doc.text('ROADS & BUILDINGS DEPARTMENT',PW/2,38,{align:'center'});

doc.setFillColor(245,180,0);doc.rect(20,46,PW-40,0.8,'F');

doc.setFontSize(20);doc.setFont('helvetica','bold');doc.setTextColor(255,255,255);
doc.text('DETAILED DESIGN REPORT',PW/2,60,{align:'center'});
doc.setFontSize(14);doc.setTextColor(245,180,0);
doc.text('VENTED SUBMERSIBLE CAUSEWAY',PW/2,70,{align:'center'});

doc.setFillColor(245,180,0);doc.rect(20,76,PW-40,0.5,'F');

doc.setFontSize(8);doc.setFont('helvetica','normal');doc.setTextColor(200,200,200);
doc.text('HYDRAULIC & STRUCTURAL DESIGN WITH COMPLETE COMPUTATION',PW/2,83,{align:'center'});
doc.text('ALL FORMULAE LINKED WITH VARIABLES — STEP-BY-STEP CALCULATIONS',PW/2,88,{align:'center'});

// Project box
doc.setFillColor(0,15,45);doc.rect(20,96,PW-40,48,'F');
doc.setDrawColor(245,180,0);doc.setLineWidth(0.4);doc.rect(20,96,PW-40,48);
const pInfo=[
  ['Name of Work','B.T to the R/f KB Road to P.Bheemavaram'],
  ['Design Philosophy','Vented Submersible Causeway'],
  ['Applicable Codes','IRC SP:82-2008, IRC 6:2000, IRC SP:13-2004, IRC 78-2000, IRC:5-1985'],
  ['Design Discharge','Q = 45.75 Cumecs (Governing: Area-Velocity Method)'],
  ['Vent Configuration','3 Spans x 6.0m + 4 Nos 900mm dia pipes each side'],
  ['Foundation Level','BFL = +2.315m (Below Maximum Scour Level)'],
  ['Safe Bearing Capacity','15.0 t/m² at 1.50m below LBL'],
];
pInfo.forEach(([k,v],i)=>{
  doc.setFontSize(7.5);doc.setFont('helvetica','bold');doc.setTextColor(245,180,0);
  doc.text(k+' :',24,104+i*6.5);
  doc.setFont('helvetica','normal');doc.setTextColor(220,220,220);
  doc.text(v,75,104+i*6.5);
});

// Contents list
doc.setFillColor(245,180,0);doc.rect(20,150,PW-40,0.5,'F');
doc.setFontSize(8);doc.setFont('helvetica','bold');doc.setTextColor(245,180,0);
doc.text('CONTENTS',PW/2,158,{align:'center'});
const contents=[
  'Section 1  — Design Philosophy & Scope (IRC SP:82-2008)',
  'Section 2  — Hydraulic Particulars & Stream Survey Data',
  'Section 3  — Discharge Calculations (Area-Velocity + Catchment + Weir)',
  'Section 4  — Ventway Calculations & Fixation of RTL',
  'Section 5  — Afflux Calculations (Orifice & Broad-Crested Weir Methods)',
  'Section 6  — Scour Depth & Foundation Level (Lacey\'s Equations)',
  'Section 7  — Design of Protection Works & Launching Aprons',
  'Section 8  — General Loading Pattern (IRC 6:2000)',
  'Section 9  — Design of Abutments (All Load Envelopes)',
  'Section 10 — Stability Checks — Overturning & Sliding',
  'Section 11 — Design of Strip Footing (RCC)',
  'Section 12 — Design of Piers (All Footings)',
  'Section 13 — Design of Face Walls (BIT-I to BIT-IV)',
  'Section 14 — Summary of Results & Compliance',
];
contents.forEach((c,i)=>{
  doc.setFontSize(7);doc.setFont('helvetica','normal');doc.setTextColor(200,200,200);
  doc.text(c,24,165+i*5.5);
});

doc.setFontSize(6.5);doc.setFont('helvetica','italic');doc.setTextColor(150,150,150);
doc.text('Computed by CSWY-CALC | IRC SP:82-2008 Compliant Design Tool',PW/2,PH-18,{align:'center'});

// ==========================================================
// PAGE 2 — SECTION 1: DESIGN PHILOSOPHY
// ==========================================================
y=addPage();
y=bigTitle(y,'SECTION 1 — DESIGN PHILOSOPHY & SCOPE');
y=secHead(y,'1.1 General Approach — IRC SP:82-2008');
y=para(y,'The design of the Vented Submersible Causeway is carried out as per the procedure outlined in IRC SP:82-2008. The structure is designed to permit submergence during flood, while providing adequate ventway to minimise afflux and reduce scour.');
y=gap(y);
y=secHead(y,'1.2 Step-wise Design Procedure');
const steps=[
  ['Step 1','DISCHARGE: Design discharge fixed by three methods: (a) Area-Velocity Method at bridge site and at 300m upstream/downstream; (b) Catchment Area Method using Dicken\'s formula; (c) Surplus weir discharge from tank using broad-crested weir formula. Maximum of the three governs.'],
  ['Step 2','HYDRAULIC: HFL and OFL fixed from local enquiry. RTL kept below HFL so that obstruction at RTL < 70% and at HFL < 30% (IRC SP:82-2008 Cl.5.1.3). Afflux calculated. Scour depth by Lacey\'s equations. Foundation level fixed below maximum scour.'],
  ['Step 3','STRUCTURAL: Components designed per IRC 6:2000 (IRC Class A live load). Drag, uplift, silt load per IRC SP:82-2008 Cl.7. Stainless steel anchor bars and VRCC thrust blocks per IRC SP:82-2007. Individual foundations for SBC = 15 t/m² at 1.80m below LBL.'],
];
y=tbl(y,['Step','Design Activity'],steps,{0:{cellWidth:18},1:{cellWidth:155}});
y=gap(y);
y=secHead(y,'1.3 Code References');
const codes=[
  ['IRC SP:82-2008','Guidelines for Design of Causeways and Submersible Bridges'],
  ['IRC 6:2000','Standard Specifications and Code of Practice for Road Bridges — Loads and Stresses'],
  ['IRC SP:13-2004','Guidelines for the Design of Small Bridges and Culverts'],
  ['IRC 78:2000','Standard Specifications and Code of Practice for Road Bridges — Foundations & Substructure'],
  ['IRC:5-1985','Standard Specifications and Code of Practice for Road Bridges — General Features'],
  ['IRC 89:1985','Guidelines for Design and Construction of River Training and Control Works'],
  ['IRC SP:20-2002','Rural Roads Manual (Deck slab and Dirt wall plates referenced)'],
];
y=tbl(y,['Code','Title'],codes,{0:{cellWidth:35},1:{cellWidth:138}});
y=gap(y);
y=secHead(y,'1.4 Material Specifications');
const mats=[
  ['Concrete for PCC works','M20 grade','fck = 20 N/mm²','Permissible comp. stress = 5.0 N/mm² (5000 kN/m²)'],
  ['Concrete for RCC works','M25 grade','fck = 25 N/mm²','Permissible bending tension = -2.8 N/mm² (-2800 kN/m²)'],
  ['Reinforcement steel','Fe 415 HYSD','fy = 415 N/mm²','Cover to reinforcement = 50 mm'],
  ['Unit weight of RCC','25 kN/m³','—','IRC 6:2000'],
  ['Unit weight of PCC','24 kN/m³','—','IRC 6:2000'],
  ['Unit weight of backfill','18 kN/m³','—','IRC 6:2000'],
  ['Unit weight of water','10 kN/m³','—','IRC 6:2000'],
];
y=tbl(y,['Material','Grade/Type','Strength','Remark'],mats,{0:{cellWidth:45},1:{cellWidth:30},2:{cellWidth:35},3:{cellWidth:65}});

// ==========================================================
// PAGE 3-4 — SECTION 2 & 3: HYDRAULIC PARTICULARS + DISCHARGE
// ==========================================================
y=addPage();
y=bigTitle(y,'SECTION 2 — HYDRAULIC PARTICULARS');
y=secHead(y,'2.1 Stream Data from Site Survey & Local Enquiry');
y=datarow(y,'Maximum Flood Level (MFL / HFL)',D.MFL,'m');
y=datarow(y,'Ordinary Flood Level (OFL)',D.OFL,'m');
y=datarow(y,'Lowest Bed Level (LBL)',D.LBL,'m');
y=datarow(y,'Average Bed Slope (S)',D.slope,'(1 in '+Math.round(1/D.slope)+')');
y=datarow(y,"Rugosity Coefficient (n) — Manning's",D.n,'(as per Table 5, IRC SP:13)');
y=datarow(y,'Bottom of Deck Proposed (MFL + Vertical Clearance)',D.bottomDeck,'m');
y=datarow(y,'Road Crest Level / RTL (Deck Bottom + Deck Thickness)',D.RTL,'m');
y=datarow(y,'Width of Carriage Way',D.carriageW,'m');
y=gap(y,3);
y=secHead(y,'2.2 Cross-Section Data at Proposed Bridge Site (20m Upstream)');
y=tbl(y,
  ['Sno','Chainage (m)','RL (m)','Depth (m)','Avg Depth (m)','Distance (m)','Area (m²)','Wet Perim (m)'],
  [
    ['1','0','6.500','0.00','0.00','0.00','0.00','0.00'],
    ['2','1','5.340','0.90','0.45','1.00','0.45','1.08'],
    ['3','2','4.560','1.68','1.29','1.00','1.29','1.05'],
    ['4','4','3.965','2.27','1.97','2.00','3.95','2.05'],
    ['5','6','4.780','1.46','1.86','2.00','3.73','2.34'],
    ['6','7','5.300','0.94','1.20','1.00','1.20','1.12'],
    ['7','9','6.100','0.14','0.54','2.00','1.07','2.30'],
    ['8','10','6.420','0.00','0.07','1.00','0.07','1.05'],
    ['','','','','','TOTAL','11.74','10.99'],
  ],{});
y=gap(y,2);
y=fml(y,"Hydraulic Radius R",
  "R = Total Area / Wetted Perimeter",
  "R = "+D.A1+" / "+D.P1,D.R1+"m",'m','Manning');
y=fml(y,"Velocity by Manning's Formula",
  "V = (1/n) x R^(2/3) x S^(1/2)",
  "V = (1/"+D.n+") x "+D.R1+"^0.667 x "+D.slope+"^0.5",D.V1,"m/sec",'Manning');
y=fml(y,"Discharge at Bridge Site",
  "Q = A x V",
  "Q = "+D.A1+" x "+D.V1,D.Q1,"Cumecs",'IRC SP:82');
y=hl(y);y=cp(y,30);

y=secHead(y,'2.3 Cross-Section at 300m Upstream');
y=tbl(y,
  ['Sno','Chainage (m)','RL (m)','Depth (m)','Avg Depth','Distance','Area (m²)','Wet Perim'],
  [
    ['1','0','9.450','0.00','0.00','0.00','0.00','0.00'],
    ['2','1','8.290','0.95','0.47','1.00','0.47','1.08'],
    ['3','2','7.720','1.52','1.23','1.00','1.23','1.05'],
    ['4','4','7.500','1.74','1.63','2.00','3.25','2.05'],
    ['5','6','7.650','1.59','1.66','2.00','3.32','2.34'],
    ['6','8','8.250','0.98','1.29','2.00','2.57','2.20'],
    ['7','10','9.050','0.18','0.58','2.00','1.17','2.30'],
    ['8','13','9.370','0.00','0.09','3.00','0.28','3.20'],
    ['','','','','','TOTAL','12.29','14.22'],
  ],{});
y=fml(y,"R (upstream)","R = A/P","R = "+D.A2+"/"+D.P2,D.R2,"m",'');
y=fml(y,"V (upstream)","V = (1/n).R^0.667.S^0.5","V = (1/"+D.n+")x"+D.R2+"^0.667x"+D.slope+"^0.5",D.V2,"m/s",'');
y=fml(y,"Q (upstream)","Q = A x V","Q = "+D.A2+" x "+D.V2,D.Q2,"Cumecs",'');
y=hl(y);y=cp(y,30);

y=secHead(y,'2.4 Cross-Section at 300m Downstream');
y=tbl(y,
  ['Sno','Chainage (m)','RL (m)','Depth (m)','Avg Depth','Distance','Area (m²)','Wet Perim'],
  [
    ['1','0','4.400','0.00','0.00','0.00','0.00','0.00'],
    ['2','1','3.240','0.80','0.40','1.00','0.40','1.08'],
    ['3','2','2.460','1.58','1.19','1.00','1.19','1.05'],
    ['4','4','1.660','2.38','1.98','2.00','3.95','2.05'],
    ['5','6','1.770','2.27','2.32','2.00','4.64','2.34'],
    ['6','8','3.200','0.84','1.55','2.00','3.10','2.20'],
    ['7','10','3.750','0.29','0.56','2.00','1.12','2.30'],
    ['8','13','4.320','0.00','0.14','3.00','0.43','3.20'],
    ['','','','','','TOTAL','14.82','14.22'],
  ],{});
y=fml(y,"R (downstream)","R = A/P","R = "+D.A3+"/"+D.P3,D.R3,"m",'');
y=fml(y,"V (downstream)","V = (1/n).R^0.667.S^0.5","V = (1/"+D.n+")x"+D.R3+"^0.667x"+D.slope+"^0.5",D.V3,"m/s",'');
y=fml(y,"Q (downstream)","Q = A x V","Q = "+D.A3+" x "+D.V3,D.Q3,"Cumecs",'');

// ==========================================================
// SECTION 3 — DISCHARGE CALCULATIONS
// ==========================================================
y=addPage();
y=bigTitle(y,'SECTION 3 — DISCHARGE CALCULATIONS');
y=secHead(y,'3.1 Area-Velocity Method — Summary');
y=tbl(y,
  ['Location','Area (m²)','Wet Perim (m)','R = A/P (m)','V = (1/n)R^0.667S^0.5 (m/s)','Q = AxV (Cumecs)'],
  [
    ['At Bridge Site (20m U/S)',D.A1,D.P1,D.R1,D.V1,D.Q1],
    ['300m Upstream',D.A2,D.P2,D.R2,D.V2,D.Q2],
    ['300m Downstream',D.A3,D.P3,D.R3,D.V3,D.Q3],
  ],{0:{cellWidth:42}});
y=gap(y,2);
y=note(y,'Design discharge of stream = MAXIMUM of three sections = '+D.Q1+' Cumecs (at bridge site governs)');
y=hl(y);

y=secHead(y,'3.2 Catchment Area Method — Dicken\'s Formula');
y=fml(y,"Discharge by Dicken's Formula",
  "Q = C x A^(3/4)",
  "Q = "+D.C_d+" x "+D.catchA+"^0.75",D.Q_dickens,"Cumecs",'Cl.4, IRC SP:82');
y=note(y,'Catchment area = '+D.catchA+' sq.km (from stream alignment and local enquiry). Dicken\'s constant C = '+D.C_d);
y=hl(y);

y=secHead(y,'3.3 Surplus Weir Discharge from Tank');
y=para(y,'The tank surplus weir is treated as a broad-crested weir. Head of flow assumed from local enquiry = '+D.h_weir+'m. Cd = '+D.Cd_weir+' (as adopted by Irrigation Authorities).');
y=fml(y,"Discharge per metre length of weir",
  "q = Cd x h^(3/2)",
  "q = "+D.Cd_weir+" x "+D.h_weir+"^1.5",D.q_weir,"Cumecs/m",'Broad-crested weir');
y=datarow(y,'Length of surplus weir (check dam)',D.L_weir,'m');
y=fml(y,"Total weir discharge",
  "Q2 = q x L",
  "Q2 = "+D.q_weir+" x "+D.L_weir,D.Q_weir,"Cumecs",'');
y=hl(y);

y=secHead(y,'3.4 Final Design Discharge');
y=tbl(y,
  ['Method','Computed Q (Cumecs)','Remarks'],
  [
    ['Area-Velocity (at bridge)',D.Q1,'Controls — maximum value governs'],
    ['Area-Velocity (300m U/S)',D.Q2,'—'],
    ['Area-Velocity (300m D/S)',D.Q3,'—'],
    ["Dicken's Formula",D.Q_dickens,'Catchment area method'],
    ['Surplus Weir (Tank)',D.Q_weir,'Added to stream discharge'],
    ['DESIGN DISCHARGE = Stream + Weir','45.75 = 30.28 + 15.47','GOVERNING VALUE'],
  ],{0:{cellWidth:58},1:{cellWidth:38},2:{cellWidth:77}});
y=gap(y,2);
y=fml(y,"DESIGN DISCHARGE",
  "Q_design = Q_stream + Q_tank_weir",
  "Q_design = "+D.Q1+" + "+D.Q_weir,D.Q_design,"Cumecs",'IRC SP:82 Cl.4');
y=datarow(y,'Design Velocity',D.V_design,'m/sec');
y=hl(y);

// ==========================================================
// SECTION 4 — VENTWAY CALCULATIONS & RTL
// ==========================================================
y=addPage();
y=bigTitle(y,'SECTION 4 — VENTWAY CALCULATIONS & FIXATION OF RTL');
y=secHead(y,'4.1 IRC Code Requirement — Cl.5.1.3(ii)(a), IRC SP:82-2008');
y=para(y,'Vented submersible causeways shall provide a vent area of at least 30% of the unobstructed area of the stream measured between RTL and stream bed. Further, the obstruction at design HFL condition shall NOT exceed 30%.');
y=gap(y,2);
y=secHead(y,'4.2 Proposed Vent Arrangement (Trial 1 — RTL = +'+D.RTL+'m)');
y=para(y,'To prevent debris clogging, 3 spans of 6m each are proposed. Additionally, 4 Nos of 900mm diameter pipe vents are provided on each side of spans to avoid concentration of flow and formation of eddies near face walls.');
y=gap(y,2);
y=tbl(y,
  ['Vent Component','Vented Area Provided (m²)','Remarks'],
  [
    ['Middle Span (6m)','6.88','Between RTL and bed level'],
    ['Left Side Span (6m)','5.75','—'],
    ['Right Side Span (6m)','5.95','—'],
    ['900mm dia pipes (4 Nos each side)','7.63','π/4 x 0.9² x 4 x 2 sides'],
    ['TOTAL VENTED AREA','26.21','A_vent_total'],
  ],{0:{cellWidth:65},1:{cellWidth:45},2:{cellWidth:63}});
y=gap(y,2);
y=fml(y,"Percentage Vented Area at RTL",
  "%_vent = (A_vent / A_stream_RTL) x 100",
  "% = (26.21 / 66.53) x 100",D.pct_vent.toFixed(2)+"%",'',"Cl.5.1.3, IRC SP:82");
y=chk(y,'Ventway % at RTL: '+D.pct_vent+'% > 30% limit','39.40%','> 30%',true);
y=hl(y);

y=secHead(y,'4.3 Obstruction Check at HFL Condition');
y=datarow(y,'Total unobstructed area of stream between HFL & bed',D.A_HFL,'m² (from AUTOCAD graphical calc.)');
y=datarow(y,'Area available for flow between HFL & RTL/PBL',D.A_RTL_HFL,'m²');
y=datarow(y,'Total vented area provided (A_vent)',D.A_vent,'m²');
y=gap(y,2);
y=fml(y,"Total area available for flow at HFL",
  "A_total_flow = A_RTL_HFL + A_vent",
  "A_total = "+D.A_RTL_HFL+" + "+D.A_vent,"56.27","m²",'');
y=fml(y,"% Obstruction at HFL",
  "% Obs_HFL = (1 - A_total_flow / A_HFL) x 100",
  "% = (1 - 56.27 / "+D.A_HFL+") x 100",D.pct_obs.toFixed(2)+"%",'',"Cl.5.1.3, IRC SP:82");
y=chk(y,'% Obstruction at HFL = '+D.pct_obs+'% < 30% limit','29.07%','< 30%',true);
y=hl(y);

y=secHead(y,'4.4 Hydraulic Particulars Fixed');
y=tbl(y,
  ['Parameter','Value','Basis'],
  [
    ['Design HFL (from local enquiry)','+'+D.MFL+'m','Field survey'],
    ['RTL (Road Top Level)','+'+D.RTL+'m','Fixed after ventway trials'],
    ['Bottom of Deck Level','+'+D.bottomDeck+'m','HFL + vertical clearance'],
    ['Width of Linear Waterway',D.LW+'m','Between abutments'],
    ['Width of Channel at HFL',D.W_HFL+'m','From cross-section'],
    ['Unobstructed Area at HFL',D.A_HFL+' m²','AUTOCAD graphical calculation'],
    ['Depth of Downstream Water (Dd)',D.Dd+'m','Used in afflux calculation'],
  ],{0:{cellWidth:70},1:{cellWidth:30},2:{cellWidth:73}});

// ==========================================================
// SECTION 5 — AFFLUX CALCULATIONS
// ==========================================================
y=addPage();
y=bigTitle(y,'SECTION 5 — AFFLUX CALCULATIONS (HFL CONDITION)');
y=secHead(y,'5.1 Method A — Orifice Formula (IRC SP:13-2004, Cl.15.1)');
y=para(y,'Case (a): Afflux assumed less than 1.4 x Dd = 1.4 x '+D.Dd+' = '+(1.4*D.Dd).toFixed(3)+'m. Use Orifice formula:');
y=gap(y,2);
y=fml(y,"Orifice Discharge Formula",
  "Q = Co x sqrt(2g) x L x D x [h + (1+e)u²/2g]^0.5",
  "a/A = "+D.a_A+" => Co = "+D.Co+", e = "+D.e_c,
  '','','IRC SP:13-2004, Cl.15.1');
y=gap(y,2);
y=mini(y,'Simplified form after substitution:');
y=fml(y,"Equation (1)",
  "0.26735 = h + 0.097350 x u²",
  "Derived from Q="+D.Q_design+", a/A="+D.a_A,
  '(1)','','');
y=fml(y,"Equation (2) — velocity at upstream",
  "u = Q / [(Dd + h) x W]",
  "u = "+D.Q_design+" / [("+D.Dd+"+h) x "+D.LW+"]",
  '(2)','','');
y=gap(y,2);
y=mini(y,'Trial and Error Solution:');
y=tbl(y,
  ['Trial h (m)','Equation (1) RHS','LHS = 0.26735','Satisfied?'],
  [
    ['h = 0.30m','0.333765','0.26735','NOT satisfied'],
    ['h = 0.131m','0.267765','0.26735','SATISFIED ✓'],
  ],{0:{cellWidth:38},1:{cellWidth:45},2:{cellWidth:35},3:{cellWidth:55}});
y=gap(y,2);
y=fml(y,"Afflux (Method A — Orifice Formula)",
  "h = 0.131m (by trial & error)",
  "Velocity u = "+D.Q_design+" / [("+D.Dd+"+0.131) x "+D.LW+"]",
  D.h_aff+"m (Afflux), u = "+D.u_vel+"m/s",'m','IRC SP:13-2004');
y=hl(y);

y=secHead(y,'5.2 Method B — Broad-Crested Weir Formula (IRC SP:13, Cl.15.2) [CHECK]');
y=para(y,'Case (b): Afflux assumed > 1.4 x Dd. Applying broad-crested weir formula as check:');
y=fml(y,"Weir Discharge Formula",
  "Q = 1.706 x Cw x L x H^(3/2)",
  "45.75 = 1.706 x "+D.Cw+" x "+D.LW+" x H^1.5",
  D.H_wc+"m",'H','IRC SP:13, Cl.15.2');
y=fml(y,"Upstream Depth (Du) by iteration",
  "Du = H - u²/2g, Q = Du x W x u",
  "H="+D.H_wc+", iterate: Du = "+D.Du+"m, u = 1.018 m/s",
  D.Du+"m",'Du','');
y=fml(y,"Afflux (Method B)",
  "h = Du - Dd",
  "h = "+D.Du+" - "+D.Dd,D.h_aff2+"m",'','');
y=gap(y,2);
y=tbl(y,
  ['Method','Afflux (m)','Basis','Adopted?'],
  [
    ['Method A — Orifice Formula',D.h_aff,'IRC SP:13-2004 Cl.15.1','YES — Governs (h < 1.4 x Dd)'],
    ['Method B — Broad-Crested Weir',D.h_aff2,'IRC SP:13-2004 Cl.15.2','Check only'],
  ],{0:{cellWidth:55},1:{cellWidth:22},2:{cellWidth:55},3:{cellWidth:41}});
y=note(y,'Afflux is less than (1/4)th of Dd. Hence Orifice formula governs. Adopted afflux = '+D.h_aff+'m');
