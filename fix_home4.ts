import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

// Replace lines 1103 to 1106 with proper closure
let lines = content.split('\n');
// Let's print out lines 1100 to 1106 exactly as they are to be perfectly sure.
console.log(lines.slice(1099, 1106).join('\n'));

// We want:
// 1102:             })}
// 1103:           </div>
// 1104:         </motion.div>
// And remove line 1105
lines[1103] = "          </div>";
lines[1104] = "        </motion.div>";
lines[1105] = ""; // Delete the extra closing tag

fs.writeFileSync('src/screens/Home.tsx', lines.join('\n'));
