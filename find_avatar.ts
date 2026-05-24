import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');
let matches = content.split('\n').map((l, i) => [i+1, l]).filter(([i, l]) => (l as string).includes('userAvatar'));
console.log(matches.slice(0, 10));
