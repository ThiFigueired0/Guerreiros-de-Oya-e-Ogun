import fs from 'fs';
let lines = fs.readFileSync('src/screens/Home.tsx', 'utf8').split('\n');

lines[433] = '            </div>';
lines[434] = '          </motion.div>';
lines[435] = '          <div className="flex items-center justify-between mb-3 relative z-10">';
lines[436] = '            <div className={cn(';

fs.writeFileSync('src/screens/Home.tsx', lines.join('\n'));
