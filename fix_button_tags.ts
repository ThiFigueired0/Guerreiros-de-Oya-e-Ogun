import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

// Fix closing tags for motion.button
content = content.replace(
  /<motion\.button animate=\{\{ opacity: \[0\.7, 1, 0\.7\] \}\} transition=\{\{ duration: 2, repeat: Infinity, ease: "easeInOut" \}\} onClick=\{\(\) => navigate\('\/calendar', \{ state: \{ scrollToAgenda: true \} \}\)\} className="text-\[10px\] font-black uppercase tracking-widest text-brand-copper active:underline active:scale-95 transition-all">\n\s*Ver Detalhes\n\s*<\/button>/g,
  '<motion.button animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} onClick={() => navigate(\'/calendar\', { state: { scrollToAgenda: true } })} className="text-[10px] font-black uppercase tracking-widest text-brand-copper active:underline active:scale-95 transition-all">\n            Ver Detalhes\n          </motion.button>'
);

content = content.replace(
  /<motion\.button animate=\{\{ rotate: \[0, 90, 0\] \}\} transition=\{\{ duration: 5, repeat: Infinity, ease: "easeInOut" \}\} onClick=\{\(\) => setShowPixMenu\(false\)\} className="p-2 bg-gray-100 dark:bg-white\/5 rounded-full active:scale-95 transition-all">\n\s*<X className="w-4 h-4 text-gray-300 dark:text-gray-400" \/>\n\s*<\/button>/g,
  '<motion.button animate={{ rotate: [0, 90, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} onClick={() => setShowPixMenu(false)} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full active:scale-95 transition-all">\n                  <X className="w-4 h-4 text-gray-300 dark:text-gray-400" />\n                </motion.button>'
);

fs.writeFileSync('src/screens/Home.tsx', content);
