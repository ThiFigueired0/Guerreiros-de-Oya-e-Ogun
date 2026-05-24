import fs from 'fs';
let lines = fs.readFileSync('src/screens/Home.tsx', 'utf8').split('\n');

const startIndex = lines.findIndex(l => l.includes('Agenda Resumida') || l.includes('Agenda'));
if(startIndex !== -1) {
  for(let i=startIndex; i<startIndex+40; i++) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
