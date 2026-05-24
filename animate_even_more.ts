import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

// 6. Animate the 'Ver Detalhes' and 'Ver agenda completa' texts to have a pulsing underline or slight bounce
content = content.replace(
  /<button\n\s*onClick=\{\(\) => navigate\('\/calendar', \{ state: \{ scrollToAgenda: true \} \}\)\}\n\s*className="text-\[10px\] font-black uppercase tracking-widest text-brand-copper active:underline active:scale-95 transition-all"\n\s*>/g,
  '<motion.button animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} onClick={() => navigate(\'/calendar\', { state: { scrollToAgenda: true } })} className="text-[10px] font-black uppercase tracking-widest text-brand-copper active:underline active:scale-95 transition-all">'
);

// 7. Make the PIX shortcut button breathe
content = content.replace(
  /<button onClick=\{\(\) => setShowPixMenu\(false\)\} className="p-2 bg-gray-100 dark:bg-white\/5 rounded-full active:scale-95 transition-all">/g,
  '<motion.button animate={{ rotate: [0, 90, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} onClick={() => setShowPixMenu(false)} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full active:scale-95 transition-all">'
);

fs.writeFileSync('src/screens/Home.tsx', content);
