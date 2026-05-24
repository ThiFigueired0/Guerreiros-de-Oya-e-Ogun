import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

content = content.replace(
  /<div className="w-1\.5 h-1\.5 rounded-full bg-brand-copper" \/> Hoje/g,
  '<motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-brand-copper" /> Hoje'
);

fs.writeFileSync('src/screens/Home.tsx', content);
