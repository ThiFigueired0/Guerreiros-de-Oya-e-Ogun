import fs from 'fs';

let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

// Replace hover effects with touch/active effects for mobile
content = content.replace(/group-hover:-rotate-6/g, 'active:-rotate-6');
content = content.replace(/group-hover:scale-105/g, 'active:scale-105');
content = content.replace(/group-hover:scale-110/g, 'active:scale-110');
content = content.replace(/group-hover:rotate-3/g, 'active:rotate-3');
content = content.replace(/group-hover:translate-x-1/g, 'active:translate-x-1');
content = content.replace(/group-hover:-translate-y-1/g, 'active:-translate-y-1');

// Change hover text/bg classes to active
content = content.replace(/hover:text-/g, 'active:text-');
content = content.replace(/hover:bg-/g, 'active:bg-');
content = content.replace(/hover:border-/g, 'active:border-');
content = content.replace(/hover:shadow-/g, 'active:shadow-');
content = content.replace(/group-hover:bg-/g, 'active:bg-');
content = content.replace(/group-hover:text-/g, 'active:text-');


// Animate sections that are not animated yet
// For example, horizontal lists, we can convert their inner items to motion.div
// "Meus Favoritos" horizontal list items
content = content.replace(/<button \n                    onClick=\{\(\) => navigate\('\/herbs'/g, 
`<motion.button
                    variants={itemVariants}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/herbs'`);
content = content.replace(/<\/button>\n\n                  \{\/\* Ponto \*\/\}/g, `</motion.button>\n\n                  {/* Ponto */}`);

content = content.replace(/<button \n                    onClick=\{\(\) => navigate\('\/points'/g, 
`<motion.button
                    variants={itemVariants}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/points'`);
content = content.replace(/<\/button>\n\n                  \{\/\* Estudo \*\/\}/g, `</motion.button>\n\n                  {/* Estudo */}`);

content = content.replace(/<button \n                    onClick=\{\(\) => navigate\('\/studies'/g, 
`<motion.button
                    variants={itemVariants}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/studies'`);
content = content.replace(/<\/button>\n                <\/div>/g, `</motion.button>\n                </div>`);


// The grid cells
content = content.replace(/<div \n          onClick=\{\(\) => navigate\('\/calendar'\)\}/g, `<motion.div variants={itemVariants} whileTap={{ scale: 0.95 }} onClick={() => navigate('/calendar')}`);
content = content.replace(/<\/div>\n\n        \{\/\* 2\. Último Estudo \*\/\}/g, `</motion.div>\n\n        {/* 2. Último Estudo */}`);

content = content.replace(/<div \n          onClick=\{\(\) => lastBook \? navigate\('\/studies'/g, `<motion.div variants={itemVariants} whileTap={{ scale: 0.95 }} onClick={() => lastBook ? navigate('/studies'`);
content = content.replace(/<\/div>\n\n        \{\/\* 3\. PIX \/ Ajuda \*\/\}/g, `</motion.div>\n\n        {/* 3. PIX / Ajuda */}`);

content = content.replace(/<div \n          onClick=\{\(\) => setShowPixMenu\(true\)\}/g, `<motion.div variants={itemVariants} whileTap={{ scale: 0.95 }} onClick={() => setShowPixMenu(true)}`);
content = content.replace(/<\/div>\n      <\/motion.section>/g, `</motion.div>\n      </motion.section>`);

// Atividades lists
content = content.replace(/<div\n                    key=\{event.id\}/g, `<motion.div\n                    variants={itemVariants}\n                    whileTap={{ scale: 0.98 }}\n                    key={event.id}`);
content = content.replace(/<div\n                  key=\{activity.id\}/g, `<motion.div\n                  variants={itemVariants}\n                  whileTap={{ scale: 0.98 }}\n                  key={activity.id}`);
content = content.replace(/<div className="p-4 sm:p-5 flex items-center gap-4">/g, `<div className="w-full p-4 sm:p-5 flex items-center gap-4">`);
content = content.replace(/<\/div>\n              <\/div>\n            \)\)/g, `</div>\n              </motion.div>\n            ))`);

fs.writeFileSync('src/screens/Home.tsx', content);
