import fs from 'fs';
let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

// 1. Give subtle breathing to Widget cards - we need to make sure we don't duplicate variants/transition props if they exist.
// since we inject animate/transition here, we must make sure these motion.div variants have them.
content = content.replace(
  /<motion\.div variants=\{itemVariants\} whileTap=\{\{ scale: 0\.95 \}\} onClick=\{\(\) => navigate\('\/calendar'\)\}/g,
  '<motion.div variants={itemVariants} animate={{ y: [0, -3, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} whileTap={{ scale: 0.95 }} onClick={() => navigate("/calendar")}'
);

content = content.replace(
  /<motion\.div variants=\{itemVariants\} whileTap=\{\{ scale: 0\.95 \}\} onClick=\{\(\) => lastBook \? navigate\('\/studies', \{ state: \{ openBookId: lastBook\.id \} \}\) : navigate\('\/studies'\)\}/g,
  '<motion.div variants={itemVariants} animate={{ y: [0, -3, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} whileTap={{ scale: 0.95 }} onClick={() => lastBook ? navigate("/studies", { state: { openBookId: lastBook.id } }) : navigate("/studies")}'
);

content = content.replace(
  /<motion\.div variants=\{itemVariants\} whileTap=\{\{ scale: 0\.95 \}\} onClick=\{\(\) => setShowPixMenu\(true\)\}/g,
  '<motion.div variants={itemVariants} animate={{ y: [0, -3, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }} whileTap={{ scale: 0.95 }} onClick={() => setShowPixMenu(true)}'
);

// 2. Animate the greeting text shimmering
content = content.replace(
  /<h2 className=\{cn\(\n\s*"text-2xl tracking-tight flex items-center gap-2",\n\s*settings\.darkMode \? "text-white" : "text-white"\n\s*\)\} style=\{\{ fontFamily: "'Playfair Display', serif", fontWeight: 700 \}\}>\n\s*\{greeting\}, \{displayName\}!\n\s*<\/h2>/g, 
  `<motion.h2 
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className={cn(
              "text-3xl tracking-tight flex items-center gap-2 bg-gradient-to-r bg-[length:200%_auto] bg-clip-text text-transparent",
              settings.darkMode ? "from-white via-brand-gold to-white text-white drop-shadow-sm" : "from-white via-[#facc15] to-white text-white drop-shadow-md"
            )} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            {greeting}, {displayName}!
          </motion.h2>`
);

// 3. Constant pulse on the avatar / "Mensagem diária" card
content = content.replace(
  /className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-\[16px\] bg-gradient-to-r from-\[\#001a33\] to-\[\#003366\] border border-\[\#D4AF37\] shadow-lg"/g,
  'animate={{ boxShadow: ["0 0 10px rgba(212,175,55,0.2)", "0 0 20px rgba(212,175,55,0.6)", "0 0 10px rgba(212,175,55,0.2)"] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-[16px] bg-gradient-to-r from-[#001a33] to-[#003366] border border-[#D4AF37] shadow-lg"'
);

// 4. Meus Favoritos icons (Heart) subtle pulse
content = content.replace(
  /<Heart className="w-3 h-3 text-brand-copper\/50 fill-brand-copper\/10" \/>/g,
  '<motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}><Heart className="w-3 h-3 text-brand-copper/50 fill-brand-copper/10" /></motion.div>'
);

// 5. Small icons inside the Bento Cards
content = content.replace(
  /<Clock className="w-4 h-4" \/>/g,
  '<motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}><Clock className="w-4 h-4" /></motion.div>'
);
content = content.replace(
  /<Wallet className="w-5 h-5" \/>/g,
  '<motion.div animate={{ y: [0, -2, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}><Wallet className="w-5 h-5" /></motion.div>'
);

fs.writeFileSync('src/screens/Home.tsx', content);
