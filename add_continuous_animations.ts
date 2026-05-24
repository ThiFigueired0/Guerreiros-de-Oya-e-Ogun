import fs from 'fs';

let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

// 1. Decorative Mesh Gradient Blur for Widget 1
content = content.replace(
  /<div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-brand-copper\/20 rounded-full blur-3xl pointer-events-none" \/>/g,
  '<motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-brand-copper/20 rounded-full blur-3xl pointer-events-none" />'
);

content = content.replace(
  /<div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-48 h-48 bg-blue-500\/20 rounded-full blur-3xl pointer-events-none" \/>/g,
  '<motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-0 left-0 -ml-8 -mb-8 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />'
);

// Calendar Icon background
content = content.replace(
  /<div className="absolute right-0 top-1\/2 -translate-y-1\/2 p-4 opacity-5">/g,
  '<motion.div animate={{ y: ["-50%", "-60%", "-50%"], rotate: [0, 5, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute right-0 top-1/2 p-4 opacity-5">'
);

// 2. Widget 2 (BookOpen icon)
content = content.replace(
  /<div className="absolute -right-6 -bottom-6 opacity-\[0\.04\] active:scale-110 -rotate-12 transition-transform duration-700 pointer-events-none">/g,
  '<motion.div animate={{ y: [0, -8, 0], rotate: [-12, -8, -12] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute -right-6 -bottom-6 opacity-[0.04] transition-transform duration-700 pointer-events-none">'
);

// 3. Widget 3 (Banknote icon)
content = content.replace(
  /<div className="absolute -right-6 -bottom-6 opacity-\[0\.04\] active:scale-110 -rotate-12 transition-transform duration-700 pointer-events-none">\n\s*<div className="relative">/g,
  '<motion.div animate={{ y: [0, -10, 0], rotate: [-12, -6, -12] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="absolute -right-6 -bottom-6 opacity-[0.04] transition-transform duration-700 pointer-events-none">\n            <div className="relative">'
);

// 4. MapPin Address Area background
content = content.replace(
  /<div className="absolute -right-6 -bottom-6 opacity-\[0\.03\] active:scale-110 active:-rotate-6 transition-transform duration-500 pointer-events-none">/g,
  '<motion.div animate={{ y: [0, -12, 0], rotate: [0, -4, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute -right-6 -bottom-6 opacity-[0.03] transition-transform duration-500 pointer-events-none">'
);

// 5. Meshes on Favorite cards
const replaceFavoriteMesh = (color: string, delay: number) => {
  content = content.replace(
    new RegExp(`<div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-${color}-500\\/20 rounded-full blur-3xl active:bg-${color}-500\\/30 transition-colors pointer-events-none" \\/>`, 'g'),
    `<motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.9, 0.6] }} transition={{ duration: ${4 + delay}, repeat: Infinity, ease: "easeInOut", delay: ${delay} }} className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-${color}-500/20 rounded-full blur-3xl pointer-events-none" />`
  );
};
replaceFavoriteMesh('emerald', 0);
replaceFavoriteMesh('rose', 1);
replaceFavoriteMesh('indigo', 0.5);

// 6. User Profile picture / header - subtle pulse on the avatar container's ring/shadow
content = content.replace(
  /<div className="relative flex items-center justify-center p-0\.5 rounded-full bg-gradient-to-br from-brand-copper to-brand-gold">/g,
  '<motion.div animate={{ boxShadow: ["0 0 0 0 rgba(184, 134, 11, 0)", "0 0 0 6px rgba(184, 134, 11, 0.1)", "0 0 0 0 rgba(184, 134, 11, 0)"] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="relative flex items-center justify-center p-0.5 rounded-full bg-gradient-to-br from-brand-copper to-brand-gold">'
);

// The closing tags replacing divs with motion.divs
content = content.replace(/<\/div>\n\s*<\/div>\n\s*<div className="flex items-center justify-between mb-3 relative z-10">/g, '</motion.div>\n          <div className="flex items-center justify-between mb-3 relative z-10">');
content = content.replace(/<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<div className="flex items-center justify-between mb-3 relative z-10">/g, '</div>\n          </motion.div>\n          <div className="flex items-center justify-between mb-3 relative z-10">');
content = content.replace(/<\/div>\n\s*<\/div>\n\s*<div className=\{cn\(\n\s*"w-16 h-16 sm:w-20 sm:h-20/g, '</motion.div>\n\n            <div className={cn(\n              "w-16 h-16 sm:w-20 sm:h-20');

// Fix closing tags for widgets
content = content.replace(
  /<motion\.div animate={{ y: \["-50%", "-60%", "-50%"\], rotate: \[0, 5, 0\](.|\n)*?<\/Calendar>\n\s*<\/div>/,
  (match) => match.replace('</div>', '</motion.div>')
);

fs.writeFileSync('src/screens/Home.tsx', content);
