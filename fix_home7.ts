import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');
let lines = content.split('\n');

lines[369] = "        </motion.div>"; // Notice: index is 369 so line 370

fs.writeFileSync('src/screens/Home.tsx', lines.join('\n'));
