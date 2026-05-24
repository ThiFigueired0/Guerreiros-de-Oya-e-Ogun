import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');
let lines = content.split('\n');

lines[454] = "        </motion.div>"; // Notice: index is 454 so line 455

fs.writeFileSync('src/screens/Home.tsx', lines.join('\n'));
