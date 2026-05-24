import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');
let lines = content.split('\n');

lines[763] = "                  </motion.button>";
lines[769] = "                  </button>";
lines[803] = "                  </motion.button>";
lines[809] = "                  </button>";

fs.writeFileSync('src/screens/Home.tsx', lines.join('\n'));
