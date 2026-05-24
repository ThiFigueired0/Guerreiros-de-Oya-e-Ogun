import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');
let lines = content.split('\n');

lines[460] = `          <motion.div variants={itemVariants} whileTap={{ scale: 0.98 }} className={cn(`; // Notice line 461 index is 460

fs.writeFileSync('src/screens/Home.tsx', lines.join('\n'));
