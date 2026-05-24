import fs from 'fs';
let lines = fs.readFileSync('src/screens/Home.tsx', 'utf8').split('\n');

lines[434] = '            </div>\n          </motion.div>';

fs.writeFileSync('src/screens/Home.tsx', lines.join('\n'));
