import fs from 'fs';
let lines = fs.readFileSync('src/screens/Home.tsx', 'utf8').split('\n');

for (let i = 790; i <= 810; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
