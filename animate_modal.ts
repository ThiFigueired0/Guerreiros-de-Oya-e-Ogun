import fs from 'fs';
let content = fs.readFileSync('src/components/DailyMessageModal.tsx', 'utf8');

content = content.replace(
  /<Sparkles className="w-12 h-12 text-\[\#C5A059\]" strokeWidth=\{1\} \/>/g,
  '<motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}><Sparkles className="w-12 h-12 text-[#C5A059]" strokeWidth={1} /></motion.div>'
);

content = content.replace(
  /<p className="text-white\/80 text-sm font-light tracking-widest text-center uppercase">\s*Toque para despertar sua força\s*<\/p>/g,
  '<motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="text-white/80 text-sm font-light tracking-widest text-center uppercase">Toque para despertar sua força</motion.p>'
);

fs.writeFileSync('src/components/DailyMessageModal.tsx', content);
