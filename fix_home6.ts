import fs from 'fs';

let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

// The bento grid items are motion.divs already.
// For the lists (atividades, stations), let's wrap the map returns in motion.div

content = content.replace(/<div\n                    key=\{event.id\}/g, `<motion.div\n                    variants={itemVariants}\n                    whileTap={{ scale: 0.98 }}\n                    key={event.id}`);
content = content.replace(/className=\{cn\(\n                      "flex items-center gap-4/g, `className={cn(\n                      "flex w-full items-center gap-4`);
// Change closing tag for atividade events
// Wait, regex might be safer to target specific sections.

// Let's use a simpler approach: replace all 'hover:' with 'active:' in the whole Home.tsx 
// This removes sticky hover states on mobile!
content = content.replace(/hover:/g, 'active:');

// Replace group-hover with active to prevent sticky touch states
content = content.replace(/group-active/g, 'active'); // if any
content = content.replace(/group-hover:-rotate-6/g, 'active:-rotate-6');
content = content.replace(/group-hover:scale-105/g, 'active:scale-105');
content = content.replace(/group-hover:scale-110/g, 'active:scale-110');
content = content.replace(/group-hover:translate-x-1/g, 'active:translate-x-1');
content = content.replace(/group-hover:-translate-y-1/g, 'active:-translate-y-1');

// Animate the 'Ver agenda completa' and other buttons
content = content.replace(/<button\n                  onClick=\{\(\) => navigate\('\/calendar'\)\}/g, `<motion.button\n                  variants={itemVariants}\n                  whileTap={{ scale: 0.95 }}\n                  onClick={() => navigate('/calendar')}`);

content = content.replace(/<button\n                  onClick=\{\(\) => navigate\('\/trabalhos'\)\}/g, `<motion.button\n                  variants={itemVariants}\n                  whileTap={{ scale: 0.95 }}\n                  onClick={() => navigate('/trabalhos')}`);

fs.writeFileSync('src/screens/Home.tsx', content);
