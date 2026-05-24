import fs from 'fs';
let lines = fs.readFileSync('src/screens/Home.tsx', 'utf8').split('\n');

for (let i = 460; i <= 468; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
