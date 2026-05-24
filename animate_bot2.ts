import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

content = content.replace(
  /<div className="p-1\.5 bg-brand-copper\/10 rounded-xl text-brand-copper">\s*<Bot className="w-4 h-4" \/>\s*<\/div>/g,
  '<motion.div animate={{ rotate: [-5, 5, -5], y: [0, -2, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="p-1.5 bg-brand-copper/10 rounded-xl text-brand-copper"><Bot className="w-4 h-4" /></motion.div>'
);

fs.writeFileSync('src/screens/Home.tsx', content);
