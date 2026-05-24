import fs from 'fs';
let lines = fs.readFileSync('src/screens/Home.tsx', 'utf8').split('\n');

for (let i = 715; i <= 745; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
