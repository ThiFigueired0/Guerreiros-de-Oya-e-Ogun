import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

let lines = content.split('\n');
lines[1104] = "      </motion.div>"; // Notice: 1104 index is line 1105
fs.writeFileSync('src/screens/Home.tsx', lines.join('\n'));
