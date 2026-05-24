import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

// I will globally replace any </button>\n                  <button to </motion.button>\n                  <button to fix what I broke, if that helps? Or no, I'll just write a script.

let lines = content.split('\n');
lines[727] = "                  </motion.button>"; // closing the bath button
lines[733] = "                  </button>"; // closing the favorite remove button

fs.writeFileSync('src/screens/Home.tsx', lines.join('\n'));
