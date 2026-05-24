import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

// Fix Calendar closing tag
content = content.replace(
  /<motion\.div animate={{ y: \["-50%", "-60%", "-50%"\], rotate: \[0, 5, 0\][^>]*>(\s*)<Calendar[^>]*\/>(\s*)<\/div>/g,
  '<motion.div animate={{ y: ["-50%", "-60%", "-50%"], rotate: [0, 5, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute right-0 top-1/2 p-4 opacity-5">$1<Calendar className={cn("w-32 h-32", settings.darkMode ? "text-blue-100" : "text-white")} />$2</motion.div>'
);

// Fix BookOpen closing tag
content = content.replace(
  /<motion\.div animate={{ y: \[0, -8, 0\], rotate: \[-12, -8, -12\][^>]*>(\s*)<BookOpen[^>]*\/>(\s*)<\/div>/g,
  '<motion.div animate={{ y: [0, -8, 0], rotate: [-12, -8, -12] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute -right-6 -bottom-6 opacity-[0.04] transition-transform duration-700 pointer-events-none">$1<BookOpen className="w-44 h-44 stroke-[1] text-brand-gold" />$2</motion.div>'
);

// Fix Banknote closing tag
content = content.replace(
  /<motion\.div animate={{ y: \[0, -10, 0\], rotate: \[-12, -6, -12\][^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g,
  '<motion.div animate={{ y: [0, -10, 0], rotate: [-12, -6, -12] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="absolute -right-6 -bottom-6 opacity-[0.04] transition-transform duration-700 pointer-events-none">$1</div>\n              </div>\n            </motion.div>'
);

// Fix MapPin closing tag
content = content.replace(
  /<motion\.div animate={{ y: \[0, -12, 0\], rotate: \[0, -4, 0\][^>]*>(\s*)<MapPin[^>]*\/>(\s*)<\/div>/g,
  '<motion.div animate={{ y: [0, -12, 0], rotate: [0, -4, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute -right-6 -bottom-6 opacity-[0.03] transition-transform duration-500 pointer-events-none">$1<MapPin className="w-48 h-48 sm:w-56 sm:h-56 stroke-[1]" />$2</motion.div>'
);

fs.writeFileSync('src/screens/Home.tsx', content);
