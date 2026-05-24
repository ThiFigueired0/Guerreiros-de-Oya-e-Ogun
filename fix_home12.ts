import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');
let lines = content.split('\n');

lines[517] = "          </motion.div>"; // Notice: index is 517 so line 518
lines[518] = "        </div>";
lines[519] = "      </motion.section>";
lines[520] = "";

fs.writeFileSync('src/screens/Home.tsx', lines.join('\n'));
