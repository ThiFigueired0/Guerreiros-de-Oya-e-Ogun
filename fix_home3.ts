import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

content = content.replace('      {/* 4. Agenda Resumida */}', '      </motion.section>\n      {/* 4. Agenda Resumida */}');

fs.writeFileSync('src/screens/Home.tsx', content);
