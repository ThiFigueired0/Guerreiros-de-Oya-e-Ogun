import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

content = content.replace(
  /<Bot className="w-5 h-5" \/>/g,
  '<motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}><Bot className="w-5 h-5" /></motion.div>'
);

fs.writeFileSync('src/screens/Home.tsx', content);
