import fs from 'fs';

let content = fs.readFileSync('src/screens/Home.tsx', 'utf8');

const variantsStr = `
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };
`;

content = content.replace("  return (\n    <motion.div", variantsStr + "\n  return (\n    <motion.div\n      variants={containerVariants}\n      initial=\"hidden\"\n      animate=\"show\"\n      exit=\"hidden\"");

// Remove root old initial/animate
content = content.replace("      initial={{ opacity: 0, y: 10 }} \n      animate={{ opacity: 1, y: 0 }} \n", "");

// Let's replace elements with motion.div for animation. 

// Header
content = content.replace("<header className=\"flex items-center justify-between mb-8 mt-2 px-2 gap-4\">", "<motion.header variants={itemVariants} className=\"flex items-center justify-between mb-8 mt-2 px-2 gap-4\">");
content = content.replace("</header>", "</motion.header>");

// Bento Grid Dashboard
content = content.replace("<section className=\"grid grid-cols-2 gap-3 mb-8 px-2\">", "<motion.section variants={itemVariants} className=\"grid grid-cols-2 gap-3 mb-8 px-2\">");
content = content.replace("      {/* 3. Meus Favoritos (Horizontal Scroll) */}", "      </motion.section>\n\n      {/* 3. Meus Favoritos (Horizontal Scroll) */}");
// Remove the existing </section> that corresponds to this section, which is just before {/* 3. Meus Favoritos
content = content.replace("      </section>\n\n      {/* 3. Meus Favoritos", "      {/* 3. Meus Favoritos");

// Atividades section
content = content.replace("<section className=\"mb-10 px-2\">\n        <div className=\"flex items-center justify-between mb-4 pl-2\">\n          <h3", "<motion.section variants={itemVariants} className=\"mb-10 px-2\">\n        <div className=\"flex items-center justify-between mb-4 pl-2\">\n          <h3");
content = content.replace("      {/* 4. Estações de Conhecimento */}", "      </motion.section>\n\n      {/* 4. Estações de Conhecimento */}");
// Remove old </section> before 4.
content = content.replace("      </section>\n\n      {/* 4.", "      {/* 4.");


// Estações section
content = content.replace("<section className=\"mb-10 px-2\">\n        <div className=\"flex items-center justify-between mb-4 pl-2\">\n          <h3", "<motion.section variants={itemVariants} className=\"mb-10 px-2\">\n        <div className=\"flex items-center justify-between mb-4 pl-2\">\n          <h3");
content = content.replace("      {/* Contatos Úteis */}", "      </motion.section>\n\n      {/* Contatos Úteis */}");
content = content.replace("      </section>\n\n      {/* Contatos", "      {/* Contatos");

// Contatos Uteis
content = content.replace("{/* Contatos Úteis */}\n        <div className={cn(", "{/* Contatos Úteis */}\n        <motion.div variants={itemVariants} className={cn(");
// In Contatos Uteis, change its closing div (before Social Links)
content = content.replace("        </div>\n\n        {/* Social Links */}", "        </motion.div>\n\n        {/* Social Links */}");


// Social Links
content = content.replace("{/* Social Links */}\n        <div className=\"flex gap-3 sm:gap-4 flex-wrap justify-center\">", "{/* Social Links */}\n        <motion.div variants={itemVariants} className=\"flex gap-3 sm:gap-4 flex-wrap justify-center\">");
content = content.replace("        </div>\n      </main>", "        </motion.div>\n      </main>");


fs.writeFileSync('src/screens/Home.tsx', content);

