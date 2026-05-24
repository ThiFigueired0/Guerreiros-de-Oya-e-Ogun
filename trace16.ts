import fs from 'fs';
let lines = fs.readFileSync('src/screens/Home.tsx', 'utf8').split('\n');

const startIndex = lines.findIndex(l => l.includes('1.'));
if (startIndex !== -1) {
  console.log("Lines starting exactly with 1.: ");
  lines.forEach((l, i) => { if(l.includes('1.')) console.log(i+1, l) });
}
