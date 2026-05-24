import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');
let lines = content.split('\n');
lines.splice(519, 0, '        </div>');
fs.writeFileSync('src/screens/Home.tsx', lines.join('\n'));
