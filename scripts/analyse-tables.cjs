'use strict';
const XLSX = require('xlsx');
const path = require('path');
const ROOT = process.cwd();
const wb = XLSX.readFile(path.join(ROOT,'attached_assets','Type Design of submersible causeway.xlsx'));
const ws = wb.Sheets[wb.SheetNames[0]];
const range = XLSX.utils.decode_range(ws['!ref']);

// For each row collect: which col-bands have data
// Col bands (logical): 0-4=A-E, 5-14=F-O, 15-36=P-AK, 37=AL(=sign), 38-46=AM-AU, 47-88=AV-CK
function getBands(r) {
  const bands = { A:[], mid:[], eq:false, val:[] };
  for (let c=0;c<=range.e.c;c++){
    const cell=ws[XLSX.utils.encode_cell({r,c})];
    if(!cell||cell.v===undefined||String(cell.v).trim()==='') continue;
    const v=String(cell.v).trim();
    if(c<=14) bands.A.push({c,v:v.substring(0,25)});
    else if(c<=36) bands.mid.push({c,v:v.substring(0,25)});
    else if(c===37) bands.eq=true;
    else if(c<=46) bands.mid.push({c,v:v.substring(0,25)});
    else bands.val.push({c,v:v.substring(0,25)});
  }
  return bands;
}

// Classify row type based on band distribution
const classified={param:0,table:0,heading:0,text:0};
const tableExamples=[];
const paramExamples=[];

for(let r=range.s.r;r<=range.e.r;r++){
  const b=getBands(r);
  const totalCells=b.A.length+b.mid.length+b.val.length;
  if(totalCells===0) continue;
  
  // Table row = multiple cells spread across mid band (cols 5-46) with numbers
  const midNums=b.mid.filter(x=>/^[\d.\-+]+$/.test(x.v.replace(/\s/g,'')));
  const isTable = b.mid.length>=3 && midNums.length>=2;
  const isParam = b.eq && b.val.length>=1;
  const isHeading = b.A.length>=1 && !isParam && b.mid.length<=2 && totalCells<=3;
  
  if(isTable){
    classified.table++;
    if(tableExamples.length<15){
      const cols=[];
      for(let c=0;c<=range.e.c;c++){
        const cell=ws[XLSX.utils.encode_cell({r,c})];
        if(cell&&cell.v!==undefined&&String(cell.v).trim()){
          cols.push(`[col${c}=${String(cell.v).trim().substring(0,15)}]`);
        }
      }
      tableExamples.push({row:r+1,cols});
    }
  } else if(isParam){
    classified.param++;
    if(paramExamples.length<5){
      const lbl=b.A.concat(b.mid.filter(x=>x.c<37)).map(x=>x.v).join(' ');
      const val=b.val.map(x=>x.v).join(' ');
      paramExamples.push({row:r+1,lbl,val});
    }
  } else if(isHeading) classified.heading++;
  else classified.text++;
}

console.log('Row classification:',classified);
console.log('\n── TABLE ROW EXAMPLES ──');
tableExamples.forEach(t=>{
  console.log(`R${t.row}: ${t.cols.join(' ')}`);
});
console.log('\n── PARAM ROW EXAMPLES ──');
paramExamples.forEach(p=>{
  console.log(`R${p.row}: "${p.lbl}"  =  "${p.val}"`);
});

// Find column "slots" used in table rows — these become our logical table columns
const colUsage=new Array(89).fill(0);
for(let r=range.s.r;r<=range.e.r;r++){
  const b=getBands(r);
  const midNums=b.mid.filter(x=>/^[\d.\-+]+$/.test(x.v.replace(/\s/g,'')));
  if(b.mid.length>=3&&midNums.length>=2){
    for(let c=0;c<=range.e.c;c++){
      const cell=ws[XLSX.utils.encode_cell({r,c})];
      if(cell&&cell.v!==undefined&&String(cell.v).trim()) colUsage[c]++;
    }
  }
}
console.log('\n── TABLE COLUMN SLOTS (used >10 times in table rows) ──');
colUsage.forEach((n,c)=>{
  if(n>10) console.log(`  col ${String(c).padStart(2)} (${XLSX.utils.encode_col(c)}): ${n}x`);
});
