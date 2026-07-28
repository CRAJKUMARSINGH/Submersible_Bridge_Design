const fs = require('fs');
const buf = fs.readFileSync('attached_assets/Type Design of submersible causeway.pdf');
const text = buf.toString('latin1');

// Extract all parenthesized text strings (PDF string objects)
const matches = text.match(/\(([^\)\\]{1,300}(?:\\.[^\)\\]{0,300})*)\)/g) || [];
const cleaned = matches
  .map(m => m.slice(1,-1)
    .replace(/\\n/g,'\n')
    .replace(/\\r/g,' ')
    .replace(/\\t/g,' ')
    .replace(/\\\(/g,'(')
    .replace(/\\\)/g,')')
    .replace(/\\\\/g,'\\')
    .trim()
  )
  .filter(s => s.length > 1 && /[a-zA-Z0-9=\+\-\.\(\)\[\]\/]/.test(s));

// Also extract stream text (BT...ET blocks)
const btBlocks = [];
let idx = 0;
while(true) {
  const start = text.indexOf('BT\n', idx);
  if(start === -1) break;
  const end = text.indexOf('ET\n', start);
  if(end === -1) break;
  btBlocks.push(text.slice(start, end+3));
  idx = end+3;
}

const allText = btBlocks.join('\n');
const tjMatches = allText.match(/\[([^\]]+)\]\s*TJ|Tj\s*\(([^\)]+)\)/g) || [];

fs.writeFileSync('pdf-extracted.txt', 
  '=== PDF STRING OBJECTS ===\n' + cleaned.join('\n') + 
  '\n\n=== BT/ET BLOCKS COUNT: ' + btBlocks.length + ' ===\n' + 
  btBlocks.slice(0,50).join('\n---\n')
);
console.log('Done. Strings found:', cleaned.length, 'BT blocks:', btBlocks.length);
console.log('\nFirst 100 strings:');
cleaned.slice(0,100).forEach((s,i) => console.log(i+':', s));
