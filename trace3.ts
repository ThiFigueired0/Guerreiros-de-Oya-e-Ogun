import fs from 'fs';
let lines = fs.readFileSync('src/screens/Home.tsx', 'utf8').split('\n');

for (let i = 310; i <= 330; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
