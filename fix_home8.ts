import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');
let lines = content.split('\n');

lines[415] = "        </motion.div>"; // Notice: index is 415 so line 416

fs.writeFileSync('src/screens/Home.tsx', lines.join('\n'));
